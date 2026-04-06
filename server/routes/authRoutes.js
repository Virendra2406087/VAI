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
// Step 1: redirect to Google
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Google redirects back here
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:5173/login?error=google_failed", session: false }),
  (req, res) => {
    // ✅ Generate JWT for the Google user
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Redirect to frontend with token + user info in URL
    const name  = encodeURIComponent(req.user.name);
    const email = encodeURIComponent(req.user.email);
    const id    = encodeURIComponent(req.user._id);

    res.redirect(
      `http://localhost:5173/auth/google/success?token=${token}&name=${name}&email=${email}&id=${id}`
    );
  }
);

module.exports = router;