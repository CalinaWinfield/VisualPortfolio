const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const File = require('../models/File'); // File model

// Upload file details to MongoDB
router.post('/upload', async (req, res) => {
    const { userId, fileName, fileUrl } = req.body;

    try {
        const newFile = new File({
            userId,
            fileName,
            fileUrl,
            uploadedAt: new Date()
        });

        await newFile.save();
        res.status(200).json({ message: 'File metadata stored successfully', file: newFile });
    } catch (error) {
        res.status(500).json({ message: 'Error storing file metadata', error });
    }
});

module.exports = router;
