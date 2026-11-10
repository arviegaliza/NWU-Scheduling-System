
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import routes
const scheduleRoutes = require("./routes/scheduleRoutes");
const researchActivityRoutes = require("./routes/researchActivityRoutes");
const adminProfileRoutes = require("./routes/adminProfileRoutes");

const app = express();

// Allowed frontend websites
const allowedOrigins = [
  "http://localhost:5173",
  "https://nwuschedulingsystem.netlify.app",
  "https://staffnwuschedulingsystem.netlify.app",
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .map((origin) => origin.replace(/\/+$/, ""));

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.log("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Serve uploaded profile pictures
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

// API routes
app.use("/api/schedules", scheduleRoutes);
app.use("/api/research-activities", researchActivityRoutes);
app.use("/api/admin-profile", adminProfileRoutes);

// Root route
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

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      message: "Request blocked by CORS policy.",
    });
  }

  console.error(err);

  res.status(500).json({
    message: "Internal server error.",
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Allowed frontend origins:", allowedOrigins);
});
