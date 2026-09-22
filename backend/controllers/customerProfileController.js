const CustomerAccount = require("../models/CustomerAccount");

// ==========================================
// GET PROFILE
// ==========================================

const getCustomerProfile = async (req, res) => {
  try {
    const customer = req.customer;

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      customer: {
        id: customer._id,
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address || "",
        city: customer.city || "",
        state: customer.state || "",
        pincode: customer.pincode || "",
      },
    });
  } catch (error) {
    console.error("Get Customer Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load customer profile",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE PROFILE
// ==========================================

const updateCustomerProfile = async (req, res) => {
  try {
    const customer = await CustomerAccount.findById(req.customer._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    const {
      name,
      phone,
      address,
      city,
      state,
      pincode,
    } = req.body;

    if (name !== undefined) customer.name = name.trim();
    if (phone !== undefined) customer.phone = phone.trim();
    if (address !== undefined) customer.address = address.trim();
    if (city !== undefined) customer.city = city.trim();
    if (state !== undefined) customer.state = state.trim();
    if (pincode !== undefined) customer.pincode = pincode.trim();

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Customer profile updated successfully",
      customer: {
        id: customer._id,
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        pincode: customer.pincode,
      },
    });
  } catch (error) {
    console.error("Update Customer Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update customer profile",
      error: error.message,
    });
  }
};

module.exports = {
  getCustomerProfile,
  updateCustomerProfile,
};