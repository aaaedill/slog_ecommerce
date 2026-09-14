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
      .then(res => {

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
      .catch(error => {
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
          background: "var(--bg-primary)",
          padding: "3rem 2rem"
        }}
      >
        <p
          style={{
            fontFamily: "'Outfit', sans-serif",
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
            letterSpacing: "0.1em"
          }}
        >
          Loading…
        </p>
      </div>
    );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&display=swap');

        .profile-root {
          font-family: 'Outfit', sans-serif;
          min-height: 100vh;
          background:
            radial-gradient(ellipse 70% 50% at 70% 0%, rgba(47,93,255,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 10% 100%, rgba(110,139,255,0.05) 0%, transparent 60%),
            var(--bg-primary);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem 1rem;
        }

        .profile-back-btn {
          background: rgba(255,255,255,0.6);
          border: 1px solid rgba(47,93,255,0.16);
          color: var(--text-secondary);
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
          box-shadow: 0 2px 12px rgba(47,93,255,0.06);
          transition: background 0.2s ease, color 0.2s ease;
        }

        .profile-back-btn:hover {
          background: rgba(255,255,255,0.95);
          color: #2F5DFF;
        }

        .profile-card {
          width: 100%;
          max-width: 440px;
          background: rgba(255,255,255,0.65);
          border: 1px solid rgba(47,93,255,0.14);
          border-radius: 1.1rem;
          overflow: hidden;
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.8) inset,
            0 4px 24px rgba(47,93,255,0.06);
          animation: profileBlurIn 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes profileBlurIn {
          from {
            opacity: 0;
            filter: blur(8px);
            transform: translateY(16px);
          }

          to {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0);
          }
        }

        .profile-topbar {
          background: rgba(47,93,255,0.05);
          border-bottom: 1px solid rgba(47,93,255,0.12);
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .profile-body {
          padding: 2.5rem 2rem;
        }

        .profile-row {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          padding: 1.35rem 0;
          border-bottom: 1px solid rgba(47,93,255,0.12);
        }

        .profile-row:first-of-type {
          padding-top: 0;
        }

        .profile-row:last-of-type {
          border-bottom: none;
          padding-bottom: 0;
        }

        .profile-row-label {
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }

        .profile-row-value {
          font-weight: 500;
          font-size: 1.1rem;
          color: var(--text-primary);
          letter-spacing: -0.005em;
        }

        /* ── DARK MODE ── */

        html.dark-mode .profile-root.profile-root {
          background-color: #000000 !important;
          background-image:
            radial-gradient(ellipse 70% 50% at 70% 0%, rgba(47,93,255,0.10) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 10% 100%, rgba(110,139,255,0.08) 0%, transparent 60%) !important;
        }

        html.dark-mode .profile-card {
          background: rgba(30,41,59,0.65) !important;
          border-color: rgba(96,130,255,0.20) !important;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.04) inset,
            0 4px 24px rgba(0,0,0,0.25) !important;
        }

        html.dark-mode .profile-back-btn {
          background: rgba(30,41,59,0.65) !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.20) !important;
        }

        html.dark-mode .profile-back-btn:hover {
          background: rgba(30,41,59,0.95) !important;
          color: #6E8BFF !important;
        }
      `}</style>

      <div className="profile-root rounded-3xl mt-5">

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

            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 600,
                fontSize: "1.05rem",
                color: "var(--text-primary)"
              }}
            >
              My{" "}
              <span style={{ color: "#2F5DFF" }}>
                Profile
              </span>
            </span>

            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--text-secondary)"
              }}
            >
              Slog Fashion
            </span>

          </div>

          {/* Body */}

          <div className="profile-body">

            {/* Welcome note */}

            <div
              style={{
                marginBottom: "2rem",
                paddingBottom: "1.5rem",
                borderBottom:
                  "1px solid rgba(47,93,255,0.12)"
              }}
            >
              <p
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 400,
                  fontSize: "0.88rem",
                  color: "var(--text-secondary)",
                  letterSpacing: "0.01em"
                }}
              >
                Your account details are shown below.
              </p>
            </div>

            {/* Name */}

            <div className="profile-row">

              <span className="profile-row-label">
                Full Name
              </span>

              <span className="profile-row-value">
                {user.name || "—"}
              </span>

            </div>

            {/* Email */}

            <div className="profile-row">

              <span className="profile-row-label">
                Email Address
              </span>

              <span
                className="profile-row-value"
                style={{ fontSize: "1rem" }}
              >
                {user.email || "—"}
              </span>

            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;