// backend/server.js
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

//log in successfully once connection is made
connectDB();
const connection = mongoose.connection
connection.once('open', () => {
  console.log("MongoDB Database connection established successfully");
})

// API Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/uploads', require('./routes/uploadFile'));
app.use('/api/items', require('./routes/itemRoute'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));