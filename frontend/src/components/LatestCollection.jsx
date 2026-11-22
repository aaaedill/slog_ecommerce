import { useContext, useEffect, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const rootRef = useRef(null);

  /*
   * SCROLL-TRIGGERED REVEAL
   *
   * The entrance animation itself (lc-blur-in) is untouched.
   * This only decides WHEN it plays: each header/card starts
   * paused, and is switched to running the moment it scrolls
   * into view (or immediately, if it's already in view on
   * first load) — so pieces below the fold aren't wasted
   * before the user ever sees them.
   */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = root.querySelectorAll(".lc-header, .lc-card");

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("lc-in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("lc-in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [products]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap');

        /* ────────────────────────────────────────────────
           WRAPPER
           Sits directly below the Hero with no gap.
        ──────────────────────────────────────────────── */

        .lc-wrapper {
          margin-top: 0;
          width: 100%;
        }

        /* ────────────────────────────────────────────────
           MAIN SECTION
           Uses the exact same page background.
           No outer white container.
           No rounded outer container.
        ──────────────────────────────────────────────── */

        .lc-root {
          --lc-bg: var(--bg-primary);
          --lc-card-bg: transparent;
          --lc-card-hover: transparent;
          --lc-olive: #6B8E23;
          --lc-olive-light: #A9C46C;
          --lc-olive-deep: #4B5320;
          --lc-olive-faint: rgba(107, 142, 35, 0.08);
          --lc-olive-line: rgba(107, 142, 35, 0.16);
          --lc-ink: #10131F;
          --lc-ink-muted: rgba(16, 19, 31, 0.55);
          --lc-ink-faint: rgba(16, 19, 31, 0.30);
          --lc-glass-bg: transparent;
          --lc-glass-bg2: transparent;
          --lc-glass-border: rgba(107, 142, 35, 0.16);
          --lc-glass-shine: transparent;

          font-family:
            'Jost',
            sans-serif;

          background:
            var(--lc-bg);

          padding: clamp(2.5rem, 7vw, 5rem) calc(clamp(1rem, 3vw, 2.5rem) + max(0px, (100% - 1440px) / 2)) clamp(3.5rem, 9vw, 6rem);
          box-sizing: border-box;

          position: relative;

          overflow: hidden;

          border-radius: 0;

          width: 100%;
        }

        /* ────────────────────────────────────────────────
           HEADER
        ──────────────────────────────────────────────── */

        .lc-header {
          position: relative;

          z-index: 2;

          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          margin-bottom: clamp(1.75rem, 4.5vw, 3.5rem);

          padding-bottom: clamp(1.1rem, 2.5vw, 2rem);

          flex-wrap: wrap;

          gap: 1rem 1.5rem;

          border-bottom:
            1px solid
            var(--lc-glass-border);
        }

        .lc-header-left {
          display: flex;

          flex-direction: column;

          gap:
            0.9rem;
        }

        .lc-title {
          font-weight:
            600;

          font-size: clamp(1.7rem, 1.2rem + 2.2vw, 3rem);

          line-height:
            1.05;

          letter-spacing:
            -0.02em;

          color:
            var(--lc-ink);
        }

        .lc-title em {
          font-style:
            normal;

          font-weight:
            600;

          color:
            var(--lc-olive);
        }

        .lc-header-right {
          display: flex;

          flex-direction: column;

          align-items: flex-end;

          gap:
            0.6rem;

          padding-bottom:
            0.2rem;
        }

        .lc-count {
          font-size:
            0.7rem;

          font-weight:
            400;

          letter-spacing:
            0.14em;

          text-transform:
            uppercase;

          color:
            var(--lc-ink-faint);
        }

        /* ────────────────────────────────────────────────
           VIEW ALL
        ──────────────────────────────────────────────── */

        .lc-view-all {
          font-family:
            'Jost',
            sans-serif;

          font-size:
            0.72rem;

          font-weight:
            500;

          letter-spacing:
            0.08em;

          text-transform:
            uppercase;

          color:
            var(--lc-olive-deep);

          text-decoration:
            none;

          display: flex;

          align-items: center;

          gap:
            0.5rem;

          padding:
            0.65rem
            1.3rem;

          border:
            1px solid
            var(--lc-glass-border);

          border-radius:
            100px;

          background:
            transparent;

          backdrop-filter:
            none;

          -webkit-backdrop-filter:
            none;

          transition:
            background 0.25s ease,
            transform 0.25s ease,
            box-shadow 0.25s ease;

          box-shadow:
            none;
        }

        .lc-view-all:hover {
          background:
            var(--lc-olive-faint);

          transform:
            translateY(-2px);

          box-shadow:
            none;
        }

        .lc-view-all svg {
          transition:
            transform 0.25s ease;
        }

        .lc-view-all:hover svg {
          transform:
            translate(
              2px,
              -2px
            );
        }

        /* ────────────────────────────────────────────────
           GRID
        ──────────────────────────────────────────────── */

        .lc-grid {
          position: relative;

          z-index: 2;

          display: grid;

          grid-template-columns: repeat(4, minmax(0, 1fr));

          gap: clamp(1.5rem, 3vw, 2.5rem) clamp(0.75rem, 1.6vw, 1.5rem);
        }

        /* ────────────────────────────────────────────────
           CARD

           The card itself is transparent so the
           product sits directly on the page background.

           Layout, image, hover movement and animation
           remain unchanged.
        ──────────────────────────────────────────────── */

        .lc-card {
          position: relative;

          background:
            transparent;

          border:
            0;

          border-radius:
            0;

          cursor:
            pointer;

          display: flex;

          flex-direction:
            column;

          overflow:
            hidden;

          box-shadow:
            none;

          backdrop-filter:
            none;

          -webkit-backdrop-filter:
            none;

          transition:
            background 0.35s ease,
            border-color 0.35s ease,
            transform 0.4s
              cubic-bezier(
                0.16,
                1,
                0.3,
                1
              ),
            box-shadow 0.4s ease;
        }

        .lc-card:hover {
          background:
            transparent;

          border-color:
            transparent;

          transform:
            translateY(-6px)
            scale(1.01);

          box-shadow:
            none;
        }

        /* ────────────────────────────────────────────────
           TOP BAR
        ──────────────────────────────────────────────── */

        .lc-card::before {
          content:
            '';

          position:
            absolute;

          top:
            0;

          left:
            0;

          right:
            0;

          height:
            2px;

          background:
            linear-gradient(
              to right,
              var(--lc-olive-deep),
              var(--lc-olive-light)
            );

          transform:
            scaleX(0);

          transform-origin:
            left;

          transition:
            transform 0.5s
            cubic-bezier(
              0.16,
              1,
              0.3,
              1
            );

          z-index:
            5;

          border-radius:
            0;
        }

        .lc-card:hover::before {
          transform:
            scaleX(1);
        }

        /* ────────────────────────────────────────────────
           IMAGE
        ──────────────────────────────────────────────── */

        .lc-img-wrap {
          position:
            relative;

          overflow:
            hidden;

          flex-shrink:
            0;
        }

        .lc-img {
          width:
            100%;

          aspect-ratio: 4 / 5;

          height: auto;

          object-fit:
            cover;

          display:
            block;

          transition:
            transform 0.9s
            cubic-bezier(
              0.25,
              0.46,
              0.45,
              0.94
            );
        }

        .lc-card:hover .lc-img {
          transform:
            scale(1.06);
        }

        /* ────────────────────────────────────────────────
           QUICK VIEW
        ──────────────────────────────────────────────── */

        .lc-quick {
          position:
            absolute;

          bottom:
            1.2rem;

          left:
            50%;

          transform:
            translateX(-50%)
            translateY(12px)
            scale(0.92);

          z-index:
            3;

          font-family:
            'Jost',
            sans-serif;

          font-size:
            0.68rem;

          font-weight:
            500;

          letter-spacing:
            0.06em;

          color:
            #FFFFFF;

          background:
            var(--lc-olive);

          padding:
            0.55rem
            1.4rem;

          border-radius:
            100px;

          white-space:
            nowrap;

          opacity:
            0;

          box-shadow:
            0 8px 24px
            rgba(
              107,
              142,
              35,
              0.35
            );

          transition:
            opacity 0.3s ease,
            transform 0.4s
            cubic-bezier(
              0.16,
              1,
              0.3,
              1
            );

          pointer-events:
            none;
        }

        .lc-card:hover .lc-quick {
          opacity:
            1;

          transform:
            translateX(-50%)
            translateY(0)
            scale(1);
        }

        /* ────────────────────────────────────────────────
           TEXT BLOCK

           No separate card surface.
           Text sits directly on the page background.
        ──────────────────────────────────────────────── */

        .lc-info {
          padding: clamp(0.75rem, 1.2vw, 1.2rem) clamp(0.2rem, 0.9vw, 1rem) clamp(0.9rem, 1.6vw, 1.4rem);

          display:
            flex;

          flex-direction:
            column;

          gap:
            0.5rem;

          border-top:
            0;

          flex:
            1;

          background:
            transparent;
        }

        .lc-name {
          font-weight:
            500;

          font-size: clamp(0.9rem, 0.85rem + 0.2vw, 1rem);

          line-height: 1.3;

          letter-spacing:
            -0.005em;

          color:
            var(--lc-ink);

          transition:
            color 0.25s;

          display: -webkit-box;

          -webkit-line-clamp: 2;

          -webkit-box-orient: vertical;

          min-height: 2.6em;

          overflow: hidden;

          text-overflow: ellipsis;
        }

        .lc-card:hover .lc-name {
          color:
            var(--lc-olive-deep);
        }

        .lc-bottom {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          margin-top:
            0.2rem;
        }

        .lc-price {
          font-family:
            'Jost',
            sans-serif;

          font-size:
            0.9rem;

          font-weight:
            600;

          letter-spacing:
            0.01em;

          color:
            var(--lc-olive);
        }

        /* ────────────────────────────────────────────────
           ARROW
        ──────────────────────────────────────────────── */

        .lc-arrow-icon {
          width:
            24px;

          height:
            24px;

          border:
            1px solid
            var(--lc-glass-border);

          border-radius:
            50%;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          opacity:
            0;

          transform:
            scale(0.6)
            rotate(-45deg);

          transition:
            opacity 0.3s ease,
            transform 0.35s
            cubic-bezier(
              0.16,
              1,
              0.3,
              1
            ),
            border-color 0.2s,
            background 0.2s;

          flex-shrink:
            0;
        }

        .lc-card:hover .lc-arrow-icon {
          opacity:
            1;

          transform:
            scale(1)
            rotate(0deg);

          border-color:
            var(--lc-olive-light);

          background:
            var(--lc-olive-faint);
        }

        /* ────────────────────────────────────────────────
           ENTRANCE ANIMATION
           (unchanged)
        ──────────────────────────────────────────────── */

        @keyframes lc-blur-in {
          from {
            opacity:
              0;

            filter:
              blur(10px);

            transform:
              translateY(14px)
              scale(0.98);
          }

          to {
            opacity:
              1;

            filter:
              blur(0);

            transform:
              translateY(0)
              scale(1);
          }
        }

        .lc-header {
          animation:
            lc-blur-in
            0.7s
            cubic-bezier(
              0.16,
              1,
              0.3,
              1
            )
            both;
        }

        .lc-card {
          animation:
            lc-blur-in
            0.6s
            cubic-bezier(
              0.16,
              1,
              0.3,
              1
            )
            both;
        }

        .lc-card:nth-child(1) {
          animation-delay:
            0.05s;
        }

        .lc-card:nth-child(2) {
          animation-delay:
            0.10s;
        }

        .lc-card:nth-child(3) {
          animation-delay:
            0.15s;
        }

        .lc-card:nth-child(4) {
          animation-delay:
            0.20s;
        }

        .lc-card:nth-child(5) {
          animation-delay:
            0.25s;
        }

        .lc-card:nth-child(6) {
          animation-delay:
            0.30s;
        }

        .lc-card:nth-child(7) {
          animation-delay:
            0.35s;
        }

        .lc-card:nth-child(8) {
          animation-delay:
            0.40s;
        }

        /* ────────────────────────────────────────────────
           SCROLL-INTO-VIEW GATE
        ──────────────────────────────────────────────── */

        .lc-header,
        .lc-card {
          animation-play-state:
            paused;
        }

        .lc-header.lc-in-view,
        .lc-card.lc-in-view {
          animation-play-state:
            running;
        }

        @media (prefers-reduced-motion: reduce) {
          .lc-header,
          .lc-card {
            animation:
              none !important;

            opacity:
              1 !important;

            filter:
              none !important;

            transform:
              none !important;
          }
        }

        /* ────────────────────────────────────────────────
           DARK MODE

           The section uses the exact global dark canvas.
           No separate blue/slate card surfaces.
        ──────────────────────────────────────────────── */

        html.dark-mode .lc-root {
          background-color:
            #000000 !important;

          background-image:
            none !important;

          --lc-card-bg:
            transparent;

          --lc-card-hover:
            transparent;

          --lc-olive-deep:
            #A9C46C;

          --lc-ink:
            var(--text-primary);

          --lc-ink-muted:
            var(--text-secondary);

          --lc-ink-faint:
            var(--text-secondary);

          --lc-glass-bg:
            transparent;

          --lc-glass-bg2:
            transparent;

          --lc-glass-border:
            rgba(
              169,
              196,
              108,
              0.20
            );

          --lc-glass-shine:
            transparent;
        }

        html.dark-mode .lc-info {
          background:
            transparent !important;

          border-top:
            0 !important;
        }

        /* ────────────────────────────────────────────────
           RESPONSIVE
        ──────────────────────────────────────────────── */

        @media (max-width: 1024px) {
          .lc-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }

          .lc-img {
            height: auto;
          }
        }

        @media (max-width: 768px) {
          .lc-root {
            padding:
              3rem
              1.5rem
              4rem;

            border-radius:
              0;
          }

          .lc-wrapper {
            margin-top:
              0;
          }

          .lc-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));

            gap:
              0.8rem;
          }

          .lc-img {
            height: auto;
          }

          .lc-header {
            flex-direction:
              column;

            align-items:
              flex-start;

            gap:
              1.2rem;
          }

          .lc-header-right {
            align-items:
              flex-start;
          }
        }

        @media (max-width: 480px) {
          .lc-root {
            padding: 2.5rem 1rem 3.5rem;
          }

          .lc-img {
            height: auto;
          }

          .lc-title {
            font-size:
              1.7rem;
          }
        }
      
        /* ────────────────────────────────────────────────
           RESPONSIVE ADDITIONS
        ──────────────────────────────────────────────── */

        /* Touch screens: no hover effects stuck after a tap,
           and a comfortable tap size for View All */
        @media (hover: none) {
          .lc-card:hover .lc-img {
            transform: none;
          }

          .lc-card:hover::before {
            transform: scaleX(0);
          }

          .lc-card:hover .lc-quick {
            opacity: 0;
            transform: translateX(-50%) translateY(12px) scale(0.92);
          }

          .lc-card:hover .lc-arrow-icon {
            opacity: 0;
            transform: scale(0.6) rotate(-45deg);
          }
        }

        @media (pointer: coarse) {
          .lc-view-all {
            min-height: 2.75rem;
          }
        }
