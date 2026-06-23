const HistoryEvent = require("../models/HistoryEvent");
const jwt          = require("jsonwebtoken");

const getUserId = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const token   = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { type } = req.query;
    const filter = { userId };
    if (type && type !== "all") filter.type = type;

    const events = await HistoryEvent.find(filter)
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    const grouped = {};
    for (const ev of events) {
      const dateKey = new Date(ev.createdAt).toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push({
        id:         ev._id,
        type:       ev.type,
        title:      ev.title,
        detail:     ev.detail,
        resourceId: ev.resourceId,
        meta:       ev.meta,
        time:       ev.createdAt,
      });
    }

    const activeDates = Object.keys(grouped).length;
    const totalItems  = events.length;

    let streak = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const sd    = new Date(today);
    while (true) {
      const key = sd.toDateString();
      if (!grouped[key] || grouped[key].length === 0) break;
      streak++;
      sd.setDate(sd.getDate() - 1);
    }

    res.json({ success: true, data: grouped, activeDates, totalItems, streak });
  } catch (error) {
    console.error("❌ History error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addHistoryEvent = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { type, title, detail, resourceId, meta } = req.body;
    if (!type || !title) return res.status(400).json({ success: false, message: "type and title are required" });

    const event = await HistoryEvent.create({ userId, type, title, detail, resourceId, meta });
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveEvent = async ({ userId, type, title, detail = "", resourceId = "", meta = {} }) => {
  try {
    await HistoryEvent.create({ userId, type, title, detail, resourceId, meta });
  } catch (err) {
    console.error("⚠️ History save failed:", err.message);
  }
};