
import { useState } from "react";
import axios from "axios";
import API_URL from "../config/api";
import { toast } from "react-toastify";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate
} from "react-router-dom";



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



const ResetPassword = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const resetToken =
    location.state?.resetToken;



  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);



  // REDIRECT IF RESET TOKEN IS MISSING

  if (!resetToken) {

    return (
      <Navigate
        to="/forgot-password"
        replace
      />
    );
  }



  // PASSWORD VALIDATION

  const validatePassword = () => {

    if (!password || !confirmPassword) {

      toast.error(
        "Please enter and confirm your new password.",
        {
          style: glassToastStyle
        }
      );

      return false;
    }



    if (password.length < 8) {

      toast.error(
        "Password must contain at least 8 characters.",
        {
          style: glassToastStyle
        }
      );

      return false;
    }



    if (password.length > 200) {

      toast.error(
        "Password cannot exceed 200 characters.",
        {
          style: glassToastStyle
        }
      );

      return false;
    }



    if (!/(?=.*[a-z])(?=.*\d)/.test(password)) {

      toast.error(
        "Password must contain at least one lowercase letter and one number.",
        {
          style: glassToastStyle
        }
      );

      return false;
    }



    if (password !== confirmPassword) {

      toast.error(
        "Passwords do not match.",
        {
          style: glassToastStyle
        }
      );

      return false;
    }



    return true;
  };



  // RESET PASSWORD

  const handleResetPassword = async (e) => {

    e.preventDefault();

    if (loading) return;



    if (!validatePassword()) return;



    try {

      setLoading(true);



      const res = await axios.post(
        `${API_URL}/auth/reset-password`,
        {
          resetToken,
          password: password
        },
        {
          withCredentials: true
        }
      );



      if (!res.data?.success) {

        toast.error(
          res.data?.message ||
            "Unable to reset your password.",
          {
            style: glassToastStyle
          }
        );

        return;
      }



      toast.success(
        "Password reset successfully. Please sign in with your new password.",
        {
          style: glassToastStyle
        }
      );



      navigate(
        "/login",
        {
          replace: true
        }
      );

    } catch (err) {

      console.log(
        "Reset password error:",
        err
      );



      toast.error(
        err.response?.data?.message ||
          "Unable to reset your password. Please try again.",
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
           RESET PASSWORD PAGE
           Continuous customer-facing background.
           No outer card or secondary page container.
        ──────────────────────────────────────────────── */

        .rps-page {
          --rps-bg:           var(--bg-primary);
          --rps-olive:        #6B8E23;
          --rps-olive-deep:   #4B5320;
          --rps-ink:          #10131F;
          --rps-ink-muted:    rgba(16,19,31,0.55);
          --rps-ink-faint:    rgba(16,19,31,0.30);
          --rps-glass-bg:     rgba(255,255,255,0.55);
          --rps-glass-bg2:    rgba(255,255,255,0.85);
          --rps-glass-border: rgba(107,142,35,0.16);
          --rps-glass-shine:  rgba(255,255,255,0.85);

          font-family: 'Jost', sans-serif;
          color: var(--rps-ink);

          width: 100%;
          min-height: 100vh;

          display: flex;
          align-items: center;
          justify-content: center;

          background: var(--rps-bg);

          padding: 5rem 3rem 6rem;

          position: relative;
          overflow: hidden;

          box-sizing: border-box;
        }

        .rps-page *,
        .rps-page *::before,
        .rps-page *::after {
          box-sizing: border-box;
        }



        /* ────────────────────────────────────────────────
           CONTENT WRAPPER
        ──────────────────────────────────────────────── */

        .rps-wrap {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 420px;
        }



        /* ────────────────────────────────────────────────
           HEADER
        ──────────────────────────────────────────────── */

        .rps-header {
          margin-bottom: 2rem;
        }

        .rps-title {
          font-weight: 600;
          font-size: clamp(2rem, 3.6vw, 3rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: var(--rps-ink);
        }

        .rps-title em {
          font-style: normal;
          font-weight: 600;
          color: var(--rps-olive);
        }

        .rps-sub {
          font-size: 0.85rem;
          font-weight: 400;
          color: var(--rps-ink-muted);
          letter-spacing: 0.01em;
          line-height: 1.7;
          margin-top: 0.75rem;
        }



        /* ────────────────────────────────────────────────
           FORM
        ──────────────────────────────────────────────── */

        .rps-form {
          padding-top: 1.8rem;
          border-top: 1px solid var(--rps-glass-border);
        }

        .rps-field {
          margin-bottom: 1.4rem;
        }

        .rps-label {
          display: block;
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--rps-ink-muted);
          margin-bottom: 0.55rem;
        }

        .rps-input {
          width: 100%;
          font-family: 'Jost', sans-serif;
          font-size: 0.9rem;
          font-weight: 400;
          color: var(--rps-ink);

          background: var(--rps-glass-bg);
          border: 1px solid var(--rps-glass-border);
          border-radius: 100px;

          padding: 0.78rem 1.2rem;
          outline: none;

          backdrop-filter: blur(20px) saturate(1.8);
          -webkit-backdrop-filter: blur(20px) saturate(1.8);

          box-shadow: 0 1px 0 var(--rps-glass-shine) inset;

          transition:
            background 0.22s ease,
            border-color 0.22s ease,
            box-shadow 0.22s ease,
            transform 0.22s ease;
        }

        .rps-input::placeholder {
          color: var(--rps-ink-faint);
        }

        .rps-input:hover {
          background: var(--rps-glass-bg2);
        }

        .rps-input:focus {
          background: var(--rps-glass-bg2);
          border-color: var(--rps-olive);
          transform: translateY(-1px);
          box-shadow:
            0 8px 20px rgba(107,142,35,0.14),
            0 1px 0 var(--rps-glass-shine) inset;
        }



        /* ────────────────────────────────────────────────
           PASSWORD SHOW / HIDE
        ──────────────────────────────────────────────── */

        .rps-password-wrap {
          position: relative;
          width: 100%;
        }

        .rps-password-input {
          padding-right: 4.5rem;
        }

        .rps-password-toggle {
          position: absolute;
          top: 50%;
          right: 1.2rem;
          transform: translateY(-50%);

          border: none;
          background: transparent;

          color: var(--rps-olive);
          font-family: 'Jost', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;

          cursor: pointer;
          padding: 0.3rem 0;

          transition: color 0.2s ease;
        }

        .rps-password-toggle:hover {
          color: var(--rps-olive-deep);
        }

        .rps-password-toggle:focus-visible {
          outline: 2px solid var(--rps-olive);
          outline-offset: 3px;
          border-radius: 4px;
        }



        /* ────────────────────────────────────────────────
           SUBMIT BUTTON
        ──────────────────────────────────────────────── */

        .rps-btn {
          width: 100%;
          font-family: 'Jost', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #FFFFFF;

          background: var(--rps-olive);
          border: 1px solid var(--rps-olive);
          border-radius: 100px;

          padding: 0.85rem 1.5rem;
          margin-top: 0.6rem;

          cursor: pointer;

          box-shadow:
            0 8px 20px rgba(107,142,35,0.28),
            0 1px 0 var(--rps-glass-shine) inset;

          transition:
            background 0.22s ease,
            transform 0.22s ease,
            box-shadow 0.22s ease,
            opacity 0.22s ease;
        }

        .rps-btn:hover:not(:disabled) {
          background: var(--rps-olive-deep);
          border-color: var(--rps-olive-deep);
          transform: translateY(-1px);
        }

        .rps-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }



        /* ────────────────────────────────────────────────
           FOOTER
        ──────────────────────────────────────────────── */

        .rps-footer {
          text-align: center;
          font-size: 0.85rem;
          font-weight: 400;
          color: var(--rps-ink-muted);
          margin-top: 1.8rem;
        }

        .rps-link {
          color: var(--rps-olive);
          font-weight: 500;
          text-decoration: none;
          border-bottom: 1px solid rgba(107,142,35,0.3);
          padding-bottom: 1px;
          transition:
            color 0.2s,
            border-color 0.2s;
        }

        .rps-link:hover {
          color: var(--rps-olive-deep);
          border-color: var(--rps-olive-deep);
        }



        /* ────────────────────────────────────────────────
           ENTRANCE ANIMATION
        ──────────────────────────────────────────────── */

        @keyframes rps-blur-in {

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

        .rps-header,
        .rps-form {
          animation:
            rps-blur-in
            0.6s
            cubic-bezier(0.16, 1, 0.3, 1)
            both;
        }

        .rps-form {
          animation-delay: 0.08s;
        }

        @media (prefers-reduced-motion: reduce) {

          .rps-header,
          .rps-form {
            animation: none !important;
            opacity: 1 !important;
            filter: none !important;
            transform: none !important;
          }

        }



        /* ────────────────────────────────────────────────
           DARK MODE
        ──────────────────────────────────────────────── */

        html.dark-mode .rps-page {

          background: #000000 !important;
          background-image: none !important;

          --rps-olive-deep:   #A9C46C;
          --rps-ink:          var(--text-primary);
          --rps-ink-muted:    var(--text-secondary);
          --rps-ink-faint:    var(--text-secondary);
          --rps-glass-bg:     rgba(30,41,59,0.55);
          --rps-glass-bg2:    rgba(30,41,59,0.85);
          --rps-glass-border: rgba(169,196,108,0.20);
          --rps-glass-shine:  rgba(255,255,255,0.05);
        }



        /* ────────────────────────────────────────────────
           RESPONSIVE
        ──────────────────────────────────────────────── */

        @media (max-width: 768px) {

          .rps-page {
            padding: 3rem 1.5rem 4rem;
          }

        }

        @media (max-width: 480px) {

          .rps-page {
            padding: 2.5rem 0.9rem 3.5rem;
          }

          .rps-title {
            font-size: 1.7rem;
          }

        }

      `}</style>



      <div className="rps-page">

        <div className="rps-wrap">

          {/* ==================================================
              HEADER
              ================================================== */}

          <div className="rps-header">

            <h2 className="rps-title">
              Reset <em>Password</em>
            </h2>

            <p className="rps-sub">
              Create a new password for your SLOG-FASHION account.
              Choose a strong password that you haven't used before.
            </p>

          </div>



          {/* ==================================================
              RESET PASSWORD FORM
              ================================================== */}

          <form
            onSubmit={handleResetPassword}
            className="rps-form"
          >

            {/* NEW PASSWORD */}

            <div className="rps-field">

              <label className="rps-label">
                New Password
              </label>

              <div className="rps-password-wrap">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter new password"
                  className="rps-input rps-password-input"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                  maxLength={200}
                  required
                />



                <button
                  type="button"
                  className="rps-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide new password"
                      : "Show new password"
                  }
                >

                  {showPassword
                    ? "Hide"
                    : "Show"}

                </button>

              </div>

            </div>



            {/* CONFIRM PASSWORD */}

            <div className="rps-field">

              <label className="rps-label">
                Confirm New Password
              </label>

              <div className="rps-password-wrap">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm new password"
                  className="rps-input rps-password-input"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                  maxLength={200}
                  required
                />



                <button
                  type="button"
                  className="rps-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                >

                  {showConfirmPassword
                    ? "Hide"
                    : "Show"}

                </button>

              </div>

            </div>



            {/* PASSWORD REQUIREMENTS */}

            <p className="rps-sub">
              Password must contain at least 8 characters,
              one lowercase letter, and one number.
            </p>



            <button
              type="submit"
              className="rps-btn"
              disabled={loading}
            >

              {loading
                ? "Resetting Password..."
                : "Reset Password"}

            </button>



            <p className="rps-footer">

              Remember your password?{" "}

              <Link
                to="/login"
                className="rps-link"
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



export default ResetPassword;
