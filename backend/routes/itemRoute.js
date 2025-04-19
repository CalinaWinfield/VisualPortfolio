const express = require("express");
const router = express.Router();
const Item = require("../models/Item");

//Item Route
router.post("/create-item", async (req, res) => {
    try {
      const { category, itemTitle, itemDate, itemDescription } = req.body;
  
      const item = new Item({
        category,
        itemTitle,
        itemDate,
        itemDescription
      });
  
      await item.save();
      res.status(201).json({ message: "Item saved successfully" });
    } catch (error) {
      console.error(error); // helpful for debugging
      res.status(400).json({ error: error.message });
    }
  });

module.exports = router;

// GET all items
router.get("/", async (req, res) => {
  try {
      const items = await Item.find();
      res.json(items);
  } catch (error) {
      res.status(500).json({ error: "Failed to fetch items" });
  }
});