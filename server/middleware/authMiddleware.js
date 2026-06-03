const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next(); // ✅ return here — stops execution, prevents double response
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // Only reaches here if no Authorization header at all
  return res.status(401).json({ message: "Not authorized, no token" });
};

module.exports = { protect };