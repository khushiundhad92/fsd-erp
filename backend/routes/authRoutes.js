const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Employee = require("../models/Employee");

const router = express.Router();

// ======================================================
// HELPER - CREATE JWT
// ======================================================

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || "dairy_farm_jwt_secret_key_2026",
    {
      expiresIn: "7d",
    }
  );
};

// ======================================================
// ADMIN LOGIN
// POST /api/auth/admin-login
// ======================================================

router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
      role: "admin",
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password",
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "ADMIN LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error during admin login",
      error: error.message,
    });
  }
});

// ======================================================
// EMPLOYEE REGISTER
// POST /api/auth/employee-register
// ======================================================

router.post(
  "/employee-register",
  async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        department,
        password,
        confirmPassword,
      } = req.body;

      // ----------------------------------------------
      // VALIDATION
      // ----------------------------------------------

      if (
        !name ||
        !email ||
        !phone ||
        !department ||
        !password ||
        !confirmPassword
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      const employeeName = name.trim();
      const employeeEmail =
        email.toLowerCase().trim();
      const employeePhone = phone.trim();
      const employeeRole = department.trim();

      if (employeeName.length < 2) {
        return res.status(400).json({
          success: false,
          message:
            "Name must contain at least 2 characters",
        });
      }

      if (
        !/^[0-9]{10}$/.test(
          employeePhone
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Phone number must contain exactly 10 digits",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters",
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Passwords do not match",
        });
      }

      // ----------------------------------------------
      // VALID ROLES
      // ----------------------------------------------

      const allowedRoles = [
        "Farm Manager",
        "Cow Caretaker",
        "Milking Staff",
        "Farm Worker",
        "Driver",
        "Veterinary Assistant",
      ];

      if (
        !allowedRoles.includes(
          employeeRole
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please select a valid employee department",
        });
      }

      // ----------------------------------------------
      // CHECK USER EMAIL
      // ----------------------------------------------

      const existingUser =
        await User.findOne({
          email: employeeEmail,
        });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message:
            "Email is already registered",
        });
      }

      // ----------------------------------------------
      // CHECK EMPLOYEE EMAIL
      // ----------------------------------------------

      const existingEmployee =
        await Employee.findOne({
          email: employeeEmail,
        });

      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message:
            "Employee already exists in Admin Panel",
        });
      }

      // ----------------------------------------------
      // GENERATE EMPLOYEE ID
      // ----------------------------------------------

      const lastEmployee =
        await Employee.findOne()
          .sort({ createdAt: -1 });

      let nextNumber = 1;

      if (
        lastEmployee &&
        lastEmployee.employeeId
      ) {
        const match =
          lastEmployee.employeeId.match(
            /^EMP(\d+)$/
          );

        if (match) {
          nextNumber =
            parseInt(match[1], 10) + 1;
        }
      }

      let employeeId =
        "EMP" +
        String(nextNumber).padStart(
          3,
          "0"
        );

      // ----------------------------------------------
      // MAKE SURE EMPLOYEE ID IS UNIQUE
      // ----------------------------------------------

      while (
        await Employee.exists({
          employeeId,
        })
      ) {
        nextNumber++;

        employeeId =
          "EMP" +
          String(nextNumber).padStart(
            3,
            "0"
          );
      }

      // ----------------------------------------------
      // HASH PASSWORD
      // ----------------------------------------------

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      // ----------------------------------------------
      // CREATE LOGIN USER
      // ----------------------------------------------

      const user = new User({
        name: employeeName,
        email: employeeEmail,
        phone: employeePhone,
        department: employeeRole,
        password: hashedPassword,
        role: "employee",
      });

      await user.save();

      // ----------------------------------------------
      // CREATE ADMIN EMPLOYEE RECORD
      // ----------------------------------------------

      let employee;

      try {
        employee =
          new Employee({
            employeeId,
            name: employeeName,
            email: employeeEmail,
            phone: employeePhone,
            role: employeeRole,
            salary: 0,
            joiningDate: new Date(),
            status: "Active",
          });

        await employee.save();
      } catch (employeeError) {
        await User.findByIdAndDelete(
          user._id
        );

        throw employeeError;
      }

      // ----------------------------------------------
      // SUCCESS
      // ----------------------------------------------

      return res.status(201).json({
        success: true,

        message:
          "Employee registered successfully and added to Admin Panel",

        employee: {
          id: employee._id,
          employeeId:
            employee.employeeId,
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          role: employee.role,
          salary: employee.salary,
          joiningDate:
            employee.joiningDate,
          status: employee.status,
        },

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          department:
            user.department,
          role: user.role,
        },
      });
    } catch (error) {
      console.error(
        "EMPLOYEE REGISTER ERROR:",
        error
      );

      if (
        error.code === 11000
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Employee email or ID already exists",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Server error during employee registration",
        error: error.message,
      });
    }
  }
);

// ======================================================
// EMPLOYEE LOGIN
// POST /api/auth/employee-login
// ======================================================

router.post(
  "/employee-login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Email and password are required",
        });
      }

      const normalizedEmail =
        email.toLowerCase().trim();

      const user =
        await User.findOne({
          email: normalizedEmail,
          role: "employee",
        });

      if (!user) {
        return res.status(401).json({
          success: false,
          message:
            "Employee account not found",
        });
      }

      const passwordMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password",
        });
      }

      const employee =
        await Employee.findOne({
          email: normalizedEmail,
        });

      const token = createToken(user);

      return res.status(200).json({
        success: true,
        message:
          "Employee login successful",

        token,

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          department:
            user.department,
          role: user.role,
        },

        employee: employee
          ? {
              id: employee._id,
              employeeId:
                employee.employeeId,
              name: employee.name,
              email: employee.email,
              phone: employee.phone,
              role: employee.role,
              salary: employee.salary,
              joiningDate:
                employee.joiningDate,
              status:
                employee.status,
            }
          : null,
      });
    } catch (error) {
      console.error(
        "EMPLOYEE LOGIN ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error during employee login",
        error: error.message,
      });
    }
  }
);

// ======================================================
// EMPLOYEE PROFILE
// GET /api/auth/employee-profile/:id
// ======================================================

router.get(
  "/employee-profile/:id",
  async (req, res) => {
    try {
      const employee =
        await Employee.findById(
          req.params.id
        );

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      return res.status(200).json({
        success: true,
        employee,
      });
    } catch (error) {
      console.error(
        "EMPLOYEE PROFILE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while loading employee profile",
        error: error.message,
      });
    }
  }
);

module.exports = router;