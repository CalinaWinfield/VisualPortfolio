const express = require("express");
const router = express.Router();
const Item = require("../models/Item");

//Item Route
router.post("/create-item", async (req, res) => {
    try {
      const { category, itemTitle, itemDate, itemDescription, userEmail } = req.body;
  
      const item = new Item({
        category,
        itemTitle,
        itemDate,
        itemDescription,
        userEmail
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

// DELETE an item by ID
router.delete("/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});