// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const RefreshTokenSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },

    // Secure hashed password
    passwordHash: { type: String, required: true, select: false },

    // Legacy plain-text password (for auto-migration only)
    password: { type: String, select: false },

    // MFA support
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String },
    mfaEnrollmentRequired: {
      type: Boolean,
      default: true},

    // Refresh token rotation
    refreshTokens: [RefreshTokenSchema],

    // Role + status
    role: { type: String, default: "user" },
    status: { type: String, default: "active" },

    

    loggedInAt: Date
  },
  { timestamps: true }
);

/* Password helpers */
UserSchema.statics.hashPassword = function (password) {
  return bcrypt.hash(password, 12);
};

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Cascade delete items, documents, and files belonging to the user
const cascadeDeleteUserData = async (userId, userEmail) => {
  if (!userEmail && !userId) return;
  try {
    const Item = mongoose.models.Item || require('./Item');
    const Document = mongoose.models.Document || require('./Document');
    let File;
    try {
      File = mongoose.models.File || require('./File');
    } catch (e) {}

    const deletePromises = [];

    if (userEmail) {
      const escapedEmail = userEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const emailRegex = new RegExp(`^${escapedEmail}$`, 'i');

      deletePromises.push(Item.deleteMany({ userEmail: { $regex: emailRegex } }));
      deletePromises.push(Document.deleteMany({
        $or: [
          { userEmail: { $regex: emailRegex } },
          { ownerEmail: { $regex: emailRegex } }
        ]
      }));
      if (File) {
        deletePromises.push(File.deleteMany({
          $or: [
            { userId: userId ? userId.toString() : '' },
            { userId: { $regex: emailRegex } }
          ]
        }));
      }
    } else if (userId && File) {
      deletePromises.push(File.deleteMany({ userId: userId.toString() }));
    }

    await Promise.all(deletePromises);
  } catch (err) {
    console.error('Error cascade deleting user data in User middleware:', err);
  }
};

UserSchema.pre('findOneAndDelete', async function () {
  try {
    const docToDel = await this.model.findOne(this.getQuery());
    if (docToDel) {
      await cascadeDeleteUserData(docToDel._id, docToDel.email);
    }
  } catch (err) {
    console.error('Error in User pre findOneAndDelete hook:', err);
  }
});

UserSchema.pre('deleteOne', { document: true, query: false }, async function () {
  try {
    await cascadeDeleteUserData(this._id, this.email);
  } catch (err) {
    console.error('Error in User pre deleteOne (document) hook:', err);
  }
});

UserSchema.pre('deleteOne', { document: false, query: true }, async function () {
  try {
    const docToDel = await this.model.findOne(this.getQuery());
    if (docToDel) {
      await cascadeDeleteUserData(docToDel._id, docToDel.email);
    }
  } catch (err) {
    console.error('Error in User pre deleteOne (query) hook:', err);
  }
});

module.exports = mongoose.model("User", UserSchema);