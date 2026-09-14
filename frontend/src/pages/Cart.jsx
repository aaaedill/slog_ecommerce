import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Title } from "../components/Title";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Cart = () => {

  const navigate = useNavigate();
  const { products, cartItems, removeFromCart, getCartTotal, user } = useContext(ShopContext);
  const cartKeys = Object.keys(cartItems);
  const totalItems = Object.values(cartItems).reduce((a, b) => a + b, 0);
  const totalAmount = getCartTotal();

  if (products.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)', padding: '3rem 2rem' }}>
        <p style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--text-secondary)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>Loading…</p>
      </div>
    );
  }

  const handleCheckout = () => {
   if (!user) {
      toast.error("Please login to continue");
      navigate("/login", { state: { from: "/place-order" } });
      return;
    }
    if (cartKeys.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    navigate("/place-order");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&display=swap');

        .cart-root {
          --hn-blue:         #2F5DFF;
          --hn-blue-light:   #6E8BFF;
          --hn-blue-deep:    #16307A;
          --hn-ink:          #10131F;
          --hn-ink-muted:    rgba(16,19,31,0.55);
          --hn-ink-faint:    rgba(16,19,31,0.30);
          --hn-glass-bg:     rgba(255,255,255,0.60);
          --hn-glass-bg2:    rgba(255,255,255,0.85);
          --hn-glass-border: rgba(47,93,255,0.16);
          --hn-glass-shine:  rgba(255,255,255,0.85);

          --col-dg-bg:        rgba(16,19,31,0.85);
          --col-dg-bg2:       rgba(16,19,31,0.95);
          --col-dg-border:    rgba(110,139,255,0.22);
          --col-dg-shine:     rgba(110,139,255,0.14);
          --col-dg-ink:       #C7D3FF;
          --col-dg-ink-muted: rgba(199,211,255,0.72);
          --col-dg-ink-faint: rgba(199,211,255,0.38);

          font-family: 'Outfit', sans-serif;
          color: var(--hn-ink);
          position: relative;
          width: 100%;
          margin-top: 1rem;
          background:
            radial-gradient(ellipse 70% 60% at 65% 0%, rgba(47,93,255,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 50% 80% at 15% 80%, rgba(110,139,255,0.05) 0%, transparent 60%),
            var(--bg-primary);
          border-radius: 1.5rem;
          overflow: hidden;
        }

        .cart-inner {
          position: relative;
          z-index: 2;
        }

        /* ── BACK BUTTON ── */
        .cart-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.55rem 1.1rem;
          border-radius: 100px;
          background: rgba(255,255,255,0.6);
          border: 1px solid rgba(47,93,255,0.16);
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
          box-shadow: 0 2px 12px rgba(47,93,255,0.06);
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: var(--hn-ink-muted);
          transition: background 0.2s ease, color 0.2s ease;
        }
        .cart-back-btn:hover {
          background: rgba(255,255,255,0.95);
          color: #2F5DFF;
        }

        /* ── TOP BAR ── */
        .cart-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2.5rem;
          border-bottom: 1px solid var(--hn-glass-border);
          background: rgba(255,255,255,0.5);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .cart-topbar-title {
          font-weight: 600;
          font-size: 1.15rem;
          letter-spacing: -0.01em;
          color: var(--hn-ink);
        }
        .cart-topbar-title em {
          font-style: normal;
          font-weight: 600;
          color: var(--hn-blue);
        }
        .cart-topbar-count {
          font-size: 0.7rem;
          font-weight: 400;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--hn-ink-faint);
        }

        /* ── BODY ── */
        .cart-body {
          max-width: 1024px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem 5rem;
        }

        /* ── EMPTY STATE ── */
        .cart-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8rem 0;
          gap: 0.75rem;
          text-align: center;
        }
        .cart-empty-title {
          font-weight: 500;
          font-size: 1.6rem;
          color: var(--hn-ink-faint);
        }
        .cart-empty-sub {
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--hn-ink-faint);
        }

        /* ── ITEMS PANEL ── */
        .cart-panel {
          background: var(--hn-glass-bg);
          border: 1px solid var(--hn-glass-border);
          border-radius: 1.1rem;
          overflow: hidden;
          backdrop-filter: blur(24px) saturate(1.8);
          -webkit-backdrop-filter: blur(24px) saturate(1.8);
          box-shadow: 0 1px 0 var(--hn-glass-shine) inset;
          flex: 1;
        }

        .cart-panel-header {
          padding: 1rem 1.75rem;
          border-bottom: 1px solid var(--hn-glass-border);
          background: rgba(255,255,255,0.4);
        }
        .cart-panel-header span {
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--hn-ink-muted);
        }

        /* ── ITEM ROW ── */
        .cart-item-row {
          display: grid;
          grid-template-columns: 80px 1fr auto;
          align-items: center;
          gap: 1.5rem;
          padding: 1.25rem 1.75rem;
          border-bottom: 1px solid var(--hn-glass-border);
          transition: background 0.2s;
          animation: cartBlurIn 0.55s cubic-bezier(0.16,1,0.3,1) both;
        }
        .cart-item-row:last-child { border-bottom: none; }
        .cart-item-row:hover { background: rgba(47,93,255,0.05); }
        .cart-item-row:nth-child(1) { animation-delay: 0.04s; }
        .cart-item-row:nth-child(2) { animation-delay: 0.09s; }
        .cart-item-row:nth-child(3) { animation-delay: 0.14s; }
        .cart-item-row:nth-child(4) { animation-delay: 0.19s; }
        .cart-item-row:nth-child(5) { animation-delay: 0.24s; }
        @keyframes cartBlurIn {
          from { opacity: 0; filter: blur(8px); transform: translateY(12px); }
          to   { opacity: 1; filter: blur(0); transform: translateY(0); }
        }

        .cart-thumb-wrap {
          width: 80px;
          height: 100px;
          border-radius: 0.6rem;
          overflow: hidden;
          background: var(--bg-card);
          border: 1px solid var(--hn-glass-border);
          flex-shrink: 0;
        }
        .cart-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.55s ease;
        }
        .cart-thumb-wrap:hover .cart-thumb-img { transform: scale(1.07); }

        .cart-item-name {
          font-weight: 500;
          font-size: 1rem;
          line-height: 1.3;
          color: var(--hn-ink);
          margin-bottom: 0.3rem;
        }
        .cart-item-price {
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 0.85rem;
          letter-spacing: 0.01em;
          color: var(--hn-blue);
          margin-bottom: 0.65rem;
        }
        .cart-item-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .cart-item-tag {
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: var(--hn-ink-muted);
          background: rgba(47,93,255,0.06);
          border: 1px solid var(--hn-glass-border);
          padding: 0.25rem 0.7rem;
          border-radius: 100px;
        }

        .cart-rm-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.4rem;
          color: var(--hn-ink-faint);
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        .cart-rm-btn:hover { color: var(--hn-blue); }

        /* ── SIDEBAR ── */
        .cart-sidebar {
          width: 100%;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        @media (min-width: 1024px) {
          .cart-sidebar { width: 17rem; }
        }

        /* Summary — dark blue liquid glass */
        .cart-summary {
          background: var(--col-dg-bg);
          border: 1px solid var(--col-dg-border);
          border-radius: 1.1rem;
          overflow: hidden;
          backdrop-filter: blur(32px) saturate(1.8);
          -webkit-backdrop-filter: blur(32px) saturate(1.8);
          box-shadow: 0 1px 0 var(--col-dg-shine) inset;
          padding: 1.75rem;
        }

        .cart-summary-label {
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--col-dg-ink-faint);
          margin-bottom: 1.4rem;
          display: block;
        }

        .cart-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.75rem;
        }
        .cart-summary-row-key {
          font-size: 0.82rem;
          font-weight: 400;
          color: var(--col-dg-ink-muted);
        }
        .cart-summary-row-val {
          font-size: 0.86rem;
          font-weight: 500;
          color: var(--col-dg-ink);
        }
        .cart-summary-row-val-faint {
          font-size: 0.78rem;
          font-weight: 400;
          color: var(--col-dg-ink-faint);
        }

        .cart-summary-divider {
          height: 1px;
          background: var(--col-dg-border);
          margin: 1rem 0;
        }

        .cart-summary-total-key {
          font-size: 0.82rem;
          font-weight: 400;
          letter-spacing: 0.01em;
          color: var(--col-dg-ink-muted);
        }
        .cart-summary-total-val {
          font-weight: 700;
          font-size: 1.9rem;
          line-height: 1;
          color: var(--col-dg-ink);
        }

        .cart-checkout-btn {
          width: 100%;
          margin-top: 1.25rem;
          padding: 1rem;
          border-radius: 100px;
          border: none;
          background: var(--hn-blue);
          color: #FFFFFF;
          font-family: 'Outfit', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(47,93,255,0.28);
          transition: background 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease;
        }
        .cart-checkout-btn:hover {
          background: var(--hn-blue-deep);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(47,93,255,0.34);
        }

        .cart-secure {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-top: 0.75rem;
          font-size: 0.68rem;
          letter-spacing: 0.04em;
          color: var(--col-dg-ink-faint);
        }

        /* Returns note — light glass */
        .cart-returns {
          background: var(--hn-glass-bg);
          border: 1px solid var(--hn-glass-border);
          border-radius: 1.1rem;
          padding: 1rem 1.25rem;
          backdrop-filter: blur(24px) saturate(1.8);
          -webkit-backdrop-filter: blur(24px) saturate(1.8);
          box-shadow: 0 1px 0 var(--hn-glass-shine) inset;
        }
        .cart-returns p {
          font-weight: 400;
          font-size: 0.85rem;
          line-height: 1.7;
          color: var(--hn-ink-muted);
        }

        /* ── FLEX LAYOUT ── */
        .cart-content-row {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          align-items: flex-start;
        }
        @media (min-width: 1024px) {
          .cart-content-row { flex-direction: row; }
        }

        /* ── DARK MODE ── */
        /* Re-point this page's local ink/glass tokens at dark-mode values,
           so every rule above that reads from --hn-ink / --hn-glass-*
           flips automatically. */
        html.dark-mode .cart-root {
          --hn-ink:          #F8FAFC;
          --hn-ink-muted:    rgba(248,250,252,0.65);
          --hn-ink-faint:    rgba(248,250,252,0.38);
          --hn-glass-bg:     rgba(30,41,59,0.65);
          --hn-glass-bg2:    rgba(30,41,59,0.85);
          --hn-glass-border: rgba(96,130,255,0.22);
          --hn-glass-shine:  rgba(255,255,255,0.04);
        }
        html.dark-mode .cart-back-btn {
          background: rgba(30,41,59,0.65) !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.20) !important;
        }
        html.dark-mode .cart-back-btn:hover {
          background: rgba(30,41,59,0.95) !important;
          color: #6E8BFF !important;
        }
        html.dark-mode .cart-topbar {
          background: rgba(15,23,42,0.55) !important;
        }
        html.dark-mode .cart-panel-header {
          background: rgba(15,23,42,0.45) !important;
        }
        html.dark-mode .cart-root.cart-root {
          background-color: #000000 !important;
          background-image:
            radial-gradient(ellipse 70% 60% at 65% 0%, rgba(47,93,255,0.10) 0%, transparent 70%),
            radial-gradient(ellipse 50% 80% at 15% 80%, rgba(110,139,255,0.08) 0%, transparent 60%) !important;
        }
      `}</style>

      <div className="cart-root">
        <div className="cart-inner">

          {/* Back Button */}
          <div style={{ padding: '1.5rem 2.5rem 0' }}>
            <button className="cart-back-btn" onClick={() => navigate(-1)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>

          {/* Top Bar */}
          <div className="cart-topbar" style={{ marginTop: '1rem' }}>
            <span className="cart-topbar-title">
              Your <em>Cart</em>
            </span>
            {totalItems > 0 && (
            <span className="cart-topbar-count">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
           )}
          </div>

          {/* Body */}
          <div className="cart-body">
            {cartKeys.length === 0 ? (
              <div className="cart-empty">
                <p className="cart-empty-title">Your cart is empty</p>
                <p className="cart-empty-sub">Add items to begin</p>
              </div>
            ) : (
              <div className="cart-content-row">

                {/* Items Panel */}
                <div className="cart-panel">
                  <div className="cart-panel-header">
                    <span>Selected Items</span>
                  </div>
                  {cartKeys.map(key => {
                    const id = key.split("_")[0];
                    const size = key.split("_")[1];
                    const product = products.find(item => String(item.id) === String(id));
                    if (!product) return null;
                    return (
                      <div key={key} className="cart-item-row">
                        <div className="cart-thumb-wrap">
                          <img src={product.image} alt={product.name} className="cart-thumb-img" />
                        </div>
                        <div>
                          <p className="cart-item-name">{product.name}</p>
                          <p className="cart-item-price">₹{product.price}</p>
                          <div className="cart-item-tags">
                            <span className="cart-item-tag">Size · {size}</span>
                            <span className="cart-item-tag">Qty · {cartItems[key]}</span>
                          </div>
                        </div>
                        <button className="cart-rm-btn" onClick={() => removeFromCart(key)}>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <line x1="1" y1="1" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            <line x1="12" y1="1" x2="1" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Sidebar */}
                <div className="cart-sidebar">

                  {/* Summary */}
                  <div className="cart-summary">
                    <span className="cart-summary-label">Order Summary</span>
                    <div className="cart-summary-row">
                      <span className="cart-summary-row-key">Subtotal</span>
                      <span className="cart-summary-row-val">₹{totalAmount}</span>
                    </div>
                    <div className="cart-summary-row">
                      <span className="cart-summary-row-key">Shipping</span>
                      <span className="cart-summary-row-val-faint">At checkout</span>
                    </div>
                    <div className="cart-summary-divider" />
                    <div className="cart-summary-row" style={{ alignItems: 'flex-end' }}>
                      <span className="cart-summary-total-key">Total</span>
                      <span className="cart-summary-total-val">₹{totalAmount}</span>
                    </div>
                    <button className="cart-checkout-btn" onClick={handleCheckout}>
                      Proceed to Checkout
                    </button>
                    <div className="cart-secure">
                      <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                        <rect x="0.6" y="4.6" width="8.8" height="6.8" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
                        <path d="M2.5 4.5V3A2.5 2.5 0 0 1 7.5 3v1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                      </svg>
                      Secure checkout
                    </div>
                  </div>

                  {/* Returns */}
                  <div className="cart-returns">
                    <p>Free returns within 7 days. Carefully packaged, always.</p>
                  </div>

                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default Cart;