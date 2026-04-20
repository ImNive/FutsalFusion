const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Turf = require("./models/Turf");
const Booking = require("./models/Booking");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const tournamentRoutes = require("./routes/tournaments");
const predictRoutes = require("./routes/predict");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Database
mongoose.connect("mongodb://127.0.0.1:27017/futsalFusionDB")
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// API Router
const apiRouter = express.Router();
app.use("/api", apiRouter);

// Routes
apiRouter.use("/auth", authRoutes);
apiRouter.use("/posts", postRoutes);
apiRouter.use("/tournaments", tournamentRoutes);
apiRouter.use("/predict", predictRoutes);

const ALL_SLOTS = [
  "6AM-7AM", "7AM-8AM", "8AM-9AM", "9AM-10AM", "10AM-11AM", "11AM-12PM",
  "12PM-1PM", "1PM-2PM", "2PM-3PM", "3PM-4PM", "4PM-5PM", "5PM-6PM",
  "6PM-7PM", "7PM-8PM", "8PM-9PM", "9PM-10PM"
];

const getSlotHour = (slot) => {
  if (!slot) return 0;
  const time = slot.split("-")[0];
  let hour = parseInt(time);
  if (time.includes("PM") && hour !== 12) hour += 12;
  if (time.includes("AM") && hour === 12) hour = 0;
  return hour;
};

// GET SMART SLOTS STATUS
apiRouter.get("/slots-status", async (req, res) => {
  try {
    const { turfId, date } = req.query;
    if (!turfId || !date) return res.status(400).json({ error: "turfId and date required" });

    // Check if turf is active
    const turf = await Turf.findById(turfId);
    if (!turf || !turf.isActive) return res.status(400).json({ error: "This turf is currently closed" });

    const bookings = await Booking.find({ turfId, date, status: { $in: ["confirmed", "paid", "pending"] } });
    const bookedSlotNames = bookings.map(b => b.timeSlot);

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentHour = now.getHours();

    const slots = ALL_SLOTS.map(slot => {
      const slotStartHour = getSlotHour(slot);
      let status = "available";
      if (date < today) status = "closed";
      else if (date === today && slotStartHour <= currentHour + 2) status = "closed";
      if (status === "available" && bookedSlotNames.includes(slot)) status = "booked";
      return { slot, status };
    });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate slots" });
  }
});

// CANCEL BOOKING
apiRouter.post("/cancel-booking", async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ error: "Booking missing on server" });

        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const currentHour = now.getHours();
        const slotStartHour = getSlotHour(booking.timeSlot);

        if (booking.date < today) return res.status(400).json({ error: "Cannot cancel past matches" });
        if (booking.date === today && (slotStartHour - currentHour) < 2) {
            return res.status(400).json({ error: "Cancellation period expired (2h limit)" });
        }

        booking.status = "cancelled";
        await booking.save();
        res.json({ message: "Cancelled successfully" });
    } catch (error) {
        res.status(500).json({ error: "Cancellation failed" });
    }
});

// TURF MANAGEMENT
apiRouter.get("/turfs", async (req, res) => {
  try {
    const { activeOnly } = req.query;
    let query = {};
    if (activeOnly === "true") query.isActive = true;
    const turfs = await Turf.find(query);
    res.json(turfs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch turfs" });
  }
});

apiRouter.post("/add-turf", async (req, res) => {
  try {
    const turf = new Turf(req.body);
    await turf.save();
    res.json({ message: "Turf added", turf });
  } catch (error) {
    res.status(500).json({ error: "Failed to add turf" });
  }
});

apiRouter.put("/update-turf/:id", async (req, res) => {
  try {
    const turf = await Turf.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Turf updated", turf });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

apiRouter.delete("/delete-turf/:id", async (req, res) => {
  try {
    await Turf.findByIdAndDelete(req.params.id);
    res.json({ message: "Turf deleted" });
  } catch (error) {
    res.status(500).json({ error: "Deletion failed" });
  }
});

// BOOKING MANAGEMENT
apiRouter.post("/add-booking", async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const status = paymentMethod === "online" ? "paid" : "pending";
    const booking = new Booking({ ...req.body, status });
    await booking.save();
    res.json({ message: "Booking confirmed", booking });
  } catch (error) {
    res.status(500).json({ error: "Booking failed" });
  }
});

apiRouter.get("/bookings", async (req, res) => {
  try {
    const { turfId, date } = req.query;
    let query = {};
    if (turfId) query.turfId = turfId;
    if (date) query.date = date;
    const bookings = await Booking.find(query).populate('turfId').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

apiRouter.get("/dashboard", async (req, res) => {
  try {
    const totalTurfs = await Turf.countDocuments();
    const totalBookings = await Booking.countDocuments({ status: { $in: ["paid", "pending", "confirmed"] } });
    const todayDate = new Date().toISOString().split('T')[0];
    const todayBookings = await Booking.find({ status: { $in: ["paid", "pending", "confirmed"] }, date: todayDate });
    const totalRevenue = todayBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    res.json({
      totalTurfs,
      totalBookings,
      todayBookings: todayBookings.length,
      totalRevenue,
      totalSlots: totalTurfs * ALL_SLOTS.length,
      bookedSlots: todayBookings.length,
      availableSlots: (totalTurfs * ALL_SLOTS.length) - todayBookings.length
    });
  } catch (error) {
    res.status(500).json({ error: "Dashboard failure" });
  }
});

apiRouter.put("/booking-status/:id", async (req, res) => {
  try {
    await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ message: "Status updated" });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});