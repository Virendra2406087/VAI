// server/models/Quiz.js
const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    topic:    { type: String, default: "" },
    question: { type: String, required: true },
    options:  [{ type: String }],
    correctAnswer: { type: String, default: "" },
    explanation:   { type: String, default: "" },

    // ✅ Result fields — only set on result entries
    score:    { type: Number, default: null },
    total:    { type: Number, default: null },
    isResult: { type: Boolean, default: false }, // true = result entry, false = question
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);