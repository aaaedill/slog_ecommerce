import React from "react";
import { Title } from "../components/Title";
import { Link } from "react-router-dom";

const Contact = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

        .contact-root { font-family: 'Jost', sans-serif; }

        /* Contact image */
        .contact-img {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid #D4CCC0;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.76,0,0.24,1);
          display: block;
        }
        .contact-img:hover { transform: scale(1.02); }

        /* Section label */
        .contact-eyebrow {
          font-family: 'Jost', sans-serif;
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #8B6F5E;
        }

        /* Thin rule */
        .contact-rule {
          height: 1px;
          width: 3rem;
          background: linear-gradient(to right, #8B6F5E, transparent);
          margin: 0.6rem 0 1.2rem;
        }

        /* Section headings */
        .contact-heading {
          font-family: 'Fraunces', serif;
          font-weight: 300;
          color: #2C2825;
          line-height: 1.15;
        }

        /* Info text */
        .contact-info-label {
          font-family: 'Jost', sans-serif;
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #6B6058;
          margin-bottom: 0.3rem;
        }

        .contact-info-value {
          font-family: 'Jost', sans-serif;
          font-size: 0.98rem;
          font-weight: 300;
          color: #2C2825;
          line-height: 1.8;
        }

        /* Info item row */
        .contact-info-item {
          padding: 1rem 0;
          border-bottom: 1px solid #D4CCC0;
        }
        .contact-info-item:first-child { border-top: 1px solid #D4CCC0; }

        /* Exclusives block */
        .contact-exclusive-wrap {
          background: #2C2825;
          border-radius: 1rem;
          border: 1px solid #3D3532;
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
          background: radial-gradient(ellipse, rgba(139,111,94,0.15) 0%, transparent 65%);
          pointer-events: none;
        }

        .contact-exclusive-title {
          font-family: 'Fraunces', serif;
          font-weight: 300;
          font-style: italic;
          color: #F2EDE6;
          letter-spacing: 0.01em;
          margin-bottom: 0.5rem;
        }

        .contact-exclusive-body {
          font-family: 'Jost', sans-serif;
          font-size: 0.92rem;
          font-weight: 300;
          color: rgba(242,237,230,0.72);
          line-height: 1.8;
          margin-bottom: 1.5rem;
        }

        /* CTA Button */
        .contact-btn {
          display: inline-block;
          font-family: 'Jost', sans-serif;
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #2C2825;
          background: #EDE8E0;
          border: none;
          border-radius: 2px;
          padding: 0.85rem 2rem;
          cursor: pointer;
          transition: background 0.25s ease, transform 0.2s ease;
          white-space: nowrap;
        }
        .contact-btn:hover {
          background: #C9A96E;
          transform: translateY(-2px);
        }
        .contact-btn a {
          color: inherit;
          text-decoration: none;
        }

        /* Title override */
        .contact-title-eyebrow {
          font-family: 'Jost', sans-serif;
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #6B6058;
          margin-top: 0.5rem;
        }

        /* Entrance animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .a1 { animation: fadeUp 0.8s ease both 0.05s; }
        .a2 { animation: fadeUp 0.8s ease both 0.2s; }
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
              <p className="contact-eyebrow mb-3" style={{ color: '#C9A96E' }}>Exclusives</p>
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