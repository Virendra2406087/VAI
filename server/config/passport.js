const passport       = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User           = require("../models/User");

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  `${process.env.SERVER_URL || "http://localhost:5000"}/api/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email  = profile.emails[0].value;
    const avatar = profile.photos?.[0]?.value || "";

    let user = await User.findOne({ googleId: profile.id });
    if (!user) user = await User.findOne({ email });

    if (user) {
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            googleId: profile.id,
            ...(avatar && !user.avatar ? { avatar } : {}),
          }
        }
      );
      return done(null, user);
    }

    const bcrypt = require("bcryptjs");
    const salt   = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(`google_${profile.id}_${Date.now()}`, salt);

    user = await User.create({
      name:     profile.displayName,
      email,
      password: hashed,
      avatar,
      googleId: profile.id,
      provider: "google",
    });

    return done(null, user);
  } catch (err) {
    console.error("❌ Google OAuth error:", err);
    return done(err, null);
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