const express = require("express");
const router = express.Router();
const Item = require("../models/Item");

//Item Route
router.post("/create-item", async (req, res) => {
    try {
        const { category, title, date, description } = req.body;

        const item = new Item({
            category,
            title,
            date,
            description
        });

        await item.save();
        res.status(201).json({ message: "Item saved successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;