// server.js (very top — before dotenv/mongoose/imports)
const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1', '8.8.8.8']); // Cloudflare, Google

// backend/server.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); // load backend/.env

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');                 // ✅ CommonJS import
const connectDB = require('./config/db');             // uses process.env.MONGO_URL
<<<<<<< HEAD
const requireAdmin = require('./middleware/requireAdmin');
=======
>>>>>>> origin/PixelImprove-main

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:4200",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Sanity check (don’t log secrets)
console.log('Has MONGO_URL?', Boolean(process.env.MONGO_URL));

// Connect to MongoDB
connectDB();

// Low-level Mongoose diagnostics (optional)
const connection = mongoose.connection;
connection.once('open', () => {
  console.log('✅ MongoDB Database connection established successfully');
});
connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err?.message || err);
});

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/uploads', require('./routes/uploadFile'));
app.use('/api/items', require('./routes/itemRoute'));
app.use('/api/auth', require('./routes/authRoutes'));
<<<<<<< HEAD
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/documents', require('./routes/documentRoutes')); 
=======
>>>>>>> origin/PixelImprove-main

// Health
app.get('/health', (_req, res) => res.json({ ok: true, status: 'up' }));

// Start
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));