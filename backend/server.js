const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");

require("dotenv").config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Serve static files from the frontend directory
app.use(express.static('../frontend/src'));

// Connect to Database
connectDB();

// API Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/upload", require("./routes/uploadFile"));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
