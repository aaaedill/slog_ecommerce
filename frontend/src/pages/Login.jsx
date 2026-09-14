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
  border: "1px solid rgba(47,93,255,0.25)",
  borderRadius: "16px",
  color: "#16307A",
  fontFamily: "Outfit, sans-serif",
  boxShadow:
    "0 8px 32px rgba(47,93,255,0.16), 0 1px 0 rgba(255,255,255,0.8) inset"
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { loginUser, addToCart } = useContext(ShopContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      toast.error("Please fill all fields", {
        style: glassToastStyle
      });

      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${API_URL}/auth/login`,
        {
          email: cleanEmail,
          password: cleanPassword
        },
        {
          withCredentials: true
        }
      );

      if (!res.data?.success || !res.data?.user) {
        toast.error(
          res.data?.message || "Invalid email or password",
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
        id: String(dbUser.id || dbUser._id)
      };

      // MAIN LOGIN
      const loginSuccess = loginUser(userData);

      if (!loginSuccess) {
        toast.error("Login failed", {
          style: glassToastStyle
        });

        return;
      }

      // ADMIN REDIRECT
      if (userData.role === "admin") {
        localStorage.removeItem("pendingCart");

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
      const pendingCart = localStorage.getItem("pendingCart");

      if (pendingCart) {
        let parsedPendingCart = null;

        try {
          parsedPendingCart = JSON.parse(pendingCart);
        } catch (err) {
          console.log(
            "Pending cart parse error:",
            err
          );

          localStorage.removeItem("pendingCart");
        }

        if (
          parsedPendingCart &&
          parsedPendingCart.productId !== undefined &&
          parsedPendingCart.productId !== null &&
          parsedPendingCart.size !== undefined &&
          parsedPendingCart.size !== null &&
          String(parsedPendingCart.size).trim() !== ""
        ) {
          try {
            const cartResult = await addToCart(
              parsedPendingCart.productId,
              parsedPendingCart.size,
              userData
            );

            if (cartResult?.success) {
              localStorage.removeItem("pendingCart");

              toast.success(
                "Added to cart",
                {
                  style: glassToastStyle
                }
              );
            } else {
              toast.error(
                cartResult?.message ||
                  "Failed to add product to cart",
                {
                  style: glassToastStyle
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
                style: glassToastStyle
              }
            );
          }
        } else {
          localStorage.removeItem("pendingCart");
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
        const { from } = location.state;

        navigate(from || "/");
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
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&display=swap');

        .login-root {
          --hn-blue:         #2F5DFF;
          --hn-blue-light:   #6E8BFF;
          --hn-blue-deep:    #16307A;
          --hn-ink:          #10131F;
          --hn-ink-muted:    rgba(16,19,31,0.55);
          --hn-ink-faint:    rgba(16,19,31,0.30);
          --hn-glass-bg:     rgba(255,255,255,0.60);
          --hn-glass-bg2:    rgba(255,255,255,0.85);
          --hn-glass-border: rgba(47,93,255,0.16);
          --hn-glass-shine:  rgba(255,255,255,0.85);

          --col-dg-bg:        rgba(16,19,31,0.85);
          --col-dg-bg2:       rgba(16,19,31,0.95);
          --col-dg-border:    rgba(110,139,255,0.22);
          --col-dg-shine:     rgba(110,139,255,0.14);
          --col-dg-ink:       #C7D3FF;
          --col-dg-ink-muted: rgba(199,211,255,0.72);
          --col-dg-ink-faint: rgba(199,211,255,0.38);

          font-family: 'Outfit', sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;

          background:
            radial-gradient(
              ellipse 70% 60% at 65% 0%,
              rgba(47,93,255,0.06) 0%,
              transparent 70%
            ),
            radial-gradient(
              ellipse 50% 80% at 15% 80%,
              rgba(110,139,255,0.05) 0%,
              transparent 60%
            ),
            #FFFFFF;
        }

        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: var(--hn-glass-bg);
          border: 1px solid var(--hn-glass-border);
          border-radius: 1.1rem;
          overflow: hidden;
          backdrop-filter: blur(24px) saturate(1.8);
          -webkit-backdrop-filter: blur(24px) saturate(1.8);
          box-shadow: 0 1px 0 var(--hn-glass-shine) inset;
          animation: loginUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes loginUp {
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

        .login-topbar {
          background: rgba(47,93,255,0.05);
          border-bottom: 1px solid var(--hn-glass-border);
          padding: 1rem 1.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .login-topbar-title {
          font-weight: 600;
          font-size: 1.2rem;
          color: var(--hn-ink);
          letter-spacing: -0.01em;
        }

        .login-topbar-title em {
          font-style: normal;
          font-weight: 600;
          color: var(--hn-blue);
        }

        .login-topbar-brand {
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--hn-ink-muted);
        }

        .login-body {
          padding: 2rem 1.75rem 2.25rem;
        }

        .login-welcome {
          font-size: 0.9rem;
          font-weight: 400;
          color: var(--hn-ink-muted);
          letter-spacing: 0.01em;
          padding-bottom: 1.5rem;
          margin-bottom: 1.75rem;
          border-bottom: 1px solid var(--hn-glass-border);
        }

        .field-label {
          display: block;
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--hn-ink-muted);
          margin-bottom: 0.5rem;
        }

        .login-input {
          width: 100%;
          background: rgba(47,93,255,0.05);
          border: 1.5px solid var(--hn-glass-border);
          border-radius: 0.7rem;
          padding: 0.78rem 1rem;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          font-weight: 400;
          color: var(--hn-ink);
          outline: none;
          transition:
            border-color 0.2s,
            background 0.2s,
            box-shadow 0.2s;
          box-sizing: border-box;
        }

        .login-input::placeholder {
          color: var(--hn-ink-faint);
        }

        .login-input:focus {
          border-color: var(--hn-blue);
          background: rgba(47,93,255,0.06);
          box-shadow:
            0 0 0 3px rgba(47,93,255,0.14);
        }

        .login-btn {
          width: 100%;
          background: var(--col-dg-bg);
          border: 1px solid var(--col-dg-border);
          border-radius: 0.7rem;
          padding: 1rem;
          font-family: 'Outfit', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: var(--col-dg-ink);
          cursor: pointer;
          backdrop-filter: blur(32px) saturate(1.8);
          -webkit-backdrop-filter: blur(32px) saturate(1.8);
          box-shadow:
            0 1px 0 var(--col-dg-shine) inset;
          transition:
            background 0.25s,
            color 0.22s,
            transform 0.2s;
        }

        .login-btn:hover {
          background: var(--col-dg-bg2);
          color: #FFFFFF;
          transform: translateY(-1px);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .login-divider {
          height: 1px;
          background: var(--hn-glass-border);
          margin: 1.75rem 0;
        }

        .login-link {
          color: var(--hn-blue);
          font-weight: 500;
          text-decoration: none;
          border-bottom: 1px solid rgba(47,93,255,0.3);
          padding-bottom: 1px;
          transition:
            color 0.2s,
            border-color 0.2s;
        }

        .login-link:hover {
          color: var(--hn-blue-deep);
          border-color: var(--hn-blue);
        }

        /* ── DARK MODE ── */

        html.dark-mode .login-root {
          background-color: #000000 !important;

          background-image:
            radial-gradient(
              ellipse 70% 60% at 65% 0%,
              rgba(96,130,255,0.10) 0%,
              transparent 70%
            ),
            radial-gradient(
              ellipse 50% 80% at 15% 80%,
              rgba(110,139,255,0.08) 0%,
              transparent 60%
            ) !important;

          --hn-ink:          var(--text-primary);
          --hn-ink-muted:    var(--text-secondary);
          --hn-ink-faint:    var(--text-secondary);
          --hn-glass-bg:     rgba(30,41,59,0.65);
          --hn-glass-bg2:    rgba(30,41,59,0.90);
          --hn-glass-border: rgba(96,130,255,0.22);
          --hn-glass-shine:  rgba(255,255,255,0.05);
        }

        html.dark-mode .login-topbar {
          background: rgba(96,130,255,0.07) !important;
        }

        html.dark-mode .login-input {
          background: rgba(30,41,59,0.55) !important;
        }

        html.dark-mode .login-input:focus {
          background: rgba(96,130,255,0.10) !important;
        }
      `}</style>

      <div className="login-root">

        <div className="login-card">

          {/* TOP BAR */}

          <div className="login-topbar">

            <span className="login-topbar-title">
              Sign <em>In</em>
            </span>

            <span className="login-topbar-brand">
              Slog Fashion
            </span>

          </div>

          {/* FORM */}

          <form
            onSubmit={handleLogin}
            className="login-body"
          >

            <p className="login-welcome">
              Welcome back — enter your details to continue.
            </p>

            <div
              style={{
                marginBottom: "1.25rem"
              }}
            >

              <label className="field-label">
                Email Address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                className="login-input"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
                required
              />

            </div>

            <div
              style={{
                marginBottom: "2rem"
              }}
            >

              <label className="field-label">
                Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                className="login-input"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
                required
              />

            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >

              {loading
                ? "Signing In..."
                : "Sign In"}

            </button>

            <div className="login-divider" />

            <p
              style={{
                textAlign: "center",
                fontSize: "0.85rem",
                fontWeight: 400,
                color: "var(--hn-ink-muted)"
              }}
            >

              Don't have an account?{" "}

              <Link
                to="/register"
                className="login-link"
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