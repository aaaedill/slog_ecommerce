
import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Title } from "../components/Title";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


const getOptimizedImageUrl = (imageUrl) => {

  if (!imageUrl || typeof imageUrl !== "string") {
    return imageUrl;
  }

  const transformationMarker = "/image/upload/";

  if (
    !imageUrl.includes("res.cloudinary.com/") ||
    !imageUrl.includes(transformationMarker)
  ) {
    return imageUrl;
  }

  const [beforeUpload, afterUpload] =
    imageUrl.split(transformationMarker);

  if (!afterUpload) {
    return imageUrl;
  }

  return (
    beforeUpload +
    transformationMarker +
    "f_auto,q_auto,w_400,c_limit/" +
    afterUpload
  );

};


const Cart = () => {

  const navigate = useNavigate();

  const {
    products,
    cartItems,
    removeFromCart,
    getCartTotal,
    user
  } = useContext(ShopContext);

  const cartKeys = Object.keys(cartItems);

  const totalItems =
    Object.values(cartItems).reduce(
      (a, b) => a + b,
      0
    );

  const totalAmount =
    getCartTotal();



  if (
    products.length === 0
  ) {

    return (
      <div
        className="min-h-screen"
        style={{
          background:
            "var(--bg-primary)",
          padding:
            "3rem 2rem"
        }}
      >
        <p
          style={{
            fontFamily:
              "'Jost', sans-serif",
            color:
              "var(--text-secondary)",
            fontSize:
              "0.85rem",
            letterSpacing:
              "0.1em"
          }}
        >
          Loading…
        </p>
      </div>
    );

  }



  const handleCheckout = () => {

    if (!user) {

      toast.error(
        "Please login to continue"
      );

      navigate(
        "/login",
        {
          state: {
            from:
              "/place-order"
          }
        }
      );

      return;
    }



    if (
      cartKeys.length === 0
    ) {

      toast.error(
        "Your cart is empty"
      );

      return;
    }



    navigate(
      "/place-order"
    );

  };



  return (
    <>
      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap');



        .cart-root {
          --hn-blue:         #6B8E23;
          --hn-blue-light:   #A9C46C;
          --hn-blue-deep:    #4B5320;

          /* Text colours follow the site theme, same as the Product page */
          --hn-ink:          var(--text-primary);
          --hn-ink-muted:    var(--text-secondary);
          --hn-ink-faint:    var(--text-secondary);

          --hn-glass-bg:     transparent;
          --hn-glass-bg2:    rgba(255,255,255,0.85);
          --hn-glass-border: rgba(107,142,35,0.18);
          --hn-glass-shine:  rgba(255,255,255,0.85);

          --col-dg-bg:        transparent;
          --col-dg-bg2:       transparent;
          --col-dg-border:    rgba(107,142,35,0.18);
          --col-dg-shine:     rgba(169,196,108,0.14);
          --col-dg-ink:       var(--text-primary);
          --col-dg-ink-muted: var(--text-secondary);
          --col-dg-ink-faint: var(--text-secondary);

          font-family:
            'Jost', sans-serif;

          color:
            var(--hn-ink);

          position:
            relative;

          width:
            100%;

          margin-top:
            1rem;

          background:
            var(--bg-primary);

          overflow:
            hidden;
        }



        .cart-inner {
          position:
            relative;

          z-index:
            2;
        }



        /* ── BACK BUTTON ── */

        .cart-back-btn {
          display:
            inline-flex;

          align-items:
            center;

          gap:
            0.5rem;

          padding:
            0.55rem 1.1rem;

          border-radius:
            100px;

          background:
            rgba(255,255,255,0.6);

          border:
            1px solid
            rgba(107,142,35,0.16);

          backdrop-filter:
            blur(20px)
            saturate(1.6);

          -webkit-backdrop-filter:
            blur(20px)
            saturate(1.6);

          box-shadow:
            0 2px 12px
            rgba(107,142,35,0.06);

          cursor:
            pointer;

          font-family:
            'Jost', sans-serif;

          font-size:
            0.78rem;

          font-weight:
            500;

          letter-spacing:
            0.04em;

          color:
            var(--hn-ink-muted);

          transition:
            background 0.2s ease,
            color 0.2s ease;
        }



        .cart-back-btn:hover {
          background:
            rgba(255,255,255,0.95);

          color:
            #4B5320;
        }



        /* ── TOP BAR ── */

        .cart-topbar {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          padding:
            1rem 2.5rem;

          border-bottom:
            1px solid
            var(--hn-glass-border);

          background:
            transparent;
        }



        .cart-topbar-title {
          font-weight:
            600;

          font-size:
            1.15rem;

          letter-spacing:
            -0.01em;

          color:
            var(--hn-ink);
        }



        .cart-topbar-title em {
          font-style:
            normal;

          font-weight:
            600;

          color:
            var(--hn-blue);
        }



        .cart-topbar-count {
          font-size:
            0.7rem;

          font-weight:
            400;

          letter-spacing:
            0.14em;

          text-transform:
            uppercase;

          color:
            var(--hn-ink-faint);
        }



        /* ── BODY ── */

        .cart-body {
          max-width:
            1024px;

          margin:
            0 auto;

          padding:
            2.5rem 1.5rem 5rem;
        }



        /* ── EMPTY STATE ── */

        .cart-empty {
          display:
            flex;

          flex-direction:
            column;

          align-items:
            center;

          justify-content:
            center;

          padding:
            8rem 0;

          gap:
            0.75rem;

          text-align:
            center;
        }



        .cart-empty-title {
          font-weight:
            500;

          font-size:
            1.6rem;

          color:
            var(--hn-ink-faint);
        }



        .cart-empty-sub {
          font-size:
            0.72rem;

          letter-spacing:
            0.1em;

          text-transform:
            uppercase;

          color:
            var(--hn-ink-faint);
        }



        /* ── ITEMS PANEL ── */

        .cart-panel {
          background:
            transparent;

          border:
            none;

          border-radius:
            0;

          overflow:
            hidden;

          backdrop-filter:
            none;

          -webkit-backdrop-filter:
            none;

          box-shadow:
            none;

          flex:
            1;
        }



        .cart-panel-header {
          padding:
            1rem 0;

          border-bottom:
            1px solid
            var(--hn-glass-border);

          background:
            transparent;
        }



        .cart-panel-header span {
          font-size:
            0.68rem;

          font-weight:
            500;

          letter-spacing:
            0.14em;

          text-transform:
            uppercase;

          color:
            var(--hn-ink-muted);
        }



        /* ── ITEM ROW ── */

        .cart-item-row {
          display:
            grid;

          grid-template-columns:
            80px 1fr auto;

          align-items:
            center;

          gap:
            1.5rem;

          padding:
            1.25rem 0;

          border-bottom:
            1px solid
            var(--hn-glass-border);

          transition:
            background 0.2s;

          animation:
            cartBlurIn
            0.55s
            cubic-bezier(0.16,1,0.3,1)
            both;
        }



        .cart-item-row:last-child {
          border-bottom:
            none;
        }



        .cart-item-row:hover {
          background:
            transparent;
        }



        .cart-item-row:nth-child(1) {
          animation-delay:
            0.04s;
        }



        .cart-item-row:nth-child(2) {
          animation-delay:
            0.09s;
        }



        .cart-item-row:nth-child(3) {
          animation-delay:
            0.14s;
        }



        .cart-item-row:nth-child(4) {
          animation-delay:
            0.19s;
        }



        .cart-item-row:nth-child(5) {
          animation-delay:
            0.24s;
        }



        @keyframes cartBlurIn {

          from {
            opacity:
              0;

            filter:
              blur(8px);

            transform:
              translateY(12px);
          }

          to {
            opacity:
              1;

            filter:
              blur(0);

            transform:
              translateY(0);
          }

        }



        @media (prefers-reduced-motion: reduce) {

          .cart-item-row {
            animation:
              none !important;

            opacity:
              1 !important;

            filter:
              none !important;

            transform:
              none !important;
          }

        }



        .cart-thumb-wrap {
          width:
            80px;

          height:
            100px;

          border-radius:
            0.6rem;

          overflow:
            hidden;

          background:
            transparent;

          border:
            none;

          flex-shrink:
            0;
        }



        .cart-thumb-img {
          width:
            100%;

          height:
            100%;

          object-fit:
            cover;

          display:
            block;

          transition:
            transform 0.55s ease;
        }



        .cart-thumb-wrap:hover
        .cart-thumb-img {
          transform:
            scale(1.07);
        }



        .cart-item-name {
          font-weight:
            500;

          font-size:
            1rem;

          line-height:
            1.3;

          color:
            var(--hn-ink);

          margin-bottom:
            0.3rem;
        }



        .cart-item-price {
          font-family:
            'Jost', sans-serif;

          font-weight:
            600;

          font-size:
            0.85rem;

          letter-spacing:
            0.01em;

          color:
            var(--hn-blue);

          margin-bottom:
            0.65rem;
        }



        .cart-item-tags {
          display:
            flex;

          flex-wrap:
            wrap;

          gap:
            0.4rem;
        }



        .cart-item-tag {
          font-size:
            0.65rem;

          font-weight:
            500;

          letter-spacing:
            0.06em;

          color:
            var(--hn-ink-muted);

          background:
            rgba(107,142,35,0.06);

          border:
            1px solid
            var(--hn-glass-border);

          padding:
            0.25rem 0.7rem;

          border-radius:
            100px;
        }



        .cart-rm-btn {
          background:
            transparent;

          border:
            none;

          cursor:
            pointer;

          padding:
            0.4rem;

          color:
            var(--hn-ink-faint);

          transition:
            color 0.2s;

          display:
            flex;

          align-items:
            center;
        }



        .cart-rm-btn:hover {
          color:
            var(--hn-blue);
        }



        /* ── SIDEBAR ── */

        .cart-sidebar {
          width:
            100%;

          flex-shrink:
            0;

          display:
            flex;

          flex-direction:
            column;

          gap:
            1rem;
        }



        @media (min-width: 1024px) {

          .cart-sidebar {
            width:
              17rem;
          }

        }



        /* Summary */

        .cart-summary {
          background:
            transparent;

          border:
            1px solid
            var(--col-dg-border);

          border-radius:
            1.1rem;

          overflow:
            hidden;

          backdrop-filter:
            none;

          -webkit-backdrop-filter:
            none;

          box-shadow:
            none;

          padding:
            1.75rem;
        }



        .cart-summary-label {
          font-size:
            0.68rem;

          font-weight:
            500;

          letter-spacing:
            0.14em;

          text-transform:
            uppercase;

          color:
            var(--col-dg-ink-faint);

          margin-bottom:
            1.4rem;

          display:
            block;
        }



        .cart-summary-row {
          display:
            flex;

          justify-content:
            space-between;

          align-items:
            baseline;

          margin-bottom:
            0.75rem;
        }



        .cart-summary-row-key {
          font-size:
            0.82rem;

          font-weight:
            400;

          color:
            var(--col-dg-ink-muted);
        }



        .cart-summary-row-val {
          font-size:
            0.86rem;

          font-weight:
            500;

          color:
            var(--col-dg-ink);
        }



        .cart-summary-row-val-faint {
          font-size:
            0.78rem;

          font-weight:
            400;

          color:
            var(--col-dg-ink-faint);
        }



        .cart-summary-divider {
          height:
            1px;

          background:
            var(--col-dg-border);

          margin:
            1rem 0;
        }



        .cart-summary-total-key {
          font-size:
            0.82rem;

          font-weight:
            400;

          letter-spacing:
            0.01em;

          color:
            var(--col-dg-ink-muted);
        }



        .cart-summary-total-val {
          font-weight:
            600;

          font-size:
            1.9rem;

          line-height:
            1;

          color:
            var(--col-dg-ink);
        }



        .cart-checkout-btn {
          width:
            100%;

          margin-top:
            1.25rem;

          padding:
            1rem;

          border-radius:
            100px;

          border:
            none;

          background:
            var(--hn-blue-light);

          color:
            #10131F;

          font-family:
            'Jost', sans-serif;

          font-size:
            0.78rem;

          font-weight:
            500;

          letter-spacing:
            0.08em;

          text-transform:
            uppercase;

          cursor:
            pointer;

          box-shadow:
            0 8px 24px
            rgba(169,196,108,0.22);

          transition:
            background 0.25s ease,
            transform 0.2s ease,
            box-shadow 0.25s ease;
        }



        .cart-checkout-btn:hover {
          background:
            #C4D699;

          transform:
            translateY(-2px);

          box-shadow:
            0 12px 32px
            rgba(169,196,108,0.28);
        }



        .cart-secure {
          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            0.4rem;

          margin-top:
            0.75rem;

          font-size:
            0.68rem;

          letter-spacing:
            0.04em;

          color:
            var(--col-dg-ink-faint);
        }



        /* Returns note */

        .cart-returns {
          background:
            transparent;

          border:
            1px solid
            var(--hn-glass-border);

          border-radius:
            1.1rem;

          padding:
            1rem 1.25rem;

          backdrop-filter:
            none;

          -webkit-backdrop-filter:
            none;

          box-shadow:
            none;
        }



        .cart-returns p {
          font-weight:
            400;

          font-size:
            0.85rem;

          line-height:
            1.7;

          color:
            var(--hn-ink-muted);
        }



        /* ── FLEX LAYOUT ── */

        .cart-content-row {
          display:
            flex;

          flex-direction:
            column;

          gap:
            1.5rem;

          align-items:
            flex-start;
        }



        @media (min-width: 1024px) {

          .cart-content-row {
            flex-direction:
              row;
          }

        }



        /* ── SMALL UPPERCASE LABELS (same olive as Product page category) ── */

        .cart-panel-header span,
        .cart-summary-label,
        .cart-topbar-count {
          color:
            #4B5320;
        }



        /* ── DARK MODE ── */

        html.dark-mode .cart-root {
          --hn-ink:
            #F8FAFC;

          --hn-ink-muted:
            rgba(248,250,252,0.65);

          --hn-ink-faint:
            rgba(248,250,252,0.38);

          --hn-glass-bg:
            transparent;

          --hn-glass-bg2:
            transparent;

          --hn-glass-border:
            rgba(169,196,108,0.22);

          --hn-glass-shine:
            transparent;

          --hn-blue:
            #A9C46C;

          --hn-blue-light:
            #A9C46C;

          --hn-blue-deep:
            #C4D699;

          --col-dg-bg:
            transparent;

          --col-dg-bg2:
            transparent;

          --col-dg-border:
            rgba(169,196,108,0.22);

          --col-dg-shine:
            transparent;

          --col-dg-ink:
            #E7EFD6;

          --col-dg-ink-muted:
            rgba(231,239,214,0.72);

          --col-dg-ink-faint:
            rgba(231,239,214,0.38);

          background:
            #000000 !important;

          color:
            #F8FAFC;
        }



        html.dark-mode .cart-panel-header span,
        html.dark-mode .cart-summary-label,
        html.dark-mode .cart-topbar-count {
          color:
            #A9C46C;
        }



        html.dark-mode .cart-back-btn {
          background:
            transparent !important;

          box-shadow:
            none !important;
        }



        html.dark-mode .cart-back-btn:hover {
          background:
            rgba(169,196,108,0.08) !important;

          color:
            #A9C46C !important;
        }



        html.dark-mode .cart-topbar {
          background:
            transparent !important;
        }



        html.dark-mode .cart-panel-header {
          background:
            transparent !important;
        }



        html.dark-mode .cart-item-tag {
          background:
            rgba(169,196,108,0.06);

          border-color:
            rgba(169,196,108,0.22);

          color:
            rgba(248,250,252,0.65);
        }



        html.dark-mode .cart-checkout-btn {
          color:
            #10131F !important;
        }



        html.dark-mode .cart-summary {
          background:
            transparent !important;

          box-shadow:
            none !important;
        }



        html.dark-mode .cart-returns {
          background:
            transparent !important;

          box-shadow:
            none !important;
        }



        html.dark-mode .cart-root {
          background:
            #000000 !important;

          background-image:
            none !important;
        }

      `}</style>



      <div className="cart-root">

        <div className="cart-inner">

          {/* Back Button */}

          <div
            style={{
              padding:
                "1.5rem 2.5rem 0"
            }}
          >

            <button
              className="cart-back-btn"
              onClick={() =>
                navigate(-1)
              }
            >

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />

              </svg>

              Back

            </button>

          </div>



          {/* Top Bar */}

          <div
            className="cart-topbar"
            style={{
              marginTop:
                "1rem"
            }}
          >

            <span
              className="cart-topbar-title"
            >
              Your <em>Cart</em>
            </span>



            {totalItems > 0 && (

              <span
                className="cart-topbar-count"
              >
                {totalItems}{" "}
                {
                  totalItems === 1
                    ? "item"
                    : "items"
                }
              </span>

            )}

          </div>



          {/* Body */}

          <div
            className="cart-body"
          >

            {cartKeys.length === 0 ? (

              <div
                className="cart-empty"
              >

                <p
                  className="cart-empty-title"
                >
                  Your cart is empty
                </p>

                <p
                  className="cart-empty-sub"
                >
                  Add items to begin
                </p>

              </div>

            ) : (

              <div
                className="cart-content-row"
              >

                {/* Items */}

                <div
                  className="cart-panel"
                >

                  <div
                    className="cart-panel-header"
                  >

                    <span>
                      Selected Items
                    </span>

                  </div>



                  {cartKeys.map(
                    key => {

                      const id =
                        key.split("_")[0];

                      const size =
                        key.split("_")[1];

                      const product =
                        products.find(
                          item =>
                            String(
                              item.id
                            ) ===
                            String(
                              id
                            )
                        );



                      if (!product) {
                        return null;
                      }



                      return (

                        <div
                          key={key}
                          className="cart-item-row"
                        >

                          <div
                            className="cart-thumb-wrap"
                          >

                            <img
                              src={
                                getOptimizedImageUrl(
                                  product.image
                                )
                              }
                              alt={
                                product.name
                              }
                              className="cart-thumb-img"
                              loading="lazy"
                              decoding="async"
                            />

                          </div>



                          <div>

                            <p
                              className="cart-item-name"
                            >
                              {
                                product.name
                              }
                            </p>



                            <p
                              className="cart-item-price"
                            >
                              ₹
                              {
                                product.price
                              }
                            </p>



                            <div
                              className="cart-item-tags"
                            >

                              <span
                                className="cart-item-tag"
                              >
                                Size ·{" "}
                                {size}
                              </span>



                              <span
                                className="cart-item-tag"
                              >
                                Qty ·{" "}
                                {
                                  cartItems[
                                    key
                                  ]
                                }
                              </span>

                            </div>

                          </div>



                          <button
                            className="cart-rm-btn"
                            onClick={() =>
                              removeFromCart(
                                key
                              )
                            }
                          >

                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 13 13"
                              fill="none"
                            >

                              <line
                                x1="1"
                                y1="1"
                                x2="12"
                                y2="12"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />

                              <line
                                x1="12"
                                y1="1"
                                x2="1"
                                y2="12"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />

                            </svg>

                          </button>

                        </div>

                      );

                    }
                  )}

                </div>



                {/* Sidebar */}

                <div
                  className="cart-sidebar"
                >

                  {/* Summary */}

                  <div
                    className="cart-summary"
                  >

                    <span
                      className="cart-summary-label"
                    >
                      Order Summary
                    </span>



                    <div
                      className="cart-summary-row"
                    >

                      <span
                        className="cart-summary-row-key"
                      >
                        Subtotal
                      </span>



                      <span
                        className="cart-summary-row-val"
                      >
                        ₹
                        {
                          totalAmount
                        }
                      </span>

                    </div>



                    <div
                      className="cart-summary-row"
                    >

                      <span
                        className="cart-summary-row-key"
                      >
                        Shipping
                      </span>



                      <span
                        className="cart-summary-row-val-faint"
                      >
                        At checkout
                      </span>

                    </div>



                    <div
                      className="cart-summary-divider"
                    />



                    <div
                      className="cart-summary-row"
                      style={{
                        alignItems:
                          "flex-end"
                      }}
                    >

                      <span
                        className="cart-summary-total-key"
                      >
                        Total
                      </span>



                      <span
                        className="cart-summary-total-val"
                      >
                        ₹
                        {
                          totalAmount
                        }
                      </span>

                    </div>



                    <button
                      className="cart-checkout-btn"
                      onClick={
                        handleCheckout
                      }
                    >
                      Proceed to Checkout
                    </button>



                    <div
                      className="cart-secure"
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

                      Secure checkout

                    </div>

                  </div>



                  {/* Returns */}

                  <div
                    className="cart-returns"
                  >

                    <p>
                      Free returns within
                      7 days. Carefully
                      packaged, always.
                    </p>

                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>

    </>
  );

};



export default Cart;