const mongoose = require("mongoose");

const turfSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  phone: { type: String },
  pricePerHour: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Turf", turfSchema);