// backend/routes/documents.js
router.post("/", async (req, res) => {
  try {
    const { ownerEmail, title, templateJson, itemMap, sections } = req.body;

    if (!ownerEmail || !title) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const doc = new Document({
      ownerEmail,
      title,
      templateJson: templateJson || {},
      itemMap: itemMap || {},
      sections: sections || []
    });

    await doc.save();
    res.status(201).json(doc);

  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ error: "Error creating document" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, templateJson, sections } = req.body;

    // Use req.params.id to get the ID from the URL
    const updatedDoc = await Document.findByIdAndUpdate(
      req.params.id,
      { title, templateJson, sections },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ error: "Document not found in database" });
    }

    res.json(updatedDoc);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Server error during update" });
  }
});