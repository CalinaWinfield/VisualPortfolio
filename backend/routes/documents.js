// routes/documents.js
router.post('/', async (req, res) => {
  const { title, formData } = req.body;

  const doc = new Document({
    title,
    formData
  });

  await doc.save();

  res.json(doc);
});