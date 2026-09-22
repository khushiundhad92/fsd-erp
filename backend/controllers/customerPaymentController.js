const Customer = require("../models/Customer");
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Cart = require("../models/Cart");

// ==========================================
// GET CUSTOMER PAYMENTS
// ==========================================

const getCustomerPayments = async (req, res) => {
  try {
    const customer = req.customer;

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer authentication required",
      });
    }

    const payments = await Payment.find({
      $or: [
        { customerId: customer._id },
        { customer: customer.email },
        { customer: customer.name },
        { customerEmail: customer.email },
      ],
    }).sort({
      paymentDate: -1,
      createdAt: -1,
      date: -1,
    });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Customer Payments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load customer payments",
      error: error.message,
    });
  }
};

// ==========================================
// GET PAYMENT BY ID
// ==========================================

const getCustomerPaymentById = async (req, res) => {
  try {
    const customer = req.customer;

    const payment = await Payment.findOne({
      _id: req.params.id,
      $or: [
        { customerId: customer._id },
        { customer: customer.email },
        { customer: customer.name },
        { customerEmail: customer.email },
      ],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load payment details",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE CUSTOMER PAYMENT
// ==========================================

const createCustomerPayment = async (req, res) => {
  try {
    const customer = req.customer;
    const { orderId, paymentMethod = "Cash on Delivery", notes = "" } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required to process payment",
      });
    }

    // Validate that order exists and belongs to authenticated customer
    const order = await Order.findOne({
      _id: orderId,
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
        message: "Order not found or does not belong to you",
      });
    }

    // SERVER-SIDE AMOUNT VALIDATION: Never trust frontend amounts
    const payableAmount = Number(
      order.totalAmount ?? order.total ?? order.price ?? 0
    );

    if (payableAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payable amount for this order",
      });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const paymentId = `PAY-${Date.now().toString().slice(-6)}-${Math.floor(10 + Math.random() * 90)}`;
    const transactionId = `TXN-${Date.now().toString().slice(-8)}`;

    // Create payment record
    const payment = await Payment.create({
      paymentId,
      orderId: order._id,
      orderNo: order.orderNo,
      customerId: customer._id,
      customer: customer.email || customer.name,
      customerName: customer.name,
      customerEmail: customer.email,
      amount: payableAmount,
      paymentMethod: paymentMethod.trim(),
      transactionId,
      date: todayStr,
      paymentDate: new Date(),
      status: "Successful",
      notes: notes ? notes.trim() : "",
    });

    // Update order status to Processing / Paid
    order.status = "Processing";
    order.paymentStatus = "Paid";
    await order.save();

    // Clear customer's purchased cart items in MongoDB
    await Cart.findOneAndUpdate(
      { customer: customer._id },
      { items: [] }
    );

    return res.status(201).json({
      success: true,
      message: "Payment completed successfully!",
      payment,
      order,
    });
  } catch (error) {
    console.error("Create Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process payment",
      error: error.message,
    });
  }
};

module.exports = {
  getCustomerPayments,
  getCustomerPaymentById,
  createCustomerPayment,
};