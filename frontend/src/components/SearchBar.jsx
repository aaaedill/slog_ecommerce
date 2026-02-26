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
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

        .sb-overlay {
          animation: sbFadeIn 0.2s ease both;
        }
        @keyframes sbFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .sb-panel {
          animation: sbSlideDown 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes sbSlideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .sb-input {
          font-family: 'Jost', sans-serif;
          font-weight: 300;
          font-size: 0.85rem;
          letter-spacing: 0.05em;
          background: #EDE8E0;
          border: 1px solid #D4CCC0;
          color: #2C2825;
          outline: none;
          transition: border-color 0.2s ease;
        }
        .sb-input::placeholder { color: #9A9188; }
        .sb-input:focus { border-color: #8B6F5E; }

        .sb-close-btn {
          font-family: 'Jost', sans-serif;
          color: #9A9188;
          transition: color 0.2s ease;
          background: none;
          border: none;
          cursor: pointer;
          line-height: 1;
        }
        .sb-close-btn:hover { color: #8B6F5E; }

        .sb-result-row {
          display: flex;
          gap: 1rem;
          align-items: center;
          border: 1px solid #D4CCC0;
          padding: 0.6rem;
          border-radius: 0.25rem;
          margin-bottom: 0.5rem;
          background: #EDE8E0;
          transition: background 0.2s ease;
          text-decoration: none;
        }
        .sb-result-row:hover { background: #DAD3C8; }

        .sb-result-thumb {
          width: 60px;
          height: 75px;
          object-fit: cover;
          border-radius: 2px;
          flex-shrink: 0;
          background: #DAD3C8;
        }

        .sb-result-name {
          font-family: 'Fraunces', serif;
          font-weight: 300;
          font-size: 0.95rem;
          color: #2C2825;
          margin-bottom: 0.2rem;
        }

        .sb-result-price {
          font-family: 'Jost', sans-serif;
          font-weight: 500;
          font-size: 0.78rem;
          letter-spacing: 0.04em;
          color: #8B6F5E;
        }

        .sb-empty {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 1rem;
          color: #D4CCC0;
          text-align: center;
          padding: 2rem 0;
        }

        .sb-results-scroll::-webkit-scrollbar { width: 4px; }
        .sb-results-scroll::-webkit-scrollbar-track { background: #EDE8E0; }
        .sb-results-scroll::-webkit-scrollbar-thumb { background: #D4CCC0; border-radius: 2px; }
      `}</style>

      <div className="
        sb-overlay
        fixed inset-0
        z-50
        flex justify-center items-start
        pt-20
      " style={{ background: 'rgba(44,40,37,0.25)', backdropFilter: 'blur(4px)' }}>

        <div
          ref={searchRef}
          className="sb-panel w-[95%] sm:w-[600px] rounded-3xl p-5 border"
          style={{ background: '#E4DDD3', borderColor: '#D4CCC0', boxShadow: '0 8px 40px rgba(44,40,37,0.12)' }}
        >
          {/* Top bar label */}
          <div className="flex items-center justify-between mb-4">
            <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: '1.05rem', color: '#2C2825' }}>
              Find your <i style={{ color: '#8B6F5E' }}>piece</i>
            </span>
            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '0.6rem', fontWeight: 400, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A9188' }}>
              Search
            </span>
          </div>

          {/* Divider */}
          <div className="mb-4" style={{ height: '1px', background: '#D4CCC0' }} />

          {/* INPUT */}
          <div className="flex items-center gap-3">
            <input
              autoFocus
              type="text"
              placeholder="Search products..."
              className="sb-input w-full p-3 rounded-sm"
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