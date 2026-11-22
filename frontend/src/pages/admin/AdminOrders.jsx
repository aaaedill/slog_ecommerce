import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config/api";

/* ─────────────────────────────────────────────────────────────
   STATUS STYLES (black / red / white theme)
───────────────────────────────────────────────────────────── */

const STATUS_STYLES = {
  "Order Placed": {
    background: "rgba(255, 255, 255, 0.06)",
    color: "rgba(255, 255, 255, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.22)"
  },

  Processing: {
    background: "rgba(255, 154, 164, 0.08)",
    color: "#ffb3bb",
    border: "1px solid rgba(255, 154, 164, 0.3)"
  },

  Packing: {
    background: "rgba(255, 120, 132, 0.1)",
    color: "#ff9aa4",
    border: "1px solid rgba(255, 120, 132, 0.35)"
  },

  Shipped: {
    background: "rgba(255, 85, 100, 0.12)",
    color: "#ff7784",
    border: "1px solid rgba(255, 85, 100, 0.4)"
  },

  "Out for delivery": {
    background: "rgba(255, 45, 63, 0.14)",
    color: "#ff5563",
    border: "1px solid rgba(255, 45, 63, 0.5)"
  },

  Delivered: {
    background: "rgba(255, 255, 255, 0.1)",
    color: "#ffffff",
    border: "1px solid rgba(255, 255, 255, 0.45)"
  },

  Cancelled: {
    background: "rgba(255, 45, 63, 0.22)",
    color: "#ffffff",
    border: "1px solid rgba(255, 45, 63, 0.6)"
  }
};

const getStatusStyle = (status) => {
  return (
    STATUS_STYLES[status] ||
    STATUS_STYLES["Order Placed"]
  );
};

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const formatCurrency = (amount) => {
  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount)) {
    return "₹0";
  }

  return `₹${numericAmount.toLocaleString("en-IN")}`;
};

/* ─────────────────────────────────────────────────────────────
   SHARED STYLES (visual only)
───────────────────────────────────────────────────────────── */

const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

  .ad-root {
    --ad-red:        #ff2d3f;
    --ad-line:       rgba(255, 45, 63, 0.22);
    --ad-line-hover: rgba(255, 45, 63, 0.6);
    --ad-white:      #ffffff;
    --ad-white-soft: rgba(255, 255, 255, 0.7);

    position: relative;
    overflow: hidden;
    background: #000000;
    color: var(--ad-white);
    font-family: 'Manrope', 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Entrance ── */
  .ad-rise {
    opacity: 0;
    animation: ad-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  @keyframes ad-rise {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Heading ── */
  .ad-overline {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    color: var(--ad-red);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }

  .ad-overline::before {
    content: '';
    width: 28px;
    height: 2px;
    background: var(--ad-red);
  }

  .ad-title {
    color: var(--ad-white);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.05;
    font-size: clamp(2.2rem, 4vw, 3rem);
  }

  .ad-subtitle {
    margin-top: 0.75rem;
    color: var(--ad-white-soft);
    font-size: 0.95rem;
    font-weight: 500;
  }

  .ad-title-bar {
    margin-top: 1rem;
    height: 2px;
    width: 84px;
    border-radius: 2px;
    background: var(--ad-red);
    transform-origin: left center;
    animation: ad-draw 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
  }

  @keyframes ad-draw {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  /* ── Panel ── */
  .ad-panel {
    position: relative;
    background: transparent;
    border: 1px solid var(--ad-line);
    border-radius: 16px;
    transition: border-color 0.3s ease;
  }

  .ad-panel:hover {
    border-color: var(--ad-line-hover);
  }

  .ad-panel-title {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    color: var(--ad-white);
    font-weight: 700;
    letter-spacing: -0.015em;
    font-size: clamp(1.05rem, 1.4vw, 1.25rem);
  }

  .ad-panel-title::before {
    content: '';
    width: 3px;
    height: 1.1em;
    border-radius: 2px;
    background: var(--ad-red);
  }

  .ad-pill {
    color: #ffffff;
    background: var(--ad-red);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.03em;
  }

  /* ── Table ── */
  .ad-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1000px;
  }

  .ad-th {
    padding: 1.1rem 1.25rem;
    text-align: left;
    color: var(--ad-white-soft);
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .ad-thead-row {
    border-bottom: 1px solid var(--ad-line);
  }

  .ad-td {
    padding: 1.15rem 1.25rem;
    vertical-align: top;
  }

  .ad-row {
    position: relative;
    background: transparent;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    transition: background 0.25s ease;
  }

  .ad-row:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .ad-row:last-child { border-bottom: none; }

  .ad-row td:first-child {
    box-shadow: inset 0 0 0 0 var(--ad-red);
    transition: box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .ad-row:hover td:first-child {
    box-shadow: inset 3px 0 0 0 var(--ad-red);
  }

  .ad-cell-id {
    color: var(--ad-white);
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.92rem;
    font-weight: 600;
  }

  .ad-cell-date {
    margin-top: 0.35rem;
    color: var(--ad-white-soft);
    font-size: 0.8rem;
    font-weight: 500;
  }

  .ad-cell-text {
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.88rem;
    font-weight: 500;
    line-height: 1.5;
  }

  .ad-cell-amount {
    color: var(--ad-white);
    font-size: 0.98rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  .ad-muted {
    color: var(--ad-white-soft);
    font-size: 0.8rem;
    font-weight: 500;
  }

  .ad-label {
    color: var(--ad-white-soft);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 0.25rem;
  }

  /* ── Status badge ── */
  .ad-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.3rem 0.8rem;
    border-radius: 999px;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    white-space: nowrap;
  }

  .ad-badge-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
  }

  /* ── Select ── */
  .ad-select {
    appearance: none;
    -webkit-appearance: none;
    font-family: inherit;
    font-size: 0.82rem;
    font-weight: 600;
    color: #ffffff;
    background-color: #000000;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ff2d3f' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    border: 1px solid var(--ad-line);
    border-radius: 10px;
    padding: 0.55rem 2rem 0.55rem 0.8rem;
    outline: none;
    transition: border-color 0.25s ease, box-shadow 0.25s ease;
  }

  .ad-select:hover:not(:disabled) {
    border-color: var(--ad-line-hover);
  }

  .ad-select:focus-visible {
    border-color: var(--ad-red);
    box-shadow: 0 0 0 3px rgba(255, 45, 63, 0.25);
  }

  .ad-select option {
    background: #000000;
    color: #ffffff;
  }

  /* ── Buttons ── */
  .ad-btn {
    font-family: inherit;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    padding: 0.55rem 1.1rem;
    border-radius: 10px;
    background: transparent;
    white-space: nowrap;
    transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  }

  .ad-btn--cancel {
    color: #ff2d3f;
    border: 1px solid rgba(255, 45, 63, 0.6);
  }

  .ad-btn--cancel:hover:not(:disabled) {
    background: #ff2d3f;
    color: #ffffff;
    border-color: #ff2d3f;
    box-shadow: 0 0 18px rgba(255, 45, 63, 0.4);
  }

  .ad-btn--ghost {
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.4);
  }

  .ad-btn--ghost:hover:not(:disabled) {
    background: #ffffff;
    color: #000000;
    border-color: #ffffff;
  }

  .ad-btn:focus-visible {
    outline: 2px solid #ffffff;
    outline-offset: 2px;
  }

  /* ── Alerts ── */
  .ad-alert {
    margin-bottom: 1.1rem;
    padding: 0.85rem 1.1rem;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 600;
    animation: ad-rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .ad-alert--success {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .ad-alert--error {
    color: #ffffff;
    background: rgba(255, 45, 63, 0.16);
    border: 1px solid rgba(255, 45, 63, 0.6);
  }

  /* ── Empty / loading ── */
  .ad-empty-title {
    color: var(--ad-white);
    font-size: 1.25rem;
    font-weight: 700;
  }

  .ad-empty-text {
    color: var(--ad-white-soft);
    font-size: 0.92rem;
    font-weight: 500;
  }

  .ad-loader {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 2px solid var(--ad-line);
    border-top-color: var(--ad-red);
    animation: ad-spin 0.8s linear infinite;
  }

  @keyframes ad-spin {
    to { transform: rotate(360deg); }
  }

  /* ── Mobile card ── */
  .ad-card-id {
    color: var(--ad-white);
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.95rem;
    font-weight: 600;
  }

  /* ── Responsive switch ── */
  @media (max-width: 900px) {
    .admin-orders-desktop { display: none !important; }
    .admin-orders-mobile  { display: block !important; }
  }

  @media (min-width: 901px) {
    .admin-orders-mobile  { display: none !important; }
    .admin-orders-desktop { display: block !important; }
  }

  /* ── Scrollbar (table overflow) ── */
  .admin-orders-desktop::-webkit-scrollbar { height: 6px; }
  .admin-orders-desktop::-webkit-scrollbar-thumb {
    background: var(--ad-line-hover);
    border-radius: 6px;
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .ad-rise,
    .ad-title-bar,
    .ad-alert {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }

    .ad-loader { animation-duration: 2s; }

    .ad-row,
    .ad-row td:first-child,
    .ad-btn,
    .ad-select,
    .ad-panel {
      transition: none !important;
    }
  }
`;

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* ─────────────────────────────────────────────────────────
     LOAD ORDERS
  ───────────────────────────────────────────────────────── */

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${API_URL}/admin/orders`,
        {
          withCredentials: true
        }
      );

      const rawOrders = Array.isArray(res.data?.orders)
        ? res.data.orders
        : [];

      const data = [...rawOrders].map((order) => ({
        ...order,

        /*
          Backend returns:
          id      -> MongoDB _id
          orderId -> customer-facing order ID

          Keep both available.
        */
        id: order.id ?? order._id ?? order.orderId,

        total:
          order.total ??
          order.amount ??
          0
      }));

      setOrders(data);
    } catch (err) {
      console.error("Failed to load admin orders:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* ─────────────────────────────────────────────────────────
     INITIAL LOAD
  ───────────────────────────────────────────────────────── */

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* ─────────────────────────────────────────────────────────
     CLEAR SUCCESS MESSAGE
  ───────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  /* ─────────────────────────────────────────────────────────
     UPDATE ORDER STATUS
  ───────────────────────────────────────────────────────── */

  const handleStatusChange = async (orderId, status) => {
    if (!orderId || !status) {
      return;
    }

    /*
      Do not allow an already-cancelled order to be changed.
      Cancelled is a final state from the admin UI.
    */
    const currentOrder = orders.find(
      (order) => String(order.id) === String(orderId)
    );

    if (currentOrder?.status === "Cancelled") {
      return;
    }

    try {
      setUpdatingOrderId(orderId);
      setError("");
      setSuccessMessage("");

      await axios.patch(
        `${API_URL}/admin/orders/${encodeURIComponent(
          orderId
        )}/status`,
        {
          status
        },
        {
          withCredentials: true
        }
      );

      /*
        Update the order locally instead of making
        another request to the backend.
      */
      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          String(order.id) === String(orderId)
            ? {
                ...order,
                status
              }
            : order
        )
      );

      setSuccessMessage(
        "Order status updated successfully."
      );
    } catch (err) {
      console.error(
        "Failed to update order status:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update order status."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  /* ─────────────────────────────────────────────────────────
     CANCEL ORDER
  ───────────────────────────────────────────────────────── */

  const handleCancelOrder = async (orderId) => {
    if (!orderId) {
      return;
    }

    const order = orders.find(
      (item) => String(item.id) === String(orderId)
    );

    /*
      Prevent cancelling an order that is already cancelled.
    */
    if (order?.status === "Cancelled") {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingOrderId(orderId);
      setError("");
      setSuccessMessage("");

      await axios.delete(
        `${API_URL}/admin/orders/${encodeURIComponent(
          orderId
        )}`,
        {
          withCredentials: true
        }
      );

      /*
        IMPORTANT:
        Do NOT remove the order from the list.

        The backend marks the order as:
        "Cancelled"

        Keeping it visible lets the admin see
        the complete order history.
      */
      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          String(order.id) === String(orderId)
            ? {
                ...order,
                status: "Cancelled"
              }
            : order
        )
      );

      setSuccessMessage(
        "Order cancelled successfully."
      );
    } catch (err) {
      console.error(
        "Failed to cancel order:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to cancel order."
      );
    } finally {
      setCancellingOrderId(null);
    }
  };

  /* ─────────────────────────────────────────────────────────
     LOADING STATE
  ───────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="ad-root min-h-screen flex items-center justify-center p-8">
        <style>{THEME_CSS}</style>

        <div className="flex flex-col items-center gap-4 ad-rise">
          <div className="ad-loader" />

          <p className="ad-empty-text">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────── */

  return (
    <div className="ad-root min-h-screen flex justify-center items-start p-3 sm:p-5 md:p-8 pb-20">
      <style>{THEME_CSS}</style>

      <div className="w-full max-w-7xl relative p-2 sm:p-4 md:p-6">
        {/* ───────────────────────────────────────────────────
            HEADER
        ─────────────────────────────────────────────────── */}

        <div className="mb-8 sm:mb-10 relative ad-rise flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="ad-overline">Management</p>

            <h1 className="ad-title">Orders</h1>

            <p className="ad-subtitle">
              Manage and track customer orders
            </p>

            <div className="ad-title-bar" />
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="ad-btn ad-btn--ghost"
            style={{
              cursor: loading
                ? "not-allowed"
                : "pointer",
              opacity: loading ? 0.6 : 1
            }}
          >
            Refresh
          </button>
        </div>

        {/* ───────────────────────────────────────────────────
            SUCCESS MESSAGE
        ─────────────────────────────────────────────────── */}

        {successMessage && (
          <div className="ad-alert ad-alert--success">
            {successMessage}
          </div>
        )}

        {/* ───────────────────────────────────────────────────
            ERROR MESSAGE
        ─────────────────────────────────────────────────── */}

        {error && (
          <div className="ad-alert ad-alert--error">
            {error}
          </div>
        )}

        {/* ───────────────────────────────────────────────────
            EMPTY STATE
        ─────────────────────────────────────────────────── */}

        {orders.length === 0 ? (
          <div
            className="ad-panel ad-rise rounded-xl text-center"
            style={{
              padding: "60px 24px",
              animationDelay: "0.15s"
            }}
          >
            <div
              style={{
                fontSize: "42px",
                marginBottom: "14px"
              }}
            >
              📦
            </div>

            <h2 className="ad-empty-title">
              No orders found
            </h2>

            <p className="ad-empty-text mt-2">
              Customer orders will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* ───────────────────────────────────────────────
                MOBILE ORDER CARDS
            ─────────────────────────────────────────────── */}

            <div
              className="admin-orders-mobile"
              style={{
                display: "none"
              }}
            >
              {orders.map((order, i) => {
                const statusStyle =
                  getStatusStyle(order.status);

                const isCancelled =
                  order.status ===
                  "Cancelled";

                const isUpdating =
                  String(
                    updatingOrderId
                  ) === String(order.id);

                const isCancelling =
                  String(
                    cancellingOrderId
                  ) === String(order.id);

                return (
                  <div
                    key={order.id}
                    className="ad-panel ad-rise rounded-xl"
                    style={{
                      marginBottom: "16px",
                      padding: "18px",
                      animationDelay: `${Math.min(i, 8) * 0.05}s`
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap: "12px",
                        marginBottom: "15px"
                      }}
                    >
                      <div>
                        <div className="ad-card-id">
                          #
                          {order.orderId ||
                            order.id}
                        </div>

                        <div className="ad-cell-date">
                          {formatDate(
                            order.createdAt ||
                              order.date
                          )}
                        </div>
                      </div>

                      <span
                        className="ad-badge"
                        style={{
                          background:
                            statusStyle.background,
                          color:
                            statusStyle.color,
                          border:
                            statusStyle.border
                        }}
                      >
                        <span className="ad-badge-dot" />

                        {order.status ||
                          "Order Placed"}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: "12px",
                        marginBottom: "16px"
                      }}
                    >
                      <div>
                        <div className="ad-label">
                          Items
                        </div>

                        <div className="ad-cell-text">
                          {Array.isArray(
                            order.items
                          )
                            ? order.items
                                .map(
                                  (item) =>
                                    `${item.name} × ${item.quantity}`
                                )
                                .join(
                                  ", "
                                )
                            : "—"}
                        </div>
                      </div>

                      <div>
                        <div className="ad-label">
                          Payment
                        </div>

                        <div className="ad-cell-text">
                          {order.paymentMethod ||
                            "—"}
                        </div>
                      </div>

                      <div>
                        <div className="ad-label">
                          Total
                        </div>

                        <div className="ad-cell-amount">
                          {formatCurrency(
                            order.total
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "9px",
                        flexWrap:
                          "wrap"
                      }}
                    >
                      <select
                        className="ad-select"
                        value={
                          order.status ||
                          "Order Placed"
                        }
                        disabled={
                          isCancelled ||
                          isUpdating ||
                          isCancelling
                        }
                        onChange={(event) =>
                          handleStatusChange(
                            order.id,
                            event.target
                              .value
                          )
                        }
                        style={{
                          flex: "1 1 180px",
                          minWidth: 0,
                          cursor:
                            isCancelled ||
                            isUpdating
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            isCancelled ||
                            isUpdating
                              ? 0.6
                              : 1
                        }}
                      >
                        <option value="Order Placed">
                          Order Placed
                        </option>

                        <option value="Processing">
                          Processing
                        </option>

                        <option value="Packing">
                          Packing
                        </option>

                        <option value="Shipped">
                          Shipped
                        </option>

                        <option value="Out for delivery">
                          Out for delivery
                        </option>

                        <option value="Delivered">
                          Delivered
                        </option>

                        <option value="Cancelled">
                          Cancelled
                        </option>
                      </select>

                      <button
                        type="button"
                        className="ad-btn ad-btn--cancel"
                        onClick={() =>
                          handleCancelOrder(
                            order.id
                          )
                        }
                        disabled={
                          isCancelled ||
                          isCancelling ||
                          isUpdating
                        }
                        style={{
                          cursor:
                            isCancelled ||
                            isCancelling ||
                            isUpdating
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            isCancelled ||
                            isCancelling
                              ? 0.45
                              : 1
                        }}
                      >
                        {isCancelling
                          ? "Cancelling..."
                          : isCancelled
                          ? "Cancelled"
                          : "Cancel"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ───────────────────────────────────────────────
                DESKTOP TABLE
            ─────────────────────────────────────────────── */}

            <div
              className="admin-orders-desktop ad-panel ad-rise rounded-xl"
              style={{
                overflowX: "auto",
                animationDelay: "0.15s"
              }}
            >
              <table className="ad-table">
                <thead>
                  <tr className="ad-thead-row">
                    <th className="ad-th">Order</th>

                    <th className="ad-th">Items</th>

                    <th className="ad-th">Payment</th>

                    <th className="ad-th">Total</th>

                    <th className="ad-th">Status</th>

                    <th className="ad-th">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => {
                    const statusStyle =
                      getStatusStyle(
                        order.status
                      );

                    const isCancelled =
                      order.status ===
                      "Cancelled";

                    const isUpdating =
                      String(
                        updatingOrderId
                      ) ===
                      String(order.id);

                    const isCancelling =
                      String(
                        cancellingOrderId
                      ) ===
                      String(order.id);

                    return (
                      <tr
                        key={order.id}
                        className="ad-row"
                      >
                        {/* ORDER */}
                        <td className="ad-td">
                          <div className="ad-cell-id">
                            #
                            {order.orderId ||
                              order.id}
                          </div>

                          <div className="ad-cell-date">
                            {formatDate(
                              order.createdAt ||
                                order.date
                            )}
                          </div>
                        </td>

                        {/* ITEMS */}
                        <td
                          className="ad-td"
                          style={{
                            maxWidth:
                              "330px"
                          }}
                        >
                          {Array.isArray(
                            order.items
                          ) &&
                          order.items.length >
                            0 ? (
                            <div
                              style={{
                                display:
                                  "flex",
                                flexDirection:
                                  "column",
                                gap:
                                  "5px"
                              }}
                            >
                              {order.items.map(
                                (
                                  item,
                                  index
                                ) => (
                                  <div
                                    key={`${order.id}-${item.productId}-${index}`}
                                    className="ad-cell-text"
                                  >
                                    {item.name ||
                                      "Product"}{" "}
                                    ×{" "}
                                    {item.quantity ||
                                      1}

                                    {item.size
                                      ? ` • Size ${item.size}`
                                      : ""}
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <span className="ad-muted">
                              —
                            </span>
                          )}
                        </td>

                        {/* PAYMENT */}
                        <td className="ad-td">
                          <span className="ad-cell-text">
                            {order.paymentMethod ||
                              "—"}
                          </span>
                        </td>

                        {/* TOTAL */}
                        <td className="ad-td">
                          <span className="ad-cell-amount">
                            {formatCurrency(
                              order.total
                            )}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="ad-td">
                          <div
                            style={{
                              display:
                                "flex",
                              flexDirection:
                                "column",
                              alignItems:
                                "flex-start",
                              gap:
                                "8px"
                            }}
                          >
                            <span
                              className="ad-badge"
                              style={{
                                background:
                                  statusStyle.background,
                                color:
                                  statusStyle.color,
                                border:
                                  statusStyle.border
                              }}
                            >
                              <span className="ad-badge-dot" />

                              {order.status ||
                                "Order Placed"}
                            </span>

                            <select
                              className="ad-select"
                              value={
                                order.status ||
                                "Order Placed"
                              }
                              disabled={
                                isCancelled ||
                                isUpdating ||
                                isCancelling
                              }
                              onChange={(
                                event
                              ) =>
                                handleStatusChange(
                                  order.id,
                                  event
                                    .target
                                    .value
                                )
                              }
                              style={{
                                width:
                                  "170px",
                                cursor:
                                  isCancelled ||
                                  isUpdating
                                    ? "not-allowed"
                                    : "pointer",
                                opacity:
                                  isCancelled ||
                                  isUpdating
                                    ? 0.55
                                    : 1
                              }}
                            >
                              <option value="Order Placed">
                                Order Placed
                              </option>

                              <option value="Processing">
                                Processing
                              </option>

                              <option value="Packing">
                                Packing
                              </option>

                              <option value="Shipped">
                                Shipped
                              </option>

                              <option value="Out for delivery">
                                Out for delivery
                              </option>

                              <option value="Delivered">
                                Delivered
                              </option>

                              <option value="Cancelled">
                                Cancelled
                              </option>
                            </select>

                            {isUpdating && (
                              <span className="ad-muted">
                                Updating...
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ACTION */}
                        <td className="ad-td">
                          <button
                            type="button"
                            className="ad-btn ad-btn--cancel"
                            onClick={() =>
                              handleCancelOrder(
                                order.id
                              )
                            }
                            disabled={
                              isCancelled ||
                              isCancelling ||
                              isUpdating
                            }
                            style={{
                              cursor:
                                isCancelled ||
                                isCancelling ||
                                isUpdating
                                  ? "not-allowed"
                                  : "pointer",
                              opacity:
                                isCancelled ||
                                isCancelling
                                  ? 0.45
                                  : 1
                            }}
                          >
                            {isCancelling
                              ? "Cancelling..."
                              : isCancelled
                              ? "Cancelled"
                              : "Cancel"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;