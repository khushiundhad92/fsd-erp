const express = require("express");
const customerAuth = require("../middleware/customerAuth");

const {
  getCustomerOrders,
  getCustomerOrderById,
  checkoutCustomerOrder,
} = require("../controllers/customerOrderController");

const router = express.Router();

router.get("/orders", customerAuth, getCustomerOrders);
router.get("/orders/:id", customerAuth, getCustomerOrderById);
router.post("/orders/checkout", customerAuth, checkoutCustomerOrder);
router.post("/orders", customerAuth, checkoutCustomerOrder);

module.exports = router;