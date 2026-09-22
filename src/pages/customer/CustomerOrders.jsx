import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  FaBox,
  FaTruck,
  FaClock,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaShoppingBag,
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaTrash,
  FaArrowRight,
} from "react-icons/fa";

import {
  getCustomerOrders,
  getCustomerCart,
  updateCustomerCartQuantity,
  removeCustomerCartItem,
  checkoutCustomerOrder,
} from "../../api/customerApi";

import "./CustomerOrders.css";

function CustomerOrders() {
  const navigate = useNavigate();

  // Cart State
  const [cart, setCart] = useState({ items: [], grandTotal: 0, totalQuantity: 0 });
  const [cartLoading, setCartLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // LOAD DATA
  // ======================================================

  const loadCartData = async () => {
    try {
      setCartLoading(true);
      const res = await getCustomerCart();
      if (res?.cart) {
        setCart(res.cart);
      }
    } catch (err) {
      console.error("Load Cart Error:", err);
    } finally {
      setCartLoading(false);
    }
  };

  const loadOrdersData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCustomerOrders();
      const orderData = response?.orders || response?.data?.orders || [];
      setOrders(Array.isArray(orderData) ? orderData : []);
    } catch (err) {
      console.error("Customer Orders Error:", err);
      const message = err?.message || "";
      if (
        message.toLowerCase().includes("not found") ||
        message.toLowerCase().includes("login")
      ) {
        setOrders([]);
        return;
      }
      setError(message || "Unable to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCartData();
    loadOrdersData();
  }, []);

  // ======================================================
  // CART ACTIONS
  // ======================================================

  const handleQuantityChange = async (productId, currentQty, change) => {
    const newQty = currentQty + change;
    try {
      const res = await updateCustomerCartQuantity(productId, newQty);
      if (res?.cart) {
        setCart(res.cart);
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (err) {
      alert("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const res = await removeCustomerCartItem(productId);
      if (res?.cart) {
        setCart(res.cart);
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (err) {
      alert("Failed to remove item");
    }
  };

  const handleProceedToPayment = async () => {
    if (!cart.items || cart.items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      setCheckoutLoading(true);
      const res = await checkoutCustomerOrder();
      if (res?.success && res?.order) {
        navigate("/customer/payments", {
          state: { checkoutOrder: res.order },
        });
      } else {
        alert("Checkout failed. Please try again.");
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      alert(err?.message || "Failed to proceed to payment.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // ======================================================
  // FILTER ORDERS
  // ======================================================

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "All") return true;

    const status = String(order.status || "").toLowerCase();

    if (activeFilter === "Processing") {
      return status === "processing" || status === "pending";
    }
    if (activeFilter === "Out for Delivery") {
      return (
        status === "out for delivery" ||
        status === "out_for_delivery" ||
        status === "shipped"
      );
    }
    if (activeFilter === "Delivered") return status === "delivered";
    if (activeFilter === "Cancelled") {
      return status === "cancelled" || status === "canceled";
    }
    return true;
  });

  const totalOrders = orders.length;
  const activeOrdersCount = orders.filter((order) => {
    const status = String(order.status || "").toLowerCase();
    return status !== "delivered" && status !== "cancelled" && status !== "canceled";
  }).length;

  const totalSpent = orders.reduce((sum, order) => {
    return sum + Number(order.totalAmount ?? order.total ?? order.amount ?? 0);
  }, 0);

  const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const formatDate = (date) => {
    if (!date) return "-";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    const value = String(status || "Processing")
      .toLowerCase()
      .replace(/\s+/g, "-");

    if (value === "delivered") return "status-delivered";
    if (value === "cancelled" || value === "canceled") return "status-cancelled";
    if (value === "out-for-delivery" || value === "shipped") return "status-delivery";
    return "status-processing";
  };

  const filters = ["All", "Processing", "Out for Delivery", "Delivered", "Cancelled"];

  return (
    <div className="customer-orders-page">
      {/* HEADER */}
      <div className="customer-orders-header">
        <div>
          <h1>My Orders & Shopping Cart</h1>
          <p>Review products in your cart and track your confirmed orders.</p>
        </div>

        <div className="orders-count-badge">
          {totalOrders} Past Orders
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="customer-orders-error">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* SHOPPING CART SECTION */}
      <div
        className="customer-order-history"
        style={{ marginBottom: "30px", borderTop: "4px solid #16834b" }}
      >
        <div className="order-history-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaShoppingCart style={{ fontSize: "24px", color: "#16834b" }} />
            <div>
              <h2 style={{ margin: 0 }}>Shopping Cart (Pending Checkout)</h2>
              <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>
                Items ready for purchase
              </p>
            </div>
          </div>

          <div className="history-count" style={{ background: "#ecfdf5", color: "#16834b" }}>
            {cart.items?.length || 0} Cart Items
          </div>
        </div>

        {cartLoading ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
            Loading shopping cart...
          </div>
        ) : !cart.items || cart.items.length === 0 ? (
          <div className="no-orders" style={{ padding: "40px 20px" }}>
            <div className="no-orders-icon">
              <FaShoppingBag />
            </div>
            <h3>Your Cart is Empty</h3>
            <p style={{ marginBottom: "20px" }}>
              Browse our fresh dairy products and add something to your cart.
            </p>
            <NavLink
              to="/customer/products"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#16834b",
                color: "white",
                padding: "10px 20px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              <FaShoppingCart /> Browse Products
            </NavLink>
          </div>
        ) : (
          <div style={{ marginTop: "15px" }}>
            <div className="orders-list">
              {cart.items.map((item) => {
                const itemId = item._id || item.productId || item.product;
                const subtotal = (item.price || 0) * (item.quantity || 1);

                return (
                  <div className="order-item" key={itemId}>
                    <div className="order-item-icon" style={{ background: "#ecfdf5", color: "#16834b" }}>
                      <FaBox />
                    </div>

                    <div className="order-item-details">
                      <div className="order-item-top">
                        <h3 style={{ fontSize: "16px", fontWeight: "700" }}>{item.productName}</h3>
                        <span style={{ fontSize: "11px", background: "#f1f5f9", padding: "3px 8px", borderRadius: "12px", color: "#475569", textTransform: "uppercase" }}>
                          {item.category || "Dairy"}
                        </span>
                      </div>

                      <div className="order-item-info">
                        <span>Unit Price: <strong>₹{item.price}</strong> / {item.unit || "L"}</span>
                      </div>
                    </div>

                    {/* QUANTITY CONTROLS */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "0 20px" }}>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(itemId, item.quantity, -1)}
                        style={{
                          border: "1px solid #cbd5e1",
                          background: "#f8fafc",
                          width: "32px",
                          height: "32px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FaMinus size={11} color="#334155" />
                      </button>

                      <strong style={{ fontSize: "16px", minWidth: "24px", textAlign: "center" }}>
                        {item.quantity}
                      </strong>

                      <button
                        type="button"
                        onClick={() => handleQuantityChange(itemId, item.quantity, 1)}
                        style={{
                          border: "1px solid #cbd5e1",
                          background: "#f8fafc",
                          width: "32px",
                          height: "32px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FaPlus size={11} color="#334155" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(itemId)}
                        title="Remove item"
                        style={{
                          border: "none",
                          background: "#fef2f2",
                          color: "#dc2626",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          marginLeft: "10px",
                          fontWeight: "600",
                          fontSize: "13px",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <FaTrash size={12} /> Remove
                      </button>
                    </div>

                    {/* SUBTOTAL */}
                    <div className="order-item-amount">
                      <span>Subtotal</span>
                      <strong style={{ color: "#16834b", fontSize: "18px" }}>
                        {formatCurrency(subtotal)}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CART SUMMARY & CHECKOUT BUTTON */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "20px",
                paddingTop: "20px",
                borderTop: "1px solid #e5e7eb",
                flexWrap: "wrap",
                gap: "15px",
              }}
            >
              <div>
                <span style={{ color: "#6b7280", fontSize: "14px" }}>Total Quantity: </span>
                <strong style={{ fontSize: "16px", color: "#111827" }}>
                  {cart.totalQuantity || cart.items.reduce((s, i) => s + i.quantity, 0)} units
                </strong>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
                <div>
                  <span style={{ color: "#6b7280", fontSize: "13px", display: "block" }}>Grand Total:</span>
                  <strong style={{ fontSize: "24px", color: "#16834b" }}>
                    {formatCurrency(cart.grandTotal || cart.items.reduce((s, i) => s + i.price * i.quantity, 0))}
                  </strong>
                </div>

                <button
                  type="button"
                  disabled={checkoutLoading}
                  onClick={handleProceedToPayment}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "#16834b",
                    color: "white",
                    border: "none",
                    padding: "14px 26px",
                    borderRadius: "10px",
                    fontSize: "16px",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(22, 131, 75, 0.2)",
                  }}
                >
                  <span>{checkoutLoading ? "Processing..." : "Proceed to Payment"}</span>
                  <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STATISTICS */}
      <div className="customer-orders-stats">
        <div className="order-stat-card">
          <div className="order-stat-icon green">
            <FaBox />
          </div>
          <div>
            <span>Total Orders</span>
            <strong>{totalOrders}</strong>
          </div>
        </div>

        <div className="order-stat-card">
          <div className="order-stat-icon blue">
            <FaTruck />
          </div>
          <div>
            <span>Active Orders</span>
            <strong>{activeOrdersCount}</strong>
          </div>
        </div>

        <div className="order-stat-card">
          <div className="order-stat-icon purple">
            <FaMoneyBillWave />
          </div>
          <div>
            <span>Total Spent</span>
            <strong>{formatCurrency(totalSpent)}</strong>
          </div>
        </div>
      </div>

      {/* ORDER HISTORY */}
      <div className="customer-order-history">
        <div className="order-history-header">
          <div>
            <h2>Order History</h2>
            <p>View your past placed and delivered orders.</p>
          </div>

          <div className="history-count">{filteredOrders.length} Orders</div>
        </div>

        {/* FILTERS */}
        <div className="order-filters">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={activeFilter === filter ? "active" : ""}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="order-history-divider"></div>

        {/* ORDERS */}
        {loading ? (
          <div style={{ padding: "30px", textAlign: "center" }}>Loading order history...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">
              <FaShoppingBag />
            </div>
            <h3>No Orders Found</h3>
            <p>
              {activeFilter === "All"
                ? "There are no previous orders in your account."
                : `There are no ${activeFilter.toLowerCase()} orders.`}
            </p>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order, index) => {
              const orderId = order._id || order.id || index + 1;
              const orderAmount = order.totalAmount ?? order.total ?? order.price ?? 0;
              const orderDate = order.createdAt || order.orderDate || order.date;
              const status = order.status || "Pending";

              return (
                <div className="order-item" key={orderId}>
                  <div className="order-item-icon">
                    <FaBox />
                  </div>

                  <div className="order-item-details">
                    <div className="order-item-top">
                      <h3>
                        Order #{order.orderNo || String(orderId).slice(-8)}
                      </h3>
                      <span className={`order-status ${getStatusClass(status)}`}>
                        {status}
                      </span>
                    </div>

                    <div className="order-item-info">
                      <span>Date: {formatDate(orderDate)}</span>
                      {order.items && Array.isArray(order.items) && (
                        <span>Items: {order.items.length}</span>
                      )}
                      <span>Payment: <strong>{order.paymentStatus || "Pending"}</strong></span>
                    </div>
                  </div>

                  <div className="order-item-amount">
                    <span>Total</span>
                    <strong>{formatCurrency(orderAmount)}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerOrders;