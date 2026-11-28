import React, { useState, useEffect, useRef } from "react";

const SlogStandard = () => {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  const standards = [
    {
      number: "01",
      icon: "gem",
      title: "Quality First",
      description:
        "Thoughtful attention to materials, craftsmanship and the little details that matter."
    },
    {
      number: "02",
      icon: "shirt",
      title: "Everyday Comfort",
      description:
        "Clothing designed to feel as good as it looks, wherever the day takes you."
    },
    {
      number: "03",
      icon: "sparkles",
      title: "Timeless Style",
      description:
        "A distinctive approach to fashion that goes beyond temporary trends."
    },
    {
      number: "04",
      icon: "heart",
      title: "Customer First",
      description:
        "A shopping experience built around your needs, confidence and satisfaction."
    }
  ];

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
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const renderIcon = (icon) => {
    const commonProps = {
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.4",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true
    };

    switch (icon) {
      case "gem":
        return (
          <svg {...commonProps}>
            <path d="M6 3h12l4 6-10 12L2 9l4-6Z" />
            <path d="M2 9h20M12 21 8 9l4-6 4 6-4 12" />
          </svg>
        );

      case "shirt":
        return (
          <svg {...commonProps}>
            <path d="m16 4 5 3-3 5-3-2v10H9V10l-3 2-3-5 5-3c1 1 2.5 2 4 2s3-.7 4-2Z" />
          </svg>
        );

      case "sparkles":
        return (
          <svg {...commonProps}>
            <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" />
            <path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z" />
            <path d="m5 2 .8 2.2L8 5l-2.2.8L5 8l-.8-2.2L2 5l2.2-.8L5 2Z" />
          </svg>
        );

      case "heart":
        return (
          <svg {...commonProps}>
            <path d="M20.8 8.7c0 5.5-8.8 11-8.8 11S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.3a4.7 4.7 0 0 1 8.8 2.4Z" />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&family=Prata&display=swap');

        /* =====================================================
           SECTION
        ===================================================== */

        .slog-standard,
        .slog-standard * {
          box-sizing: border-box;
        }

        .slog-standard {
          position: relative;
          isolation: isolate;
          width: 100vw;
          max-width: 100vw;
          margin: 0 0 0 calc(50% - 50vw);
          padding: clamp(60px, 8vw, 84px) 7% 0;
          overflow: hidden;
          background: #171914;
          color: #FFFFFF;
          font-family: 'Jost', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* =====================================================
           BACKGROUND IMAGE (SOFT BLUR + SETTLE-IN)
        ===================================================== */

        .slog-standard::before {
          content: "";
          position: absolute;
          inset: -20px;
          z-index: -2;
          background-image: url("/slog-standard-bg.png");
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          filter: blur(6px);
          transform: scale(1.1);
        }

        /* settle in, then drift slowly forever (Ken Burns) */
        .slog-standard.is-visible::before {
          animation:
            ssBgSettle 2.2s cubic-bezier(0.22, 1, 0.36, 1) forwards,
            ssBgDrift 26s ease-in-out 2.2s infinite alternate;
        }

        /* soft moving light over the image */
        .ss-glow {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
          opacity: 0;
          transition: opacity 2s ease 0.4s;
        }

        .slog-standard.is-visible .ss-glow {
          opacity: 1;
        }

        .ss-glow::before,
        .ss-glow::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          will-change: transform;
        }

        .ss-glow::before {
          width: 55vmax;
          height: 55vmax;
          top: -25vmax;
          left: -15vmax;
          background: radial-gradient(circle, rgba(180, 192, 120, 0.2), transparent 65%);
          animation: ssGlowA 16s ease-in-out infinite alternate;
        }

        .ss-glow::after {
          width: 45vmax;
          height: 45vmax;
          right: -20vmax;
          bottom: -22vmax;
          background: radial-gradient(circle, rgba(135, 146, 90, 0.18), transparent 65%);
          animation: ssGlowB 20s ease-in-out infinite alternate;
        }

        .slog-standard::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background:
            linear-gradient(
              135deg,
              rgba(10, 12, 7, 0.78),
              rgba(15, 18, 10, 0.68),
              rgba(8, 10, 6, 0.82)
            );
        }

        .slog-standard-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
        }

        /* =====================================================
           ANIMATIONS
        ===================================================== */

        .ss-reveal {
          opacity: 0;
          translate: 0 16px;
        }

        .slog-standard.is-visible .ss-reveal {
          animation: ssReveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: var(--d, 0s);
        }

        @keyframes ssReveal {
          to {
            opacity: 1;
            translate: 0 0;
          }
        }

        @keyframes ssBgSettle {
          to {
            transform: scale(1.02);
          }
        }

        @keyframes ssBgDrift {
          from { transform: scale(1.02) translate3d(0, 0, 0); }
          to   { transform: scale(1.09) translate3d(-1.5%, -1%, 0); }
        }

        @keyframes ssGlowA {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(14vmax, 8vmax, 0); }
        }

        @keyframes ssGlowB {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-12vmax, -9vmax, 0); }
        }

        @keyframes ssLine {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .slog-standard-header {
          max-width: 480px;
          margin: 0 auto clamp(30px, 4.5vw, 44px);
          text-align: center;
        }

        .slog-standard-eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 14px;
          color: #B4C078;
          font-size: 0.56rem;
          font-weight: 500;
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }

        .slog-standard-eyebrow::before,
        .slog-standard-eyebrow::after {
          content: "";
          width: 26px;
          height: 1px;
          background: #87925A;
          transform: scaleX(0);
        }

        .slog-standard-eyebrow::before { transform-origin: right; }
        .slog-standard-eyebrow::after  { transform-origin: left; }

        .slog-standard.is-visible .slog-standard-eyebrow::before,
        .slog-standard.is-visible .slog-standard-eyebrow::after {
          animation: ssLine 0.9s 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .slog-standard-heading {
          margin: 0;
          color: #FFFFFF;
          font-family: 'Prata', serif;
          font-size: clamp(1.55rem, 2.9vw, 2.3rem);
          font-weight: 400;
          line-height: 1.22;
          letter-spacing: -0.025em;
        }

        .slog-standard-heading span {
          color: #B4C078;
        }

        .slog-standard-intro {
          max-width: 340px;
          margin: 12px auto 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.74rem;
          font-weight: 300;
          line-height: 1.8;
          letter-spacing: 0.03em;
          text-wrap: balance;
        }

        /* =====================================================
           GRID
        ===================================================== */

        .slog-standard-grid {
          position: relative;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        /* top + bottom rules draw in from the left */
        .slog-standard-grid::before,
        .slog-standard-grid::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.2);
          transform: scaleX(0);
          transform-origin: left;
        }

        .slog-standard-grid::before { top: 0; }
        .slog-standard-grid::after  { bottom: 0; }

        .slog-standard.is-visible .slog-standard-grid::before,
        .slog-standard.is-visible .slog-standard-grid::after {
          animation: ssLine 1.4s 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .slog-standard-item {
          position: relative;
          min-width: 0;
          padding: clamp(24px, 2.6vw, 30px) clamp(16px, 2vw, 22px) clamp(26px, 2.8vw, 32px);
          transition: background 0.35s ease, transform 0.35s ease;
        }

        .slog-standard-item + .slog-standard-item {
          border-left: 1px solid rgba(255, 255, 255, 0.14);
        }

        @media (hover: hover) {
          .slog-standard-item:hover {
            background: rgba(255, 255, 255, 0.05);
            transform: translateY(-3px);
          }
        }

        .slog-standard-number {
          display: block;
          margin-bottom: 16px;
          color: rgba(255, 255, 255, 0.45);
          font-size: 0.56rem;
          font-weight: 400;
          letter-spacing: 0.16em;
        }

        .slog-standard-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          margin-bottom: 15px;
          color: #B4C078;
          border: 1px solid rgba(180, 192, 120, 0.4);
          border-radius: 50%;
          transition: background 0.3s ease, color 0.3s ease;
        }

        .slog-standard-icon svg {
          width: 17px;
          height: 17px;
        }

        @media (hover: hover) {
          .slog-standard-item:hover .slog-standard-icon {
            background: #B4C078;
            color: #171914;
          }
        }

        .slog-standard-title {
          margin: 0;
          color: #FFFFFF;
          font-family: 'Prata', serif;
          font-size: 0.92rem;
          font-weight: 400;
          line-height: 1.4;
        }

        .slog-standard-description {
          max-width: 200px;
          margin: 8px 0 0;
          color: rgba(255, 255, 255, 0.68);
          font-size: 0.7rem;
          font-weight: 300;
          line-height: 1.75;
          letter-spacing: 0.015em;
          overflow-wrap: break-word;
          text-wrap: pretty;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .slog-standard-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 24px;
          padding-bottom: 20px;
          color: #B4C078;
          font-size: 0.54rem;
          font-weight: 500;
          letter-spacing: 0.24em;
          text-align: center;
        }

        .slog-standard-footer-line {
          flex-shrink: 0;
          width: 22px;
          height: 1px;
          background: rgba(180, 192, 120, 0.55);
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 900px) {
          .slog-standard {
            padding: 64px 6% 0;
          }

          .slog-standard-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .slog-standard-item {
            padding: 24px 20px 26px;
          }

          .slog-standard-description {
            max-width: 240px;
          }

          .slog-standard-item:nth-child(3) {
            border-left: none;
          }

          .slog-standard-item:nth-child(n + 3) {
            border-top: 1px solid rgba(255, 255, 255, 0.14);
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 600px) {
          .slog-standard {
            padding: 46px 18px 0;
          }

          .slog-standard-header {
            margin-bottom: 26px;
          }

          .slog-standard-eyebrow {
            gap: 8px;
            margin-bottom: 11px;
            font-size: 0.52rem;
            letter-spacing: 0.22em;
          }

          .slog-standard-eyebrow::before,
          .slog-standard-eyebrow::after {
            width: 16px;
          }

          .slog-standard-heading {
            font-size: clamp(1.4rem, 6.6vw, 1.8rem);
          }

          .slog-standard-intro {
            max-width: 280px;
            margin-top: 10px;
            font-size: 0.68rem;
            line-height: 1.7;
          }

          .slog-standard-item {
            padding: 18px 12px 20px;
          }

          .slog-standard-number {
            margin-bottom: 11px;
            font-size: 0.5rem;
          }

          .slog-standard-icon {
            width: 32px;
            height: 32px;
            margin-bottom: 11px;
          }

          .slog-standard-icon svg {
            width: 15px;
            height: 15px;
          }

          .slog-standard-title {
            font-size: 0.8rem;
          }

          .slog-standard-description {
            max-width: 100%;
            margin-top: 6px;
            font-size: 0.62rem;
            line-height: 1.65;
            letter-spacing: 0.01em;
          }

          .slog-standard-footer {
            margin-top: 18px;
            padding-bottom: 16px;
            gap: 7px;
            font-size: 0.48rem;
            letter-spacing: 0.13em;
          }

          .slog-standard-footer-line {
            width: 14px;
          }
        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 360px) {
          .slog-standard {
            padding-left: 14px;
            padding-right: 14px;
          }

          .slog-standard-item {
            padding-left: 9px;
            padding-right: 9px;
          }

          .slog-standard-title {
            font-size: 0.74rem;
          }

          .slog-standard-description {
            font-size: 0.58rem;
          }

          .slog-standard-footer {
            font-size: 0.44rem;
            letter-spacing: 0.08em;
          }
        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {
          .slog-standard::before,
          .slog-standard.is-visible::before {
            animation: none;
            transform: scale(1.02);
          }

          .slog-standard .ss-glow::before,
          .slog-standard .ss-glow::after {
            animation: none;
          }

          .slog-standard .ss-reveal,
          .slog-standard.is-visible .ss-reveal {
            animation: none;
            opacity: 1;
            translate: 0 0;
          }

          .slog-standard .slog-standard-eyebrow::before,
          .slog-standard .slog-standard-eyebrow::after,
          .slog-standard .slog-standard-grid::before,
          .slog-standard .slog-standard-grid::after,
          .slog-standard.is-visible .slog-standard-eyebrow::before,
          .slog-standard.is-visible .slog-standard-eyebrow::after,
          .slog-standard.is-visible .slog-standard-grid::before,
          .slog-standard.is-visible .slog-standard-grid::after {
            animation: none;
            transform: none;
          }

          .slog-standard-item,
          .slog-standard-icon {
            transition: none;
          }
        }
      `}</style>

      <section
        ref={sectionRef}
        className={`slog-standard${inView ? " is-visible" : ""}`}
        aria-labelledby="slog-standard-heading"
      >
        {/* ANIMATED LIGHT OVER BACKGROUND */}
        <div className="ss-glow" aria-hidden="true"></div>

        <div className="slog-standard-inner">
          {/* SECTION HEADER */}
          <div className="slog-standard-header">
            <div
              className="slog-standard-eyebrow ss-reveal"
              style={{ "--d": "0.1s" }}
            >
              The Slog Standard
            </div>

            <h2
              id="slog-standard-heading"
              className="slog-standard-heading ss-reveal"
              style={{ "--d": "0.25s" }}
            >
              Style Beyond <span>Trends.</span>
            </h2>

            <p
              className="slog-standard-intro ss-reveal"
              style={{ "--d": "0.4s" }}
            >
              The details that define everything we do.
              Discover the principles behind the Slog identity.
            </p>
          </div>

          {/* STANDARDS GRID */}
          <div className="slog-standard-grid">
            {standards.map((standard, index) => (
              <div
                className="slog-standard-item ss-reveal"
                style={{ "--d": `${0.6 + index * 0.14}s` }}
                key={standard.number}
              >
                <span className="slog-standard-number">
                  {standard.number}
                </span>

                <div className="slog-standard-icon">
                  {renderIcon(standard.icon)}
                </div>

                <h3 className="slog-standard-title">{standard.title}</h3>

                <p className="slog-standard-description">
                  {standard.description}
                </p>
              </div>
            ))}
          </div>

          {/* FOOTER STATEMENT */}
          <div
            className="slog-standard-footer ss-reveal"
            style={{ "--d": "1.3s" }}
          >
            <span className="slog-standard-footer-line"></span>
            SLOG — MADE FOR YOUR EVERYDAY
            <span className="slog-standard-footer-line"></span>
          </div>
        </div>
      </section>
    </>
  );
};

export default SlogStandard;