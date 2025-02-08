const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http"); // Use http server
const socketIo = require("socket.io");

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/event");

dotenv.config();

// Create an HTTP server
const app = express();
const server = http.createServer(app); // Use the server with socket.io
const io = socketIo(server, {
  cors: {
    origin: "https://event-cyan-rho.vercel.app",  // Allow client from localhost:3000
    methods: ["GET", "POST"],         // Allow GET and POST methods
    credentials: true,                // Allow cookies
  },
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://event-cyan-rho.vercel.app",
    credentials: true,
  })
);

// WebSocket connection for real-time updates
io.on("connection", (socket) => {
  console.log("A user connected");

  // Listen for the 'disconnect' event
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Use routes as middleware
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes(io)); // Pass io to event routes

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
