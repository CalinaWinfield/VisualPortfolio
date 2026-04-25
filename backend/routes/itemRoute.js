// backend/routes/itemRoute.js
const express = require("express");
const router = express.Router();
const Item = require("../models/Item");

// CREATE
router.post("/create-item", async (req, res) => {
  try {
    const { category, itemTitle, itemDate, itemDescription, userEmail } = req.body;
    if (!itemTitle || !itemDate || !itemDescription || !userEmail) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    const item = new Item({ category, itemTitle, itemDate, itemDescription, userEmail });
    await item.save();
    res.status(201).json(item); // return the created item
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// READ (list) with optional filters: ?userEmail=&q=
router.get("/", async (req, res) => {
  try {
    const { userEmail, q } = req.query;
    const filter = {};
    if (userEmail) filter.userEmail = userEmail;
    if (q) filter.itemTitle = { $regex: q, $options: "i" };

    const items = await Item.find(filter).sort({ _id: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// READ (single)
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const updated = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Item not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: "Failed to update item" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

module.exports = router;
