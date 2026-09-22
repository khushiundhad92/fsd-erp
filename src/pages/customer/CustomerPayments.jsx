import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaCreditCard,
  FaEye,
  FaExclamationTriangle,
  FaShoppingBag,
  FaArrowLeft,
  FaLock,
} from "react-icons/fa";

import {
  getCustomerPayments,
  createCustomerPayment,
} from "../../services/api";

import "./CustomerPayments.css";

const CustomerPayments = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Checkout order passed from Cart/My Orders
  const [checkoutOrder, setCheckoutOrder] = useState(
    location.state?.checkoutOrder || null
  );

  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  // History State
  const [payments, setPayments] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ==========================================================
     LOAD PAYMENTS HISTORY
  ========================================================== */

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCustomerPayments();
      setPayments(data.payments || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error("Payments Error:", err);
      setError(err.message || "Unable to load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  /* ==========================================================
     CONFIRM PAYMENT HANDLER
  ========================================================== */

  const handleConfirmPayment = async (e) => {
    e.preventDefault();

    if (!checkoutOrder) {
      alert("No active order selected for payment.");
      return;
    }

    const orderId = checkoutOrder._id || checkoutOrder.id;

    if (!orderId) {
      alert("Order ID is missing.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await createCustomerPayment({
        orderId,
        paymentMethod,
        notes,
      });

      if (res?.success) {
        setPaymentSuccess(res.payment);
        setCheckoutOrder(null);
        await loadPayments();
      } else {
        alert(res?.message || "Payment failed. Please try again.");
      }
    } catch (err) {
      console.error("Confirm Payment Error:", err);
      alert(err?.message || "Unable to process payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const viewDetails = (payment) => {
    alert(
      `Payment Details\n\n` +
        `Payment ID: ${payment.paymentId || payment._id || "-"}\n` +
        `Transaction ID: ${payment.transactionId || "-"}\n` +
        `Order ID / No: ${payment.orderNo || payment.orderId || "-"}\n` +
        `Amount: ₹${payment.amount || 0}\n` +
        `Method: ${payment.paymentMethod || payment.method || "-"}\n` +
        `Date: ${payment.date || payment.paymentDate || "-"}\n` +
        `Status: ${payment.status || "-"}`
    );
  };

  const filters = ["All", "Successful", "Pending", "Failed"];

  const filteredPayments =
    activeFilter === "All"
      ? payments
      : payments.filter((p) => p.status === activeFilter);

  const totalPaid = payments
    .filter((p) => p.status === "Successful")
    .reduce((total, p) => total + Number(p.amount || 0), 0);

  const pendingAmount = payments
    .filter((p) => p.status === "Pending")
    .reduce((total, p) => total + Number(p.amount || 0), 0);

  const successfulCount = payments.filter((p) => p.status === "Successful").length;
  const failedCount = payments.filter((p) => p.status === "Failed").length;

  return (
    <div className="customer-payments-page">
      {/* HEADER */}
      <div className="customer-payments-header">
        <div>
          <h1>Customer Payments</h1>
          <p>Complete checkout payments and view transaction history.</p>
        </div>

        <div className="customer-payment-wallet">
          <FaCreditCard />
          <div>
            <small>Payment History</small>
            <strong>{payments.length} Transactions</strong>
          </div>
        </div>
      </div>

      {/* SUCCESS BANNER */}
      {paymentSuccess && (
        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "25px",
            color: "#065f46",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            <FaCheckCircle style={{ fontSize: "24px", color: "#10b981" }} />
            <h2 style={{ margin: 0, fontSize: "20px" }}>Payment Successful!</h2>
          </div>
          <p style={{ margin: "0 0 10px 0" }}>
            Your payment of <strong>₹{paymentSuccess.amount}</strong> for Order #
            {paymentSuccess.orderNo || paymentSuccess.orderId} was completed successfully.
          </p>
          <small style={{ display: "block" }}>
            Transaction ID: <strong>{paymentSuccess.transactionId}</strong>
          </small>
          <button
            onClick={() => setPaymentSuccess(null)}
            style={{
              marginTop: "15px",
              background: "#10b981",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* CHECKOUT / PAYMENT FORM SECTION */}
      {checkoutOrder && (
        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "30px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              paddingBottom: "15px",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FaLock style={{ color: "#16834b", fontSize: "20px" }} />
              <h2 style={{ margin: 0, fontSize: "20px", color: "#1f2937" }}>
                Order Checkout Payment
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/customer/orders")}
              style={{
                background: "#f3f4f6",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: "600",
              }}
            >
              <FaArrowLeft /> Back to Orders
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "25px",
            }}
          >
            {/* ORDER SUMMARY */}
            <div
              style={{
                background: "#f8fafc",
                padding: "18px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
              }}
            >
              <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", color: "#334155" }}>
                Order Summary
              </h3>

              <div style={{ marginBottom: "10px", fontSize: "14px" }}>
                <strong>Order #: </strong>
                {checkoutOrder.orderNo || String(checkoutOrder._id).slice(-8)}
              </div>

              {checkoutOrder.items && checkoutOrder.items.length > 0 && (
                <div style={{ margin: "12px 0" }}>
                  <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
                    Items:
                  </span>
                  <ul style={{ paddingLeft: "18px", margin: "6px 0", fontSize: "13px" }}>
                    {checkoutOrder.items.map((item, i) => (
                      <li key={i}>
                        {item.productName} x {item.quantity} = ₹
                        {item.subtotal || item.price * item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div
                style={{
                  marginTop: "15px",
                  paddingTop: "12px",
                  borderTop: "1px dashed #cbd5e1",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b" }}>
                  Total Payable Amount:
                </span>
                <strong style={{ fontSize: "22px", color: "#16834b" }}>
                  ₹
                  {checkoutOrder.totalAmount ??
                    checkoutOrder.total ??
                    checkoutOrder.price ??
                    0}
                </strong>
              </div>
            </div>

            {/* PAYMENT METHOD SELECTION */}
            <form onSubmit={handleConfirmPayment}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", color: "#334155" }}>
                Select Payment Method
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "15px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    cursor: "pointer",
                    background: paymentMethod === "Cash on Delivery" ? "#ecfdf5" : "white",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={paymentMethod === "Cash on Delivery"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div>
                    <strong>Cash on Delivery (COD)</strong>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      Pay cash upon delivery of dairy products
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    cursor: "pointer",
                    background: paymentMethod === "UPI / Online Payment (Demo)" ? "#ecfdf5" : "white",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI / Online Payment (Demo)"
                    checked={paymentMethod === "UPI / Online Payment (Demo)"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div>
                    <strong>UPI / Online Demo Payment</strong>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      Instant secure demo digital payment
                    </div>
                  </div>
                </label>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "5px" }}>
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Leave at front door"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "#16834b",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {submitting ? "Processing Payment..." : "Pay Now & Confirm Order"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="customer-login-error">
          <FaExclamationTriangle />
          {error}
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="customer-payment-summary">
        <div className="customer-payment-summary-card">
          <div className="payment-summary-icon green">
            <FaMoneyBillWave />
          </div>
          <div>
            <span>Total Paid</span>
            <strong>₹{totalPaid}</strong>
          </div>
        </div>

        <div className="customer-payment-summary-card">
          <div className="payment-summary-icon blue">
            <FaCheckCircle />
          </div>
          <div>
            <span>Successful</span>
            <strong>{successfulCount}</strong>
          </div>
        </div>

        <div className="customer-payment-summary-card">
          <div className="payment-summary-icon orange">
            <FaClock />
          </div>
          <div>
            <span>Pending Amount</span>
            <strong>₹{pendingAmount}</strong>
          </div>
        </div>

        <div className="customer-payment-summary-card">
          <div className="payment-summary-icon red">
            <FaTimesCircle />
          </div>
          <div>
            <span>Failed</span>
            <strong>{failedCount}</strong>
          </div>
        </div>
      </div>

      {/* PAYMENT HISTORY TABLE */}
      <div className="customer-payment-container">
        <div className="customer-payment-container-header">
          <div>
            <h2>Payment History</h2>
            <p>Your recent payment transactions sorted newest first.</p>
          </div>

          <div className="customer-payment-count">
            {filteredPayments.length} Payments
          </div>
        </div>

        {/* FILTERS */}
        <div className="customer-payment-filters">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={
                activeFilter === filter
                  ? "payment-filter active"
                  : "payment-filter"
              }
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div className="customer-payment-table-wrapper">
          <table className="customer-payment-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Order No / ID</th>
                <th>Date</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px" }}>
                    Loading payments...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px" }}>
                    No payment history found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment, index) => {
                  const paymentId =
                    payment.paymentId || payment._id || `PAY-${index + 1}`;
                  const status = payment.status || "Completed";

                  return (
                    <tr key={paymentId}>
                      <td>
                        <div className="payment-id">
                          <div className="payment-method-icon">
                            <FaCreditCard />
                          </div>
                          <div>
                            <strong>{paymentId}</strong>
                            <span>{payment.transactionId || "-"}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="payment-order-id">
                          {payment.orderNo || payment.orderId || "-"}
                        </span>
                      </td>

                      <td>
                        <span className="payment-date">
                          {payment.date || payment.paymentDate || "-"}
                        </span>
                      </td>

                      <td>
                        <span className="payment-method">
                          {payment.paymentMethod || payment.method || "-"}
                        </span>
                      </td>

                      <td>
                        <strong className="payment-amount">
                          ₹{payment.amount || 0}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`payment-status ${status
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="payment-view-button"
                          onClick={() => viewDetails(payment)}
                        >
                          <FaEye />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerPayments;