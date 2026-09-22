const mongoose = require("mongoose");

const workSchema = new mongoose.Schema(
  {
    employeeRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    employeeId: {
      type: String,
      default: "",
      trim: true,
    },

    employee: {
      type: String,
      default: "",
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Work", workSchema);