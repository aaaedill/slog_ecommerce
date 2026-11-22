import React, {
  useEffect,
  useState,
  useCallback
} from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";

import API_URL from "../../config/api";


/* ── Glass Toast (black + red theme) ── */

const ToastContainer = ({ toasts }) => (
  <div style={{
    position: "fixed", top: "100px", left: "50%", transform: "translateX(-50%)",
    zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "stretch",
    gap: "10px", width: "min(340px, calc(100vw - 32px))", pointerEvents: "none",
  }}>
    <style>{`
      @keyframes toastIn  { from{opacity:0;transform:translateY(-10px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes toastOut { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(-8px) scale(0.97)} }
    `}</style>

    {toasts.map((t) => (
      <div key={t.id} style={{
        display: "flex", alignItems: "center", gap: "12px", padding: "13px 18px",
        background: "rgba(0,0,0,0.6)",
        border: t.type === "error"
          ? "1px solid rgba(255,45,63,0.6)"
          : "1px solid rgba(255,255,255,0.22)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderRadius: "14px",
        color: "#ffffff", fontSize: "14px", fontWeight: 600,
        fontFamily: "'Manrope', 'Inter', system-ui, sans-serif",
        pointerEvents: "auto",
        animation: t.leaving
          ? "toastOut 0.3s ease forwards"
          : "toastIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards",
      }}>
        <span style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: t.type === "error" ? "#ff2d3f" : "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}>
          {t.type === "error" ? (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <line x1="2" y1="2" x2="10" y2="10" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="10" y1="2" x2="2" y2="10" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <polyline points="2,6 5,9 10,3" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>

        <span>{t.message}</span>
      </div>
    ))}
  </div>
);


/* ── Glass Confirm Toast (black + red theme) ── */

const ConfirmToast = ({
  onConfirm,
  onCancel,
  loading
}) => (
  <div
    style={{
      position: "fixed",
      top: "100px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 10000,
      width: "min(360px, calc(100vw - 32px))",
      pointerEvents: "auto",
      animation: "toastIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards",
      fontFamily: "'Manrope', 'Inter', system-ui, sans-serif"
    }}
  >
    <div
      style={{
        padding: "22px 24px",
        background: "rgba(0,0,0,0.72)",
        border: "1px solid rgba(255,45,63,0.6)",
        backdropFilter: "blur(32px) saturate(140%)",
        WebkitBackdropFilter: "blur(32px) saturate(140%)",
        borderRadius: "18px",
        boxShadow:
          "0 24px 60px rgba(0,0,0,0.85), 0 0 40px rgba(255,45,63,0.12), 0 1px 0 rgba(255,255,255,0.08) inset"
      }}
    >
      <p
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: "#ffffff",
          letterSpacing: "-0.01em",
          margin: "0 0 6px 0"
        }}
      >
        Delete this product?
      </p>

      <p
        style={{
          fontSize: 13.5,
          fontWeight: 500,
          color: "rgba(255,255,255,0.7)",
          margin: "0 0 20px 0"
        }}
      >
        This action cannot be undone.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10
        }}
      >
        <button
          onClick={onCancel}
          disabled={loading}
          className="ap-btn ap-btn--ghost"
          style={{
            opacity: loading ? 0.5 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          Cancel
        </button>

        <button
          onClick={onConfirm}
          disabled={loading}
          className="ap-btn ap-btn--danger"
          style={{
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
);


/* ── Product Stock Display ── */

const ProductStock = ({
  sizes
}) => {

  const normalizedSizes =
    Array.isArray(sizes)
      ? sizes
          .map((item) => {

            if (typeof item === "string") {
              return {
                size: item,
                stock: 0
              };
            }

            if (item && typeof item === "object") {
              return {
                size:
                  typeof item.size === "string"
                    ? item.size
                    : "",

                stock:
                  Number.isInteger(item.stock)
                    ? item.stock
                    : 0
              };
            }

            return null;

          })
          .filter((item) => item && item.size)
      : [];

  const totalStock =
    normalizedSizes.reduce(
      (total, item) => total + item.stock,
      0
    );

  if (normalizedSizes.length === 0) {
    return (
      <div className="ap-stock-wrap">
        <span className="ap-size ap-size--none">
          No sizes
        </span>
      </div>
    );
  }

  return (
    <div className="ap-stock-col">
      <div className="ap-stock-wrap">
        {normalizedSizes.map((item, index) => (
          <span
            key={`${item.size}-${index}`}
            className={`ap-size ${
              item.stock > 0 ? "ap-size--in" : "ap-size--out"
            }`}
          >
            <span>{item.size}</span>

            <span className="ap-size-count">
              {item.stock}
            </span>
          </span>
        ))}
      </div>

      <div className="ap-total">
        <span
          className={`ap-total-dot ${
            totalStock > 0 ? "ap-total-dot--in" : "ap-total-dot--out"
          }`}
        />

        <span
          className={`ap-total-text ${
            totalStock > 0 ? "" : "ap-total-text--out"
          }`}
        >
          {totalStock > 0
            ? `Total: ${totalStock}`
            : "Out of stock"}
        </span>
      </div>
    </div>
  );
};


/* ─── Main Page ──────────────────────────────────────────────────────────────── */

const AdminProducts = () => {

  const [products, setProducts] = useState([]);

  const [toasts, setToasts] = useState([]);

  const [confirm, setConfirm] = useState(null);

  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();


  const showToast = useCallback(
    (message, type = "success") => {

      const id = Date.now();

      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          type,
          leaving: false
        }
      ]);

      setTimeout(() => {

        setToasts((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  leaving: true
                }
              : t
          )
        );

        setTimeout(() => {

          setToasts((prev) =>
            prev.filter((t) => t.id !== id)
          );

        }, 320);

      }, 2500);

    },
    []
  );


  /* ── FETCH PRODUCTS FROM MERN BACKEND ── */

  const fetchProducts = useCallback(
    async () => {

      try {

        const res =
          await axios.get(
            `${API_URL}/products`,
            {
              withCredentials: true
            }
          );

        const productData =
          Array.isArray(res.data?.products)
            ? res.data.products
            : [];

        setProducts(productData);

      } catch (error) {

        console.error(
          "Fetch admin products error:",
          error
        );

        showToast(
          error.response?.data?.message ||
            "Failed to load products",
          "error"
        );

      }

    },
    [showToast]
  );


  useEffect(() => {

    fetchProducts();

  }, [fetchProducts]);


  /* ── ADD PRODUCT ── */

  const addProduct = () => {

    navigate("/admin/add");

  };


  /* ── EDIT PRODUCT ── */

  const editProduct = (id) => {

    navigate(`/admin/edit-product/${id}`);

  };


  /* ── DELETE PRODUCT ── */

  const deleteProduct = (id) => {

    if (deleting) return;

    setConfirm(id);

  };


  /* ── CONFIRM DELETE ── */

  const handleConfirmDelete =
    async () => {

      if (
        confirm === null ||
        deleting
      ) {
        return;
      }

      const productId = confirm;

      setDeleting(true);

      try {

        await axios.delete(
          `${API_URL}/products/${encodeURIComponent(
            productId
          )}`,
          {
            withCredentials: true
          }
        );


        setProducts((prev) =>
          prev.filter(
            (product) =>
              String(product.id) !==
              String(productId)
          )
        );


        setConfirm(null);


        showToast(
          "Product deleted successfully",
          "success"
        );

      } catch (error) {

        console.error(
          "Delete product error:",
          error
        );

        showToast(
          error.response?.data?.message ||
            "Delete failed",
          "error"
        );

      } finally {

        setDeleting(false);

      }

    };


  /* ── Icons (design only) ── */

  const EditIcon = ({ size = 14 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );

  const TrashIcon = ({ size = 14 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );


  return (
    <>
      <ToastContainer toasts={toasts} />

      {confirm !== null && (
        <ConfirmToast
          onConfirm={handleConfirmDelete}
          onCancel={() => {

            if (!deleting) {

              setConfirm(null);

            }

          }}
          loading={deleting}
        />
      )}


      <div
        className="ad-root min-h-screen flex justify-center items-start p-3 sm:p-5 md:p-8 pb-20"
      >

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

          .ad-root {
            --ad-red:        #ff2d3f;
            --ad-line:       rgba(255, 45, 63, 0.22);
            --ad-line-hover: rgba(255, 45, 63, 0.6);
            --ad-white:      #ffffff;
            --ad-white-soft: rgba(255, 255, 255, 0.7);

            position: relative;
            overflow: hidden;
            background: #000000;
            color: var(--ad-white);
            font-family: 'Manrope', 'Inter', system-ui, sans-serif;
            -webkit-font-smoothing: antialiased;
          }

          /* ── Entrance ── */
          .ad-rise {
            opacity: 0;
            animation: ad-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }

          @keyframes ad-rise {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          /* ── Heading ── */
          .ad-overline {
            display: inline-flex;
            align-items: center;
            gap: 0.65rem;
            color: var(--ad-red);
            font-size: 0.78rem;
            font-weight: 700;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
          }

          .ad-overline::before {
            content: '';
            width: 28px;
            height: 2px;
            background: var(--ad-red);
          }

          .ad-title {
            color: var(--ad-white);
            font-weight: 800;
            letter-spacing: -0.03em;
            line-height: 1.05;
            font-size: clamp(2.2rem, 4vw, 3rem);
          }

          .ad-title-bar {
            margin-top: 1rem;
            height: 2px;
            width: 84px;
            border-radius: 2px;
            background: var(--ad-red);
            transform-origin: left center;
            animation: ad-draw 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
          }

          @keyframes ad-draw {
            from { transform: scaleX(0); }
            to   { transform: scaleX(1); }
          }

          /* ── Panel ── */
          .ad-panel {
            position: relative;
            background: transparent;
            border: 1px solid var(--ad-line);
            border-radius: 16px;
            transition: border-color 0.3s ease;
          }

          .ad-panel:hover {
            border-color: var(--ad-line-hover);
          }

          .ad-panel-title {
            display: flex;
            align-items: center;
            gap: 0.65rem;
            color: var(--ad-white);
            font-weight: 700;
            letter-spacing: -0.015em;
            font-size: clamp(1.05rem, 1.4vw, 1.25rem);
          }

          .ad-panel-title::before {
            content: '';
            width: 3px;
            height: 1.1em;
            border-radius: 2px;
            background: var(--ad-red);
          }

          /* ── Count pill ── */
          .ad-pill {
            color: #ffffff;
            background: var(--ad-red);
            font-size: 0.78rem;
            font-weight: 700;
            letter-spacing: 0.03em;
          }

          /* ── Table ── */
          .ad-thead {
            color: var(--ad-white-soft);
            border-bottom: 1px solid var(--ad-line);
            font-size: 0.74rem;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }

          .ad-row {
            position: relative;
            background: transparent;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            transition: background 0.25s ease;
          }

          .ad-row::before {
            content: '';
            position: absolute;
            left: 0;
            top: 18%;
            bottom: 18%;
            width: 2px;
            border-radius: 2px;
            background: var(--ad-red);
            transform: scaleY(0);
            transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          }

          .ad-row:hover {
            background: rgba(255, 255, 255, 0.04);
          }

          .ad-row:hover::before { transform: scaleY(1); }

          .ad-row:last-child { border-bottom: none; }

          .ad-cell-name {
            color: var(--ad-white);
            font-size: 0.98rem;
            font-weight: 700;
          }

          .ad-cell-price {
            color: var(--ad-red);
            font-size: 0.9rem;
            font-weight: 800;
            font-variant-numeric: tabular-nums;
          }

          .ad-cell-cat {
            color: var(--ad-white-soft);
            font-size: 0.92rem;
            font-weight: 500;
            text-transform: capitalize;
          }

          .ad-empty {
            color: var(--ad-white-soft);
            font-size: 0.95rem;
            font-weight: 500;
          }

          /* ── Product image ── */
          .ap-img {
            object-fit: cover;
            border-radius: 12px;
            border: 1px solid var(--ad-line);
            background: #000000;
            transition: border-color 0.3s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          }

          .ad-row:hover .ap-img {
            border-color: var(--ad-line-hover);
            transform: scale(1.05);
          }

          /* ── Stock chips ── */
          .ap-stock-col {
            display: flex;
            flex-direction: column;
            gap: 8px;
            min-width: 0;
          }

          .ap-stock-wrap {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 6px;
          }

          .ap-size {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 0.25rem 0.55rem;
            border-radius: 8px;
            font-size: 0.76rem;
            font-weight: 700;
            white-space: nowrap;
          }

          .ap-size-count { opacity: 0.9; }

          .ap-size--in {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.3);
          }

          .ap-size--out {
            color: #ff9aa4;
            background: rgba(255, 45, 63, 0.12);
            border: 1px solid rgba(255, 45, 63, 0.45);
          }

          .ap-size--none {
            color: var(--ad-white-soft);
            background: transparent;
            border: 1px dashed rgba(255, 255, 255, 0.25);
          }

          .ap-total {
            display: flex;
            align-items: center;
            gap: 7px;
          }

          .ap-total-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
          }

          .ap-total-dot--in {
            background: #22c55e;
            box-shadow: 0 0 8px rgba(34, 197, 94, 0.55);
          }

          .ap-total-dot--out {
            background: var(--ad-red);
            box-shadow: 0 0 8px rgba(255, 45, 63, 0.6);
          }

          .ap-total-text {
            color: var(--ad-white-soft);
            font-size: 0.78rem;
            font-weight: 700;
          }

          .ap-total-text--out { color: var(--ad-red); }

          /* ── Buttons ── */
          .ap-btn {
            font-family: inherit;
            font-size: 0.82rem;
            font-weight: 700;
            letter-spacing: 0.02em;
            padding: 0.5rem 1.2rem;
            border-radius: 10px;
            background: transparent;
            transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
          }

          .ap-btn--ghost {
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.4);
          }

          .ap-btn--ghost:hover:not(:disabled) {
            background: #ffffff;
            color: #000000;
            border-color: #ffffff;
          }

          .ap-btn--danger {
            color: var(--ad-red);
            border: 1px solid rgba(255, 45, 63, 0.6);
          }

          .ap-btn--danger:hover:not(:disabled) {
            background: var(--ad-red);
            color: #ffffff;
            border-color: var(--ad-red);
            box-shadow: 0 0 22px rgba(255, 45, 63, 0.4);
          }

          .ap-add {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            font-family: inherit;
            font-size: 0.85rem;
            font-weight: 700;
            letter-spacing: 0.02em;
            color: #ffffff;
            background: var(--ad-red);
            border: 1px solid var(--ad-red);
            border-radius: 10px;
            padding: 0.5rem 1.1rem;
            cursor: pointer;
            transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease, color 0.25s ease;
          }

          .ap-add:hover {
            transform: translateY(-1px);
            box-shadow: 0 0 24px rgba(255, 45, 63, 0.5);
          }

          .ap-add:active { transform: translateY(0); }

          .ap-icon-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 34px;
            height: 34px;
            border-radius: 10px;
            background: transparent;
            cursor: pointer;
            transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
          }

          .ap-icon-btn:hover:not(:disabled) { transform: translateY(-1px); }

          .ap-icon-btn--edit {
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.4);
          }

          .ap-icon-btn--edit:hover:not(:disabled) {
            background: #ffffff;
            color: #000000;
            border-color: #ffffff;
          }

          .ap-icon-btn--delete {
            color: var(--ad-red);
            border: 1px solid rgba(255, 45, 63, 0.6);
          }

          .ap-icon-btn--delete:hover:not(:disabled) {
            background: var(--ad-red);
            color: #ffffff;
            border-color: var(--ad-red);
          }

          .ap-btn:focus-visible,
          .ap-add:focus-visible,
          .ap-icon-btn:focus-visible {
            outline: 2px solid #ffffff;
            outline-offset: 2px;
          }

          /* ── Empty state icon ── */
          .ap-empty-icon {
            color: var(--ad-red);
            background: rgba(255, 45, 63, 0.1);
            border: 1px solid var(--ad-line);
          }

          /* ── Reduced motion ── */
          @media (prefers-reduced-motion: reduce) {
            .ad-rise,
            .ad-title-bar {
              animation: none !important;
              opacity: 1 !important;
              transform: none !important;
            }

            .ad-row,
            .ad-row::before,
            .ap-img,
            .ap-btn,
            .ap-add,
            .ap-icon-btn {
              transition: none !important;
            }
          }
        `}</style>

        {/* Content */}
        <div
          className="w-full max-w-7xl relative p-2 sm:p-4 md:p-6"
        >

          {/* Heading */}
          <div className="mb-8 sm:mb-10 relative ad-rise">

            <p className="ad-overline">
              Inventory
            </p>

            <h1 className="ad-title">
              All Products
            </h1>

            <div className="ad-title-bar" />

          </div>

          {/* Products panel */}
          <div
            className="ad-panel ad-rise rounded-xl p-5 sm:p-6 relative"
            style={{ animationDelay: "0.15s" }}
          >

            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">

              <h2 className="ad-panel-title">
                Product Catalogue
              </h2>

              <div className="flex items-center gap-2 sm:gap-3">

                <span className="ad-pill px-3 py-1 rounded-full">
                  {products.length}{" "}
                  {products.length === 1 ? "product" : "products"}
                </span>

                <button
                  onClick={addProduct}
                  className="ap-add"
                >

                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>

                  <span className="hidden sm:inline">
                    Add Product
                  </span>

                  <span className="sm:hidden">
                    Add
                  </span>

                </button>

              </div>

            </div>


            {/* Table header — desktop */}
            <div
              className="ad-thead hidden sm:grid grid-cols-[72px_2fr_1fr_1.35fr_100px] px-4 py-3 mb-1"
            >
              <span>Image</span>
              <span>Name</span>
              <span>Category</span>
              <span>Stock</span>
              <span className="text-center">Action</span>
            </div>


            {/* Products list */}
            <div className="flex flex-col">

              {products.map((product) => (

                <div
                  key={product.id}
                  className="ad-row"
                >

                  {/* MOBILE layout */}
                  <div className="flex sm:hidden items-center gap-3 px-4 py-4">

                    <img
                      src={product.image}
                      className="ap-img w-14 h-14 shrink-0"
                      alt=""
                    />

                    <div className="flex-1 min-w-0">

                      <p className="ad-cell-name truncate">
                        {product.name}
                      </p>

                      <p className="ad-cell-cat mt-0.5">
                        {product.category}
                      </p>

                      <p className="ad-cell-price mt-0.5">
                        ₹{product.price}
                      </p>

                      <div
                        className="mt-2"
                        style={{ maxWidth: "100%" }}
                      >
                        <ProductStock sizes={product.sizes} />
                      </div>

                    </div>

                    <div className="flex flex-col gap-2 shrink-0">

                      <button
                        onClick={() => editProduct(product.id)}
                        className="ap-icon-btn ap-icon-btn--edit"
                        title="Edit"
                      >
                        <EditIcon size={13} />
                      </button>

                      <button
                        onClick={() => deleteProduct(product.id)}
                        disabled={deleting}
                        className="ap-icon-btn ap-icon-btn--delete"
                        style={{
                          opacity: deleting ? 0.5 : 1,
                          cursor: deleting ? "not-allowed" : "pointer"
                        }}
                        title="Delete"
                      >
                        <TrashIcon size={13} />
                      </button>

                    </div>

                  </div>


                  {/* DESKTOP layout */}
                  <div className="hidden sm:grid grid-cols-[72px_2fr_1fr_1.35fr_100px] items-center gap-0 px-4 py-4">

                    <img
                      src={product.image}
                      className="ap-img w-12 h-12"
                      alt=""
                    />

                    <div className="pr-4 min-w-0">

                      <p className="ad-cell-name truncate">
                        {product.name}
                      </p>

                      <p className="ad-cell-price mt-1">
                        ₹{product.price}
                      </p>

                    </div>

                    <p className="ad-cell-cat">
                      {product.category}
                    </p>

                    <ProductStock sizes={product.sizes} />

                    <div className="flex justify-center gap-2">

                      <button
                        onClick={() => editProduct(product.id)}
                        className="ap-icon-btn ap-icon-btn--edit"
                        title="Edit"
                      >
                        <EditIcon size={14} />
                      </button>

                      <button
                        onClick={() => deleteProduct(product.id)}
                        disabled={deleting}
                        className="ap-icon-btn ap-icon-btn--delete"
                        style={{
                          opacity: deleting ? 0.5 : 1,
                          cursor: deleting ? "not-allowed" : "pointer"
                        }}
                        title="Delete"
                      >
                        <TrashIcon size={14} />
                      </button>

                    </div>

                  </div>

                </div>

              ))}


              {products.length === 0 && (

                <div className="flex flex-col items-center justify-center py-16 gap-3">

                  <div
                    className="ap-empty-icon w-14 h-14 rounded-xl flex items-center justify-center"
                  >

                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <path d="M8 21h8M12 17v4" />
                    </svg>

                  </div>

                  <p className="ad-empty">
                    No products found
                  </p>

                </div>

              )}

            </div>

          </div>

        </div>
      </div>
    </>
  );
};


export default AdminProducts;