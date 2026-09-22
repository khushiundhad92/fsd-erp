import {
  useEffect,
  useState,
} from "react";

import {
  FaBox,
  FaShoppingCart,
  FaMoneyBillWave,
 
  FaTruck,
  FaCheckCircle,
  FaArrowRight,
  FaExclamationTriangle,
  FaUser,
  
} from "react-icons/fa";

import {
  useNavigate,
} from "react-router-dom";

import {
  getCustomerDashboard,
  getCustomerOrders,
  getCustomerPayments,
} from "../../services/api";

import "./CustomerDashboard.css";

const CustomerDashboard = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // GET CUSTOMER FROM LOCAL STORAGE
  // ========================================

  const getStoredCustomer = () => {
    try {
      const customer =
        localStorage.getItem("customerUser");

      if (!customer) {
        return {};
      }

      return JSON.parse(customer);
    } catch (error) {
      console.error(
        "Customer localStorage error:",
        error
      );

      return {};
    }
  };

  const customerData =
    getStoredCustomer();

  const customerName =
    customerData.name ||
    customerData.fullName ||
    "Customer";

  // ========================================
  // LOAD DASHBOARD DATA
  // ========================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        // ========================================
        // DASHBOARD
        // ========================================

        const dashboardResponse =
          await getCustomerDashboard().catch(
            (error) => {
              console.warn(
                "Dashboard API:",
                error.message
              );

              return null;
            }
          );

        // ========================================
        // ORDERS
        // ========================================

        const ordersResponse =
          await getCustomerOrders().catch(
            (error) => {
              console.warn(
                "Orders API:",
                error.message
              );

              return {
                orders: [],
              };
            }
          );

        // ========================================
        // PAYMENTS
        // ========================================

        const paymentsResponse =
          await getCustomerPayments().catch(
            (error) => {
              console.warn(
                "Payments API:",
                error.message
              );

              return {
                payments: [],
              };
            }
          );

        // ========================================
        // NORMALIZE DASHBOARD RESPONSE
        // ========================================

        const dashboardData =
          dashboardResponse?.data ||
          dashboardResponse ||
          {};

        const ordersData =
          ordersResponse?.orders ||
          ordersResponse?.data ||
          [];

        const paymentsData =
          paymentsResponse?.payments ||
          paymentsResponse?.data ||
          [];

        // ========================================
        // SET STATE
        // ========================================

        setDashboard(dashboardData);

        setOrders(
          dashboardData.orders ||
            ordersData ||
            []
        );

        setPayments(
          dashboardData.payments ||
            paymentsData ||
            []
        );
      } catch (error) {
        console.error(
          "Customer Dashboard Error:",
          error
        );

        setError(
          error.message ||
            "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // ========================================
  // LOADING SCREEN
  // ========================================

  if (loading) {
    return (
      <div className="customer-dashboard-page">
        <div className="customer-dashboard-loading">
          <div className="customer-loading-spinner"></div>

          <p>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // TOTAL ORDERS
  // ========================================

  const totalOrders =
    Number(
      dashboard?.totalOrders
    ) || orders.length;

  // ========================================
  // ACTIVE ORDERS
  // ========================================

  const activeStatuses = [
    "pending",
    "processing",
    "confirmed",
    "out for delivery",
    "shipped",
    "in progress",
  ];

  const activeOrders =
    Number(
      dashboard?.activeOrders
    ) ||
    orders.filter((order) => {
      const status =
        String(
          order.status || ""
        ).toLowerCase();

      return activeStatuses.includes(
        status
      );
    }).length;

  // ========================================
  // DELIVERED ORDERS
  // ========================================

  const deliveredOrders =
    Number(
      dashboard?.deliveredOrders
    ) ||
    orders.filter((order) => {
      const status =
        String(
          order.status || ""
        ).toLowerCase();

      return status === "delivered";
    }).length;

  // ========================================
  // TOTAL SPENT
  // ========================================

  const totalSpentFromPayments =
    payments
      .filter((payment) => {
        const status =
          String(
            payment.status || ""
          ).toLowerCase();

        return (
          status === "successful" ||
          status === "success" ||
          status === "paid" ||
          status === "completed"
        );
      })
      .reduce((total, payment) => {
        return (
          total +
          Number(
            payment.amount ||
              payment.total ||
              payment.paidAmount ||
              0
          )
        );
      }, 0);

  const totalSpent =
    Number(
      dashboard?.totalSpent
    ) || totalSpentFromPayments;

  // ========================================
  // RECENT ORDERS
  // ========================================

  const recentOrders =
    [...orders]
      .sort((a, b) => {
        const dateA =
          new Date(
            a.createdAt ||
              a.date ||
              0
          ).getTime();

        const dateB =
          new Date(
            b.createdAt ||
              b.date ||
              0
          ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return String(date);
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ========================================
  // FORMAT AMOUNT
  // ========================================

  const formatAmount = (amount) => {
    return Number(
      amount || 0
    ).toLocaleString("en-IN");
  };

  // ========================================
  // GET ORDER ID
  // ========================================

  const getOrderId = (
    order,
    index
  ) => {
    return (
      order.orderId ||
      order.id ||
      order._id ||
      `ORD-${index + 1}`
    );
  };

  // ========================================
  // GET PRODUCT NAME
  // ========================================

  const getProductName = (order) => {
    return (
      order.productName ||
      order.product ||
      order.product?.name ||
      order.itemName ||
      "Dairy Product"
    );
  };

  // ========================================
  // GET QUANTITY
  // ========================================

  const getQuantity = (order) => {
    if (
      order.quantity !==
      undefined
    ) {
      return order.quantity;
    }

    if (
      order.qty !==
      undefined
    ) {
      return order.qty;
    }

    return "—";
  };

  // ========================================
  // GET ORDER AMOUNT
  // ========================================

  const getOrderAmount = (order) => {
    return (
      order.amount ??
      order.total ??
      order.totalAmount ??
      order.grandTotal ??
      0
    );
  };

  // ========================================
  // GET STATUS CLASS
  // ========================================

  const getStatusClass = (
    status
  ) => {
    const normalized =
      String(
        status || "Pending"
      )
        .toLowerCase()
        .replace(/\s+/g, "-");

    return normalized;
  };

  // ========================================
  // PROFILE DATA
  // ========================================

  const profileName =
    customerData.name ||
    customerName;

  const profileEmail =
    customerData.email ||
    "Email not available";

  const profilePhone =
    customerData.phone ||
    "Phone not available";

  // ========================================
  // RETURN
  // ========================================

  return (
    <div className="customer-dashboard-page">

      {/* ========================================
          ERROR MESSAGE
      ======================================== */}

      {error && (
        <div className="customer-dashboard-error">
          <FaExclamationTriangle />

          <span>
            {error}
          </span>
        </div>
      )}

      {/* ========================================
          WELCOME SECTION
      ======================================== */}

      <section className="customer-welcome-section">

        <div>
          <h1>
            Welcome back, {customerName}! 👋
          </h1>

          <p>
            Manage your dairy orders and
            account from your customer
            dashboard.
          </p>
        </div>

        <button
          type="button"
          className="customer-order-button"
          onClick={() =>
            navigate(
              "/customer/products"
            )
          }
        >
          <FaShoppingCart />

          Shop Products
        </button>

      </section>

      {/* ========================================
          STATISTICS
      ======================================== */}

      <section className="customer-stats-grid">

        {/* TOTAL ORDERS */}

        <div className="customer-stat-card">

          <div className="customer-stat-icon">
            <FaBox />
          </div>

          <div>
            <span>
              Total Orders
            </span>

            <h2>
              {totalOrders}
            </h2>

            <small>
              All your orders
            </small>
          </div>

        </div>

        {/* ACTIVE ORDERS */}

        <div className="customer-stat-card">

          <div className="customer-stat-icon">
            <FaTruck />
          </div>

          <div>
            <span>
              Active Orders
            </span>

            <h2>
              {activeOrders}
            </h2>

            <small>
              Orders in progress
            </small>
          </div>

        </div>

        {/* DELIVERED */}

        <div className="customer-stat-card">

          <div className="customer-stat-icon">
            <FaCheckCircle />
          </div>

          <div>
            <span>
              Delivered
            </span>

            <h2>
              {deliveredOrders}
            </h2>

            <small>
              Completed orders
            </small>
          </div>

        </div>

        {/* TOTAL SPENT */}

        <div className="customer-stat-card">

          <div className="customer-stat-icon">
            <FaMoneyBillWave />
          </div>

          <div>
            <span>
              Total Spent
            </span>

            <h2>
              ₹
              {formatAmount(
                totalSpent
              )}
            </h2>

            <small>
              Successful payments
            </small>
          </div>

        </div>

      </section>

      {/* ========================================
          RECENT ORDERS
      ======================================== */}

      <section className="customer-orders-section">

        <div className="customer-section-header">

          <div>
            <h2>
              Recent Orders
            </h2>

            <p>
              Your latest dairy orders
            </p>
          </div>

          <button
            type="button"
            className="view-all-button"
            onClick={() =>
              navigate(
                "/customer/orders"
              )
            }
          >
            View All
          </button>

        </div>

        {recentOrders.length === 0 ? (
          <div className="customer-empty-orders">

            <div className="customer-empty-icon">
              <FaBox />
            </div>

            <h3>
              No Orders Yet
            </h3>

            <p>
              You haven't placed any
              dairy orders yet.
            </p>

            <button
              type="button"
              className="customer-order-button"
              onClick={() =>
                navigate(
                  "/customer/products"
                )
              }
            >
              <FaShoppingCart />

              Browse Products
            </button>

          </div>
        ) : (
          <div className="customer-orders-table-wrapper">

            <table className="customer-orders-table">

              <thead>
                <tr>
                  <th>
                    Order
                  </th>

                  <th>
                    Product
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>

                {recentOrders.map(
                  (order, index) => {

                    const orderId =
                      getOrderId(
                        order,
                        index
                      );

                    const product =
                      getProductName(
                        order
                      );

                    const quantity =
                      getQuantity(
                        order
                      );

                    const amount =
                      getOrderAmount(
                        order
                      );

                    const date =
                      order.createdAt ||
                      order.date ||
                      order.orderDate;

                    const status =
                      order.status ||
                      "Pending";

                    return (
                      <tr
                        key={String(
                          orderId
                        )}
                      >

                        <td>
                          <strong>
                            #{orderId}
                          </strong>
                        </td>

                        <td>
                          {product}
                        </td>

                        <td>
                          {quantity}
                        </td>

                        <td>
                          ₹
                          {formatAmount(
                            amount
                          )}
                        </td>

                        <td>
                          {formatDate(
                            date
                          )}
                        </td>

                        <td>
                          <span
                            className={`order-status ${getStatusClass(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* ========================================
          QUICK ACTIONS
      ======================================== */}

      <section className="customer-section">

        <div className="customer-section-header">

          <div>
            <h2>
              Quick Actions
            </h2>

            <p>
              Manage your customer account
            </p>
          </div>

        </div>

        <div className="customer-quick-actions">

          {/* PRODUCTS */}

          <button
            type="button"
            className="customer-action-card"
            onClick={() =>
              navigate(
                "/customer/products"
              )
            }
          >
            <div className="action-icon">
              <FaShoppingCart />
            </div>

            <strong>
              Browse Products
            </strong>

            <small>
              View available dairy
              products
            </small>

            <FaArrowRight />
          </button>

          {/* ORDERS */}

          <button
            type="button"
            className="customer-action-card"
            onClick={() =>
              navigate(
                "/customer/orders"
              )
            }
          >
            <div className="action-icon">
              <FaBox />
            </div>

            <strong>
              My Orders
            </strong>

            <small>
              Track your dairy orders
            </small>

            <FaArrowRight />
          </button>

          {/* PAYMENTS */}

          <button
            type="button"
            className="customer-action-card"
            onClick={() =>
              navigate(
                "/customer/payments"
              )
            }
          >
            <div className="action-icon">
              <FaMoneyBillWave />
            </div>

            <strong>
              Payments
            </strong>

            <small>
              View payment history
            </small>

            <FaArrowRight />
          </button>

          {/* PROFILE */}

          <button
            type="button"
            className="customer-action-card"
            onClick={() =>
              navigate(
                "/customer/profile"
              )
            }
          >
            <div className="action-icon">
              <FaUser />
            </div>

            <strong>
              My Profile
            </strong>

            <small>
              Update customer information
            </small>

            <FaArrowRight />
          </button>

        </div>

      </section>

      {/* ========================================
          PROFILE + DELIVERY
      ======================================== */}

      <div className="customer-bottom-grid">

        {/* PROFILE */}

        <section className="customer-profile-section">

          <div className="customer-section-header">

            <div>
              <h2>
                My Profile
              </h2>

              <p>
                Your customer information
              </p>
            </div>

          </div>

          <div className="customer-profile-card">

            <div className="customer-profile-avatar">
              <FaUser />
            </div>

            <div className="customer-profile-info">

              <strong>
                {profileName}
              </strong>

              <span>
                {profileEmail}
              </span>

              <span>
                {profilePhone}
              </span>

            </div>

            <button
              type="button"
              className="edit-profile-button"
              onClick={() =>
                navigate(
                  "/customer/profile"
                )
              }
            >
              Edit Profile
            </button>

          </div>

        </section>

        {/* DELIVERY */}

        <section className="customer-delivery-card">

          <div className="customer-delivery-icon">
            <FaTruck />
          </div>

          <div className="customer-delivery-content">

            <h2>
              Dairy Orders
            </h2>

            <p>
              Fresh dairy products
              delivered to your door.
            </p>

            <span>
              Order fresh milk,
              curd and other products
              anytime.
            </span>

          </div>

          <span className="customer-delivery-status">
            <FaCheckCircle />
            Available
          </span>

        </section>

      </div>

    </div>
  );
};

export default CustomerDashboard;