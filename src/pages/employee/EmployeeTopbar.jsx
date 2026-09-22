
import {
  FaBars,
  FaUserCircle,
  FaSignInAlt,
} from "react-icons/fa";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

const EmployeeTopbar = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // =========================
  // GET EMPLOYEE
  // =========================

  let employee = {
    name: "Employee",
    role: "Farm Employee",
  };

  try {
    const storedEmployee = localStorage.getItem("employeeUser");

    if (storedEmployee) {
      const parsedEmployee = JSON.parse(storedEmployee);

      if (parsedEmployee && typeof parsedEmployee === "object") {
        employee = {
          name: parsedEmployee.name || "Employee",
          role: parsedEmployee.role || "Farm Employee",
        };
      }
    }
  } catch (error) {
    console.error("Unable to read employee data:", error);
  }

  // =========================
  // PAGE TITLE
  // =========================

  const getTitle = () => {
    const path = location.pathname;

    if (path === "/employee" || path === "/employee/") {
      return "Employee Dashboard";
    }

    if (path.startsWith("/employee/work")) {
      return "My Work";
    }

    if (path.startsWith("/employee/attendance")) {
      return "Attendance";
    }

    if (path.startsWith("/employee/leave")) {
      return "Leave Management";
    }

    if (path.startsWith("/employee/salary")) {
      return "Salary Details";
    }

    if (path.startsWith("/employee/profile")) {
      return "My Profile";
    }

    return "Employee Dashboard";
  };

  // =========================
  // MENU
  // =========================

  const handleMenuClick = () => {
    if (typeof onMenuClick === "function") {
      onMenuClick();
    }
  };

  // =========================
  // PROFILE
  // =========================

  const handleProfile = () => {
    navigate("/employee/profile");
  };

  // =========================
  // LOGIN
  // =========================

  const handleLogin = () => {
    navigate("/employee/login");
  };

  return (
    <header className="employee-topbar">

      {/* ================= LEFT ================= */}

      <div className="employee-topbar-left">

        {/* HAMBURGER */}
        <button
          type="button"
          className="employee-menu-button"
          onClick={handleMenuClick}
          aria-label="Open employee menu"
        >
          <FaBars />
        </button>

        {/* TITLE */}
        <div className="employee-page-title">
          <h2>{getTitle()}</h2>

          <span>
            Dairy Farm Management System
          </span>
        </div>

      </div>


      {/* ================= RIGHT ================= */}

      <div className="employee-topbar-right">

        {/* PROFILE BUTTON */}
        <button
          type="button"
          className="employee-topbar-profile"
          onClick={handleProfile}
          aria-label="Open employee profile"
        >

          <div className="employee-topbar-avatar">
            <FaUserCircle />
          </div>

          <div className="employee-topbar-user">
            <strong>{employee.name}</strong>

            <span>
              {employee.role}
            </span>
          </div>

          <span className="employee-profile-arrow">
            ▾
          </span>

        </button>


        {/* LOGIN BUTTON */}
        <button
          type="button"
          className="employee-login-button"
          onClick={handleLogin}
        >
          <FaSignInAlt />

          <span>Login</span>
        </button>

      </div>

    </header>
  );
};

export default EmployeeTopbar;