// backend/routes/documentRoutes.js
const express = require('express');
const router = express.Router();
const Document = require('../models/Document');

// SAVE a document
router.post('/', async (req, res) => {
  try {
    const { title, status, docType } = req.body;
    const userEmail = req.body.userEmail ?? req.body.ownerEmail;
    const formData = req.body.formData ?? req.body.templateJson;
    const injectedItems = req.body.injectedItems ?? req.body.sections ?? [];
    if (!title || !userEmail || !formData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const doc = await Document.create({
      title,
      userEmail,
      formData,
      injectedItems,
      status: status || 'in-progress',
      docType: docType || formData?.docType || 'resume'
    });
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

router.put("/:id", async (req, res) => {
  try {
    const title = req.body.title;
    const status = req.body.status;
    const userEmail = req.body.userEmail ?? req.body.ownerEmail;
    const formData = req.body.formData ?? req.body.templateJson;
    const injectedItems = req.body.injectedItems ?? req.body.sections;
    const docType = req.body.docType ?? req.body.formData?.docType;

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (status !== undefined) updateFields.status = status;
    if (docType !== undefined) updateFields.docType = docType;
    if (userEmail !== undefined) updateFields.userEmail = userEmail;
    if (formData !== undefined) updateFields.formData = formData;
    if (injectedItems !== undefined) updateFields.injectedItems = injectedItems;

    const updatedDoc = await Document.findByIdAndUpdate(
      req.params.id, 
      updateFields,
      { new: true } // This returns the updated version to Angular
    );

    if (!updatedDoc) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json(updatedDoc);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Server error during update" });
  }
});

module.exports = router;