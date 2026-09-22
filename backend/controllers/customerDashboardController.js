const CustomerAccount = require("../models/CustomerAccount");
const Sale = require("../models/Sale");
const Payment = require("../models/Payment");
const Order = require("../models/Order");

const getCustomerDashboard = async (req, res) => {
  try {
    const customer = req.customer;

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    const filter = {
      $or: [
        { customerId: customer._id },
        { customer: customer.email },
        { customer: customer.name },
        { customerEmail: customer.email },
      ],
    };

    const sales = await Sale.find(filter);
    const payments = await Payment.find(filter);
    const orders = await Order.find(filter);

    const totalSalesAmount = sales.reduce(
      (sum, sale) => sum + Number(sale.total || sale.amount || 0),
      0
    );

    const totalPaidAmount = payments
      .filter((p) => p.status === "Successful")
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    return res.status(200).json({
      success: true,

      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        balance: customer.balance || 0,
      },

      statistics: {
        totalSales: sales.length,
        totalOrders: orders.length,
        totalPayments: payments.length,
        totalSalesAmount,
        totalPaidAmount,
        outstandingBalance: Math.max(0, totalSalesAmount - totalPaidAmount),
      },
    });
  } catch (error) {
    console.error("Customer Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load customer dashboard",
      error: error.message,
    });
  }
};

module.exports = {
  getCustomerDashboard,
};