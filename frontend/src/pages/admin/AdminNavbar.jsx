import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { ShopContext } from "../../context/ShopContext";

const AdminNavbar = () => {
  const { logoutUser } = useContext(ShopContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef(null);

  // Close the mobile menu on outside tap/click or Escape
  useEffect(() => {
    if (!menuOpen) return undefined;

    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  // Reset the menu when the screen grows to the desktop layout
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (event) => {
      if (event.matches) setMenuOpen(false);
    };

    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const logout = () => {
    logoutUser();
  };

  const navLinks = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/products", label: "Products" },
    { to: "/admin/orders", label: "Orders" },
  ];

  return (
    <header ref={rootRef} className="an-root w-full sticky top-0 z-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        .an-root {
          --an-red: #ff2d3f;
          --an-red-deep: #e11d2e;
          --an-line: rgba(255, 45, 63, 0.22);

          /* responsive scale (overridden per breakpoint below) */
          --an-max: 1400px;
          --an-px: 0.875rem;
          --an-py: 0.625rem;
          --an-gap: 0.75rem;
          --an-mark: 2rem;
          --an-logo-fs: 0.82rem;
          --an-logo-ls: 0.1em;
          --an-burger: 2.75rem;
          --an-ctl: 2.5rem;
          --an-link-px: 0.7rem;
          --an-link-py: 0.45rem;
          --an-link-fs: 0.8rem;

          font-family: 'Manrope', 'Inter', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          background: #000000;
        }

        /* ── Admin navigation bar ── */
        .an-bar {
          position: relative;
          width: 100%;
          background:
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.07) 0%,
              rgba(255, 255, 255, 0.015) 45%,
              rgba(255, 45, 63, 0.05) 100%
            ),
            rgba(0, 0, 0, 0.5);
          -webkit-backdrop-filter: blur(22px) saturate(180%);
          backdrop-filter: blur(22px) saturate(180%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.10) inset,
            0 -1px 0 rgba(0, 0, 0, 0.6) inset,
            0 12px 40px -12px rgba(0, 0, 0, 0.8);
          animation: an-drop 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* Slow moving specular sheen across the glass */
        .an-bar::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            110deg,
            transparent 30%,
            rgba(255, 255, 255, 0.06) 45%,
            rgba(255, 255, 255, 0.10) 50%,
            rgba(255, 255, 255, 0.06) 55%,
            transparent 70%
          );
          background-size: 250% 100%;
          animation: an-sheen 9s ease-in-out infinite;
          pointer-events: none;
        }

        /* Glowing red edge along the bottom */
        .an-bar::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            var(--an-red) 50%,
            transparent 100%
          );
          opacity: 0.75;
          box-shadow: 0 0 14px var(--an-red);
          pointer-events: none;
        }

        @keyframes an-drop {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes an-sheen {
          0% {
            background-position: 130% 0;
          }

          100% {
            background-position: -130% 0;
          }
        }

        .an-inner {
          position: relative;
          z-index: 1;
          max-width: var(--an-max);
          margin: 0 auto;
        }

        /* ── Logo ── */
        .an-logo {
          min-width: 0;
          gap: calc(var(--an-mark) * 0.32);
        }

        .an-logo-mark {
          flex: 0 0 auto;
          width: var(--an-mark);
          height: var(--an-mark);
          color: #ffffff;
          font-weight: 800;
          font-size: calc(var(--an-mark) * 0.4);
          background: linear-gradient(135deg, #ff3b4d, #c4121f);
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.18) inset,
            0 6px 18px rgba(255, 45, 63, 0.5);
          transition:
            transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.45s ease;
        }

        .an-logo:hover .an-logo-mark {
          transform: rotate(-8deg) scale(1.08);
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.25) inset,
            0 8px 26px rgba(255, 45, 63, 0.75);
        }

        .an-logo-text {
          min-width: 0;
          color: #ffffff;
          font-weight: 800;
          font-size: var(--an-logo-fs);
          letter-spacing: var(--an-logo-ls);
          line-height: 1.1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .an-logo-accent {
          color: var(--an-red);
          text-shadow: 0 0 16px rgba(255, 45, 63, 0.7);
        }

        /* ── Desktop nav pill ── */
        .an-nav {
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.08) inset;
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
        }

        .an-link {
          position: relative;
          padding: var(--an-link-py) var(--an-link-px);
          white-space: nowrap;
          color: rgba(255, 255, 255, 0.72);
          font-size: var(--an-link-fs);
          font-weight: 600;
          letter-spacing: 0.02em;
          transition:
            color 0.3s ease,
            background 0.3s ease,
            box-shadow 0.3s ease;
        }

        .an-link:hover {
          color: #ffffff;
          background: rgba(255, 45, 63, 0.12);
        }

        .an-link--active,
        .an-link--active:hover {
          color: #ffffff;
          background: linear-gradient(135deg, #ff3b4d, #d11525);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.25) inset,
            0 6px 20px rgba(255, 45, 63, 0.45);
        }

        /* ── Logout ── */
        .an-logout {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          color: #ffffff;
          font-size: 0.88rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          transition:
            border-color 0.4s ease,
            box-shadow 0.4s ease,
            transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .an-logout::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          background: linear-gradient(135deg, #ff3b4d, #c4121f);
          transform: translateY(101%);
          transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .an-logout:hover {
          border-color: transparent;
          box-shadow: 0 8px 24px -6px rgba(255, 45, 63, 0.6);
          transform: translateY(-1px);
        }

        .an-logout:hover::before {
          transform: translateY(0);
        }

        .an-logout:active {
          transform: translateY(0) scale(0.97);
        }

        .an-logout svg {
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .an-logout:hover svg {
          transform: translateX(3px);
        }

        /* ── Mobile toggle ── */
        .an-burger {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.14);
          transition:
            background 0.3s ease,
            border-color 0.3s ease,
            color 0.3s ease,
            box-shadow 0.3s ease;
        }

        .an-burger:hover {
          border-color: var(--an-line);
        }

        .an-burger--open {
          color: var(--an-red);
          background: rgba(255, 45, 63, 0.14);
          border-color: rgba(255, 45, 63, 0.5);
          box-shadow: 0 0 18px rgba(255, 45, 63, 0.3);
        }

        /* ── Mobile panel ── */
        .an-mobile {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 2;
          max-height: calc(100vh - 4.5rem);
          max-height: calc(100dvh - 4.5rem);
          overflow-y: auto;
          overscroll-behavior: contain;
          padding: 0.75rem max(var(--an-px), env(safe-area-inset-right)) 1rem max(var(--an-px), env(safe-area-inset-left));
          background: linear-gradient(180deg, rgba(22, 22, 22, 0.97), rgba(0, 0, 0, 0.98));
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: 1px solid var(--an-line);
          box-shadow: 0 28px 48px -14px rgba(0, 0, 0, 0.85);
          animation: an-slide 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes an-slide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .an-mlink {
          color: rgba(255, 255, 255, 0.78);
          font-size: 0.95rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition:
            color 0.3s ease,
            background 0.3s ease,
            border-color 0.3s ease;
        }

        .an-mlink:hover {
          color: #ffffff;
          background: rgba(255, 45, 63, 0.12);
          border-color: var(--an-line);
        }

        .an-mlink--active,
        .an-mlink--active:hover {
          color: #ffffff;
          background: linear-gradient(135deg, #ff3b4d, #d11525);
          border-color: transparent;
          box-shadow: 0 6px 20px rgba(255, 45, 63, 0.4);
        }

        .an-mlogout {
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 600;
          background: rgba(255, 45, 63, 0.16);
          border: 1px solid rgba(255, 45, 63, 0.5);
          transition:
            background 0.3s ease,
            box-shadow 0.3s ease;
        }

        .an-mlogout:hover {
          background: linear-gradient(135deg, #ff3b4d, #c4121f);
          box-shadow: 0 8px 24px -6px rgba(255, 45, 63, 0.6);
        }

        /* ── Layout ── */
        .an-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--an-gap);
          padding:
            var(--an-py)
            max(var(--an-px), env(safe-area-inset-right))
            var(--an-py)
            max(var(--an-px), env(safe-area-inset-left));
        }

        .an-nav {
          min-width: 0;
          padding: 0.25rem;
          gap: 0.125rem;
        }

        .an-logout {
          height: var(--an-ctl);
          width: var(--an-ctl);
          padding: 0;
          justify-content: center;
          gap: 0;
        }

        .an-logout-label { display: none; }

        .an-burger {
          flex: 0 0 auto;
          width: var(--an-burger);
          height: var(--an-burger);
        }

        .an-mgrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.5rem;
        }

        .an-mlink {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 2.75rem;
          padding: 0.5rem 0.75rem;
          text-align: center;
        }

        .an-mlogout {
          grid-column: 1 / -1;
          min-height: 2.75rem;
          margin-top: 0.25rem;
        }

        /* ── Responsive scale ── */

        /* ≥ 400px: large phones */
        @media (min-width: 400px) {
          .an-root {
            --an-px: 1rem;
            --an-py: 0.7rem;
            --an-mark: 2.15rem;
            --an-logo-fs: 0.92rem;
            --an-logo-ls: 0.12em;
          }
        }

        /* ≥ 480px: phones in landscape / small tablets */
        @media (min-width: 480px) {
          .an-root {
            --an-py: 0.75rem;
            --an-mark: 2.25rem;
            --an-logo-fs: 1rem;
            --an-logo-ls: 0.14em;
          }
        }

        /* ≥ 520px: menu tiles go 4 across */
        @media (min-width: 520px) {
          .an-mgrid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }

        /* ≥ 640px: tablets (portrait) */
        @media (min-width: 640px) {
          .an-root {
            --an-px: 1.5rem;
            --an-py: 0.8rem;
            --an-logo-fs: 1.05rem;
            --an-burger: 2.5rem;
          }
        }

        /* ≥ 768px: desktop nav appears, logo | nav | logout (nav truly centred) */
        @media (min-width: 768px) {
          .an-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
            gap: var(--an-gap);
          }

          .an-root {
            --an-gap: 1rem;
            --an-py: 0.7rem;
            --an-mark: 2.1rem;
            --an-logo-fs: 0.9rem;
            --an-logo-ls: 0.1em;
          }

          .an-logo   { justify-self: start; }
          .an-logout { justify-self: end; }
        }

        /* ≥ 1024px: laptops */
        @media (min-width: 1024px) {
          .an-root {
            --an-px: 2rem;
            --an-py: 0.8rem;
            --an-gap: 1.5rem;
            --an-mark: 2.25rem;
            --an-logo-fs: 1rem;
            --an-logo-ls: 0.14em;
            --an-link-px: 1rem;
            --an-link-py: 0.5rem;
            --an-link-fs: 0.88rem;
          }

          .an-nav { padding: 0.3rem; gap: 0.25rem; }

          .an-logout {
            width: auto;
            padding: 0 1rem;
            gap: 0.5rem;
          }

          .an-logout-label { display: inline; }
        }

        /* ≥ 1280px: desktops */
        @media (min-width: 1280px) {
          .an-root {
            --an-py: 0.9rem;
            --an-logo-fs: 1.1rem;
            --an-link-px: 1.15rem;
            --an-link-fs: 0.9rem;
          }
        }

        /* ≥ 1536px: large monitors */
        @media (min-width: 1536px) {
          .an-root {
            --an-max: 1680px;
            --an-px: 2.5rem;
            --an-py: 1rem;
            --an-mark: 2.5rem;
            --an-logo-fs: 1.2rem;
            --an-link-px: 1.3rem;
            --an-link-py: 0.6rem;
            --an-link-fs: 0.95rem;
            --an-ctl: 2.75rem;
          }

          .an-logout { font-size: 0.95rem; }
        }

        /* ≥ 1920px: ultra-wide */
        @media (min-width: 1920px) {
          .an-root {
            --an-max: 1840px;
            --an-link-fs: 1rem;
          }
        }

        /* ── Fallback when backdrop-filter is unsupported ── */
        @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
          .an-bar {
            background: rgba(0, 0, 0, 0.92);
          }
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .an-bar,
          .an-bar::before,
          .an-mobile {
            animation: none !important;
          }

          .an-link,
          .an-logout,
          .an-logout::before,
          .an-logout svg,
          .an-logo-mark,
          .an-mlink {
            transition: none !important;
          }
        }
      `}</style>

      <div className="an-bar">
        <div className="an-inner">
          <div className="an-row">

            {/* LOGO */}
            <div className="an-logo flex items-center">
              <div className="an-logo-mark rounded-lg flex items-center justify-center">
                S
              </div>

              <h1 className="an-logo-text">
                SLOG{" "}
                <span className="an-logo-accent">
                  ADMIN
                </span>
              </h1>
            </div>

            {/* DESKTOP MENU */}
            <nav className="an-nav hidden md:flex items-center rounded-xl" aria-label="Admin navigation">
              {navLinks.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `an-link rounded-lg ${
                      isActive ? "an-link--active" : ""
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* DESKTOP LOGOUT */}
            <button
              onClick={logout}
              className="an-logout hidden md:flex items-center rounded-lg cursor-pointer"
              aria-label="Logout"
              title="Logout"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="an-logout-label">Logout</span>
            </button>

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`an-burger md:hidden flex items-center justify-center rounded-lg ${
                menuOpen ? "an-burger--open" : ""
              }`}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="an-mobile-menu"
            >
              {menuOpen ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>

          </div>

        </div>

        {/* MOBILE MENU (overlay, tile grid) */}
        {menuOpen && (
          <div id="an-mobile-menu" className="an-mobile md:hidden">
            <div className="an-mgrid">
              {navLinks.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `an-mlink rounded-lg ${
                      isActive ? "an-mlink--active" : ""
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}

              {/* MOBILE LOGOUT */}
              <button
                onClick={logout}
                className="an-mlogout flex items-center justify-center gap-2 px-4 py-3 rounded-lg cursor-pointer"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminNavbar;