// server/models/HistoryEvent.js
const mongoose = require("mongoose");

const historyEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["quiz", "flashcard", "doc", "tutor"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    detail: {
      type: String,
      default: "",
    },
    // Store the resource _id so we can navigate to it
    resourceId: {
      type: String,
      default: "",
    },
    // For quizzes: score, total
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for fast day-by-day queries
historyEventSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("HistoryEvent", historyEventSchema);