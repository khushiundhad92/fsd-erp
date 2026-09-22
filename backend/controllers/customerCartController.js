const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ======================================================
// GET CUSTOMER CART
// ======================================================

const getCart = async (req, res) => {
  try {
    const customerId = req.customer._id;

    let cart = await Cart.findOne({ customer: customerId });

    if (!cart) {
      cart = await Cart.create({
        customer: customerId,
        items: [],
      });
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const totalQuantity = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return res.status(200).json({
      success: true,
      cart: {
        id: cart._id,
        items: cart.items,
        subtotal,
        totalQuantity,
        grandTotal: subtotal,
      },
    });
  } catch (error) {
    console.error("Get Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load cart",
      error: error.message,
    });
  }
};

// ======================================================
// ADD ITEM TO CART
// ======================================================

const addToCart = async (req, res) => {
  try {
    const customerId = req.customer._id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ customer: customerId });

    if (!cart) {
      cart = new Cart({
        customer: customerId,
        items: [],
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === product._id.toString() || item.productId === product._id.toString()
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += qty;
    } else {
      cart.items.push({
        product: product._id,
        productId: product._id.toString(),
        productName: product.name,
        category: product.category || "Dairy",
        price: product.price,
        unit: product.unit || "L",
        quantity: qty,
      });
    }

    await cart.save();

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const totalQuantity = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return res.status(200).json({
      success: true,
      message: `${product.name} added to cart`,
      cart: {
        id: cart._id,
        items: cart.items,
        subtotal,
        totalQuantity,
        grandTotal: subtotal,
      },
    });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE CART ITEM QUANTITY
// ======================================================

const updateCartQuantity = async (req, res) => {
  try {
    const customerId = req.customer._id;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required",
      });
    }

    let cart = await Cart.findOne({ customer: customerId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId.toString() ||
        item.productId === productId.toString() ||
        item._id.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    const newQty = parseInt(quantity, 10);

    if (newQty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = newQty;
    }

    await cart.save();

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const totalQuantity = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: {
        id: cart._id,
        items: cart.items,
        subtotal,
        totalQuantity,
        grandTotal: subtotal,
      },
    });
  } catch (error) {
    console.error("Update Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update cart",
      error: error.message,
    });
  }
};

// ======================================================
// REMOVE CART ITEM
// ======================================================

const removeCartItem = async (req, res) => {
  try {
    const customerId = req.customer._id;
    const { productId } = req.params;

    let cart = await Cart.findOne({ customer: customerId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) =>
        item.product.toString() !== productId &&
        item.productId !== productId &&
        item._id.toString() !== productId
    );

    await cart.save();

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const totalQuantity = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: {
        id: cart._id,
        items: cart.items,
        subtotal,
        totalQuantity,
        grandTotal: subtotal,
      },
    });
  } catch (error) {
    console.error("Remove Cart Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
      error: error.message,
    });
  }
};

// ======================================================
// CLEAR CART
// ======================================================

const clearCart = async (req, res) => {
  try {
    const customerId = req.customer._id;

    let cart = await Cart.findOne({ customer: customerId });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: "Cart cleared",
      cart: {
        id: cart ? cart._id : null,
        items: [],
        subtotal: 0,
        totalQuantity: 0,
        grandTotal: 0,
      },
    });
  } catch (error) {
    console.error("Clear Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartQuantity,
  removeCartItem,
  clearCart,
};
