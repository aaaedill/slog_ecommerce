
import React, { useState, useEffect, useRef } from "react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  // =========================================================
  // PLAY ANIMATIONS ON LOAD / REFRESH AND WHEN SCROLLED INTO VIEW
  // =========================================================

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // =========================================================
  // HANDLE NEWSLETTER FORM
  // =========================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    setMessage(
      "Thank you for your interest! Newsletter subscription will be available soon."
    );

    setEmail("");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&family=Prata&display=swap');

        /* =====================================================
           RESET
        ===================================================== */

        .newsletter-page,
        .newsletter-page * {
          box-sizing: border-box;
        }

        /* =====================================================
           SECTION
        ===================================================== */

        .newsletter-page {
          position: relative;
          width: 100vw;
          max-width: 100vw;
          min-height: clamp(440px, 52vw, 600px);
          margin-left: calc(50% - 50vw);
          display: flex;
          align-items: center;
          overflow: hidden;
          isolation: isolate;
          background-color: #171717;
          color: #FFFFFF;
          font-family: 'Jost', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* Background image (slow settle-in zoom) */
        .newsletter-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-image: url("/newsletter-bg-black-model.webp");
          background-size: cover;
          background-position: center 35%;
          background-repeat: no-repeat;
          transform: scale(1.08);
        }

        .newsletter-page.is-visible .newsletter-bg {
          animation: nlBgSettle 2.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* Dark gradient for text legibility */
        .newsletter-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.80) 0%,
              rgba(0, 0, 0, 0.64) 38%,
              rgba(0, 0, 0, 0.22) 70%,
              rgba(0, 0, 0, 0.06) 100%
            ),
            linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.30) 0%,
              transparent 35%
            );
        }

        /* =====================================================
           CONTENT
        ===================================================== */

        .newsletter-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: clamp(56px, 8vw, 80px) clamp(22px, 7vw, 8%);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        /* Staggered reveal */
        .nl-reveal {
          opacity: 0;
          transform: translateY(14px);
        }

        .newsletter-page.is-visible .nl-reveal {
          animation: nlReveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: var(--d, 0s);
        }

        @keyframes nlReveal {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes nlBgSettle {
          to {
            transform: scale(1);
          }
        }

        @keyframes nlLine {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        /* =====================================================
           EYEBROW
        ===================================================== */

        .newsletter-eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          color: #CFCFCF;
          font-size: 0.64rem;
          font-weight: 500;
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }

        .newsletter-eyebrow::before {
          content: "";
          width: 30px;
          height: 1px;
          background: #A8B75D;
          transform-origin: left;
          transform: scaleX(0);
        }

        .newsletter-page.is-visible .newsletter-eyebrow::before {
          animation: nlLine 0.9s 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* =====================================================
           HEADING
        ===================================================== */

        .newsletter-heading {
          max-width: 520px;
          margin: 0;
          color: #FFFFFF;
          font-family: 'Prata', serif;
          font-size: clamp(2rem, 4.4vw, 3.5rem);
          font-weight: 400;
          line-height: 1.14;
          letter-spacing: -0.03em;
          text-shadow: 0 4px 25px rgba(0, 0, 0, 0.2);
        }

        .newsletter-heading span {
          display: block;
          color: #B4C078;
        }

        /* =====================================================
           DESCRIPTION
        ===================================================== */

        .newsletter-description {
          max-width: 360px;
          margin: 18px 0 0;
          color: rgba(255, 255, 255, 0.78);
          font-size: 0.84rem;
          font-weight: 300;
          line-height: 1.8;
          letter-spacing: 0.03em;
        }

        /* =====================================================
           FORM
        ===================================================== */

        .newsletter-form {
          width: 100%;
          max-width: 400px;
          min-height: 50px;
          margin-top: 28px;
          padding: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.97);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 3px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22);
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .newsletter-form:focus-within {
          border-color: #B4C078;
          box-shadow:
            0 0 0 3px rgba(180, 192, 120, 0.2),
            0 10px 30px rgba(0, 0, 0, 0.25);
        }

        .newsletter-mail-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          margin-left: 12px;
          color: #505344;
        }

        .newsletter-input {
          flex: 1;
          width: 100%;
          min-width: 0;
          height: 40px;
          padding: 0 6px;
          border: none;
          outline: none;
          background: transparent;
          color: #292B24;
          font-family: 'Jost', sans-serif;
          font-size: 0.82rem;
          font-weight: 400;
        }

        .newsletter-input::placeholder {
          color: #858585;
          opacity: 1;
        }

        .newsletter-button {
          flex-shrink: 0;
          min-width: 112px;
          height: 40px;
          padding: 0 18px;
          border: none;
          border-radius: 2px;
          background: #737E43;
          color: #FFFFFF;
          font-family: 'Jost', sans-serif;
          font-size: 0.64rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          white-space: nowrap;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.3s ease;
        }

        .newsletter-button:hover {
          background: #596333;
          transform: translateY(-1px);
        }

        .newsletter-button:active {
          transform: translateY(0);
        }

        .newsletter-button:focus-visible {
          outline: 2px solid #B4C078;
          outline-offset: 2px;
        }

        /* =====================================================
           MESSAGE
        ===================================================== */

        .newsletter-message {
          max-width: 400px;
          margin: 12px 0 0;
          color: #E3E9C8;
          font-size: 0.76rem;
          font-weight: 400;
          line-height: 1.6;
          letter-spacing: 0.02em;
          animation: nlMessage 0.5s ease both;
        }

        @keyframes nlMessage {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* =====================================================
           BOTTOM NOTE
        ===================================================== */

        .newsletter-bottom {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 22px;
        }

        .newsletter-bottom-line {
          width: 24px;
          height: 1px;
          background: #A8B75D;
        }

        .newsletter-privacy {
          color: rgba(255, 255, 255, 0.68);
          font-size: 0.66rem;
          font-weight: 300;
          letter-spacing: 0.08em;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 900px) {
          .newsletter-page {
            min-height: 500px;
          }

          .newsletter-bg {
            background-position: 62% center;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 600px) {
          .newsletter-page {
            min-height: 0;
            padding: 0;
          }

          .newsletter-bg {
            background-position: 68% center;
          }

          .newsletter-overlay {
            background:
              linear-gradient(
                90deg,
                rgba(0, 0, 0, 0.80) 0%,
                rgba(0, 0, 0, 0.62) 55%,
                rgba(0, 0, 0, 0.32) 100%
              ),
              linear-gradient(
                0deg,
                rgba(0, 0, 0, 0.42) 0%,
                transparent 70%
              );
          }

          .newsletter-content {
            padding: 56px 22px;
          }

          .newsletter-eyebrow {
            gap: 10px;
            margin-bottom: 14px;
            font-size: 0.58rem;
            letter-spacing: 0.24em;
          }

          .newsletter-eyebrow::before {
            width: 22px;
          }

          .newsletter-heading {
            max-width: 100%;
            font-size: clamp(1.75rem, 8.4vw, 2.3rem);
            line-height: 1.16;
          }

          .newsletter-description {
            max-width: 300px;
            margin-top: 14px;
            font-size: 0.78rem;
            line-height: 1.75;
            letter-spacing: 0.02em;
          }

          .newsletter-form {
            max-width: 100%;
            min-height: 46px;
            margin-top: 22px;
            padding: 3px;
            gap: 3px;
          }

          .newsletter-mail-icon {
            width: 14px;
            height: 14px;
            margin-left: 9px;
          }

          .newsletter-input {
            height: 38px;
            padding: 0 4px;
            font-size: 16px; /* prevents iOS zoom on focus */
          }

          .newsletter-button {
            min-width: 88px;
            height: 38px;
            padding: 0 12px;
            font-size: 0.58rem;
            letter-spacing: 0.1em;
          }

          .newsletter-message {
            max-width: 100%;
            margin-top: 10px;
            font-size: 0.72rem;
          }

          .newsletter-bottom {
            margin-top: 18px;
            gap: 8px;
          }

          .newsletter-bottom-line {
            width: 18px;
          }

          .newsletter-privacy {
            font-size: 0.62rem;
            letter-spacing: 0.05em;
          }
        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 360px) {
          .newsletter-content {
            padding: 48px 18px;
          }

          .newsletter-heading {
            font-size: 1.65rem;
          }

          .newsletter-description {
            font-size: 0.74rem;
          }

          .newsletter-mail-icon {
            display: none;
          }

          .newsletter-input {
            padding-left: 10px;
          }

          .newsletter-button {
            min-width: 76px;
            padding: 0 10px;
            font-size: 0.54rem;
          }
        }

        /* =====================================================
           SHORT / LANDSCAPE SCREENS
        ===================================================== */

        @media (max-height: 520px) and (min-width: 601px) {
          .newsletter-page {
            min-height: 0;
          }

          .newsletter-content {
            padding-top: 40px;
            padding-bottom: 40px;
          }

          .newsletter-form {
            margin-top: 20px;
          }

          .newsletter-bottom {
            margin-top: 16px;
          }
        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {
          .newsletter-page .newsletter-bg,
          .newsletter-page.is-visible .newsletter-bg {
            animation: none;
            transform: none;
          }

          .newsletter-page .nl-reveal,
          .newsletter-page.is-visible .nl-reveal,
          .newsletter-message {
            animation: none;
            opacity: 1;
            transform: none;
          }

          .newsletter-page .newsletter-eyebrow::before,
          .newsletter-page.is-visible .newsletter-eyebrow::before {
            animation: none;
            transform: none;
          }

          .newsletter-form,
          .newsletter-button {
            transition: none;
          }
        }
      `}</style>

      <section
        ref={sectionRef}
        className={`newsletter-page${inView ? " is-visible" : ""}`}
        aria-label="Newsletter subscription"
      >
        {/* BACKGROUND */}
        <div className="newsletter-bg" aria-hidden="true"></div>
        <div className="newsletter-overlay" aria-hidden="true"></div>

        {/* CONTENT */}
        <div className="newsletter-content">
          <div
            className="newsletter-eyebrow nl-reveal"
            style={{ "--d": "0.15s" }}
          >
            The Slog Journal
          </div>

          <h2
            className="newsletter-heading nl-reveal"
            style={{ "--d": "0.3s" }}
          >
            A little more
            <span>inspiration.</span>
          </h2>

          <p
            className="newsletter-description nl-reveal"
            style={{ "--d": "0.45s" }}
          >
            Discover new collections, exclusive releases
            and stories from the world of Slog.
            Get the latest delivered straight to your inbox.
          </p>

          <form
            className="newsletter-form nl-reveal"
            style={{ "--d": "0.6s" }}
            onSubmit={handleSubmit}
          >
            <svg
              className="newsletter-mail-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="1" />
              <path d="m3 7 9 6 9-6" />
            </svg>

            <input
              type="email"
              className="newsletter-input"
              placeholder="Your email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setMessage("");
              }}
              required
              aria-label="Email address"
            />

            <button type="submit" className="newsletter-button">
              Join Us
            </button>
          </form>

          {message && (
            <p className="newsletter-message" role="status">
              {message}
            </p>
          )}

          <div
            className="newsletter-bottom nl-reveal"
            style={{ "--d": "0.75s" }}
          >
            <span className="newsletter-bottom-line"></span>
            <div className="newsletter-privacy">
              Thoughtfully curated. Never spammed.
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Newsletter;