import React, {
  useEffect,
  useState,
  useCallback
} from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";

import API_URL from "../../config/api";


/* ── Shared keyframes ── */

const GlobalStyles = () => (
  <style>{`
    @keyframes toastIn  { from{opacity:0;transform:translateY(-12px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes toastOut { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(-8px) scale(0.95)} }
  `}</style>
);


/* ── Glassy Notification Toast ── */

const ToastContainer = ({ toasts }) => (
  <div
    style={{
      position: "fixed",
      top: "100px",
      left: 0,
      right: 0,
      marginLeft: "auto",
      marginRight: "auto",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      gap: "10px",
      width: "320px",
      maxWidth: "calc(100vw - 32px)",
      pointerEvents: "none"
    }}
  >
    {toasts.map((t) => (
      <div
        key={t.id}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "13px 18px",
          background: "rgba(255,255,255,0.05)",
          border:
            "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(25px)",
          WebkitBackdropFilter: "blur(25px)",
          borderRadius: "16px",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.5)",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: 500,
          pointerEvents: "auto",
          animation: t.leaving
            ? "toastOut 0.3s ease forwards"
            : "toastIn 0.35s cubic-bezier(0.2,1.3,0.4,1) forwards"
        }}
      >
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            flexShrink: 0,
            background:
              t.type === "error"
                ? "rgba(239,68,68,0.15)"
                : "rgba(249,115,22,0.15)",
            border:
              t.type === "error"
                ? "1.5px solid rgba(239,68,68,0.5)"
                : "1.5px solid rgba(249,115,22,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {t.type === "error" ? (
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="none"
            >
              <line
                x1="2"
                y1="2"
                x2="10"
                y2="10"
                stroke="rgba(239,68,68,0.95)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              <line
                x1="10"
                y1="2"
                x2="2"
                y2="10"
                stroke="rgba(239,68,68,0.95)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="none"
            >
              <polyline
                points="2,6 5,9 10,3"
                stroke="rgba(249,115,22,0.95)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>

        <span>{t.message}</span>
      </div>
    ))}
  </div>
);


/* ── Glassy Confirm Toast — appears below navbar, centered ── */

