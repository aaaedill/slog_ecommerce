import React, {
  useContext,
  useState,
  useRef,
  useEffect
} from "react";

import { ShopContext } from "../context/ShopContext";
import { Link, useNavigate } from "react-router-dom";

const Collection = () => {
  const {
    products,
    user,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  } = useContext(ShopContext);

  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");
  const [wishlistLoading, setWishlistLoading] = useState({});

  const categories = ["shirt", "tshirt", "hoodie", "pants"];

  const rootRef = useRef(null);

  // =========================================================
  // CATEGORY FILTER
  // =========================================================

  const toggleCategory = (category) => {
    setSelectedCategory((previousCategories) => {
      if (previousCategories.includes(category)) {
        return previousCategories.filter(
          (item) => item !== category
        );
      }

      return [
        ...previousCategories,
        category
      ];
    });
  };

  // =========================================================
  // WISHLIST HELPERS
  // =========================================================

  const getProductIdentifier = (product) => {
    return String(
      product?.id ??
      product?._id ??
      ""
    );
  };

  const isProductWishlisted = (product) => {
    const productId = getProductIdentifier(product);

    if (!productId) {
      return false;
    }

    return isInWishlist(productId);
  };

  const handleWishlistToggle = async (
    event,
    product
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const productId = getProductIdentifier(product);

    if (!productId) {
      return;
    }

    if (wishlistLoading[productId]) {
      return;
    }

    if (!user) {
      const returnTo =
        window.location.pathname +
        window.location.search;

      localStorage.setItem(
        "pendingWishlist",
        JSON.stringify({
          productId,
          returnTo
        })
      );

      navigate("/login", {
        state: {
          from: returnTo
        }
      });

      return;
    }

    setWishlistLoading((previous) => ({
      ...previous,
      [productId]: true
    }));

    try {
      const wasWishlisted = isInWishlist(productId);

      const result = wasWishlisted
        ? await removeFromWishlist(productId)
        : await addToWishlist(productId);

      if (!result?.success) {
        console.error(
          result?.message ||
            "Unable to update wishlist."
        );
      }
    } catch (error) {
      console.error(
        "Wishlist update error:",
        error
      );
    } finally {
      setWishlistLoading((previous) => ({
        ...previous,
        [productId]: false
      }));
    }
  };

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================

  let filteredProducts =
    selectedCategory.length === 0
      ? products
      : products.filter((item) =>
          selectedCategory.includes(
            String(item.category || "").toLowerCase()
          )
        );

  // =========================================================
  // SORT PRODUCTS
  // =========================================================

  if (sortType === "low-high") {
    filteredProducts = [
      ...filteredProducts
    ].sort(
      (a, b) =>
        Number(a.price) - Number(b.price)
    );
  } else if (sortType === "high-low") {
    filteredProducts = [
      ...filteredProducts
    ].sort(
      (a, b) =>
        Number(b.price) - Number(a.price)
    );
  }

  // =========================================================
  // SCROLL-TRIGGERED REVEAL
  // =========================================================

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const targets = root.querySelectorAll(
      ".col-header, .col-filter-row, .col-card"
    );

    if (!("IntersectionObserver" in window)) {
      targets.forEach((element) => {
        element.classList.add("col-in-view");
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("col-in-view");

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12
      }
    );

    targets.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [
    filteredProducts.length,
    selectedCategory,
    sortType
  ]);

  // =========================================================
  // COLLECTION PAGE
  // =========================================================

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap');

        /* =====================================================
           FULL COLLECTION PAGE
        ===================================================== */

        .col-page {
          --col-bg: var(--bg-primary);
          --col-card-bg: transparent;
          --col-card-hover: transparent;
          --col-olive: #6B8E23;
          --col-olive-light: #A9C46C;
          --col-olive-deep: #4B5320;
          --col-olive-faint: rgba(107, 142, 35, 0.08);
          --col-ink: #10131F;
          --col-ink-muted: rgba(16, 19, 31, 0.55);
          --col-ink-faint: rgba(16, 19, 31, 0.30);
          --col-glass-bg: transparent;
          --col-glass-bg2: transparent;
          --col-glass-border: rgba(107, 142, 35, 0.16);
          --col-glass-shine: transparent;

          font-family: 'Jost', sans-serif;
          color: var(--col-ink);
          width: 100%;
          min-height: 100vh;
          background: var(--col-bg);
          padding: clamp(2.5rem, 7vw, 5rem) calc(clamp(1rem, 3vw, 2.5rem) + max(0px, (100% - 1440px) / 2)) clamp(3.5rem, 9vw, 6rem);
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }

        .col-page *,
        .col-page *::before,
        .col-page *::after {
          box-sizing: border-box;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .col-header {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: clamp(1.25rem, 3vw, 2rem);
        }

        .col-title {
          font-weight: 600;
          font-size: clamp(1.7rem, 1.2rem + 2.2vw, 3rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: var(--col-ink);
        }

        .col-title em {
          font-style: normal;
          font-weight: 600;
          color: var(--col-olive);
        }

        .col-count {
          font-size: 0.7rem;
          font-weight: 400;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--col-ink-faint);
          margin-top: 0.6rem;
        }

        /* =====================================================
           FILTER ROW
        ===================================================== */

        .col-filter-row {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.9rem;
          padding-bottom: clamp(1.1rem, 2.5vw, 1.6rem);
          margin-bottom: clamp(1.5rem, 4vw, 2.4rem);
          border-bottom: 1px solid var(--col-glass-border);
        }

        .col-cat-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem;
        }

        .col-cat-chip {
          font-family: 'Jost', sans-serif;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--col-ink-muted);
          background: var(--col-glass-bg);
          border: 1px solid var(--col-glass-border);
          border-radius: 100px;
          padding: 0.55rem 1.15rem;
          cursor: pointer;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          box-shadow: none;
          transition:
            background 0.22s ease,
            color 0.22s ease,
            border-color 0.22s ease,
            transform 0.22s ease,
            box-shadow 0.22s ease;
        }

        .col-cat-chip:hover {
          background: var(--col-glass-bg2);
          color: var(--col-olive-deep);
          transform: translateY(-1px);
        }

        .col-cat-chip.is-active {
          background: var(--col-olive);
          border-color: var(--col-olive);
          color: #FFFFFF;
          box-shadow: 0 8px 20px rgba(107, 142, 35, 0.28);
        }

        /* =====================================================
           SORT
        ===================================================== */

        .col-sort-wrap {
          position: relative;
          flex-shrink: 0;
        }

        .col-sort {
          font-family: 'Jost', sans-serif;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--col-olive-deep);
          border: 1px solid var(--col-glass-border);
          border-radius: 100px;
          padding: 0.65rem 2.4rem 0.65rem 1.2rem;
          outline: none;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          background: var(--col-glass-bg);
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          box-shadow: none;
          transition:
            background 0.22s ease,
            box-shadow 0.22s ease,
            transform 0.22s ease;
        }

        .col-sort:hover,
        .col-sort:focus {
          background: var(--col-glass-bg2);
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(107, 142, 35, 0.14);
        }

        .col-sort option {
          background: #FAF8F4;
          color: var(--col-olive-deep);
          font-size: 0.8rem;
          letter-spacing: 0.02em;
          text-transform: none;
        }

        .col-sort-wrap::after {
          content: '';
          position: absolute;
          right: 1.05rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid var(--col-olive-deep);
        }

        /* =====================================================
           PRODUCT GRID
        ===================================================== */

        .col-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: clamp(1rem, 3vw, 1.75rem) clamp(0.4rem, 1.6vw, 1.4rem);
          width: 100%;
        }

        @media (max-width: 900px) {
          .col-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 480px) {
          .col-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        /* =====================================================
           TRANSPARENT PRODUCT CARD
        ===================================================== */

        .col-card {
          position: relative;
          background: transparent;
          border: 0;
          border-radius: 0;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: none;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          transition:
            background 0.35s ease,
            border-color 0.35s ease,
            transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.4s ease;
        }

        .col-card:hover {
          background: transparent;
          border-color: transparent;
          transform: translateY(-6px) scale(1.01);
          box-shadow: none;
        }

        .col-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(
            to right,
            var(--col-olive-deep),
            var(--col-olive-light)
          );
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 5;
          border-radius: 0;
          pointer-events: none;
        }

        .col-card:hover::before {
          transform: scaleX(1);
        }

        /* =====================================================
           PRODUCT IMAGE
        ===================================================== */

        .col-img-wrap {
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .col-img {
          width: 100%;
          aspect-ratio: 4 / 3;
          height: auto;
          object-fit: cover;
          display: block;
          transition: transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        @media (max-width: 640px) {
          .col-img {
            aspect-ratio: 4 / 5;
            height: auto;
          }
        }

        @media (max-width: 1024px) {
          .col-img {
            aspect-ratio: 5 / 4;
            height: auto;
          }
        }

        .col-card:hover .col-img {
          transform: scale(1.06);
        }

        /* =====================================================
           WISHLIST HEART BUTTON
        ===================================================== */

        .col-wishlist-button {
          position: absolute;
          top: clamp(0.4rem, 1.5vw, 0.9rem);
          right: clamp(0.4rem, 1.5vw, 0.9rem);
          z-index: 8;
          width: clamp(34px, 6vw, 42px);
          height: clamp(34px, 6vw, 42px);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.65);
          border-radius: 50%;
          background: rgba(250, 248, 244, 0.92);
          color: #4B5320;
          cursor: pointer;
          padding: 0;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.10);
          transition:
            color 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease;
        }

        .col-wishlist-button:hover {
          transform: scale(1.08);
          background: #FFFFFF;
        }

        .col-wishlist-button.is-saved {
          color: #B42335;
          background: #FFFFFF;
          border-color: rgba(180, 35, 53, 0.3);
        }

        .col-wishlist-button:disabled {
          cursor: wait;
          opacity: 0.65;
        }

        .col-wishlist-button svg {
          width: clamp(15px, 4vw, 20px);
          height: clamp(15px, 4vw, 20px);
          display: block;
          pointer-events: none;
        }

        html.dark-mode .col-wishlist-button {
          background: rgba(20, 20, 20, 0.94);
          border-color: rgba(255, 255, 255, 0.18);
          color: #E5E5E5;
        }

        html.dark-mode .col-wishlist-button.is-saved {
          color: #FF6B7A;
          background: #171717;
          border-color: rgba(255, 107, 122, 0.45);
        }

        html.dark-mode .col-wishlist-button:hover {
          background: #252525;
        }

        /* =====================================================
           VIEW PRODUCT PILL
        ===================================================== */

        .col-view-pill {
          position: absolute;
          bottom: 1.1rem;
          left: 50%;
          transform: translateX(-50%) translateY(12px) scale(0.92);
          z-index: 3;
          font-family: 'Jost', sans-serif;
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: #FFFFFF;
          background: var(--col-olive);
          padding: 0.55rem 1.4rem;
          border-radius: 100px;
          white-space: nowrap;
          opacity: 0;
          box-shadow: 0 8px 24px rgba(107, 142, 35, 0.35);
          transition:
            opacity 0.3s ease,
            transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }

        .col-card:hover .col-view-pill {
          opacity: 1;
          transform: translateX(-50%) translateY(0) scale(1);
        }

        /* =====================================================
           PRODUCT INFORMATION
        ===================================================== */

        .col-info {
          padding: clamp(0.6rem, 1.2vw, 1.2rem) clamp(0.15rem, 0.9vw, 1rem) clamp(0.8rem, 1.6vw, 1.4rem);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          border-top: 0;
          flex: 1;
          background: transparent;
        }

        .col-name {
          font-weight: 500;
          font-size: clamp(0.72rem, 0.55rem + 0.55vw, 1rem);
          line-height: 1.3;
          letter-spacing: -0.005em;
          color: var(--col-ink);
          transition: color 0.25s;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          min-height: 2.6em;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .col-card:hover .col-name {
          color: var(--col-olive-deep);
        }

        .col-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.2rem;
        }

        .col-price {
          font-family: 'Jost', sans-serif;
          font-size: clamp(0.78rem, 0.65rem + 0.35vw, 0.9rem);
          font-weight: 600;
          letter-spacing: 0.01em;
          color: var(--col-olive);
        }

        /* =====================================================
           ARROW
        ===================================================== */

        .col-arrow {
          width: 24px;
          height: 24px;
          border: 1px solid var(--col-glass-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.6) rotate(-45deg);
          transition:
            opacity 0.3s ease,
            transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
            border-color 0.2s,
            background 0.2s;
          flex-shrink: 0;
        }

        .col-card:hover .col-arrow {
          opacity: 1;
          transform: scale(1) rotate(0deg);
          border-color: var(--col-olive-light);
          background: var(--col-olive-faint);
        }

        /* =====================================================
           EMPTY STATE
        ===================================================== */

        .col-empty {
          padding: clamp(3rem, 10vw, 6rem) 0;
          text-align: center;
          grid-column: 1 / -1;
        }

        .col-empty-title {
          font-weight: 500;
          font-size: 1.5rem;
          color: var(--col-ink-faint);
        }

        .col-empty-sub {
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--col-ink-faint);
          margin-top: 0.5rem;
        }

        /* =====================================================
           SCROLL-REVEAL ANIMATION
        ===================================================== */

        @keyframes col-blur-in {
          from {
            opacity: 0;
            filter: blur(10px);
            transform: translateY(14px) scale(0.98);
          }

          to {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0) scale(1);
          }
        }

        .col-header,
        .col-filter-row,
        .col-card {
          animation: col-blur-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-play-state: paused;
        }

        .col-header.col-in-view,
        .col-filter-row.col-in-view,
        .col-card.col-in-view {
          animation-play-state: running;
        }

        .col-filter-row {
          animation-delay: 0.08s;
        }

        .col-card:nth-child(1) {
          animation-delay: 0.05s;
        }

        .col-card:nth-child(2) {
          animation-delay: 0.10s;
        }

        .col-card:nth-child(3) {
          animation-delay: 0.15s;
        }

        .col-card:nth-child(4) {
          animation-delay: 0.20s;
        }

        .col-card:nth-child(5) {
          animation-delay: 0.25s;
        }

        .col-card:nth-child(6) {
          animation-delay: 0.30s;
        }

        .col-card:nth-child(7) {
          animation-delay: 0.35s;
        }

        .col-card:nth-child(8) {
          animation-delay: 0.40s;
        }

        .col-card:nth-child(9) {
          animation-delay: 0.45s;
        }

        @media (prefers-reduced-motion: reduce) {
          .col-header,
          .col-filter-row,
          .col-card {
            animation: none !important;
            opacity: 1 !important;
            filter: none !important;
            transform: none !important;
          }
        }

        /* =====================================================
           DARK MODE
        ===================================================== */

        html.dark-mode .col-page {
          background-color: #000000 !important;
          background-image: none !important;

          --col-card-bg: transparent;
          --col-card-hover: transparent;
          --col-olive-deep: #A9C46C;
          --col-ink: var(--text-primary);
          --col-ink-muted: var(--text-secondary);
          --col-ink-faint: var(--text-secondary);
          --col-glass-bg: transparent;
          --col-glass-bg2: transparent;
          --col-glass-border: rgba(169, 196, 108, 0.20);
          --col-glass-shine: transparent;
        }

        html.dark-mode .col-card {
          background: transparent !important;
          border: 0 !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }

        html.dark-mode .col-info {
          background: transparent !important;
          border-top: 0 !important;
        }

        html.dark-mode .col-sort option {
          background: #000000;
          color: #A9C46C;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 768px) {
          .col-page {
            padding: 3rem 1.5rem 4rem;
          }

          .col-filter-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .col-sort-wrap {
            align-self: flex-start;
          }
        }

        @media (max-width: 480px) {
          .col-page {
            padding: 2.5rem 1rem 3.5rem;
          }

          .col-title {
            font-size: 1.7rem;
          }

          .col-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .col-wishlist-button {
            width: 30px;
            height: 30px;
            top: 0.4rem;
            right: 0.4rem;
          }
        }

        /* =====================================================
           RESPONSIVE ADDITIONS
        ===================================================== */

        /* Grid items may shrink so 3 columns never overflow */
        .col-grid > a {
          min-width: 0;
        }

        /* Phones: portrait images (they have to stay tall and narrow in 3 columns) */
        @media (max-width: 640px) {
          .col-img {
            aspect-ratio: 4 / 5;
          }
        }

        @media (max-width: 480px) {
          .col-wishlist-button svg {
            width: 15px;
            height: 15px;
          }

          .col-cat-chip {
            padding: 0.5rem 0.95rem;
          }
        }

        /* Touch screens: no hover effects stuck after a tap,
           and comfortable tap sizes for the filters */
        @media (hover: none) {
          .col-card:hover .col-img {
            transform: none;
          }

          .col-card:hover::before {
            transform: scaleX(0);
          }

          .col-card:hover .col-view-pill {
            opacity: 0;
            transform: translateX(-50%) translateY(12px) scale(0.92);
          }

          .col-card:hover .col-arrow {
            opacity: 0;
            transform: scale(0.6) rotate(-45deg);
          }
        }

        @media (pointer: coarse) {
          .col-cat-chip,
          .col-sort {
            min-height: 2.5rem;
          }
        }
      `}</style>

      <div
        className="col-page"
        ref={rootRef}
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="col-header">
          <div>
            <h2 className="col-title">
              All{" "}
              <em>
                Collections
              </em>
            </h2>

            <p className="col-count">
              {filteredProducts.length} pieces
            </p>
          </div>
        </div>

        {/* ==================================================
            FILTER ROW
        ================================================== */}

        <div className="col-filter-row">
          <div className="col-cat-list">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`
                  col-cat-chip
                  ${
                    selectedCategory.includes(category)
                      ? "is-active"
                      : ""
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="col-sort-wrap">
            <select
              value={sortType}
              onChange={(event) => {
                setSortType(event.target.value);
              }}
              className="col-sort"
              aria-label="Sort products"
            >
              <option value="relevant">
                Relevant
              </option>

              <option value="low-high">
                Price: Low → High
              </option>

              <option value="high-low">
                Price: High → Low
              </option>
            </select>
          </div>
        </div>

        {/* ==================================================
            PRODUCT GRID
        ================================================== */}

        <div className="col-grid">
          {filteredProducts.length === 0 ? (
            <div className="col-empty">
              <p className="col-empty-title">
                No products found
              </p>

              <p className="col-empty-sub">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            filteredProducts.map((item) => {
              const productId = getProductIdentifier(item);
              const saved = isProductWishlisted(item);
              const loading = Boolean(
                wishlistLoading[productId]
              );

              return (
                <Link
                  key={productId}
                  to={`/product/${productId}`}
                  style={{
                    display: "block",
                    textDecoration: "none"
                  }}
                >
                  <div className="col-card">
                    {/* PRODUCT IMAGE */}

                    <div className="col-img-wrap">
                      <img
                        src={item.image}
                        className="col-img"
                        alt={item.name}
                        loading="lazy"
                      />

                      {/* WISHLIST HEART */}

                      <button
                        type="button"
                        className={`
                          col-wishlist-button
                          ${saved ? "is-saved" : ""}
                        `}
                        onClick={(event) => {
                          handleWishlistToggle(
                            event,
                            item
                          );
                        }}
                        disabled={loading}
                        aria-label={
                          saved
                            ? `Remove ${item.name} from wishlist`
                            : `Add ${item.name} to wishlist`
                        }
                        aria-pressed={saved}
                        title={
                          saved
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill={saved ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
                        </svg>
                      </button>

                      <span className="col-view-pill">
                        View Product
                      </span>
                    </div>

                    {/* PRODUCT INFORMATION */}

                    <div className="col-info">
                      <p className="col-name">
                        {item.name}
                      </p>

                      <div className="col-bottom">
                        <span className="col-price">
                          ₹{item.price}
                        </span>

                        <div className="col-arrow">
                          <svg
                            width="8"
                            height="8"
                            viewBox="0 0 12 12"
                            fill="none"
                            stroke="#4B5320"
                            strokeWidth="1.5"
                            aria-hidden="true"
                          >
                            <path d="M2 10 L10 2 M10 2 H4 M10 2 V8" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default Collection;