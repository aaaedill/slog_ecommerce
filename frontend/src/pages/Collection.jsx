import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const Collection = () => {

  const { products } = useContext(ShopContext);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");
  const categories = ["shirt", "tshirt", "hoodie", "pants"];

  const toggleCategory = (category) => {
    if (selectedCategory.includes(category)) {
      setSelectedCategory(selectedCategory.filter(item => item !== category));
    } else {
      setSelectedCategory([...selectedCategory, category]);
    }
  };

  let filteredProducts =
    selectedCategory.length === 0
      ? products
      : products.filter(item => selectedCategory.includes(item.category));

  if (sortType === "low-high") {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortType === "high-low") {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&display=swap');

        .col-page {
          --col-blue:          #2F5DFF;
          --col-blue-light:    #6E8BFF;
          --col-blue-deep:     #16307A;
          --col-blue-faint:    rgba(47,93,255,0.08);
          --col-ink:           #10131F;
          --col-ink-muted:     rgba(16,19,31,0.55);
          --col-ink-faint:     rgba(16,19,31,0.30);
          --col-glass-bg:      rgba(255,255,255,0.55);
          --col-glass-border:  rgba(47,93,255,0.16);
          --col-glass-shine:   rgba(255,255,255,0.85);

          /* Dark liquid glass tokens (sidebar / sort) */
          --col-dg-bg:         rgba(16,19,31,0.85);
          --col-dg-bg2:        rgba(16,19,31,0.95);
          --col-dg-border:     rgba(110,139,255,0.22);
          --col-dg-shine:      rgba(110,139,255,0.14);
          --col-dg-ink:        #C7D3FF;
          --col-dg-ink-muted:  rgba(199,211,255,0.72);
          --col-dg-ink-faint:  rgba(199,211,255,0.38);

          font-family: 'Outfit', sans-serif;
          color: var(--col-ink);
          padding: 2.5rem 2rem 5rem;

          background:
            radial-gradient(ellipse 70% 60% at 65% 0%, rgba(47,93,255,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 50% 80% at 15% 80%, rgba(110,139,255,0.05) 0%, transparent 60%),
            #FFFFFF;
        }

        /* ── LAYOUT ── */
        .col-layout {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          align-items: flex-start;
        }
        @media (min-width: 640px) {
          .col-layout { flex-direction: row; gap: 2.2rem; }
        }

        /* ═══════════════════════════════
           SIDEBAR — dark blue liquid glass
        ═══════════════════════════════ */
        .col-sidebar {
          width: 100%;
          flex-shrink: 0;
        }
        @media (min-width: 640px) {
          .col-sidebar { width: 13.5rem; }
        }

        .col-sidebar-panel {
          background: var(--col-dg-bg);
          border: 1px solid var(--col-dg-border);
          border-radius: 1.1rem;
          overflow: hidden;
          backdrop-filter: blur(32px) saturate(1.8);
          -webkit-backdrop-filter: blur(32px) saturate(1.8);
          box-shadow:
            0 1px 0 var(--col-dg-shine) inset,
            0 0 0 1px rgba(110,139,255,0.05) inset;
        }

        .col-sidebar-topbar {
          padding: 1rem 1.3rem;
          border-bottom: 1px solid var(--col-dg-border);
          display: flex;
          align-items: center;
          gap: 0.7rem;
          background: rgba(110,139,255,0.05);
        }
        .col-sidebar-topbar-line {
          width: 18px; height: 1px;
          background: var(--col-dg-ink);
          opacity: 0.45;
          flex-shrink: 0;
        }
        .col-sidebar-topbar span {
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--col-dg-ink);
        }

        .col-sidebar-body { padding: 0.3rem 0; }

        .col-cat-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.78rem 1.3rem;
          cursor: pointer;
          border-bottom: 1px solid rgba(110,139,255,0.10);
          transition: background 0.2s, padding-left 0.25s;
        }
        .col-cat-item:last-child { border-bottom: none; }
        .col-cat-item:hover {
          background: rgba(110,139,255,0.10);
          padding-left: 1.65rem;
        }

        .col-cat-item input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border: 1.5px solid rgba(110,139,255,0.40);
          border-radius: 3px;
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
          background: rgba(110,139,255,0.08);
          transition: border-color 0.2s, background 0.2s;
        }
        .col-cat-item input[type="checkbox"]:checked {
          background: var(--col-blue);
          border-color: var(--col-blue);
        }
        .col-cat-item input[type="checkbox"]:checked::after {
          content: '';
          position: absolute;
          left: 3px; top: 0px;
          width: 5px; height: 9px;
          border: 1.5px solid #FFFFFF;
          border-top: none; border-left: none;
          transform: rotate(45deg);
        }

        .col-cat-label {
          font-size: 0.85rem;
          font-weight: 400;
          letter-spacing: 0.01em;
          text-transform: capitalize;
          color: var(--col-dg-ink-muted);
          transition: color 0.2s;
        }
        .col-cat-item:hover .col-cat-label { color: var(--col-dg-ink); }

        /* Active filter pills */
        .col-active-pills {
          margin-top: 0.75rem;
          padding: 0.9rem 1.1rem;
          background: var(--col-dg-bg);
          border: 1px solid var(--col-dg-border);
          border-radius: 1rem;
          backdrop-filter: blur(24px) saturate(1.8);
          -webkit-backdrop-filter: blur(24px) saturate(1.8);
          box-shadow: 0 1px 0 var(--col-dg-shine) inset;
        }
        .col-active-pills-label {
          font-size: 0.62rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--col-dg-ink-faint);
          margin-bottom: 0.5rem;
          display: block;
        }
        .col-active-pill {
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: var(--col-dg-ink);
          background: rgba(110,139,255,0.16);
          border: 1px solid rgba(110,139,255,0.28);
          padding: 0.26rem 0.7rem;
          border-radius: 100px;
          display: inline-flex;
          align-items: center;
          margin: 0.2rem 0.2rem 0 0;
        }

        /* ═══════════════════════════════
           PRODUCTS AREA
        ═══════════════════════════════ */
        .col-products { flex: 1; min-width: 0; }

        .col-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 1.5rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .col-title {
          font-weight: 600;
          font-size: clamp(1.9rem, 3.5vw, 3rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: var(--col-ink);
        }
        .col-title em {
          font-style: normal;
          font-weight: 600;
          color: var(--col-blue);
        }

        .col-count {
          font-size: 0.7rem;
          font-weight: 400;
          letter-spacing: 0.14em;
          color: var(--col-ink-faint);
          text-transform: uppercase;
          margin-top: 0.5rem;
        }

        /* ── SORT — dark blue liquid glass, mirrors sidebar ── */
        .col-sort-wrap {
          position: relative;
          flex-shrink: 0;
          align-self: flex-end;
        }
        .col-sort {
          font-family: 'Outfit', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--col-dg-ink);
          border: 1px solid var(--col-dg-border);
          border-radius: 0.75rem;
          padding: 0.68rem 2.6rem 0.68rem 1.1rem;
          outline: none;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          background: var(--col-dg-bg);
          backdrop-filter: blur(32px) saturate(1.8);
          -webkit-backdrop-filter: blur(32px) saturate(1.8);
          box-shadow: 0 1px 0 var(--col-dg-shine) inset;
          transition: background 0.22s, color 0.22s;
        }
        .col-sort:hover, .col-sort:focus {
          background: var(--col-dg-bg2);
          color: #FFFFFF;
        }
        .col-sort option {
          background: #10131F;
          color: #C7D3FF;
          font-size: 0.8rem;
          letter-spacing: 0.02em;
          text-transform: none;
        }
        .col-sort-wrap::after {
          content: '';
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          width: 0; height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid rgba(199,211,255,0.75);
        }

        /* Divider */
        .col-divider {
          height: 1px;
          background: var(--col-glass-border);
          margin-bottom: 2rem;
        }

        /* ═══════════════════════════════
           GRID — 3 columns
        ═══════════════════════════════ */
        .col-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.4rem;
        }
        @media (max-width: 900px) {
          .col-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .col-grid { grid-template-columns: 1fr; }
        }

        /* ── CARD ── */
        .col-card { position: relative; cursor: pointer; }

        .col-img-wrap {
          position: relative;
          overflow: hidden;
          border-radius: 0.85rem;
          background: var(--col-glass-bg);
          border: 1px solid var(--col-glass-border);
          box-shadow: 0 1px 0 var(--col-glass-shine) inset;
          transition: border-color 0.3s;
        }
        .col-card:hover .col-img-wrap { border-color: rgba(47,93,255,0.32); }
        .col-img-wrap::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(16,19,31,0.45) 0%, transparent 55%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
          z-index: 1;
        }
        .col-card:hover .col-img-wrap::after { opacity: 1; }

        .col-img {
          width: 100%;
          height: 18rem;
          object-fit: cover;
          display: block;
          transition: transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        @media (max-width: 640px) { .col-img { height: 14rem; } }
        .col-card:hover .col-img { transform: scale(1.05); }

        .col-view-pill {
          position: absolute;
          bottom: 0.9rem; left: 50%;
          transform: translateX(-50%) translateY(8px);
          z-index: 2;
          font-family: 'Outfit', sans-serif;
          font-size: 0.62rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: #FFFFFF;
          background: var(--col-blue);
          padding: 0.5rem 1.2rem;
          border-radius: 100px;
          white-space: nowrap;
          opacity: 0;
          box-shadow: 0 8px 24px rgba(47,93,255,0.35);
          transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1);
          pointer-events: none;
        }
        .col-card:hover .col-view-pill { opacity: 1; transform: translateX(-50%) translateY(0); }

        .col-info {
          margin-top: 0.8rem;
          padding: 0 0.2rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .col-name {
          font-weight: 500;
          font-size: 1rem;
          line-height: 1.3;
          letter-spacing: -0.005em;
          color: var(--col-ink);
          transition: color 0.2s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .col-card:hover .col-name { color: var(--col-blue-deep); }

        .col-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .col-price {
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          letter-spacing: 0.01em;
          color: var(--col-blue);
        }
        .col-arrow {
          width: 22px; height: 22px;
          border: 1px solid var(--col-glass-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.7) rotate(-45deg);
          transition: opacity 0.3s, transform 0.3s, border-color 0.2s, background 0.2s;
          flex-shrink: 0;
        }
        .col-card:hover .col-arrow {
          opacity: 1; transform: scale(1) rotate(0deg);
          border-color: var(--col-blue-light);
          background: var(--col-blue-faint);
        }

        @keyframes colBlurIn {
          from { opacity: 0; filter: blur(10px); transform: translateY(14px) scale(0.98); }
          to   { opacity: 1; filter: blur(0); transform: translateY(0) scale(1); }
        }
        .col-card { animation: colBlurIn 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .col-card:nth-child(1)  { animation-delay: 0.04s; }
        .col-card:nth-child(2)  { animation-delay: 0.09s; }
        .col-card:nth-child(3)  { animation-delay: 0.14s; }
        .col-card:nth-child(4)  { animation-delay: 0.19s; }
        .col-card:nth-child(5)  { animation-delay: 0.24s; }
        .col-card:nth-child(6)  { animation-delay: 0.29s; }
        .col-card:nth-child(7)  { animation-delay: 0.34s; }
        .col-card:nth-child(8)  { animation-delay: 0.39s; }
        .col-card:nth-child(9)  { animation-delay: 0.44s; }

        .col-empty {
          padding: 6rem 0;
          text-align: center;
          grid-column: 1 / -1;
        }
        .col-empty-title {
          font-weight: 500;
          font-size: 1.6rem;
          color: var(--col-ink-faint);
        }
        .col-empty-sub {
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--col-ink-faint);
          margin-top: 0.5rem;
        }

        @media (max-width: 480px) {
          .col-page { padding: 1.5rem 1rem 4rem; }
          .col-title { font-size: 1.8rem; }
          .col-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
        }

        /* ── DARK MODE ── */
        /* Re-point this page's local ink/glass tokens at the app's dark-mode
           text and surface colors, so every rule above that already reads
           from --col-ink / --col-glass-* flips automatically. */
        html.dark-mode .col-page {
          background-color: #000000 !important;
          background-image:
            radial-gradient(ellipse 70% 60% at 65% 0%, rgba(96,130,255,0.10) 0%, transparent 70%),
            radial-gradient(ellipse 50% 80% at 15% 80%, rgba(110,139,255,0.08) 0%, transparent 60%) !important;
          --col-ink:          #F8FAFC;
          --col-ink-muted:    rgba(248,250,252,0.65);
          --col-ink-faint:    rgba(248,250,252,0.38);
          --col-glass-bg:     rgba(30,41,59,0.65);
          --col-glass-border: rgba(96,130,255,0.22);
          --col-glass-shine:  rgba(255,255,255,0.04);
        }
      `}</style>

      <div className="col-page">
        <div className="col-layout">

          {/* ── SIDEBAR ── */}
          <div className="col-sidebar">
            <div className="col-sidebar-panel">
              <div className="col-sidebar-topbar">
                <div className="col-sidebar-topbar-line" />
                <span>Categories</span>
              </div>
              <div className="col-sidebar-body">
                {categories.map((category) => (
                  <label key={category} className="col-cat-item">
                    <input type="checkbox" onChange={() => toggleCategory(category)} />
                    <span className="col-cat-label">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedCategory.length > 0 && (
              <div className="col-active-pills">
                <span className="col-active-pills-label">Active Filters</span>
                <div>
                  {selectedCategory.map(c => (
                    <span key={c} className="col-active-pill">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── PRODUCTS ── */}
          <div className="col-products">

            <div className="col-header">
              <div>
                <h2 className="col-title">All <em>Collections</em></h2>
                <p className="col-count">{filteredProducts.length} pieces</p>
              </div>

              <div className="col-sort-wrap">
                <select onChange={(e) => setSortType(e.target.value)} className="col-sort">
                  <option value="relevant">Relevant</option>
                  <option value="low-high">Price: Low → High</option>
                  <option value="high-low">Price: High → Low</option>
                </select>
              </div>
            </div>

            <div className="col-divider" />

            <div className="col-grid">
              {filteredProducts.length === 0 ? (
                <div className="col-empty">
                  <p className="col-empty-title">No products found</p>
                  <p className="col-empty-sub">Try adjusting your filters</p>
                </div>
              ) : (
                filteredProducts.map((item, i) => (
                  <Link key={item.id} to={`/product/${item.id}`} style={{ display: 'block' }}>
                    <div className="col-card">
                      <div className="col-img-wrap">
                        <img src={item.image} className="col-img" alt={item.name} />
                        <span className="col-view-pill">View Product</span>
                      </div>
                      <div className="col-info">
                        <p className="col-name">{item.name}</p>
                        <div className="col-bottom">
                          <span className="col-price">₹{item.price}</span>
                          <div className="col-arrow">
                            <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#2F5DFF" strokeWidth="1.5">
                              <path d="M2 10L10 2M10 2H4M10 2V8"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Collection;