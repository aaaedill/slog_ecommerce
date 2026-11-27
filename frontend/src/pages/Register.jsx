import { useState, useRef } from "react";
import axios from "axios";
import API_URL from "../config/api";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";


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


/*
|--------------------------------------------------------------------------
| OTP Boxes
|--------------------------------------------------------------------------
|
| Six separate boxes, one digit each. The parent keeps `otp` as a plain
| string, so the verify handler does not need to change.
|
| Note: do NOT add maxLength={1} to the inputs. Mobile keyboards fill the
| whole code into one box when you tap the SMS suggestion, and maxLength
| would cut it down to a single digit.
|
|--------------------------------------------------------------------------
*/

const OTP_LENGTH = 6;

const OtpBoxes = ({ value, onChange, disabled }) => {
  const refs = useRef([]);

  const focusBox = (i) => {
    const el = refs.current[Math.max(0, Math.min(OTP_LENGTH - 1, i))];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const handleChange = (e, i) => {
    let raw = e.target.value.replace(/\D/g, "");

    // Digit deleted
    if (!raw) {
      onChange(value.slice(0, i) + value.slice(i + 1));
      return;
    }

    // Keyboard autofill (SMS suggestion) or a full code: spread across all boxes
    if (raw.length >= OTP_LENGTH) {
      onChange(raw.slice(-OTP_LENGTH));
      focusBox(OTP_LENGTH - 1);
      return;
    }

    // Box already had a digit and a new one was typed next to it:
    // keep only the newly typed digit
    const old = value[i] || "";
    if (old && raw.length > 1) {
      const idx = raw.indexOf(old);
      if (idx >= 0) raw = raw.slice(0, idx) + raw.slice(idx + 1);
      raw = raw.slice(-1);
    }

    // Normal typing: never leave gaps
    const pos = Math.min(i, value.length);
    const next = (
      value.slice(0, pos) +
      raw +
      value.slice(pos + raw.length)
    ).slice(0, OTP_LENGTH);

    onChange(next);
    focusBox(pos + raw.length);
  };

  const handleKeyDown = (e, i) => {
    const isBackspace = e.key === "Backspace" || e.keyCode === 8;

    if (isBackspace && !value[i] && i > 0) {
      e.preventDefault();
      onChange(value.slice(0, i - 1) + value.slice(i));
      focusBox(i - 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusBox(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusBox(i + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    onChange(pasted);
    focusBox(pasted.length >= OTP_LENGTH ? OTP_LENGTH - 1 : pasted.length);
  };

  return (
    <div className="reg-otp-row">
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
          className="reg-otp-box"
          value={value[i] || ""}
          disabled={disabled}
          autoFocus={i === 0}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
};


const Register = () => {

  const navigate = useNavigate();


  /*
  |--------------------------------------------------------------------------
  | Registration State
  |--------------------------------------------------------------------------
  */

  const [name, setName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");


  /*
  |--------------------------------------------------------------------------
  | OTP State
  |--------------------------------------------------------------------------
  */

  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");


  /*
  |--------------------------------------------------------------------------
  | Loading State
  |--------------------------------------------------------------------------
  */

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | Registration
  |--------------------------------------------------------------------------
  */

  const handleRegister = async (e) => {

    e.preventDefault();

    if (isSubmitting) return;

    const cleanName = name.trim();
    const cleanEmailOrPhone = emailOrPhone.trim();
    const cleanPassword = password;


    /*
    |--------------------------------------------------------------------------
    | Basic Validation
    |--------------------------------------------------------------------------
    */

    if (!cleanName || !cleanEmailOrPhone || !cleanPassword) {

      toast.error("Please fill all fields", {
        style: glassToastStyle
      });

      return;

    }


    /*
    |--------------------------------------------------------------------------
    | Email Validation
    |--------------------------------------------------------------------------
    |
    | The backend accepts either:
    |
    | - Email address
    | - Indian mobile number
    |
    |--------------------------------------------------------------------------
    */

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    /*
    |--------------------------------------------------------------------------
    | Indian Mobile Validation
    |--------------------------------------------------------------------------
    |
    | Accepts:
    |
    | 9876543210
    | +919876543210
    | 919876543210
    |
    |--------------------------------------------------------------------------
    */

    const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;

    const isEmail = emailRegex.test(cleanEmailOrPhone.toLowerCase());

    const normalizedPhoneInput = cleanEmailOrPhone.replace(/[\s-]/g, "");

    const isPhone = phoneRegex.test(normalizedPhoneInput);

    if (!isEmail && !isPhone) {

      toast.error(
        "Please enter a valid email address or Indian mobile number",
        {
          style: glassToastStyle
        }
      );

      return;

    }


    /*
    |--------------------------------------------------------------------------
    | Password Validation
    |--------------------------------------------------------------------------
    */

    const passwordRegex = /^(?=.*[a-z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(cleanPassword)) {

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

      /*
      |--------------------------------------------------------------------------
      | Register With Backend
      |--------------------------------------------------------------------------
      */

      const response = await axios.post(
        `${API_URL}/auth/register`,
        {
          name: cleanName,
          emailOrPhone: cleanEmailOrPhone,
          password: cleanPassword
        },
        {
          withCredentials: true
        }
      );


      /*
      |--------------------------------------------------------------------------
      | Backend Error Response
      |--------------------------------------------------------------------------
      */

      if (!response.data?.success) {

        toast.error(
          response.data?.message || "Error creating account",
          {
            style: glassToastStyle
          }
        );

        return;

      }


      /*
      |--------------------------------------------------------------------------
      | Get User ID
      |--------------------------------------------------------------------------
      |
      | The OTP verification endpoint needs the newly
      | created user's ID.
      |
      |--------------------------------------------------------------------------
      */

      const returnedUserId =
        response.data?.userId ||
        response.data?.user?._id ||
        response.data?.user?.id;

      if (!returnedUserId) {

        toast.error(
          "Account was created, but OTP verification could not be started.",
          {
            style: glassToastStyle
          }
        );

        return;

      }


      /*
      |--------------------------------------------------------------------------
      | Store User ID
      |--------------------------------------------------------------------------
      */

      setUserId(String(returnedUserId));


      /*
      |--------------------------------------------------------------------------
      | Show OTP Screen
      |--------------------------------------------------------------------------
      */

      setShowOTP(true);

      toast.success(
        response.data?.message || "OTP sent successfully",
        {
          style: glassToastStyle
        }
      );

    } catch (error) {

      console.error("Registration error:", error);


      /*
      |--------------------------------------------------------------------------
      | Duplicate Account
      |--------------------------------------------------------------------------
      */

      if (error.response?.status === 409) {

        toast.error(
          error.response?.data?.message ||
            "Email or mobile number already taken",
          {
            style: glassToastStyle
          }
        );

      } else {

        toast.error(
          error.response?.data?.message || "Error creating account",
          {
            style: glassToastStyle
          }
        );

      }

    } finally {

      setIsSubmitting(false);

    }

  };


  /*
  |--------------------------------------------------------------------------
  | Verify OTP
  |--------------------------------------------------------------------------
  */

  const handleVerifyOTP = async (e) => {

    e.preventDefault();

    if (isVerifying) return;

    const cleanOTP = otp.trim();


    /*
    |--------------------------------------------------------------------------
    | OTP Validation
    |--------------------------------------------------------------------------
    */

    if (!/^\d{6}$/.test(cleanOTP)) {

      toast.error("Please enter the 6-digit OTP", {
        style: glassToastStyle
      });

      return;

    }

    if (!userId) {

      toast.error(
        "Verification session is invalid. Please register again.",
        {
          style: glassToastStyle
        }
      );

      return;

    }

    setIsVerifying(true);

    try {

      /*
      |--------------------------------------------------------------------------
      | Verify OTP With Backend
      |--------------------------------------------------------------------------
      */

      const response = await axios.post(
        `${API_URL}/auth/verify-otp`,
        {
          userId,
          otp: cleanOTP
        },
        {
          withCredentials: true
        }
      );


      /*
      |--------------------------------------------------------------------------
      | Backend Error Response
      |--------------------------------------------------------------------------
      */

      if (!response.data?.success) {

        toast.error(
          response.data?.message || "Invalid OTP",
          {
            style: glassToastStyle
          }
        );

        return;

      }


      /*
      |--------------------------------------------------------------------------
      | Verification Successful
      |--------------------------------------------------------------------------
      */

      toast.success(
        response.data?.message || "Account verified successfully",
        {
          style: glassToastStyle
        }
      );


      /*
      |--------------------------------------------------------------------------
      | Go To Login
      |--------------------------------------------------------------------------
      */

      navigate("/login");

    } catch (error) {

      console.error("OTP verification error:", error);

      toast.error(
        error.response?.data?.message || "OTP verification failed",
        {
          style: glassToastStyle
        }
      );

    } finally {

      setIsVerifying(false);

    }

  };


  /*
  |--------------------------------------------------------------------------
  | Resend OTP
  |--------------------------------------------------------------------------
  */

  const handleResendOTP = async () => {

    if (isResending) return;

    if (!userId) {

      toast.error(
        "Verification session is invalid. Please register again.",
        {
          style: glassToastStyle
        }
      );

      return;

    }

    setIsResending(true);

    try {

      const response = await axios.post(
        `${API_URL}/auth/resend-otp`,
        {
          userId
        },
        {
          withCredentials: true
        }
      );

      if (!response.data?.success) {

        toast.error(
          response.data?.message || "Unable to resend OTP",
          {
            style: glassToastStyle
          }
        );

        return;

      }

      // Clear old digits so the user starts fresh with the new code
      setOtp("");

      toast.success(
        response.data?.message || "A new OTP has been sent",
        {
          style: glassToastStyle
        }
      );

    } catch (error) {

      console.error("Resend OTP error:", error);

      toast.error(
        error.response?.data?.message || "Unable to resend OTP",
        {
          style: glassToastStyle
        }
      );

    } finally {

      setIsResending(false);

    }

  };


  /*
  |--------------------------------------------------------------------------
  | Back To Registration
  |--------------------------------------------------------------------------
  */

  const handleBackToRegistration = () => {

    if (isVerifying || isResending || isSubmitting) {
      return;
    }

    setShowOTP(false);
    setOtp("");
    setUserId("");

  };


  return (

    <>

      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap');



        /* ────────────────────────────────────────────────
           REGISTER PAGE
           Continuous customer-facing page background.
           No outer card or secondary page container.
        ──────────────────────────────────────────────── */

        .reg-page {

          --reg-bg:           var(--bg-primary);
          --reg-olive:        #6B8E23;
          --reg-olive-light:  #A9C46C;
          --reg-olive-deep:   #4B5320;
          --reg-olive-faint:  rgba(107,142,35,0.08);
          --reg-ink:          #10131F;
          --reg-ink-muted:    rgba(16,19,31,0.55);
          --reg-ink-faint:    rgba(16,19,31,0.30);
          --reg-glass-bg:     rgba(255,255,255,0.55);
          --reg-glass-bg2:    rgba(255,255,255,0.85);
          --reg-glass-border: rgba(107,142,35,0.16);
          --reg-glass-shine:  rgba(255,255,255,0.85);

          font-family: 'Jost', sans-serif;
          color: var(--reg-ink);

          width: 100%;
          min-height: 100vh;

          display: flex;
          align-items: center;
          justify-content: center;

          /* Continuous main page background */
          background: var(--reg-bg);

          padding: 5rem 3rem 6rem;

          position: relative;
          overflow: hidden;

          box-sizing: border-box;

        }

        .reg-page *,
        .reg-page *::before,
        .reg-page *::after {
          box-sizing: border-box;
        }



        /* ────────────────────────────────────────────────
           CONTENT WRAPPER
           No card — just a max-width column of freely
           floating elements.
        ──────────────────────────────────────────────── */

        .reg-wrap {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 420px;
        }



        /* ────────────────────────────────────────────────
           HEADER
        ──────────────────────────────────────────────── */

        .reg-header {
          margin-bottom: 2rem;
        }

        .reg-title {
          font-weight: 600;
          font-size: clamp(2rem, 3.6vw, 3rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: var(--reg-ink);
        }

        .reg-title em {
          font-style: normal;
          font-weight: 600;
          color: var(--reg-olive);
        }

        .reg-sub {
          font-size: 0.85rem;
          font-weight: 400;
          color: var(--reg-ink-muted);
          letter-spacing: 0.01em;
          margin-top: 0.75rem;
          line-height: 1.6;
        }



        /* ────────────────────────────────────────────────
           FORM — fields sit directly on the page, styled
           like the filter-row glass pills on Collection
        ──────────────────────────────────────────────── */

        .reg-form {
          padding-top: 1.8rem;
          border-top: 1px solid var(--reg-glass-border);
        }

        .reg-field {
          margin-bottom: 1.4rem;
        }

        .reg-label {
          display: block;
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--reg-ink-muted);
          margin-bottom: 0.55rem;
        }

        .reg-hint {
          margin-top: 0.5rem;
          font-size: 0.7rem;
          color: var(--reg-ink-faint);
          letter-spacing: 0.01em;
          line-height: 1.5;
        }

        .reg-input {
          width: 100%;
          font-family: 'Jost', sans-serif;
          font-size: 0.9rem;
          font-weight: 400;
          color: var(--reg-ink);

          background: var(--reg-glass-bg);
          border: 1px solid var(--reg-glass-border);
          border-radius: 100px;

          padding: 0.78rem 1.2rem;
          outline: none;

          backdrop-filter: blur(20px) saturate(1.8);
          -webkit-backdrop-filter: blur(20px) saturate(1.8);

          box-shadow: 0 1px 0 var(--reg-glass-shine) inset;

          transition:
            background 0.22s ease,
            border-color 0.22s ease,
            box-shadow 0.22s ease,
            transform 0.22s ease;
        }

        .reg-input::placeholder {
          color: var(--reg-ink-faint);
        }

        .reg-input:hover {
          background: var(--reg-glass-bg2);
        }

        .reg-input:focus {
          background: var(--reg-glass-bg2);
          border-color: var(--reg-olive);
          transform: translateY(-1px);
          box-shadow:
            0 8px 20px rgba(107,142,35,0.14),
            0 1px 0 var(--reg-glass-shine) inset;
        }



        /* ────────────────────────────────────────────────
           OTP BOXES — six single-digit glass boxes
        ──────────────────────────────────────────────── */

        .reg-otp-row {
          display: flex;
          gap: 0.55rem;
          justify-content: space-between;
        }

        .reg-otp-box {
          flex: 1;
          min-width: 0;
          height: 3.4rem;
          text-align: center;
          font-family: 'Jost', sans-serif;
          font-size: 1.25rem; /* 16px+ prevents iOS zoom on focus */
          font-weight: 500;
          color: var(--reg-ink);
          caret-color: var(--reg-olive);

          background: var(--reg-glass-bg);
          border: 1px solid var(--reg-glass-border);
          border-radius: 14px;
          outline: none;
          padding: 0;

          backdrop-filter: blur(20px) saturate(1.8);
          -webkit-backdrop-filter: blur(20px) saturate(1.8);
          box-shadow: 0 1px 0 var(--reg-glass-shine) inset;

          transition:
            background 0.22s ease,
            border-color 0.22s ease,
            box-shadow 0.22s ease,
            transform 0.22s ease;
        }

        .reg-otp-box:hover {
          background: var(--reg-glass-bg2);
        }

        .reg-otp-box:focus {
          background: var(--reg-glass-bg2);
          border-color: var(--reg-olive);
          transform: translateY(-1px);
          box-shadow:
            0 8px 20px rgba(107,142,35,0.14),
            0 1px 0 var(--reg-glass-shine) inset;
        }

        .reg-otp-box:disabled {
          opacity: 0.6;
        }



        /* ────────────────────────────────────────────────
           SUBMIT BUTTON — solid olive pill, same weight
           as the active category chip
        ──────────────────────────────────────────────── */

        .reg-btn {
          width: 100%;
          font-family: 'Jost', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #FFFFFF;

          background: var(--reg-olive);
          border: 1px solid var(--reg-olive);
          border-radius: 100px;

          padding: 0.85rem 1.5rem;
          margin-top: 0.6rem;

          cursor: pointer;

          box-shadow:
            0 8px 20px rgba(107,142,35,0.28),
            0 1px 0 var(--reg-glass-shine) inset;

          transition:
            background 0.22s ease,
            transform 0.22s ease,
            box-shadow 0.22s ease,
            opacity 0.22s ease;
        }

        .reg-btn:hover:not(:disabled) {
          background: var(--reg-olive-deep);
          border-color: var(--reg-olive-deep);
          transform: translateY(-1px);
        }

        .reg-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }



        /* ────────────────────────────────────────────────
           SECURE NOTE
        ──────────────────────────────────────────────── */

        .reg-secure {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-top: 0.85rem;
          color: var(--reg-ink-muted);
          font-size: 0.7rem;
        }



        /* ────────────────────────────────────────────────
           TEXT / GHOST BUTTONS (resend, back)
        ──────────────────────────────────────────────── */

        .reg-ghost-btn {
          border: none;
          background: transparent;
          font-family: 'Jost', sans-serif;
          cursor: pointer;
        }

        .reg-ghost-btn.reg-ghost-primary {
          color: var(--reg-olive);
          font-size: 0.78rem;
          font-weight: 500;
        }

        .reg-ghost-btn.reg-ghost-primary:hover:not(:disabled) {
          color: var(--reg-olive-deep);
        }

        .reg-ghost-btn.reg-ghost-primary:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .reg-ghost-btn.reg-ghost-muted {
          color: var(--reg-ink-muted);
          font-size: 0.75rem;
        }

        .reg-ghost-btn.reg-ghost-muted:hover {
          color: var(--reg-olive-deep);
        }



        /* ────────────────────────────────────────────────
           DIVIDER + FOOTER LINK
        ──────────────────────────────────────────────── */

        .reg-divider {
          height: 1px;
          background: var(--reg-glass-border);
          margin: 1.8rem 0;
        }

        .reg-footer {
          text-align: center;
          font-size: 0.85rem;
          font-weight: 400;
          color: var(--reg-ink-muted);
        }

        .reg-link {
          color: var(--reg-olive);
          font-weight: 500;
          text-decoration: none;
          border-bottom: 1px solid rgba(107,142,35,0.3);
          padding-bottom: 1px;
          transition:
            color 0.2s,
            border-color 0.2s;
        }

        .reg-link:hover {
          color: var(--reg-olive-deep);
          border-color: var(--reg-olive-deep);
        }



        /* ────────────────────────────────────────────────
           ENTRANCE ANIMATION — same blur-in keyframe used
           on Collection's header / filter-row / cards
        ──────────────────────────────────────────────── */

        @keyframes reg-blur-in {

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

        .reg-header,
        .reg-form {
          animation:
            reg-blur-in
            0.6s
            cubic-bezier(0.16, 1, 0.3, 1)
            both;
        }

        .reg-form {
          animation-delay: 0.08s;
        }

        @media (prefers-reduced-motion: reduce) {

          .reg-header,
          .reg-form {
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

        html.dark-mode .reg-page {

          background: #000000 !important;
          background-image: none !important;

          --reg-olive-deep:   #A9C46C;
          --reg-ink:          var(--text-primary);
          --reg-ink-muted:    var(--text-secondary);
          --reg-ink-faint:    var(--text-secondary);
          --reg-glass-bg:     rgba(30,41,59,0.55);
          --reg-glass-bg2:    rgba(30,41,59,0.85);
          --reg-glass-border: rgba(169,196,108,0.20);
          --reg-glass-shine:  rgba(255,255,255,0.05);
        }



        /* ────────────────────────────────────────────────
           RESPONSIVE
        ──────────────────────────────────────────────── */

        @media (max-width: 768px) {

          .reg-page {
            padding: 3rem 1.5rem 4rem;
          }

        }

        @media (max-width: 480px) {

          .reg-page {
            padding: 2.5rem 0.9rem 3.5rem;
          }

          .reg-title {
            font-size: 1.7rem;
          }

          .reg-otp-row {
            gap: 0.4rem;
          }

          .reg-otp-box {
            height: 3rem;
            border-radius: 12px;
          }

        }

      `}</style>


      <div className="reg-page">

        <div className="reg-wrap">

          {/* ==================================================
              HEADER
              ================================================== */}

          <div className="reg-header">

            <h2 className="reg-title">
              {showOTP ? (
                <>
                  Verify <em>Account</em>
                </>
              ) : (
                <>
                  Create <em>Account</em>
                </>
              )}
            </h2>

            <p className="reg-sub">
              {showOTP
                ? "We've sent a verification code to your email or mobile number. Enter the 6-digit OTP to verify your account."
                : "Join us — fill in your details to get started."}
            </p>

          </div>


          {!showOTP ? (

            /* ==================================================
               REGISTRATION FORM — no card, fields directly
               on the page
               ================================================== */

            <form
              onSubmit={handleRegister}
              className="reg-form"
            >

              {/* Full Name */}

              <div className="reg-field">

                <label className="reg-label">
                  Full Name
                </label>

                <input
                  placeholder="Full Name"
                  className="reg-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />

              </div>


              {/* Email Or Phone */}

              <div className="reg-field">

                <label className="reg-label">
                  Email
                </label>

                <input
                  type="text"
                  placeholder="Email"
                  className="reg-input"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                />

              </div>


              {/* Password */}

              <div className="reg-field">

                <label className="reg-label">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Password"
                  className="reg-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />

                <p className="reg-hint">
                  Min. 8 characters with a lowercase letter and number
                </p>

              </div>


              {/* Submit */}

              <button
                type="submit"
                className="reg-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending OTP..." : "Create Account"}
              </button>


              {/* Secure Note */}

              <div className="reg-secure">

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


              <div className="reg-divider" />


              <p className="reg-footer">

                Already have an account?{" "}

                <Link
                  to="/login"
                  className="reg-link"
                >
                  Sign In
                </Link>

              </p>

            </form>

          ) : (

            /* ==================================================
               OTP FORM — six single-digit boxes
               ================================================== */

            <form
              onSubmit={handleVerifyOTP}
              className="reg-form"
            >

              {/* OTP */}

              <div className="reg-field">

                <label className="reg-label">
                  Verification Code
                </label>

                <OtpBoxes
                  value={otp}
                  onChange={setOtp}
                  disabled={isVerifying}
                />

                <p className="reg-hint">
                  The OTP is valid for 10 minutes.
                </p>

              </div>


              {/* Verify Button */}

              <button
                type="submit"
                className="reg-btn"
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify Account"}
              </button>


              {/* Resend OTP */}

              <div
                style={{
                  textAlign: "center",
                  marginTop: "1rem"
                }}
              >

                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isResending}
                  className="reg-ghost-btn reg-ghost-primary"
                >
                  {isResending ? "Sending..." : "Resend OTP"}
                </button>

              </div>


              {/* Back */}

              <div
                style={{
                  textAlign: "center",
                  marginTop: "0.75rem"
                }}
              >

                <button
                  type="button"
                  onClick={handleBackToRegistration}
                  className="reg-ghost-btn reg-ghost-muted"
                >
                  ← Back to registration
                </button>

              </div>


              <div className="reg-divider" />


              <p className="reg-footer">

                Already have an account?{" "}

                <Link
                  to="/login"
                  className="reg-link"
                >
                  Sign In
                </Link>

              </p>

            </form>

          )}

        </div>

      </div>

    </>

  );

};


export default Register;