import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBoxes,
  FaBox,
  FaCreditCard,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { GiCow } from "react-icons/gi";

import "./CustomerSidebar.css";

const CustomerSidebar = ({ isOpen, onClose }) => {

  const navigate = useNavigate();


  /* =========================================
     CLOSE SIDEBAR ON MOBILE
  ========================================= */

  const handleLinkClick = () => {

    if (window.innerWidth <= 900) {
      onClose();
    }

  };


  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = () => {

    localStorage.removeItem("customerLoggedIn");

    navigate("/customer/login");

  };


  return (

    <aside
      className={`customer-sidebar ${
        isOpen
          ? "customer-sidebar-open"
          : "customer-sidebar-closed"
      }`}
    >

      {/* =====================================
          LOGO
      ===================================== */}

      <div className="customer-sidebar-logo">

        <div className="customer-logo-icon">
          <GiCow />
        </div>

        <div className="customer-logo-text">

          <strong>
            Dairy Farm
          </strong>

          <span>
            ERP System
          </span>

        </div>

      </div>


      {/* =====================================
          NAVIGATION
      ===================================== */}

      <nav className="customer-sidebar-nav">

        <NavLink
          to="/customer"
          end
          onClick={handleLinkClick}
          className={({ isActive }) =>
            `customer-nav-link ${
              isActive ? "active" : ""
            }`
          }
        >

          <span className="customer-nav-icon">
            <FaTachometerAlt />
          </span>

          <span className="customer-nav-text">
            Dashboard
          </span>

        </NavLink>


        <NavLink
          to="/customer/products"
          onClick={handleLinkClick}
          className={({ isActive }) =>
            `customer-nav-link ${
              isActive ? "active" : ""
            }`
          }
        >

          <span className="customer-nav-icon">
            <FaBoxes />
          </span>

          <span className="customer-nav-text">
            Products
          </span>

        </NavLink>


        <NavLink
          to="/customer/orders"
          onClick={handleLinkClick}
          className={({ isActive }) =>
            `customer-nav-link ${
              isActive ? "active" : ""
            }`
          }
        >

          <span className="customer-nav-icon">
            <FaBox />
          </span>

          <span className="customer-nav-text">
            My Orders
          </span>

        </NavLink>


        <NavLink
          to="/customer/payments"
          onClick={handleLinkClick}
          className={({ isActive }) =>
            `customer-nav-link ${
              isActive ? "active" : ""
            }`
          }
        >

          <span className="customer-nav-icon">
            <FaCreditCard />
          </span>

          <span className="customer-nav-text">
            Payments
          </span>

        </NavLink>


        <NavLink
          to="/customer/profile"
          onClick={handleLinkClick}
          className={({ isActive }) =>
            `customer-nav-link ${
              isActive ? "active" : ""
            }`
          }
        >

          <span className="customer-nav-icon">
            <FaUser />
          </span>

          <span className="customer-nav-text">
            My Profile
          </span>

        </NavLink>

      </nav>


      {/* =====================================
          FOOTER
      ===================================== */}

      <div className="customer-sidebar-footer">

        <button
          type="button"
          className="customer-logout-button"
          onClick={handleLogout}
        >

          <span className="customer-nav-icon">
            <FaSignOutAlt />
          </span>

          Logout

        </button>

      </div>

    </aside>

  );
};

export default CustomerSidebar;