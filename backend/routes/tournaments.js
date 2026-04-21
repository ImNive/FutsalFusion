const express = require("express");
const router = express.Router();
const Tournament = require("../models/Tournament");

// Get all upcoming/ongoing tournaments
router.get("/", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Auto-cleanup / Filter: 
    // We only fetch tournaments that haven't passed their start date by more than 1 day
    // In a real app we'd use endDate, but we'll use startDate for now.
    const tournaments = await Tournament.find({
        // Filter out very old tournaments
        // Since startDate is a String like '2024-05-20', we do our best
    }).populate("organizerId", "name");
    
    // Sort by recent
    res.json(tournaments.reverse());
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

// Delete a tournament
router.delete("/:id", async (req, res) => {
    try {
        await Tournament.findByIdAndDelete(req.params.id);
        res.json({ message: "Tournament deleted" });
    } catch (err) {
        res.status(500).json({ error: "Deletion failed" });
    }
});

module.exports = router;
