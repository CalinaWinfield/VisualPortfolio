// backend/config/db.js
const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URL; // ✅ matches .env key

  if (!uri || typeof uri !== 'string') {
    console.error('❌ MONGO_URL is missing or invalid. Check backend/.env.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri); // Mongoose v7+ options generally not required
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};