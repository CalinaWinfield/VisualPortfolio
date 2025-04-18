const express = require("express");
const router = express.Router();
const User = require("../models/User");



// REGISTER ROUTE
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Store password as plain text (not secure)
        const user = new User({
            name,
            email,
            password // plain text
        });

        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Server error during registration" });
    }
});

// LOGIN ROUTE
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Find user by email
        const user = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Compare plain-text password
        if (user.password !== password) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Update loggedInAt to current time
        user.loggedInAt = new Date();
        await user.save();
        // Successful login
        res.status(200).json({ message: "Login successful" });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error during login" });
    }
});


module.exports = router;
