import { useContext, useState, useRef, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const SearchBar = ({ setShowSearch }) => {

  const { products } = useContext(ShopContext);
  const [query, setQuery] = useState("");
  const searchRef = useRef();

  // CLICK OUTSIDE CLOSE
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredProducts = products.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap');

        .sb-overlay {
          animation: sbFadeIn 0.2s ease both;
        }
        @keyframes sbFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .sb-panel {
          animation: sbSlideDown 0.35s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes sbSlideDown {
          from { opacity: 0; filter: blur(8px); transform: translateY(-14px); }
          to   { opacity: 1; filter: blur(0); transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .sb-overlay, .sb-panel { animation: none !important; opacity: 1 !important; filter: none !important; transform: none !important; }
        }

        .sb-input {
          font-family: 'Jost', sans-serif;
          font-weight: 400;
          font-size: 0.9rem;
          letter-spacing: 0.01em;
          background: rgba(255,255,255,0.7);
          border: 1.5px solid rgba(107,142,35,0.18);
          color: #10131F;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .sb-input::placeholder { color: #9CA3AF; }
        .sb-input:focus {
          border-color: #6B8E23;
          box-shadow: 0 0 0 3px rgba(107,142,35,0.14);
        }

        .sb-close-btn {
          font-family: 'Jost', sans-serif;
          color: #6B7280;
          transition: color 0.2s ease, transform 0.2s ease;
          background: none;
          border: none;
          cursor: pointer;
          line-height: 1;
        }
        .sb-close-btn:hover { color: #4B5320; transform: rotate(90deg); }

        .sb-result-row {
          display: flex;
          gap: 1rem;
          align-items: center;
          border: 1px solid rgba(107,142,35,0.16);
          padding: 0.6rem;
          border-radius: 0.85rem;
          margin-bottom: 0.5rem;
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(12px) saturate(1.5);
          -webkit-backdrop-filter: blur(12px) saturate(1.5);
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.25s ease;
          text-decoration: none;
          cursor: pointer;
        }
        .sb-result-row:hover {
          background: rgba(107,142,35,0.07);
          border-color: rgba(107,142,35,0.30);
          transform: translateY(-1px);
        }

        .sb-result-thumb {
          width: 60px;
          height: 75px;
          object-fit: cover;
          border-radius: 0.5rem;
          flex-shrink: 0;
          background: #F5F7EE;
        }

        .sb-result-name {
          font-weight: 500;
          font-size: 0.95rem;
          color: #10131F;
          margin-bottom: 0.2rem;
        }

        .sb-result-price {
          font-family: 'Jost', sans-serif;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.01em;
          color: #6B8E23;
        }

        .sb-empty {
          font-family: 'Jost', sans-serif;
          font-weight: 500;
          font-size: 0.9rem;
          color: rgba(16,19,31,0.3);
          text-align: center;
          padding: 2rem 0;
        }

        .sb-results-scroll::-webkit-scrollbar { width: 4px; }
        .sb-results-scroll::-webkit-scrollbar-track { background: transparent; }
        .sb-results-scroll::-webkit-scrollbar-thumb { background: rgba(107,142,35,0.24); border-radius: 2px; }

        /* ── DARK MODE ── */
        html.dark-mode .sb-panel {
          background: rgba(30,41,59,0.85) !important;
          border-color: rgba(169,196,108,0.24) !important;
          box-shadow: 0 8px 40px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.05) inset !important;
        }
        html.dark-mode .sb-label-title {
          color: var(--text-primary) !important;
        }
        html.dark-mode .sb-label-caption {
          color: var(--text-secondary) !important;
        }
        html.dark-mode .sb-divider {
          background: rgba(169,196,108,0.18) !important;
        }
        html.dark-mode .sb-input {
          background: rgba(15,23,42,0.6) !important;
          border-color: rgba(169,196,108,0.20) !important;
          color: var(--text-primary) !important;
        }
        html.dark-mode .sb-input::placeholder { color: #64748B !important; }
        html.dark-mode .sb-input:focus {
          border-color: #A9C46C !important;
          box-shadow: 0 0 0 3px rgba(169,196,108,0.18) !important;
        }
        html.dark-mode .sb-close-btn { color: var(--text-secondary) !important; }
        html.dark-mode .sb-close-btn:hover { color: #A9C46C !important; }
        html.dark-mode .sb-result-row {
          background: rgba(30,41,59,0.65) !important;
          border-color: rgba(169,196,108,0.20) !important;
        }
        html.dark-mode .sb-result-row:hover {
          background: rgba(169,196,108,0.10) !important;
          border-color: rgba(169,196,108,0.35) !important;
        }
        html.dark-mode .sb-result-thumb { background: var(--bg-card) !important; }
        html.dark-mode .sb-result-name { color: var(--text-primary) !important; }
        html.dark-mode .sb-result-price { color: #A9C46C !important; }
        html.dark-mode .sb-empty { color: var(--text-secondary) !important; }
      `}</style>

      <div className="
        sb-overlay
        fixed inset-0
        z-50
        flex justify-center items-start
        pt-20
      " style={{ background: 'rgba(16,19,31,0.35)', backdropFilter: 'blur(4px)' }}>

        <div
          ref={searchRef}
          className="sb-panel w-[95%] sm:w-[600px] rounded-3xl p-5 border"
          style={{
            background: 'rgba(255,255,255,0.75)',
            borderColor: 'rgba(107,142,35,0.18)',
            backdropFilter: 'blur(24px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
            boxShadow: '0 8px 40px rgba(107,142,35,0.16), 0 1px 0 rgba(255,255,255,0.85) inset'
          }}
        >
          {/* Top bar label */}
          <div className="flex items-center justify-between mb-4">
            <span className="sb-label-title" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 600, fontSize: '1.05rem', color: '#10131F' }}>
              Find your <span style={{ color: '#6B8E23' }}>piece</span>
            </span>
            <span className="sb-label-caption" style={{ fontFamily: "'Jost', sans-serif", fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6B7280' }}>
              Search
            </span>
          </div>

          {/* Divider */}
          <div className="sb-divider mb-4" style={{ height: '1px', background: 'rgba(107,142,35,0.16)' }} />

          {/* INPUT */}
          <div className="flex items-center gap-3">
            <input
              autoFocus
              type="text"
              placeholder="Search products..."
              className="sb-input w-full p-3 rounded-xl"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="sb-close-btn p-1.5" onClick={() => setShowSearch(false)}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <line x1="1" y1="1" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="12" y1="1" x2="1" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* RESULTS */}
          {query && (
            <div className="sb-results-scroll mt-5 max-h-[400px] overflow-y-auto pr-1">
              {filteredProducts.length === 0 && (
                <p className="sb-empty">No products found</p>
              )}
              {filteredProducts.map(item => (
                <Link
                  to={`/product/${item.id}`}
                  key={item.id}
                  className="sb-result-row"
                  onClick={() => setShowSearch(false)}
                >
                  <img src={item.image} className="sb-result-thumb" alt={item.name} />
                  <div>
                    <p className="sb-result-name">{item.name}</p>
                    <p className="sb-result-price">₹{item.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchBar;