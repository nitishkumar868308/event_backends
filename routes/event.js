const express = require("express");
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  joinEvent,  // Import the joinEvent function
} = require("../controllers/eventController");
const authMiddleware = require("../middleware/auth");

module.exports = (io) => {
  // POST - Create Event
  router.post("/", authMiddleware, (req, res) => createEvent(req, res, io));

  // GET - Get all Events
  router.get("/", getEvents);

  // GET - Get a single Event by ID
  router.get("/:id", getEventById);

  // PUT - Update an Event
  router.put("/:id", updateEvent);

  // DELETE - Delete an Event
  router.delete("/:id", deleteEvent);

  // POST - Join an Event (New route for joining)
  router.post("/:id/join", authMiddleware, (req, res) => joinEvent(req, res, io));

  return router;
};
