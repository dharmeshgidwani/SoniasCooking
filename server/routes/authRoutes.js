const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendOTP = require("../utils/sendOTP");

const router = express.Router();

// Generate random OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Signup Route
const usersAwaitingVerification = new Map(); 
router.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    
    // Store user details temporarily (Not in DB yet)
    usersAwaitingVerification.set(email, {
      name,
      email,
      phone,
      password: hashedPassword,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000, // 5 minutes expiry
    });

    await sendOTP(email, otp);

    res.status(200).json({ message: "OTP sent to email. Please verify." });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});



// Verify OTP Route
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Retrieve user details from temporary storage
    const userData = usersAwaitingVerification.get(email);

    if (!userData || userData.otp !== otp || userData.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Save user in database only after OTP verification
    const newUser = new User({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      verified: true,
    });

    await newUser.save();
    
    usersAwaitingVerification.delete(email);

    res.status(200).json({ message: "Email verified successfully. Account created!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});


// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.verified) return res.status(400).json({ message: "User not found or not verified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
