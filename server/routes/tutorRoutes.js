const express = require("express");
const router = express.Router();

const tutorController = require("../Controllers/tutorController");

// ✅ SAFE way (no undefined error)
router.post("/ask", tutorController.askTutor);
router.get("/history", tutorController.getTutorHistory);

module.exports = router;