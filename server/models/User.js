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
    aiRequestCount: { type: Number, default: 0 },
    aiWindowStart: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ✅ Pre-save: only hash if password was modified AND not already hashed
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  // Already a bcrypt hash — skip (starts with $2a$ or $2b$)
  if (this.password.startsWith("$2")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ✅ Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password.startsWith("$2")) return false; // Google user
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);