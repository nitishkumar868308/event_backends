const Event = require("../models/Event");

// Create an Event (POST)
// Create an Event (POST)
const createEvent = async (req, res, io) => {
    const { name, description, category, date } = req.body;
  
    try {
      if (!name || !description || !category || !date) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const user = req.user;
  
      if (!user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
  
      // Create a new event
      const newEvent = new Event({
        name,
        description,
        category,
        date,
        userId: user.id,
      });
  
      const savedEvent = await newEvent.save();
      io.emit("eventCreated", savedEvent);  // Emit the event creation
      res.status(201).json(savedEvent);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  };
  
  const joinEvent = async (req, res, io) => {
    const { id } = req.params;
  
    try {
      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
  
      const user = req.user;
  
      if (!user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
  
      if (event.attendees.includes(user.id)) {
        return res.status(400).json({ message: "User already joined this event" });
      }
  
      event.attendees.push(user.id);  // Add user to the attendees array
      await event.save();
  
      io.emit("eventUpdated", event);  // Emit the updated event with new attendees
      res.status(200).json(event);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  };

const getEvents = async (req, res) => {
  try {
    // Fetch events and sort by createdAt in descending order
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get a single Event by ID (GET)
const getEventById = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update an Event (PUT)
const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { name, description, category, date } = req.body;

  try {
    // Find the event by ID and update it
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { name, description, category, date },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(updatedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete an Event (DELETE)
const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  joinEvent
};
