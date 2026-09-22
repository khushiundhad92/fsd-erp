const mongoose = require("mongoose");

const {
  customerPanelConnection,
} = require("../config/customerPanelDb");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productId: {
      type: String,
      default: "",
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "Dairy",
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      default: "L",
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  {
    _id: true,
  }
);

const cartSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerAccount",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
    collection: "carts",
  }
);

module.exports = customerPanelConnection.model(
  "Cart",
  cartSchema
);
