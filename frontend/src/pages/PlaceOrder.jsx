import { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import gpay from "../assets/gpay.png";
import phonepe from "../assets/phonepe.png";

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

  const handleOrder = () => {
    const emptyField = Object.values(formData).some(
      (value) => value.trim() === ""
    );
    if (emptyField) {
      toast.error("Fill all the blanks");
      return;
    }
    if (method === "gpay" || method === "phonepe") {
      toast.warning("UPI Services Unavailable", {
        style: { background: "#fde047", color: "#000" }
      });
      return;
    }
    placeOrder(formData, method);
    toast.success("Order placed successfully");
    navigate("/orders");
  };

  const inputClass =
    "w-full bg-white border border-stone-200 text-stone-800 placeholder-stone-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-400 transition-all duration-200";

  return (
    <div className="min-h-screen rounded-3xl overflow-hidden mt-5" style={{ background: '#EDE8E0', color: '#2C2825' }}>

      {/* Back Button */}
      <div className="px-6 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2 rounded-full backdrop-blur-xl border transition-all duration-200 cursor-pointer"
          style={{ background: 'rgba(237,232,224,0.75)', borderColor: 'rgba(212,204,192,0.6)', color: '#6B6058', fontFamily: "'Jost', sans-serif", fontSize: '0.78rem', fontWeight: 400, letterSpacing: '0.06em', boxShadow: '0 2px 12px rgba(44,40,37,0.06)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.95)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(237,232,224,0.75)'}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ marginRight: '2px' }}>
            <path d="M8 1.5L3.5 6.5L8 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-6 py-10 pb-20">

        {/* Page Header */}
        <div className="mb-8">
          <p className="text-xs font-medium tracking-[0.35em] uppercase mb-2" style={{ color: '#9A9188' }}>
            Complete Your Order
          </p>
          <h1 className="text-3xl font-light tracking-wide" style={{ color: '#2C2825' }}>
            Delivery & Payment
          </h1>
          <div className="mt-3 h-px w-20" style={{ background: '#2C2825' }} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* LEFT — Delivery Information */}
          <div className="flex-1">
            <div className="border rounded-sm overflow-hidden" style={{ background: '#E4DDD3', borderColor: '#D4CCC0' }}>

              <div className="px-7 py-4 border-b" style={{ borderColor: '#D4CCC0' }}>
                <span className="font-medium tracking-widest uppercase" style={{ fontSize: '0.6rem', color: '#9A9188' }}>
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
            <div className="border rounded-sm p-7" style={{ background: '#E4DDD3', borderColor: '#D4CCC0' }}>
              <p className="font-medium tracking-widest uppercase mb-6" style={{ fontSize: '0.6rem', color: '#9A9188' }}>
                Order Summary
              </p>

              <div className="flex justify-between items-baseline mb-3">
                <span className="font-light" style={{ fontSize: '0.78rem', color: '#9A9188' }}>Subtotal</span>
                <span className="font-medium" style={{ fontSize: '0.8rem', color: '#2C2825' }}>₹{getCartTotal()}</span>
              </div>
              <div className="flex justify-between items-baseline mb-3">
                <span className="font-light" style={{ fontSize: '0.78rem', color: '#9A9188' }}>Shipping</span>
                <span className="font-medium" style={{ fontSize: '0.8rem', color: '#2C2825' }}>₹{shipping}</span>
              </div>

              <div className="my-4" style={{ height: '1px', background: '#D4CCC0' }} />

              <div className="flex justify-between items-end">
                <span className="tracking-wide" style={{ fontSize: '0.72rem', color: '#2C2825' }}>Total</span>
                <span className="font-light leading-none" style={{ fontFamily: "'Fraunces', serif", fontSize: '1.9rem', color: '#2C2825' }}>
                  ₹{total}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="border rounded-sm p-7" style={{ background: '#E4DDD3', borderColor: '#D4CCC0' }}>
              <p className="font-medium tracking-widest uppercase mb-5" style={{ fontSize: '0.6rem', color: '#9A9188' }}>
                Payment Method
              </p>

              <div className="flex flex-col gap-3">
                {/* PhonePe */}
                <button
                  onClick={() => setMethod("phonepe")}
                  className={`flex items-center gap-4 px-5 py-3.5 rounded-sm border-2 transition-all duration-200 cursor-pointer text-left ${
                    method === "phonepe" ? "bg-white" : "bg-white/50 hover:bg-white/80"
                  }`}
                  style={{ borderColor: method === "phonepe" ? '#2C2825' : '#D4CCC0' }}
                >
                  <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
                    style={{ borderColor: method === "phonepe" ? '#2C2825' : '#D4CCC0' }}>
                    {method === "phonepe" && <div className="w-2 h-2 rounded-full" style={{ background: '#2C2825' }} />}
                  </div>
                  <img src={phonepe} alt="PhonePe" className="h-5 object-contain" />
                  <span className="text-sm font-medium" style={{ color: '#2C2825' }}>PhonePe</span>
                </button>

                {/* GPay */}
                <button
                  onClick={() => setMethod("gpay")}
                  className={`flex items-center gap-4 px-5 py-3.5 rounded-sm border-2 transition-all duration-200 cursor-pointer text-left ${
                    method === "gpay" ? "bg-white" : "bg-white/50 hover:bg-white/80"
                  }`}
                  style={{ borderColor: method === "gpay" ? '#2C2825' : '#D4CCC0' }}
                >
                  <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
                    style={{ borderColor: method === "gpay" ? '#2C2825' : '#D4CCC0' }}>
                    {method === "gpay" && <div className="w-2 h-2 rounded-full" style={{ background: '#2C2825' }} />}
                  </div>
                  <img src={gpay} alt="GPay" className="h-5 object-contain" />
                  <span className="text-sm font-medium" style={{ color: '#2C2825' }}>Google Pay</span>
                </button>

                {/* COD */}
                <button
                  onClick={() => setMethod("cod")}
                  className={`flex items-center gap-4 px-5 py-3.5 rounded-sm border-2 transition-all duration-200 cursor-pointer text-left ${
                    method === "cod" ? "bg-white" : "bg-white/50 hover:bg-white/80"
                  }`}
                  style={{ borderColor: method === "cod" ? '#2C2825' : '#D4CCC0' }}
                >
                  <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
                    style={{ borderColor: method === "cod" ? '#2C2825' : '#D4CCC0' }}>
                    {method === "cod" && <div className="w-2 h-2 rounded-full" style={{ background: '#2C2825' }} />}
                  </div>
                  <div className="flex items-center justify-center" style={{ color: '#9A9188' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#2C2825' }}>Cash on Delivery</span>
                </button>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleOrder}
              className="w-full py-4 rounded-sm font-medium tracking-widest uppercase cursor-pointer border-none transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: '#2C2825', color: '#EDE8E0', fontSize: '0.68rem', letterSpacing: '0.22em', fontFamily: "'Jost', sans-serif" }}
              onMouseEnter={e => e.currentTarget.style.background = '#8B6F5E'}
              onMouseLeave={e => e.currentTarget.style.background = '#2C2825'}
            >
              Place Order
            </button>

            {/* Secure note */}
            <div className="flex items-center justify-center gap-1.5" style={{ color: '#9A9188', fontSize: '0.6rem', letterSpacing: '0.14em' }}>
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                <rect x="0.6" y="4.6" width="8.8" height="6.8" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
                <path d="M2.5 4.5V3A2.5 2.5 0 0 1 7.5 3v1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
              <span className="uppercase tracking-widest">Secured &amp; encrypted checkout</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;