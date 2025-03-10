const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  otp: String,
  otpExpires: Date,
  verified: { type: Boolean, default: false },
  role: { type: String, default: "user" }, // Admin or User
});

module.exports = mongoose.model("User", userSchema);
