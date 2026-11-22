import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_URL from "../../config/api";

/* ── Glass Toast (black + red theme) ── */
const ToastContainer = ({ toasts }) => (
  <div style={{
    position: "fixed", top: "24px", left: "50%", transform: "translateX(-50%)",
    zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "stretch",
    gap: "10px", width: "min(340px, calc(100vw - 32px))", pointerEvents: "none",
  }}>
    <style>{`
      @keyframes toastIn  { from{opacity:0;transform:translateY(-10px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes toastOut { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(-8px) scale(0.97)} }
    `}</style>

    {toasts.map((t) => (
      <div key={t.id} style={{
        display: "flex", alignItems: "center", gap: "12px", padding: "13px 18px",
        background: "rgba(0,0,0,0.6)",
        border: t.type === "error"
          ? "1px solid rgba(255,45,63,0.6)"
          : "1px solid rgba(255,255,255,0.22)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderRadius: "14px",
        color: "#ffffff", fontSize: "14px", fontWeight: 600,
        fontFamily: "'Manrope', 'Inter', system-ui, sans-serif",
        pointerEvents: "auto",
        animation: t.leaving
          ? "toastOut 0.3s ease forwards"
          : "toastIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards",
      }}>
        <span style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: t.type === "error" ? "#ff2d3f" : "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}>
          {t.type === "error" ? (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <line
                x1="2"
                y1="2"
                x2="10"
                y2="10"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <line
                x1="10"
                y1="2"
                x2="2"
                y2="10"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <polyline
                points="2,6 5,9 10,3"
                stroke="#000000"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>

        <span>{t.message}</span>
      </div>
    ))}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminUsers = () => {

  const [users, setUsers] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [processingUserId, setProcessingUserId] = useState(null);

  const navigate = useNavigate();

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();

    setToasts(prev => [
      ...prev,
      {
        id,
        message,
        type,
        leaving: false
      }
    ]);

    setTimeout(() => {
      setToasts(prev =>
        prev.map(t =>
          t.id === id
            ? { ...t, leaving: true }
            : t
        )
      );

      setTimeout(() => {
        setToasts(prev =>
          prev.filter(t => t.id !== id)
        );
      }, 320);
    }, 2500);
  }, []);

  /* ── Fetch users from MERN backend ── */
  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_URL}/admin/users`,
        {
          withCredentials: true
        }
      );

      const userList = Array.isArray(res.data?.users)
        ? res.data.users.filter(u => u.role === "user")
        : [];

      setUsers(userList);

      return true;
    } catch (err) {
      console.log(err);

      if (err.response?.status === 401) {
        showToast("Please login as admin", "error");
      } else if (err.response?.status === 403) {
        showToast("Admin access required", "error");
      } else {
        showToast(
          err.response?.data?.message || "Failed to load users",
          "error"
        );
      }

      return false;
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ── Block / Unblock user through MERN backend ── */
  const toggleBlock = async (user) => {
    if (!user || processingUserId !== null) return;

    const userId = String(user.id);
    const nowBlocked = !user.isBlocked;

    setProcessingUserId(userId);

    try {
      await axios.patch(
        `${API_URL}/admin/users/${encodeURIComponent(user.id)}`,
        {
          isBlocked: nowBlocked
        },
        {
          withCredentials: true
        }
      );

      /*
       * Update local state only after the server confirms
       * the change succeeded.
       */
      setUsers(prev =>
        prev.map(existingUser =>
          String(existingUser.id) === userId
            ? {
                ...existingUser,
                isBlocked: nowBlocked
              }
            : existingUser
        )
      );

      showToast(
        nowBlocked ? "User blocked" : "User unblocked",
        "success"
      );

      /*
       * Preserve the existing forceLogout mechanism.
       * The blocked user's client can detect this and log out.
       */
      if (nowBlocked) {
        localStorage.setItem(
          "forceLogout",
          JSON.stringify({
            userId: user.id,
            time: Date.now()
          })
        );
      }
    } catch (err) {
      console.log(err);

      /*
       * The local user state is intentionally not changed
       * when the server request fails.
       */
      showToast(
        err.response?.data?.message ||
          (nowBlocked
            ? "Failed to block user"
            : "Failed to unblock user"),
        "error"
      );
    } finally {
      setProcessingUserId(null);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} />

      <div
        className="ad-root min-h-screen flex justify-center items-start p-3 sm:p-5 md:p-8 pb-20"
      >

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

          .ad-root {
            --ad-red:        #ff2d3f;
            --ad-line:       rgba(255, 45, 63, 0.22);
            --ad-line-hover: rgba(255, 45, 63, 0.6);
            --ad-white:      #ffffff;
            --ad-white-soft: rgba(255, 255, 255, 0.7);

            position: relative;
            overflow: hidden;
            background: #000000;
            color: var(--ad-white);
            font-family: 'Manrope', 'Inter', system-ui, sans-serif;
            -webkit-font-smoothing: antialiased;
          }

          /* ── Entrance ── */
          .ad-rise {
            opacity: 0;
            animation: ad-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }

          @keyframes ad-rise {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          /* ── Heading ── */
          .ad-overline {
            display: inline-flex;
            align-items: center;
            gap: 0.65rem;
            color: var(--ad-red);
            font-size: 0.78rem;
            font-weight: 700;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
          }

          .ad-overline::before {
            content: '';
            width: 28px;
            height: 2px;
            background: var(--ad-red);
          }

          .ad-title {
            color: var(--ad-white);
            font-weight: 800;
            letter-spacing: -0.03em;
            line-height: 1.05;
            font-size: clamp(2.2rem, 4vw, 3rem);
          }

          .ad-title-bar {
            margin-top: 1rem;
            height: 2px;
            width: 84px;
            border-radius: 2px;
            background: var(--ad-red);
            transform-origin: left center;
            animation: ad-draw 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
          }

          @keyframes ad-draw {
            from { transform: scaleX(0); }
            to   { transform: scaleX(1); }
          }

          /* ── Panel ── */
          .ad-panel {
            position: relative;
            background: transparent;
            border: 1px solid var(--ad-line);
            border-radius: 16px;
            transition: border-color 0.3s ease;
          }

          .ad-panel:hover {
            border-color: var(--ad-line-hover);
          }

          .ad-panel-title {
            display: flex;
            align-items: center;
            gap: 0.65rem;
            color: var(--ad-white);
            font-weight: 700;
            letter-spacing: -0.015em;
            font-size: clamp(1.05rem, 1.4vw, 1.25rem);
          }

          .ad-panel-title::before {
            content: '';
            width: 3px;
            height: 1.1em;
            border-radius: 2px;
            background: var(--ad-red);
          }

          /* ── Count pill ── */
          .ad-pill {
            color: #ffffff;
            background: var(--ad-red);
            font-size: 0.78rem;
            font-weight: 700;
            letter-spacing: 0.03em;
          }

          /* ── Table ── */
          .ad-thead {
            color: var(--ad-white-soft);
            border-bottom: 1px solid var(--ad-line);
            font-size: 0.74rem;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }

          .ad-row {
            position: relative;
            background: transparent;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            transition: background 0.25s ease;
          }

          .ad-row::before {
            content: '';
            position: absolute;
            left: 0;
            top: 18%;
            bottom: 18%;
            width: 2px;
            border-radius: 2px;
            background: var(--ad-red);
            transform: scaleY(0);
            transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          }

          .ad-row:hover {
            background: rgba(255, 255, 255, 0.04);
          }

          .ad-row:hover::before { transform: scaleY(1); }

          .ad-row:last-child { border-bottom: none; }

          .ad-avatar {
            color: var(--ad-red);
            background: rgba(255, 45, 63, 0.1);
            border: 1px solid var(--ad-line);
            font-weight: 800;
            font-size: 0.85rem;
          }

          .ad-cell-name {
            color: var(--ad-white);
            font-size: 0.98rem;
            font-weight: 700;
          }

          .ad-cell-email {
            color: var(--ad-white-soft);
            font-size: 0.92rem;
            font-weight: 500;
            word-break: break-all;
          }

          .ad-empty {
            color: var(--ad-white-soft);
            font-size: 0.95rem;
            font-weight: 500;
          }

          /* ── Status badges ── */
          .ad-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            padding: 0.3rem 0.8rem;
            border-radius: 999px;
            font-size: 0.76rem;
            font-weight: 700;
            letter-spacing: 0.03em;
          }

          .ad-badge-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: currentColor;
          }

          .ad-badge--active {
            color: #22c55e;
            background: rgba(34, 197, 94, 0.12);
            border: 1px solid rgba(34, 197, 94, 0.45);
          }

          .ad-badge--blocked {
            color: #ffffff;
            background: rgba(255, 45, 63, 0.22);
            border: 1px solid rgba(255, 45, 63, 0.6);
          }

          /* ── Action buttons ── */
          .ad-btn {
            font-family: inherit;
            font-size: 0.82rem;
            font-weight: 700;
            letter-spacing: 0.02em;
            padding: 0.5rem 1.1rem;
            border-radius: 10px;
            background: transparent;
            transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
          }

          .ad-btn--block {
            color: #ff2d3f;
            border: 1px solid rgba(255, 45, 63, 0.6);
          }

          .ad-btn--block:hover:not(:disabled) {
            background: #ff2d3f;
            color: #ffffff;
            border-color: #ff2d3f;
          }

          .ad-btn--unblock {
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.4);
          }

          .ad-btn--unblock:hover:not(:disabled) {
            background: #ffffff;
            color: #000000;
            border-color: #ffffff;
          }

          .ad-btn:focus-visible {
            outline: 2px solid #ffffff;
            outline-offset: 2px;
          }

          /* ── Reduced motion ── */
          @media (prefers-reduced-motion: reduce) {
            .ad-rise,
            .ad-title-bar {
              animation: none !important;
              opacity: 1 !important;
              transform: none !important;
            }

            .ad-row,
            .ad-row::before,
            .ad-btn {
              transition: none !important;
            }
          }
        `}</style>

        {/* Content */}
        <div
          className="w-full max-w-7xl relative p-2 sm:p-4 md:p-6"
        >

          {/* Heading */}
          <div className="mb-8 sm:mb-10 relative ad-rise">

            <p className="ad-overline">
              Management
            </p>

            <h1 className="ad-title">
              All Users
            </h1>

            <div className="ad-title-bar" />

          </div>

          {/* Users panel */}
          <div
            className="ad-panel ad-rise rounded-xl p-5 sm:p-6 relative"
            style={{ animationDelay: "0.15s" }}
          >

            <div className="flex items-center justify-between mb-5">

              <h2 className="ad-panel-title">
                User Accounts
              </h2>

              <span className="ad-pill px-3 py-1 rounded-full">
                {users.length} {users.length === 1 ? "user" : "users"}
              </span>

            </div>

            {/* Table header */}
            <div
              className="ad-thead hidden sm:grid grid-cols-[2fr_2fr_1fr_140px] px-4 py-3 mb-1"
            >
              <span>Name</span>
              <span>Email</span>
              <span>Status</span>
              <span className="text-center">Action</span>
            </div>

            {/* Rows */}
            <div className="flex flex-col">

              {users.map(user => {
                const isProcessing =
                  processingUserId === String(user.id);

                return (
                  <div
                    key={user.id}
                    className="ad-row grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr_140px] gap-3 sm:gap-0 items-center px-4 py-4"
                  >

                    {/* Mobile */}
                    <div className="sm:hidden flex items-center justify-between gap-3">

                      <div className="min-w-0">

                        <p className="ad-cell-name">
                          {user.name}
                        </p>

                        <p className="ad-cell-email mt-0.5">
                          {user.email}
                        </p>

                        <span
                          className={`ad-badge mt-2 ${
                            user.isBlocked
                              ? "ad-badge--blocked"
                              : "ad-badge--active"
                          }`}
                        >
                          <span className="ad-badge-dot" />

                          {user.isBlocked ? "Blocked" : "Active"}
                        </span>

                      </div>

                      <button
                        onClick={() => toggleBlock(user)}
                        disabled={isProcessing || processingUserId !== null}
                        className={`ad-btn shrink-0 ${
                          user.isBlocked
                            ? "ad-btn--unblock"
                            : "ad-btn--block"
                        }`}
                        style={{
                          opacity: isProcessing ? 0.55 : 1,
                          cursor: isProcessing || processingUserId !== null
                            ? "not-allowed"
                            : "pointer"
                        }}
                      >
                        {isProcessing
                          ? "Saving..."
                          : user.isBlocked
                            ? "Unblock"
                            : "Block"}
                      </button>

                    </div>

                    {/* Desktop: Name */}
                    <div className="hidden sm:flex items-center gap-3">

                      <div
                        className="ad-avatar w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      >
                        {user.name?.charAt(0).toUpperCase()}
                      </div>

                      <span className="ad-cell-name">
                        {user.name}
                      </span>

                    </div>

                    {/* Desktop: Email */}
                    <p className="hidden sm:block ad-cell-email">
                      {user.email}
                    </p>

                    {/* Desktop: Status */}
                    <div className="hidden sm:block">

                      <span
                        className={`ad-badge ${
                          user.isBlocked
                            ? "ad-badge--blocked"
                            : "ad-badge--active"
                        }`}
                      >
                        <span className="ad-badge-dot" />

                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>

                    </div>

                    {/* Desktop: Action */}
                    <div className="hidden sm:flex justify-center">

                      <button
                        onClick={() => toggleBlock(user)}
                        disabled={isProcessing || processingUserId !== null}
                        className={`ad-btn ${
                          user.isBlocked
                            ? "ad-btn--unblock"
                            : "ad-btn--block"
                        }`}
                        style={{
                          opacity: isProcessing ? 0.55 : 1,
                          cursor: isProcessing || processingUserId !== null
                            ? "not-allowed"
                            : "pointer"
                        }}
                      >
                        {isProcessing
                          ? "Saving..."
                          : user.isBlocked
                            ? "Unblock"
                            : "Block"}
                      </button>

                    </div>

                  </div>
                );
              })}

              {users.length === 0 && (
                <div className="ad-empty text-center py-16">
                  No users found.
                </div>
              )}

            </div>

          </div>

        </div>
      </div>
    </>
  );
};

export default AdminUsers;