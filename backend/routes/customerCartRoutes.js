const express = require("express");
const customerAuth = require("../middleware/customerAuth");

const {
  getCart,
  addToCart,
  updateCartQuantity,
  removeCartItem,
  clearCart,
} = require("../controllers/customerCartController");

const router = express.Router();

router.get("/", customerAuth, getCart);
router.post("/add", customerAuth, addToCart);
router.put("/item", customerAuth, updateCartQuantity);
router.delete("/item/:productId", customerAuth, removeCartItem);
router.delete("/clear", customerAuth, clearCart);

module.exports = router;
