const jwt = require("jsonwebtoken");
const CustomerPortalUser = require("../models/CustomerPortalUser");
const CustomerAccount = require("../models/CustomerAccount");
const Customer = require("../models/Customer");

const customerAuth = async (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization ||
      req.headers.Authorization ||
      req.headers["authorization"] ||
      req.headers["Authorization"] ||
      req.headers["x-access-token"] ||
      req.headers["x-auth-token"];

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Customer authorization token is required. Please login to continue.",
      });
    }

    let token = "";

    if (typeof authHeader === "string") {
      if (authHeader.startsWith("Bearer ") || authHeader.startsWith("bearer ")) {
        token = authHeader.substring(7).trim();
      } else {
        token = authHeader.trim();
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Customer token is missing. Please login again.",
      });
    }

    let decoded = null;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "dairy_farm_erp_secret_2026"
      );
    } catch (err1) {
      try {
        decoded = jwt.verify(token, "dairy_farm_customer_secret_2026");
      } catch (err2) {
        throw err1;
      }
    }

    if (decoded.role && decoded.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Customer access only",
      });
    }

    let customer = null;

    if (decoded.id) {
      try {
        customer = await CustomerPortalUser.findById(decoded.id).select("-password");
      } catch (e) {}
    }

    if (!customer && decoded.customerId) {
      customer = await CustomerPortalUser.findOne({
        customerId: decoded.customerId,
      }).select("-password");
    }

    if (!customer && decoded.email) {
      customer = await CustomerPortalUser.findOne({
        email: decoded.email.toLowerCase(),
      }).select("-password");
    }

    if (!customer && decoded.id) {
      try {
        customer = await CustomerAccount.findById(decoded.id).select("-password");
      } catch (e) {}
    }

    if (!customer && decoded.email) {
      customer = await CustomerAccount.findOne({
        email: decoded.email.toLowerCase(),
      }).select("-password");
    }

    if (!customer && decoded.id) {
      try {
        customer = await Customer.findById(decoded.id);
      } catch (e) {}
    }
    if (!customer && decoded.customerId) {
      customer = await Customer.findOne({ customerId: decoded.customerId });
    }
    if (!customer && decoded.email) {
      customer = await Customer.findOne({ email: decoded.email.toLowerCase() });
    }

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer account not found",
      });
    }

    if (customer.status === "inactive" || customer.status === "Inactive" || customer.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Customer account is inactive",
      });
    }

    req.customer = customer;
    req.customerUser = customer;

    next();
  } catch (error) {
    console.error("Customer Auth Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired customer token. Please login again.",
      error: error.message,
    });
  }
};

module.exports = customerAuth;