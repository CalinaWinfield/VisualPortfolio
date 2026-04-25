// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const Document = require('../models/Document');
const requireAdmin = require('../middleware/requireAdmin');

// All routes in this file require admin role
router.use(requireAdmin());

// ── Stats ────────────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const totalUsers     = await User.countDocuments();
    const totalItems     = await Item.countDocuments();
    const totalDocuments = await Document.countDocuments();
    const activeUsers    = await User.countDocuments({ status: 'active' });
    res.json({ totalUsers, totalItems, totalDocuments, activeUsers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

// ── Users ─────────────────────────────────────────────────────────────────────
// Get all users (never send password hash or MFA secret)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
      .select('-passwordHash -mfaSecret -refreshTokens')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update a user's role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-passwordHash -mfaSecret -refreshTokens');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.sub) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ── Items ─────────────────────────────────────────────────────────────────────
// Get ALL items across all users
router.get('/items', async (req, res) => {
  try {
    const items = await Item.find({}).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Delete any item
router.delete('/items/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// ── Documents ─────────────────────────────────────────────────────────────────────
// Get all documents across all users
router.get('/documents', async (req, res) => {
  try {
    const docs = await Document.find({}).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.delete('/documents/:id', async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

module.exports = router;