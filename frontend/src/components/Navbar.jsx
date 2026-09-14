import React, {useState,useContext,useRef,useEffect} from 'react';
import {useLocation,useNavigate,Link,NavLink} from "react-router-dom";
import logo from '../assets/logo.png';
import search_icon from '../assets/search_icon.png';
import profile_icon from '../assets/profile_icon.png';
import cart_icon from '../assets/cart_icon.png';
import menu_icon from '../assets/menu_icon.png';
import SearchBar from "./SearchBar";
import { ShopContext } from '../context/ShopContext';
import { toast } from "react-toastify";


const Navbar = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const { user, logoutUser, getCartCount } = useContext(ShopContext);

  const profileRef = useRef(null)

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "forceLogout") {
        const data = JSON.parse(event.newValue);
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (currentUser && String(currentUser.id) === String(data.userId)) {
          toast.error("Admin blocked your account", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            style: {
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(24px) saturate(1.8)",
              WebkitBackdropFilter: "blur(24px) saturate(1.8)",
              border: "1px solid rgba(47,93,255,0.25)",
              borderRadius: "16px",
              color: "#16307A",
              fontFamily: "Outfit, sans-serif",
              boxShadow: "0 8px 32px rgba(47,93,255,0.16), 0 1px 0 rgba(255,255,255,0.8) inset"
            }
          });
          setTimeout(() => {
            logoutUser();
            navigate("/login");
          }, 300);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [logoutUser, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowProfileMenu(false);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setShowProfileMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");

    return () => {
      document.documentElement.classList.remove("dark-mode");
    };
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  if (
    location.pathname === "/login" ||
    location.pathname === "/register"
  ) return null;

  const logout = () => {
    logoutUser();
    setShowProfileMenu(false);
    navigate("/");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');
        .nav-font { font-family: 'Outfit', sans-serif; }

        /* ── link indicator: center-out scale, not width ── */
        .nav-link-underline { position: relative; }
        .nav-link-underline::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: -3px;
          height: 2px;
          border-radius: 2px;
          background: #2F5DFF;
          box-shadow: 0 0 8px rgba(47,93,255,0.5);
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.35s cubic-bezier(0.65,0,0.35,1);
        }
        .nav-link-underline:hover::after,
        .nav-link-active::after { transform: scaleX(1) !important; }
        .nav-link-active::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: -3px;
          height: 2px;
          border-radius: 2px;
          background: #2F5DFF;
          box-shadow: 0 0 8px rgba(47,93,255,0.5);
          transform: scaleX(1);
        }

        .profile-dropdown-item { transition: background 0.2s ease, transform 0.2s ease; }
        .profile-dropdown-item:hover {
          transform: translateX(4px);
          background: rgba(47,93,255,0.08);
        }

        @keyframes nav-dropdown-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .nav-dropdown-anim { animation: nav-dropdown-in 0.28s cubic-bezier(0.16,1,0.3,1) both; }

        /* neutral gray — matches inactive nav link color (#6B7280) */
        .nav-icon-btn {
          filter: invert(48%) sepia(9%) saturate(478%) hue-rotate(182deg) brightness(92%) contrast(87%);
          transition: filter 0.2s ease, opacity 0.2s ease, transform 0.2s ease;
          opacity: 0.75;
        }

        .nav-icon-btn:hover {
          opacity: 1;
          transform: translateY(-1px);
        }

        /* blue — only applied when active/clicked, matches active nav link color (#2F5DFF) */
        .nav-icon-btn.is-active {
          filter: invert(29%) sepia(94%) saturate(1976%) hue-rotate(217deg) brightness(97%) contrast(101%);
          opacity: 1;
        }

        /* rich, saturated blue for the logo — more convincing than the muted version */
        .nav-logo {
          filter: invert(21%) sepia(96%) saturate(2879%) hue-rotate(222deg) brightness(92%) contrast(103%);
        }

        /* ── DARK MODE ── */
        html.dark-mode,
        html.dark-mode body {
          background: #0F172A !important;
          color: #F8FAFC !important;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        html.dark-mode .nav-dark-container {
          background: rgba(15,23,42,0.78) !important;
          border-color: rgba(96,130,255,0.25) !important;
          box-shadow: 0 4px 30px rgba(0,0,0,0.30), 0 1px 0 rgba(255,255,255,0.04) inset !important;
        }

        html.dark-mode .nav-dark-dropdown {
          background: rgba(15,23,42,0.92) !important;
          border-color: rgba(96,130,255,0.25) !important;
          box-shadow: 0 16px 40px rgba(0,0,0,0.40), 0 1px 0 rgba(255,255,255,0.04) inset !important;
        }

        html.dark-mode .nav-dark-drawer {
          background: rgba(15,23,42,0.96) !important;
          border-color: rgba(96,130,255,0.25) !important;
          box-shadow: -20px 0 60px rgba(0,0,0,0.35) !important;
        }

        html.dark-mode .nav-dark-text {
          color: #CBD5E1 !important;
        }

        html.dark-mode .nav-dark-profile-text {
          color: #CBD5E1 !important;
        }

        html.dark-mode .nav-dark-dropdown-item {
          color: #E2E8F0 !important;
        }

        html.dark-mode .nav-dark-border {
          border-color: rgba(96,130,255,0.20) !important;
        }

        html.dark-mode .nav-dark-close {
          color: #CBD5E1 !important;
        }

        html.dark-mode .nav-dark-overlay {
          background: rgba(2,6,23,0.60) !important;
        }

        /* ── THEME TOGGLE ── */
        .theme-toggle {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          cursor: pointer;
          border: 1px solid rgba(47,93,255,0.14);
          background: rgba(255,255,255,0.45);
          color: #6B7280;
          transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease, transform 0.2s ease;
        }

        .theme-toggle:hover {
          background: rgba(47,93,255,0.08);
          color: #2F5DFF;
          border-color: rgba(47,93,255,0.25);
          transform: translateY(-1px);
        }

        .theme-toggle svg {
          width: 18px;
          height: 18px;
          transition: transform 0.3s ease;
        }

        .theme-toggle:active svg {
          transform: rotate(25deg) scale(0.9);
        }

        html.dark-mode .theme-toggle {
          background: rgba(30,41,59,0.75);
          color: #F8FAFC;
          border-color: rgba(96,130,255,0.25);
        }

        html.dark-mode .theme-toggle:hover {
          background: rgba(47,93,255,0.18);
          color: #FFFFFF;
          border-color: rgba(96,130,255,0.40);
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <div className='
        sticky top-0
        z-50
        nav-font
        px-3 sm:px-6
        pt-2
      '>
        <div
          className='max-w-[1200px] mx-auto rounded-3xl sm:rounded-2xl backdrop-blur-xl nav-dark-container'
          style={{
            background: 'rgba(255,255,255,0.65)',
            border: '0.75px solid rgba(47,93,255,0.16)',
            boxShadow: '0 4px 30px rgba(47,93,255,0.10), 0 1px 0 rgba(255,255,255,0.9) inset',
          }}
        >
          <div className='flex items-center justify-between px-5 sm:px-8 md:px-12 py-3 sm:py-3.5'>

            {/* LOGO */}
            <Link to="/">
              <img
                src={logo}
                className='nav-logo w-20 sm:w-24 md:w-28 transition-opacity duration-300'
              />
            </Link>

            {/* DESKTOP MENU */}
            <ul className='hidden sm:flex gap-8 md:gap-10 text-sm tracking-[0.14em]'>
              {["/", "/collection", "/about", "/contact"].map(path => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `nav-link-underline ${isActive ? 'nav-link-active font-medium' : 'font-normal'}`
                  }
                  style={({ isActive }) => ({
                    color: isActive ? '#2F5DFF' : darkMode ? '#CBD5E1' : '#6B7280',
                  })}
                >
                  {path === "/" ? "HOME" : path === "/collection" ? "COLLECTION" : path === "/about" ? "ABOUT" : "CONTACT"}
                </NavLink>
              ))}
            </ul>

            {/* ICONS */}
            <div className='flex items-center gap-5 sm:gap-6'>

              <button onClick={() => setShowSearch(true)}>
                <img src={search_icon} className={`w-5 sm:w-5 nav-icon-btn ${showSearch ? 'is-active' : ''}`} />
              </button>

              <button
                onClick={toggleTheme}
                className="theme-toggle"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                title={darkMode ? "Light mode" : "Dark mode"}
              >
                {darkMode ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                )}
              </button>

              <div className='relative' ref={profileRef}>
                <div
                  className='flex items-center gap-2 cursor-pointer'
                  onClick={() => user ? setShowProfileMenu(!showProfileMenu) : navigate("/login")}
                >
                  <img
                    src={profile_icon}
                    className={`w-5 sm:w-5 nav-icon-btn ${
                      showProfileMenu || location.pathname === '/profile' || location.pathname === '/orders'
                        ? 'is-active'
                        : ''
                    }`}
                  />
                  {user && (
                    <span className='hidden md:block text-sm tracking-wide font-medium nav-dark-profile-text' style={{ color: '#6B7280' }}>
                      {user.name}
                    </span>
                  )}
                </div>

                {user && showProfileMenu && (
                  <div
                    className='nav-dropdown-anim absolute right-0 mt-5 w-44 py-2 z-50 rounded-2xl overflow-hidden backdrop-blur-xl nav-dark-dropdown'
                    style={{
                      background: 'rgba(255,255,255,0.75)',
                      border: '0.75px solid rgba(47,93,255,0.18)',
                      boxShadow: '0 16px 40px rgba(47,93,255,0.14), 0 1px 0 rgba(255,255,255,0.9) inset',
                    }}
                  >
                    {[
                      { label: "My Profile", action: () => { navigate("/profile"); setShowProfileMenu(false); } },
                      { label: "Orders",     action: () => { navigate("/orders");  setShowProfileMenu(false); } },
                    ].map(({ label, action }) => (
                      <p
                        key={label}
                        onClick={action}
                        className='profile-dropdown-item px-5 py-2.5 text-sm tracking-wide cursor-pointer font-medium nav-dark-dropdown-item'
                        style={{ color: '#16307A' }}
                      >
                        {label}
                      </p>
                    ))}
                    <div className="mx-4 my-1 border-t nav-dark-border" style={{ borderColor: 'rgba(47,93,255,0.14)' }} />
                    <p
                      onClick={logout}
                      className='profile-dropdown-item px-5 py-2.5 text-sm tracking-wide cursor-pointer font-medium'
                      style={{ color: '#C23B3B' }}
                    >
                      Logout
                    </p>
                  </div>
                )}
              </div>

              <Link to='/cart' className='relative'>
                <img
                  src={cart_icon}
                  className={`w-5 sm:w-5 nav-icon-btn ${location.pathname === '/cart' ? 'is-active' : ''}`}
                />
                {user && getCartCount() > 0 && (
                  <span
                    className='absolute -right-2 -bottom-2 text-[11px] tracking-tight font-semibold w-4 h-4 flex items-center justify-center rounded-full'
                    style={{
                      background: '#2F5DFF',
                      color: '#FFFFFF',
                      boxShadow: '0 0 8px rgba(47,93,255,0.55)',
                      border: '1.5px solid rgba(255,255,255,0.9)',
                    }}
                  >
                    {getCartCount()}
                  </span>
                )}
              </Link>

              <button onClick={() => setVisible(true)} className='sm:hidden'>
                <img src={menu_icon} className={`w-5 nav-icon-btn ${visible ? 'is-active' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {visible && (
        <div
          onClick={() => setVisible(false)}
          className="fixed inset-0 z-40 sm:hidden nav-dark-overlay"
          style={{ background: 'rgba(16,24,64,0.35)', backdropFilter: 'blur(6px)' }}
        />
      )}

      <div className={`
        fixed top-0 right-0 h-full w-72
        backdrop-blur-xl
        z-50
        transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        sm:hidden
        ${visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
        style={{
          background: 'rgba(255,255,255,0.85)',
          borderLeft: '0.75px solid rgba(47,93,255,0.18)',
          boxShadow: '-20px 0 60px rgba(47,93,255,0.16)',
        }}
      >
        <div className="flex flex-col nav-font h-full nav-dark-drawer">

          <div
            className='flex items-center justify-between px-8 py-7 border-b nav-dark-border'
            style={{ borderColor: 'rgba(47,93,255,0.14)' }}
          >
            <img
              src={logo}
              className='nav-logo w-20'
            />
            <button
              onClick={() => setVisible(false)}
              className='text-xl leading-none font-light transition-colors nav-dark-close'
              style={{ color: '#6B7280' }}
            >
              ✕
            </button>
          </div>

          <nav className='flex flex-col mt-4 px-4'>
            {["/", "/collection", "/about", "/contact"].map(path => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setVisible(false)}
                className={({ isActive }) =>
                  `px-4 py-4 text-sm tracking-[0.14em] rounded-xl transition-all duration-200 ${isActive ? 'font-medium' : 'font-normal'}`
                }
                style={({ isActive }) => ({
                  color: isActive ? '#2F5DFF' : darkMode ? '#CBD5E1' : '#6B7280',
                  background: isActive ? 'rgba(47,93,255,0.08)' : 'transparent',
                })}
              >
                {path === "/" ? "HOME" : path === "/collection" ? "COLLECTION" : path === "/about" ? "ABOUT" : "CONTACT"}
              </NavLink>
            ))}
          </nav>

          {user && (
            <div
              className='mt-auto px-8 py-8 border-t space-y-3 nav-dark-border'
              style={{ borderColor: 'rgba(47,93,255,0.14)' }}
            >
              <p
                className='text-xs tracking-[0.2em] uppercase font-medium mb-4'
                style={{ color: '#2F5DFF', opacity: 0.7 }}
              >
                Account
              </p>
              <p
                onClick={() => { navigate("/profile"); setVisible(false); }}
                className='text-sm cursor-pointer transition-colors hover:text-[#2F5DFF] nav-dark-text'
                style={{ color: '#6B7280' }}
              >
                My Profile
              </p>
              <p
                onClick={() => { navigate("/orders"); setVisible(false); }}
                className='text-sm cursor-pointer transition-colors hover:text-[#2F5DFF] nav-dark-text'
                style={{ color: '#6B7280' }}
              >
                Orders
              </p>
              <p
                onClick={logout}
                className='text-sm cursor-pointer'
                style={{ color: '#C23B3B' }}
              >
                Logout
              </p>
            </div>
          )}
        </div>
      </div>

      {showSearch && <SearchBar setShowSearch={setShowSearch} />}
    </>
  );
};

export default Navbar;