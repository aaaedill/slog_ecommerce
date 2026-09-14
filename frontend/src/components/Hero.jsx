import React from "react";
import hero_img from "../assets/hero_img.png";
import { Link } from "react-router-dom";

const HeroNew = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700;800&display=swap');

        .hn-root {
          --hn-blue:       #2F5DFF;
          --hn-blue-light: #6E8BFF;
          --hn-blue-deep:  #16307A;
          --hn-ink:        #10131F;
        }

        .hn-root *, .hn-root *::before, .hn-root *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }

        .hn-root {
          position: relative;
          width: 100%;
          min-height: 78vh;
          margin-top: 1rem;
          border-radius: 1.5rem;
          overflow: hidden;
          font-family: 'Jost', sans-serif;
          background: var(--hn-ink);
        }

        .hn-root img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
        }

        .hn-root::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to bottom, rgba(16,19,31,0.55) 0%, rgba(16,19,31,0.15) 30%, rgba(16,19,31,0.15) 60%, rgba(16,19,31,0.75) 100%);
          z-index: 1;
        }

        .hn-nav {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2rem 2.5rem 0;
        }

        .hn-brand {
          font-weight: 800;
          font-size: 1.1rem;
          letter-spacing: 0.02em;
          color: var(--hn-blue-light);
          text-transform: uppercase;
        }

        .hn-nav-cta {
          color: var(--hn-blue-light);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .hn-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          min-height: 62vh;
          padding: 2rem 1.5rem;
          gap: 1.6rem;
        }

        .hn-headline {
          font-weight: 800;
          font-size: clamp(2.8rem, 7vw, 6rem);
          line-height: 0.98;
          letter-spacing: -0.01em;
          color: var(--hn-blue-light);
          text-transform: none;
        }

        .hn-body {
          font-size: 1rem;
          font-weight: 500;
          color: var(--hn-blue-light);
          max-width: 40ch;
        }

        .hn-btn-primary {
          font-family: 'Jost', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--hn-blue-light);
          background: transparent;
          border: 1.5px solid var(--hn-blue-light);
          text-decoration: none;
          padding: 1rem 2.4rem;
          border-radius: 100px;
          display: inline-block;
          transition: background 0.25s, color 0.25s;
        }
        .hn-btn-primary:hover {
          background: var(--hn-blue-light);
          color: var(--hn-ink);
        }

        @media (max-width: 768px) {
          .hn-nav { padding: 1.5rem 1.5rem 0; }
          .hn-headline { font-size: 12vw; }
        }
      `}</style>

      <section className="hn-root">
        <img src={hero_img} alt="Hero" />

        <nav className="hn-nav">
          <div className="hn-brand">Menswear</div>
          <Link to="/collection" className="hn-nav-cta">Shop Now</Link>
        </nav>

        <div className="hn-content">
          <h1 className="hn-headline">
            Define<br />Your Style
          </h1>
          <p className="hn-body">
            Timeless craft meets the modern wardrobe.
          </p>
          <Link to="/collection" className="hn-btn-primary">Shop Now</Link>
        </div>
      </section>
    </>
  );
};

export default HeroNew;