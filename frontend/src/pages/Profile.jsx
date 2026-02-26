import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Profile = () => {

  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      toast.error("Please login first");
      return;
    }
    axios
      .get(`http://localhost:4000/users/${storedUser.id}`)
      .then(res => setUser(res.data))
      .catch(() => toast.error("Failed to load profile"));
  }, []);

  if (!user)
    return (
      <div className="min-h-screen" style={{ background: '#EDE8E0', padding: '3rem 2rem' }}>
        <p style={{ fontFamily: "'Jost', sans-serif", color: '#9A9188', fontSize: '0.85rem', letterSpacing: '0.15em' }}>Loading…</p>
      </div>
    );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

        .profile-root {
          font-family: 'Jost', sans-serif;
          min-height: 100vh;
          background: #EDE8E0;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem 1rem;
        }

        .profile-card {
          width: 100%;
          max-width: 440px;
          background: #E4DDD3;
          border: 1px solid #D4CCC0;
          border-radius: 2px;
          overflow: hidden;
          animation: cartUp 0.45s ease both;
        }

        @keyframes cartUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .profile-topbar {
          background: #DAD3C8;
          border-bottom: 1px solid #D4CCC0;
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
          border-bottom: 1px solid #D4CCC0;
        }
        .profile-row:first-of-type { padding-top: 0; }
        .profile-row:last-of-type {
          border-bottom: none;
          padding-bottom: 0;
        }

        .profile-row-label {
          font-size: 0.62rem;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #9A9188;
        }

        .profile-row-value {
          font-family: 'Fraunces', serif;
          font-weight: 300;
          font-size: 1.15rem;
          color: #2C2825;
          letter-spacing: 0.01em;
        }
      `}</style>

      <div className="profile-root rounded-3xl mt-5">

        {/* Back Button */}
        <div className="w-full max-w-440px mb-4" style={{ maxWidth: '440px' }}>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-4 py-2 rounded-full backdrop-blur-xl border transition-all duration-200 cursor-pointer"
            style={{ background: 'rgba(237,232,224,0.75)', borderColor: 'rgba(212,204,192,0.6)', color: '#6B6058', fontFamily: "'Jost', sans-serif", fontSize: '0.78rem', fontWeight: 400, letterSpacing: '0.06em', boxShadow: '0 2px 12px rgba(44,40,37,0.06)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(243, 139, 87, 0.95)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(237,232,224,0.75)'}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ marginRight: '2px' }}>
              <path d="M8 1.5L3.5 6.5L8 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
        </div>

        <div className="profile-card">

          {/* Top Bar */}
          <div className="profile-topbar">
            <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: '1.05rem', color: '#2C2825' }}>
              My <i style={{ fontStyle: 'italic', color: '#8B6F5E' }}>Profile</i>
            </span>
            <span style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A9188' }}>
              Slog Fashion
            </span>
          </div>

          {/* Body */}
          <div className="profile-body">

            {/* Welcome note */}
            <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #D4CCC0' }}>
              <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: '0.85rem', color: '#9A9188', letterSpacing: '0.06em' }}>
                Your account details are shown below.
              </p>
            </div>

            {/* Name */}
            <div className="profile-row">
              <span className="profile-row-label">Full Name</span>
              <span className="profile-row-value">{user.name}</span>
            </div>

            {/* Email */}
            <div className="profile-row">
              <span className="profile-row-label">Email Address</span>
              <span className="profile-row-value" style={{ fontSize: '1rem' }}>{user.email}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;