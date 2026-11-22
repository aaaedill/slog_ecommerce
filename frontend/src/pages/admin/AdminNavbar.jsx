import React, { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { ShopContext } from "../../context/ShopContext";

const AdminNavbar = () => {
  const { logoutUser } = useContext(ShopContext);
  const [menuOpen, setMenuOpen] = useState(false);

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
    <header className="an-root w-full sticky top-0 z-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        .an-root {
          --an-red: #ff2d3f;
          --an-red-deep: #e11d2e;
          --an-line: rgba(255, 45, 63, 0.22);
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
          max-width: 1400px;
          margin: 0 auto;
        }

        /* ── Logo ── */
        .an-logo-mark {
          color: #ffffff;
          font-weight: 800;
          font-size: 0.85rem;
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
          color: #ffffff;
          font-weight: 800;
          letter-spacing: 0.14em;
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
          color: rgba(255, 255, 255, 0.72);
          font-size: 0.9rem;
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
          border-top: 1px solid rgba(255, 255, 255, 0.08);
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
            border-color 0.3s ease,
            padding-left 0.3s ease;
        }

        .an-mlink:hover {
          color: #ffffff;
          background: rgba(255, 45, 63, 0.12);
          border-color: var(--an-line);
          padding-left: 1.25rem;
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
          <div className="flex justify-between items-center px-4 sm:px-8 py-3.5">

            {/* LOGO */}
            <div className="an-logo flex items-center gap-3">
              <div className="an-logo-mark w-9 h-9 rounded-lg flex items-center justify-center">
                S
              </div>

              <h1 className="an-logo-text text-base sm:text-lg">
                SLOG{" "}
                <span className="an-logo-accent">
                  ADMIN
                </span>
              </h1>
            </div>

            {/* DESKTOP MENU */}
            <nav className="an-nav hidden md:flex items-center gap-1 px-2 py-1.5 rounded-xl">
              {navLinks.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `an-link px-4 py-2 rounded-lg ${
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
              className="an-logout hidden md:flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer"
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

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`an-burger md:hidden flex items-center justify-center w-10 h-10 rounded-lg ${
                menuOpen ? "an-burger--open" : ""
              }`}
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

          {/* MOBILE MENU */}
          {menuOpen && (
            <div className="an-mobile md:hidden px-4 pb-4">
              <div className="flex flex-col gap-1.5 pt-3">
                {navLinks.map(({ to, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `an-mlink px-4 py-3 rounded-lg ${
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
                  className="an-mlogout flex items-center justify-center gap-2 px-4 py-3 rounded-lg cursor-pointer mt-2"
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
      </div>
    </header>
  );
};

export default AdminNavbar;