import { useEffect, useState } from "react";
import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaClipboardList,
  FaExclamationCircle,
  FaSync,
  FaHourglassHalf,
} from "react-icons/fa";

import { getMyWork, updateWorkStatus } from "../../services/api";
import "./EmployeeMyWork.css";

const EmployeeWork = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  /* ========================================
     LOAD WORK FROM BACKEND
  ======================================== */

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getMyWork();
      const workData = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];

      setTasks(workData);
    } catch (err) {
      console.error("Error loading work:", err);
      setError(err?.message || "Unable to load work data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  /* ========================================
     TASK COUNTS & STATS
  ======================================== */

  const completedTasks = tasks.filter(
    (task) => String(task.status).toLowerCase() === "completed"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => String(task.status).toLowerCase() === "in progress"
  ).length;

  const pendingTasks = tasks.filter(
    (task) => String(task.status).toLowerCase() === "pending"
  ).length;

  /* ========================================
     STATUS UPDATE HANDLER
  ======================================== */

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setUpdatingId(taskId);
      await updateWorkStatus(taskId, newStatus);
      setTasks((currentTasks) =>
        currentTasks.map((t) =>
          (t._id === taskId || t.id === taskId) ? { ...t, status: newStatus } : t
        )
      );
    } catch (err) {
      console.error("Status Update Error:", err);
      alert(err?.message || "Failed to update task status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusIcon = (status) => {
    const s = String(status).toLowerCase();
    if (s === "completed") return <FaCheckCircle />;
    if (s === "in progress") return <FaHourglassHalf />;
    return <FaClock />;
  };

  return (
    <div className="employee-work-page">
      {/* HEADER */}
      <div className="employee-work-header">
        <div>
          <h1>My Work</h1>
          <p>Manage and track your daily assigned farm activities</p>
        </div>

        <div className="employee-work-date">
          <span>Today's Date</span>
          <strong>
            {new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </strong>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="employee-work-summary">
        {/* TOTAL TASKS */}
        <div className="work-summary-card">
          <div className="summary-icon">
            <FaClipboardList />
          </div>
          <div>
            <span>Total Tasks</span>
            <strong>{tasks.length}</strong>
          </div>
        </div>

        {/* PENDING */}
        <div className="work-summary-card">
          <div className="summary-icon pending-icon">
            <FaClock />
          </div>
          <div>
            <span>Pending</span>
            <strong>{pendingTasks}</strong>
          </div>
        </div>

        {/* IN PROGRESS */}
        <div className="work-summary-card">
          <div className="summary-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
            <FaHourglassHalf />
          </div>
          <div>
            <span>In Progress</span>
            <strong>{inProgressTasks}</strong>
          </div>
        </div>

        {/* COMPLETED */}
        <div className="work-summary-card">
          <div className="summary-icon completed-icon">
            <FaCheckCircle />
          </div>
          <div>
            <span>Completed</span>
            <strong>{completedTasks}</strong>
          </div>
        </div>
      </div>

      {/* TASK SECTION */}
      <div className="employee-task-section">
        <div className="employee-task-title">
          <div>
            <h2>Assigned Work Tasks</h2>
            <p>Tasks allocated specifically to you</p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              onClick={loadTasks}
              style={{
                border: "none",
                background: "#f3f4f6",
                padding: "8px 14px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              <FaSync /> Refresh
            </button>

            <div className="task-count">
              <FaTasks />
              <span>{tasks.length} Tasks</span>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="employee-task-list">
            <div className="employee-task-card">
              <div className="employee-task-icon">
                <FaClock />
              </div>
              <div className="employee-task-info">
                <h3>Loading Tasks...</h3>
                <p>Please wait while your work records are loading.</p>
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="employee-task-list">
            <div className="employee-task-card">
              <div className="employee-task-icon">
                <FaExclamationCircle />
              </div>
              <div className="employee-task-info">
                <h3>Unable to Load Tasks</h3>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* NO DATA */}
        {!loading && !error && tasks.length === 0 && (
          <div className="employee-task-list">
            <div className="employee-task-card">
              <div className="employee-task-icon">
                <FaClipboardList />
              </div>
              <div className="employee-task-info">
                <h3>No Tasks Assigned</h3>
                <p>No work has been assigned to you yet.</p>
              </div>
            </div>
          </div>
        )}

        {/* TASK LIST */}
        {!loading && !error && tasks.length > 0 && (
          <div className="employee-task-list">
            {tasks.map((task) => {
              const taskId = task._id || task.id;
              const status = task.status || "Pending";
              const isUpdating = updatingId === taskId;

              return (
                <div className="employee-task-card" key={taskId}>
                  {/* TASK ICON */}
                  <div className="employee-task-icon">
                    <FaTasks />
                  </div>

                  {/* TASK INFORMATION */}
                  <div className="employee-task-info">
                    <h3>{task.title || "Untitled Task"}</h3>
                    <p>{task.description || "No description available."}</p>
                    <div style={{ display: "flex", gap: "15px", marginTop: "8px" }}>
                      <small>
                        <FaClock /> Date: {task.date}
                      </small>
                      {task.time && (
                        <small>
                          <FaClock /> Time: {task.time}
                        </small>
                      )}
                    </div>
                  </div>

                  {/* STATUS SELECTOR */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                    <div className={`employee-task-status ${String(status).toLowerCase().replace(/\s+/g, "-")}`}>
                      {getStatusIcon(status)}
                      {status}
                    </div>

                    <select
                      value={status}
                      disabled={isUpdating}
                      onChange={(e) => handleStatusChange(taskId, e.target.value)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        border: "1px solid #d1d5db",
                        fontWeight: "600",
                        fontSize: "12px",
                        cursor: "pointer",
                        background: "white",
                      }}
                    >
                      <option value="Pending">Mark Pending</option>
                      <option value="In Progress">Mark In Progress</option>
                      <option value="Completed">Mark Completed</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeWork;