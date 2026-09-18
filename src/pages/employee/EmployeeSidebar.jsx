import {
  FaUserTie,
  FaTachometerAlt,
  FaBriefcase,
  FaMoneyBillWave,
  FaUser,
  FaHeadset,
  FaSignOutAlt,
} from "react-icons/fa";

import { NavLink, useNavigate } from "react-router-dom";

const EmployeeSidebar = ({ isOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("employeeUser");
    navigate("/employee/login");
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/employee",
      icon: <FaTachometerAlt />,
      end: true,
    },
    {
      name: "My Work",
      path: "/employee/work",
      icon: <FaBriefcase />,
    },
    
    
    {
      name: "Salary",
      path: "/employee/salary",
      icon: <FaMoneyBillWave />,
    },
    {
      name: "Profile",
      path: "/employee/profile",
      icon: <FaUser />,
    },
  ];

  return (
    <aside
      className={`employee-sidebar ${
        isOpen ? "" : "employee-sidebar-closed"
      }`}
    >

      {/* LOGO */}
      <div className="employee-sidebar-logo">

        <div className="employee-logo-icon">
          <FaUserTie />
        </div>

        <div className="employee-logo-text">
          <strong>Employee Panel</strong>
          <span>Dairy Farm Management</span>
        </div>

      </div>


      {/* NAVIGATION */}
      <nav className="employee-sidebar-nav">

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `employee-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >

            <span className="employee-nav-icon">
              {item.icon}
            </span>

            <span className="employee-nav-text">
              {item.name}
            </span>

          </NavLink>
        ))}

      </nav>


      {/* FOOTER */}
      <div className="employee-sidebar-footer">

        {/* SUPPORT */}
        <div className="employee-support-box">

          <div className="employee-support-icon">
            <FaHeadset />
          </div>

          <div className="employee-support-text">
            <strong>Need Help?</strong>
            <span>Contact administrator</span>
          </div>

        </div>


        {/* LOGOUT */}
        <button
          type="button"
          className="employee-logout-button"
          onClick={handleLogout}
        >
          <FaSignOutAlt />

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
};

export default EmployeeSidebar;