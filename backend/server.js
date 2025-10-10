const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");

require("dotenv").config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/components', express.static('../frontend/src/app/components'));
app.use('/components/assets', express.static('../frontend/src/app/assets'));

// Connect to Database
connectDB();

// API Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/uploads", require("./routes/uploadFile"));
app.use("/api/items", require("./routes/itemRoute"));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));