import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Title } from "../components/Title";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const { orders } = useContext(ShopContext);
  const navigate = useNavigate();

  if (!orders) {
    return (
      <div className="min-h-screen" style={{ background: '#EDE8E0', padding: '3rem 2rem' }}>
        <p style={{ fontFamily: "'Jost', sans-serif", color: '#9A9188', fontSize: '0.85rem', letterSpacing: '0.15em' }}>Loading…</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif; }
        .font-jost { font-family: 'Jost', sans-serif; }

        .order-card {
          border: 1px solid #D4CCC0;
          border-radius: 2px;
          overflow: hidden;
          background: #E4DDD3;
          animation: cartUp 0.45s ease both;
        }
        .order-card:nth-child(1) { animation-delay: 0.04s; }
        .order-card:nth-child(2) { animation-delay: 0.09s; }
        .order-card:nth-child(3) { animation-delay: 0.14s; }
        .order-card:nth-child(4) { animation-delay: 0.19s; }
        .order-card:nth-child(5) { animation-delay: 0.24s; }

        @keyframes cartUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .order-item-row {
          display: grid;
          grid-template-columns: 80px 1fr auto;
          align-items: center;
          gap: 1.5rem;
          padding: 1.25rem 1.75rem;
          border-bottom: 1px solid #D4CCC0;
          transition: background 0.2s ease;
        }
        .order-item-row:last-of-type { border-bottom: none; }
        .order-item-row:hover { background: rgba(0,0,0,0.025); }

        .thumb-wrap { overflow: hidden; border-radius: 2px; }
        .thumb-img { transition: transform 0.55s ease; }
        .thumb-wrap:hover .thumb-img { transform: scale(1.07); }

        /* Status pill */
        .order-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-family: 'Jost', sans-serif;
          font-size: 0.58rem;
          font-weight: 600;
          letter-spacing: 0.16em;
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

        .status-placed { color: #b91c1c; background: #fee2e2; border-color: #f87171; }
        .status-placed .status-dot { background: #b91c1c; }

        .status-default { color: #c2410c; background: #ffedd5; border-color: #fb923c; }
        .status-default .status-dot { background: #c2410c; }

        .status-delivered { color: #15803d; background: #dcfce7; border-color: #4ade80; }
        .status-delivered .status-dot { background: #15803d; }

        @media (max-width: 640px) {
          .order-item-row { grid-template-columns: 64px 1fr; }
          .order-item-price { grid-column: 2; margin-top: -0.5rem; }
        }
      `}</style>

      {/* Root */}
      <div className="font-jost min-h-screen rounded-3xl overflow-hidden mt-5" style={{ background: '#EDE8E0', color: '#2C2825' }}>

        {/* Top Bar */}
        <div
          className="flex items-center justify-between px-10 py-4 border-b"
          style={{ background: '#E4DDD3', borderColor: '#D4CCC0' }}
        >
          <span className="font-fraunces font-light tracking-wide" style={{ fontSize: '1.05rem', color: '#2C2825' }}>
            My <i className="italic" style={{ color: '#8B6F5E' }}>Orders</i>
          </span>
          {orders.length > 0 && (
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: '#9A9188' }}>
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
              className="flex items-center px-4 py-2 rounded-full backdrop-blur-xl border transition-all duration-200 cursor-pointer"
              style={{ background: 'rgba(237,232,224,0.75)', borderColor: 'rgba(212,204,192,0.6)', color: '#6B6058', fontFamily: "'Jost', sans-serif", fontSize: '0.78rem', fontWeight: 400, letterSpacing: '0.06em', boxShadow: '0 2px 12px rgba(44,40,37,0.06)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(241, 159, 77, 0.95)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgb(237, 232, 224)'}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ marginRight: '2px' }}>
                <path d="M8 1.5L3.5 6.5L8 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
          </div>

          {orders.length === 0 ? (

            <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
              <p className="font-fraunces font-light italic text-3xl" style={{ color: '#D4CCC0' }}>No orders yet</p>
              <p className="text-xs tracking-widest uppercase" style={{ color: '#9A9188' }}>Your order history will appear here</p>
            </div>

          ) : (

            <div className="flex flex-col gap-5">
              {orders.map((order) => {

                const isPlaced = order.status === "Order Placed";
                const isDelivered = order.status === "Delivered";
                const statusClass = isDelivered ? "status-delivered" : isPlaced ? "status-placed" : "status-default";

                return (
                  <div key={order.id} className="order-card">

                    {/* Card Header */}
                    <div
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-7 py-4 border-b"
                      style={{ background: '#DAD3C8', borderColor: '#D4CCC0' }}
                    >
                      <div>
                        <p className="font-fraunces font-light leading-snug" style={{ fontSize: '0.95rem', color: '#2C2825' }}>
                          Order · <span style={{ color: '#8B6F5E' }}>{order.id}</span>
                        </p>
                        <p className="font-medium tracking-widest uppercase mt-0.5" style={{ fontSize: '0.6rem', color: '#9A9188' }}>
                          {order.date}
                        </p>
                      </div>

                      <span className={`order-status-pill ${statusClass}`}>
                        <span className="status-dot" />
                        {order.status}
                      </span>
                    </div>

                    {/* Items */}
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item-row">

                        {/* Thumb */}
                        <div className="thumb-wrap flex-shrink-0" style={{ width: 80, height: 100, background: '#DAD3C8' }}>
                          <img src={item.image} alt={item.name} className="thumb-img w-full h-full object-cover block" />
                        </div>

                        {/* Info */}
                        <div>
                          <p className="font-fraunces font-light mb-1 leading-snug" style={{ fontSize: '1rem', color: '#2C2825' }}>
                            {item.name}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span
                              className="font-medium tracking-widest uppercase border rounded-sm px-2.5 py-1"
                              style={{ fontSize: '0.58rem', color: '#9A9188', background: '#DAD3C8', borderColor: '#D4CCC0' }}
                            >
                              Size · {item.size}
                            </span>
                            <span
                              className="font-medium tracking-widest uppercase border rounded-sm px-2.5 py-1"
                              style={{ fontSize: '0.58rem', color: '#9A9188', background: '#DAD3C8', borderColor: '#D4CCC0' }}
                            >
                              Qty · {item.quantity}
                            </span>
                          </div>
                        </div>

                        {/* Price */}
                        <p className="order-item-price font-medium" style={{ fontSize: '0.8rem', color: '#8B6F5E', whiteSpace: 'nowrap' }}>
                          ₹{item.price * item.quantity}
                        </p>

                      </div>
                    ))}

                    {/* Footer total */}
                    <div
                      className="flex items-end justify-between px-7 py-5 border-t"
                      style={{ background: '#2C2825', borderColor: '#3a3530' }}
                    >
                      <p className="font-medium tracking-widest uppercase" style={{ fontSize: '0.6rem', color: 'rgba(237,232,224,0.4)' }}>
                        Order Total
                      </p>
                      <p className="font-fraunces font-light leading-none" style={{ fontSize: '1.9rem', color: '#EDE8E0' }}>
                        ₹{order.total}
                      </p>
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