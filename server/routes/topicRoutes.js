const express = require("express");
const router = express.Router();

const topicController = require("../Controllers/topicController");

// Create topic
router.post("/", topicController.createTopic);

// Get all topics
router.get("/", topicController.getTopics);

// Get single topic
router.get("/:id", topicController.getTopicById);

// Update topic
router.put("/:id", topicController.updateTopic);

// Delete topic
router.delete("/:id", topicController.deleteTopic);

module.exports = router;