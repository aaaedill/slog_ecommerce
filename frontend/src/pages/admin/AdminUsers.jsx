import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_URL from "../../config/api";

/* ── Glass Toast (black + red theme) ── */
const ToastContainer = ({ toasts }) => (
  <div style={{
    position: "fixed",
    top: "calc(env(safe-area-inset-top, 0px) + 16px)",
    left: "50%", transform: "translateX(-50%)",
    zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "stretch",
    gap: "10px", width: "min(360px, calc(100vw - 32px))", pointerEvents: "none",
  }}>
    <style>{`
      @keyframes toastIn  { from{opacity:0;transform:translateY(-10px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes toastOut { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(-8px) scale(0.97)} }
    `}</style>

    {toasts.map((t) => (
      <div key={t.id} style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "12px 16px",
        background: "rgba(0,0,0,0.6)",
        border: t.type === "error"
          ? "1px solid rgba(255,45,63,0.6)"
          : "1px solid rgba(255,255,255,0.22)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderRadius: "14px",
        color: "#ffffff", fontSize: "clamp(13px, 3.4vw, 14px)", fontWeight: 600,
        lineHeight: 1.35,
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

        <span style={{ minWidth: 0 }}>{t.message}</span>
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

      <div className="au-root">

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

          .au-root {
            --au-red:        #ff2d3f;
            --au-line:       rgba(255, 45, 63, 0.22);
            --au-line-hover: rgba(255, 45, 63, 0.6);
            --au-white:      #ffffff;
            --au-white-soft: rgba(255, 255, 255, 0.7);

            /* responsive scale (overridden per breakpoint below).
               --au-max and --au-px match the navbar so edges line up. */
            --au-max:      1400px;
            --au-px:       0.875rem;
            --au-py:       1rem;
            --au-sec:      1.25rem;
            --au-pad:      0.9rem;
            --au-radius:   14px;
            --au-over:     0.68rem;
            --au-title:    1.9rem;
            --au-ptitle:   1rem;
            --au-pill:     0.7rem;
            --au-avatar:   2.25rem;
            --au-name:     0.92rem;
            --au-email:    0.82rem;
            --au-thead:    0.68rem;
            --au-badge:    0.7rem;
            --au-btn:      0.8rem;
            --au-btn-h:    2.25rem;
            --au-btn-px:   0.95rem;
            --au-rowpx:    0.25rem;
            --au-rowpy:    0.9rem;
            --au-colgap:   1rem;
            --au-action:   7rem;

            position: relative;
            overflow-x: hidden;
            min-height: 100vh;
            background: #000000;
            color: var(--au-white);
            font-family: 'Manrope', 'Inter', system-ui, sans-serif;
            -webkit-font-smoothing: antialiased;
            padding:
              var(--au-py)
              max(var(--au-px), env(safe-area-inset-right))
              calc(var(--au-py) + 2rem + env(safe-area-inset-bottom))
              max(var(--au-px), env(safe-area-inset-left));
          }

          .au-inner {
            position: relative;
            width: 100%;
            max-width: var(--au-max);
            margin: 0 auto;
          }

          /* ── Entrance ── */
          .au-rise {
            opacity: 0;
            animation: au-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }

          @keyframes au-rise {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          /* ── Heading ── */
          .au-head {
            position: relative;
            margin-bottom: var(--au-sec);
          }

          .au-overline {
            display: inline-flex;
            align-items: center;
            gap: 0.6rem;
            color: var(--au-red);
            font-size: var(--au-over);
            font-weight: 700;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            margin-bottom: 0.4rem;
          }

          .au-overline::before {
            content: '';
            width: 1.75rem;
            height: 2px;
            background: var(--au-red);
          }

          .au-title {
            color: var(--au-white);
            font-weight: 800;
            letter-spacing: -0.03em;
            line-height: 1.05;
            font-size: var(--au-title);
          }

          .au-title-bar {
            margin-top: 0.85rem;
            height: 2px;
            width: 5rem;
            border-radius: 2px;
            background: var(--au-red);
            transform-origin: left center;
            animation: au-draw 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
          }

          @keyframes au-draw {
            from { transform: scaleX(0); }
            to   { transform: scaleX(1); }
          }

          /* ── Panel ── */
          .au-panel {
            position: relative;
            min-width: 0;
            padding: var(--au-pad);
            background: transparent;
            border: 1px solid var(--au-line);
            border-radius: var(--au-radius);
            transition: border-color 0.3s ease;
          }

          .au-panel:hover {
            border-color: var(--au-line-hover);
          }

          .au-panel-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 0.5rem 0.75rem;
            margin-bottom: calc(var(--au-pad) * 0.8);
          }

          .au-panel-title {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            min-width: 0;
            color: var(--au-white);
            font-weight: 700;
            letter-spacing: -0.015em;
            line-height: 1.2;
            font-size: var(--au-ptitle);
          }

          .au-panel-title::before {
            content: '';
            flex: 0 0 auto;
            width: 3px;
            height: 1.1em;
            border-radius: 2px;
            background: var(--au-red);
          }

          /* ── Count pill ── */
          .au-pill {
            flex: 0 0 auto;
            padding: 0.25rem 0.7rem;
            border-radius: 999px;
            color: #ffffff;
            background: var(--au-red);
            font-size: var(--au-pill);
            font-weight: 700;
            letter-spacing: 0.03em;
            white-space: nowrap;
          }

          /* ── Users list ──
             Phone  (< 640px): each user is a 2 × 2 card
                      [ avatar + name     status ]
                      [ email             button ]
             ≥ 640px: 4 column table
                      [ user | email | status | action ] */
          .au-thead {
            display: none;
            color: var(--au-white-soft);
            border-bottom: 1px solid var(--au-line);
            font-size: var(--au-thead);
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }

          .au-thead,
          .au-row {
            grid-template-columns: minmax(0, 1fr) auto;
            grid-template-areas:
              "user  status"
              "email action";
            column-gap: var(--au-colgap);
            padding-left: var(--au-rowpx);
            padding-right: var(--au-rowpx);
          }

          .au-list {
            display: flex;
            flex-direction: column;
          }

          .au-row {
            position: relative;
            display: grid;
            align-items: center;
            row-gap: 0.65rem;
            padding-top: var(--au-rowpy);
            padding-bottom: var(--au-rowpy);
            background: transparent;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            transition: background 0.25s ease;
          }

          .au-row::before {
            content: '';
            position: absolute;
            left: 0;
            top: 18%;
            bottom: 18%;
            width: 2px;
            border-radius: 2px;
            background: var(--au-red);
            transform: scaleY(0);
            transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          }

          .au-row:hover {
            background: rgba(255, 255, 255, 0.04);
          }

          .au-row:hover::before { transform: scaleY(1); }

          .au-row:last-child { border-bottom: none; }

          .au-c-user {
            grid-area: user;
            display: flex;
            align-items: center;
            gap: 0.7rem;
            min-width: 0;
          }

          .au-c-email  { grid-area: email; min-width: 0; }
          .au-c-status { grid-area: status; justify-self: end; }
          .au-c-action { grid-area: action; justify-self: end; }

          .au-avatar {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            width: var(--au-avatar);
            height: var(--au-avatar);
            border-radius: 10px;
            color: var(--au-red);
            background: rgba(255, 45, 63, 0.1);
            border: 1px solid var(--au-line);
            font-weight: 800;
            font-size: calc(var(--au-avatar) * 0.38);
          }

          .au-cell-name {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: var(--au-white);
            font-size: var(--au-name);
            font-weight: 700;
          }

          .au-cell-email {
            color: var(--au-white-soft);
            font-size: var(--au-email);
            font-weight: 500;
            line-height: 1.35;
            overflow-wrap: anywhere;
          }

          .au-empty {
            padding: 3rem 0.5rem;
            text-align: center;
            color: var(--au-white-soft);
            font-size: var(--au-name);
            font-weight: 500;
          }

          /* ── Status badges ── */
          .au-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.28rem 0.7rem;
            border-radius: 999px;
            font-size: var(--au-badge);
            font-weight: 700;
            letter-spacing: 0.03em;
            white-space: nowrap;
          }

          .au-badge-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: currentColor;
          }

          .au-badge--active {
            color: #22c55e;
            background: rgba(34, 197, 94, 0.12);
            border: 1px solid rgba(34, 197, 94, 0.45);
          }

          .au-badge--blocked {
            color: #ffffff;
            background: rgba(255, 45, 63, 0.22);
            border: 1px solid rgba(255, 45, 63, 0.6);
          }

          /* ── Action buttons ── */
          .au-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 5.5rem;
            height: var(--au-btn-h);
            padding: 0 var(--au-btn-px);
            font-family: inherit;
            font-size: var(--au-btn);
            font-weight: 700;
            letter-spacing: 0.02em;
            white-space: nowrap;
            border-radius: 10px;
            background: transparent;
            transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
          }

          .au-btn--block {
            color: #ff2d3f;
            border: 1px solid rgba(255, 45, 63, 0.6);
          }

          .au-btn--block:hover:not(:disabled) {
            background: #ff2d3f;
            color: #ffffff;
            border-color: #ff2d3f;
          }

          .au-btn--unblock {
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.4);
          }

          .au-btn--unblock:hover:not(:disabled) {
            background: #ffffff;
            color: #000000;
            border-color: #ffffff;
          }

          .au-btn:focus-visible {
            outline: 2px solid #ffffff;
            outline-offset: 2px;
          }

          /* ── Responsive scale ── */

          /* ≥ 375px: large phones */
          @media (min-width: 375px) {
            .au-root {
              --au-px:     1rem;
              --au-py:     1.1rem;
              --au-pad:    1rem;
              --au-title:  2.05rem;
              --au-avatar: 2.4rem;
              --au-name:   0.95rem;
              --au-email:  0.85rem;
              --au-btn-px: 1.05rem;
            }
          }

          /* ≥ 480px: phones in landscape / small tablets */
          @media (min-width: 480px) {
            .au-root {
              --au-py:     1.25rem;
              --au-sec:    1.4rem;
              --au-pad:    1.1rem;
              --au-ptitle: 1.05rem;
              --au-avatar: 2.5rem;
              --au-name:   0.98rem;
              --au-email:  0.88rem;
              --au-badge:  0.72rem;
              --au-btn:    0.82rem;
              --au-btn-h:  2.4rem;
            }
          }

          /* ≥ 640px: tablets (portrait). Users become a table. */
          @media (min-width: 640px) {
            .au-root {
              --au-px:     1.5rem;
              --au-py:     1.5rem;
              --au-sec:    1.6rem;
              --au-pad:    1.25rem;
              --au-over:   0.74rem;
              --au-title:  2.4rem;
              --au-ptitle: 1.1rem;
              --au-pill:   0.76rem;
              --au-thead:  0.72rem;
              --au-rowpx:  0.9rem;
              --au-rowpy:  0.95rem;
              --au-colgap: 1rem;
              --au-action: 6.5rem;
            }

            .au-thead,
            .au-row {
              grid-template-columns:
                minmax(0, 1.2fr)
                minmax(0, 1.5fr)
                minmax(0, 0.9fr)
                var(--au-action);
              grid-template-areas: "user email status action";
            }

            .au-thead { display: grid; padding-top: 0.75rem; padding-bottom: 0.75rem; }
            .au-row   { row-gap: 0; }

            .au-c-status { justify-self: start; }
            .au-c-action { justify-self: center; }

            .au-btn { min-width: 0; width: 100%; max-width: 6.5rem; }
          }

          /* ≥ 768px */
          @media (min-width: 768px) {
            .au-root {
              --au-py:     1.75rem;
              --au-sec:    1.75rem;
              --au-title:  2.55rem;
              --au-avatar: 2.5rem;
              --au-name:   1rem;
              --au-email:  0.9rem;
              --au-badge:  0.74rem;
              --au-colgap: 1.25rem;
              --au-action: 7rem;
            }
          }

          /* ≥ 1024px: laptops */
          @media (min-width: 1024px) {
            .au-root {
              --au-px:     2rem;
              --au-py:     2rem;
              --au-sec:    2rem;
              --au-pad:    1.4rem;
              --au-radius: 16px;
              --au-ptitle: 1.15rem;
              --au-rowpx:  1.1rem;
              --au-rowpy:  1.05rem;
              --au-name:   1.02rem;
              --au-email:  0.92rem;
              --au-btn:    0.85rem;
              --au-btn-h:  2.5rem;
              --au-colgap: 1.5rem;
              --au-action: 8rem;
            }

            .au-btn { max-width: 7.5rem; }
          }

          /* ≥ 1280px: desktops */
          @media (min-width: 1280px) {
            .au-root {
              --au-py:     2.25rem;
              --au-pad:    1.6rem;
              --au-title:  2.8rem;
              --au-ptitle: 1.2rem;
              --au-avatar: 2.6rem;
              --au-thead:  0.74rem;
              --au-rowpy:  1.15rem;
              --au-badge:  0.76rem;
            }
          }

          /* ≥ 1536px: large monitors */
          @media (min-width: 1536px) {
            .au-root {
              --au-max:    1680px;
              --au-px:     2.5rem;
              --au-py:     2.5rem;
              --au-sec:    2.5rem;
              --au-pad:    1.85rem;
              --au-over:   0.8rem;
              --au-title:  3rem;
              --au-ptitle: 1.3rem;
              --au-pill:   0.82rem;
              --au-avatar: 2.8rem;
              --au-name:   1.08rem;
              --au-email:  0.98rem;
              --au-badge:  0.8rem;
              --au-btn:    0.9rem;
              --au-btn-h:  2.7rem;
              --au-action: 9rem;
            }

            .au-btn { max-width: 8rem; }
          }

          /* ≥ 1920px: ultra-wide */
          @media (min-width: 1920px) {
            .au-root { --au-max: 1840px; }
          }

          /* ── Reduced motion ── */
          @media (prefers-reduced-motion: reduce) {
            .au-rise,
            .au-title-bar {
              animation: none !important;
              opacity: 1 !important;
              transform: none !important;
            }

            .au-row,
            .au-row::before,
            .au-btn {
              transition: none !important;
            }
          }
        `}</style>

        {/* Content */}
        <div className="au-inner">

          {/* Heading */}
          <div className="au-head au-rise">

            <p className="au-overline">
              Management
            </p>

            <h1 className="au-title">
              All Users
            </h1>

            <div className="au-title-bar" />

          </div>

          {/* Users panel */}
          <div
            className="au-panel au-rise"
            style={{ animationDelay: "0.15s" }}
          >

            <div className="au-panel-head">

              <h2 className="au-panel-title">
                User Accounts
              </h2>

              <span className="au-pill">
                {users.length} {users.length === 1 ? "user" : "users"}
              </span>

            </div>

            {/* Table header (≥ 640px only) */}
            <div className="au-thead">
              <span style={{ gridArea: "user" }}>Name</span>
              <span style={{ gridArea: "email" }}>Email</span>
              <span style={{ gridArea: "status" }}>Status</span>
              <span style={{ gridArea: "action", textAlign: "center" }}>Action</span>
            </div>

            {/* Rows */}
            <div className="au-list">

              {users.map(user => {
                const isProcessing =
                  processingUserId === String(user.id);

                return (
                  <div
                    key={user.id}
                    className="au-row"
                  >

                    {/* Name */}
                    <div className="au-c-user">

                      <div className="au-avatar">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>

                      <span className="au-cell-name" title={user.name}>
                        {user.name}
                      </span>

                    </div>

                    {/* Email */}
                    <p className="au-c-email au-cell-email">
                      {user.email}
                    </p>

                    {/* Status */}
                    <div className="au-c-status">

                      <span
                        className={`au-badge ${
                          user.isBlocked
                            ? "au-badge--blocked"
                            : "au-badge--active"
                        }`}
                      >
                        <span className="au-badge-dot" />

                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>

                    </div>

                    {/* Action */}
                    <div className="au-c-action">

                      <button
                        onClick={() => toggleBlock(user)}
                        disabled={isProcessing || processingUserId !== null}
                        className={`au-btn ${
                          user.isBlocked
                            ? "au-btn--unblock"
                            : "au-btn--block"
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
                <div className="au-empty">
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