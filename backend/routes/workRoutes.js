const express = require("express");
const Work = require("../models/Work");
const Employee = require("../models/Employee");
const employeeAuth = require("../middleware/employeeAuth");

const router = express.Router();

// ========================================
// GET ALL WORK RECORDS (ADMIN)
// ========================================

router.get("/", async (req, res) => {
  try {
    const works = await Work.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: works,
    });
  } catch (error) {
    console.error("Get Work Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch work records",
      error: error.message,
    });
  }
});

// ========================================
// GET MY WORK (AUTHENTICATED EMPLOYEE ONLY)
// ========================================

router.get("/my-work", employeeAuth, async (req, res) => {
  try {
    const user = req.user;
    const employee = req.employee;

    const filters = [];

    if (employee && employee._id) {
      filters.push({ employeeRef: employee._id });
    }

    if (employee && employee.employeeId) {
      filters.push({ employeeId: employee.employeeId });
    }

    if (user && user.name) {
      filters.push({ employee: user.name });
    }

    if (employee && employee.name) {
      filters.push({ employee: employee.name });
    }

    if (user && user.email) {
      filters.push({ employee: user.email });
    }

    if (filters.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const works = await Work.find({
      $or: filters,
    }).sort({
      date: -1,
      createdAt: -1,
    });

    res.json({
      success: true,
      data: works,
    });
  } catch (error) {
    console.error("Get My Work Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned work",
      error: error.message,
    });
  }
});

// ========================================
// ADD / ASSIGN WORK (ADMIN)
// ========================================

router.post("/", async (req, res) => {
  try {
    const { employeeId, employeeRef, employee, title, description, date, time, status } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        success: false,
        message: "Title and Date are required",
      });
    }

    let selectedEmployee = null;

    if (employeeRef) {
      selectedEmployee = await Employee.findById(employeeRef);
    } else if (employeeId) {
      selectedEmployee = await Employee.findOne({ employeeId });
    }

    const workData = {
      employeeRef: selectedEmployee ? selectedEmployee._id : (employeeRef || null),
      employeeId: selectedEmployee ? selectedEmployee.employeeId : (employeeId || ""),
      employee: selectedEmployee ? selectedEmployee.name : (employee || ""),
      title: title.trim(),
      description: description ? description.trim() : "",
      date,
      time: time ? time.trim() : "",
      status: status || "Pending",
    };

    const work = await Work.create(workData);

    res.status(201).json({
      success: true,
      message: "Work assigned successfully",
      data: work,
    });
  } catch (error) {
    console.error("Add Work Error:", error);

    res.status(400).json({
      success: false,
      message: "Failed to assign work",
      error: error.message,
    });
  }
});

// ========================================
// GET WORK BY ID
// ========================================

router.get("/:id", async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);

    if (!work) {
      return res.status(404).json({
        success: false,
        message: "Work record not found",
      });
    }

    res.json({
      success: true,
      data: work,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid work ID",
      error: error.message,
    });
  }
});

// ========================================
// UPDATE WORK / STATUS
// ========================================

router.put("/:id", async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);

    if (!work) {
      return res.status(404).json({
        success: false,
        message: "Work record not found",
      });
    }

    const updatedWork = await Work.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: "Work updated successfully",
      data: updatedWork,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update work",
      error: error.message,
    });
  }
});

// ========================================
// UPDATE TASK STATUS BY EMPLOYEE
// ========================================

router.patch("/:id/status", employeeAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const work = await Work.findById(req.params.id);

    if (!work) {
      return res.status(404).json({
        success: false,
        message: "Work record not found",
      });
    }

    // Verify task belongs to authenticated employee
    const user = req.user;
    const employee = req.employee;

    const matchesEmployee =
      (employee && work.employeeRef && work.employeeRef.toString() === employee._id.toString()) ||
      (employee && work.employeeId && work.employeeId === employee.employeeId) ||
      (user && work.employee && work.employee.toLowerCase() === user.name.toLowerCase()) ||
      (employee && work.employee && work.employee.toLowerCase() === employee.name.toLowerCase());

    if (!matchesEmployee && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    work.status = status;
    await work.save();

    res.json({
      success: true,
      message: "Task status updated successfully",
      data: work,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update task status",
      error: error.message,
    });
  }
});

// ========================================
// DELETE WORK (ADMIN)
// ========================================

router.delete("/:id", async (req, res) => {
  try {
    const work = await Work.findByIdAndDelete(
      req.params.id
    );

    if (!work) {
      return res.status(404).json({
        success: false,
        message: "Work record not found",
      });
    }

    res.json({
      success: true,
      message: "Work deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to delete work",
      error: error.message,
    });
  }
});

module.exports = router;