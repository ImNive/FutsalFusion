const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema({
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  startDate: String,
  endDate: String,
  location: String,
  entryFee: Number,
  prizePool: String,
  maxTeams: Number,
  registeredTeams: [{
    name: String,
    captainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  }],
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed"],
    default: "upcoming"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Tournament", tournamentSchema);
