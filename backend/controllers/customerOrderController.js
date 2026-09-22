const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Cart = require("../models/Cart");

// ==========================================
// GET CUSTOMER ORDERS
// ==========================================

const getCustomerOrders = async (req, res) => {
  try {
    const customer = req.customer;

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer authentication required",
      });
    }

    const orders = await Order.find({
      $or: [
        { customerId: customer._id },
        { customer: customer.email },
        { customer: customer.name },
        { customerEmail: customer.email },
      ],
    }).sort({
      createdAt: -1,
      orderDate: -1,
      date: -1,
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Customer Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load customer orders",
      error: error.message,
    });
  }
};

// ==========================================
// GET ORDER BY ID
// ==========================================

const getCustomerOrderById = async (req, res) => {
  try {
    const customer = req.customer;

    const order = await Order.findOne({
      _id: req.params.id,
      $or: [
        { customerId: customer._id },
        { customer: customer.email },
        { customer: customer.name },
        { customerEmail: customer.email },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load order details",
      error: error.message,
    });
  }
};

// ==========================================
// CHECKOUT / CREATE ORDER FROM CART
// ==========================================

const checkoutCustomerOrder = async (req, res) => {
  try {
    const customer = req.customer;

    const cart = await Cart.findOne({ customer: customer._id });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Please add products to cart before checkout.",
      });
    }

    // Calculate payable total amount server-side
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );

    const totalQuantity = cart.items.reduce(
      (sum, item) => sum + Number(item.quantity || 1),
      0
    );

    const orderNo = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(10 + Math.random() * 90)}`;
    const todayStr = new Date().toISOString().split("T")[0];

    const order = await Order.create({
      orderNo,
      customerId: customer._id,
      customer: customer.email || customer.name,
      customerName: customer.name,
      customerEmail: customer.email,
      items: cart.items.map((item) => ({
        product: item.product,
        productId: item.productId || (item.product ? item.product.toString() : ""),
        productName: item.productName,
        category: item.category || "Dairy",
        price: item.price,
        unit: item.unit || "L",
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      })),
      quantity: totalQuantity,
      price: totalAmount,
      total: totalAmount,
      totalAmount,
      date: todayStr,
      orderDate: new Date(),
      status: "Pending",
      paymentStatus: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Checkout order created. Please complete payment.",
      order,
    });
  } catch (error) {
    console.error("Checkout Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create checkout order",
      error: error.message,
    });
  }
};

module.exports = {
  getCustomerOrders,
  getCustomerOrderById,
  checkoutCustomerOrder,
};