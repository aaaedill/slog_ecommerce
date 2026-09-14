import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_URL from "../../config/api";

/* ── Glassy Toast (copied from provided design) ── */
const ToastContainer = ({ toasts }) => (
  <div style={{
    position: "fixed", top: "24px", left: "50%", transform: "translateX(-50%)",
    zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "stretch",
    gap: "10px", width: "min(320px, calc(100vw - 32px))", pointerEvents: "none",
  }}>
    <style>{`
      @keyframes toastIn  { from{opacity:0;transform:translateY(-10px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes toastOut { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(-8px) scale(0.96)} }
    `}</style>

    {toasts.map((t) => (
      <div key={t.id} style={{
        display: "flex", alignItems: "center", gap: "12px", padding: "13px 18px",
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
        backdropFilter: "blur(25px)", WebkitBackdropFilter: "blur(25px)",
        borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        color: "#ffffff", fontSize: "14px", fontWeight: 500, pointerEvents: "auto",
        animation: t.leaving
          ? "toastOut 0.3s ease forwards"
          : "toastIn 0.35s cubic-bezier(0.2,1.3,0.4,1) forwards",
      }}>
        <span style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: t.type === "error"
            ? "rgba(239,68,68,0.15)"
            : "rgba(249,115,22,0.15)",
          border: t.type === "error"
            ? "1.5px solid rgba(239,68,68,0.5)"
            : "1.5px solid rgba(249,115,22,0.5)",
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
                stroke="rgba(239,68,68,0.95)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <line
                x1="10"
                y1="2"
                x2="2"
                y2="10"
                stroke="rgba(239,68,68,0.95)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <polyline
                points="2,6 5,9 10,3"
                stroke="rgba(249,115,22,0.95)"
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
        className="min-h-screen flex justify-center items-start p-3 sm:p-6 md:p-8 rounded-3xl pb-20"
        style={{ background: "#0b1120" }}
      >

        {/* Card */}
        <div
          className="w-full max-w-6xl relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8"
          style={{
            background: "linear-gradient(145deg,#0f1623 0%,#131a28 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset",
          }}
        >

          {/* Glows */}
          <div
            className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(249,115,22,0.08)" }}
          />

          <div
            className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(99,102,241,0.08)" }}
          />

          <div className="relative z-10">

            {/* Heading */}
            <div className="mb-8">

              <p
                className="text-xs font-semibold uppercase mb-1"
                style={{
                  color: "#f97316",
                  letterSpacing: "0.18em"
                }}
              >
                Management
              </p>

              <div className="flex items-center justify-between">

                <h1
                  className="text-2xl sm:text-3xl font-bold"
                  style={{
                    color: "#f1f5f9",
                    letterSpacing: "-0.02em"
                  }}
                >
                  All Users
                </h1>

                <span
                  className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(249,115,22,0.12)",
                    color: "#f97316",
                    border: "1px solid rgba(249,115,22,0.2)"
                  }}
                >
                  {users.length} {users.length === 1 ? "user" : "users"}
                </span>

              </div>
            </div>

            {/* Table header */}
            <div
              className="hidden sm:grid grid-cols-[2fr_2fr_1fr_140px] px-4 py-2.5 rounded-lg mb-3 text-xs font-semibold uppercase"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#64748b",
                letterSpacing: "0.08em"
              }}
            >
              <span>Name</span>
              <span>Email</span>
              <span>Status</span>
              <span className="text-center">Action</span>
            </div>

            {/* Rows */}
            <div className="flex flex-col gap-2">

              {users.map(user => {
                const isProcessing =
                  processingUserId === String(user.id);

                return (
                  <div
                    key={user.id}
                    className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr_140px] gap-3 sm:gap-0 items-center px-4 py-4 rounded-xl transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.045)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                    }}
                  >

                    {/* Mobile */}
                    <div className="sm:hidden flex items-center justify-between">

                      <div>

                        <p
                          className="font-semibold text-sm"
                          style={{ color: "#f1f5f9" }}
                        >
                          {user.name}
                        </p>

                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "#64748b" }}
                        >
                          {user.email}
                        </p>

                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mt-2"
                          style={
                            user.isBlocked
                              ? {
                                  background: "rgba(239,68,68,0.12)",
                                  color: "#f87171",
                                  border: "1px solid rgba(239,68,68,0.2)"
                                }
                              : {
                                  background: "rgba(52,211,153,0.12)",
                                  color: "#34d399",
                                  border: "1px solid rgba(52,211,153,0.2)"
                                }
                          }
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              background: user.isBlocked
                                ? "#f87171"
                                : "#34d399"
                            }}
                          />

                          {user.isBlocked ? "Blocked" : "Active"}
                        </span>

                      </div>

                      <button
                        onClick={() => toggleBlock(user)}
                        disabled={isProcessing || processingUserId !== null}
                        className="text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
                        style={{
                          ...(user.isBlocked
                            ? {
                                background: "rgba(52,211,153,0.1)",
                                color: "#34d399",
                                border: "1px solid rgba(52,211,153,0.2)"
                              }
                            : {
                                background: "rgba(239,68,68,0.1)",
                                color: "#f87171",
                                border: "1px solid rgba(239,68,68,0.2)"
                              }),
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
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          background: "rgba(249,115,22,0.15)",
                          color: "#f97316",
                          border: "1px solid rgba(249,115,22,0.2)"
                        }}
                      >
                        {user.name?.charAt(0).toUpperCase()}
                      </div>

                      <span
                        className="text-sm font-medium"
                        style={{ color: "#e2e8f0" }}
                      >
                        {user.name}
                      </span>

                    </div>

                    {/* Desktop: Email */}
                    <p
                      className="hidden sm:block text-sm"
                      style={{ color: "#94a3b8" }}
                    >
                      {user.email}
                    </p>

                    {/* Desktop: Status */}
                    <div className="hidden sm:block">

                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={
                          user.isBlocked
                            ? {
                                background: "rgba(239,68,68,0.12)",
                                color: "#f87171",
                                border: "1px solid rgba(239,68,68,0.2)"
                              }
                            : {
                                background: "rgba(52,211,153,0.12)",
                                color: "#34d399",
                                border: "1px solid rgba(52,211,153,0.2)"
                              }
                        }
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: user.isBlocked
                              ? "#f87171"
                              : "#34d399"
                          }}
                        />

                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>

                    </div>

                    {/* Desktop: Action */}
                    <div className="hidden sm:flex justify-center">

                      <button
                        onClick={() => toggleBlock(user)}
                        disabled={isProcessing || processingUserId !== null}
                        className="text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer"
                        style={{
                          ...(user.isBlocked
                            ? {
                                background: "rgba(52,211,153,0.1)",
                                color: "#34d399",
                                border: "1px solid rgba(52,211,153,0.2)"
                              }
                            : {
                                background: "rgba(239,68,68,0.1)",
                                color: "#f87171",
                                border: "1px solid rgba(239,68,68,0.2)"
                              }),
                          opacity: isProcessing ? 0.55 : 1,
                          cursor: isProcessing || processingUserId !== null
                            ? "not-allowed"
                            : "pointer"
                        }}
                        onMouseEnter={e => {
                          if (!isProcessing && processingUserId === null) {
                            e.currentTarget.style.background =
                              user.isBlocked ? "#34d399" : "#ef4444";

                            e.currentTarget.style.color = "#fff";
                            e.currentTarget.style.borderColor = "transparent";
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isProcessing && processingUserId === null) {
                            e.currentTarget.style.background =
                              user.isBlocked
                                ? "rgba(52,211,153,0.1)"
                                : "rgba(239,68,68,0.1)";

                            e.currentTarget.style.color =
                              user.isBlocked
                                ? "#34d399"
                                : "#f87171";

                            e.currentTarget.style.borderColor =
                              user.isBlocked
                                ? "rgba(52,211,153,0.2)"
                                : "rgba(239,68,68,0.2)";
                          }
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
                <div
                  className="text-center py-16 text-sm"
                  style={{ color: "#475569" }}
                >
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