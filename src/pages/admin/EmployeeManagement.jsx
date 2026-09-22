import { useEffect, useMemo, useState } from "react";
import {
  FaUsers,
  FaUserCheck,
  FaUserClock,
  FaMoneyBillWave,
  FaPlus,
  FaTimes,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTasks,
  FaClipboardList,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";

import "./EmployeeManagement.css";

import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getWork,
  addWork,
  updateWork,
  deleteWork,
} from "../../services/api";

const getToday = () => new Date().toISOString().split("T")[0];

const createEmptyForm = () => ({
  employeeId: "",
  name: "",
  phone: "",
  role: "",
  salary: "",
  joiningDate: getToday(),
  status: "Active",
});

const createEmptyWorkForm = () => ({
  employeeSelect: "",
  title: "",
  description: "",
  date: getToday(),
  time: "",
  status: "Pending",
});

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState(createEmptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // ========================================
  // WORK ALLOCATION STATE
  // ========================================
  const [workList, setWorkList] = useState([]);
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [editingWorkId, setEditingWorkId] = useState(null);
  const [workFormData, setWorkFormData] = useState(createEmptyWorkForm);
  const [workSearch, setWorkSearch] = useState("");

  // ========================================
  // LOAD DATA FROM MONGODB
  // ========================================

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(
        Array.isArray(data)
          ? data.map((employee) => ({
              ...employee,
              id: employee.id || employee._id,
            }))
          : []
      );
    } catch (error) {
      console.error("LOAD EMPLOYEES ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkTasks = async () => {
    try {
      const res = await getWork();
      const tasks = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setWorkList(tasks);
    } catch (error) {
      console.error("LOAD WORK ERROR:", error);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadWorkTasks();
  }, []);

  // Filter Active Employees for Dropdown
  const activeEmployees = useMemo(() => {
    return employees.filter((emp) => emp.status === "Active");
  }, [employees]);

  // ========================================
  // FILTER EMPLOYEES
  // ========================================

  const filteredEmployees = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const employeeId = employee.employeeId?.toLowerCase() || "";
      const name = employee.name?.toLowerCase() || "";
      const phone = employee.phone?.toString() || "";
      const role = employee.role?.toLowerCase() || "";

      const matchesSearch =
        employeeId.includes(searchText) ||
        name.includes(searchText) ||
        phone.includes(searchText) ||
        role.includes(searchText);

      const matchesStatus =
        statusFilter === "" || employee.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [employees, search, statusFilter]);

  // Filter Work Tasks
  const filteredWorkList = useMemo(() => {
    const text = workSearch.trim().toLowerCase();
    return workList.filter((task) => {
      const title = (task.title || "").toLowerCase();
      const empName = (task.employee || "").toLowerCase();
      const empId = (task.employeeId || "").toLowerCase();
      return (
        title.includes(text) ||
        empName.includes(text) ||
        empId.includes(text)
      );
    });
  }, [workList, workSearch]);

  // Summary
  const summary = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.status === "Active").length;
    const inactive = employees.filter((e) => e.status === "Inactive").length;
    const monthlySalary = employees
      .filter((e) => e.status === "Active")
      .reduce((sum, e) => sum + Number(e.salary || 0), 0);

    return { total, active, inactive, monthlySalary };
  }, [employees]);

  // ========================================
  // EMPLOYEE FORM HANDLERS
  // ========================================

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.employeeId.trim() ||
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.role.trim() ||
      formData.salary === "" ||
      !formData.joiningDate
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const salary = Number(formData.salary);
    if (!Number.isFinite(salary) || salary < 0) {
      alert("Please enter a valid salary.");
      return;
    }

    const phone = formData.phone.trim();
    if (!/^[0-9]{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    const employeeData = {
      employeeId: formData.employeeId.trim(),
      name: formData.name.trim(),
      phone,
      role: formData.role.trim(),
      salary,
      joiningDate: formData.joiningDate,
      status: formData.status,
    };

    try {
      if (editingId !== null) {
        const updated = await updateEmployee(editingId, employeeData);
        const norm = { ...updated, id: updated.id || updated._id };
        setEmployees((current) =>
          current.map((emp) => (emp.id === editingId ? norm : emp))
        );
        alert("Employee updated successfully!");
        resetForm();
        return;
      }

      const newEmp = await addEmployee(employeeData);
      const norm = { ...newEmp, id: newEmp.id || newEmp._id };
      setEmployees((current) => [norm, ...current]);
      alert("Employee added successfully!");
      resetForm();
    } catch (error) {
      alert(error.message || "Failed to save employee.");
    }
  };

  const handleEdit = (employee) => {
    setEditingId(employee.id);
    setFormData({
      employeeId: employee.employeeId || "",
      name: employee.name || "",
      phone: employee.phone || "",
      role: employee.role || "",
      salary: String(employee.salary || ""),
      joiningDate: employee.joiningDate || getToday(),
      status: employee.status || "Active",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;

    try {
      await deleteEmployee(id);
      setEmployees((current) => current.filter((emp) => emp.id !== id));
      if (editingId === id) resetForm();
      alert("Employee deleted successfully!");
    } catch (error) {
      alert(error.message || "Failed to delete employee.");
    }
  };

  const resetForm = () => {
    setFormData(createEmptyForm());
    setEditingId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData(createEmptyForm());
    setShowForm(true);
  };

  // ========================================
  // WORK ALLOCATION FORM HANDLERS
  // ========================================

  const handleWorkFormChange = (e) => {
    const { name, value } = e.target;
    setWorkFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleWorkSubmit = async (e) => {
    e.preventDefault();

    if (!workFormData.employeeSelect) {
      alert("Please select an employee.");
      return;
    }

    if (!workFormData.title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    if (!workFormData.date) {
      alert("Please select a task date.");
      return;
    }

    const selectedEmp = employees.find(
      (emp) =>
        emp.id === workFormData.employeeSelect ||
        emp._id === workFormData.employeeSelect
    );

    const taskPayload = {
      employeeRef: selectedEmp ? (selectedEmp._id || selectedEmp.id) : null,
      employeeId: selectedEmp ? selectedEmp.employeeId : "",
      employee: selectedEmp ? selectedEmp.name : "",
      title: workFormData.title.trim(),
      description: workFormData.description.trim(),
      date: workFormData.date,
      time: workFormData.time.trim(),
      status: workFormData.status || "Pending",
    };

    try {
      if (editingWorkId !== null) {
        await updateWork(editingWorkId, taskPayload);
        alert("Task updated successfully!");
      } else {
        await addWork(taskPayload);
        alert("Work allocated successfully!");
      }

      resetWorkForm();
      await loadWorkTasks();
    } catch (error) {
      console.error("SAVE WORK ERROR:", error);
      alert(error.message || "Failed to allocate task.");
    }
  };

  const handleEditWork = (task) => {
    setEditingWorkId(task._id || task.id);

    let empSelect = "";
    if (task.employeeRef) {
      empSelect = task.employeeRef;
    } else {
      const matched = employees.find(
        (e) => e.employeeId === task.employeeId || e.name === task.employee
      );
      if (matched) empSelect = matched._id || matched.id;
    }

    setWorkFormData({
      employeeSelect: empSelect,
      title: task.title || "",
      description: task.description || "",
      date: task.date || getToday(),
      time: task.time || "",
      status: task.status || "Pending",
    });
    setShowWorkForm(true);
  };

  const handleDeleteWork = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteWork(taskId);
      alert("Task deleted successfully!");
      await loadWorkTasks();
      if (editingWorkId === taskId) resetWorkForm();
    } catch (error) {
      alert(error.message || "Failed to delete task.");
    }
  };

  const resetWorkForm = () => {
    setWorkFormData(createEmptyWorkForm());
    setEditingWorkId(null);
    setShowWorkForm(false);
  };

  const openWorkAssignForm = () => {
    setEditingWorkId(null);
    setWorkFormData(createEmptyWorkForm());
    setShowWorkForm(true);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="employee-page">
      {/* HEADER */}
      <div className="employee-page-header">
        <div>
          <h1>Employee Management</h1>
          <p>Manage farm employees, roles, salaries, and assign work tasks.</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="add-employee-btn"
            onClick={openWorkAssignForm}
            style={{ background: "#2563eb" }}
          >
            <FaTasks />
            <span>Assign Work</span>
          </button>

          <button
            type="button"
            className="add-employee-btn"
            onClick={openAddForm}
          >
            <FaPlus />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="employee-summary-grid">
        <div className="employee-summary-card">
          <div className="employee-summary-icon">
            <FaUsers />
          </div>
          <div>
            <span>Total Employees</span>
            <strong>{summary.total}</strong>
          </div>
        </div>

        <div className="employee-summary-card">
          <div className="employee-summary-icon">
            <FaUserCheck />
          </div>
          <div>
            <span>Active Employees</span>
            <strong>{summary.active}</strong>
          </div>
        </div>

        <div className="employee-summary-card">
          <div className="employee-summary-icon">
            <FaUserClock />
          </div>
          <div>
            <span>Inactive Employees</span>
            <strong>{summary.inactive}</strong>
          </div>
        </div>

        <div className="employee-summary-card">
          <div className="employee-summary-icon">
            <FaMoneyBillWave />
          </div>
          <div>
            <span>Allocated Tasks</span>
            <strong>{workList.length}</strong>
          </div>
        </div>
      </div>

      {/* ASSIGN WORK FORM */}
      {showWorkForm && (
        <div
          className="employee-form-card"
          style={{ borderLeft: "5px solid #2563eb" }}
        >
          <div className="employee-form-header">
            <div>
              <h2>{editingWorkId !== null ? "Edit Task" : "Assign Work Task"}</h2>
              <p>Allocate a task to an active employee.</p>
            </div>

            <button
              type="button"
              className="employee-close-btn"
              onClick={resetWorkForm}
              title="Close"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleWorkSubmit}>
            <div className="employee-form-grid">
              {/* SELECT EMPLOYEE */}
              <div className="employee-form-group">
                <label htmlFor="employeeSelect">
                  Select Employee <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  id="employeeSelect"
                  name="employeeSelect"
                  value={workFormData.employeeSelect}
                  onChange={handleWorkFormChange}
                >
                  <option value="">-- Choose Employee --</option>
                  {activeEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employeeId} - {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* TASK TITLE */}
              <div className="employee-form-group">
                <label htmlFor="taskTitle">
                  Task Title <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  id="taskTitle"
                  type="text"
                  name="title"
                  placeholder="e.g., Morning Milking & Feed Distribution"
                  value={workFormData.title}
                  onChange={handleWorkFormChange}
                />
              </div>

              {/* TASK DATE */}
              <div className="employee-form-group">
                <label htmlFor="taskDate">
                  Task Date <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  id="taskDate"
                  type="date"
                  name="date"
                  value={workFormData.date}
                  onChange={handleWorkFormChange}
                />
              </div>

              {/* TIME / DEADLINE */}
              <div className="employee-form-group">
                <label htmlFor="taskTime">Time / Deadline</label>
                <input
                  id="taskTime"
                  type="text"
                  name="time"
                  placeholder="e.g., 06:00 AM or Morning Slot"
                  value={workFormData.time}
                  onChange={handleWorkFormChange}
                />
              </div>

              {/* STATUS */}
              <div className="employee-form-group">
                <label htmlFor="taskStatus">Status</label>
                <select
                  id="taskStatus"
                  name="status"
                  value={workFormData.status}
                  onChange={handleWorkFormChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* DESCRIPTION */}
              <div
                className="employee-form-group"
                style={{ gridColumn: "span 3" }}
              >
                <label htmlFor="taskDesc">Task Description</label>
                <input
                  id="taskDesc"
                  type="text"
                  name="description"
                  placeholder="Additional details regarding the task..."
                  value={workFormData.description}
                  onChange={handleWorkFormChange}
                />
              </div>
            </div>

            <div className="employee-form-actions">
              <button
                type="button"
                className="employee-cancel-btn"
                onClick={resetWorkForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="employee-save-btn"
                style={{ background: "#2563eb" }}
              >
                {editingWorkId !== null ? "Update Task" : "Assign Work"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD/EDIT EMPLOYEE FORM */}
      {showForm && (
        <div className="employee-form-card">
          <div className="employee-form-header">
            <div>
              <h2>
                {editingId !== null ? "Edit Employee" : "Add Employee"}
              </h2>
              <p>Enter employee information below.</p>
            </div>

            <button
              type="button"
              className="employee-close-btn"
              onClick={resetForm}
              title="Close"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="employee-form-grid">
              <div className="employee-form-group">
                <label htmlFor="employeeId">Employee ID</label>
                <input
                  id="employeeId"
                  type="text"
                  name="employeeId"
                  placeholder="Example: EMP-005"
                  value={formData.employeeId}
                  onChange={handleChange}
                />
              </div>

              <div className="employee-form-group">
                <label htmlFor="employeeName">Employee Name</label>
                <input
                  id="employeeName"
                  type="text"
                  name="name"
                  placeholder="Enter employee name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="employee-form-group">
                <label htmlFor="employeePhone">Phone Number</label>
                <input
                  id="employeePhone"
                  type="tel"
                  name="phone"
                  placeholder="10 digit mobile number"
                  maxLength="10"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="employee-form-group">
                <label htmlFor="employeeRole">Role</label>
                <select
                  id="employeeRole"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="">Select role</option>
                  <option value="Farm Manager">Farm Manager</option>
                  <option value="Cow Caretaker">Cow Caretaker</option>
                  <option value="Milking Staff">Milking Staff</option>
                  <option value="Farm Worker">Farm Worker</option>
                  <option value="Driver">Driver</option>
                  <option value="Veterinary Assistant">Veterinary Assistant</option>
                </select>
              </div>

              <div className="employee-form-group">
                <label htmlFor="employeeSalary">Monthly Salary (₹)</label>
                <input
                  id="employeeSalary"
                  type="number"
                  name="salary"
                  min="0"
                  step="100"
                  placeholder="Example: 25000"
                  value={formData.salary}
                  onChange={handleChange}
                />
              </div>

              <div className="employee-form-group">
                <label htmlFor="joiningDate">Joining Date</label>
                <input
                  id="joiningDate"
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                />
              </div>

              <div className="employee-form-group">
                <label htmlFor="employeeStatus">Status</label>
                <select
                  id="employeeStatus"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="employee-form-actions">
              <button
                type="button"
                className="employee-cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
              <button type="submit" className="employee-save-btn">
                {editingId !== null ? "Update Employee" : "Save Employee"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ALLOCATED TASKS LIST */}
      <div className="employee-table-card" style={{ marginBottom: "25px" }}>
        <div
          className="employee-filter-bar"
          style={{ background: "#f8fafc", justifyContent: "space-between" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaClipboardList style={{ fontSize: "20px", color: "#2563eb" }} />
            <h2 style={{ margin: 0, fontSize: "18px", color: "#1f2937" }}>
              Allocated Tasks ({filteredWorkList.length})
            </h2>
          </div>

          <div className="employee-search-box">
            <span>
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search tasks or employees..."
              value={workSearch}
              onChange={(e) => setWorkSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="employee-table-wrapper">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Assigned Employee</th>
                <th>Employee ID</th>
                <th>Description</th>
                <th>Date</th>
                <th>Time / Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkList.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "24px" }}>
                    No work tasks allocated yet.
                  </td>
                </tr>
              ) : (
                filteredWorkList.map((task) => {
                  const taskId = task._id || task.id;
                  const statusClass = (task.status || "Pending")
                    .toLowerCase()
                    .replace(/\s+/g, "-");

                  return (
                    <tr key={taskId}>
                      <td>
                        <strong>{task.title}</strong>
                      </td>
                      <td>
                        <span className="employee-role">{task.employee || "-"}</span>
                      </td>
                      <td>
                        <strong>{task.employeeId || "-"}</strong>
                      </td>
                      <td>{task.description || "-"}</td>
                      <td>{formatDate(task.date)}</td>
                      <td>{task.time || "-"}</td>
                      <td>
                        <select
                          value={task.status || "Pending"}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                              await updateWork(taskId, { status: newStatus });
                              await loadWorkTasks();
                            } catch (err) {
                              alert("Failed to update status");
                            }
                          }}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            border: "1px solid #d1d5db",
                            fontWeight: "600",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td>
                        <div className="employee-action-buttons">
                          <button
                            type="button"
                            className="employee-edit-btn"
                            onClick={() => handleEditWork(task)}
                            title="Edit Task"
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            className="employee-delete-btn"
                            onClick={() => handleDeleteWork(taskId)}
                            title="Delete Task"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EMPLOYEE TABLE */}
      <div className="employee-table-card">
        <div className="employee-filter-bar">
          <div className="employee-search-box">
            <span>
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search by ID, name, phone, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="employee-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {(search || statusFilter) && (
            <button
              type="button"
              className="employee-clear-btn"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="employee-table-wrapper">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Monthly Salary</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <div className="employee-info">
                        <div className="employee-avatar">
                          {employee.name ? employee.name.charAt(0).toUpperCase() : "E"}
                        </div>
                        <div>
                          <strong>{employee.name}</strong>
                          <small>{employee.role}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{employee.employeeId}</strong>
                    </td>
                    <td>{employee.phone}</td>
                    <td>
                      <span className="employee-role">{employee.role}</span>
                    </td>
                    <td>₹{Number(employee.salary || 0).toLocaleString("en-IN")}</td>
                    <td>{formatDate(employee.joiningDate)}</td>
                    <td>
                      <span
                        className={`employee-status ${
                          employee.status === "Active" ? "active" : "inactive"
                        }`}
                      >
                        {employee.status}
                      </span>
                    </td>
                    <td>
                      <div className="employee-action-buttons">
                        <button
                          type="button"
                          className="employee-edit-btn"
                          onClick={() => handleEdit(employee)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          type="button"
                          className="employee-delete-btn"
                          onClick={() => handleDelete(employee.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    <div className="employee-empty-state">
                      <div>
                        <FaUsers />
                      </div>
                      <h3>No employees found</h3>
                      <p>Add an employee or change your search filter.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="employee-table-footer">
          Showing <strong>{filteredEmployees.length}</strong> employee
          {filteredEmployees.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;