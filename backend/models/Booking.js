const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  turfId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Turf",
  },
  date: String,
  timeSlot: String,
  playerName: String,
  phone: String,
  amount: Number,
  status: {
    type: String,
    default: "confirmed",
  },
  paymentMethod: {
    type: String,
    default: "cash",
  },
},{
  timestamps:true
});

module.exports = mongoose.model("Booking", bookingSchema);