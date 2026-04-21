const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// AUTH MIDDLEWARE
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "No token" });
        const decoded = jwt.verify(token, "secret_key");
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// GET CURRENT USER
router.get("/me", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// REGISTER ... (Rest of existing code)
router.post("/register", async (req, res) => {
  try {
    const { name, mobile, email, password, role } = req.body;
    const existingUser = await User.findOne({ mobile });
    if (existingUser) return res.status(400).json({ message: "Mobile number already registered" });
    const user = new User({ name, mobile, email, password, role });
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, "secret_key", { expiresIn: "30d" });
    res.json({ token, user: { id: user._id, name: user.name, role: user.role, mobile: user.mobile } });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;
    const user = await User.findOne({ mobile });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, role: user.role }, "secret_key", { expiresIn: "30d" });
    res.json({ token, user: { id: user._id, name: user.name, role: user.role, mobile: user.mobile } });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
