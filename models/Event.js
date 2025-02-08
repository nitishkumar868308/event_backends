const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
    },
    date: {
      type: Date,
    },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
