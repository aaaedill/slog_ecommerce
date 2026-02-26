import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Montserrat:wght@300;400;500;600&display=swap');

        .footer-root {
          font-family: 'Montserrat', sans-serif;
          background: #0a0a0a;
          position: relative;
          overflow: hidden;
        }

        /* Subtle ambient glow top-left */
        .footer-root::before {
          content: '';
          position: absolute;
          top: -20%;
          left: -5%;
          width: 40%;
          height: 80%;
          background: radial-gradient(ellipse, rgba(185,28,28,0.08) 0%, transparent 65%);
          pointer-events: none;
        }

        /* Brand name */
        .footer-brand {
          font-family: 'Playfair Display', serif;
          font-weight: 600;
          font-size: 1.35rem;
          color: #f5f0eb;
          letter-spacing: 0.04em;
          margin-bottom: 0.75rem;
        }

        .footer-brand-desc {
          font-size: 0.82rem;
          font-weight: 300;
          color: rgba(255,255,255,0.5);
          line-height: 1.8;
        }

        /* Column heading */
        .footer-col-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.9);
          margin-bottom: 1.25rem;
          position: relative;
          display: inline-block;
        }
        .footer-col-title::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -5px;
          width: 1.5rem;
          height: 1px;
          background: #dc2626;
        }

        /* Nav links */
        .footer-link {
          display: block;
          font-size: 0.85rem;
          font-weight: 400;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          transition: color 0.25s ease, padding-left 0.25s ease;
          padding: 0.3rem 0;
        }
        .footer-link:hover {
          color: #fff;
          padding-left: 4px;
        }

        /* Contact info items */
        .footer-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          padding: 0.3rem 0;
        }
        .footer-contact-icon {
          font-size: 0.75rem;
          margin-top: 0.15rem;
          flex-shrink: 0;
          opacity: 0.6;
        }
        .footer-contact-text {
          font-size: 0.85rem;
          font-weight: 400;
          color: rgba(255,255,255,0.5);
          line-height: 1.5;
          transition: color 0.25s ease;
        }
        .footer-contact-item:hover .footer-contact-text { color: #fff; }

        /* Divider */
        .footer-divider {
          height: 1px;
          background: linear-gradient(to right, rgba(255,255,255,0.08), rgba(255,255,255,0.04), transparent);
          margin: 0;
        }

        /* Bottom bar */
        .footer-bottom-text {
          font-size: 0.75rem;
          font-weight: 400;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.06em;
        }

        /* Red dot accent */
        .footer-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #dc2626;
          display: inline-block;
          margin: 0 0.5rem;
          vertical-align: middle;
          opacity: 0.7;
        }
      `}</style>

      <footer className="footer-root mt-20 w-full text-white">

        {/* ── TOP ── */}
        <div className="
          relative z-10
          px-[5vw] sm:px-[5vw] md:px-[7vw] lg:px-[9vw]
          pt-14 sm:pt-16 pb-12
          grid
          grid-cols-1 sm:grid-cols-2 md:grid-cols-4
          gap-10 sm:gap-12
        ">

          {/* BRAND */}
          <div className="text-center sm:text-left sm:col-span-2 md:col-span-1">
            <h2 className="footer-brand">SLOG FASHION</h2>
            <p className="footer-brand-desc max-w-xs mx-auto sm:mx-0">
              Discover premium fashion with Slog Fashion.
              Quality styles, modern trends, and the best
              shopping experience.
            </p>

            {/* Red accent line */}
            <div className="mt-6 flex justify-center sm:justify-start">
              <div style={{width:'2rem', height:'1px', background:'#dc2626', opacity:0.5}} />
            </div>
          </div>

          {/* SHOP */}
          <div className="text-center sm:text-left">
            <h3 className="footer-col-title">Shop</h3>
            <ul className="mt-2 space-y-1">
              <li>
                <Link to="/collection" className="footer-link">Collection</Link>
              </li>
              <li>
                <Link to="/" className="footer-link">Latest Collection</Link>
              </li>
            </ul>
          </div>

          {/* COMPANY */}
          <div className="text-center sm:text-left">
            <h3 className="footer-col-title">Company</h3>
            <ul className="mt-2 space-y-1">
              <li>
                <Link to="/about" className="footer-link">About us</Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">Contact</Link>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div className="text-center sm:text-left">
            <h3 className="footer-col-title">Contact</h3>
            <div className="mt-2 space-y-1">
              <div className="footer-contact-item justify-center sm:justify-start">
                <span className="footer-contact-icon">📞</span>
                <span className="footer-contact-text">+91 8590993223</span>
              </div>
              <div className="footer-contact-item justify-center sm:justify-start">
                <span className="footer-contact-icon">📧</span>
                <span className="footer-contact-text">slogfashion@gmail.com</span>
              </div>
              <div className="footer-contact-item justify-center sm:justify-start">
                <span className="footer-contact-icon">📍</span>
                <span className="footer-contact-text">Kasaragod, Kerala, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="footer-divider mx-[5vw] sm:mx-[5vw] md:mx-[7vw] lg:mx-[9vw]" />

        {/* ── BOTTOM ── */}
        <div className="relative z-10 px-[5vw] py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="footer-bottom-text">
            © 2026 SLOG-FASHION
            <span className="footer-dot" />
            All Rights Reserved
          </p>
          <p className="footer-bottom-text">
            Crafted with precision
            <span className="footer-dot" />
            Kerala, India
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;