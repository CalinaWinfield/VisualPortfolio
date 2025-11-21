// backend/server.js
const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/db'); // ensures Mongo connection

const app = express();

// --- Middleware ---
app.use(express.json());                   // parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // (optional) parse form-encoded bodies
app.use(cors());                           // allow all origins in dev; tighten in prod

// --- Connect to MongoDB ---
connectDB();

// Optional: log when the low-level Mongoose connection opens
const connection = mongoose.connection;
connection.once('open', () => {
  console.log('✅ MongoDB Database connection established successfully');
});
connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err?.message || err);
});

// --- API Routes ---
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/uploads', require('./routes/uploadFile'));
app.use('/api/items', require('./routes/itemRoute'));

// --- Health check (optional) ---
app.get('/health', (_req, res) => {
  res.json({ ok: true, status: 'up' });
});

// --- Start server ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));