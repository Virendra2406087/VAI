const User = require("../models/User");

const MAX_REQUESTS = 20;
// 15 minutes
const WINDOW_MS = 15 * 60 * 1000; 

const aiRateLimiter = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const now = Date.now();
    const windowStart = new Date(user.aiWindowStart).getTime();

    if (now - windowStart > WINDOW_MS) {
      user.aiRequestCount = 1;
      user.aiWindowStart = now;
      await user.save();
      return next();
    }

    if (user.aiRequestCount >= MAX_REQUESTS) {
      const retryAfterMs = WINDOW_MS - (now - windowStart);
      const retryAfterMin = Math.ceil(retryAfterMs / 60000);
      return res.status(429).json({
        message: `You've reached your AI usage limit. Try again in ${retryAfterMin} minute(s).`,
        retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
      });
    }

    user.aiRequestCount += 1;
    await user.save();
    next();
  } catch (err) {
    console.error("AI rate limiter error:", err);
    next(err);
  }
};

module.exports = aiRateLimiter;