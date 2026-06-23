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
    resourceId: {
      type: String,
      default: "",
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

historyEventSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("HistoryEvent", historyEventSchema);