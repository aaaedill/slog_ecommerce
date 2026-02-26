import React from "react";

const About = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

        .about-root { font-family: 'Jost', sans-serif; }

        /* Hero */
        .about-hero-img {
          position: absolute;
          width: 100%; height: 100%;
          object-fit: cover;
          opacity: 0.45;
          transition: transform 0.8s cubic-bezier(0.76,0,0.24,1);
          cursor: pointer;
        }
        .about-hero:hover .about-hero-img { transform: scale(1.05); }

        .about-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(44,40,37,0.7) 0%, rgba(44,40,37,0.15) 60%);
          z-index: 1;
        }

        .about-hero-title {
          font-family: 'Fraunces', serif;
          font-weight: 300;
          font-style: italic;
          color: #F2EDE6;
          letter-spacing: 0.02em;
          line-height: 1.1;
          transition: color 0.4s ease;
          cursor: pointer;
          position: relative;
          z-index: 2;
        }
        .about-hero-title:hover { color: #C9A96E; }

        .about-eyebrow {
          font-family: 'Jost', sans-serif;
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #C9A96E;
          position: relative;
          z-index: 2;
        }

        /* Section headings */
        .about-section-title {
          font-family: 'Fraunces', serif;
          font-weight: 300;
          color: #2C2825;
          line-height: 1.15;
        }

        /* Body text */
        .about-body {
          font-family: 'Jost', sans-serif;
          font-size: 0.98rem;
          font-weight: 300;
          color: #4A4340;
          line-height: 1.95;
        }

        /* Story image */
        .about-story-img {
          border-radius: 1rem;
          border: 1px solid #D4CCC0;
          width: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.76,0,0.24,1);
        }
        .about-story-img:hover { transform: scale(1.02); }

        /* Thin rule */
        .about-rule {
          height: 1px;
          background: linear-gradient(to right, #8B6F5E, transparent);
          margin: 0.75rem 0 1.5rem;
          width: 3rem;
        }

        /* Mission block */
        .about-mission-wrap {
          position: relative;
          background: #2C2825;
          border-radius: 1rem;
          border: 1px solid #3D3532;
          overflow: hidden;
          padding: 3.5rem 2rem;
        }
        .about-mission-wrap::before {
          content: '';
          position: absolute;
          top: -20%; left: -10%;
          width: 55%; height: 140%;
          background: radial-gradient(ellipse, rgba(139,111,94,0.14) 0%, transparent 65%);
          pointer-events: none;
        }
        .about-mission-title {
          font-family: 'Fraunces', serif;
          font-weight: 300;
          font-style: italic;
          color: #F2EDE6;
          letter-spacing: 0.01em;
        }
        .about-mission-body {
          font-family: 'Jost', sans-serif;
          font-size: 0.98rem;
          font-weight: 300;
          color: rgba(242,237,230,0.78);
          line-height: 1.95;
        }
        .about-mission-eyebrow {
          font-family: 'Jost', sans-serif;
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #C9A96E;
        }

        /* Feature cards */
        .about-card {
          background: #E4DDD3;
          border: 1px solid #D4CCC0;
          border-radius: 1rem;
          padding: 2.5rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: transform 0.35s cubic-bezier(0.76,0,0.24,1), box-shadow 0.35s ease, border-color 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .about-card::before {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(to right, #8B6F5E, #C9A96E);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }
        .about-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 50px rgba(44,40,37,0.1);
          border-color: #C4B9AE;
        }
        .about-card:hover::before { transform: scaleX(1); }

        .about-card-icon {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: #DAD3C8;
          border: 1px solid #D4CCC0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
          font-size: 1.1rem;
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        .about-card:hover .about-card-icon {
          background: #D4CCC0;
          border-color: #8B6F5E;
        }

        .about-card-title {
          font-family: 'Fraunces', serif;
          font-weight: 300;
          font-size: 1.2rem;
          color: #2C2825;
          margin-bottom: 0.75rem;
        }

        .about-card-body {
          font-family: 'Jost', sans-serif;
          font-size: 0.88rem;
          font-weight: 300;
          color: #5A5250;
          line-height: 1.8;
        }

        /* Entrance animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .a1 { animation: fadeUp 0.8s ease both 0.05s; }
        .a2 { animation: fadeUp 0.8s ease both 0.15s; }
        .a3 { animation: fadeUp 0.8s ease both 0.25s; }
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
        " style={{ background: '#2C2825' }}>
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
            <p className="mb-3" style={{ fontFamily: "'Jost', sans-serif", fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 500, color: '#8B6F5E' }}>
              Our Story
            </p>
            <div className="about-rule" />
            <h2 className="about-section-title text-2xl sm:text-3xl md:text-4xl mb-5">
              Redefining Men's Fashion
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
            <p className="mb-3" style={{ fontFamily: "'Jost', sans-serif", fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 500, color: '#8B6F5E' }}>
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