
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

// IMPORT ROUTES
const scheduleRoutes = require("./routes/scheduleRoutes");
const researchActivityRoutes = require("./routes/researchActivityRoutes");
const adminProfileRoutes = require("./routes/adminProfileRoutes");

// IMPORT AUTOMATIC SCHEDULE STATUS SERVICE
const {
  startScheduleStatusScheduler,
} = require("../services/scheduleStatusService");
// INITIALIZE EXPRESS AND HTTP SERVER
const app = express();
const server = http.createServer(app);

// ALLOWED FRONTEND ORIGINS
const allowedOrigins = [
  "http://localhost:5173",
  "https://nwu-scheduling-system.vercel.app",
  "https://frontend-571p-tau.vercel.app",
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .map((origin) => origin.trim().replace(/\/+$/, ""));

// CORS ORIGIN VALIDATION
const corsOrigin = (origin, callback) => {
  if (!origin) {
    return callback(null, true);
  }

  const normalizedOrigin = origin.replace(/\/+$/, "");

  if (allowedOrigins.includes(normalizedOrigin)) {
    return callback(null, true);
  }

  console.log("Blocked origin:", origin);
  return callback(new Error("Not allowed by CORS"));
};

// INITIALIZE SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});
// MAKE SOCKET.IO AVAILABLE TO CONTROLLERS
app.set("io", io);

// SOCKET.IO CONNECTION EVENTS
io.on("connection", (socket) => {
  console.log("Socket.IO client connected:", socket.id);

  socket.on("disconnect", (reason) => {
    console.log(
      "Socket.IO client disconnected:",
      socket.id,
      reason
    );
  });
});

// EXPRESS CORS
app.use(
  cors({
    origin: corsOrigin,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// MIDDLEWARE
app.use(express.json());

// STATIC UPLOADS
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// API ROUTES
app.use("/api/schedules", scheduleRoutes);
app.use("/api/research-activities", researchActivityRoutes);
app.use("/api/admin-profile", adminProfileRoutes);

// API HEALTH CHECK
app.get("/", (req, res) => {
  res.json({
    message: "Research Scheduling API is running.",
    socketIO: "Enabled",
  });
});

// API NOT FOUND
app.use("/api", (req, res) => {
  res.status(404).json({
    message: "API endpoint not found.",
  });
});

// ERROR HANDLER
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

// START SERVER
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Socket.IO is enabled.");
  console.log("Allowed frontend origins:", allowedOrigins);

  // START AUTOMATIC SCHEDULE STATUS UPDATES
  startScheduleStatusScheduler(io);
});
