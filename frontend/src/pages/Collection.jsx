import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { Title } from "../components/Title";
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
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

        .col-root { font-family: 'Jost', sans-serif; }

        /* ── Sidebar ── */
        .col-sidebar {
          background: #E4DDD3;
          border: 1px solid #D4CCC0;
          border-radius: 2px;
          overflow: hidden;
        }

        .col-sidebar-topbar {
          background: #DAD3C8;
          border-bottom: 1px solid #D4CCC0;
          padding: 0.75rem 1.25rem;
        }

        .col-sidebar-body {
          padding: 1.25rem;
        }

        /* Category checkbox item */
        .col-cat-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0;
          cursor: pointer;
          border-bottom: 1px solid #D4CCC0;
          transition: padding-left 0.2s ease;
        }
        .col-cat-item:last-child { border-bottom: none; }
        .col-cat-item:hover { padding-left: 4px; }

        .col-cat-item input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border: 1.5px solid #D4CCC0;
          border-radius: 2px;
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
          background: #DAD3C8;
          transition: border-color 0.2s, background 0.2s;
        }
        .col-cat-item input[type="checkbox"]:checked {
          background: #2C2825;
          border-color: #2C2825;
        }
        .col-cat-item input[type="checkbox"]:checked::after {
          content: '';
          position: absolute;
          left: 3px; top: 0px;
          width: 5px; height: 9px;
          border: 2px solid #EDE8E0;
          border-top: none; border-left: none;
          transform: rotate(45deg);
        }

        .col-cat-label {
          font-family: 'Jost', sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: capitalize;
          color: #2C2825;
          transition: color 0.2s;
        }
        .col-cat-item:hover .col-cat-label { color: #8B6F5E; }

        /* Active filter pill */
        .col-active-pill {
          font-size: 0.58rem;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #9A9188;
          background: #DAD3C8;
          border: 1px solid #D4CCC0;
          padding: 0.25rem 0.65rem;
          border-radius: 2px;
          display: inline-flex;
          align-items: center;
          margin: 0.2rem 0.2rem 0 0;
        }

        /* ── Sort dropdown ── */
        .col-sort {
          font-family: 'Jost', sans-serif;
          font-size: 0.62rem;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #9A9188;
          border: 1px solid #D4CCC0;
          border-radius: 2px;
          padding: 0.55rem 2rem 0.55rem 0.85rem;
          outline: none;
          cursor: pointer;
          background: #E4DDD3;
          transition: border-color 0.2s, color 0.2s;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%239A9188'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.7rem center;
          background-color: #E4DDD3;
        }
        .col-sort:hover, .col-sort:focus {
          border-color: #8B6F5E;
          color: #2C2825;
        }

        /* ── Product count ── */
        .col-count {
          font-family: 'Jost', sans-serif;
          font-size: 0.6rem;
          font-weight: 500;
          letter-spacing: 0.2em;
          color: #9A9188;
          text-transform: uppercase;
        }

        /* ── Product cards ── */
        .col-card {
          position: relative;
          cursor: pointer;
        }

        .col-img-wrap {
          position: relative;
          overflow: hidden;
          border-radius: 2px;
          background: #DAD3C8;
          border: 1px solid #D4CCC0;
        }
        .col-img-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(44,40,37,0.45) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
          z-index: 1;
        }
        .col-card:hover .col-img-wrap::after { opacity: 1; }

        .col-img {
          width: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.7s cubic-bezier(0.76,0,0.24,1);
        }
        .col-card:hover .col-img { transform: scale(1.06); }

        /* View pill */
        .col-view-pill {
          position: absolute;
          bottom: 0.9rem;
          left: 50%;
          transform: translateX(-50%) translateY(6px);
          z-index: 2;
          font-family: 'Jost', sans-serif;
          font-size: 0.58rem;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #EDE8E0;
          background: rgba(44,40,37,0.82);
          border: 1px solid rgba(237,232,224,0.2);
          padding: 0.4rem 1rem;
          border-radius: 2px;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.3s ease;
          pointer-events: none;
        }
        .col-card:hover .col-view-pill {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        .col-name {
          font-family: 'Fraunces', serif;
          font-weight: 300;
          color: #2C2825;
          line-height: 1.3;
          transition: color 0.2s ease;
        }
        .col-card:hover .col-name { color: #8B6F5E; }

        .col-price {
          font-family: 'Jost', sans-serif;
          font-weight: 500;
          font-size: 0.8rem;
          letter-spacing: 0.06em;
          color: #8B6F5E;
        }

        /* Card entrance */
        @keyframes cartUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .col-card { animation: cartUp 0.45s ease both; }
        .col-card:nth-child(1)  { animation-delay: 0.04s; }
        .col-card:nth-child(2)  { animation-delay: 0.09s; }
        .col-card:nth-child(3)  { animation-delay: 0.14s; }
        .col-card:nth-child(4)  { animation-delay: 0.19s; }
        .col-card:nth-child(5)  { animation-delay: 0.24s; }
        .col-card:nth-child(6)  { animation-delay: 0.29s; }
        .col-card:nth-child(7)  { animation-delay: 0.34s; }
        .col-card:nth-child(8)  { animation-delay: 0.39s; }
        .col-card:nth-child(9)  { animation-delay: 0.44s; }
      `}</style>

      <div className="col-root flex flex-col sm:flex-row gap-8 pt-10 px-4 sm:px-6" style={{ color: '#2C2825' }}>

        {/* ── LEFT SIDEBAR ── */}
        <div className="w-full sm:w-48 flex-shrink-0 sm:pt-14">
          <div className="col-sidebar">

            {/* Sidebar top bar */}
            <div className="col-sidebar-topbar">
              <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A9188' }}>
                Categories
              </span>
            </div>

            {/* Category items */}
            <div className="col-sidebar-body">
              {categories.map((category) => (
                <label key={category} className="col-cat-item">
                  <input
                    type="checkbox"
                    onChange={() => toggleCategory(category)}
                  />
                  <span className="col-cat-label">{category}</span>
                </label>
              ))}
            </div>

          </div>

          {/* Active filter pills */}
          {selectedCategory.length > 0 && (
            <div className="mt-4">
              <p style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A9188', marginBottom: '0.5rem' }}>
                Active Filters
              </p>
              <div>
                {selectedCategory.map(c => (
                  <span key={c} className="col-active-pill">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PRODUCTS ── */}
        <div className="flex-1">

          {/* Title + sort row */}
          <div className="flex justify-between items-end mb-6 sm:mb-8">
            <div>
              <Title text1="ALL" text2="COLLECTIONS" />
              <p className="col-count mt-1">{filteredProducts.length} items</p>
            </div>
            <select
              onChange={(e) => setSortType(e.target.value)}
              className="col-sort mb-1"
            >
              <option value="relevant">Relevant</option>
              <option value="low-high">Price: Low → High</option>
              <option value="high-low">Price: High → Low</option>
            </select>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: '#D4CCC0', marginBottom: '2rem' }} />

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {filteredProducts.map((item) => (
              <Link key={item.id} to={`/product/${item.id}`}>
                <div className="col-card">

                  <div className="col-img-wrap">
                    <img src={item.image} className="col-img h-52 sm:h-72 md:h-96" />
                    <span className="col-view-pill">View Product</span>
                  </div>

                  <div className="mt-3 px-0.5">
                    <p className="col-name text-sm sm:text-base md:text-lg mb-1">{item.name}</p>
                    <p className="col-price">₹{item.price}</p>
                  </div>

                </div>
              </Link>
            ))}
          </div>

          {/* Empty state */}
          {filteredProducts.length === 0 && (
            <div className="py-24 text-center">
              <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontStyle: 'italic', fontSize: '1.5rem', color: '#D4CCC0' }}>
                No products found
              </p>
              <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A9188', marginTop: '0.5rem' }}>
                Try adjusting your filters
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Collection;