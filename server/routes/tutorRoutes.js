const express = require("express");
const router = express.Router();

const tutorController = require("../Controllers/tutorController");
const { protect } = require("../middleware/authMiddleware");
const aiRateLimiter = require("../middleware/aiRateLimit");

router.post("/ask", protect, aiRateLimiter, tutorController.askTutor);
router.get("/history", protect, tutorController.getTutorHistory);

module.exports = router;