// backend/routes/documentRoutes.js
const express = require('express');
const router = express.Router();
const Document = require('../models/Document');

// SAVE a document
router.post('/', async (req, res) => {
  try {
    const { title, userEmail, formData } = req.body;
    if (!title || !userEmail || !formData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const doc = await Document.create({ title, userEmail, formData });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save document' });
  }
});

// GET all documents for a user
router.get('/', async (req, res) => {
  try {
    const { userEmail } = req.query;
    if (!userEmail) return res.status(400).json({ error: 'userEmail required' });
    const docs = await Document.find({ userEmail }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// GET single document by ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// DELETE single document by ID
router.delete('/:id', async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

module.exports = router;