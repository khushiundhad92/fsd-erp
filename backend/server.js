
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();


// ======================================================
// DATABASE CONNECTIONS
// ======================================================

// Admin Database
// dairy_farm_erp
const connectDB = require("./config/db");

// Customer Panel Database
// user
const {
  connectCustomerPanelDB,
} = require("./config/customerPanelDb");


const app = express();


// ======================================================
// CORS
// ======================================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,
  })
);


// ======================================================
// BODY PARSER
// ======================================================

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true,
  })
);


// ======================================================
// HOME / SERVER TEST
// ======================================================

app.get("/", (req, res) => {

  res.status(200).json({
    success: true,

    message:
      "Dairy Farm ERP Backend Running",

    adminDatabase:
      "dairy_farm_erp",

    customerPanelDatabase:
      "user",
  });

});


// ======================================================
// ADMIN / EMPLOYEE AUTHENTICATION
// ======================================================

app.use(
  "/api/auth",
  require("./routes/authRoutes")
);


// ======================================================
// COW MANAGEMENT
// ======================================================

app.use(
  "/api/cows",
  require("./routes/cowRoutes")
);


// ======================================================
// MILK PRODUCTION
// ======================================================

app.use(
  "/api/milk-production",
  require("./routes/milkRoutes")
);


// ======================================================
// EMPLOYEE MANAGEMENT
// ======================================================

app.use(
  "/api/employees",
  require("./routes/employeeRoutes")
);


// ======================================================
// CUSTOMER MANAGEMENT
// ======================================================

app.use(
  "/api/customers",
  require("./routes/customerRoutes")
);


// ======================================================
// SALES
// ======================================================

app.use(
  "/api/sales",
  require("./routes/salesRoutes")
);


// ======================================================
// ATTENDANCE
// ======================================================

// app.use(
//   "/api/attendance",
//   require("./routes/attendanceRoutes")
// );


// ======================================================
// LEAVE
// ======================================================

// app.use(
//   "/api/leaves",
//   require("./routes/leaveRoutes")
// );


// ======================================================
// SALARY
// ======================================================

app.use(
  "/api/salaries",
  require("./routes/salaryRoutes")
);


// ======================================================
// WORK
// ======================================================

app.use(
  "/api/work",
  require("./routes/workRoutes")
);


// ======================================================
// ADMIN ORDERS
// ======================================================

app.use(
  "/api/orders",
  require("./routes/orderRoutes")
);


// ======================================================
// ADMIN PAYMENTS
// ======================================================

app.use(
  "/api/payments",
  require("./routes/paymentRoutes")
);


// ======================================================
// ADMIN DASHBOARD
// ======================================================

app.use(
  "/api/dashboard",
  require("./routes/dashboardRoutes")
);


// ======================================================
// EMPLOYEE PROFILE
// ======================================================

app.use(
  "/api/profile",
  require("./routes/profileRoutes")
);


// ======================================================
// CUSTOMER AUTHENTICATION
// ======================================================

app.use(
  "/api/customer-auth",
  require("./routes/customerAuthRoutes")
);


// ======================================================
// CUSTOMER PRODUCTS
// ======================================================

app.use(
  "/api/products",
  require("./routes/productRoutes")
);


// ======================================================
// CUSTOMER PROFILE
// ======================================================

app.use(
  "/api/customer",
  require("./routes/customerProfileRoutes")
);


// ======================================================
// CUSTOMER DASHBOARD
// ======================================================

app.use(
  "/api/customer-panel",
  require("./routes/customerPanelRoutes")
);


// ======================================================
// CUSTOMER SALES
// ======================================================

app.use(
  "/api/customer",
  require("./routes/customerSaleRoutes")
);


// ======================================================
// CUSTOMER PAYMENTS
// ======================================================

app.use(
  "/api/customer",
  require("./routes/customerPaymentRoutes")
);


// ======================================================
// CUSTOMER ORDERS
// ======================================================

app.use(
  "/api/customer",
  require("./routes/customerOrderRoutes")
);


// ======================================================
// CUSTOMER CART
// ======================================================

app.use(
  "/api/customer/cart",
  require("./routes/customerCartRoutes")
);



// ======================================================
// 404 HANDLER
// ======================================================

app.use(
  (req, res) => {

    res.status(404).json({

      success: false,

      message:
        `API route not found: ${req.method} ${req.originalUrl}`,

    });

  }
);


// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use(
  (err, req, res, next) => {

    console.error(
      "SERVER ERROR:",
      err
    );

    res.status(500).json({

      success: false,

      message:
        "Internal server error",

      error:
        err.message,

    });

  }
);


// ======================================================
// PORT
// ======================================================

const PORT =
  process.env.PORT || 5000;


// ======================================================
// START SERVER
// ======================================================

const startServer =
  async () => {

    try {

      // -----------------------------------------------
      // ADMIN DATABASE
      // -----------------------------------------------

      await connectDB();


      // -----------------------------------------------
      // CUSTOMER DATABASE
      // -----------------------------------------------

      await connectCustomerPanelDB();


      // -----------------------------------------------
      // START EXPRESS
      // -----------------------------------------------

      app.listen(
        PORT,
        () => {

          console.log("");

          console.log(
            "=========================================="
          );

          console.log(
            "     DAIRY FARM ERP BACKEND STARTED"
          );

          console.log(
            "=========================================="
          );

          console.log(
            `Server: http://localhost:${PORT}`
          );

          console.log(
            "Admin Database: dairy_farm_erp"
          );

          console.log(
            "Customer Database: user"
          );

          console.log(
            "Employee Register: /api/auth/employee-register"
          );

          console.log(
            "Employee Login: /api/auth/employee-login"
          );

          console.log(
            "Customer Register: /api/customer-auth/register"
          );

          console.log(
            "Customer Login: /api/customer-auth/login"
          );

          console.log(
            "=========================================="
          );

          console.log("");

        }
      );

    } catch (error) {

      console.error("");

      console.error(
        "=========================================="
      );

      console.error(
        "     SERVER START ERROR"
      );

      console.error(
        "=========================================="
      );

      console.error(
        error.message
      );

      console.error("");

      process.exit(1);
    }
  };


// ======================================================
// RUN SERVER
// ======================================================

startServer();