const ConfirmToast = ({
  onConfirm,
  onCancel,
  loading
}) => (
  <div
    style={{
      position: "fixed",
      top: "100px",
      left: 0,
      right: 0,
      marginLeft: "auto",
      marginRight: "auto",
      zIndex: 10000,
      width: "340px",
      maxWidth: "calc(100vw - 32px)",
      pointerEvents: "auto",
      animation:
        "toastIn 0.35s cubic-bezier(0.2,1.3,0.4,1) forwards"
    }}
  >
    <div
      style={{
        padding: "20px 22px",
        background: "rgba(10, 14, 26, 0.98)",
        border:
          "1px solid rgba(255,255,255,0.2)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        borderRadius: "18px",
        boxShadow:
          "0 24px 60px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.08) inset"
      }}
    >
      <p
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "#f8fafc",
          margin: "0 0 6px 0"
        }}
      >
        Delete this product?
      </p>

      <p
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.55)",
          margin: "0 0 18px 0"
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
          style={{
            padding: "8px 20px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            background:
              "rgba(255,255,255,0.07)",
            border:
              "1px solid rgba(255,255,255,0.18)",
            color: "#cbd5e1",
            cursor: loading
              ? "not-allowed"
              : "pointer",
            transition: "all 0.15s",
            opacity: loading ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (loading) return;

            e.currentTarget.style.background =
              "rgba(255,255,255,0.13)";

            e.currentTarget.style.color =
              "#fff";
          }}
          onMouseLeave={(e) => {
            if (loading) return;

            e.currentTarget.style.background =
              "rgba(255,255,255,0.07)";

            e.currentTarget.style.color =
              "#cbd5e1";
          }}
        >
          Cancel
        </button>

        <button
          onClick={onConfirm}
          disabled={loading}
          style={{
            padding: "8px 20px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            background:
              "rgba(239,68,68,0.22)",
            border:
              "1px solid rgba(239,68,68,0.5)",
            color: "#fca5a5",
            cursor: loading
              ? "not-allowed"
              : "pointer",
            transition: "all 0.15s",
            opacity: loading ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (loading) return;

            e.currentTarget.style.background =
              "#ef4444";

            e.currentTarget.style.color =
              "#fff";

            e.currentTarget.style.borderColor =
              "transparent";
          }}
          onMouseLeave={(e) => {
            if (loading) return;

            e.currentTarget.style.background =
              "rgba(239,68,68,0.22)";

            e.currentTarget.style.color =
              "#fca5a5";

            e.currentTarget.style.borderColor =
              "rgba(239,68,68,0.5)";
          }}
        >
          {loading
            ? "Deleting..."
            : "Delete"}
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

            if (
              typeof item ===
              "string"
            ) {
              return {
                size: item,
                stock: 0
              };
            }

            if (
              item &&
              typeof item ===
                "object"
            ) {
              return {
                size:
                  typeof item.size ===
                  "string"
                    ? item.size
                    : "",

                stock:
                  Number.isInteger(
                    item.stock
                  )
                    ? item.stock
                    : 0
              };
            }

            return null;

          })
          .filter(
            (item) =>
              item &&
              item.size
          )
      : [];

  const totalStock =
    normalizedSizes.reduce(
      (total, item) =>
        total + item.stock,
      0
    );

  if (
    normalizedSizes.length ===
    0
  ) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap"
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding:
              "4px 8px",
            borderRadius:
              "7px",
            background:
              "rgba(100,116,139,0.1)",
            border:
              "1px solid rgba(100,116,139,0.2)",
            color: "#64748b",
            fontSize: "11px",
            fontWeight: 600
          }}
        >
          No sizes
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "7px",
        minWidth: 0
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "5px"
        }}
      >
        {normalizedSizes.map(
          (item, index) => (
            <span
              key={`${item.size}-${index}`}
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap: "5px",
                padding:
                  "4px 7px",
                borderRadius:
                  "7px",
                background:
                  item.stock > 0
                    ? "rgba(34,197,94,0.08)"
                    : "rgba(239,68,68,0.08)",
                border:
                  item.stock > 0
                    ? "1px solid rgba(34,197,94,0.18)"
                    : "1px solid rgba(239,68,68,0.18)",
                color:
                  item.stock > 0
                    ? "#86efac"
                    : "#fca5a5",
                fontSize:
                  "11px",
                fontWeight: 600,
                whiteSpace:
                  "nowrap"
              }}
            >
              <span>
                {item.size}
              </span>

              <span
                style={{
                  opacity: 0.9
                }}
              >
                {item.stock}
              </span>
            </span>
          )
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius:
              "50%",
            background:
              totalStock > 0
                ? "#22c55e"
                : "#ef4444",
            boxShadow:
              totalStock > 0
                ? "0 0 8px rgba(34,197,94,0.5)"
                : "0 0 8px rgba(239,68,68,0.5)"
          }}
        />

        <span
          style={{
            color:
              totalStock > 0
                ? "#94a3b8"
                : "#f87171",
            fontSize: "11px",
            fontWeight: 600
          }}
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

  const [products, setProducts] =
    useState([]);

  const [toasts, setToasts] =
    useState([]);

  const [confirm, setConfirm] =
    useState(null);

  const [deleting, setDeleting] =
    useState(false);

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
            prev.filter(
              (t) =>
                t.id !== id
            )
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
              withCredentials:
                true
            }
          );

        const productData =
          Array.isArray(
            res.data?.products
          )
            ? res.data.products
            : [];

        setProducts(
          productData
        );

      } catch (error) {

        console.error(
          "Fetch admin products error:",
          error
        );

        showToast(
          error.response?.data
            ?.message ||
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

    navigate(
      "/admin/add"
    );

  };


  /* ── EDIT PRODUCT ── */

  const editProduct = (
    id
  ) => {

    navigate(
      `/admin/edit-product/${id}`
    );

  };


  /* ── DELETE PRODUCT ── */

  const deleteProduct = (
    id
  ) => {

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

      const productId =
        confirm;

      setDeleting(true);

      try {

        await axios.delete(
          `${API_URL}/products/${encodeURIComponent(
            productId
          )}`,
          {
            withCredentials:
              true
          }
        );


        setProducts((prev) =>
          prev.filter(
            (product) =>
              String(
                product.id
              ) !==
              String(
                productId
              )
          )
        );


        setConfirm(
          null
        );


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
          error.response?.data
            ?.message ||
            "Delete failed",
          "error"
        );

      } finally {

        setDeleting(
          false
        );

      }

    };


  return (
    <>
      <GlobalStyles />

      <ToastContainer
        toasts={toasts}
      />

      {confirm !== null && (
        <ConfirmToast
          onConfirm={
            handleConfirmDelete
          }
          onCancel={() => {

            if (!deleting) {

              setConfirm(
                null
              );

            }

          }}
          loading={deleting}
        />
      )}


      <div
        className="min-h-screen flex justify-center items-start p-3 sm:p-6 md:p-8 rounded-3xl pb-20"
        style={{
          background:
            "#0b1120"
        }}
      >

        <div
          className="w-full max-w-6xl relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8"
          style={{
            background:
              "linear-gradient(145deg,#0f1623 0%,#131a28 100%)",
            border:
              "1px solid rgba(255,255,255,0.07)",
            boxShadow:
              "0 24px 64px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset"
          }}
        >

          {/* Glows */}

          <div
            className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl pointer-events-none"
            style={{
              background:
                "rgba(249,115,22,0.08)"
            }}
          />

          <div
            className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl pointer-events-none"
            style={{
              background:
                "rgba(99,102,241,0.08)"
            }}
          />


          <div className="relative z-10">


            {/* Heading */}

            <div className="mb-8">

              <p
                className="text-xs font-semibold uppercase mb-1"
                style={{
                  color:
                    "#f97316",
                  letterSpacing:
                    "0.18em"
                }}
              >
                Inventory
              </p>


              <div className="flex flex-wrap items-center justify-between gap-3">

                <h1
                  className="text-2xl sm:text-3xl font-bold"
                  style={{
                    color:
                      "#f1f5f9",
                    letterSpacing:
                      "-0.02em"
                  }}
                >
                  All Products
                </h1>


                <div className="flex items-center gap-2 sm:gap-3">

                  <span
                    className="text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{
                      background:
                        "rgba(249,115,22,0.12)",
                      color:
                        "#f97316",
                      border:
                        "1px solid rgba(249,115,22,0.2)"
                    }}
                  >
                    {products.length}{" "}
                    {products.length ===
                    1
                      ? "product"
                      : "products"}
                  </span>


                  <button
                    onClick={
                      addProduct
                    }
                    className="flex items-center gap-1.5 text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl cursor-pointer"
                    style={{
                      background:
                        "linear-gradient(135deg,#f97316,#ea580c)",
                      color:
                        "#fff",
                      border:
                        "none",
                      boxShadow:
                        "0 4px 14px rgba(249,115,22,0.35)"
                    }}
                    onMouseEnter={(
                      e
                    ) => {

                      e.currentTarget.style.boxShadow =
                        "0 6px 20px rgba(249,115,22,0.5)";

                      e.currentTarget.style.transform =
                        "translateY(-1px)";

                    }}
                    onMouseLeave={(
                      e
                    ) => {

                      e.currentTarget.style.boxShadow =
                        "0 4px 14px rgba(249,115,22,0.35)";

                      e.currentTarget.style.transform =
                        "translateY(0)";

                    }}
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
                      <line
                        x1="12"
                        y1="5"
                        x2="12"
                        y2="19"
                      />

                      <line
                        x1="5"
                        y1="12"
                        x2="19"
                        y2="12"
                      />
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

            </div>


            {/* Table header — desktop */}

            <div
              className="hidden sm:grid grid-cols-[72px_2fr_1fr_1.35fr_100px] px-4 py-2.5 rounded-lg mb-3 text-xs font-semibold uppercase"
              style={{
                background:
                  "rgba(255,255,255,0.04)",
                border:
                  "1px solid rgba(255,255,255,0.06)",
                color:
                  "#64748b",
                letterSpacing:
                  "0.08em"
              }}
            >

              <span>
                Image
              </span>

              <span>
                Name
              </span>

              <span>
                Category
              </span>

              <span>
                Stock
              </span>

              <span className="text-center">
                Action
              </span>

            </div>


            {/* Products list */}

            <div className="flex flex-col gap-2">

              {products.map(
                (product) => (

                  <div
                    key={
                      product.id
                    }
                    className="rounded-xl transition-all duration-200"
                    style={{
                      background:
                        "rgba(255,255,255,0.02)",
                      border:
                        "1px solid rgba(255,255,255,0.05)"
                    }}
                    onMouseEnter={(
                      e
                    ) => {

                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.045)";

                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.09)";

                    }}
                    onMouseLeave={(
                      e
                    ) => {

                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.02)";

                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.05)";

                    }}
                  >


                    {/* MOBILE layout */}

                    <div className="flex sm:hidden items-center gap-3 p-3">

                      <img
                        src={
                          product.image
                        }
                        className="w-14 h-14 object-cover rounded-xl shrink-0"
                        style={{
                          border:
                            "1px solid rgba(255,255,255,0.1)"
                        }}
                        alt=""
                      />


                      <div className="flex-1 min-w-0">

                        <p
                          className="font-semibold text-sm truncate"
                          style={{
                            color:
                              "#f1f5f9"
                          }}
                        >
                          {
                            product.name
                          }
                        </p>


                        <p
                          className="text-xs mt-0.5 capitalize"
                          style={{
                            color:
                              "#64748b"
                          }}
                        >
                          {
                            product.category
                          }
                        </p>


                        <p
                          className="text-sm font-semibold mt-0.5"
                          style={{
                            color:
                              "#f97316"
                          }}
                        >
                          ₹
                          {
                            product.price
                          }
                        </p>


                        <div
                          className="mt-2"
                          style={{
                            maxWidth:
                              "100%"
                          }}
                        >
                          <ProductStock
                            sizes={
                              product.sizes
                            }
                          />
                        </div>

                      </div>


                      <div className="flex flex-col gap-1.5 shrink-0">

                        <button
                          onClick={() =>
                            editProduct(
                              product.id
                            )
                          }
                          className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer"
                          style={{
                            background:
                              "rgba(56,189,248,0.1)",
                            border:
                              "1px solid rgba(56,189,248,0.2)",
                            color:
                              "#38bdf8"
                          }}
                          onMouseEnter={(
                            e
                          ) => {

                            e.currentTarget.style.background =
                              "#0ea5e9";

                            e.currentTarget.style.color =
                              "#fff";

                          }}
                          onMouseLeave={(
                            e
                          ) => {

                            e.currentTarget.style.background =
                              "rgba(56,189,248,0.1)";

                            e.currentTarget.style.color =
                              "#38bdf8";

                          }}
                        >

                          <svg
                            width="13"
                            height="13"
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

                        </button>


                        <button
                          onClick={() =>
                            deleteProduct(
                              product.id
                            )
                          }
                          disabled={
                            deleting
                          }
                          className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer"
                          style={{
                            background:
                              "rgba(239,68,68,0.1)",
                            border:
                              "1px solid rgba(239,68,68,0.2)",
                            color:
                              "#f87171",
                            opacity:
                              deleting
                                ? 0.5
                                : 1,
                            cursor:
                              deleting
                                ? "not-allowed"
                                : "pointer"
                          }}
                          onMouseEnter={(
                            e
                          ) => {

                            if (
                              deleting
                            )
                              return;

                            e.currentTarget.style.background =
                              "#ef4444";

                            e.currentTarget.style.color =
                              "#fff";

                          }}
                          onMouseLeave={(
                            e
                          ) => {

                            if (
                              deleting
                            )
                              return;

                            e.currentTarget.style.background =
                              "rgba(239,68,68,0.1)";

                            e.currentTarget.style.color =
                              "#f87171";

                          }}
                        >

                          <svg
                            width="13"
                            height="13"
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

                        </button>

                      </div>

                    </div>


                    {/* DESKTOP layout */}

                    <div className="hidden sm:grid grid-cols-[72px_2fr_1fr_1.35fr_100px] items-center gap-0 px-4 py-3.5">

                      <img
                        src={
                          product.image
                        }
                        className="w-12 h-12 object-cover rounded-xl"
                        style={{
                          border:
                            "1px solid rgba(255,255,255,0.1)"
                        }}
                        alt=""
                      />


                      <div className="pr-4 min-w-0">

                        <p
                          className="text-sm font-medium truncate"
                          style={{
                            color:
                              "#e2e8f0"
                          }}
                        >
                          {
                            product.name
                          }
                        </p>


                        <p
                          className="text-xs mt-1"
                          style={{
                            color:
                              "#64748b"
                          }}
                        >
                          ₹
                          {
                            product.price
                          }
                        </p>

                      </div>


                      <p
                        className="text-sm capitalize"
                        style={{
                          color:
                            "#94a3b8"
                        }}
                      >
                        {
                          product.category
                        }
                      </p>


                      <ProductStock
                        sizes={
                          product.sizes
                        }
                      />


                      <div className="flex justify-center gap-2">

                        <button
                          onClick={() =>
                            editProduct(
                              product.id
                            )
                          }
                          className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 cursor-pointer"
                          style={{
                            background:
                              "rgba(56,189,248,0.1)",
                            border:
                              "1px solid rgba(56,189,248,0.2)",
                            color:
                              "#38bdf8"
                          }}
                          onMouseEnter={(
                            e
                          ) => {

                            e.currentTarget.style.background =
                              "#0ea5e9";

                            e.currentTarget.style.color =
                              "#fff";

                            e.currentTarget.style.borderColor =
                              "transparent";

                          }}
                          onMouseLeave={(
                            e
                          ) => {

                            e.currentTarget.style.background =
                              "rgba(56,189,248,0.1)";

                            e.currentTarget.style.color =
                              "#38bdf8";

                            e.currentTarget.style.borderColor =
                              "rgba(56,189,248,0.2)";

                          }}
                          title="Edit"
                        >

                          <svg
                            width="14"
                            height="14"
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

                        </button>


                        <button
                          onClick={() =>
                            deleteProduct(
                              product.id
                            )
                          }
                          disabled={
                            deleting
                          }
                          className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 cursor-pointer"
                          style={{
                            background:
                              "rgba(239,68,68,0.1)",
                            border:
                              "1px solid rgba(239,68,68,0.2)",
                            color:
                              "#f87171",
                            opacity:
                              deleting
                                ? 0.5
                                : 1,
                            cursor:
                              deleting
                                ? "not-allowed"
                                : "pointer"
                          }}
                          onMouseEnter={(
                            e
                          ) => {

                            if (
                              deleting
                            )
                              return;

                            e.currentTarget.style.background =
                              "#ef4444";

                            e.currentTarget.style.color =
                              "#fff";

                            e.currentTarget.style.borderColor =
                              "transparent";

                          }}
                          onMouseLeave={(
                            e
                          ) => {

                            if (
                              deleting
                            )
                              return;

                            e.currentTarget.style.background =
                              "rgba(239,68,68,0.1)";

                            e.currentTarget.style.color =
                              "#f87171";

                            e.currentTarget.style.borderColor =
                              "rgba(239,68,68,0.2)";

                          }}
                          title="Delete"
                        >

                          <svg
                            width="14"
                            height="14"
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

                        </button>

                      </div>

                    </div>

                  </div>

                )
              )}


              {products.length ===
                0 && (

                <div className="flex flex-col items-center justify-center py-20 gap-3">

                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background:
                        "rgba(255,255,255,0.04)",
                      border:
                        "1px solid rgba(255,255,255,0.08)"
                    }}
                  >

                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255,255,255,0.25)"
                      strokeWidth="1.5"
                    >

                      <rect
                        x="2"
                        y="3"
                        width="20"
                        height="14"
                        rx="2"
                      />

                      <path d="M8 21h8M12 17v4" />

                    </svg>

                  </div>


                  <p
                    className="text-sm"
                    style={{
                      color:
                        "#475569"
                    }}
                  >
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