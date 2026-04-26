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
