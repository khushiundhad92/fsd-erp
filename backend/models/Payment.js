const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      trim: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    orderNo: {
      type: String,
      default: "",
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerAccount",
    },

    customer: {
      type: String,
      required: true,
      trim: true,
    },

    customerName: {
      type: String,
      default: "",
    },

    customerEmail: {
      type: String,
      default: "",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      default: "Cash on Delivery",
    },

    transactionId: {
      type: String,
      default: "",
    },

    date: {
      type: String,
      required: true,
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      default: "Successful",
      enum: ["Successful", "Pending", "Failed"],
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Payment",
  paymentSchema
);