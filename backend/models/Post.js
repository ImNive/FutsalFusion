const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["player_availability", "player_requirement"],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  date: String,
  time: String,
  location: String,
  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Post", postSchema);
