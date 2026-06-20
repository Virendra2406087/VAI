const express = require("express");
const router = express.Router();

const { getDashboard } = require("../Controllers/dashboardController");

router.get("/", getDashboard);

module.exports = router;