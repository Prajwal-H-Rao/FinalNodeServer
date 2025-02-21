const jwt = require("jsonwebtoken");

const User = require("../models/userModel.js");

async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) res.status(401).json({ message: "Token not provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (error) {
    console.log("Authentication error");
    res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = authenticate;
