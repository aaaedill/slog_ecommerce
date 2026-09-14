import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config/api";

/* ─────────────────────────────────────────────────────────────
   STATUS STYLES
───────────────────────────────────────────────────────────── */

const STATUS_STYLES = {
  "Order Placed": {
    background: "rgba(59, 130, 246, 0.14)",
    color: "#60a5fa",
    border: "1px solid rgba(59, 130, 246, 0.28)"
  },

  Processing: {
    background: "rgba(168, 85, 247, 0.14)",
    color: "#c084fc",
    border: "1px solid rgba(168, 85, 247, 0.28)"
  },

  Packing: {
    background: "rgba(234, 179, 8, 0.14)",
    color: "#facc15",
    border: "1px solid rgba(234, 179, 8, 0.28)"
  },

  Shipped: {
    background: "rgba(14, 165, 233, 0.14)",
    color: "#38bdf8",
    border: "1px solid rgba(14, 165, 233, 0.28)"
  },

  "Out for delivery": {
    background: "rgba(249, 115, 22, 0.14)",
    color: "#fb923c",
    border: "1px solid rgba(249, 115, 22, 0.28)"
  },

  Delivered: {
    background: "rgba(34, 197, 94, 0.14)",
    color: "#4ade80",
    border: "1px solid rgba(34, 197, 94, 0.28)"
  },

  Cancelled: {
    background: "rgba(239, 68, 68, 0.14)",
    color: "#f87171",
    border: "1px solid rgba(239, 68, 68, 0.28)"
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
      <div
        style={{
          minHeight: "100vh",
          padding: "32px",
          background:
            "linear-gradient(135deg, #050b18 0%, #071426 50%, #020617 100%)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div
          style={{
            padding: "24px 32px",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            color: "#cbd5e1",
            fontSize: "15px"
          }}
        >
          Loading orders...
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────── */

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        background:
          "linear-gradient(135deg, #050b18 0%, #071426 50%, #020617 100%)",
        color: "#ffffff"
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto"
        }}
      >
        {/* ───────────────────────────────────────────────────
            HEADER
        ─────────────────────────────────────────────────── */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "28px",
            flexWrap: "wrap"
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "30px",
                fontWeight: 700,
                letterSpacing: "-0.5px"
              }}
            >
              Orders
            </h1>

            <p
              style={{
                margin: "7px 0 0",
                color: "#94a3b8",
                fontSize: "14px"
              }}
            >
              Manage and track customer orders
            </p>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              background:
                "rgba(255,255,255,0.06)",
              color: "#e2e8f0",
              padding: "10px 16px",
              borderRadius: "10px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontSize: "14px",
              fontWeight: 500,
              transition:
                "all 0.2s ease",
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
          <div
            style={{
              marginBottom: "18px",
              padding: "13px 16px",
              borderRadius: "12px",
              background:
                "rgba(34,197,94,0.10)",
              border:
                "1px solid rgba(34,197,94,0.24)",
              color: "#86efac",
              fontSize: "14px"
            }}
          >
            {successMessage}
          </div>
        )}

        {/* ───────────────────────────────────────────────────
            ERROR MESSAGE
        ─────────────────────────────────────────────────── */}

        {error && (
          <div
            style={{
              marginBottom: "18px",
              padding: "13px 16px",
              borderRadius: "12px",
              background:
                "rgba(239,68,68,0.10)",
              border:
                "1px solid rgba(239,68,68,0.24)",
              color: "#fca5a5",
              fontSize: "14px"
            }}
          >
            {error}
          </div>
        )}

        {/* ───────────────────────────────────────────────────
            EMPTY STATE
        ─────────────────────────────────────────────────── */}

        {orders.length === 0 ? (
          <div
            style={{
              padding: "60px 24px",
              borderRadius: "20px",
              background:
                "rgba(255,255,255,0.045)",
              border:
                "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter:
                "blur(18px)",
              textAlign: "center"
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

            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 600
              }}
            >
              No orders found
            </h2>

            <p
              style={{
                margin:
                  "8px 0 0",
                color: "#94a3b8",
                fontSize: "14px"
              }}
            >
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
              {orders.map((order) => {
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
                    style={{
                      marginBottom: "16px",
                      padding: "18px",
                      borderRadius: "18px",
                      background:
                        "rgba(255,255,255,0.045)",
                      border:
                        "1px solid rgba(255,255,255,0.08)",
                      backdropFilter:
                        "blur(18px)",
                      WebkitBackdropFilter:
                        "blur(18px)"
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
                        <div
                          style={{
                            color: "#f8fafc",
                            fontWeight: 600,
                            fontSize: "15px"
                          }}
                        >
                          #
                          {order.orderId ||
                            order.id}
                        </div>

                        <div
                          style={{
                            marginTop: "5px",
                            color: "#64748b",
                            fontSize: "12px"
                          }}
                        >
                          {formatDate(
                            order.createdAt ||
                              order.date
                          )}
                        </div>
                      </div>

                      <span
                        style={{
                          display:
                            "inline-flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          padding:
                            "6px 10px",
                          borderRadius:
                            "999px",
                          background:
                            statusStyle.background,
                          color:
                            statusStyle.color,
                          border:
                            statusStyle.border,
                          fontSize:
                            "11px",
                          fontWeight: 600,
                          whiteSpace:
                            "nowrap"
                        }}
                      >
                        {order.status ||
                          "Order Placed"}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: "10px",
                        marginBottom: "16px"
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color:
                              "#64748b",
                            fontSize:
                              "11px",
                            marginBottom:
                              "3px"
                          }}
                        >
                          Items
                        </div>

                        <div
                          style={{
                            color:
                              "#cbd5e1",
                            fontSize:
                              "13px"
                          }}
                        >
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
                        <div
                          style={{
                            color:
                              "#64748b",
                            fontSize:
                              "11px",
                            marginBottom:
                              "3px"
                          }}
                        >
                          Payment
                        </div>

                        <div
                          style={{
                            color:
                              "#cbd5e1",
                            fontSize:
                              "13px"
                          }}
                        >
                          {order.paymentMethod ||
                            "—"}
                        </div>
                      </div>

                      <div>
                        <div
                          style={{
                            color:
                              "#64748b",
                            fontSize:
                              "11px",
                            marginBottom:
                              "3px"
                          }}
                        >
                          Total
                        </div>

                        <div
                          style={{
                            color:
                              "#ffffff",
                            fontSize:
                              "15px",
                            fontWeight:
                              600
                          }}
                        >
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
                          padding:
                            "10px 12px",
                          borderRadius:
                            "10px",
                          border:
                            "1px solid rgba(255,255,255,0.12)",
                          background:
                            "#0b1526",
                          color:
                            "#e2e8f0",
                          fontSize:
                            "13px",
                          outline:
                            "none",
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
                          padding:
                            "10px 14px",
                          borderRadius:
                            "10px",
                          border:
                            "1px solid rgba(239,68,68,0.24)",
                          background:
                            "rgba(239,68,68,0.08)",
                          color:
                            "#f87171",
                          fontSize:
                            "13px",
                          fontWeight:
                            500,
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
              className="admin-orders-desktop"
              style={{
                borderRadius: "20px",
                background:
                  "rgba(255,255,255,0.045)",
                border:
                  "1px solid rgba(255,255,255,0.08)",
                backdropFilter:
                  "blur(18px)",
                WebkitBackdropFilter:
                  "blur(18px)",
                overflowX: "auto"
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse",
                  minWidth:
                    "1000px"
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom:
                        "1px solid rgba(255,255,255,0.08)"
                    }}
                  >
                    <th
                      style={{
                        padding:
                          "17px 18px",
                        textAlign:
                          "left",
                        color:
                          "#94a3b8",
                        fontSize:
                          "11px",
                        fontWeight:
                          600,
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.7px"
                      }}
                    >
                      Order
                    </th>

                    <th
                      style={{
                        padding:
                          "17px 18px",
                        textAlign:
                          "left",
                        color:
                          "#94a3b8",
                        fontSize:
                          "11px",
                        fontWeight:
                          600,
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.7px"
                      }}
                    >
                      Items
                    </th>

                    <th
                      style={{
                        padding:
                          "17px 18px",
                        textAlign:
                          "left",
                        color:
                          "#94a3b8",
                        fontSize:
                          "11px",
                        fontWeight:
                          600,
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.7px"
                      }}
                    >
                      Payment
                    </th>

                    <th
                      style={{
                        padding:
                          "17px 18px",
                        textAlign:
                          "left",
                        color:
                          "#94a3b8",
                        fontSize:
                          "11px",
                        fontWeight:
                          600,
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.7px"
                      }}
                    >
                      Total
                    </th>

                    <th
                      style={{
                        padding:
                          "17px 18px",
                        textAlign:
                          "left",
                        color:
                          "#94a3b8",
                        fontSize:
                          "11px",
                        fontWeight:
                          600,
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.7px"
                      }}
                    >
                      Status
                    </th>

                    <th
                      style={{
                        padding:
                          "17px 18px",
                        textAlign:
                          "left",
                        color:
                          "#94a3b8",
                        fontSize:
                          "11px",
                        fontWeight:
                          600,
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.7px"
                      }}
                    >
                      Action
                    </th>
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
                        style={{
                          borderBottom:
                            "1px solid rgba(255,255,255,0.055)"
                        }}
                      >
                        {/* ORDER */}
                        <td
                          style={{
                            padding:
                              "18px",
                            verticalAlign:
                              "top"
                          }}
                        >
                          <div
                            style={{
                              color:
                                "#f8fafc",
                              fontWeight:
                                600,
                              fontSize:
                                "14px"
                            }}
                          >
                            #
                            {order.orderId ||
                              order.id}
                          </div>

                          <div
                            style={{
                              marginTop:
                                "5px",
                              color:
                                "#64748b",
                              fontSize:
                                "12px"
                            }}
                          >
                            {formatDate(
                              order.createdAt ||
                                order.date
                            )}
                          </div>
                        </td>

                        {/* ITEMS */}
                        <td
                          style={{
                            padding:
                              "18px",
                            verticalAlign:
                              "top",
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
                                    style={{
                                      color:
                                        "#cbd5e1",
                                      fontSize:
                                        "13px",
                                      lineHeight:
                                        1.45
                                    }}
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
                            <span
                              style={{
                                color:
                                  "#64748b",
                                fontSize:
                                  "13px"
                              }}
                            >
                              —
                            </span>
                          )}
                        </td>

                        {/* PAYMENT */}
                        <td
                          style={{
                            padding:
                              "18px",
                            verticalAlign:
                              "top"
                          }}
                        >
                          <span
                            style={{
                              color:
                                "#cbd5e1",
                              fontSize:
                                "13px"
                            }}
                          >
                            {order.paymentMethod ||
                              "—"}
                          </span>
                        </td>

                        {/* TOTAL */}
                        <td
                          style={{
                            padding:
                              "18px",
                            verticalAlign:
                              "top"
                          }}
                        >
                          <span
                            style={{
                              color:
                                "#ffffff",
                              fontSize:
                                "14px",
                              fontWeight:
                                600
                            }}
                          >
                            {formatCurrency(
                              order.total
                            )}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td
                          style={{
                            padding:
                              "18px",
                            verticalAlign:
                              "top"
                          }}
                        >
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
                              style={{
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                padding:
                                  "6px 10px",
                                borderRadius:
                                  "999px",
                                background:
                                  statusStyle.background,
                                color:
                                  statusStyle.color,
                                border:
                                  statusStyle.border,
                                fontSize:
                                  "11px",
                                fontWeight:
                                  600,
                                whiteSpace:
                                  "nowrap"
                              }}
                            >
                              {order.status ||
                                "Order Placed"}
                            </span>

                            <select
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
                                padding:
                                  "8px 10px",
                                border:
                                  "1px solid rgba(255,255,255,0.12)",
                                borderRadius:
                                  "9px",
                                background:
                                  "#0b1526",
                                color:
                                  "#e2e8f0",
                                fontSize:
                                  "12px",
                                outline:
                                  "none",
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
                              <span
                                style={{
                                  color:
                                    "#64748b",
                                  fontSize:
                                    "11px"
                                }}
                              >
                                Updating...
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ACTION */}
                        <td
                          style={{
                            padding:
                              "18px",
                            verticalAlign:
                              "top"
                          }}
                        >
                          <button
                            type="button"
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
                              padding:
                                "9px 13px",
                              borderRadius:
                                "9px",
                              border:
                                "1px solid rgba(239,68,68,0.24)",
                              background:
                                "rgba(239,68,68,0.08)",
                              color:
                                "#f87171",
                              fontSize:
                                "12px",
                              fontWeight:
                                500,
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
                                  : 1,
                              whiteSpace:
                                "nowrap"
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

      {/* ─────────────────────────────────────────────────────
          RESPONSIVE STYLES
      ───────────────────────────────────────────────────── */}

      <style>
        {`
          @media (max-width: 900px) {
            .admin-orders-desktop {
              display: none !important;
            }

            .admin-orders-mobile {
              display: block !important;
            }
          }

          @media (min-width: 901px) {
            .admin-orders-mobile {
              display: none !important;
            }

            .admin-orders-desktop {
              display: block !important;
            }
          }

          @media (max-width: 600px) {
            .admin-orders-mobile {
              margin-left: -4px;
              margin-right: -4px;
            }
          }

          select option {
            background: #0b1526;
            color: #e2e8f0;
          }
        `}
      </style>
    </div>
  );
};

export default AdminOrders;