const mongoose = require("mongoose");

const studyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    goal: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    dailyTime: {
      type: Number,
    },

    topics: [
      {
        day: Number,
        topic: String,
        status: {
          type: String,
          enum: ["pending", "completed"],
          default: "pending",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyPlan", studyPlanSchema);