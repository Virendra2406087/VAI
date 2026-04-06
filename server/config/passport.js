// server/config/passport.js
const passport      = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User          = require("../models/User");
const jwt           = require("jsonwebtoken");

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  "http://localhost:5000/api/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      return done(null, user);
    }

    // Create new user from Google profile
    user = await User.create({
      name:     profile.displayName,
      email:    profile.emails[0].value,
      password: `google_${profile.id}_${Date.now()}`, // dummy password
      avatar:   profile.photos[0]?.value || "",
    });

    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;