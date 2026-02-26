import React from "react";
import hero_img from "../assets/hero_img.png";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Montserrat:wght@200;300;400;500&display=swap');

        .hero-root {
          font-family: 'Montserrat', sans-serif;
          position: relative;
          background: #0c0c0c;
          overflow: hidden;
        }

        /* Ambient red glow — right side behind image */
        .hero-root::before {
          content: '';
          position: absolute;
          top: -10%;
          right: -5%;
          width: 55%;
          height: 120%;
          background: radial-gradient(ellipse at center, rgba(185,28,28,0.13) 0%, transparent 68%);
          pointer-events: none;
          z-index: 0;
        }

        /* Subtle left corner accent */
        .hero-root::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 35%;
          height: 60%;
          background: radial-gradient(ellipse at bottom left, rgba(185,28,28,0.07) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }

        /* Noise grain */
        .hero-grain {
          position: absolute;
          inset: -100px;
          width: calc(100% + 200px);
          height: calc(100% + 200px);
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          opacity: 0.5;
          pointer-events: none;
          z-index: 0;
        }

        /* Thin vertical rule */
        .hero-rule {
          position: absolute;
          top: 12%;
          left: 50%;
          width: 1px;
          height: 76%;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 75%, transparent);
          pointer-events: none;
          z-index: 0;
        }

        .hero-inner { position: relative; z-index: 1; }

        /* Eyebrow */
        .eyebrow-text {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.6rem;
          font-weight: 300;
          letter-spacing: 0.32em;
          color: rgba(255,255,255,0.38);
          text-transform: uppercase;
          transition: color 0.4s ease;
          cursor: pointer;
        }
        .eyebrow-text:hover { color: #dc2626; }

        .eyebrow-line {
          height: 1px;
          background: linear-gradient(to right, rgba(255,255,255,0.25), transparent);
          flex-shrink: 0;
        }

        /* Main heading */
        .hero-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          color: #f0ece6;
          line-height: 0.9;
          letter-spacing: -0.015em;
          transition: color 0.5s ease;
          cursor: default;
        }
        .hero-h1:hover { color: #b91c1c; }

        /* Ghost second line */
        .hero-h1-ghost {
          font-family: 'Cormorant Garamond', serif;
          font-style: normal;
          font-weight: 300;
          -webkit-text-stroke: 1px rgba(255,255,255,0.18);
          color: transparent;
          line-height: 0.9;
          letter-spacing: -0.015em;
          display: block;
        }

        /* Descriptor */
        .hero-descriptor {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.6rem;
          font-weight: 200;
          letter-spacing: 0.28em;
          color: rgba(255,255,255,0.16);
          text-transform: uppercase;
        }

        /* Shop now */
        .shop-cta {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.65rem;
          font-weight: 400;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .shop-group:hover .shop-cta { color: #dc2626; }

        .shop-line {
          height: 1px;
          width: 2rem;
          background: rgba(255,255,255,0.25);
          transition: width 0.45s cubic-bezier(0.76,0,0.24,1), background 0.3s ease;
          flex-shrink: 0;
        }
        .shop-group:hover .shop-line {
          width: 4.5rem;
          background: #dc2626;
        }

        /* Season badge */
        .season-badge {
          font-family: 'Montserrat', sans-serif;
          font-weight: 200;
          font-size: 0.5rem;
          letter-spacing: 0.22em;
          color: rgba(255,255,255,0.14);
          writing-mode: vertical-rl;
          text-transform: uppercase;
          position: absolute;
          top: 50%;
          left: 1.25rem;
          transform: translateY(-50%);
          z-index: 1;
        }

        /* Scroll hint */
        .scroll-hint {
          position: absolute;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          opacity: 0.22;
          z-index: 1;
        }
        .scroll-hint span {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.48rem;
          letter-spacing: 0.28em;
          color: white;
          text-transform: uppercase;
        }
        .scroll-tick {
          width: 1px;
          height: 1.6rem;
          background: linear-gradient(to bottom, white, transparent);
          animation: tickPulse 2.2s ease-in-out infinite;
        }
        @keyframes tickPulse {
          0%,100% { opacity: 1; transform: scaleY(1); }
          50%      { opacity: 0.3; transform: scaleY(0.5); }
        }

        /* Entrance animations */
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .a1 { animation: riseIn 1s ease both; animation-delay: 0.05s; }
        .a2 { animation: riseIn 1s ease both; animation-delay: 0.22s; }
        .a3 { animation: riseIn 1s ease both; animation-delay: 0.42s; }
        .a4 { animation: riseIn 1s ease both; animation-delay: 0.6s; }
        .a5 { animation: riseIn 1.1s ease both; animation-delay: 0.15s; }

        /* ── Full-bleed image panel ── */
        .hero-img-side {
          position: absolute;
          top: 0;
          right: 0;
          width: 50%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
        }
        .hero-img-side img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          filter: brightness(0.82) contrast(1.05) saturate(0.9);
          transform: scale(1.04);
          transition: transform 9s ease;
        }
        .hero-root:hover .hero-img-side img {
          transform: scale(1.0);
        }
        /* smooth left-edge blend into dark bg */
        .hero-img-side::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, #0c0c0c 0%, rgba(12,12,12,0.5) 28%, transparent 60%);
          z-index: 1;
          pointer-events: none;
        }
        /* top / bottom fade */
        .hero-img-side::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, #0c0c0c 0%, transparent 14%, transparent 84%, #0c0c0c 100%);
          z-index: 1;
          pointer-events: none;
        }
        /* red glow layer over image */
        .hero-img-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 70% 50%, rgba(185,28,28,0.11) 0%, transparent 65%);
          z-index: 2;
          pointer-events: none;
        }
      `}</style>

      <section className="
        hero-root
        w-full
        mt-6 sm:mt-8 md:mt-10
        rounded-none sm:rounded-xl
        min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh]
        flex items-center
        overflow-hidden
      ">
        <div className="hero-grain" aria-hidden="true" />
        <div className="hero-rule" aria-hidden="true" />
        <span className="season-badge hidden sm:block" aria-hidden="true">SS 2025</span>

        {/* Full-bleed right half image — desktop only */}
        <div className="hero-img-side a5 hidden sm:block" aria-hidden="true">
          <img src={hero_img} alt="" />
          <div className="hero-img-glow" />
        </div>

        <div className="
          hero-inner
          w-full
          flex
          flex-col sm:flex-row
          items-center
          justify-between
          px-4 sm:px-8 md:px-12 lg:px-24
          py-8 sm:py-12
          gap-8 sm:gap-6
        ">

          {/* LEFT */}
          <div className="flex-1 text-center sm:text-left">

            {/* Small heading */}
            <div className="a1 flex items-center justify-center sm:justify-start gap-4 mb-4 sm:mb-6">
              <div className="eyebrow-line w-8 sm:w-10" />
              <p className="eyebrow-text cursor-pointer">
                New Collection
              </p>
            </div>

            {/* Main Heading */}
            <div className="a2 mb-3 sm:mb-4">
              <h1 className="
                hero-h1
                text-[2.8rem]
                sm:text-[4.5rem]
                md:text-[5.5rem]
                lg:text-[6.5rem]
              ">
                Luxury
                <span className="
                  hero-h1-ghost
                  text-[2.8rem]
                  sm:text-[4.5rem]
                  md:text-[5.5rem]
                  lg:text-[6.5rem]
                ">Fashion</span>
              </h1>
            </div>

            {/* Descriptor */}
            <p className="a3 hero-descriptor mb-6 sm:mb-10">
              Curated &nbsp;·&nbsp; Timeless &nbsp;·&nbsp; Refined
            </p>

            {/* Shop Now */}
            <div className="a4 shop-group flex items-center justify-center sm:justify-start gap-4 cursor-pointer">
              <p>
                <Link to='/collection' className="shop-cta">
                  Shop now
                </Link>
              </p>
              <div className="shop-line" />
            </div>
          </div>

          {/* Mobile image (original behaviour) */}
          <div className="a5 flex-1 flex justify-center sm:hidden mt-4">
            <div className="w-[75%]">
              <img
                src={hero_img}
                alt=""
                className="w-full object-contain rounded-xl opacity-80"
              />
            </div>
          </div>

          {/* Desktop spacer — keeps left content left-aligned */}
          <div className="flex-1 hidden sm:block" aria-hidden="true" />
        </div>
      </section>
    </>
  );
};

export default Hero;