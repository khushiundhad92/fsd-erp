import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaUserCircle,
  FaBars,
  FaShoppingCart,
} from "react-icons/fa";

import { getCustomerCart } from "../../services/api";
import "./CustomerTopbar.css";

const CustomerTopbar = ({
  onMenuClick,
}) => {
  const getCustomer = () => {
    try {
      return JSON.parse(
        localStorage.getItem(
          "customerUser"
        ) || "{}"
      );
    } catch {
      return {};
    }
  };

  const [customer, setCustomer] = useState(getCustomer());
  const [cartCount, setCartCount] = useState(0);

  const loadCartCount = async () => {
    try {
      const res = await getCustomerCart();
      if (res?.cart?.items) {
        const totalQty = res.cart.items.reduce(
          (sum, item) => sum + Number(item.quantity || 1),
          0
        );
        setCartCount(totalQty);
      }
    } catch (err) {
      // Silent error if not logged in
    }
  };

  useEffect(() => {
    const updateCustomer = () => {
      setCustomer(getCustomer());
    };

    loadCartCount();

    window.addEventListener("customerProfileUpdated", updateCustomer);
    window.addEventListener("storage", updateCustomer);
    window.addEventListener("cartUpdated", loadCartCount);

    return () => {
      window.removeEventListener("customerProfileUpdated", updateCustomer);
      window.removeEventListener("storage", updateCustomer);
      window.removeEventListener("cartUpdated", loadCartCount);
    };
  }, []);

  const customerName =
    customer.name ||
    customer.fullName ||
    "Customer";

  return (
    <header className="customer-topbar">

      {/* MENU BUTTON */}

      <button
        type="button"
        className="customer-topbar-menu-button"
        onClick={onMenuClick}
      >
        <FaBars />
      </button>

      {/* PAGE TITLE */}

      <div className="customer-topbar-title">

        <h2>
          Customer Dashboard
        </h2>

        <p>
          Dairy Farm Management System
        </p>

      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {/* CART BADGE */}
        <NavLink
          to="/customer/orders"
          className="customer-topbar-cart-link"
          title="View Shopping Cart"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#ecfdf5",
            color: "#166534",
            padding: "8px 14px",
            borderRadius: "20px",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "13px",
            border: "1px solid #bbf7d0",
            transition: "all 0.2s ease",
          }}
        >
          <FaShoppingCart style={{ fontSize: "16px" }} />
          <span>Cart</span>
          <span
            style={{
              background: "#166534",
              color: "white",
              borderRadius: "50%",
              padding: "2px 7px",
              fontSize: "11px",
              fontWeight: "700",
            }}
          >
            {cartCount}
          </span>
        </NavLink>

        {/* CUSTOMER PROFILE */}

        <div className="customer-topbar-profile">

          <div className="customer-topbar-avatar">
            <FaUserCircle />
          </div>

          <div className="customer-topbar-user">

            <strong>
              {customerName}
            </strong>

            <span>
              Customer
            </span>

          </div>

          <span className="customer-topbar-arrow">
            ▾
          </span>

        </div>
      </div>

    </header>
  );
};

export default CustomerTopbar;