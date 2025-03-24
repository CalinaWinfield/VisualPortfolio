const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");

require("dotenv").config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static("public")); // Serve static files

// Connect to Database
connectDB();

// API Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/uploads", require("./routes/uploadFile"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
