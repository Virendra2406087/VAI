const express = require("express");
const router  = express.Router();
const { createPlanner, getPlanner, updatePlanner, deletePlanner } = require("../Controllers/plannerController");
const { protect } = require("../middleware/authMiddleware");
const aiRateLimiter = require("../middleware/aiRateLimit");

router.post("/",     protect, aiRateLimiter, createPlanner);
router.get("/",      getPlanner);
router.put("/:id",   updatePlanner);
router.delete("/:id",deletePlanner);

module.exports = router;