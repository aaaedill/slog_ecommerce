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
  border: "1px solid rgba(47,93,255,0.25)",
  borderRadius: "16px",
  color: "#16307A",
  fontFamily: "Outfit, sans-serif",
  boxShadow: "0 8px 32px rgba(47,93,255,0.16), 0 1px 0 rgba(255,255,255,0.8) inset"
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
      toast.error(result?.message || "Failed to place order", { style: glassToastStyle });
      return;
    }

    toast.success("Order placed successfully", { style: glassToastStyle });
    navigate("/orders");
  };

  const inputClass =
    "po-input w-full bg-[var(--bg-card)] border rounded-xl px-4 py-3 text-sm placeholder-slate-400 transition-all duration-200";

  return (
    <div
      className="po-root min-h-screen rounded-3xl overflow-hidden mt-5"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&display=swap');

        .po-root {
          font-family: 'Outfit', sans-serif;
          color: var(--text-primary);
          background:
            radial-gradient(ellipse 70% 50% at 70% 0%, rgba(47,93,255,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 10% 100%, rgba(110,139,255,0.05) 0%, transparent 60%),
            var(--bg-primary);
        }

        .po-card {
          background: rgba(255,255,255,0.65);
          border: 1px solid rgba(47,93,255,0.14);
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
          box-shadow: 0 1px 0 rgba(255,255,255,0.8) inset, 0 4px 24px rgba(47,93,255,0.06);
          border-radius: 1.1rem;
        }

        .po-input {
          border-color: rgba(47,93,255,0.16);
          color: var(--text-primary);
        }
        .po-input:focus {
          outline: none;
          border-color: #2F5DFF;
          box-shadow: 0 0 0 3px rgba(47,93,255,0.14);
        }

        .po-back-btn {
          background: rgba(255,255,255,0.6);
          border-color: rgba(47,93,255,0.16);
          color: var(--text-secondary);
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
          box-shadow: 0 2px 12px rgba(47,93,255,0.06);
        }
        .po-back-btn:hover {
          background: rgba(255,255,255,0.95);
          color: #2F5DFF;
        }

        .po-pay-btn {
          border-width: 1.5px;
          transition: all 0.25s ease;
        }
        .po-pay-btn.selected {
          background: rgba(47,93,255,0.06);
          border-color: #2F5DFF;
          box-shadow: 0 4px 16px rgba(47,93,255,0.12);
        }
        .po-pay-btn:not(.selected) {
          background: rgba(255,255,255,0.5);
          border-color: rgba(47,93,255,0.14);
        }
        .po-pay-btn:not(.selected):hover {
          background: rgba(255,255,255,0.85);
          border-color: rgba(47,93,255,0.28);
        }

        .po-radio {
          border-width: 2px;
          transition: all 0.2s ease;
        }
        .po-radio.selected { border-color: #2F5DFF; }
        .po-radio:not(.selected) { border-color: rgba(47,93,255,0.25); }
        .po-radio-dot {
          background: #2F5DFF;
          box-shadow: 0 0 6px rgba(47,93,255,0.5);
        }

        .po-cta {
          background: #2F5DFF;
          color: #FFFFFF;
          box-shadow: 0 8px 24px rgba(47,93,255,0.28);
          transition: background 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease;
        }
        .po-cta:hover {
          background: #16307A;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(47,93,255,0.34);
        }

        @keyframes po-blur-in {
          from { opacity: 0; filter: blur(8px); transform: translateY(16px); }
          to   { opacity: 1; filter: blur(0); transform: translateY(0); }
        }
        .po-anim { animation: po-blur-in 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .po-anim-1 { animation-delay: 0.05s; }
        .po-anim-2 { animation-delay: 0.12s; }
        .po-anim-3 { animation-delay: 0.18s; }
        .po-anim-4 { animation-delay: 0.24s; }

        /* ── DARK MODE ── */
        html.dark-mode .po-card {
          background: rgba(30,41,59,0.65) !important;
          border-color: rgba(96,130,255,0.20) !important;
          box-shadow: 0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 24px rgba(0,0,0,0.25) !important;
        }
        html.dark-mode .po-back-btn {
          background: rgba(30,41,59,0.65) !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.20) !important;
        }
        html.dark-mode .po-back-btn:hover {
          background: rgba(30,41,59,0.95) !important;
          color: #6E8BFF !important;
        }
        html.dark-mode .po-pay-btn:not(.selected) {
          background: rgba(30,41,59,0.55) !important;
          border-color: rgba(96,130,255,0.18) !important;
        }
        html.dark-mode .po-pay-btn:not(.selected):hover {
          background: rgba(30,41,59,0.85) !important;
          border-color: rgba(96,130,255,0.32) !important;
        }
        html.dark-mode .po-pay-btn.selected {
          background: rgba(47,93,255,0.14) !important;
        }
        html.dark-mode .po-root.po-root {
          background-color: #000000 !important;
          background-image:
            radial-gradient(ellipse 70% 50% at 70% 0%, rgba(47,93,255,0.10) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 10% 100%, rgba(110,139,255,0.08) 0%, transparent 60%) !important;
        }
      `}</style>

      {/* Back Button */}
      <div className="px-6 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="po-back-btn flex items-center px-4 py-2 rounded-full border transition-all duration-200 cursor-pointer"
          style={{ fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.04em' }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ marginRight: '4px' }}>
            <path d="M8 1.5L3.5 6.5L8 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-6 py-10 pb-20">

        {/* Page Header */}
        <div className="po-anim po-anim-1 mb-8">
          <h1 className="text-3xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Delivery <span style={{ color: '#2F5DFF' }}>&amp; Payment</span>
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* LEFT — Delivery Information */}
          <div className="po-anim po-anim-2 flex-1">
            <div className="po-card overflow-hidden">

              <div className="px-7 py-4 border-b" style={{ borderColor: 'rgba(47,93,255,0.12)' }}>
                <span className="font-medium tracking-wide" style={{ fontSize: '0.8rem', color: '#2F5DFF' }}>
                  Delivery Information
                </span>
              </div>

              <div className="px-7 py-6 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className={inputClass} />
                  <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className={inputClass} />
                </div>

                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className={inputClass} />
                <input type="text" name="street" placeholder="Street Address" value={formData.street} onChange={handleChange} className={inputClass} />

                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className={inputClass} />
                  <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} className={inputClass} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="zipcode" placeholder="Zip Code" value={formData.zipcode} onChange={handleChange} className={inputClass} />
                  <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} className={inputClass} />
                </div>

                <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* RIGHT — Summary + Payment */}
          <div className="w-full lg:w-72 flex flex-col gap-4 flex-shrink-0">

            {/* Order Summary */}
            <div className="po-anim po-anim-3 po-card p-7">
              <p className="font-medium tracking-wide mb-5" style={{ fontSize: '0.8rem', color: '#2F5DFF' }}>
                Order Summary
              </p>

              <div className="flex justify-between items-baseline mb-3">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Subtotal</span>
                <span className="font-medium" style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>₹{getCartTotal()}</span>
              </div>

              <div className="flex justify-between items-baseline mb-3">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Shipping</span>
                <span className="font-medium" style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>₹{shipping}</span>
              </div>

              <div className="my-4" style={{ height: '1px', background: 'rgba(47,93,255,0.14)' }} />

              <div className="flex justify-between items-end">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Total</span>
                <span className="font-bold leading-none" style={{ fontSize: '1.9rem', color: '#2F5DFF' }}>₹{total}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="po-anim po-anim-4 po-card p-7">
              <p className="font-medium tracking-wide mb-5" style={{ fontSize: '0.8rem', color: '#2F5DFF' }}>
                Payment Method
              </p>

              <div className="flex flex-col gap-3">

                {/* PhonePe */}
                <button
                  onClick={() => setMethod("phonepe")}
                  className={`po-pay-btn flex items-center gap-4 px-5 py-3.5 rounded-xl cursor-pointer text-left ${method === "phonepe" ? "selected" : ""}`}
                >
                  <div className={`po-radio w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${method === "phonepe" ? "selected" : ""}`}>
                    {method === "phonepe" && <div className="po-radio-dot w-2 h-2 rounded-full" />}
                  </div>
                  <img src={phonepe} alt="PhonePe" className="h-5 object-contain" />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>PhonePe</span>
                </button>

                {/* GPay */}
                <button
                  onClick={() => setMethod("gpay")}
                  className={`po-pay-btn flex items-center gap-4 px-5 py-3.5 rounded-xl cursor-pointer text-left ${method === "gpay" ? "selected" : ""}`}
                >
                  <div className={`po-radio w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${method === "gpay" ? "selected" : ""}`}>
                    {method === "gpay" && <div className="po-radio-dot w-2 h-2 rounded-full" />}
                  </div>
                  <img src={gpay} alt="GPay" className="h-5 object-contain" />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Google Pay</span>
                </button>

                {/* COD */}
                <button
                  onClick={() => setMethod("cod")}
                  className={`po-pay-btn flex items-center gap-4 px-5 py-3.5 rounded-xl cursor-pointer text-left ${method === "cod" ? "selected" : ""}`}
                >
                  <div className={`po-radio w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${method === "cod" ? "selected" : ""}`}>
                    {method === "cod" && <div className="po-radio-dot w-2 h-2 rounded-full" />}
                  </div>
                  <div className="flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Cash on Delivery</span>
                </button>

              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleOrder}
              className="po-cta po-anim po-anim-4 w-full py-4 rounded-xl font-medium tracking-wide cursor-pointer border-none"
              style={{ fontSize: '0.85rem' }}
            >
              Place Order
            </button>

            {/* Secure note */}
            <div className="flex items-center justify-center gap-1.5" style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                <rect x="0.6" y="4.6" width="8.8" height="6.8" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
                <path d="M2.5 4.5V3A2.5 2.5 0 0 1 7.5 3v1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
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