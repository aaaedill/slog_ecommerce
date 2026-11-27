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
    position: "fixed",
    top: "calc(env(safe-area-inset-top, 0px) + 84px)",
    left: "50%", transform: "translateX(-50%)",
    zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "stretch",
    gap: "10px", width: "min(360px, calc(100vw - 32px))", pointerEvents: "none",
  }}>
    <style>{`
      @keyframes toastIn  { from{opacity:0;transform:translateY(-10px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes toastOut { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(-8px) scale(0.97)} }
    `}</style>

    {toasts.map((t) => (
      <div key={t.id} style={{
        display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px",
        background: "rgba(0,0,0,0.6)",
        border: t.type === "error"
          ? "1px solid rgba(255,45,63,0.6)"
          : "1px solid rgba(255,255,255,0.22)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderRadius: "14px",
        color: "#ffffff", fontSize: "clamp(13px, 3.4vw, 14px)", fontWeight: 600,
        lineHeight: 1.35,
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

        <span style={{ minWidth: 0 }}>{t.message}</span>
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
      top: "calc(env(safe-area-inset-top, 0px) + 84px)",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 10000,
      width: "min(380px, calc(100vw - 32px))",
      pointerEvents: "auto",
      animation: "toastIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards",
      fontFamily: "'Manrope', 'Inter', system-ui, sans-serif"
    }}
  >
    <div
      style={{
        padding: "clamp(16px, 4.5vw, 22px) clamp(16px, 5vw, 24px)",
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

      <div className="ap-confirm-actions">
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

  const EditIcon = () => (
    <svg
      className="ap-ico"
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

  const TrashIcon = () => (
    <svg
      className="ap-ico"
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


      <div className="ap-root">

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

          .ap-root {
            --ap-red:        #ff2d3f;
            --ap-line:       rgba(255, 45, 63, 0.22);
            --ap-line-hover: rgba(255, 45, 63, 0.6);
            --ap-white:      #ffffff;
            --ap-white-soft: rgba(255, 255, 255, 0.7);

            /* responsive scale (overridden per breakpoint below).
               --ap-max and --ap-px match the navbar so edges line up. */
            --ap-max:     1400px;
            --ap-px:      0.875rem;
            --ap-py:      1rem;
            --ap-sec:     1.25rem;
            --ap-pad:     0.9rem;
            --ap-radius:  14px;
            --ap-over:    0.68rem;
            --ap-title:   1.9rem;
            --ap-ptitle:  1rem;
            --ap-pill:    0.7rem;
            --ap-img:     3.5rem;
            --ap-name:    0.92rem;
            --ap-meta:    0.8rem;
            --ap-price:   0.86rem;
            --ap-thead:   0.68rem;
            --ap-chip:    0.7rem;
            --ap-ibtn:    2.25rem;
            --ap-ico:     0.85rem;
            --ap-add-h:   2.25rem;
            --ap-add-fs:  0.8rem;
            --ap-rowpx:   0.25rem;
            --ap-rowpy:   0.95rem;
            --ap-colgap:  0.9rem;
            --ap-action:  5.25rem;

            position: relative;
            overflow-x: hidden;
            min-height: 100vh;
            background: #000000;
            color: var(--ap-white);
            font-family: 'Manrope', 'Inter', system-ui, sans-serif;
            -webkit-font-smoothing: antialiased;
            padding:
              var(--ap-py)
              max(var(--ap-px), env(safe-area-inset-right))
              calc(var(--ap-py) + 2rem + env(safe-area-inset-bottom))
              max(var(--ap-px), env(safe-area-inset-left));
          }

          .ap-inner {
            position: relative;
            width: 100%;
            max-width: var(--ap-max);
            margin: 0 auto;
          }

          /* ── Entrance ── */
          .ap-rise {
            opacity: 0;
            animation: ap-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }

          @keyframes ap-rise {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          /* ── Heading ── */
          .ap-head {
            position: relative;
            margin-bottom: var(--ap-sec);
          }

          .ap-overline {
            display: inline-flex;
            align-items: center;
            gap: 0.6rem;
            color: var(--ap-red);
            font-size: var(--ap-over);
            font-weight: 700;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            margin-bottom: 0.4rem;
          }

          .ap-overline::before {
            content: '';
            width: 1.75rem;
            height: 2px;
            background: var(--ap-red);
          }

          .ap-title {
            color: var(--ap-white);
            font-weight: 800;
            letter-spacing: -0.03em;
            line-height: 1.05;
            font-size: var(--ap-title);
          }

          .ap-title-bar {
            margin-top: 0.85rem;
            height: 2px;
            width: 5rem;
            border-radius: 2px;
            background: var(--ap-red);
            transform-origin: left center;
            animation: ap-draw 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
          }

          @keyframes ap-draw {
            from { transform: scaleX(0); }
            to   { transform: scaleX(1); }
          }

          /* ── Panel ── */
          .ap-panel {
            position: relative;
            min-width: 0;
            padding: var(--ap-pad);
            background: transparent;
            border: 1px solid var(--ap-line);
            border-radius: var(--ap-radius);
            transition: border-color 0.3s ease;
          }

          .ap-panel:hover {
            border-color: var(--ap-line-hover);
          }

          .ap-panel-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 0.6rem 0.75rem;
            margin-bottom: calc(var(--ap-pad) * 0.8);
          }

          .ap-panel-title {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            min-width: 0;
            color: var(--ap-white);
            font-weight: 700;
            letter-spacing: -0.015em;
            line-height: 1.2;
            font-size: var(--ap-ptitle);
          }

          .ap-panel-title::before {
            content: '';
            flex: 0 0 auto;
            width: 3px;
            height: 1.1em;
            border-radius: 2px;
            background: var(--ap-red);
          }

          .ap-head-tools {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          /* ── Count pill ── */
          .ap-pill {
            flex: 0 0 auto;
            padding: 0.25rem 0.7rem;
            border-radius: 999px;
            color: #ffffff;
            background: var(--ap-red);
            font-size: var(--ap-pill);
            font-weight: 700;
            letter-spacing: 0.03em;
            white-space: nowrap;
          }

          /* ── Products list ──
             Phone (< 640px): card
                 [ image | name / category / price | edit delete ]
                 [ stock chips ............................... ]
             640 – 767px: table  [ image | name+category+price | stock | actions ]
             ≥ 768px:     table  [ image | name+price | category | stock | actions ] */
          .ap-thead {
            display: none;
            color: var(--ap-white-soft);
            border-bottom: 1px solid var(--ap-line);
            font-size: var(--ap-thead);
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }

          .ap-thead,
          .ap-row {
            grid-template-columns: var(--ap-img) minmax(0, 1fr) auto;
            grid-template-areas:
              "img   name  action"
              "stock stock stock";
            column-gap: var(--ap-colgap);
            padding-left: var(--ap-rowpx);
            padding-right: var(--ap-rowpx);
          }

          .ap-list {
            display: flex;
            flex-direction: column;
          }

          .ap-row {
            position: relative;
            display: grid;
            align-items: center;
            row-gap: 0.75rem;
            padding-top: var(--ap-rowpy);
            padding-bottom: var(--ap-rowpy);
            background: transparent;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            transition: background 0.25s ease;
          }

          .ap-row::before {
            content: '';
            position: absolute;
            left: 0;
            top: 18%;
            bottom: 18%;
            width: 2px;
            border-radius: 2px;
            background: var(--ap-red);
            transform: scaleY(0);
            transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          }

          .ap-row:hover {
            background: rgba(255, 255, 255, 0.04);
          }

          .ap-row:hover::before { transform: scaleY(1); }

          .ap-row:last-child { border-bottom: none; }

          .ap-c-img    { grid-area: img; }
          .ap-c-name   { grid-area: name; min-width: 0; }
          .ap-c-cat    { grid-area: cat; display: none; }
          .ap-c-stock  { grid-area: stock; min-width: 0; }
          .ap-c-action { grid-area: action; }

          .ap-cell-name {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            overflow-wrap: anywhere;
            color: var(--ap-white);
            font-size: var(--ap-name);
            font-weight: 700;
            line-height: 1.25;
          }

          .ap-cell-meta {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 0.1rem 0.6rem;
            margin-top: 0.2rem;
          }

          .ap-cell-price {
            color: var(--ap-red);
            font-size: var(--ap-price);
            font-weight: 800;
            font-variant-numeric: tabular-nums;
          }

          .ap-cell-cat {
            color: var(--ap-white-soft);
            font-size: var(--ap-meta);
            font-weight: 500;
            text-transform: capitalize;
            overflow-wrap: anywhere;
          }

          .ap-cell-cat--inline { display: inline; }

          .ap-empty-text {
            color: var(--ap-white-soft);
            font-size: var(--ap-name);
            font-weight: 500;
          }

          /* ── Product image ── */
          .ap-img {
            display: block;
            width: var(--ap-img);
            height: var(--ap-img);
            object-fit: cover;
            border-radius: 12px;
            border: 1px solid var(--ap-line);
            background: #000000;
            transition: border-color 0.3s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          }

          .ap-row:hover .ap-img {
            border-color: var(--ap-line-hover);
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
            padding: 0.22rem 0.5rem;
            border-radius: 8px;
            font-size: var(--ap-chip);
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
            color: var(--ap-white-soft);
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
            background: #ff2d3f;
            box-shadow: 0 0 8px rgba(255, 45, 63, 0.6);
          }

          .ap-total-text {
            color: rgba(255, 255, 255, 0.7);
            font-size: var(--ap-chip);
            font-weight: 700;
          }

          .ap-total-text--out { color: #ff2d3f; }

          /* ── Buttons ── */
          .ap-btn {
            font-family: inherit;
            font-size: 0.82rem;
            font-weight: 700;
            letter-spacing: 0.02em;
            min-height: 2.5rem;
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
            color: #ff2d3f;
            border: 1px solid rgba(255, 45, 63, 0.6);
          }

          .ap-btn--danger:hover:not(:disabled) {
            background: #ff2d3f;
            color: #ffffff;
            border-color: #ff2d3f;
            box-shadow: 0 0 22px rgba(255, 45, 63, 0.4);
          }

          /* Confirm dialog buttons: full width halves on phones */
          .ap-confirm-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }

          .ap-confirm-actions .ap-btn { flex: 1 1 0; }

          .ap-add {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
            height: var(--ap-add-h);
            padding: 0 0.95rem;
            font-family: inherit;
            font-size: var(--ap-add-fs);
            font-weight: 700;
            letter-spacing: 0.02em;
            white-space: nowrap;
            color: #ffffff;
            background: var(--ap-red);
            border: 1px solid var(--ap-red);
            border-radius: 10px;
            cursor: pointer;
            transition: transform 0.25s ease, box-shadow 0.25s ease;
          }

          .ap-add:hover {
            transform: translateY(-1px);
            box-shadow: 0 0 24px rgba(255, 45, 63, 0.5);
          }

          .ap-add:active { transform: translateY(0); }

          .ap-add svg { width: 0.9em; height: 0.9em; }

          .ap-add-long { display: none; }

          .ap-actions {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 0.5rem;
          }

          .ap-icon-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: var(--ap-ibtn);
            height: var(--ap-ibtn);
            border-radius: 10px;
            background: transparent;
            cursor: pointer;
            transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
          }

          .ap-icon-btn:hover:not(:disabled) { transform: translateY(-1px); }

          .ap-ico {
            width: var(--ap-ico);
            height: var(--ap-ico);
          }

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
            color: var(--ap-red);
            border: 1px solid rgba(255, 45, 63, 0.6);
          }

          .ap-icon-btn--delete:hover:not(:disabled) {
            background: var(--ap-red);
            color: #ffffff;
            border-color: var(--ap-red);
          }

          .ap-btn:focus-visible,
          .ap-add:focus-visible,
          .ap-icon-btn:focus-visible {
            outline: 2px solid #ffffff;
            outline-offset: 2px;
          }

          /* ── Empty state ── */
          .ap-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 3rem 0.5rem;
            text-align: center;
          }

          .ap-empty-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 3.5rem;
            height: 3.5rem;
            border-radius: 12px;
            color: var(--ap-red);
            background: rgba(255, 45, 63, 0.1);
            border: 1px solid var(--ap-line);
          }

          /* ── Responsive scale ── */

          /* ≥ 400px: large phones */
          @media (min-width: 400px) {
            .ap-root {
              --ap-px:    1rem;
              --ap-py:    1.1rem;
              --ap-pad:   1rem;
              --ap-title: 2.05rem;
              --ap-name:  0.95rem;
              --ap-img:   3.75rem;
            }
          }

          /* ≥ 480px: phones in landscape / small tablets */
          @media (min-width: 480px) {
            .ap-root {
              --ap-py:      1.25rem;
              --ap-sec:     1.4rem;
              --ap-pad:     1.1rem;
              --ap-ptitle:  1.05rem;
              --ap-img:     4rem;
              --ap-name:    0.98rem;
              --ap-meta:    0.84rem;
              --ap-price:   0.9rem;
              --ap-chip:    0.74rem;
              --ap-add-h:   2.4rem;
              --ap-add-fs:  0.84rem;
              --ap-action:  5.5rem;
            }

            /* edit + delete sit side by side */
            .ap-actions { flex-direction: row; }
          }

          /* ≥ 640px: tablets (portrait). Products become a table. */
          @media (min-width: 640px) {
            .ap-root {
              --ap-px:     1.5rem;
              --ap-py:     1.5rem;
              --ap-sec:    1.6rem;
              --ap-pad:    1.25rem;
              --ap-over:   0.74rem;
              --ap-title:  2.4rem;
              --ap-ptitle: 1.1rem;
              --ap-pill:   0.76rem;
              --ap-img:    3.25rem;
              --ap-thead:  0.72rem;
              --ap-rowpx:  0.9rem;
              --ap-rowpy:  1rem;
              --ap-colgap: 1rem;
              --ap-action: 5.75rem;
            }

            .ap-add-long { display: inline; }
            .ap-add-short { display: none; }

            .ap-thead,
            .ap-row {
              grid-template-columns:
                var(--ap-img)
                minmax(0, 1.5fr)
                minmax(0, 1.5fr)
                var(--ap-action);
              grid-template-areas: "img name stock action";
            }

            .ap-thead { display: grid; padding-top: 0.75rem; padding-bottom: 0.75rem; }
            .ap-row   { row-gap: 0; }

            .ap-actions { justify-content: center; }
          }

          /* ≥ 768px: category gets its own column */
          @media (min-width: 768px) {
            .ap-root {
              --ap-py:     1.75rem;
              --ap-sec:    1.75rem;
              --ap-title:  2.55rem;
              --ap-img:    3.4rem;
              --ap-name:   1rem;
              --ap-meta:   0.88rem;
              --ap-colgap: 1.25rem;
              --ap-action: 6rem;
            }

            .ap-thead,
            .ap-row {
              grid-template-columns:
                var(--ap-img)
                minmax(0, 1.6fr)
                minmax(0, 0.9fr)
                minmax(0, 1.5fr)
                var(--ap-action);
              grid-template-areas: "img name cat stock action";
            }

            .ap-c-cat { display: block; }
            .ap-cell-cat--inline { display: none; }
          }

          /* ≥ 1024px: laptops */
          @media (min-width: 1024px) {
            .ap-root {
              --ap-px:     2rem;
              --ap-py:     2rem;
              --ap-sec:    2rem;
              --ap-pad:    1.4rem;
              --ap-radius: 16px;
              --ap-ptitle: 1.15rem;
              --ap-img:    3.6rem;
              --ap-name:   1.02rem;
              --ap-meta:   0.9rem;
              --ap-chip:   0.76rem;
              --ap-ibtn:   2.4rem;
              --ap-ico:    0.95rem;
              --ap-rowpx:  1.1rem;
              --ap-rowpy:  1.1rem;
              --ap-colgap: 1.5rem;
              --ap-action: 6.5rem;
            }
          }

          /* ≥ 1280px: desktops */
          @media (min-width: 1280px) {
            .ap-root {
              --ap-py:     2.25rem;
              --ap-pad:    1.6rem;
              --ap-title:  2.8rem;
              --ap-ptitle: 1.2rem;
              --ap-img:    4rem;
              --ap-thead:  0.74rem;
              --ap-rowpy:  1.2rem;
              --ap-add-h:  2.5rem;
              --ap-add-fs: 0.86rem;
            }
          }

          /* ≥ 1536px: large monitors */
          @media (min-width: 1536px) {
            .ap-root {
              --ap-max:    1680px;
              --ap-px:     2.5rem;
              --ap-py:     2.5rem;
              --ap-sec:    2.5rem;
              --ap-pad:    1.85rem;
              --ap-over:   0.8rem;
              --ap-title:  3rem;
              --ap-ptitle: 1.3rem;
              --ap-pill:   0.82rem;
              --ap-img:    4.5rem;
              --ap-name:   1.1rem;
              --ap-meta:   0.96rem;
              --ap-price:  0.98rem;
              --ap-chip:   0.82rem;
              --ap-ibtn:   2.6rem;
              --ap-ico:    1.05rem;
              --ap-add-h:  2.7rem;
              --ap-add-fs: 0.9rem;
              --ap-action: 7.25rem;
            }
          }

          /* ≥ 1920px: ultra-wide */
          @media (min-width: 1920px) {
            .ap-root { --ap-max: 1840px; }
          }

          /* ── Reduced motion ── */
          @media (prefers-reduced-motion: reduce) {
            .ap-rise,
            .ap-title-bar {
              animation: none !important;
              opacity: 1 !important;
              transform: none !important;
            }

            .ap-row,
            .ap-row::before,
            .ap-img,
            .ap-btn,
            .ap-add,
            .ap-icon-btn {
              transition: none !important;
            }
          }
        `}</style>

        {/* Content */}
        <div className="ap-inner">

          {/* Heading */}
          <div className="ap-head ap-rise">

            <p className="ap-overline">
              Inventory
            </p>

            <h1 className="ap-title">
              All Products
            </h1>

            <div className="ap-title-bar" />

          </div>

          {/* Products panel */}
          <div
            className="ap-panel ap-rise"
            style={{ animationDelay: "0.15s" }}
          >

            <div className="ap-panel-head">

              <h2 className="ap-panel-title">
                Product Catalogue
              </h2>

              <div className="ap-head-tools">

                <span className="ap-pill">
                  {products.length}{" "}
                  {products.length === 1 ? "product" : "products"}
                </span>

                <button
                  onClick={addProduct}
                  className="ap-add"
                >

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>

                  <span className="ap-add-long">
                    Add Product
                  </span>

                  <span className="ap-add-short">
                    Add
                  </span>

                </button>

              </div>

            </div>


            {/* Table header (≥ 640px only) */}
            <div className="ap-thead">
              <span style={{ gridArea: "img" }}>Image</span>
              <span style={{ gridArea: "name" }}>Name</span>
              <span style={{ gridArea: "cat" }} className="ap-c-cat">Category</span>
              <span style={{ gridArea: "stock" }}>Stock</span>
              <span style={{ gridArea: "action", textAlign: "center" }}>Action</span>
            </div>


            {/* Products list */}
            <div className="ap-list">

              {products.map((product) => (

                <div
                  key={product.id}
                  className="ap-row"
                >

                  {/* Image */}
                  <div className="ap-c-img">
                    <img
                      src={product.image}
                      className="ap-img"
                      alt=""
                      loading="lazy"
                    />
                  </div>

                  {/* Name + (category on small screens) + price */}
                  <div className="ap-c-name">

                    <p className="ap-cell-name" title={product.name}>
                      {product.name}
                    </p>

                    <div className="ap-cell-meta">

                      <span className="ap-cell-cat ap-cell-cat--inline">
                        {product.category}
                      </span>

                      <span className="ap-cell-price">
                        ₹{product.price}
                      </span>

                    </div>

                  </div>

                  {/* Category column (≥ 768px) */}
                  <p className="ap-c-cat ap-cell-cat">
                    {product.category}
                  </p>

                  {/* Stock */}
                  <div className="ap-c-stock">
                    <ProductStock sizes={product.sizes} />
                  </div>

                  {/* Actions */}
                  <div className="ap-c-action ap-actions">

                    <button
                      onClick={() => editProduct(product.id)}
                      className="ap-icon-btn ap-icon-btn--edit"
                      title="Edit"
                      aria-label="Edit product"
                    >
                      <EditIcon />
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
                      aria-label="Delete product"
                    >
                      <TrashIcon />
                    </button>

                  </div>

                </div>

              ))}


              {products.length === 0 && (

                <div className="ap-empty">

                  <div className="ap-empty-icon">

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

                  <p className="ap-empty-text">
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