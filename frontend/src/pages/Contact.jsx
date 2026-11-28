
import React from "react";
import { Title } from "../components/Title";
import { Link } from "react-router-dom";

const Contact = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap');

        .contact-root { font-family: 'Jost', sans-serif; }

        /* Tokens — shared with LatestCollection / About */
        .contact-root {
          --ct-olive:        #6B8E23;
          --ct-olive-light:  #A9C46C;
          --ct-olive-deep:   #4B5320;
          --ct-ink:          #10131F;
          --ct-ink-muted:    rgba(16,19,31,0.55);
          --ct-glass-border: rgba(107,142,35,0.16);
        }

        /* Contact image */
        .contact-img {
          width: 100%;
          border-radius: 1.2rem;
          border: 1px solid var(--ct-glass-border);
          object-fit: cover;
          transition: transform 0.7s cubic-bezier(0.16,1,0.3,1);
          display: block;
        }
        .contact-img:hover { transform: scale(1.02); }

        /* Section label */
        .contact-eyebrow {
          font-family: 'Jost', sans-serif;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ct-olive-deep);
        }

        /* Thin rule */
        .contact-rule {
          height: 1px;
          width: 2.75rem;
          background: linear-gradient(to right, var(--ct-olive), transparent);
          margin: 0.9rem 0 1.3rem;
        }

        /* Section headings */
        .contact-heading {
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          line-height: 1.15;
        }

        /* Info text */
        .contact-info-label {
          font-family: 'Jost', sans-serif;
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 0.3rem;
        }

        .contact-info-value {
          font-family: 'Jost', sans-serif;
          font-size: 0.95rem;
          font-weight: 400;
          color: var(--text-primary);
          line-height: 1.8;
        }

        /* Info item row */
        .contact-info-item {
          padding: 1rem 0;
          border-bottom: 1px solid var(--ct-glass-border);
          transition: padding-left 0.3s ease, border-color 0.3s ease;
        }
        .contact-info-item:first-child { border-top: 1px solid var(--ct-glass-border); }
        .contact-info-item:hover {
          padding-left: 0.5rem;
          border-color: rgba(107,142,35,0.32);
        }

        /* Exclusives block */
        .contact-exclusive-wrap {
          background: var(--ct-ink);
          border-radius: 1.2rem;
          border: 1px solid rgba(169,196,108,0.20);
          padding: 2rem;
          position: relative;
          overflow: hidden;
          margin-top: 2rem;
        }
        .contact-exclusive-wrap::before {
          content: '';
          position: absolute;
          top: -30%;
          right: -10%;
          width: 60%;
          height: 160%;
          background: radial-gradient(ellipse, rgba(169,196,108,0.16) 0%, transparent 65%);
          pointer-events: none;
        }

        .contact-exclusive-title {
          font-weight: 600;
          color: #FFFFFF;
          letter-spacing: -0.01em;
          margin-bottom: 0.5rem;
          position: relative;
        }

        .contact-exclusive-body {
          font-family: 'Jost', sans-serif;
          font-size: 0.92rem;
          font-weight: 400;
          color: rgba(255,255,255,0.72);
          line-height: 1.8;
          margin-bottom: 1.5rem;
          position: relative;
        }

        /* CTA Button */
        .contact-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          font-family: 'Jost', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #FFFFFF;
          background: var(--ct-olive);
          border: none;
          border-radius: 100px;
          padding: 0.9rem 2rem;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(107,142,35,0.28);
          transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
          white-space: nowrap;
        }
        .contact-btn:hover {
          background: var(--ct-olive-deep);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(107,142,35,0.34);
        }
        .contact-btn a {
          color: inherit;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
        }
        .contact-btn svg { transition: transform 0.25s ease; }
        .contact-btn:hover svg { transform: translate(2px, -2px); }

        /* Title override */
        .contact-title-eyebrow {
          font-family: 'Jost', sans-serif;
          font-size: 0.75rem;
          font-weight: 400;
          letter-spacing: 0.04em;
          color: var(--text-secondary);
          margin-top: 0.5rem;
        }

        /* Entrance animations — quiet, once, on load */
        @keyframes fadeUp {
          from { opacity: 0; filter: blur(8px); transform: translateY(18px); }
          to   { opacity: 1; filter: blur(0); transform: translateY(0); }
        }
        .a1 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both 0.05s; }
        .a2 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both 0.2s; }

        @media (prefers-reduced-motion: reduce) {
          .a1, .a2 { animation: none !important; opacity: 1 !important; filter: none !important; transform: none !important; }
          .contact-img { transition: none !important; }
        }

        /* ── DARK MODE ── */
        html.dark-mode .contact-root {
          --ct-olive-deep: #A9C46C;
          --ct-glass-border: rgba(169,196,108,0.22);
        }
        html.dark-mode .contact-exclusive-wrap {
          background: #000000 !important;
        }
      `}</style>

      <div className="contact-root px-4 sm:px-6 md:px-16 lg:px-24 pt-8 sm:pt-10 pb-16 sm:pb-20">

        {/* ── TITLE ── */}
        <div className="text-center mb-12 sm:mb-16 a1">
          <Title text1="CONTACT" text2="US" />
          <p className="contact-title-eyebrow mt-3">
            We'd love to hear from you
          </p>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 items-center a2">

          {/* IMAGE */}
          <img
            src="/images/contact.webp"
            className="contact-img"
            alt="SLOG Fashion store"
            loading="eager"
            decoding="async"
          />

          {/* INFO */}
          <div>

            <p className="contact-eyebrow mb-1">Get in Touch</p>
            <div className="contact-rule" />
            <h2 className="contact-heading text-2xl sm:text-3xl mb-6">Our Store</h2>

            <div className="contact-info-item">
              <p className="contact-info-label">Address</p>
              <p className="contact-info-value">
                SLOG-FASHION<br />
                Kasaragod, Kerala, India
              </p>
            </div>

            <div className="contact-info-item">
              <p className="contact-info-label">Phone</p>
              <p className="contact-info-value">+91 8590993223</p>
            </div>

            <div className="contact-info-item">
              <p className="contact-info-label">Email</p>
              <p className="contact-info-value">slogfashion@gmail.com</p>
            </div>

            {/* Exclusives block */}
            <div className="contact-exclusive-wrap">
              <p className="contact-eyebrow mb-3" style={{ color: '#A9C46C' }}>Exclusives</p>
              <h2 className="contact-exclusive-title text-xl sm:text-2xl">
                SLOG-FASHION Exclusives
              </h2>
              <p className="contact-exclusive-body">
                Step into our signature collection of timeless fashion.
              </p>
              <button className="contact-btn w-full sm:w-auto justify-center">
                <Link to='/collection'>
                  Explore Our Collection
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 10 L10 2 M10 2 H4 M10 2 V8" />
                  </svg>
                </Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;