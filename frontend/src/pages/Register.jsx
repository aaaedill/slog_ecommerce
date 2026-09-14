import { useState } from "react";

import axios from "axios";
import API_URL from "../config/api";

import { toast } from "react-toastify";

import { useNavigate, Link } from "react-router-dom";


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

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      toast.error("Please fill all fields", {
        style: glassToastStyle
      });

      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      toast.error("Please enter a valid email address", {
        style: glassToastStyle
      });

      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters and include lowercase letter and number",
        {
          style: glassToastStyle
        }
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/register`,
        {
          name: cleanName,
          email: cleanEmail,
          password
        },
        {
          withCredentials: true
        }
      );

      if (!response.data?.success) {
        toast.error(
          response.data?.message || "Error creating account",
          {
            style: glassToastStyle
          }
        );

        return;
      }

      toast.success("Account Created Successfully", {
        style: glassToastStyle
      });

      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);

      if (error.response?.status === 409) {
        toast.error("Email already taken", {
          style: glassToastStyle
        });
      } else {
        toast.error(
          error.response?.data?.message ||
            "Error creating account",
          {
            style: glassToastStyle
          }
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&display=swap');

        .register-root {
          --hn-blue: #2F5DFF;
          --hn-blue-deep: #16307A;
          --hn-ink: #10131F;
          --hn-ink-muted: #6B7280;
          --hn-ink-faint: #9CA3AF;
          --hn-glass-bg: rgba(255,255,255,0.65);
          --hn-glass-border: rgba(47,93,255,0.16);
          --hn-glass-shine: rgba(255,255,255,0.85);

          font-family: 'Outfit', sans-serif;

          min-height: 100vh;

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

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 2rem 1rem;
        }

        .register-card {
          width: 100%;
          max-width: 420px;

          background: var(--hn-glass-bg);

          border: 1px solid var(--hn-glass-border);

          border-radius: 1.1rem;

          overflow: hidden;

          backdrop-filter: blur(24px) saturate(1.8);
          -webkit-backdrop-filter: blur(24px) saturate(1.8);

          box-shadow:
            0 1px 0 var(--hn-glass-shine) inset,
            0 4px 24px rgba(47,93,255,0.06);

          animation:
            registerBlurIn
            0.6s
            cubic-bezier(0.16,1,0.3,1)
            both;
        }

        @keyframes registerBlurIn {
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

        .register-topbar {
          background: rgba(47,93,255,0.05);

          border-bottom:
            1px solid
            var(--hn-glass-border);

          padding: 1rem 2rem;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .register-body {
          padding: 2.5rem 2rem;
        }

        .register-input {
          width: 100%;

          background: rgba(47,93,255,0.05);

          border:
            1.5px solid
            var(--hn-glass-border);

          border-radius: 0.7rem;

          padding: 0.78rem 1rem;

          font-family: 'Outfit', sans-serif;

          font-size: 0.9rem;

          font-weight: 400;

          color: var(--hn-ink);

          outline: none;

          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;

          box-sizing: border-box;
        }

        .register-input::placeholder {
          color: var(--hn-ink-faint);
        }

        .register-input:focus {
          border-color: var(--hn-blue);

          background: rgba(47,93,255,0.06);

          box-shadow:
            0 0 0 3px
            rgba(47,93,255,0.14);
        }

        .register-btn {
          width: 100%;

          background: var(--hn-blue);

          color: #FFFFFF;

          border: none;

          border-radius: 100px;

          padding: 1rem;

          font-family: 'Outfit', sans-serif;

          font-size: 0.85rem;

          font-weight: 600;

          letter-spacing: 0.04em;

          cursor: pointer;

          box-shadow:
            0 8px 24px
            rgba(47,93,255,0.28);

          transition:
            background 0.3s ease,
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .register-btn:hover {
          background: var(--hn-blue-deep);

          transform: translateY(-2px);

          box-shadow:
            0 12px 32px
            rgba(47,93,255,0.34);
        }

        .register-btn:disabled {
          opacity: 0.7;

          cursor: not-allowed;

          transform: none;
        }

        .register-divider {
          height: 1px;

          background:
            var(--hn-glass-border);

          margin: 1.75rem 0;
        }

        .register-link {
          color: var(--hn-blue);

          font-weight: 500;

          text-decoration: none;

          border-bottom:
            1px solid
            rgba(47,93,255,0.3);

          padding-bottom: 1px;

          transition:
            color 0.2s ease,
            border-color 0.2s ease;
        }

        .register-link:hover {
          color: var(--hn-blue-deep);

          border-color: var(--hn-blue);
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

        /* ── DARK MODE ── */

        html.dark-mode .register-root {
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

          --hn-ink:
            var(--text-primary);

          --hn-ink-muted:
            var(--text-secondary);

          --hn-ink-faint:
            var(--text-secondary);

          --hn-glass-bg:
            rgba(30,41,59,0.65);

          --hn-glass-border:
            rgba(96,130,255,0.22);

          --hn-glass-shine:
            rgba(255,255,255,0.05);
        }

        html.dark-mode .register-topbar {
          background:
            rgba(96,130,255,0.07) !important;
        }

        html.dark-mode .register-input {
          background:
            rgba(30,41,59,0.55) !important;
        }

        html.dark-mode .register-input:focus {
          background:
            rgba(96,130,255,0.10) !important;
        }

        html.dark-mode .register-btn {
          box-shadow:
            0 8px 28px
            rgba(47,93,255,0.45) !important;
        }

        html.dark-mode .register-btn:hover {
          box-shadow:
            0 12px 36px
            rgba(47,93,255,0.50) !important;
        }
      `}</style>

      <div className="register-root">
        <div className="register-card">

          {/* Top Bar */}

          <div className="register-topbar">

            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 600,
                fontSize: "1.2rem",
                color: "var(--hn-ink)",
                letterSpacing: "-0.01em"
              }}
            >
              Create{" "}
              <span style={{ color: "#2F5DFF" }}>
                Account
              </span>
            </span>

            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--hn-ink-muted)"
              }}
            >
              Slog Fashion
            </span>

          </div>

          {/* Body */}

          <form
            onSubmit={handleRegister}
            className="register-body"
          >

            {/* Welcome note */}

            <div
              style={{
                marginBottom: "2rem",
                paddingBottom: "1.5rem",
                borderBottom:
                  "1px solid var(--hn-glass-border)"
              }}
            >
              <p
                style={{
                  fontFamily:
                    "'Outfit', sans-serif",
                  fontWeight: 400,
                  fontSize: "0.9rem",
                  color:
                    "var(--hn-ink-muted)",
                  letterSpacing: "0.01em"
                }}
              >
                Join us — fill in your details
                to get started.
              </p>
            </div>

            {/* Full Name */}

            <div
              style={{
                marginBottom: "1.25rem"
              }}
            >
              <label className="field-label">
                Full Name
              </label>

              <input
                placeholder="John Doe"
                className="register-input"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                autoComplete="name"
              />
            </div>

            {/* Email */}

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
                className="register-input"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
              />
            </div>

            {/* Password */}

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
                className="register-input"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="new-password"
              />

              <p
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.7rem",
                  color:
                    "var(--hn-ink-faint)",
                  letterSpacing: "0.01em"
                }}
              >
                Min. 8 characters with a
                lowercase letter and number
              </p>
            </div>

            {/* Submit */}

            <button
              type="submit"
              className="register-btn"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Creating Account..."
                : "Create Account"}
            </button>

            {/* Secure note */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                marginTop: "0.85rem",
                color:
                  "var(--hn-ink-muted)",
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

              <span>
                Secure registration
              </span>
            </div>

            {/* Divider */}

            <div className="register-divider" />

            {/* Login link */}

            <p
              style={{
                textAlign: "center",
                fontSize: "0.85rem",
                color:
                  "var(--hn-ink-muted)"
              }}
            >
              Already have an account?{" "}

              <Link
                to="/login"
                className="register-link"
              >
                Sign In
              </Link>
            </p>

          </form>
        </div>
      </div>
    </>
  );
};

export default Register;