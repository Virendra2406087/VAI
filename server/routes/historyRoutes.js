const express = require("express");
const router  = express.Router();
const { getHistory, addHistoryEvent } = require("../Controllers/HistoryController");

router.get("/",  getHistory);
router.post("/", addHistoryEvent);

module.exports = router;