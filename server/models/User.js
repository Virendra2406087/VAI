const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    googleId: { type: String, default: null },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    avatar:   { type: String, default: "" },
    streak:   { type: Number, default: 0 },
    xp:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ Pre-save: only hash if password was modified AND not already hashed
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  // Already a bcrypt hash — skip (starts with $2a$ or $2b$)
  if (this.password.startsWith("$2")) return next();

  bcrypt.genSalt(10, (saltErr, salt) => {
    if (saltErr) return next(saltErr);
    bcrypt.hash(this.password, salt, (hashErr, hash) => {
      if (hashErr) return next(hashErr);
      this.password = hash;
      next();
    });
  });
});

// ✅ Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password.startsWith("$2")) return false; // Google user
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);