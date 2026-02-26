import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Title } from "../components/Title";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Cart = () => {

  const navigate = useNavigate();
  const { products, cartItems, removeFromCart, getCartTotal } = useContext(ShopContext);
  const cartKeys = Object.keys(cartItems);

  if (products.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: '#EDE8E0', padding: '3rem 2rem' }}>
        <p style={{ fontFamily: "'Jost', sans-serif", color: '#9A9188', fontSize: '0.85rem', letterSpacing: '0.15em' }}>Loading…</p>
      </div>
    );
  }

  const handleCheckout = () => {
    const user = localStorage.getItem("user");
    if (!user) {
      toast.error("Please login to continue");
      navigate("/login", { state: { from: "/place-order" } });
      return;
    }
    if (cartKeys.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    navigate("/place-order");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif; }
        .font-jost { font-family: 'Jost', sans-serif; }
        .cart-item-row { animation: cartUp 0.45s ease both; }
        .cart-item-row:nth-child(1) { animation-delay: 0.04s; }
        .cart-item-row:nth-child(2) { animation-delay: 0.09s; }
        .cart-item-row:nth-child(3) { animation-delay: 0.14s; }
        .cart-item-row:nth-child(4) { animation-delay: 0.19s; }
        .cart-item-row:nth-child(5) { animation-delay: 0.24s; }
        @keyframes cartUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .thumb-img { transition: transform 0.55s ease; }
        .thumb-wrap:hover .thumb-img { transform: scale(1.07); }
        .rm-btn { color: #D4CCC0; transition: color 0.2s ease; }
        .rm-btn:hover { color: #8B6F5E; }
        .checkout-btn { transition: background 0.25s ease, transform 0.2s ease; }
        .checkout-btn:hover { background: #8B6F5E !important; transform: translateY(-1px); }
      `}</style>

      {/* Root */}
      <div className="font-jost min-h-screen rounded-3xl overflow-hidden mt-5" style={{ background: '#EDE8E0', color: '#2C2825' }}>

        {/* Back Button Container */}
        <div className="px-10 pt-6">
          <button
            onClick={() => navigate(-1)}
            className="
              flex items-center
              px-4 py-2
              rounded-full
              bg-white/30
              backdrop-blur-md
              border border-white/40
              shadow-sm
              hover:bg-orange-200
              transition
              mb-5
              cursor-pointer
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">
              Back
            </span>
          </button>
        </div>

        {/* Top Bar */}
        <div
          className="flex items-center justify-between px-10 py-4 border-b"
          style={{ background: '#E4DDD3', borderColor: '#D4CCC0' }}
        >
          <span className="font-fraunces font-light tracking-wide" style={{ fontSize: '1.05rem', color: '#2C2825' }}>
            Your <i className="italic" style={{ color: '#8B6F5E' }}>Cart</i>
          </span>
          {cartKeys.length > 0 && (
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: '#9A9188' }}>
              {cartKeys.length} {cartKeys.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="max-w-5xl mx-auto px-6 py-10 pb-20">
          {cartKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
              <p className="font-fraunces font-light italic text-3xl" style={{ color: '#D4CCC0' }}>Your cart is empty</p>
              <p className="text-xs tracking-widest uppercase" style={{ color: '#9A9188' }}>Add items to begin</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 items-start">

              {/* Items Panel */}
              <div className="flex-1 border rounded-sm overflow-hidden" style={{ background: '#E4DDD3', borderColor: '#D4CCC0' }}>

                {/* Panel header */}
                <div className="px-7 py-4 border-b" style={{ borderColor: '#D4CCC0' }}>
                  <span className="text-xs font-medium tracking-widest uppercase" style={{ color: '#9A9188', fontSize: '0.6rem' }}>
                    Selected Items
                  </span>
                </div>

                {/* Rows */}
                {cartKeys.map(key => {
                  const id = key.split("_")[0];
                  const size = key.split("_")[1];
                  const product = products.find(item => String(item.id) === String(id));
                  if (!product) return null;

                  return (
                    <div
                      key={key}
                      className="cart-item-row grid items-center gap-6 px-7 py-5 border-b last:border-b-0 transition-colors duration-200 hover:bg-black/[0.025]"
                      style={{ gridTemplateColumns: '80px 1fr auto', borderColor: '#D4CCC0' }}
                    >
                      <div className="thumb-wrap overflow-hidden rounded-sm flex-shrink-0" style={{ width: 80, height: 100, background: '#DAD3C8' }}>
                        <img src={product.image} alt={product.name} className="thumb-img w-full h-full object-cover block" />
                      </div>
                      <div>
                        <p className="font-fraunces font-light mb-1 leading-snug" style={{ fontSize: '1rem', color: '#2C2825' }}>
                          {product.name}
                        </p>
                        <p className="text-sm font-medium tracking-wide mb-2.5" style={{ color: '#8B6F5E' }}>
                          ₹{product.price}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs font-medium tracking-widest uppercase border rounded-sm px-2.5 py-1"
                            style={{ fontSize: '0.58rem', color: '#9A9188', background: '#DAD3C8', borderColor: '#D4CCC0' }}>
                            Size · {size}
                          </span>
                          <span className="text-xs font-medium tracking-widest uppercase border rounded-sm px-2.5 py-1"
                            style={{ fontSize: '0.58rem', color: '#9A9188', background: '#DAD3C8', borderColor: '#D4CCC0' }}>
                            Qty · {cartItems[key]}
                          </span>
                        </div>
                      </div>
                      <button className="rm-btn bg-transparent border-none cursor-pointer p-1.5"
                        onClick={() => removeFromCart(key)}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                          <line x1="1" y1="1" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="12" y1="1" x2="1" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Sidebar */}
              <div className="w-full lg:w-72 flex flex-col gap-4 flex-shrink-0">

                {/* Summary box */}
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
                    <span className="italic font-light" style={{ fontSize: '0.72rem', color: '#9A9188' }}>At checkout</span>
                  </div>
                  <div className="my-4" style={{ height: '1px', background: '#D4CCC0' }} />
                  <div className="flex justify-between items-end mb-0">
                    <span className="tracking-wide" style={{ fontSize: '0.72rem', color: '#2C2825' }}>Total</span>
                    <span className="font-fraunces font-light leading-none" style={{ fontSize: '1.9rem', color: '#2C2825' }}>
                      ₹{getCartTotal()}
                    </span>
                  </div>
                  <button
                    className="checkout-btn w-full mt-5 py-4 rounded-sm font-medium tracking-widest uppercase cursor-pointer border-none"
                    style={{ background: '#2C2825', color: '#EDE8E0', fontSize: '0.68rem', letterSpacing: '0.22em' }}
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </button>
                  <div className="flex items-center justify-center gap-1.5 mt-3" style={{ color: '#9A9188', fontSize: '0.6rem', letterSpacing: '0.14em' }}>
                    <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                      <rect x="0.6" y="4.6" width="8.8" height="6.8" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
                      <path d="M2.5 4.5V3A2.5 2.5 0 0 1 7.5 3v1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                    </svg>
                    <span className="uppercase tracking-widest">Secure checkout</span>
                  </div>
                </div>
                <div className="border rounded-sm px-5 py-4" style={{ background: '#E4DDD3', borderColor: '#D4CCC0' }}>
                  <p className="font-fraunces font-light italic leading-relaxed" style={{ fontSize: '0.85rem', color: '#9A9188' }}>
                    Free returns within 7 days. Carefully packaged, always.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;