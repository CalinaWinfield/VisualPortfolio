// backend/server.js
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

// API Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/uploads', require('./routes/uploadFile'));
app.use('/api/items', require('./routes/itemRoute'));

// Remove dev-time static serving of Angular sources.
// (They were in your file and are not needed; Angular runs via ng serve in dev.)

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));