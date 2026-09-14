import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600&display=swap');

        /* ── WRAPPER: provides the gap between Hero and this section ── */
        .lc-wrapper {
          margin-top: 1.5rem;
        }

        /* ── ALL VARS SCOPED TO .lc-root ── */
        .lc-root {
          --lc-bg:           #FFFFFF;
          --lc-card-bg:      rgba(255,255,255,0.70);
          --lc-card-hover:   rgba(255,255,255,0.92);
          --lc-blue:         #2F5DFF;
          --lc-blue-light:   #6E8BFF;
          --lc-blue-deep:    #16307A;
          --lc-blue-faint:   rgba(47,93,255,0.08);
          --lc-blue-line:    rgba(47,93,255,0.16);
          --lc-ink:          #10131F;
          --lc-ink-muted:    rgba(16,19,31,0.55);
          --lc-ink-faint:    rgba(16,19,31,0.30);
          --lc-glass-bg:     rgba(255,255,255,0.55);
          --lc-glass-bg2:    rgba(255,255,255,0.85);
          --lc-glass-border: rgba(47,93,255,0.16);
          --lc-glass-shine:  rgba(255,255,255,0.85);

          font-family: 'Outfit', sans-serif;

          background:
            radial-gradient(ellipse 70% 60% at 65% 0%, rgba(47,93,255,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 50% 80% at 15% 80%, rgba(110,139,255,0.05) 0%, transparent 60%),
            var(--lc-bg);

          padding: 5rem 3rem 6rem;
          position: relative;
          overflow: hidden;

          border-radius: 1.5rem;
        }

        /* ── HEADER ── */
        .lc-header {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 3.5rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--lc-glass-border);
        }
        .lc-header-left { display: flex; flex-direction: column; gap: 0.9rem; }

        .lc-title {
          font-weight: 600;
          font-size: clamp(2rem, 3.6vw, 3rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: var(--lc-ink);
        }
        .lc-title em {
          font-style: normal;
          font-weight: 600;
          color: var(--lc-blue);
        }

        .lc-header-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.6rem;
          padding-bottom: 0.2rem;
        }
        .lc-count {
          font-size: 0.7rem;
          font-weight: 400;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--lc-ink-faint);
        }

        /* View All */
        .lc-view-all {
          font-family: 'Outfit', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--lc-blue-deep);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1.3rem;
          border: 1px solid var(--lc-glass-border);
          border-radius: 100px;
          background: var(--lc-glass-bg);
          backdrop-filter: blur(20px) saturate(1.8);
          -webkit-backdrop-filter: blur(20px) saturate(1.8);
          transition: background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 1px 0 var(--lc-glass-shine) inset;
        }
        .lc-view-all:hover {
          background: var(--lc-glass-bg2);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(47,93,255,0.14), 0 1px 0 var(--lc-glass-shine) inset;
        }
        .lc-view-all svg { transition: transform 0.25s ease; }
        .lc-view-all:hover svg { transform: translate(2px, -2px); }

        /* ── GRID ── */
        .lc-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.2rem;
        }

        /* ── CARD ── */
        .lc-card {
          position: relative;
          background: var(--lc-card-bg);
          border: 1px solid var(--lc-glass-border);
          border-radius: 1.1rem;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 1px 0 var(--lc-glass-shine) inset;
          backdrop-filter: blur(16px) saturate(1.6);
          -webkit-backdrop-filter: blur(16px) saturate(1.6);
          transition: background 0.35s ease, border-color 0.35s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease;
        }
        .lc-card:hover {
          background: var(--lc-card-hover);
          border-color: rgba(47,93,255,0.30);
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 20px 40px rgba(47,93,255,0.12), 0 1px 0 var(--lc-glass-shine) inset;
        }

        /* Blue top-bar reveal */
        .lc-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(to right, var(--lc-blue-deep), var(--lc-blue-light));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
          z-index: 5;
          border-radius: 1.1rem 1.1rem 0 0;
        }
        .lc-card:hover::before { transform: scaleX(1); }

        /* IMAGE WRAP */
        .lc-img-wrap {
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        .lc-img {
          width: 100%;
          height: 22rem;
          object-fit: cover;
          display: block;
          transition: transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .lc-card:hover .lc-img {
          transform: scale(1.06);
        }

        /* Quick-view pill */
        .lc-quick {
          position: absolute;
          bottom: 1.2rem;
          left: 50%;
          transform: translateX(-50%) translateY(12px) scale(0.92);
          z-index: 3;
          font-family: 'Outfit', sans-serif;
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: #FFFFFF;
          background: var(--lc-blue);
          padding: 0.55rem 1.4rem;
          border-radius: 100px;
          white-space: nowrap;
          opacity: 0;
          box-shadow: 0 8px 24px rgba(47,93,255,0.35);
          transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1);
          pointer-events: none;
        }
        .lc-card:hover .lc-quick { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }

        /* TEXT BLOCK */
        .lc-info {
          padding: 1.2rem 1.3rem 1.4rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          border-top: 1px solid var(--lc-glass-border);
          flex: 1;
          background: rgba(255,255,255,0.5);
        }
        .lc-name {
          font-weight: 500;
          font-size: 1rem;
          line-height: 1.3;
          letter-spacing: -0.005em;
          color: var(--lc-ink);
          transition: color 0.25s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .lc-card:hover .lc-name { color: var(--lc-blue-deep); }

        .lc-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.2rem;
        }
        .lc-price {
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          color: var(--lc-blue);
        }

        /* Arrow circle */
        .lc-arrow-icon {
          width: 24px; height: 24px;
          border: 1px solid var(--lc-glass-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.6) rotate(-45deg);
          transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1), border-color 0.2s, background 0.2s;
          flex-shrink: 0;
        }
        .lc-card:hover .lc-arrow-icon {
          opacity: 1;
          transform: scale(1) rotate(0deg);
          border-color: var(--lc-blue-light);
          background: var(--lc-blue-faint);
        }

        /* ── ENTRANCE ANIMATIONS: blur-in stagger ── */
        @keyframes lc-blur-in {
          from { opacity: 0; filter: blur(10px); transform: translateY(14px) scale(0.98); }
          to   { opacity: 1; filter: blur(0); transform: translateY(0) scale(1); }
        }
        .lc-header  { animation: lc-blur-in 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .lc-card    { animation: lc-blur-in 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .lc-card:nth-child(1) { animation-delay: 0.05s; }
        .lc-card:nth-child(2) { animation-delay: 0.10s; }
        .lc-card:nth-child(3) { animation-delay: 0.15s; }
        .lc-card:nth-child(4) { animation-delay: 0.20s; }
        .lc-card:nth-child(5) { animation-delay: 0.25s; }
        .lc-card:nth-child(6) { animation-delay: 0.30s; }
        .lc-card:nth-child(7) { animation-delay: 0.35s; }
        .lc-card:nth-child(8) { animation-delay: 0.40s; }

        /* ── DARK MODE ── */
        html.dark-mode .lc-root {
          background-color: #000000 !important;
          background-image:
            radial-gradient(ellipse 70% 60% at 65% 0%, rgba(96,130,255,0.10) 0%, transparent 70%),
            radial-gradient(ellipse 50% 80% at 15% 80%, rgba(110,139,255,0.08) 0%, transparent 60%) !important;
          --lc-card-bg: rgba(30,41,59,0.70);
          --lc-card-hover: rgba(30,41,59,0.92);
          --lc-blue-deep: #6E8BFF;
          --lc-ink: var(--text-primary);
          --lc-ink-muted: var(--text-secondary);
          --lc-ink-faint: var(--text-secondary);
          --lc-glass-bg: rgba(30,41,59,0.55);
          --lc-glass-bg2: rgba(30,41,59,0.85);
          --lc-glass-border: rgba(96,130,255,0.20);
          --lc-glass-shine: rgba(255,255,255,0.05);
        }
        html.dark-mode .lc-info {
          background: rgba(15,23,42,0.5) !important;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .lc-grid { grid-template-columns: repeat(3, 1fr); }
          .lc-img  { height: 18rem; }
        }
        @media (max-width: 768px) {
          .lc-root   { padding: 3rem 1.5rem 4rem; border-radius: 1rem; }
          .lc-wrapper { margin-top: 1rem; }
          .lc-grid   { grid-template-columns: repeat(2, 1fr); gap: 0.8rem; }
          .lc-img    { height: 16rem; }
          .lc-header { flex-direction: column; align-items: flex-start; gap: 1.2rem; }
          .lc-header-right { align-items: flex-start; }
        }
        @media (max-width: 480px) {
          .lc-img   { height: 13rem; }
          .lc-title { font-size: 1.7rem; }
        }
      `}</style>

      <div className="lc-wrapper">
        <div className="lc-root">

          {/* ── HEADER ── */}
          <div className="lc-header">
            <div className="lc-header-left">
              <h2 className="lc-title">
                Latest <em>Collection</em>
              </h2>
            </div>
            <div className="lc-header-right">
              <span className="lc-count">{products.length} Pieces</span>
              <Link to="/collection" className="lc-view-all">
                View All
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 10L10 2M10 2H4M10 2V8"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* ── GRID ── */}
          <div className="lc-grid">
            {products.map((item, i) => (
              <Link key={item.id} to={`/product/${item.id}`} style={{ display: 'contents' }}>
                <div className="lc-card">
                  <div className="lc-img-wrap">
                    <img src={item.image} className="lc-img" alt={item.name} />
                    <span className="lc-quick">View Product</span>
                  </div>
                  <div className="lc-info">
                    <p className="lc-name">{item.name}</p>
                    <div className="lc-bottom">
                      <span className="lc-price">₹{item.price}</span>
                      <div className="lc-arrow-icon">
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#2F5DFF" strokeWidth="1.5">
                          <path d="M2 10L10 2M10 2H4M10 2V8"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default LatestCollection;