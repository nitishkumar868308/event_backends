const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());

// Import the routes
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/event");

// Use the routes as middleware
app.use("/api/auth", authRoutes);  // Correct use of auth routes
app.use("/api/events", eventRoutes);  // Correct use of event routes

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("MongoDB connected successfully");
})
.catch((err) => {
  console.log("MongoDB connection error: ", err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
