const express = require("express");
const router = express.Router();
const Tournament = require("../models/Tournament");

// Get all tournaments
router.get("/", async (req, res) => {
  try {
    const tournaments = await Tournament.find().populate("organizerId", "name");
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a tournament
router.post("/", async (req, res) => {
  try {
    const tournament = new Tournament(req.body);
    await tournament.save();
    res.json(tournament);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
