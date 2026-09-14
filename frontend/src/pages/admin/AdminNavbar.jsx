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
    <div className="w-full max-w-[1200px] mx-auto sticky top-0 z-50 mt-3 sm:mt-5 px-3 sm:px-0">
      <div
        className="rounded-2xl sm:rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0d1117 0%, #161b27 50%, #0d1117 100%)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.06) inset, 0 -1px 0 rgba(255,255,255,0.03) inset",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex justify-between items-center px-4 sm:px-8 py-3.5">

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
              style={{
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                boxShadow: "0 4px 12px rgba(249,115,22,0.4)",
                color: "#fff",
                letterSpacing: "-0.5px",
              }}
            >
              S
            </div>
            <h1
              className="text-base sm:text-lg font-bold tracking-wide"
              style={{
                fontFamily: "'Courier New', monospace",
                color: "#e2e8f0",
                letterSpacing: "0.12em",
              }}
            >
              SLOG{" "}
              <span
                style={{
                  color: "#f97316",
                  textShadow: "0 0 12px rgba(249,115,22,0.5)",
                }}
              >
                ADMIN
              </span>
            </h1>
          </div>

          {/* DESKTOP MENU */}
          <nav
            className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-slate-400 hover:text-slate-100"
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        background: "linear-gradient(135deg, #f97316, #ea580c)",
                        boxShadow: "0 2px 10px rgba(249,115,22,0.35)",
                        letterSpacing: "0.02em",
                      }
                    : {
                        letterSpacing: "0.02em",
                      }
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* DESKTOP LOGOUT */}
          <button
            onClick={logout}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#cbd5e1",
              letterSpacing: "0.03em",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #f97316, #ea580c)";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(249,115,22,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "#cbd5e1";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
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
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200"
            style={{
              background: menuOpen
                ? "rgba(249,115,22,0.15)"
                : "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: menuOpen ? "#f97316" : "#94a3b8",
            }}
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
          <div
            className="md:hidden px-4 pb-4"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex flex-col gap-1 pt-3">
              {navLinks.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 hover:text-slate-100"
                    }`
                  }
                  style={({ isActive }) =>
                    isActive
                      ? {
                          background: "linear-gradient(135deg, #f97316, #ea580c)",
                          boxShadow: "0 2px 10px rgba(249,115,22,0.3)",
                        }
                      : {
                          background: "rgba(255,255,255,0.03)",
                        }
                  }
                >
                  {label}
                </NavLink>
              ))}

              {/* MOBILE LOGOUT */}
              <button
                onClick={logout}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer mt-2"
                style={{
                  background: "rgba(249,115,22,0.1)",
                  border: "1px solid rgba(249,115,22,0.2)",
                  color: "#f97316",
                }}
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
  );
};

export default AdminNavbar;