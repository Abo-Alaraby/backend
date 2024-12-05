const jwt = require("jsonwebtoken");

require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

// Middleware to authenticate and authorize
async function authenticate(req, res, next) {
    const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];
  
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }
  
    try {
      const decoded = jwt.verify(token, SECRET_KEY);

      req.user = decoded;

      next();
    } catch (error) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }
  }
  
  function authorizeAdmin(req, res, next) {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
  }

  module.exports = { authenticate, authorizeAdmin };