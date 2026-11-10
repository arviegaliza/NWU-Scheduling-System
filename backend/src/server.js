
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import routes (each only once)
const scheduleRoutes = require("./routes/scheduleRoutes");
const researchActivityRoutes = require("./routes/researchActivityRoutes");
const adminProfileRoutes = require("./routes/adminProfileRoutes");

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(express.json());

// Serve uploaded profile pictures
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

// API Routes
app.use("/api/schedules", scheduleRoutes);
app.use("/api/research-activities", researchActivityRoutes);
app.use("/api/admin-profile", adminProfileRoutes);

// Root Route
app.get("/", (req, res) => {
  res.json({
    message: "Research Scheduling API is running.",
  });
});

// Handle unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    message: "API endpoint not found.",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
