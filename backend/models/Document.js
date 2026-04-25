// backend/models/Document.js
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  userEmail: { type: String, required: true },
  formData:  { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);