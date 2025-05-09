const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    console.log("Headers received:", req.headers); // 🔥 Debug: Log headers to confirm the presence of 'Authorization'

    const token = req.headers.authorization?.split(" ")[1]; // Extract token after "Bearer"
    if (!token) {
      console.log("No token provided in Authorization header"); // 🔥 Debug: Log if no token found
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    console.log("Decoded token:", decoded); // 🔥 Debug: Log decoded token to see the payload

    const user = await User.findById(decoded.userId).select("-password"); // Fetch user by ID
    console.log("User from DB:", user); // 🔥 Debug: Log user fetched from DB

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // Attach user to the request object
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error); // 🔥 Debug: Log any errors
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
