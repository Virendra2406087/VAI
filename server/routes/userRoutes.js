const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET USER PROFILE
router.get("/profile/:email", async (req, res) => {
  try {

    const user = await User.findOne({ email: req.params.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.name,
      email: user.email
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;