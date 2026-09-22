const Product = require("../models/Product");

const INITIAL_PRODUCTS = [
  {
    name: "Fresh Whole Milk",
    description: "Pure and fresh cow milk delivered daily.",
    category: "Milk",
    price: 60,
    unit: "L",
    stock: 100,
    isActive: true,
  },
  {
    name: "Organic Curd (Dahi)",
    description: "Freshly set creamy curd made from pure milk.",
    category: "Curd",
    price: 50,
    unit: "500g",
    stock: 50,
    isActive: true,
  },
  {
    name: "Fresh Cottage Cheese (Paneer)",
    description: "Soft and fresh paneer rich in protein.",
    category: "Paneer",
    price: 90,
    unit: "250g",
    stock: 40,
    isActive: true,
  },
  {
    name: "Farm Fresh Butter",
    description: "Traditional churned butter with authentic taste.",
    category: "Butter",
    price: 120,
    unit: "500g",
    stock: 30,
    isActive: true,
  },
  {
    name: "Pure Cow Ghee",
    description: "Traditional golden cow ghee with rich aroma.",
    category: "Ghee",
    price: 550,
    unit: "500ml",
    stock: 25,
    isActive: true,
  },
];

// ======================================================
// GET ALL PRODUCTS
// ======================================================

const getProducts = async (req, res) => {
  try {
    let products = await Product.find({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    if (products.length === 0) {
      await Product.insertMany(INITIAL_PRODUCTS);
      products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    }

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get Products Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while loading products",
      error: error.message,
    });
  }
};

// ======================================================
// GET SINGLE PRODUCT
// ======================================================

const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Product Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while loading product",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
};