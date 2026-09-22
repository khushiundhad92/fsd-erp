const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee");

const employeeAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dairy_farm_jwt_secret_key_2026"
    );

    if (decoded.role !== "employee" && decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Employee access only",
      });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found",
      });
    }

    let employee = null;

    if (user.email) {
      employee = await Employee.findOne({ email: user.email.toLowerCase() });
    }

    req.user = user;
    req.employee = employee;

    next();
  } catch (error) {
    console.error("Employee Auth Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired employee token",
      error: error.message,
    });
  }
};

module.exports = employeeAuth;
