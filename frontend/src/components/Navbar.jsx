import React, { useState, useContext, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link, NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import search_icon from "../assets/search_icon.png";
import profile_icon from "../assets/profile_icon.png";
import cart_icon from "../assets/cart_icon.png";
import menu_icon from "../assets/menu_icon.png";
import SearchBar from "./SearchBar";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";

const NAV_LINKS = [
  { path: "/", label: "Home" },
  { path: "/collection", label: "Collection" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");

    if (saved) return saved === "dark";

    return (
      window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
    );
  });

  const {
    user,
    logoutUser,
    getCartCount,
    wishlistProducts = [],
    getWishlistCount,
  } = useContext(ShopContext);

  const profileRef = useRef(null);

  /* ── Force logout (admin blocked this account) ── */
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== "forceLogout" || !event.newValue) return;

      let data;
      let currentUser;

      try {
        data = JSON.parse(event.newValue);
        currentUser = JSON.parse(localStorage.getItem("user"));
      } catch {
        return;
      }

      if (
        currentUser &&
        String(currentUser.id) === String(data.userId)
      ) {
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
            border: "1px solid rgba(75,83,32,0.25)",
            borderRadius: "16px",
            color: "#33361F",
            fontFamily: "'Jost', sans-serif",
            boxShadow:
              "0 8px 32px rgba(75,83,32,0.16), 0 1px 0 rgba(255,255,255,0.8) inset",
          },
        });

        setTimeout(() => {
          logoutUser();
          navigate("/login");
        }, 300);
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [logoutUser, navigate]);

  /* ── Close profile menu on outside click ── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ── Scroll: compact bar + close profile menu ── */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
      setShowProfileMenu(false);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* ── Escape closes menus ── */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setShowProfileMenu(false);
        setDrawerOpen(false);
      }
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  /* ── Close menus on route change ── */
  useEffect(() => {
    setShowProfileMenu(false);
    setDrawerOpen(false);
  }, [location.pathname]);

  /* ── Lock page scroll while drawer is open ── */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  /* ── Close drawer when the screen grows to desktop ── */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");

    const handleChange = (e) => {
      if (e.matches) setDrawerOpen(false);
    };

    mq.addEventListener("change", handleChange);

    return () => {
      mq.removeEventListener("change", handleChange);
    };
  }, []);

  /* ── Dark mode ── */
  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark-mode",
      darkMode
    );

    localStorage.setItem(
      "theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  /* Navbar stays hidden on auth pages */
  if (
    location.pathname === "/login" ||
    location.pathname === "/register"
  ) {
    return null;
  }

  const logout = () => {
    logoutUser();
    setShowProfileMenu(false);
    setDrawerOpen(false);
    navigate("/");
  };

  const goTo = (path) => {
    navigate(path);
    setShowProfileMenu(false);
    setDrawerOpen(false);
  };

  const cartCount = user ? getCartCount() : 0;

  const wishlistCount = user
    ? typeof getWishlistCount === "function"
      ? getWishlistCount()
      : wishlistProducts.length
    : 0;

  const profileActive =
    showProfileMenu ||
    location.pathname === "/profile" ||
    location.pathname === "/orders";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap');

        /* ══════════ Theme tokens ══════════ */

        :root {
          --nav-h: 76px;
          --link-px: clamp(0.6rem, 1.1vw, 0.9rem);
          --nav-h-compact: 64px;

          --nav-bg: rgba(241, 244, 232, 0.88);
          --nav-bg-solid: #F1F4E8;

          --nav-border: rgba(75, 83, 32, 0.14);

          --nav-text: #262917;
          --nav-text-muted: #5E6343;

          --nav-accent: #56701C;
          --nav-accent-soft: rgba(86, 112, 28, 0.10);
          --nav-accent-ring: rgba(86, 112, 28, 0.35);

          --nav-dropdown-bg: #F1F4E8;

          --nav-danger: #A6503B;
          --nav-danger-soft: rgba(166, 80, 59, 0.09);

          --nav-overlay: rgba(20, 21, 14, 0.42);

          --nav-shadow:
            0 10px 30px -12px
            rgba(38, 41, 23, 0.22);

          --nav-logo-filter: none;

          --nav-icon-filter:
            grayscale(1)
            opacity(0.7);

          --nav-icon-filter-hover:
            grayscale(0)
            opacity(1);
        }

        html.dark-mode {
          --nav-bg: rgba(0, 0, 0, 0.88);
          --nav-bg-solid: #000000;

          --nav-border:
            rgba(255, 255, 255, 0.10);

          --nav-text: #F0F1E0;
          --nav-text-muted: #B3B997;

          --nav-accent: #B4CF74;
          --nav-accent-soft:
            rgba(180, 207, 116, 0.12);

          --nav-accent-ring:
            rgba(180, 207, 116, 0.45);

          --nav-dropdown-bg: #000000;

          --nav-danger: #E0907A;
          --nav-danger-soft:
            rgba(224, 144, 122, 0.12);

          --nav-overlay:
            rgba(0, 0, 0, 0.72);

          --nav-shadow:
            0 10px 30px -12px
            rgba(0, 0, 0, 0.75);

          --nav-logo-filter: none;

          --nav-icon-filter:
            grayscale(1)
            invert(1)
            opacity(0.75);

          --nav-icon-filter-hover:
            grayscale(0.2)
            invert(1)
            opacity(1);
        }

        html.dark-mode,
        html.dark-mode body {
          background: #000000;
          color: var(--nav-text);
        }

        html,
        body {
          transition:
            background-color 0.3s ease,
            color 0.3s ease;
        }

        .sl-font {
          font-family:
            'Jost',
            system-ui,
            sans-serif;
        }

        /* ══════════ Bar ══════════ */

        .sl-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;

          z-index: 50;

          height: var(--nav-h);

          background: var(--nav-bg);

          border-bottom:
            1px solid
            var(--nav-border);

          backdrop-filter:
            blur(18px)
            saturate(1.6);

          -webkit-backdrop-filter:
            blur(18px)
            saturate(1.6);

          transition:
            height 0.3s cubic-bezier(.2,.8,.2,1),
            background 0.3s ease,
            border-color 0.3s ease,
            box-shadow 0.3s ease;
        }

        .sl-nav.is-scrolled {
          height: var(--nav-h-compact);

          box-shadow: var(--nav-shadow);
        }

        .sl-inner {
          height: 100%;

          max-width: 1440px;

          margin: 0 auto;

          padding: 0 max(clamp(1rem, 3vw, 2.5rem), env(safe-area-inset-right)) 0 max(clamp(1rem, 3vw, 2.5rem), env(safe-area-inset-left));

          display: grid;

          grid-template-columns:
            1fr
            auto
            1fr;

          align-items: center;

          gap: clamp(0.75rem, 2vw, 1.5rem);
        }

        /* ══════════ Logo ══════════ */

        .sl-logo {
          justify-self: start;

          display: inline-flex;

          align-items: center;

          border-radius: 8px;
        }

        .sl-logo img {
          height: clamp(32px, 3.2vw, 40px); width: auto; max-width: 42vw; object-fit: contain;

          display: block;

          filter:
            var(--nav-logo-filter);

          transition:
            height 0.3s
              cubic-bezier(.2,.8,.2,1),
            transform 0.3s ease;
        }

        .sl-nav.is-scrolled
        .sl-logo img {
          height: 34px;
        }

        .sl-logo:hover img {
          transform: scale(1.04);
        }

        /* ══════════ Center links ══════════ */

        .sl-links {
          display: flex;

          align-items: center;

          gap:
            clamp(
              0.25rem,
              1.2vw,
              0.9rem
            );
        }

        .sl-link {
          position: relative;

          padding: 0.55rem var(--link-px); font-size: clamp(0.9rem, 0.86rem + 0.15vw, 1rem); white-space: nowrap;

          font-weight: 400;

          letter-spacing: 0.02em;

          text-decoration: none;

          color: var(--nav-text-muted);

          border-radius: 8px;

          transition:
            color 0.25s ease;
        }

        .sl-link::after {
          content: "";

          position: absolute;

          left: var(--link-px); right: var(--link-px); bottom: 0.2rem;

          height: 2px;

          border-radius: 2px;

          background:
            var(--nav-accent);

          transform:
            scaleX(0);

          transform-origin: right;

          transition:
            transform 0.35s
            cubic-bezier(.2,.8,.2,1);
        }

        .sl-link:hover {
          color: var(--nav-text);
        }

        .sl-link:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        .sl-link.is-active {
          color: var(--nav-text);
          font-weight: 500;
        }

        .sl-link.is-active::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        /* ══════════ Right actions ══════════ */

        .sl-actions {
          justify-self: end;

          display: flex;

          align-items: center;

          gap: 0.25rem;
        }

        .sl-icon-btn {
          position: relative;

          width: 2.5rem;
          height: 2.5rem;

          display: inline-flex;

          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border: 0;

          border-radius: 9999px;

          background: transparent;

          color:
            var(--nav-text-muted);

          cursor: pointer;

          text-decoration: none;

          transition:
            background 0.25s ease,
            color 0.25s ease,
            transform 0.25s
              cubic-bezier(.2,.8,.2,1);
        }

        .sl-icon-btn:hover {
          background:
            var(--nav-accent-soft);

          color:
            var(--nav-accent);

          transform:
            translateY(-1px);
        }

        .sl-icon-btn:active {
          transform:
            translateY(0)
            scale(0.94);
        }

        .sl-icon-btn.is-active {
          background:
            var(--nav-accent-soft);
        }

        .sl-icon-btn img {
          width: 1.1rem;
          height: 1.1rem;

          object-fit: contain;

          filter:
            var(--nav-icon-filter);

          transition:
            filter 0.25s ease;
        }

        .sl-icon-btn:hover img,
        .sl-icon-btn.is-active img {
          filter:
            var(--nav-icon-filter-hover);
        }

        .sl-icon-btn svg {
          width: 1.1rem;
          height: 1.1rem;

          transition:
            transform 0.45s
            cubic-bezier(.34,1.56,.64,1);
        }

        .sl-theme-btn:hover svg {
          transform: rotate(25deg);
        }

        /* ══════════ Wishlist icon ══════════ */

        .sl-wishlist-link svg {
          width: 1.25rem;
          height: 1.25rem;

          fill: none;

          stroke: currentColor;

          stroke-width: 1.7;

          stroke-linecap: round;
          stroke-linejoin: round;

          transition:
            transform 0.3s
            cubic-bezier(.34,1.56,.64,1),
            fill 0.25s ease,
            color 0.25s ease;
        }

        .sl-wishlist-link:hover svg {
          transform: scale(1.12);
        }

        .sl-wishlist-link.is-active svg {
          color: var(--nav-accent);
        }

        .sl-wishlist-link.has-items svg {
          fill: rgba(166, 80, 59, 0.12);
        }

        .sl-wishlist-link .sl-badge {
          pointer-events: none;
        }

        /* ══════════ Divider ══════════ */

        .sl-divider {
          width: 1px;
          height: 1.3rem;

          margin:
            0
            0.4rem;

          background:
            var(--nav-border);
        }

        /* ══════════ Cart and wishlist badges ══════════ */

        .sl-badge {
          position: absolute;

          top: 0.15rem;
          right: 0.1rem;

          min-width: 1.05rem;
          height: 1.05rem;

          padding:
            0
            0.28rem;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 9999px;

          font-size: 0.64rem;

          font-weight: 600;

          line-height: 1;

          background:
            var(--nav-accent);

          color:
            var(--nav-bg-solid);

          border:
            2px solid
            var(--nav-bg-solid);

          animation:
            sl-pop
            0.35s
            cubic-bezier(.34,1.56,.64,1);
        }

        .sl-wishlist-badge {
          background: #A6503B;
          color: #FFFFFF;
        }

        html.dark-mode .sl-wishlist-badge {
          background: #E0907A;
          color: #000000;
        }

        @keyframes sl-pop {
          from {
            transform: scale(0);
          }

          to {
            transform: scale(1);
          }
        }

        /* ══════════ Profile ══════════ */

        .sl-profile {
          position: relative;
        }

        .sl-profile-btn {
          display: inline-flex;

          align-items: center;

          gap: 0.5rem;

          height: 2.5rem;

          padding:
            0
            0.85rem
            0
            0.7rem;

          border:
            1px solid
            var(--nav-border);

          border-radius: 9999px;

          background: transparent;

          color:
            var(--nav-text);

          font: inherit;

          font-size: 0.88rem;

          font-weight: 400;

          cursor: pointer;

          transition:
            background 0.25s ease,
            border-color 0.25s ease,
            transform 0.25s ease;
        }

        .sl-profile-btn:hover,
        .sl-profile-btn.is-open {
          background:
            var(--nav-accent-soft);

          border-color:
            var(--nav-accent-ring);
        }

        .sl-profile-btn img {
          width: 1.05rem;
          height: 1.05rem;

          object-fit: contain;

          filter:
            var(--nav-icon-filter-hover);
        }

        .sl-profile-name {
          display: none;

          max-width: 8rem;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;
        }

        .sl-chevron {
          width: 0.7rem;
          height: 0.7rem;

          color:
            var(--nav-text-muted);

          transition:
            transform 0.3s
            cubic-bezier(.2,.8,.2,1);
        }

        .sl-profile-btn.is-open
        .sl-chevron {
          transform: rotate(180deg);
        }

        @media (min-width: 1280px) { .sl-profile-name { display: block; } }

        .sl-menu {
          position: absolute;

          right: 0;

          top:
            calc(100% + 0.7rem);

          width: 12.5rem;

          padding: 0.4rem;

          border-radius: 12px;

          background:
            var(--nav-dropdown-bg);

          border:
            1px solid
            var(--nav-border);

          box-shadow:
            0 24px 48px -16px
            rgba(20, 21, 14, 0.35);

          transform-origin:
            top right;

          animation:
            sl-menu-in
            0.22s
            cubic-bezier(.16,1,.3,1)
            both;
        }

        @keyframes sl-menu-in {
          from {
            opacity: 0;
            transform:
              translateY(-6px)
              scale(.97);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }

        .sl-menu-head {
          padding:
            0.6rem
            0.8rem
            0.7rem;

          margin-bottom: 0.3rem;

          border-bottom:
            1px solid
            var(--nav-border);
        }

        .sl-menu-head b {
          display: block;

          font-size: 0.9rem;

          font-weight: 500;

          color:
            var(--nav-text);

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;
        }

        .sl-menu-head span {
          font-size: 0.75rem;

          color:
            var(--nav-text-muted);
        }

        .sl-menu-item {
          display: block;

          width: 100%;

          padding:
            0.6rem
            0.8rem;

          border: 0;

          border-radius: 8px;

          background: transparent;

          text-align: left;

          font: inherit;

          font-size: 0.9rem;

          color:
            var(--nav-text-muted);

          cursor: pointer;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            padding-left 0.2s ease;
        }

        .sl-menu-item:hover {
          background:
            var(--nav-accent-soft);

          color:
            var(--nav-text);

          padding-left: 1rem;
        }

        .sl-menu-item.is-danger {
          color:
            var(--nav-danger);
        }

        .sl-menu-item.is-danger:hover {
          background:
            var(--nav-danger-soft);

          color:
            var(--nav-danger);
        }

        .sl-menu-sep {
          height: 1px;

          margin:
            0.3rem 0;

          background:
            var(--nav-border);
        }

        /* ══════════ Focus ══════════ */

        .sl-nav a:focus-visible,
        .sl-nav button:focus-visible,
        .sl-drawer a:focus-visible,
        .sl-drawer button:focus-visible {
          outline:
            2px solid
            var(--nav-accent);

          outline-offset: 2px;
        }

        /* ══════════ Mobile ══════════ */

        .sl-mobile-only {
          display: none;
        }

        @media (max-width: 1023px) {
          :root {
            --nav-h: 64px;
            --nav-h-compact: 58px;
          }

          .sl-inner {
            grid-template-columns:
              auto
              1fr;

            gap: 0.75rem;
          }

          .sl-links {
            display: none;
          }

          .sl-mobile-only {
            display: inline-flex;
          }

          .sl-desktop-only {
            display: none !important;
          }

          .sl-logo img {
            height: 34px;
          }

          .sl-nav.is-scrolled
          .sl-logo img {
            height: 30px;
          }

          .sl-actions {
            gap: 0.1rem;
          }

          .sl-icon-btn {
            width: 2.5rem; height: 2.5rem;
          }

          .sl-icon-btn img {
            width: 1.05rem;
            height: 1.05rem;
          }

          .sl-wishlist-link svg {
            width: 1.2rem;
            height: 1.2rem;
          }

          .sl-badge {
            top: 0.05rem;
            right: 0;
          }

          .sl-divider {
            margin: 0 0.15rem;
          }
        }

        .sl-overlay {
          position: fixed;

          inset: 0;

          z-index: 55;

          background:
            var(--nav-overlay);

          backdrop-filter:
            blur(4px);

          -webkit-backdrop-filter:
            blur(4px);

          opacity: 0;

          pointer-events: none;

          transition:
            opacity 0.35s ease;
        }

        .sl-overlay.is-open {
          opacity: 1;

          pointer-events: auto;
        }

        .sl-drawer {
          position: fixed;

          top: 0;
          right: 0;
          bottom: 0;

          z-index: 60;

          width: min(22rem, 90vw); overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch;

          display: flex;

          flex-direction: column;

          background:
            var(--nav-dropdown-bg);

          border-left:
            1px solid
            var(--nav-border);

          box-shadow:
            -24px 0
            64px
            rgba(20, 21, 14, 0.25);

          transform:
            translateX(100%);

          visibility: hidden;

          transition:
            transform 0.45s
              cubic-bezier(.16,1,.3,1),
            visibility 0s
              linear
              0.45s;
        }

        .sl-drawer.is-open {
          transform:
            translateX(0);

          visibility: visible;

          transition:
            transform 0.45s
              cubic-bezier(.16,1,.3,1),
            visibility 0s;
        }

        .sl-drawer-head {
          display: flex;

          align-items: center;

          justify-content: space-between;

          box-sizing: border-box; flex-shrink: 0; min-height: calc(var(--nav-h) + env(safe-area-inset-top)); padding: env(safe-area-inset-top) 1.25rem 0 1.5rem; position: sticky; top: 0; z-index: 1; background: var(--nav-dropdown-bg);

          border-bottom:
            1px solid
            var(--nav-border);
        }

        .sl-drawer-head img {
          height: 34px;

          width: auto;

          filter:
            var(--nav-logo-filter);
        }

        .sl-drawer-links {
          display: flex;

          flex-direction: column;

          gap: 0.2rem;

          padding:
            1rem
            0.9rem;
        }

        .sl-drawer-link {
          position: relative;

          padding:
            0.9rem
            1rem;

          border-radius: 10px;

          font-size: 1.05rem;

          text-decoration: none;

          color:
            var(--nav-text-muted);

          transition:
            background 0.2s ease,
            color 0.2s ease,
            padding-left 0.25s ease;
        }

        .sl-drawer-link:hover {
          background:
            var(--nav-accent-soft);

          color:
            var(--nav-text);

          padding-left:
            1.3rem;
        }

        .sl-drawer-link.is-active {
          background:
            var(--nav-accent-soft);

          color:
            var(--nav-accent);

          font-weight: 500;
        }

        .sl-drawer-link.is-active::before {
          content: "";

          position: absolute;

          left: 0;

          top: 22%;
          bottom: 22%;

          width: 3px;

          border-radius: 3px;

          background:
            var(--nav-accent);
        }

        .sl-drawer-foot {
          margin-top: auto;

          padding: 1.25rem 1.5rem calc(1.75rem + env(safe-area-inset-bottom));

          border-top:
            1px solid
            var(--nav-border);
        }

        .sl-drawer-user {
          margin:
            0
            0.75rem;

          font-size: 0.85rem;

          color:
            var(--nav-text-muted);
        }

        .sl-drawer-user b {
          color:
            var(--nav-text);

          font-weight: 500;
        }

        .sl-drawer-foot
        .sl-menu-item {
          padding-left: 0.5rem;
        }

        .sl-drawer-foot
        .sl-menu-item:hover {
          padding-left: 0.8rem;
        }

        .sl-login-btn {
          display: block;

          padding:
            0.8rem
            1rem;

          border-radius: 10px;

          text-align: center;

          text-decoration: none;

          font-size: 0.95rem;

          font-weight: 500;

          background:
            var(--nav-accent);

          color:
            var(--nav-bg-solid);

          transition:
            opacity 0.2s ease;
        }

        .sl-login-btn:hover {
          opacity: 0.9;
        }

        .sl-drawer-wishlist {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;

          margin: 0.25rem 0 0.75rem;
          padding: 0.85rem 1rem;

          border: 1px solid var(--nav-border);
          border-radius: 10px;

          color: var(--nav-text);
          text-decoration: none;

          transition:
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .sl-drawer-wishlist:hover,
        .sl-drawer-wishlist.is-active {
          background: var(--nav-accent-soft);
          border-color: var(--nav-accent-ring);
        }

        .sl-drawer-wishlist-label {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
        }

        .sl-drawer-wishlist svg {
          width: 1.15rem;
          height: 1.15rem;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .sl-drawer-wishlist-count {
          min-width: 1.35rem;
          height: 1.35rem;
          padding: 0 0.35rem;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          border-radius: 9999px;

          background: var(--nav-accent);
          color: var(--nav-bg-solid);

          font-size: 0.7rem;
          font-weight: 600;
        }

        /* ══════════ Fine-tuning per screen size ══════════ */

        .sl-drawer-theme {
          display: none;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;

          width: 100%;
          margin: 0 0 0.75rem;
          padding: 0.85rem 1rem;

          border: 1px solid var(--nav-border);
          border-radius: 10px;
          background: transparent;
          color: var(--nav-text);

          font: inherit;
          font-size: 0.95rem;
          cursor: pointer;

          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .sl-drawer-theme:hover {
          background: var(--nav-accent-soft);
          border-color: var(--nav-accent-ring);
        }

        .sl-drawer-theme span {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
        }

        .sl-drawer-theme svg {
          width: 1.15rem;
          height: 1.15rem;
        }

        /* Touch devices: 44px tap targets */
        @media (max-width: 1023px) and (pointer: coarse) {
          .sl-icon-btn {
            width: 2.75rem;
            height: 2.75rem;
          }
        }

        /* Phones: theme switch moves into the drawer */
        @media (max-width: 480px) {
          .sl-bar-theme {
            display: none;
          }

          .sl-drawer-theme {
            display: flex;
          }

          .sl-inner {
            gap: 0.5rem;
          }
        }

        /* Very small phones (320–359px) */
        @media (max-width: 359px) {
          .sl-icon-btn {
            width: 2.4rem;
            height: 2.4rem;
          }

          .sl-nav .sl-logo img,
          .sl-nav.is-scrolled .sl-logo img {
            height: 28px;
          }
        }

        /* Short landscape phones: keep the bar slim */
        @media (max-height: 480px) and (orientation: landscape) {
          :root {
            --nav-h: 56px;
            --nav-h-compact: 52px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sl-nav *,
          .sl-drawer,
          .sl-overlay,
          .sl-menu,
          .sl-badge {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* ═════════════ TOP BAR ═════════════ */}

      <header
        className={`sl-nav sl-font ${
          scrolled ? "is-scrolled" : ""
        }`}
      >
        <div className="sl-inner">
          {/* Logo */}

          <Link
            to="/"
            className="sl-logo"
            aria-label="SLOG home"
          >
            <img src={logo} alt="SLOG" />
          </Link>

          {/* Center links */}

          <nav
            className="sl-links"
            aria-label="Primary"
          >
            {NAV_LINKS.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                className={({ isActive }) =>
                  `sl-link ${
                    isActive ? "is-active" : ""
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}

          <div className="sl-actions">
            {/* Search */}

            <button
              type="button"
              className={`sl-icon-btn ${
                showSearch ? "is-active" : ""
              }`}
              onClick={() => setShowSearch(true)}
              aria-label="Search"
            >
              <img src={search_icon} alt="" />
            </button>

            {/* Dark mode toggle */}

            <button
              type="button"
              className="sl-icon-btn sl-theme-btn sl-bar-theme"
              onClick={toggleTheme}
              aria-label={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title={
                darkMode
                  ? "Light mode"
                  : "Dark mode"
              }
            >
              {darkMode ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="4" />

                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
                </svg>
              )}
            </button>

            <span
              className="sl-divider sl-desktop-only"
              aria-hidden="true"
            />

            {/* Profile (desktop) */}

            <div
              className="sl-profile sl-desktop-only"
              ref={profileRef}
            >
              <button
                type="button"
                className={`sl-profile-btn ${
                  showProfileMenu ? "is-open" : ""
                }`}
                onClick={() =>
                  user
                    ? setShowProfileMenu((v) => !v)
                    : navigate("/login")
                }
                aria-haspopup={
                  user ? "menu" : undefined
                }
                aria-expanded={
                  user
                    ? showProfileMenu
                    : undefined
                }
                aria-label={
                  user
                    ? "Account menu"
                    : "Log in"
                }
              >
                <img
                  src={profile_icon}
                  alt=""
                />

                <span className="sl-profile-name">
                  {user ? user.name : "Log in"}
                </span>

                {user && (
                  <svg
                    className="sl-chevron"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2 4.5 6 8.5l4-4" />
                  </svg>
                )}
              </button>

              {user && showProfileMenu && (
                <div
                  className="sl-menu"
                  role="menu"
                >
                  <div className="sl-menu-head">
                    <b>{user.name}</b>

                    <span>
                      Signed in
                    </span>
                  </div>

                  <button
                    type="button"
                    role="menuitem"
                    className="sl-menu-item"
                    onClick={() => goTo("/profile")}
                  >
                    My profile
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    className="sl-menu-item"
                    onClick={() => goTo("/orders")}
                  >
                    Orders
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    className="sl-menu-item"
                    onClick={() => goTo("/wishlist")}
                  >
                    My wishlist
                    {wishlistCount > 0
                      ? ` (${wishlistCount})`
                      : ""}
                  </button>

                  <div className="sl-menu-sep" />

                  <button
                    type="button"
                    role="menuitem"
                    className="sl-menu-item is-danger"
                    onClick={logout}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist */}

            <Link
              to="/wishlist"
              className={`sl-icon-btn sl-wishlist-link ${
                location.pathname === "/wishlist"
                  ? "is-active"
                  : ""
              } ${
                wishlistCount > 0 ? "has-items" : ""
              }`}
              aria-label={
                wishlistCount > 0
                  ? `Wishlist, ${wishlistCount} saved items`
                  : "Wishlist"
              }
              title="Wishlist"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
              </svg>

              {wishlistCount > 0 && (
                <span
                  className="sl-badge sl-wishlist-badge"
                  key={`wishlist-${wishlistCount}`}
                >
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}

            <Link
              to="/cart"
              className={`sl-icon-btn ${
                location.pathname === "/cart"
                  ? "is-active"
                  : ""
              }`}
              aria-label={
                cartCount > 0
                  ? `Cart, ${cartCount} items`
                  : "Cart"
              }
              title="Cart"
            >
              <img
                src={cart_icon}
                alt=""
              />

              {cartCount > 0 && (
                <span
                  className="sl-badge"
                  key={cartCount}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}

            <button
              type="button"
              className={`sl-icon-btn sl-mobile-only ${
                drawerOpen ? "is-active" : ""
              }`}
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
            >
              <img
                src={menu_icon}
                alt=""
              />
            </button>
          </div>
        </div>
      </header>

      {/* ═════════════ MOBILE DRAWER ═════════════ */}

      <div
        className={`sl-overlay ${
          drawerOpen ? "is-open" : ""
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`sl-drawer sl-font ${
          drawerOpen ? "is-open" : ""
        }`}
        aria-label="Mobile menu"
        aria-hidden={!drawerOpen}
      >
        <div className="sl-drawer-head">
          <img
            src={logo}
            alt="SLOG"
          />

          <button
            type="button"
            className="sl-icon-btn"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav
          className="sl-drawer-links"
          aria-label="Mobile"
        >
          {NAV_LINKS.map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className={({ isActive }) =>
                `sl-drawer-link ${
                  isActive ? "is-active" : ""
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sl-drawer-foot">
          {/* Theme switch (phones only) */}

          <button
            type="button"
            className="sl-drawer-theme"
            onClick={toggleTheme}
          >
            <span>
              {darkMode ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
                </svg>
              )}
              {darkMode ? "Light mode" : "Dark mode"}
            </span>
          </button>

          {/* Wishlist shortcut in the mobile drawer */}

          <Link
            to="/wishlist"
            className={`sl-drawer-wishlist ${
              location.pathname === "/wishlist"
                ? "is-active"
                : ""
            }`}
            onClick={() => setDrawerOpen(false)}
          >
            <span className="sl-drawer-wishlist-label">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
              </svg>

              My wishlist
            </span>

            {wishlistCount > 0 && (
              <span className="sl-drawer-wishlist-count">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <p className="sl-drawer-user">
                Signed in as{" "}
                <b>{user.name}</b>
              </p>

              <button
                type="button"
                className="sl-menu-item"
                onClick={() => goTo("/profile")}
              >
                My profile
              </button>

              <button
                type="button"
                className="sl-menu-item"
                onClick={() => goTo("/orders")}
              >
                Orders
              </button>

              <button
                type="button"
                className="sl-menu-item is-danger"
                onClick={logout}
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="sl-login-btn"
              onClick={() => setDrawerOpen(false)}
            >
              Log in
            </Link>
          )}
        </div>
      </aside>

      {/* ═════════════ SEARCH ═════════════ */}

      {showSearch && (
        <SearchBar
          setShowSearch={setShowSearch}
        />
      )}
    </>
  );
};

export default Navbar;