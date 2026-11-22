import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let storedUser;

    try {
      storedUser = JSON.parse(localStorage.getItem("user"));
    } catch {
      storedUser = null;
    }

    if (!storedUser || !storedUser.id) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    axios
      .get(`${API_URL}/auth/me`, {
        withCredentials: true
      })
      .then((res) => {
        const profileUser = res.data?.user;

        if (!profileUser || !profileUser.id) {
          throw new Error("Invalid profile response");
        }

        setUser(profileUser);

        // Keep localStorage user information synchronized
        localStorage.setItem(
          "user",
          JSON.stringify(profileUser)
        );
      })
      .catch((error) => {
        console.error("Failed to load profile:", error);

        toast.error(
          error.response?.data?.message ||
            "Failed to load profile"
        );

        navigate("/");
      });
  }, [navigate]);

  if (!user)
    return (
      <div
        className="min-h-screen"
        style={{
          fontFamily: "'Jost', sans-serif",
          background: "var(--bg-primary)",
          padding: "3rem 2rem"
        }}
      >
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
            letterSpacing: "0.1em"
          }}
        >
          Loading…
        </p>
      </div>
    );

  const initial = (user.name || user.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&display=swap');

        /* ────────────────────────────────────────────────
           PAGE
        ──────────────────────────────────────────────── */

        .profile-root {
          --pf-olive: #6B8E23;
          --pf-olive-light: #A9C46C;
          --pf-olive-deep: #4B5320;
          --pf-olive-faint: rgba(107, 142, 35, 0.08);
          --pf-glass-bg: rgba(255, 255, 255, 0.65);
          --pf-glass-bg2: rgba(255, 255, 255, 0.95);
          --pf-glass-border: rgba(107, 142, 35, 0.16);
          --pf-glass-shine: rgba(255, 255, 255, 0.85);

          font-family: 'Jost', sans-serif;

          min-height: 100vh;

          background: var(--bg-primary);

          display: flex;
          flex-direction: column;
          align-items: center;

          padding:
            clamp(1.5rem, 4vw, 3rem)
            1rem
            3rem;
        }

        /* ────────────────────────────────────────────────
           BACK BUTTON
        ──────────────────────────────────────────────── */

        .profile-back-btn {
          background: var(--pf-glass-bg);

          border:
            1px solid
            var(--pf-glass-border);

          color: var(--text-secondary);

          backdrop-filter:
            blur(20px) saturate(1.7);
          -webkit-backdrop-filter:
            blur(20px) saturate(1.7);

          box-shadow:
            0 1px 0
            var(--pf-glass-shine)
            inset;

          transition:
            background 0.22s ease,
            color 0.22s ease,
            border-color 0.22s ease,
            transform 0.22s ease;

          opacity: 0;

          animation:
            pf-rise
            0.6s
            cubic-bezier(0.16, 1, 0.3, 1)
            forwards;
        }

        .profile-back-btn:hover {
          background: var(--pf-glass-bg2);

          color: var(--pf-olive-deep);

          border-color: var(--pf-olive);

          transform: translateX(-2px);
        }

        /* ────────────────────────────────────────────────
           PROFILE CONTENT
        ──────────────────────────────────────────────── */

        .profile-card {
          width: 100%;
          max-width: 440px;

          background: transparent;

          border: none;

          border-radius: 0;

          overflow: visible;

          backdrop-filter: none;
          -webkit-backdrop-filter: none;

          box-shadow: none;

          opacity: 0;

          animation:
            pf-rise
            0.7s
            cubic-bezier(0.16, 1, 0.3, 1)
            forwards;

          animation-delay: 0.1s;
        }

        @keyframes pf-rise {
          from {
            opacity: 0;
            filter: blur(10px);
            transform: translateY(18px) scale(0.98);
          }

          to {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0) scale(1);
          }
        }

        /* ────────────────────────────────────────────────
           TOP BAR
        ──────────────────────────────────────────────── */

        .profile-topbar {
          position: relative;

          background: transparent;

          border-bottom: none;

          padding:
            1.1rem 0;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .profile-topbar-title {
          font-weight: 600;
          font-size: 1.05rem;
          color: var(--text-primary);
        }

        .profile-topbar-title em {
          font-style: normal;
          color: var(--pf-olive-deep);
        }

        .profile-topbar-tag {
          font-size: 0.66rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }

        /* ────────────────────────────────────────────────
           BODY
        ──────────────────────────────────────────────── */

        .profile-body {
          padding: 1.3rem 0 2.2rem;
        }

        /* ────────────────────────────────────────────────
           AVATAR
        ──────────────────────────────────────────────── */

        .profile-avatar-row {
          display: flex;
          align-items: center;
          gap: 1.1rem;

          margin-bottom: 1.8rem;
          padding-bottom: 1.6rem;

          border-bottom:
            1px solid
            var(--pf-glass-border);

          opacity: 0;

          animation:
            pf-rise
            0.6s
            cubic-bezier(0.16, 1, 0.3, 1)
            forwards;

          animation-delay: 0.25s;
        }

        .profile-avatar {
          width: 3.4rem;
          height: 3.4rem;
          flex-shrink: 0;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          font-weight: 600;
          font-size: 1.25rem;
          color: #FFFFFF;

          background:
            linear-gradient(
              135deg,
              var(--pf-olive),
              var(--pf-olive-deep)
            );

          box-shadow:
            0 8px 20px
            rgba(75, 83, 32, 0.30);
        }

        .profile-avatar-note {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* ────────────────────────────────────────────────
           ROWS
        ──────────────────────────────────────────────── */

        .profile-row {
          display: flex;
          align-items: center;
          gap: 0.9rem;

          padding: 1.15rem 0;

          border-bottom:
            1px solid
            var(--pf-glass-border);

          opacity: 0;

          animation:
            pf-rise
            0.55s
            cubic-bezier(0.16, 1, 0.3, 1)
            forwards;
        }

        .profile-row:nth-of-type(1) {
          animation-delay: 0.35s;
        }

        .profile-row:nth-of-type(2) {
          animation-delay: 0.42s;
        }

        .profile-row:first-of-type {
          padding-top: 0;
        }

        .profile-row:last-of-type {
          border-bottom: none;
          padding-bottom: 0;
        }

        .profile-row-icon {
          width: 2.1rem;
          height: 2.1rem;
          flex-shrink: 0;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          background: var(--pf-olive-faint);

          border:
            1px solid
            var(--pf-glass-border);
        }

        .profile-row-icon svg {
          width: 15px;
          height: 15px;
          stroke: var(--pf-olive-deep);
        }

        .profile-row-text {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .profile-row-label {
          font-size: 0.66rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }

        .profile-row-value {
          font-weight: 500;
          font-size: 1.05rem;
          color: var(--text-primary);
          letter-spacing: -0.005em;
        }

        @media (prefers-reduced-motion: reduce) {
          .profile-back-btn,
          .profile-card,
          .profile-avatar-row,
          .profile-row {
            animation: none !important;
            opacity: 1 !important;
            filter: none !important;
            transform: none !important;
          }
        }

        /* ────────────────────────────────────────────────
           DARK MODE
        ──────────────────────────────────────────────── */

        html.dark-mode .profile-root.profile-root {
          background: #000000 !important;
          background-image: none !important;
        }

        html.dark-mode .profile-topbar-title em {
          color: #A9C46C !important;
        }

        html.dark-mode .profile-avatar-row,
        html.dark-mode .profile-row {
          border-color: rgba(169, 196, 108, 0.18) !important;
        }

        html.dark-mode .profile-row-icon {
          background: rgba(169, 196, 108, 0.10) !important;
          border-color: rgba(169, 196, 108, 0.22) !important;
        }

        html.dark-mode .profile-row-icon svg {
          stroke: #A9C46C !important;
        }

        html.dark-mode .profile-back-btn {
          background: rgba(30, 41, 59, 0.65) !important;
          border-color: rgba(169, 196, 108, 0.20) !important;
          box-shadow:
            0 2px 12px
            rgba(0, 0, 0, 0.20) !important;
        }

        html.dark-mode .profile-back-btn:hover {
          background: rgba(30, 41, 59, 0.95) !important;
          color: #A9C46C !important;
          border-color: #A9C46C !important;
        }
      `}</style>

      <div className="profile-root">
        {/* Back Button */}

        <div
          className="w-full mb-4"
          style={{ maxWidth: "440px" }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="profile-back-btn flex items-center px-4 py-2 rounded-full border transition-all duration-200 cursor-pointer"
            style={{
              fontSize: "0.78rem",
              fontWeight: 500,
              letterSpacing: "0.04em"
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              style={{ marginRight: "4px" }}
            >
              <path
                d="M8 1.5L3.5 6.5L8 11.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            Back
          </button>
        </div>

        <div className="profile-card">
          {/* Top Bar */}

          <div className="profile-topbar">
            <span className="profile-topbar-title">
              My <em>Profile</em>
            </span>

            <span className="profile-topbar-tag">
              Slog Fashion
            </span>
          </div>

          {/* Body */}

          <div className="profile-body">
            {/* Avatar */}

            <div className="profile-avatar-row">
              <div className="profile-avatar">
                {initial}
              </div>

              <p className="profile-avatar-note">
                Your account details are shown below.
              </p>
            </div>

            {/* Name */}

            <div className="profile-row">
              <div className="profile-row-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M4.5 20c1.4-4 4.2-6 7.5-6s6.1 2 7.5 6" />
                </svg>
              </div>

              <div className="profile-row-text">
                <span className="profile-row-label">
                  Full Name
                </span>

                <span className="profile-row-value">
                  {user.name || "—"}
                </span>
              </div>
            </div>

            {/* Email */}

            <div className="profile-row">
              <div className="profile-row-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3.5"
                    y="5.5"
                    width="17"
                    height="13"
                    rx="2"
                  />

                  <path d="M4 6.5l8 6 8-6" />
                </svg>
              </div>

              <div className="profile-row-text">
                <span className="profile-row-label">
                  Email Address
                </span>

                <span
                  className="profile-row-value"
                  style={{ fontSize: "0.98rem" }}
                >
                  {user.email || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;