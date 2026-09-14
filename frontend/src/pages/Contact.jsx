import React from "react";
import { Title } from "../components/Title";
import { Link } from "react-router-dom";

const Contact = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&display=swap');

        .contact-root { font-family: 'Outfit', sans-serif; }

        /* Contact image */
        .contact-img {
          width: 100%;
          border-radius: 1.2rem;
          border: 1px solid rgba(47,93,255,0.14);
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.76,0,0.24,1);
          display: block;
        }
        .contact-img:hover { transform: scale(1.02); }

        /* Section label */
        .contact-eyebrow {
          font-family: 'Outfit', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #2F5DFF;
        }

        /* Thin rule */
        .contact-rule {
          height: 1px;
          width: 3rem;
          background: linear-gradient(to right, #2F5DFF, transparent);
          margin: 0.6rem 0 1.2rem;
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
          font-family: 'Outfit', sans-serif;
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 0.3rem;
        }

        .contact-info-value {
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          font-weight: 400;
          color: var(--text-primary);
          line-height: 1.8;
        }

        /* Info item row */
        .contact-info-item {
          padding: 1rem 0;
          border-bottom: 1px solid rgba(47,93,255,0.14);
        }
        .contact-info-item:first-child { border-top: 1px solid rgba(47,93,255,0.14); }

        /* Exclusives block */
        .contact-exclusive-wrap {
          background: #10131F;
          border-radius: 1.2rem;
          border: 1px solid rgba(110,139,255,0.18);
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
          background: radial-gradient(ellipse, rgba(47,93,255,0.18) 0%, transparent 65%);
          pointer-events: none;
        }

        .contact-exclusive-title {
          font-weight: 600;
          color: #FFFFFF;
          letter-spacing: -0.01em;
          margin-bottom: 0.5rem;
        }

        .contact-exclusive-body {
          font-family: 'Outfit', sans-serif;
          font-size: 0.92rem;
          font-weight: 400;
          color: rgba(255,255,255,0.72);
          line-height: 1.8;
          margin-bottom: 1.5rem;
        }

        /* CTA Button */
        .contact-btn {
          display: inline-block;
          font-family: 'Outfit', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: #FFFFFF;
          background: #2F5DFF;
          border: none;
          border-radius: 100px;
          padding: 0.9rem 2rem;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(47,93,255,0.28);
          transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
          white-space: nowrap;
        }
        .contact-btn:hover {
          background: #16307A;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(47,93,255,0.34);
        }
        .contact-btn a {
          color: inherit;
          text-decoration: none;
        }

        /* Title override */
        .contact-title-eyebrow {
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          font-weight: 400;
          letter-spacing: 0.04em;
          color: var(--text-secondary);
          margin-top: 0.5rem;
        }

        /* Entrance animations */
        @keyframes fadeUp {
          from { opacity: 0; filter: blur(8px); transform: translateY(18px); }
          to   { opacity: 1; filter: blur(0); transform: translateY(0); }
        }
        .a1 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both 0.05s; }
        .a2 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both 0.2s; }

        /* ── DARK MODE ── */
        html.dark-mode .contact-img {
          border-color: rgba(96,130,255,0.22) !important;
        }
        html.dark-mode .contact-info-item {
          border-bottom-color: rgba(96,130,255,0.20) !important;
        }
        html.dark-mode .contact-info-item:first-child {
          border-top-color: rgba(96,130,255,0.20) !important;
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
          <img src="/images/contact.jpg" className="contact-img" />

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
              <p className="contact-eyebrow mb-3" style={{ color: '#6E8BFF' }}>Exclusives</p>
              <h2 className="contact-exclusive-title text-xl sm:text-2xl">
                SLOG-FASHION Exclusives
              </h2>
              <p className="contact-exclusive-body">
                Step into our signature collection of timeless fashion.
              </p>
              <button className="contact-btn w-full sm:w-auto">
                <Link to='/collection'>
                  Explore Our Collection
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