`}</style>

      {/* ==================================================
          LATEST COLLECTION
          ================================================== */}

      <div className="lc-wrapper">
        <div className="lc-root" ref={rootRef}>

          {/* ==================================================
              HEADER
              ================================================== */}

          <div className="lc-header">

            <div className="lc-header-left">

              <h2 className="lc-title">
                Latest{" "}
                <em>
                  Collection
                </em>
              </h2>

            </div>

            <div className="lc-header-right">

              <span className="lc-count">
                {products.length} Pieces
              </span>

              <Link
                to="/collection"
                className="lc-view-all"
              >
                View All

                <svg
                  width="9"
                  height="9"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="
                      M2 10
                      L10 2
                      M10 2
                      H4
                      M10 2
                      V8
                    "
                  />
                </svg>

              </Link>

            </div>

          </div>

          {/* ==================================================
              PRODUCT GRID
              ================================================== */}

          <div className="lc-grid">

            {products.map(
              (
                item,
                i
              ) => (

                <Link
                  key={
                    item.id
                  }
                  to={`/product/${item.id}`}
                  style={{
                    display:
                      "contents"
                  }}
                >

                  <div className="lc-card">

                    {/* IMAGE */}

                    <div className="lc-img-wrap">

                      <img
                        src={
                          item.image
                        }
                        className="lc-img"
                        alt={
                          item.name
                        }
                      />

                      <span className="lc-quick">
                        View Product
                      </span>

                    </div>

                    {/* INFORMATION */}

                    <div className="lc-info">

                      <p className="lc-name">
                        {
                          item.name
                        }
                      </p>

                      <div className="lc-bottom">

                        <span className="lc-price">
                          ₹
                          {
                            item.price
                          }
                        </span>

                        <div className="lc-arrow-icon">

                          <svg
                            width="8"
                            height="8"
                            viewBox="0 0 12 12"
                            fill="none"
                            stroke="#4B5320"
                            strokeWidth="1.5"
                          >
                            <path
                              d="
                                M2 10
                                L10 2
                                M10 2
                                H4
                                M10 2
                                V8
                              "
                            />
                          </svg>

                        </div>

                      </div>

                    </div>

                  </div>

                </Link>

              )
            )}

          </div>

        </div>
      </div>

    </>
  );
};

export default LatestCollection;