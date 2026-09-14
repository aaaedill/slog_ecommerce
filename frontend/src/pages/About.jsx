import React from "react";

const About = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&display=swap');

        .about-root { font-family: 'Outfit', sans-serif; }

        /* Hero */
        .about-hero-img {
          position: absolute;
          width: 100%; height: 100%;
          object-fit: cover;
          opacity: 0.55;
          transition: transform 0.8s cubic-bezier(0.76,0,0.24,1);
          cursor: pointer;
        }
        .about-hero:hover .about-hero-img { transform: scale(1.05); }

        .about-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(16,19,31,0.75) 0%, rgba(16,19,31,0.2) 60%);
          z-index: 1;
        }

        .about-hero-title {
          font-weight: 700;
          color: #FFFFFF;
          letter-spacing: -0.01em;
          line-height: 1.1;
          transition: color 0.4s ease;
          cursor: pointer;
          position: relative;
          z-index: 2;
        }
        .about-hero-title:hover { color: #6E8BFF; }

        .about-eyebrow {
          font-family: 'Outfit', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #6E8BFF;
          position: relative;
          z-index: 2;
        }

        /* Section headings */
        .about-section-title {
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          line-height: 1.15;
        }
        .about-section-title em {
          font-style: normal;
          font-weight: 600;
          color: #2F5DFF;
        }

        /* Body text */
        .about-body {
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          font-weight: 400;
          color: var(--text-secondary);
          line-height: 1.85;
        }

        /* Story image */
        .about-story-img {
          border-radius: 1.2rem;
          border: 1px solid rgba(47,93,255,0.14);
          width: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.76,0,0.24,1);
        }
        .about-story-img:hover { transform: scale(1.02); }

        /* Thin rule */
        .about-rule {
          height: 1px;
          background: linear-gradient(to right, #2F5DFF, transparent);
          margin: 0.75rem 0 1.5rem;
          width: 3rem;
        }

        /* Mission block */
        .about-mission-wrap {
          position: relative;
          background: #10131F;
          border-radius: 1.2rem;
          border: 1px solid rgba(110,139,255,0.18);
          overflow: hidden;
          padding: 3.5rem 2rem;
        }
        .about-mission-wrap::before {
          content: '';
          position: absolute;
          top: -20%; left: -10%;
          width: 55%; height: 140%;
          background: radial-gradient(ellipse, rgba(47,93,255,0.18) 0%, transparent 65%);
          pointer-events: none;
        }
        .about-mission-title {
          font-weight: 600;
          color: #FFFFFF;
          letter-spacing: -0.01em;
        }
        .about-mission-body {
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          font-weight: 400;
          color: rgba(255,255,255,0.75);
          line-height: 1.85;
        }
        .about-mission-eyebrow {
          font-family: 'Outfit', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #6E8BFF;
        }

        /* Feature cards */
        .about-card {
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(47,93,255,0.16);
          border-radius: 1.1rem;
          padding: 2.5rem 2rem;
          text-align: center;
          cursor: pointer;
          backdrop-filter: blur(16px) saturate(1.6);
          -webkit-backdrop-filter: blur(16px) saturate(1.6);
          box-shadow: 0 1px 0 rgba(255,255,255,0.85) inset;
          transition: background 0.35s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease, border-color 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .about-card::before {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(to right, #16307A, #6E8BFF);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }
        .about-card:hover {
          background: rgba(255,255,255,0.92);
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(47,93,255,0.12), 0 1px 0 rgba(255,255,255,0.85) inset;
          border-color: rgba(47,93,255,0.30);
        }
        .about-card:hover::before { transform: scaleX(1); }

        .about-card-icon {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(47,93,255,0.16);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
          font-size: 1.1rem;
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        .about-card:hover .about-card-icon {
          background: rgba(47,93,255,0.08);
          border-color: #2F5DFF;
        }

        .about-card-title {
          font-weight: 600;
          font-size: 1.15rem;
          color: var(--text-primary);
          letter-spacing: -0.01em;
          margin-bottom: 0.75rem;
        }

        .about-card-body {
          font-family: 'Outfit', sans-serif;
          font-size: 0.88rem;
          font-weight: 400;
          color: var(--text-secondary);
          line-height: 1.8;
        }

        /* Entrance animations */
        @keyframes fadeUp {
          from { opacity: 0; filter: blur(8px); transform: translateY(18px); }
          to   { opacity: 1; filter: blur(0); transform: translateY(0); }
        }
        .a1 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both 0.05s; }
        .a2 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both 0.15s; }
        .a3 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both 0.25s; }

        /* ── DARK MODE ── */
        html.dark-mode .about-card {
          background: rgba(30,41,59,0.75) !important;
          border-color: rgba(96,130,255,0.22) !important;
          box-shadow: 0 1px 0 rgba(255,255,255,0.04) inset !important;
        }
        html.dark-mode .about-card:hover {
          background: rgba(30,41,59,0.95) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.04) inset !important;
          border-color: rgba(96,130,255,0.40) !important;
        }
        html.dark-mode .about-card-icon {
          background: rgba(30,41,59,0.75) !important;
          border-color: rgba(96,130,255,0.22) !important;
        }
        html.dark-mode .about-card:hover .about-card-icon {
          background: rgba(47,93,255,0.16) !important;
          border-color: #6E8BFF !important;
        }
        html.dark-mode .about-story-img {
          border-color: rgba(96,130,255,0.22) !important;
        }
      `}</style>

      <div className="about-root px-4 sm:px-6 md:px-16 lg:px-24 mt-6 sm:mt-8">

        {/* ── HERO ── */}
        <div className="
          about-hero
          relative
          h-[250px] sm:h-[350px] md:h-[440px]
          flex flex-col items-center justify-center
          rounded-2xl
          overflow-hidden
          gap-3
        " style={{ background: '#10131F' }}>
          <img src="/images/about.jpg" className="about-hero-img" />

          <p className="about-eyebrow">Est. 2021</p>

          <h1 className="
            about-hero-title
            text-3xl sm:text-5xl md:text-6xl
            text-center px-4
          ">
            About SLOG Fashion
          </h1>
        </div>

        {/* ── STORY ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center mt-16 md:mt-20">
          <img src="/images/about2.jpg" className="about-story-img" />
          <div className="a1">
            <p className="mb-3" style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500, color: '#2F5DFF' }}>
              Our Story
            </p>
            <div className="about-rule" />
            <h2 className="about-section-title text-2xl sm:text-3xl md:text-4xl mb-5">
              Redefining <em>Men's Fashion</em>
            </h2>
            <p className="about-body mb-4">
              SLOG-FASHION was created to redefine modern men's fashion.
              We believe style is not just clothing — it's identity, confidence,
              and expression. Our collections are designed for men who want to stand out,
              stay comfortable, and embrace premium fashion everyday.
            </p>
            <p className="about-body">
              From stylish hoodies to elegant shirts, every piece is crafted
              with precision, passion, and purpose.
            </p>
          </div>
        </div>

        {/* ── MISSION ── */}
        <div className="mt-6 a2">
          <div className="about-mission-wrap rounded-2xl text-center">
            <p className="about-mission-eyebrow mb-4">What Drives Us</p>
            <h2 className="about-mission-title text-2xl sm:text-3xl md:text-4xl mb-5">
              Our Mission
            </h2>
            <p className="about-mission-body max-w-2xl mx-auto">
              Our mission is to provide high-quality fashion that combines comfort,
              style, and affordability. We aim to empower every man to feel confident and bold.
            </p>
          </div>
        </div>

        {/* ── WHY CHOOSE US ── */}
        <div className="mt-16 md:mt-20 mb-16 md:mb-24">
          <div className="text-center mb-10">
            <p className="mb-3" style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500, color: '#2F5DFF' }}>
              Why Us
            </p>
            <h2 className="about-section-title text-2xl sm:text-3xl">Why Choose SLOG</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 a3">
            <div className="about-card">
              <div className="about-card-icon">⭐</div>
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