// server/routes/plannerRoutes.js
const express = require("express");
const router  = express.Router();
const { createPlanner, getPlanner, updatePlanner, deletePlanner } = require("../controllers/plannerController");

router.post("/",     createPlanner);
router.get("/",      getPlanner);
router.put("/:id",   updatePlanner);
router.delete("/:id",deletePlanner);

module.exports = router;