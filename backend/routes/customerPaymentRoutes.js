const express = require("express");
const customerAuth = require("../middleware/customerAuth");

const {
  getCustomerPayments,
  getCustomerPaymentById,
  createCustomerPayment,
} = require("../controllers/customerPaymentController");

const router = express.Router();

router.get("/payments", customerAuth, getCustomerPayments);
router.get("/payments/:id", customerAuth, getCustomerPaymentById);
router.post("/payments", customerAuth, createCustomerPayment);

module.exports = router;