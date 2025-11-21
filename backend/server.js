const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect DB
connectDB();

// Set EJS view engine
app.set('view engine', 'ejs');
// Set views directory (adjust if different)
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));



// Static assets (CSS/JS/images)
app.use(express.static(path.join(__dirname, 'public')));

// API Routes (keep your existing)
app.use('/api/items', require('./routes/itemRoute'));

// SSR route: render Items page with data from Mongo
const Item = require('./models/Item');
app.get('/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ _id: -1 });
    res.render('items', { items }); // renders views/items.ejs
  } catch (error) {
    res.status(500).send('Failed to load items');
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));