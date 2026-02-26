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
  const { user, logoutUser, getCartCount } = useContext(ShopContext);

  const profileRef = useRef(null)


  // ✅ FORCE LOGOUT LISTENER WITH TOAST FIX
  useEffect(() => {

    const handleStorage = (event) => {

      if (event.key === "forceLogout") {

        const data =
          JSON.parse(event.newValue);

        const currentUser =
          JSON.parse(
            localStorage.getItem("user")
          );

        if (
          currentUser &&
          String(currentUser.id) ===
          String(data.userId)
        ) {

          // ✅ SHOW TOAST FIRST
          toast.error(
            "Admin blocked your account",
            {
              position: "top-center",
              autoClose: 2000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: false,
              style: {
                background: "rgba(228,221,211,0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid #D4CCC0",
                borderRadius: "12px",
                color: "#2C2825",
                fontFamily: "Jost, sans-serif"
              }
            }
          );

          // ✅ DELAY LOGOUT SO TOAST SHOWS
          setTimeout(() => {

            logoutUser();

            navigate("/login");

          }, 300);

        }

      }

    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () =>
      window.removeEventListener(
        "storage",
        handleStorage
      );

  }, [logoutUser, navigate]);


  // CLOSE ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // CLOSE ON SCROLL
  useEffect(() => {
    const handleScroll = () => setShowProfileMenu(false);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // CLOSE ON ROUTE CHANGE
  useEffect(() => {
    setShowProfileMenu(false);
  }, [location.pathname]);

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
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&display=swap');
        .nav-font { font-family: 'Jost', sans-serif; }
        .nav-link-underline { position: relative; }
        .nav-link-underline::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -2px;
          height: 1px;
          width: 0;
          background: #8B6F5E;
          transition: width 0.3s ease;
        }
        .nav-link-underline:hover::after,
        .nav-link-active::after { width: 100% !important; }
        .nav-link-active::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -2px;
          height: 1px;
          width: 100%;
          background: #8B6F5E;
        }
        .profile-dropdown-item { transition: background 0.2s, padding-left 0.2s; }
        .profile-dropdown-item:hover {
          padding-left: 1.75rem;
          background: rgba(212,204,192,0.4);
        }
      `}</style>

      {/* NAVBAR */}
      <div className='
        sticky top-0 sm:top-3
        z-50
        nav-font
        backdrop-blur-xl
        border border-[rgba(212,204,192,0.55)]
        shadow-[0_4px_30px_rgba(44,40,37,0.07)]
        rounded-3xl sm:rounded-2xl
        mx-0 sm:mx-6
      ' style={{ background: 'rgba(237,232,224,0.65)' }}>
        <div className='flex items-center justify-between px-5 sm:px-8 md:px-12 py-3 sm:py-3.5'>

          {/* LOGO */}
          <Link to="/">
            <img src={logo} className='w-20 sm:w-24 md:w-28 hover:opacity-75 transition-opacity duration-300' />
          </Link>

          {/* DESKTOP MENU */}
          <ul className='hidden sm:flex gap-8 md:gap-10 text-sm tracking-[0.14em]' style={{ color: '#6B6058' }}>
            {["/", "/collection", "/about", "/contact"].map(path => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `nav-link-underline ${isActive ? 'nav-link-active font-medium' : 'font-normal'}`}
                style={({ isActive }) => ({ color: isActive ? '#2C2825' : '#6B6058' })}
              >
                {path === "/" ? "HOME" : path === "/collection" ? "COLLECTION" : path === "/about" ? "ABOUT" : "CONTACT"}
              </NavLink>
            ))}
          </ul>

          {/* ICONS */}
          <div className='flex items-center gap-5 sm:gap-6'>

            {/* SEARCH */}
            <button onClick={() => setShowSearch(true)} className='w-5 sm:w-5 opacity-80 hover:opacity-50 transition-opacity duration-200'>
              <img src={search_icon} className='w-full' />
            </button>

            {/* PROFILE */}
            <div className='relative' ref={profileRef}>
              <div
                className='flex items-center gap-2 cursor-pointer opacity-80 hover:opacity-50 transition-opacity duration-200'
                onClick={() => user ? setShowProfileMenu(!showProfileMenu) : navigate("/login")}
              >
                <img src={profile_icon} className='w-5 sm:w-5' />
                {user && (
                  <span className='hidden md:block text-sm tracking-wide font-medium' style={{ color: '#2C2825' }}>
                    {user.name}
                  </span>
                )}
              </div>

              {/* PROFILE DROPDOWN */}
              {user && showProfileMenu && (
                <div className='absolute right-0 mt-5 backdrop-blur-xl border shadow-[0_20px_60px_rgba(44,40,37,0.1)] w-44 py-2 z-50 rounded-2xl overflow-hidden'
                  style={{ background: 'rgba(228,221,211,0.92)', borderColor: '#D4CCC0' }}>
                  {[
                    { label: "My Profile", action: () => { navigate("/profile"); setShowProfileMenu(false); } },
                    { label: "Orders",     action: () => { navigate("/orders");  setShowProfileMenu(false); } },
                  ].map(({ label, action }) => (
                    <p key={label} onClick={action} className='profile-dropdown-item px-5 py-2.5 text-sm tracking-wide cursor-pointer font-medium' style={{ color: '#2C2825' }}>
                      {label}
                    </p>
                  ))}
                  <div className='mx-4 my-1 border-t' style={{ borderColor: '#D4CCC0' }} />
                  <p onClick={logout} className='profile-dropdown-item px-5 py-2.5 text-sm tracking-wide cursor-pointer font-medium' style={{ color: '#f00808' }}>
                    Logout
                  </p>
                </div>
              )}
            </div>

            {/* CART */}
            <Link to='/cart' className='relative opacity-80 hover:opacity-50 transition-opacity duration-200'>
              <img src={cart_icon} className='w-5 sm:w-5' />
              {user && getCartCount() > 0 && (
                <span className='absolute -right-2 -bottom-2 text-[11px] tracking-tight font-semibold w-4 h-4 flex items-center justify-center rounded-full'
                  style={{ background: '#2C2825', color: '#EDE8E0' }}>
                  {getCartCount()}
                </span>
              )}
            </Link>

            {/* MOBILE BUTTON */}
            <button onClick={() => setVisible(true)} className='sm:hidden opacity-80 hover:opacity-50 transition-opacity duration-200'>
              <img src={menu_icon} className='w-5' />
            </button>
          </div>
        </div>
      </div>

      {/* OVERLAY */}
      {visible && (
        <div
          onClick={() => setVisible(false)}
          className="fixed inset-0 z-40 sm:hidden"
          style={{ background: 'rgba(44,40,37,0.25)', backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* MOBILE MENU */}
      <div className={`
        fixed top-0 right-0 h-full w-72
        backdrop-blur-xl border-l
        shadow-[-20px_0_60px_rgba(44,40,37,0.08)]
        z-50
        transform transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]
        sm:hidden
        ${visible ? "translate-x-0" : "translate-x-full"}
      `} style={{ background: 'rgba(228,221,211,0.97)', borderColor: '#D4CCC0' }}>
        <div className="flex flex-col nav-font h-full">

          {/* Close */}
          <div className='flex items-center justify-between px-8 py-7 border-b' style={{ borderColor: '#D4CCC0' }}>
            <img src={logo} className='w-20' />
            <button onClick={() => setVisible(false)} className='transition-colors text-xl leading-none font-light' style={{ color: '#9A9188' }}>
              ✕
            </button>
          </div>

          {/* Links */}
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
                  color: isActive ? '#2C2825' : '#6B6058',
                  background: isActive ? 'rgba(212,204,192,0.45)' : 'transparent',
                })}
              >
                {path === "/" ? "HOME" : path === "/collection" ? "COLLECTION" : path === "/about" ? "ABOUT" : "CONTACT"}
              </NavLink>
            ))}
          </nav>

          {/* Bottom user actions */}
          {user && (
            <div className='mt-auto px-8 py-8 border-t space-y-3' style={{ borderColor: '#D4CCC0' }}>
              <p className='text-xs tracking-[0.2em] uppercase font-medium mb-4' style={{ color: '#9A9188' }}>Account</p>
              <p onClick={() => { navigate("/profile"); setVisible(false); }} className='text-sm cursor-pointer' style={{ color: '#4A4340' }}>My Profile</p>
              <p onClick={() => { navigate("/orders"); setVisible(false); }} className='text-sm cursor-pointer' style={{ color: '#4A4340' }}>Orders</p>
              <p onClick={logout} className='text-sm cursor-pointer' style={{ color: '#8B6F5E' }}>Logout</p>
            </div>
          )}
        </div>
      </div>

      {/* SEARCH */}
      {showSearch && <SearchBar setShowSearch={setShowSearch} />}
    </>
  );
};

export default Navbar;