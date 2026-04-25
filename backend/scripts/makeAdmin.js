// backend/scripts/makeAdmin.js

// makeAdmin.js — Development/setup use only
// Usage: node scripts/makeAdmin.js
// Purpose: Elevates an existing registered user to admin role
// Note: Only run this locally. Never run in production.

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function makeAdmin() {
  await mongoose.connect(process.env.MONGO_URL);
  
  const email = 'test@yahoo.com'; // ← change to whatever email you want to be the first admin
  
  const user = await User.findOneAndUpdate(
    { email },
    { role: 'admin' },
    { new: true }
  );

  if (!user) {
    console.log('User not found — register first, then run this script');
  } else {
    console.log(`✅ ${user.email} is now role: ${user.role}`);
  }

  // Prevent accidental runs in production
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ This script cannot be run in production.');
    process.exit(1);
  }

  await mongoose.disconnect();
}

makeAdmin();