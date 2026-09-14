import { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { Title } from "../components/Title";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Orders = () => {

  const { orders, cancelOrder } = useContext(ShopContext);
  const navigate = useNavigate();

  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const glassToastStyle = {
    background: "rgba(255,255,255,0.55)",
    backdropFilter: "blur(24px) saturate(1.8)",
    WebkitBackdropFilter: "blur(24px) saturate(1.8)",
    border: "1px solid rgba(47,93,255,0.25)",
    borderRadius: "16px",
    color: "#16307A",
    fontFamily: "Outfit, sans-serif",
    boxShadow: "0 8px 32px rgba(47,93,255,0.16), 0 1px 0 rgba(255,255,255,0.8) inset"
  };

  const runCancel = async (id) => {
    setCancellingOrderId(String(id));

    try {
      const result = await cancelOrder(id);

      /*
       * ShopContext.cancelOrder() returns a result object.
       * Only show success when the actual API cancellation succeeded.
       */
      if (result?.success) {
        toast.success("Order cancelled successfully", { style: glassToastStyle });
      } else {
        toast.error(
          result?.message || "Failed to cancel order",
          { style: glassToastStyle }
        );
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to cancel order", { style: glassToastStyle });
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleCancel = (id) => {
    if (cancellingOrderId !== null) return;

    toast(
      ({ closeToast }) => (
        <div>
          <p style={{ fontSize: '0.85rem', fontWeight: 500, color: '#10131F', marginBottom: '0.75rem' }}>
            Cancel this order?
          </p>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={() => {
                closeToast();
                runCancel(id);
              }}
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#FFFFFF',
                background: '#2F5DFF',
                border: 'none',
                borderRadius: '100px',
                padding: '0.4rem 1.1rem',
                cursor: 'pointer'
              }}
            >
              Yes, cancel
            </button>
            <button
              onClick={closeToast}
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: '#6B7280',
                background: 'transparent',
                border: '1px solid rgba(47,93,255,0.2)',
                borderRadius: '100px',
                padding: '0.4rem 1.1rem',
                cursor: 'pointer'
              }}
            >
              Keep order
            </button>
          </div>
        </div>
      ),
      {
        style: glassToastStyle,
        autoClose: false,
        closeOnClick: false,
        draggable: false
      }
    );
  };


  if (!orders) {
    return (
      <div
        className="min-h-screen"
        style={{
          background: 'var(--bg-primary)',
          padding: '3rem 2rem'
        }}
      >
        <p
          style={{
            fontFamily: "'Outfit', sans-serif",
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            letterSpacing: '0.1em'
          }}
        >
          Loading…
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&display=swap');

        .font-outfit {
          font-family: 'Outfit', sans-serif;
        }

        .orders-root {
          background:
            radial-gradient(ellipse 70% 50% at 70% 0%, rgba(47,93,255,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 10% 100%, rgba(110,139,255,0.05) 0%, transparent 60%),
            var(--bg-primary);
          color: var(--text-primary);
        }

        .order-card {
          border: 1px solid rgba(47,93,255,0.14);
          border-radius: 1.1rem;
          overflow: hidden;
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
          box-shadow: 0 1px 0 rgba(255,255,255,0.8) inset, 0 4px 24px rgba(47,93,255,0.06);
          animation: orderBlurIn 0.55s cubic-bezier(0.16,1,0.3,1) both;
        }

        .order-card:nth-child(1) {
          animation-delay: 0.04s;
        }

        .order-card:nth-child(2) {
          animation-delay: 0.09s;
        }

        .order-card:nth-child(3) {
          animation-delay: 0.14s;
        }

        .order-card:nth-child(4) {
          animation-delay: 0.19s;
        }

        .order-card:nth-child(5) {
          animation-delay: 0.24s;
        }

        @keyframes orderBlurIn {
          from {
            opacity: 0;
            filter: blur(8px);
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0);
          }
        }

        .order-item-row {
          display: grid;
          grid-template-columns: 80px 1fr auto;
          align-items: center;
          gap: 1.5rem;
          padding: 1.25rem 1.75rem;
          border-bottom: 1px solid rgba(47,93,255,0.12);
          transition: background 0.2s ease;
        }

        .order-item-row:last-of-type {
          border-bottom: none;
        }

        .order-item-row:hover {
          background: rgba(47,93,255,0.04);
        }

        .thumb-wrap {
          overflow: hidden;
          border-radius: 0.6rem;
        }

        .thumb-img {
          transition: transform 0.55s ease;
        }

        .thumb-wrap:hover .thumb-img {
          transform: scale(1.07);
        }

        /* Back button */
        .orders-back-btn {
          background: rgba(255,255,255,0.6);
          border: 1px solid rgba(47,93,255,0.16);
          color: var(--text-secondary);
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
          box-shadow: 0 2px 12px rgba(47,93,255,0.06);
          transition: background 0.2s ease, color 0.2s ease;
        }
        .orders-back-btn:hover {
          background: rgba(255,255,255,0.95);
          color: #2F5DFF;
        }

        /* Status pill */
        .order-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-family: 'Outfit', sans-serif;
          font-size: 0.66rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 100px;
          padding: 0.3rem 0.8rem;
          border: 1px solid;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .status-placed {
          color: #2F5DFF;
          background: rgba(47,93,255,0.08);
          border-color: rgba(47,93,255,0.28);
        }

        .status-placed .status-dot {
          background: #2F5DFF;
        }

        .status-default {
          color: #16307A;
          background: rgba(110,139,255,0.12);
          border-color: rgba(110,139,255,0.32);
        }

        .status-default .status-dot {
          background: #16307A;
        }

        .status-delivered {
          color: #15803d;
          background: #dcfce7;
          border-color: #4ade80;
        }

        .status-delivered .status-dot {
          background: #15803d;
        }

        /* Cancel button */
        .order-cancel-btn {
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          transition: background 0.2s ease, opacity 0.2s ease;
        }

        @media (max-width: 640px) {
          .order-item-row {
            grid-template-columns: 64px 1fr;
          }

          .order-item-price {
            grid-column: 2;
            margin-top: -0.5rem;
          }
        }

        /* ── DARK MODE ── */
        html.dark-mode .orders-root.orders-root {
          background-color: #000000 !important;
          background-image:
            radial-gradient(ellipse 70% 50% at 70% 0%, rgba(47,93,255,0.10) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 10% 100%, rgba(110,139,255,0.08) 0%, transparent 60%) !important;
        }
        html.dark-mode .order-card {
          background: rgba(30,41,59,0.65) !important;
          border-color: rgba(96,130,255,0.20) !important;
          box-shadow: 0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 24px rgba(0,0,0,0.25) !important;
        }
        html.dark-mode .order-item-row {
          border-bottom-color: rgba(96,130,255,0.16) !important;
        }
        html.dark-mode .orders-back-btn {
          background: rgba(30,41,59,0.65) !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.20) !important;
        }
        html.dark-mode .orders-back-btn:hover {
          background: rgba(30,41,59,0.95) !important;
          color: #6E8BFF !important;
        }
        html.dark-mode .status-delivered {
          color: #4ade80 !important;
          background: rgba(21,128,61,0.18) !important;
          border-color: rgba(74,222,128,0.35) !important;
        }
        html.dark-mode .status-delivered .status-dot {
          background: #4ade80 !important;
        }
      `}</style>

      {/* Root */}
      <div
        className="font-outfit orders-root min-h-screen rounded-3xl overflow-hidden mt-5"
      >

        {/* Top Bar */}
        <div
          className="flex items-center justify-between px-10 py-4 border-b"
          style={{
            background: 'rgba(47,93,255,0.05)',
            borderColor: 'rgba(47,93,255,0.12)'
          }}
        >
          <span
            className="font-semibold tracking-tight"
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-primary)'
            }}
          >
            My{' '}
            <span style={{ color: '#2F5DFF' }}>
              Orders
            </span>
          </span>

          {orders.length > 0 && (
            <span
              className="text-xs font-medium tracking-widest uppercase"
              style={{ color: 'var(--text-secondary)' }}
            >
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="max-w-5xl mx-auto px-6 py-10 pb-20">

          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="orders-back-btn flex items-center px-4 py-2 rounded-full border transition-all duration-200 cursor-pointer"
              style={{
                fontSize: '0.78rem',
                fontWeight: 500,
                letterSpacing: '0.04em'
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                style={{ marginRight: '2px' }}
              >
                <path
                  d="M8 1.5L3.5 6.5L8 11.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              Back
            </button>
          </div>

          {orders.length === 0 ? (

            <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">

              <p
                className="font-medium text-2xl"
                style={{ color: 'var(--text-secondary)' }}
              >
                No orders yet
              </p>

              <p
                className="text-xs tracking-widest uppercase"
                style={{ color: 'var(--text-secondary)' }}
              >
                Your order history will appear here
              </p>

            </div>

          ) : (

            <div className="flex flex-col gap-5">

              {orders.map((order) => {

                const isPlaced = order.status === "Order Placed";
                const isDelivered = order.status === "Delivered";

                const statusClass = isDelivered
                  ? "status-delivered"
                  : isPlaced
                    ? "status-placed"
                    : "status-default";

                const isCancelling =
                  cancellingOrderId === String(order.id);

                return (
                  <div
                    key={order.id}
                    className="order-card"
                  >

                    {/* Card Header */}
                    <div
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-7 py-4 border-b"
                      style={{
                        background: 'rgba(47,93,255,0.04)',
                        borderColor: 'rgba(47,93,255,0.12)'
                      }}
                    >

                      <div>

                        <p
                          className="font-medium leading-snug"
                          style={{
                            fontSize: '0.95rem',
                            color: 'var(--text-primary)'
                          }}
                        >
                          Order ·{' '}
                          <span style={{ color: '#2F5DFF' }}>
                            {order.id}
                          </span>
                        </p>

                        <p
                          className="font-medium tracking-widest uppercase mt-0.5"
                          style={{
                            fontSize: '0.65rem',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {order.date}
                        </p>

                      </div>

                      <span
                        className={`order-status-pill ${statusClass}`}
                      >
                        <span className="status-dot" />
                        {order.status}
                      </span>

                    </div>

                    {/* Items */}
                    {order.items.map((item, index) => (

                      <div
                        key={index}
                        className="order-item-row"
                      >

                        <div
                          className="thumb-wrap flex-shrink-0"
                          style={{
                            width: 80,
                            height: 100,
                            background: 'var(--bg-card)'
                          }}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="thumb-img w-full h-full object-cover block"
                          />
                        </div>

                        <div>

                          <p
                            className="font-medium mb-1 leading-snug"
                            style={{
                              fontSize: '1rem',
                              color: 'var(--text-primary)'
                            }}
                          >
                            {item.name}
                          </p>

                        </div>

                        <p
                          className="order-item-price font-semibold"
                          style={{
                            fontSize: '0.85rem',
                            color: '#2F5DFF',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          ₹{item.price * item.quantity}
                        </p>

                      </div>

                    ))}

                    {/* Footer total */}
                    <div
                      className="flex items-end justify-between px-7 py-5 border-t"
                      style={{
                        background: '#10131F',
                        borderColor: 'rgba(110,139,255,0.18)'
                      }}
                    >

                      <p
                        className="font-medium tracking-widest uppercase"
                        style={{
                          fontSize: '0.65rem',
                          color: 'rgba(255,255,255,0.4)'
                        }}
                      >
                        Order Total
                      </p>

                      <p
                        className="font-bold leading-none"
                        style={{
                          fontSize: '1.9rem',
                          color: '#FFFFFF'
                        }}
                      >
                        ₹{order.total}
                      </p>

                      {!isDelivered && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          disabled={isCancelling || cancellingOrderId !== null}
                          className="order-cancel-btn"
                          style={{
                            marginLeft: "20px",
                            background: isCancelling
                              ? "#9f1239"
                              : "#dc2626",
                            color: "white",
                            padding: "6px 14px",
                            fontSize: "12px",
                            borderRadius: "100px",
                            border: "none",
                            cursor: isCancelling || cancellingOrderId !== null
                              ? "not-allowed"
                              : "pointer",
                            opacity: isCancelling
                              ? 0.7
                              : 1
                          }}
                        >
                          {isCancelling
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      )}

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </div>
      </div>
    </>
  );
};

export default Orders;