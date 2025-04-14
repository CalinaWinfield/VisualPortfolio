const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
    category: { type: String },
    itemTitle: { type: String, required: true },
    itemDate: { type: String, required: true },
    itemDescription: { type: String, required: true }
});

module.exports = mongoose.model("Item", ItemSchema);
