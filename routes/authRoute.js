const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const router = express.Router();

const User = require("../models/userModel.js");

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/register", async function (req, res) {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ name: name, email: email });
    if (existingUser)
      return res.status(400).json({ message: "The user already exits" });
    const newUser = new User({ name, email, password });
    await newUser.save();
    return res.status(200).json({ message: "Registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async function (req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "The user is not registered" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.status(200).json({
      message: "Login successful",
      token,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
