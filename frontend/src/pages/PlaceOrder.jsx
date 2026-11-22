import { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import gpay from "../assets/gpay.png";
import phonepe from "../assets/phonepe.png";

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

const PlaceOrder = () => {
  const { getCartTotal, placeOrder } = useContext(ShopContext);
  const navigate = useNavigate();
  const [method, setMethod] = useState("cod");
  const shipping = 50;
  const total = getCartTotal() + shipping;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOrder = async () => {
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

    const result = await placeOrder(formData, method);

    if (!result?.success) {
      toast.error(result?.message || "Failed to place order", {
        style: glassToastStyle
      });
      return;
    }

    toast.success("Order placed successfully", {
      style: glassToastStyle
    });

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
            box-shadow 0.25s ease;
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

        .po-anim-1 {
          animation-delay: 0.05s;
        }

        .po-anim-2 {
          animation-delay: 0.12s;
        }

        .po-anim-3 {
          animation-delay: 0.18s;
        }

        .po-anim-4 {
          animation-delay: 0.24s;
        }

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
      
        /* ── RESPONSIVE ADDITIONS ── */

        /* Touch screens: no stuck hover lift, comfortable back button */
        @media (hover: none) {
          .po-cta:hover {
            transform: none;
          }
        }

        @media (pointer: coarse) {
          .po-back-btn {
            min-height: 2.75rem;
          }
        }
`}</style>

      {/* Back Button */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <button
          onClick={() => navigate(-1)}
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
          Back
        </button>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-16 sm:pb-20">
        {/* Page Header */}
        <div className="po-anim po-anim-1 mb-6 sm:mb-8">
          <h1
            className="text-2xl sm:text-3xl font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Delivery{" "}
            <span style={{ color: "#6B8E23" }}>&amp; Payment</span>
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* LEFT — Delivery Information */}
          <div className="po-anim po-anim-2 flex-1 min-w-0 w-full">
            <div>
              <div
                className="px-0 py-4 border-b"
                style={{
                  borderColor: "rgba(107, 142, 35, 0.12)"
                }}
              >
                <span className="po-section-label">
                  Delivery Information
                </span>
              </div>

              <div className="px-0 py-6 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={inputClass}
                  />

                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                />

                <input
                  type="text"
                  name="street"
                  placeholder="Street Address"
                  value={formData.street}
                  onChange={handleChange}
                  className={inputClass}
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    className={inputClass}
                  />

                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="zipcode"
                    placeholder="Zip Code"
                    value={formData.zipcode}
                    onChange={handleChange}
                    className={inputClass}
                  />

                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* RIGHT — Summary + Payment */}
          <div className="w-full md:w-72 lg:w-80 flex flex-col gap-4 flex-shrink-0">
            {/* Order Summary */}
            <div className="po-anim po-anim-3 p-0">
              <p className="po-section-label mb-5">
                Order Summary
              </p>

              <div className="flex justify-between items-baseline mb-3">
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
                  ₹{getCartTotal()}
                </span>
              </div>

              <div className="flex justify-between items-baseline mb-3">
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

              <div className="flex justify-between items-end">
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-primary)"
                  }}
                >
                  Total
                </span>

                <span
                  className="po-total-figure leading-none"
                  style={{
                    fontSize: "2.1rem",
                    color: "#6B8E23"
                  }}
                >
                  ₹{total}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="po-anim po-anim-4 p-0">
              <p className="po-section-label mb-5">
                Payment Method
              </p>

              <div className="flex flex-col gap-3">
                {/* PhonePe */}
                <button
                  onClick={() => setMethod("phonepe")}
                  className={`po-pay-btn flex items-center gap-4 px-5 py-3.5 rounded-xl cursor-pointer text-left ${
                    method === "phonepe" ? "selected" : ""
                  }`}
                >
                  <div
                    className={`po-radio w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${
                      method === "phonepe" ? "selected" : ""
                    }`}
                  >
                    {method === "phonepe" && (
                      <div className="po-radio-dot w-2 h-2 rounded-full" />
                    )}
                  </div>

                  <img
                    src={phonepe}
                    alt="PhonePe"
                    className="h-5 object-contain"
                  />

                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    PhonePe
                  </span>
                </button>

                {/* GPay */}
                <button
                  onClick={() => setMethod("gpay")}
                  className={`po-pay-btn flex items-center gap-4 px-5 py-3.5 rounded-xl cursor-pointer text-left ${
                    method === "gpay" ? "selected" : ""
                  }`}
                >
                  <div
                    className={`po-radio w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${
                      method === "gpay" ? "selected" : ""
                    }`}
                  >
                    {method === "gpay" && (
                      <div className="po-radio-dot w-2 h-2 rounded-full" />
                    )}
                  </div>

                  <img
                    src={gpay}
                    alt="GPay"
                    className="h-5 object-contain"
                  />

                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Google Pay
                  </span>
                </button>

                {/* COD */}
                <button
                  onClick={() => setMethod("cod")}
                  className={`po-pay-btn flex items-center gap-4 px-5 py-3.5 rounded-xl cursor-pointer text-left ${
                    method === "cod" ? "selected" : ""
                  }`}
                >
                  <div
                    className={`po-radio w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${
                      method === "cod" ? "selected" : ""
                    }`}
                  >
                    {method === "cod" && (
                      <div className="po-radio-dot w-2 h-2 rounded-full" />
                    )}
                  </div>

                  <div
                    className="flex items-center justify-center"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-5 h-5"
                    >
                      <rect
                        x="2"
                        y="5"
                        width="20"
                        height="14"
                        rx="2"
                      />
                      <path d="M2 10h20" />
                    </svg>
                  </div>

                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Cash on Delivery
                  </span>
                </button>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleOrder}
              className="po-cta po-anim po-anim-4 w-full py-4 rounded-xl font-medium cursor-pointer border-none"
            >
              Place Order
            </button>

            {/* Secure note */}
            <div
              className="flex items-center justify-center gap-1.5"
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.7rem"
              }}
            >
              <svg
                width="10"
                height="12"
                viewBox="0 0 10 12"
                fill="none"
              >
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;