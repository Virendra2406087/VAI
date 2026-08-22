const mongoose = require("mongoose");

const sourceSchema = new mongoose.Schema(
  {
    page: {
      type: Number,
      default: null,
    },

    chunkIndex: {
      type: Number,
      default: null,
    },

    text: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const chatMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    sources: {
      type: [sourceSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ChatMessage",
  chatMessageSchema
);