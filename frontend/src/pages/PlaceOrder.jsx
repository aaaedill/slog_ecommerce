
import { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import gpay from "../assets/gpay.webp";
import phonepe from "../assets/phonepe.webp";

const glassToastStyle = {
  background: "rgba(255,255,255,0.55)",
  backdropFilter: "blur(24px) saturate(1.8)",
  WebkitBackdropFilter: "blur(24px) saturate(1.8)",
  border: "1px solid rgba(107,142,35,0.25)",
  borderRadius: "16px",
  color: "#4B5320",
  fontFamily: "Jost, sans-serif",
  boxShadow:
    "0 8px 32px rgba(107,142,35,0.16), 0 1px 0 rgba(255,255,255,0.8) inset"
};

const emptyForm = {
  name: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postCode: "",
  phone: ""
};

const CodIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-5 h-5"
  >
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);

const paymentOptions = [
  { id: "phonepe", label: "PhonePe", img: phonepe },
  { id: "gpay", label: "Google Pay", img: gpay },
  { id: "cod", label: "Cash on Delivery", img: null }
];

const PlaceOrder = () => {
  const { getCartTotal, placeOrder } = useContext(ShopContext);
  const navigate = useNavigate();
  const [method, setMethod] = useState("cod");
  const [placing, setPlacing] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const shipping = 50;
  const subtotal = getCartTotal();
  const total = subtotal + shipping;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrder = async () => {
    if (placing) return;

    const emptyField = Object.values(formData).some(
      (value) => value.trim() === ""
    );

    if (emptyField) {
      toast.error("Fill all the blanks", { style: glassToastStyle });
      return;
    }

    if (method === "gpay" || method === "phonepe") {
      toast.warning("UPI Services Unavailable", { style: glassToastStyle });
      return;
    }

    setPlacing(true);
    const result = await placeOrder(formData, method);
    setPlacing(false);

    if (!result?.success) {
      toast.error(result?.message || "Failed to place order", {
        style: glassToastStyle
      });
      return;
    }

    toast.success("Order placed successfully", {
      style: glassToastStyle
    });

    // Clear the address form after a successful order
    setFormData(emptyForm);
    navigate("/orders");
  };

  const inputClass =
    "po-input w-full min-w-0 bg-[var(--bg-card)] border rounded-xl px-4 py-3 text-base sm:text-sm placeholder-slate-400 transition-all duration-200";

  return (
    <div className="po-root min-h-screen mt-5">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap');

        .po-root {
          font-family: 'Jost', sans-serif;
          color: var(--text-primary);
          background: var(--bg-primary);
          min-height: 100vh;
          min-height: 100dvh;
          overflow-x: hidden;
        }

        .po-input {
          border-color: rgba(107, 142, 35, 0.16);
          color: var(--text-primary);
        }

        .po-input:focus {
          outline: none;
          border-color: #6B8E23;
          box-shadow: 0 0 0 3px rgba(107, 142, 35, 0.14);
        }

        .po-textarea {
          resize: vertical;
          min-height: 7rem;
          line-height: 1.55;
          font-family: inherit;
        }

        .po-back-btn {
          background: rgba(255, 255, 255, 0.6);
          border-color: rgba(107, 142, 35, 0.16);
          color: var(--text-secondary);
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
          box-shadow: 0 2px 12px rgba(107, 142, 35, 0.06);
        }

        .po-back-btn:hover {
          background: rgba(255, 255, 255, 0.95);
          color: #4B5320;
        }

        .po-pay-btn {
          border-width: 1px;
          border-left-width: 2px;
          width: 100%;
          min-width: 0;
          transition:
            background 0.25s ease,
            border-color 0.25s ease;
        }

        .po-pay-btn.selected {
          background: rgba(107, 142, 35, 0.05);
          border-color: rgba(107, 142, 35, 0.16);
          border-left-color: #6B8E23;
        }

        .po-pay-btn:not(.selected) {
          background: rgba(255, 255, 255, 0.5);
          border-color: rgba(107, 142, 35, 0.14);
          border-left-color: rgba(107, 142, 35, 0.14);
        }

        .po-pay-btn:not(.selected):hover {
          background: rgba(255, 255, 255, 0.85);
          border-color: rgba(107, 142, 35, 0.26);
        }

        .po-radio {
          border-width: 1.5px;
          transition: border-color 0.2s ease;
        }

        .po-radio.selected {
          border-color: #6B8E23;
        }

        .po-radio:not(.selected) {
          border-color: rgba(107, 142, 35, 0.28);
        }

        .po-radio-dot {
          background: #6B8E23;
        }

        .po-cta {
          background: #6B8E23;
          color: #FFFFFF;
          box-shadow:
            0 8px 24px rgba(107, 142, 35, 0.24),
            0 1px 0 rgba(255, 255, 255, 0.3) inset;
          transition:
            background 0.25s ease,
            transform 0.2s ease,
            box-shadow 0.25s ease,
            opacity 0.2s ease;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-size: 0.78rem !important;
        }

        .po-cta:hover {
          background: #4B5320;
          transform: translateY(-2px);
          box-shadow:
            0 12px 32px rgba(107, 142, 35, 0.30),
            0 1px 0 rgba(255, 255, 255, 0.3) inset;
        }

        .po-cta:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .po-total-figure {
          font-weight: 300;
          letter-spacing: -0.01em;
        }

        .po-section-label {
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #4B5320;
        }

        /* Mobile sticky checkout bar */
        .po-mobile-bar {
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
          border-top: 1px solid rgba(107, 142, 35, 0.18);
          box-shadow: 0 -8px 28px rgba(107, 142, 35, 0.10);
          padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
        }

        @keyframes po-blur-in {
          from {
            opacity: 0;
            filter: blur(8px);
            transform: translateY(16px);
          }

          to {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0);
          }
        }

        .po-anim {
          animation: po-blur-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .po-anim-1 { animation-delay: 0.05s; }
        .po-anim-2 { animation-delay: 0.12s; }
        .po-anim-3 { animation-delay: 0.18s; }
        .po-anim-4 { animation-delay: 0.24s; }

        @media (prefers-reduced-motion: reduce) {
          .po-anim {
            animation: none !important;
            opacity: 1 !important;
            filter: none !important;
            transform: none !important;
          }
        }

        /* ── DARK MODE ── */

        html.dark-mode .po-root {
          background: #000000 !important;
          background-image: none !important;
        }

        html.dark-mode .po-back-btn {
          background: rgba(30, 41, 59, 0.65) !important;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.20) !important;
        }

        html.dark-mode .po-back-btn:hover {
          background: rgba(30, 41, 59, 0.95) !important;
          color: #A9C46C !important;
        }

        html.dark-mode .po-section-label {
          color: #A9C46C !important;
        }

        html.dark-mode .po-pay-btn:not(.selected) {
          background: rgba(30, 41, 59, 0.55) !important;
          border-color: rgba(169, 196, 108, 0.16) !important;
          border-left-color: rgba(169, 196, 108, 0.16) !important;
        }

        html.dark-mode .po-pay-btn:not(.selected):hover {
          background: rgba(30, 41, 59, 0.85) !important;
          border-color: rgba(169, 196, 108, 0.30) !important;
        }

        html.dark-mode .po-pay-btn.selected {
          background: rgba(169, 196, 108, 0.10) !important;
          border-color: rgba(169, 196, 108, 0.18) !important;
          border-left-color: #A9C46C !important;
        }

        html.dark-mode .po-radio.selected {
          border-color: #A9C46C !important;
        }

        html.dark-mode .po-radio:not(.selected) {
          border-color: rgba(169, 196, 108, 0.30) !important;
        }

        html.dark-mode .po-radio-dot {
          background: #A9C46C !important;
        }

        html.dark-mode .po-cta {
          background: #A9C46C !important;
          color: #10131F !important;
        }

        html.dark-mode .po-cta:hover {
          background: #C4D699 !important;
        }

        html.dark-mode .po-input:focus {
          border-color: #A9C46C !important;
          box-shadow: 0 0 0 3px rgba(169, 196, 108, 0.18) !important;
        }

        html.dark-mode .po-mobile-bar {
          background: rgba(0, 0, 0, 0.82) !important;
          border-top-color: rgba(169, 196, 108, 0.20) !important;
          box-shadow: 0 -8px 28px rgba(0, 0, 0, 0.45) !important;
        }

        html.dark-mode .po-accent {
          color: #A9C46C !important;
        }

        /* ── RESPONSIVE ── */

        /* Touch screens: no stuck hover lift, comfortable tap targets */
        @media (hover: none) {
          .po-cta:hover {
            transform: none;
          }
        }

        @media (pointer: coarse) {
          .po-back-btn {
            min-height: 2.75rem;
          }
          .po-pay-btn {
            min-height: 3.25rem;
          }
        }

        /* Very small phones (≤ 359px): tighten spacing */
        @media (max-width: 359px) {
          .po-pay-btn {
            padding-left: 0.875rem;
            padding-right: 0.875rem;
            gap: 0.625rem;
          }
        }

        /* Short landscape phones: don't let the sticky bar eat the screen */
        @media (max-height: 480px) and (orientation: landscape) {
          .po-mobile-bar {
            padding-top: 0.5rem;
            padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0px));
          }
        }
      `}</style>

      {/* Back Button */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="po-back-btn flex items-center px-4 py-2 rounded-full border transition-all duration-200 cursor-pointer"
          style={{
            fontSize: "0.78rem",
            fontWeight: 500,
            letterSpacing: "0.04em"
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            style={{ marginRight: "4px" }}
          >
            <path
              d="M8 1.5L3.5 6.5L8 11.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Home Page
        </button>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-10 pb-32 md:pb-16 lg:pb-20">
        {/* Page Header */}
        <div className="po-anim po-anim-1 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight break-words">
            Delivery{" "}
            <span className="po-accent" style={{ color: "#6B8E23" }}>
              &amp; Payment
            </span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_17rem] lg:grid-cols-[minmax(0,1fr)_21rem] gap-8 md:gap-8 lg:gap-12 items-start">
          {/* LEFT — Delivery Information */}
          <section className="po-anim po-anim-2 min-w-0 w-full">
            <div
              className="py-3 sm:py-4 border-b"
              style={{ borderColor: "rgba(107, 142, 35, 0.12)" }}
            >
              <span className="po-section-label">Delivery Information</span>
            </div>

            <div className="py-5 sm:py-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Name */}
              <input
                type="text"
                name="name"
                placeholder="Name"
                aria-label="Name"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                className={`${inputClass} sm:col-span-2`}
              />

              {/* Address Line 1 — house name */}
              <input
                type="text"
                name="addressLine1"
                placeholder="Address Line 1 (House Name)"
                aria-label="Address Line 1, house name"
                autoComplete="address-line1"
                value={formData.addressLine1}
                onChange={handleChange}
                className={`${inputClass} sm:col-span-2`}
              />

              {/* Address Line 2 — full address incl. post office */}
              <textarea
                name="addressLine2"
                rows={4}
                placeholder="Address Line 2 (Full address — street, area, landmark, post office)"
                aria-label="Address Line 2, full address including post office"
                autoComplete="address-line2"
                value={formData.addressLine2}
                onChange={handleChange}
                className={`${inputClass} po-textarea sm:col-span-2`}
              />

              {/* City / State */}
              <input
                type="text"
                name="city"
                placeholder="City"
                aria-label="City"
                autoComplete="address-level2"
                value={formData.city}
                onChange={handleChange}
                className={inputClass}
              />

              <input
                type="text"
                name="state"
                placeholder="State"
                aria-label="State"
                autoComplete="address-level1"
                value={formData.state}
                onChange={handleChange}
                className={inputClass}
              />

              {/* Post Code / Phone */}
              <input
                type="text"
                inputMode="numeric"
                name="postCode"
                placeholder="Post Code"
                aria-label="Post code"
                autoComplete="postal-code"
                value={formData.postCode}
                onChange={handleChange}
                className={inputClass}
              />

              <input
                type="tel"
                inputMode="tel"
                name="phone"
                placeholder="Phone Number"
                aria-label="Phone number"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </section>

          {/* RIGHT — Summary + Payment */}
          <aside className="w-full min-w-0 flex flex-col gap-6 md:gap-7 md:sticky md:top-24">
            {/* Order Summary */}
            <div className="po-anim po-anim-3">
              <p className="po-section-label mb-4 sm:mb-5">Order Summary</p>

              <div className="flex justify-between items-baseline gap-3 mb-3">
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)"
                  }}
                >
                  Subtotal
                </span>
                <span
                  className="font-medium"
                  style={{
                    fontSize: "0.88rem",
                    color: "var(--text-primary)"
                  }}
                >
                  ₹{subtotal}
                </span>
              </div>

              <div className="flex justify-between items-baseline gap-3 mb-3">
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)"
                  }}
                >
                  Shipping
                </span>
                <span
                  className="font-medium"
                  style={{
                    fontSize: "0.88rem",
                    color: "var(--text-primary)"
                  }}
                >
                  ₹{shipping}
                </span>
              </div>

              <div
                className="my-4"
                style={{
                  height: "1px",
                  background: "rgba(107, 142, 35, 0.14)"
                }}
              />

              <div className="flex justify-between items-end gap-3">
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-primary)"
                  }}
                >
                  Total
                </span>
                <span
                  className="po-total-figure po-accent leading-none"
                  style={{
                    fontSize: "clamp(1.75rem, 6vw, 2.1rem)",
                    color: "#6B8E23"
                  }}
                >
                  ₹{total}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="po-anim po-anim-4">
              <p className="po-section-label mb-4 sm:mb-5">Payment Method</p>

              <div
                role="radiogroup"
                aria-label="Payment method"
                className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-3"
              >
                {paymentOptions.map((opt) => {
                  const selected = method === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setMethod(opt.id)}
                      className={`po-pay-btn flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 rounded-xl cursor-pointer text-left ${
                        selected ? "selected" : ""
                      }`}
                    >
                      <div
                        className={`po-radio w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${
                          selected ? "selected" : ""
                        }`}
                      >
                        {selected && (
                          <div className="po-radio-dot w-2 h-2 rounded-full" />
                        )}
                      </div>

                      {opt.img ? (
                        <img
                          src={opt.img}
                          alt=""
                          className="h-5 w-auto flex-shrink-0 object-contain"
                        />
                      ) : (
                        <div
                          className="flex items-center justify-center flex-shrink-0"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <CodIcon />
                        </div>
                      )}

                      <span
                        className="text-sm font-medium min-w-0 leading-tight"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA — tablet / desktop */}
            <button
              type="button"
              onClick={handleOrder}
              disabled={placing}
              className="po-cta po-anim po-anim-4 hidden md:block w-full py-4 rounded-xl font-medium cursor-pointer border-none"
            >
              {placing ? "Placing..." : "Place Order"}
            </button>

            {/* Secure note */}
            <div
              className="flex items-center justify-center gap-1.5"
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.7rem"
              }}
            >
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                <rect
                  x="0.6"
                  y="4.6"
                  width="8.8"
                  height="6.8"
                  rx="1.2"
                  stroke="currentColor"
                  strokeWidth="1.1"
                />
                <path
                  d="M2.5 4.5V3A2.5 2.5 0 0 1 7.5 3v1.5"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
              </svg>
              <span>Secured &amp; encrypted checkout</span>
            </div>
          </aside>
        </div>
      </div>

      {/* CTA — mobile sticky bar (total + Place Order always in reach) */}
      <div className="po-mobile-bar md:hidden fixed bottom-0 inset-x-0 z-40 px-4 pt-3">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <div className="flex flex-col min-w-0">
            <span
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--text-secondary)"
              }}
            >
              Total
            </span>
            <span
              className="po-accent font-medium leading-tight truncate"
              style={{ fontSize: "1.35rem", color: "#6B8E23" }}
            >
              ₹{total}
            </span>
          </div>

          <button
            type="button"
            onClick={handleOrder}
            disabled={placing}
            className="po-cta flex-1 py-3.5 rounded-xl font-medium cursor-pointer border-none"
          >
            {placing ? "Placing..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;