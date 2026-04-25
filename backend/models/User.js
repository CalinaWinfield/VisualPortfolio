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

module.exports = mongoose.model("User", UserSchema);