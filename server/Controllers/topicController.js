const Topic = require("../models/Topic");
const jwt   = require("jsonwebtoken");

const getUserId = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET).id;
  } catch { return null; }
};

//  CREATE — save with userId
exports.createTopic = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ success:false, message:"Topic title is required" });
    const userId = getUserId(req);
    const topic  = await Topic.create({ title, userId });
    res.status(201).json({ success:true, data:topic });
  } catch (error) {
    res.status(500).json({ success:false, message:error.message });
  }
};

//  GET ALL — filter by userId
exports.getTopics = async (req, res) => {
  try {
    const userId = getUserId(req);
    const filter = userId ? { userId } : {};
    const topics = await Topic.find(filter).sort({ createdAt:-1 });
    res.json({ success:true, data:topics });
  } catch (error) {
    res.status(500).json({ success:false, message:error.message });
  }
};

//  GET SINGLE
exports.getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ success:false, message:"Topic not found" });
    res.json({ success:true, data:topic });
  } catch (error) {
    res.status(500).json({ success:false, message:error.message });
  }
};

//  UPDATE
exports.updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, { new:true });
    res.json({ success:true, data:topic });
  } catch (error) {
    res.status(500).json({ success:false, message:error.message });
  }
};

//  DELETE
exports.deleteTopic = async (req, res) => {
  try {
    await Topic.findByIdAndDelete(req.params.id);
    res.json({ success:true, message:"Topic deleted" });
  } catch (error) {
    res.status(500).json({ success:false, message:error.message });
  }
};