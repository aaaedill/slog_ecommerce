
import { useState } from "react";
import axios from "axios";
import API_URL from "../config/api";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";



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



const ForgotPassword = () => {

  const navigate = useNavigate();


  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState("");

  const [step, setStep] = useState("email");

  const [loading, setLoading] = useState(false);



  /*
  |--------------------------------------------------------------------------
  | REQUEST PASSWORD RESET OTP
  |--------------------------------------------------------------------------
  |
  | Sends a password-reset OTP to the customer's registered email.
  |
  | The backend returns a generic response to prevent email
  | address enumeration.
  |
  |--------------------------------------------------------------------------
  */

  const handleRequestOTP = async (e) => {

    e.preventDefault();


    if (loading) return;


    const cleanEmail = email.trim().toLowerCase();


    if (!cleanEmail) {

      toast.error(
        "Please enter your email address.",
        {
          style: glassToastStyle
        }
      );

      return;
    }


    try {

      setLoading(true);


      const res = await axios.post(

        `${API_URL}/auth/forgot-password`,

        {
          email: cleanEmail
        },

        {
          withCredentials: true
        }

      );


      if (!res.data?.success) {

        toast.error(
          res.data?.message ||
            "Unable to process your request.",
          {
            style: glassToastStyle
          }
        );

        return;
      }


      setEmail(cleanEmail);

      setStep("otp");


      toast.success(
        res.data?.message ||
          "If an account exists, a verification code has been sent to your email.",
        {
          style: glassToastStyle
        }
      );

    } catch (err) {

      console.log(
        "Forgot password error:",
        err
      );


      const message =
        err.response?.data?.message ||
        "Unable to process your request. Please try again.";


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



  /*
  |--------------------------------------------------------------------------
  | VERIFY PASSWORD RESET OTP
  |--------------------------------------------------------------------------
  |
  | Verifies the six-digit OTP.
  |
  | If verification succeeds, the backend returns a temporary
  | reset authorization token.
  |
  | The token is passed through React Router navigation state.
  | It is not stored in localStorage.
  |
  |--------------------------------------------------------------------------
  */

  const handleVerifyOTP = async (e) => {

    e.preventDefault();


    if (loading) return;


    const cleanOTP = otp.trim();


    if (!/^\d{6}$/.test(cleanOTP)) {

      toast.error(
        "Please enter a valid six-digit OTP.",
        {
          style: glassToastStyle
        }
      );

      return;
    }


    try {

      setLoading(true);


      const res = await axios.post(

        `${API_URL}/auth/verify-reset-otp`,

        {
          email,
          otp: cleanOTP
        },

        {
          withCredentials: true
        }

      );


      if (!res.data?.success) {

        toast.error(
          res.data?.message ||
            "Invalid or expired verification code.",
          {
            style: glassToastStyle
          }
        );

        return;
      }


      const resetToken =
        res.data?.resetToken;


      if (
        !resetToken ||
        typeof resetToken !== "string"
      ) {

        toast.error(
          "Unable to verify your request. Please try again.",
          {
            style: glassToastStyle
          }
        );

        return;
      }


      toast.success(
        "Email verified successfully.",
        {
          style: glassToastStyle
        }
      );


      navigate(
        "/reset-password",
        {
          state: {
            resetToken
          }
        }
      );

    } catch (err) {

      console.log(
        "OTP verification error:",
        err
      );


      const message =
        err.response?.data?.message ||
        "OTP verification failed. Please try again.";


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



  /*
  |--------------------------------------------------------------------------
  | CHANGE EMAIL
  |--------------------------------------------------------------------------
  |
  | Allows the customer to return to the email-entry stage.
  |
  |--------------------------------------------------------------------------
  */

  const handleChangeEmail = () => {

    if (loading) return;


    setOtp("");

    setStep("email");

  };



  return (

    <>

      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap');


        /* ────────────────────────────────────────────────
           FORGOT PASSWORD PAGE
           Continuous customer-facing page background.
           No outer card or secondary page container.
        ──────────────────────────────────────────────── */


        .fgp-page {

          --fgp-bg:           var(--bg-primary);

          --fgp-olive:        #6B8E23;

          --fgp-olive-light:  #A9C46C;

          --fgp-olive-deep:   #4B5320;

          --fgp-olive-faint:  rgba(107,142,35,0.08);

          --fgp-ink:          #10131F;

          --fgp-ink-muted:    rgba(16,19,31,0.55);

          --fgp-ink-faint:    rgba(16,19,31,0.30);

          --fgp-glass-bg:     rgba(255,255,255,0.55);

          --fgp-glass-bg2:    rgba(255,255,255,0.85);

          --fgp-glass-border: rgba(107,142,35,0.16);

          --fgp-glass-shine:  rgba(255,255,255,0.85);


          font-family: 'Jost', sans-serif;

          color: var(--fgp-ink);

          width: 100%;

          min-height: 100vh;

          display: flex;

          align-items: center;

          justify-content: center;


          background: var(--fgp-bg);

          padding: 5rem 3rem 6rem;

          position: relative;

          overflow: hidden;

          box-sizing: border-box;

        }


        .fgp-page *,
        .fgp-page *::before,
        .fgp-page *::after {

          box-sizing: border-box;

        }



        /* ────────────────────────────────────────────────
           CONTENT WRAPPER
        ──────────────────────────────────────────────── */


        .fgp-wrap {

          position: relative;

          z-index: 2;

          width: 100%;

          max-width: 420px;

        }



        /* ────────────────────────────────────────────────
           HEADER
        ──────────────────────────────────────────────── */


        .fgp-header {

          margin-bottom: 2rem;

        }


        .fgp-title {

          font-weight: 600;

          font-size: clamp(2rem, 3.6vw, 3rem);

          line-height: 1.05;

          letter-spacing: -0.02em;

          color: var(--fgp-ink);

        }


        .fgp-title em {

          font-style: normal;

          font-weight: 600;

          color: var(--fgp-olive);

        }


        .fgp-sub {

          font-size: 0.85rem;

          font-weight: 400;

          color: var(--fgp-ink-muted);

          letter-spacing: 0.01em;

          line-height: 1.7;

          margin-top: 0.75rem;

        }



        /* ────────────────────────────────────────────────
           FORM
        ──────────────────────────────────────────────── */


        .fgp-form {

          padding-top: 1.8rem;

          border-top: 1px solid var(--fgp-glass-border);

        }


        .fgp-field {

          margin-bottom: 1.4rem;

        }


        .fgp-label {

          display: block;

          font-size: 0.68rem;

          font-weight: 500;

          letter-spacing: 0.14em;

          text-transform: uppercase;

          color: var(--fgp-ink-muted);

          margin-bottom: 0.55rem;

        }


        .fgp-input {

          width: 100%;

          font-family: 'Jost', sans-serif;

          font-size: 0.9rem;

          font-weight: 400;

          color: var(--fgp-ink);


          background: var(--fgp-glass-bg);

          border: 1px solid var(--fgp-glass-border);

          border-radius: 100px;


          padding: 0.78rem 1.2rem;

          outline: none;


          backdrop-filter: blur(20px) saturate(1.8);

          -webkit-backdrop-filter: blur(20px) saturate(1.8);


          box-shadow: 0 1px 0 var(--fgp-glass-shine) inset;


          transition:

            background 0.22s ease,

            border-color 0.22s ease,

            box-shadow 0.22s ease,

            transform 0.22s ease;

        }


        .fgp-input::placeholder {

          color: var(--fgp-ink-faint);

        }


        .fgp-input:hover {

          background: var(--fgp-glass-bg2);

        }


        .fgp-input:focus {

          background: var(--fgp-glass-bg2);

          border-color: var(--fgp-olive);

          transform: translateY(-1px);

          box-shadow:

            0 8px 20px rgba(107,142,35,0.14),

            0 1px 0 var(--fgp-glass-shine) inset;

        }



        /* ────────────────────────────────────────────────
           SUBMIT BUTTON
        ──────────────────────────────────────────────── */


        .fgp-btn {

          width: 100%;

          font-family: 'Jost', sans-serif;

          font-size: 0.75rem;

          font-weight: 500;

          letter-spacing: 0.08em;

          text-transform: uppercase;

          color: #FFFFFF;


          background: var(--fgp-olive);

          border: 1px solid var(--fgp-olive);

          border-radius: 100px;


          padding: 0.85rem 1.5rem;

          margin-top: 0.6rem;


          cursor: pointer;


          box-shadow:

            0 8px 20px rgba(107,142,35,0.28),

            0 1px 0 var(--fgp-glass-shine) inset;


          transition:

            background 0.22s ease,

            transform 0.22s ease,

            box-shadow 0.22s ease,

            opacity 0.22s ease;

        }


        .fgp-btn:hover:not(:disabled) {

          background: var(--fgp-olive-deep);

          border-color: var(--fgp-olive-deep);

          transform: translateY(-1px);

        }


        .fgp-btn:disabled {

          opacity: 0.65;

          cursor: not-allowed;

          transform: none;

        }



        /* ────────────────────────────────────────────────
           DIVIDER + FOOTER LINKS
        ──────────────────────────────────────────────── */


        .fgp-divider {

          height: 1px;

          background: var(--fgp-glass-border);

          margin: 1.8rem 0;

        }


        .fgp-footer {

          text-align: center;

          font-size: 0.85rem;

          font-weight: 400;

          color: var(--fgp-ink-muted);

          line-height: 1.8;

        }


        .fgp-link {

          color: var(--fgp-olive);

          font-weight: 500;

          text-decoration: none;

          border-bottom: 1px solid rgba(107,142,35,0.3);

          padding-bottom: 1px;

          transition:

            color 0.2s,

            border-color 0.2s;

        }


        .fgp-link:hover {

          color: var(--fgp-olive-deep);

          border-color: var(--fgp-olive-deep);

        }



        /* ────────────────────────────────────────────────
           CHANGE EMAIL BUTTON
        ──────────────────────────────────────────────── */


        .fgp-change-email {

          display: inline-block;

          margin-top: 0.9rem;

          padding: 0;

          background: none;

          border: none;

          font-family: 'Jost', sans-serif;

          font-size: 0.82rem;

          font-weight: 500;

          color: var(--fgp-olive);

          cursor: pointer;

          border-bottom: 1px solid rgba(107,142,35,0.3);

          transition: color 0.2s ease;

        }


        .fgp-change-email:hover {

          color: var(--fgp-olive-deep);

        }


        .fgp-change-email:disabled {

          opacity: 0.6;

          cursor: not-allowed;

        }



        /* ────────────────────────────────────────────────
           ENTRANCE ANIMATION
        ──────────────────────────────────────────────── */


        @keyframes fgp-blur-in {

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


        .fgp-header,
        .fgp-form {

          animation:

            fgp-blur-in

            0.6s

            cubic-bezier(0.16, 1, 0.3, 1)

            both;

        }


        .fgp-form {

          animation-delay: 0.08s;

        }


        @media (prefers-reduced-motion: reduce) {

          .fgp-header,
          .fgp-form {

            animation: none !important;

            opacity: 1 !important;

            filter: none !important;

            transform: none !important;

          }

        }



        /* ────────────────────────────────────────────────
           DARK MODE
        ──────────────────────────────────────────────── */


        html.dark-mode .fgp-page {

          background: #000000 !important;

          background-image: none !important;


          --fgp-olive-deep:   #A9C46C;

          --fgp-ink:          var(--text-primary);

          --fgp-ink-muted:    var(--text-secondary);

          --fgp-ink-faint:    var(--text-secondary);

          --fgp-glass-bg:     rgba(30,41,59,0.55);

          --fgp-glass-bg2:    rgba(30,41,59,0.85);

          --fgp-glass-border: rgba(169,196,108,0.20);

          --fgp-glass-shine:  rgba(255,255,255,0.05);

        }



        /* ────────────────────────────────────────────────
           RESPONSIVE
        ──────────────────────────────────────────────── */


        @media (max-width: 768px) {

          .fgp-page {

            padding: 3rem 1.5rem 4rem;

          }

        }


        @media (max-width: 480px) {

          .fgp-page {

            padding: 2.5rem 0.9rem 3.5rem;

          }


          .fgp-title {

            font-size: 1.7rem;

          }

        }

      `}</style>



      <div className="fgp-page">

        <div className="fgp-wrap">


          {/* ==================================================
              HEADER
              ================================================== */}

          <div className="fgp-header">

            <h2 className="fgp-title">

              {step === "email" ? (

                <>
                  Forgot <em>Password?</em>
                </>

              ) : (

                <>
                  Verify <em>Email</em>
                </>

              )}

            </h2>


            <p className="fgp-sub">

              {step === "email"

                ? "Enter your registered email address. If an account exists, we'll send you a verification code."

                : `Enter the six-digit verification code sent to ${email}.`

              }

            </p>

          </div>



          {/* ==================================================
              EMAIL ENTRY FORM
              ================================================== */}

          {step === "email" && (

            <form
              onSubmit={handleRequestOTP}
              className="fgp-form"
            >

              <div className="fgp-field">

                <label
                  htmlFor="forgot-email"
                  className="fgp-label"
                >
                  Email Address
                </label>


                <input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your registered email"
                  className="fgp-input"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                  maxLength={254}
                  required
                />

              </div>



              <button
                type="submit"
                className="fgp-btn"
                disabled={loading}
              >

                {loading

                  ? "Sending Code..."

                  : "Send Verification Code"

                }

              </button>



              <div className="fgp-divider" />



              <p className="fgp-footer">

                Remember your password?{" "}


                <Link
                  to="/login"
                  className="fgp-link"
                >
                  Sign In
                </Link>

              </p>

            </form>

          )}



          {/* ==================================================
              OTP VERIFICATION FORM
              ================================================== */}

          {step === "otp" && (

            <form
              onSubmit={handleVerifyOTP}
              className="fgp-form"
            >

              <div className="fgp-field">

                <label
                  htmlFor="forgot-otp"
                  className="fgp-label"
                >
                  Six-Digit Verification Code
                </label>


                <input
                  id="forgot-otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  className="fgp-input"
                  value={otp}
                  onChange={(e) => {

                    const value =
                      e.target.value.replace(
                        /\D/g,
                        ""
                      ).slice(0, 6);

                    setOtp(value);

                  }}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                />

              </div>



              <button
                type="submit"
                className="fgp-btn"
                disabled={
                  loading ||
                  otp.length !== 6
                }
              >

                {loading

                  ? "Verifying..."

                  : "Verify Code"

                }

              </button>



              <div className="fgp-divider" />



              <p className="fgp-footer">

                Didn't receive the code?

                <br />

                <button
                  type="button"
                  className="fgp-change-email"
                  onClick={handleChangeEmail}
                  disabled={loading}
                >
                  Change Email Address
                </button>

                <br />

                <Link
                  to="/login"
                  className="fgp-link"
                >
                  Back to Sign In
                </Link>

              </p>

            </form>

          )}

        </div>

      </div>

    </>

  );

};



export default ForgotPassword;