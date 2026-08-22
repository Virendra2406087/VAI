const StudyPlan = require("../models/StudyPlan");

//  CREATE
exports.createPlanner = async (req, res) => {
  try {
    const { goal, duration, dailyTime, topics } = req.body;
    if (!goal || !duration) {
      return res.status(400).json({ success: false, message: "Goal and duration are required" });
    }
    const plan = await StudyPlan.create({ goal, duration, dailyTime, topics });
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  GET ALL
exports.getPlanner = async (req, res) => {
  try {
    const plans = await StudyPlan.find().sort({ createdAt: -1 });
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  UPDATE
exports.updatePlanner = async (req, res) => {
  try {
    const plan = await StudyPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  DELETE
exports.deletePlanner = async (req, res) => {
  try {
    await StudyPlan.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};