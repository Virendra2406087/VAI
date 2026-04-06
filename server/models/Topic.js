const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    title: {   // ✅ FIXED
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Topic", topicSchema);