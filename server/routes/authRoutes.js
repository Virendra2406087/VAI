// server/routes/authRoutes.js
const express  = require("express");
const router   = express.Router();
const passport = require("passport");
const jwt      = require("jsonwebtoken");

const {
  registerUser,
  loginUser,
  getProfile,
  getProfileByEmail,
  changePassword,
} = require("../controllers/authController");

// ── Standard auth ──
router.post("/register",        registerUser);
router.post("/login",           loginUser);
router.get("/profile",          getProfile);
router.get("/profile/:email",   getProfileByEmail);
router.put("/change-password",  changePassword);

// ── Google OAuth ──
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// ── Google Callback — manual authenticate for better error handling ──
router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user, info) => {
    // ✅ Log everything so we can see what's failing
    if (err) {
      console.error("❌ Google OAuth error:", err);
      return res.redirect("http://localhost:5173/login?error=google_failed");
    }

    if (!user) {
      console.error("❌ Google OAuth no user — info:", info);
      return res.redirect("http://localhost:5173/login?error=google_failed");
    }

    console.log("✅ Google OAuth success — user:", user.email);

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const name  = encodeURIComponent(user.name  || "");
    const email = encodeURIComponent(user.email || "");
    const id    = encodeURIComponent(user._id.toString());

    return res.redirect(
      `http://localhost:5173/auth/google/success?token=${token}&name=${name}&email=${email}&id=${id}`
    );
  })(req, res, next);
});

module.exports = router;