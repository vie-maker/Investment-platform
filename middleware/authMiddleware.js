// middlewares/authMiddleware.js

const jwt = require("jsonwebtoken");

// Dummy protect middleware for testing
const protect = (req, res, next) => {
  req.user = { id: "123", role: "admin" }; // FAKE user role
  next();
};

// ✅ This is the restrictTo function
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

// ✅ Proper exports
module.exports = {
  protect,
  restrictTo
};
