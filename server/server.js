require("dotenv").config();

const express  = require("express");
const http     = require("http");
const cors     = require("cors");
const morgan   = require("morgan");
const mongoose = require("mongoose");

const logger     = require("./utils/logger");
const passport   = require("./config/passport");
const session    = require("express-session");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { initSocket } = require("./socket/socketServer");

// ── Routes ──
const authRoutes          = require("./routes/authRoutes");
const dashboardRoutes     = require("./routes/dashboardRoutes");
const topicRoutes         = require("./routes/topicRoutes");
const documentationRoutes = require("./routes/documentationRoutes");
const flashcardRoutes     = require("./routes/flashcardRoutes");
const quizRoutes          = require("./routes/quizRoutes");
const tutorRoutes         = require("./routes/tutorRoutes");
const plannerRoutes       = require("./routes/plannerRoutes");
const historyRoutes       = require("./routes/historyRoutes"); // ✅ NEW

const app    = express();
const server = http.createServer(app);

// ── MongoDB ──
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ── Middleware ──
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(morgan("dev"));

// ── API Routes ──
app.use("/api/auth",       authRoutes);
app.use("/api/user",       authRoutes);
app.use("/api/dashboard",  dashboardRoutes);
app.use("/api/topics",     topicRoutes);
app.use("/api/docs",       documentationRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/quiz",       quizRoutes);
app.use("/api/tutor",      tutorRoutes);
app.use("/api/planner",    plannerRoutes);
app.use("/api/history",    historyRoutes); // ✅ NEW

// ── Health ──
app.get("/", (req, res) => res.json({ status: "Server running", version: "1.0.0" }));

// ── Socket ──
initSocket(server);

// ── Error Handling ──
app.use(notFound);
app.use(errorHandler);

// ── Start ──
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => logger(`🚀 Server running on port ${PORT}`));