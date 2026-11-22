import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Montserrat:wght@300;400;500;600&display=swap');

        .footer-root {
          font-family: 'Montserrat', sans-serif;

          /* LIGHT THEME */
          background: #5C6B3A;

          position: relative;
          overflow: hidden;

          color: #F5F1E6;
        }

        /* Brand name */
        .footer-brand {
          font-family: 'Playfair Display', serif;
          font-weight: 600;
          font-size: 1.35rem;

          color: #F8F4E8;

          letter-spacing: 0.04em;
          margin-bottom: 0.75rem;
        }

        .footer-brand-desc {
          font-size: 0.82rem;
          font-weight: 300;

          color: rgba(248, 244, 232, 0.72);

          line-height: 1.8;
        }

        /* Column heading */
        .footer-col-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.65rem;
          font-weight: 600;

          letter-spacing: 0.22em;
          text-transform: uppercase;

          color: rgba(248, 244, 232, 0.95);

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

          background: #DDE3D0;
          opacity: 0.8;
        }

        /* Nav links */
        .footer-link {
          display: block;

          font-size: 0.85rem;
          font-weight: 400;

          color: rgba(248, 244, 232, 0.68);

          text-decoration: none;

          transition:
            color 0.25s ease,
            padding-left 0.25s ease;

          padding: 0.3rem 0;
        }

        .footer-link:hover {
          color: #FFFFFF;
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

          opacity: 0.72;
        }

        .footer-contact-text {
          font-size: 0.85rem;
          font-weight: 400;

          color: rgba(248, 244, 232, 0.68);

          line-height: 1.5;

          transition: color 0.25s ease;
        }

        .footer-contact-item:hover .footer-contact-text {
          color: #FFFFFF;
        }

        /* Divider */
        .footer-divider {
          height: 1px;

          background: linear-gradient(
            to right,
            rgba(248, 244, 232, 0.20),
            rgba(248, 244, 232, 0.08),
            transparent
          );

          margin: 0;
        }

        /* Bottom bar */
        .footer-bottom-text {
          font-size: 0.75rem;
          font-weight: 400;

          color: rgba(248, 244, 232, 0.48);

          letter-spacing: 0.06em;
        }

        /* Olive accent dot */
        .footer-dot {
          width: 4px;
          height: 4px;

          border-radius: 50%;

          background: #DDE3D0;

          display: inline-block;

          margin: 0 0.5rem;

          vertical-align: middle;

          opacity: 0.65;
        }

        /* Small accent line */
        .footer-accent-line {
          width: 2rem;
          height: 1px;

          background: #DDE3D0;

          opacity: 0.65;
        }


        /* ==========================================
           DARK MODE
           ========================================== */

        html.dark-mode .footer-root {
          background: #202713;

          color: #EDE9DF;
        }

        html.dark-mode .footer-brand {
          color: #F3EFE3;
        }

        html.dark-mode .footer-brand-desc {
          color: rgba(237, 233, 223, 0.62);
        }

        html.dark-mode .footer-col-title {
          color: rgba(243, 239, 227, 0.92);
        }

        html.dark-mode .footer-col-title::after {
          background: #A3B07A;
          opacity: 0.75;
        }

        html.dark-mode .footer-link {
          color: rgba(237, 233, 223, 0.58);
        }

        html.dark-mode .footer-link:hover {
          color: #FFFFFF;
        }

        html.dark-mode .footer-contact-text {
          color: rgba(237, 233, 223, 0.58);
        }

        html.dark-mode .footer-contact-item:hover .footer-contact-text {
          color: #FFFFFF;
        }

        html.dark-mode .footer-divider {
          background: linear-gradient(
            to right,
            rgba(237, 233, 223, 0.14),
            rgba(237, 233, 223, 0.05),
            transparent
          );
        }

        html.dark-mode .footer-bottom-text {
          color: rgba(237, 233, 223, 0.38);
        }

        html.dark-mode .footer-dot {
          background: #A3B07A;
          opacity: 0.7;
        }

        html.dark-mode .footer-accent-line {
          background: #A3B07A;
          opacity: 0.65;
        }
      `}</style>

      <footer className="footer-root mt-20 w-full">

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

            <h2 className="footer-brand">
              SLOG FASHION
            </h2>

            <p className="footer-brand-desc max-w-xs mx-auto sm:mx-0">
              Discover premium fashion with Slog Fashion.
              Quality styles, modern trends, and the best
              shopping experience.
            </p>

            {/* Olive accent line */}
            <div className="mt-6 flex justify-center sm:justify-start">
              <div className="footer-accent-line" />
            </div>

          </div>


          {/* SHOP */}
          <div className="text-center sm:text-left">

            <h3 className="footer-col-title">
              Shop
            </h3>

            <ul className="mt-2 space-y-1">

              <li>
                <Link
                  to="/collection"
                  className="footer-link"
                >
                  Collection
                </Link>
              </li>

              <li>
                <Link
                  to="/"
                  className="footer-link"
                >
                  Latest Collection
                </Link>
              </li>

            </ul>

          </div>


          {/* COMPANY */}
          <div className="text-center sm:text-left">

            <h3 className="footer-col-title">
              Company
            </h3>

            <ul className="mt-2 space-y-1">

              <li>
                <Link
                  to="/about"
                  className="footer-link"
                >
                  About us
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="footer-link"
                >
                  Contact
                </Link>
              </li>

            </ul>

          </div>


          {/* CONTACT */}
          <div className="text-center sm:text-left">

            <h3 className="footer-col-title">
              Contact
            </h3>

            <div className="mt-2 space-y-1">

              <div className="footer-contact-item justify-center sm:justify-start">

                <span className="footer-contact-icon">
                  📞
                </span>

                <span className="footer-contact-text">
                  +91 8590993223
                </span>

              </div>


              <div className="footer-contact-item justify-center sm:justify-start">

                <span className="footer-contact-icon">
                  📧
                </span>

                <span className="footer-contact-text">
                  slogfashion@gmail.com
                </span>

              </div>


              <div className="footer-contact-item justify-center sm:justify-start">

                <span className="footer-contact-icon">
                  📍
                </span>

                <span className="footer-contact-text">
                  Kasaragod, Kerala, India
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* ── DIVIDER ── */}
        <div className="
          footer-divider
          mx-[5vw]
          sm:mx-[5vw]
          md:mx-[7vw]
          lg:mx-[9vw]
        " />


        {/* ── BOTTOM ── */}
        <div className="
          relative z-10
          px-[5vw]
          py-5
          flex
          flex-col
          sm:flex-row
          items-center
          justify-between
          gap-2
        ">

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