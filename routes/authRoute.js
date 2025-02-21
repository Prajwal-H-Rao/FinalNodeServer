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
      res.status(400).json({ message: "The user already exits" });
    const newUser = new User({ name: name, email: email, password: password });
    await newUser.save();
    res.status(200).json({ message: "Registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async function (req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) res.status(404).json({ message: "The user is not registered" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: "Login successful",
      token,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
