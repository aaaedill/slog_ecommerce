import React, { useEffect, useRef } from "react";

const About = () => {
  const rootRef = useRef(null);

  /*
   * SCROLL-TRIGGERED REVEAL
   * Same gate pattern as LatestCollection: sections stay quiet
   * until they're actually on screen. The hero animates once on
   * mount instead, since it's already in view at load.
   */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = root.querySelectorAll(".ab-reveal");

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("ab-in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("ab-in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap');

        /* ────────────────────────────────────────────────
           TOKENS — shared with LatestCollection
        ──────────────────────────────────────────────── */
        .ab-root {
          --ab-bg:           var(--bg-primary);
          --ab-olive:        #6B8E23;
          --ab-olive-light:  #A9C46C;
          --ab-olive-deep:   #4B5320;
          --ab-ink:          #10131F;
          --ab-ink-muted:    rgba(16,19,31,0.55);
          --ab-glass-bg:     rgba(255,255,255,0.70);
          --ab-glass-hover:  rgba(255,255,255,0.92);
          --ab-glass-border: rgba(107,142,35,0.16);
          --ab-glass-shine:  rgba(255,255,255,0.85);

          font-family: 'Jost', sans-serif;
          background: var(--ab-bg);
          width: 100%;
        }

        .ab-eyebrow {
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ab-olive-deep);
        }

        .ab-rule {
          height: 1px;
          width: 2.75rem;
          background: linear-gradient(to right, var(--ab-olive), transparent);
          margin: 0.9rem 0 1.3rem;
        }

        .ab-heading {
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.15;
          color: var(--ab-ink);
        }

        .ab-heading em {
          font-style: normal;
          font-weight: 600;
          color: var(--ab-olive);
        }

        .ab-body {
          font-size: 0.95rem;
          font-weight: 400;
          line-height: 1.85;
          color: var(--ab-ink-muted);
        }

        /* ────────────────────────────────────────────────
           HERO — original layout, restyled
        ──────────────────────────────────────────────── */
        .about-hero {
          position: relative;
          overflow: hidden;
          border-radius: 1.2rem;
          background: var(--ab-ink);
        }

        .about-hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.06);
          transition: transform 1.1s cubic-bezier(0.16,1,0.3,1);
        }

        .about-hero:hover .about-hero-img {
          transform: scale(1.12);
        }

        .about-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(16,19,31,0.80) 0%, rgba(75,83,32,0.25) 60%);
          z-index: 1;
        }

        .about-eyebrow,
        .about-hero-title {
          position: relative;
          z-index: 2;
          opacity: 0;
          filter: blur(10px);
          transform: translateY(14px);
          animation: ab-blur-in 0.8s cubic-bezier(0.16,1,0.3,1) forwards;
        }

        .about-eyebrow {
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ab-olive-light);
          animation-delay: 0.15s;
        }

        .about-hero-title {
          font-weight: 600;
          letter-spacing: -0.01em;
          line-height: 1.1;
          color: #FFFFFF;
          transition: color 0.4s ease;
          animation-delay: 0.32s;
        }

        .about-hero:hover .about-hero-title {
          color: var(--ab-olive-light);
        }

        @keyframes ab-blur-in {
          to { opacity: 1; filter: blur(0); transform: translateY(0); }
        }

        /* ────────────────────────────────────────────────
           REVEAL GATE — below the fold
        ──────────────────────────────────────────────── */
        .ab-reveal {
          opacity: 0;
          filter: blur(8px);
          transform: translateY(18px);
          transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1),
                      filter 0.8s cubic-bezier(0.16,1,0.3,1),
                      transform 0.8s cubic-bezier(0.16,1,0.3,1);
        }
        .ab-reveal.ab-in-view {
          opacity: 1;
          filter: blur(0);
          transform: translateY(0);
        }

        /* ────────────────────────────────────────────────
           STORY
        ──────────────────────────────────────────────── */
        .about-story-img {
          border-radius: 1.1rem;
          border: 1px solid var(--ab-glass-border);
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }

        .about-story-img:hover { transform: scale(1.02); }

        .ab-pullquote {
          margin: 1.4rem 0;
          padding-left: 1.1rem;
          border-left: 2px solid var(--ab-olive);
          font-size: 1.05rem;
          font-weight: 500;
          line-height: 1.55;
          color: var(--ab-ink);
        }

        /* ────────────────────────────────────────────────
           MISSION — plain, centered, minimal
        ──────────────────────────────────────────────── */
        .ab-mission {
          text-align: center;
          max-width: 38rem;
          margin: 0 auto;
        }

        .ab-mission .ab-rule { margin-left: auto; margin-right: auto; }

        /* ────────────────────────────────────────────────
           WHY CHOOSE — glass cards, matching LatestCollection
        ──────────────────────────────────────────────── */
        .about-card {
          position: relative;
          background: var(--ab-glass-bg);
          border: 1px solid var(--ab-glass-border);
          border-radius: 1.1rem;
          padding: 2.6rem 2rem;
          text-align: center;
          overflow: hidden;
          backdrop-filter: blur(16px) saturate(1.6);
          -webkit-backdrop-filter: blur(16px) saturate(1.6);
          box-shadow: 0 1px 0 var(--ab-glass-shine) inset;
          transition: background 0.35s ease, border-color 0.35s ease,
                      transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease;
        }

        .about-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(to right, var(--ab-olive-deep), var(--ab-olive-light));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
        }

        .about-card:hover {
          background: var(--ab-glass-hover);
          border-color: rgba(107,142,35,0.30);
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(107,142,35,0.12), 0 1px 0 var(--ab-glass-shine) inset;
        }

        .about-card:hover::before { transform: scaleX(1); }

        .about-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--ab-glass-bg);
          border: 1px solid var(--ab-glass-border);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.2rem;
          font-size: 1rem;
          color: var(--ab-olive-deep);
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        .about-card:hover .about-card-icon {
          background: rgba(107,142,35,0.10);
          border-color: var(--ab-olive);
        }

        .about-card-title {
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--ab-ink);
          letter-spacing: -0.01em;
          margin-bottom: 0.7rem;
        }

        .about-card-body {
          font-size: 0.87rem;
          line-height: 1.8;
          color: var(--ab-ink-muted);
        }

        /* ────────────────────────────────────────────────
           REDUCED MOTION
        ──────────────────────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .about-eyebrow, .about-hero-title, .ab-reveal {
            animation: none !important; transition: none !important;
            opacity: 1 !important; filter: none !important; transform: none !important;
          }
          .about-hero-img { transform: none !important; }
        }

        /* ────────────────────────────────────────────────
           DARK MODE
        ──────────────────────────────────────────────── */
        html.dark-mode .ab-root {
          --ab-glass-bg: rgba(30,41,59,0.75);
          --ab-glass-hover: rgba(30,41,59,0.95);
          --ab-olive-deep: #A9C46C;
          --ab-ink: var(--text-primary);
          --ab-ink-muted: var(--text-secondary);
          --ab-glass-border: rgba(169,196,108,0.22);
          --ab-glass-shine: rgba(255,255,255,0.04);
        }
      `}</style>

      <div className="ab-root px-4 sm:px-6 md:px-16 lg:px-24 mt-6 sm:mt-8" ref={rootRef}>

        {/* ── HERO ── */}
        <div className="about-hero relative h-[250px] sm:h-[350px] md:h-[440px] flex flex-col items-center justify-center gap-3">
          <img src="/images/about.jpg" className="about-hero-img" alt="SLOG Fashion" />
          <p className="about-eyebrow">Est. 2021</p>
          <h1 className="about-hero-title text-3xl sm:text-5xl md:text-6xl text-center px-4">
            About SLOG Fashion
          </h1>
        </div>

        {/* ── STORY ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center mt-16 md:mt-20 ab-reveal">
          <img src="/images/about2.jpg" className="about-story-img" alt="Craftsmanship at SLOG" />
          <div>
            <p className="ab-eyebrow">Our Story</p>
            <div className="ab-rule" />
            <h2 className="ab-heading text-2xl sm:text-3xl md:text-4xl mb-4">
              Redefining <em>Men's Fashion</em>
            </h2>
            <p className="ab-body mb-1">
              SLOG Fashion was created to redefine modern men's fashion.
              We believe style is not just clothing — it's identity,
              confidence, and expression.
            </p>
            <p className="ab-pullquote">
              Every collection is designed for men who want to stand
              out, stay comfortable, and wear premium fashion every day.
            </p>
            <p className="ab-body">
              From everyday hoodies to elegant shirts, each piece is
              crafted with precision, passion, and purpose.
            </p>
          </div>
        </div>

        {/* ── MISSION ── */}
        <div className="mt-16 md:mt-20 ab-reveal">
          <div className="ab-mission">
            <p className="ab-eyebrow">What Drives Us</p>
            <div className="ab-rule" />
            <h2 className="ab-heading text-2xl sm:text-3xl mb-4">Our Mission</h2>
            <p className="ab-body">
              To provide high-quality fashion that combines comfort,
              style, and affordability — so every man can feel confident
              and bold in what he wears.
            </p>
          </div>
        </div>

        {/* ── WHY CHOOSE US ── */}
        <div className="mt-16 md:mt-20 mb-16 md:mb-24">
          <div className="text-center mb-10 ab-reveal">
            <p className="ab-eyebrow">Why Us</p>
            <div className="ab-rule" style={{ margin: "0.9rem auto 0" }} />
            <h2 className="ab-heading text-2xl sm:text-3xl mt-4">Why Choose SLOG</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 ab-reveal">
            <div className="about-card">
              <div className="about-card-icon">⭑</div>
              <h3 className="about-card-title">Premium Quality</h3>
              <p className="about-card-body">Crafted with the finest fabrics for durability, comfort, and long-lasting style.</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon">✦</div>
              <h3 className="about-card-title">Modern Design</h3>
              <p className="about-card-body">Latest fashion trends thoughtfully designed for the modern, confident man.</p>
            </div>
            <div className="about-card">
              <div className="about-card-icon">◈</div>
              <h3 className="about-card-title">Affordable Price</h3>
              <p className="about-card-body">Premium fashion made accessible — because great style shouldn't cost a fortune.</p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default About;