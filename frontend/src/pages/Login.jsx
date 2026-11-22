import { useState, useContext } from "react";
import axios from "axios";
import API_URL from "../config/api";
import { toast } from "react-toastify";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";



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



const Login = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const { loginUser, addToCart } = useContext(ShopContext);

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);



  const handleLogin = async (e) => {

    e.preventDefault();

    if (loading) return;



    const cleanEmailOrPhone = emailOrPhone.trim();
    const cleanPassword = password.trim();



    if (!cleanEmailOrPhone || !cleanPassword) {

      toast.error(
        "Email or phone number and password are required.",
        {
          style: glassToastStyle
        }
      );

      return;
    }



    try {

      setLoading(true);



      const res = await axios.post(
        `${API_URL}/auth/login`,
        {
          emailOrPhone: cleanEmailOrPhone,
          password: cleanPassword
        },
        {
          withCredentials: true
        }
      );



      if (!res.data?.success || !res.data?.user) {

        toast.error(
          res.data?.message ||
            "Invalid email or password",
          {
            style: glassToastStyle
          }
        );

        return;
      }



      const dbUser = res.data.user;



      if (dbUser.isBlocked) {

        toast.error(
          "Your account has been blocked by admin",
          {
            style: glassToastStyle
          }
        );

        return;
      }



      const userData = {
        ...dbUser,
        id: String(
          dbUser.id ||
          dbUser._id
        )
      };



      // MAIN LOGIN

      const loginSuccess = loginUser(userData);



      if (!loginSuccess) {

        toast.error(
          "Login failed",
          {
            style: glassToastStyle
          }
        );

        return;
      }



      // ADMIN REDIRECT

      if (userData.role === "admin") {

        localStorage.removeItem(
          "pendingCart"
        );



        toast.success(
          "Welcome to SLOG-FASHION",
          {
            style: glassToastStyle
          }
        );



        navigate("/admin");

        return;
      }



      // HANDLE PENDING CART

      const pendingCart =
        localStorage.getItem(
          "pendingCart"
        );



      if (pendingCart) {

        let parsedPendingCart = null;



        try {

          parsedPendingCart =
            JSON.parse(
              pendingCart
            );

        } catch (err) {

          console.log(
            "Pending cart parse error:",
            err
          );

          localStorage.removeItem(
            "pendingCart"
          );
        }



        if (
          parsedPendingCart &&
          parsedPendingCart.productId !==
            undefined &&
          parsedPendingCart.productId !==
            null &&
          parsedPendingCart.size !==
            undefined &&
          parsedPendingCart.size !==
            null &&
          String(
            parsedPendingCart.size
          ).trim() !== ""
        ) {

          try {

            const cartResult =
              await addToCart(
                parsedPendingCart.productId,
                parsedPendingCart.size,
                userData
              );



            if (cartResult?.success) {

              localStorage.removeItem(
                "pendingCart"
              );



              toast.success(
                "Added to cart",
                {
                  style:
                    glassToastStyle
                }
              );

            } else {

              toast.error(
                cartResult?.message ||
                  "Failed to add product to cart",
                {
                  style:
                    glassToastStyle
                }
              );
            }

          } catch (err) {

            console.log(
              "Pending cart error:",
              err
            );



            toast.error(
              "Failed to add product to cart",
              {
                style:
                  glassToastStyle
              }
            );
          }

        } else {

          localStorage.removeItem(
            "pendingCart"
          );
        }
      }



      toast.success(
        "Welcome to SLOG-FASHION",
        {
          style: glassToastStyle
        }
      );



      // NORMAL REDIRECT

      if (location.state) {

        const { from } =
          location.state;



        navigate(
          from || "/"
        );

      } else {

        navigate("/");
      }

    } catch (err) {

      console.log(
        "Login error:",
        err
      );



      const message =
        err.response?.data?.message ||
        "Login failed";



      toast.error(
        message,
        {
          style: glassToastStyle
        }
      );

    } finally {

      setLoading(false);
    }
  };



  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap');

        /* ────────────────────────────────────────────────
           LOGIN PAGE
           Continuous customer-facing page background.
           No outer card or secondary page container.
        ──────────────────────────────────────────────── */

        .lgn-page {
          --lgn-bg:           var(--bg-primary);
          --lgn-olive:        #6B8E23;
          --lgn-olive-light:  #A9C46C;
          --lgn-olive-deep:   #4B5320;
          --lgn-olive-faint:  rgba(107,142,35,0.08);
          --lgn-ink:          #10131F;
          --lgn-ink-muted:    rgba(16,19,31,0.55);
          --lgn-ink-faint:    rgba(16,19,31,0.30);
          --lgn-glass-bg:     rgba(255,255,255,0.55);
          --lgn-glass-bg2:    rgba(255,255,255,0.85);
          --lgn-glass-border: rgba(107,142,35,0.16);
          --lgn-glass-shine:  rgba(255,255,255,0.85);

          font-family: 'Jost', sans-serif;
          color: var(--lgn-ink);

          width: 100%;
          min-height: 100vh;

          display: flex;
          align-items: center;
          justify-content: center;

          /* Continuous main page background */
          background: var(--lgn-bg);

          padding: 5rem 3rem 6rem;

          position: relative;
          overflow: hidden;

          box-sizing: border-box;
        }

        .lgn-page *,
        .lgn-page *::before,
        .lgn-page *::after {
          box-sizing: border-box;
        }



        /* ────────────────────────────────────────────────
           CONTENT WRAPPER
           No card — just a max-width column of freely
           floating elements.
        ──────────────────────────────────────────────── */

        .lgn-wrap {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 420px;
        }



        /* ────────────────────────────────────────────────
           HEADER
        ──────────────────────────────────────────────── */

        .lgn-header {
          margin-bottom: 2rem;
        }

        .lgn-title {
          font-weight: 600;
          font-size: clamp(2rem, 3.6vw, 3rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: var(--lgn-ink);
        }

        .lgn-title em {
          font-style: normal;
          font-weight: 600;
          color: var(--lgn-olive);
        }

        .lgn-sub {
          font-size: 0.85rem;
          font-weight: 400;
          color: var(--lgn-ink-muted);
          letter-spacing: 0.01em;
          margin-top: 0.75rem;
        }



        /* ────────────────────────────────────────────────
           FORM — fields sit directly on the page, styled
           like the filter-row glass pills on Collection
        ──────────────────────────────────────────────── */

        .lgn-form {
          padding-top: 1.8rem;
          border-top: 1px solid var(--lgn-glass-border);
        }

        .lgn-field {
          margin-bottom: 1.4rem;
        }

        .lgn-label {
          display: block;
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--lgn-ink-muted);
          margin-bottom: 0.55rem;
        }

        .lgn-input {
          width: 100%;
          font-family: 'Jost', sans-serif;
          font-size: 0.9rem;
          font-weight: 400;
          color: var(--lgn-ink);

          background: var(--lgn-glass-bg);
          border: 1px solid var(--lgn-glass-border);
          border-radius: 100px;

          padding: 0.78rem 1.2rem;
          outline: none;

          backdrop-filter: blur(20px) saturate(1.8);
          -webkit-backdrop-filter: blur(20px) saturate(1.8);

          box-shadow: 0 1px 0 var(--lgn-glass-shine) inset;

          transition:
            background 0.22s ease,
            border-color 0.22s ease,
            box-shadow 0.22s ease,
            transform 0.22s ease;
        }

        .lgn-input::placeholder {
          color: var(--lgn-ink-faint);
        }

        .lgn-input:hover {
          background: var(--lgn-glass-bg2);
        }

        .lgn-input:focus {
          background: var(--lgn-glass-bg2);
          border-color: var(--lgn-olive);
          transform: translateY(-1px);
          box-shadow:
            0 8px 20px rgba(107,142,35,0.14),
            0 1px 0 var(--lgn-glass-shine) inset;
        }



        /* ────────────────────────────────────────────────
           SUBMIT BUTTON — solid olive pill, same weight
           as the active category chip
        ──────────────────────────────────────────────── */

        .lgn-btn {
          width: 100%;
          font-family: 'Jost', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #FFFFFF;

          background: var(--lgn-olive);
          border: 1px solid var(--lgn-olive);
          border-radius: 100px;

          padding: 0.85rem 1.5rem;
          margin-top: 0.6rem;

          cursor: pointer;

          box-shadow:
            0 8px 20px rgba(107,142,35,0.28),
            0 1px 0 var(--lgn-glass-shine) inset;

          transition:
            background 0.22s ease,
            transform 0.22s ease,
            box-shadow 0.22s ease,
            opacity 0.22s ease;
        }

        .lgn-btn:hover:not(:disabled) {
          background: var(--lgn-olive-deep);
          border-color: var(--lgn-olive-deep);
          transform: translateY(-1px);
        }

        .lgn-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }



        /* ────────────────────────────────────────────────
           DIVIDER + FOOTER LINK
        ──────────────────────────────────────────────── */

        .lgn-divider {
          height: 1px;
          background: var(--lgn-glass-border);
          margin: 1.8rem 0;
        }

        .lgn-footer {
          text-align: center;
          font-size: 0.85rem;
          font-weight: 400;
          color: var(--lgn-ink-muted);
        }

        .lgn-link {
          color: var(--lgn-olive);
          font-weight: 500;
          text-decoration: none;
          border-bottom: 1px solid rgba(107,142,35,0.3);
          padding-bottom: 1px;
          transition:
            color 0.2s,
            border-color 0.2s;
        }

        .lgn-link:hover {
          color: var(--lgn-olive-deep);
          border-color: var(--lgn-olive-deep);
        }



        /* ────────────────────────────────────────────────
           ENTRANCE ANIMATION — same blur-in keyframe used
           on Collection's header / filter-row / cards
        ──────────────────────────────────────────────── */

        @keyframes lgn-blur-in {

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

        .lgn-header,
        .lgn-form {
          animation:
            lgn-blur-in
            0.6s
            cubic-bezier(0.16, 1, 0.3, 1)
            both;
        }

        .lgn-form {
          animation-delay: 0.08s;
        }

        @media (prefers-reduced-motion: reduce) {

          .lgn-header,
          .lgn-form {
            animation: none !important;
            opacity: 1 !important;
            filter: none !important;
            transform: none !important;
          }

        }



        /* ────────────────────────────────────────────────
           DARK MODE
           Customer dark mode uses one continuous black
           page canvas.
        ──────────────────────────────────────────────── */

        html.dark-mode .lgn-page {

          background: #000000 !important;
          background-image: none !important;

          --lgn-olive-deep:   #A9C46C;
          --lgn-ink:          var(--text-primary);
          --lgn-ink-muted:    var(--text-secondary);
          --lgn-ink-faint:    var(--text-secondary);
          --lgn-glass-bg:     rgba(30,41,59,0.55);
          --lgn-glass-bg2:    rgba(30,41,59,0.85);
          --lgn-glass-border: rgba(169,196,108,0.20);
          --lgn-glass-shine:  rgba(255,255,255,0.05);
        }



        /* ────────────────────────────────────────────────
           RESPONSIVE
        ──────────────────────────────────────────────── */

        @media (max-width: 768px) {

          .lgn-page {
            padding: 3rem 1.5rem 4rem;
          }

        }

        @media (max-width: 480px) {

          .lgn-page {
            padding: 2.5rem 0.9rem 3.5rem;
          }

          .lgn-title {
            font-size: 1.7rem;
          }

        }

      `}</style>



      <div className="lgn-page">

        <div className="lgn-wrap">

          {/* ==================================================
              HEADER
              ================================================== */}

          <div className="lgn-header">

            <h2 className="lgn-title">
              Sign <em>In</em>
            </h2>

            <p className="lgn-sub">
              Welcome back — enter your details to continue.
            </p>

          </div>



          {/* ==================================================
              FORM — no card, fields directly on the page
              ================================================== */}

          <form
            onSubmit={handleLogin}
            className="lgn-form"
          >

            <div className="lgn-field">

              <label className="lgn-label">
                Email or Phone Number
              </label>

              <input
                type="text"
                placeholder="you@example.com or 9876543210"
                className="lgn-input"
                value={emailOrPhone}
                onChange={(e) =>
                  setEmailOrPhone(
                    e.target.value
                  )
                }
                autoComplete="username"
                required
              />

            </div>



            <div className="lgn-field">

              <label className="lgn-label">
                Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                className="lgn-input"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                autoComplete="current-password"
                required
              />

            </div>



            <button
              type="submit"
              className="lgn-btn"
              disabled={loading}
            >

              {loading
                ? "Signing In..."
                : "Sign In"}

            </button>



            <div className="lgn-divider" />



            <p className="lgn-footer">

              Don't have an account?{" "}

              <Link
                to="/register"
                className="lgn-link"
              >
                Create Account
              </Link>

            </p>

          </form>

        </div>

      </div>
    </>
  );
};



export default Login;