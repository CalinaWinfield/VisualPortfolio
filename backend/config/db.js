const mongoose = require("mongoose");
require("dotenv").config({path: "./.env"}); // Load environment variables

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1); // Stop the server if DB connection fails
    }
};

module.exports = connectDB;
