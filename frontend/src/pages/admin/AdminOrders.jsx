import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import axios from "axios";
import API_URL from "../../config/api";


/* ─────────────────────────────────────────────────────────────
   STATUS STYLES (black / red / white theme)
───────────────────────────────────────────────────────────── */

const STATUS_STYLES = {
  "Order Placed": {
    background: "rgba(255, 255, 255, 0.06)",
    color: "rgba(255, 255, 255, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.22)"
  },

  Processing: {
    background: "rgba(255, 154, 164, 0.08)",
    color: "#ffb3bb",
    border: "1px solid rgba(255, 154, 164, 0.3)"
  },

  Packing: {
    background: "rgba(255, 120, 132, 0.1)",
    color: "#ff9aa4",
    border: "1px solid rgba(255, 120, 132, 0.35)"
  },

  Shipped: {
    background: "rgba(255, 85, 100, 0.12)",
    color: "#ff7784",
    border: "1px solid rgba(255, 85, 100, 0.4)"
  },

  "Out for delivery": {
    background: "rgba(255, 45, 63, 0.14)",
    color: "#ff5563",
    border: "1px solid rgba(255, 45, 63, 0.5)"
  },

  Delivered: {
    background: "rgba(255, 255, 255, 0.1)",
    color: "#ffffff",
    border: "1px solid rgba(255, 255, 255, 0.45)"
  },

  Cancelled: {
    background: "rgba(255, 45, 63, 0.22)",
    color: "#ffffff",
    border: "1px solid rgba(255, 45, 63, 0.6)"
  }
};


const getStatusStyle = (status) => {
  return (
    STATUS_STYLES[status] ||
    STATUS_STYLES["Order Placed"]
  );
};


/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */

const CANCELLABLE_STATUSES = [
  "Order Placed",
  "Processing",
  "Packing"
];

const STATUS_OPTIONS = [
  "Order Placed",
  "Processing",
  "Packing",
  "Shipped",
  "Out for delivery",
  "Delivered"
];


/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};


const formatCurrency = (amount) => {
  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount)) {
    return "₹0";
  }

  return `₹${numericAmount.toLocaleString("en-IN")}`;
};


const canCancelOrder = (status) => {
  return CANCELLABLE_STATUSES.includes(status);
};

const SUCCESS_TOAST_MS = 3000;
const ERROR_TOAST_MS = 6000;


/* ─────────────────────────────────────────────────────────────
   SHARED STYLES (visual only)

   Responsive layout map
   ─ < 640px       one column of order cards
   ─ 640–1023px    two columns of order cards
   ─ ≥ 1024px      table (columns tighten, then actions go side by side at 1280px)

   Inside each card, the email + status fields sit side by side
   whenever the card itself is wide enough (container query), so
   the card re-arranges based on its own width, not just the screen.

   --ao-max and --ao-px match the navbar so edges line up.
───────────────────────────────────────────────────────────── */

const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

  .ao-root {
    --ao-red:        #ff2d3f;
    --ao-line:       rgba(255, 45, 63, 0.22);
    --ao-line-hover: rgba(255, 45, 63, 0.6);
    --ao-white:      #ffffff;
    --ao-white-soft: rgba(255, 255, 255, 0.7);

    /* ── responsive scale (overridden per breakpoint below) ── */
    --ao-max:        1400px;
    --ao-px:         0.875rem;
    --ao-py:         1rem;
    --ao-sect:       1.25rem;
    --ao-title:      1.9rem;
    --ao-over:       0.68rem;
    --ao-sub:        0.85rem;
    --ao-card-p:     1rem;
    --ao-card-gap:   0.75rem;
    --ao-card-id:    0.9rem;
    --ao-tab-px:     0.9rem;
    --ao-tab-py:     0.7rem;
    --ao-tab-fs:     0.82rem;
    --ao-btn-fs:     0.8rem;
    --ao-btn-px:     0.9rem;
    --ao-btn-py:     0.6rem;
    --ao-th-fs:      0.68rem;
    --ao-cell-px:    0.9rem;
    --ao-cell-py:    1rem;
    --ao-sel-w:      9.5rem;
    --ao-radius:     14px;

    position: relative;
    overflow-x: hidden;
    width: 100%;
    min-height: 100vh;
    background: #000000;
    color: var(--ao-white);
    font-family: 'Manrope', 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    padding:
      var(--ao-py)
      max(var(--ao-px), env(safe-area-inset-right))
      calc(var(--ao-py) + 2rem + env(safe-area-inset-bottom))
      max(var(--ao-px), env(safe-area-inset-left));
  }

  .ao-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ao-wrap {
    position: relative;
    width: 100%;
    min-width: 0;
    max-width: var(--ao-max);
    margin: 0 auto;
  }

  .ao-mt { margin-top: 0.5rem; }

  /* ── Entrance ── */

  .ao-rise {
    opacity: 0;
    animation: ao-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  @keyframes ao-rise {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Header ── */

  .ao-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: var(--ao-sect);
  }

  .ao-head-text { min-width: 0; }

  .ao-overline {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    color: var(--ao-red);
    font-size: var(--ao-over);
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    margin: 0 0 0.4rem;
  }

  .ao-overline::before {
    content: '';
    width: 1.75rem;
    height: 2px;
    background: var(--ao-red);
  }

  .ao-title {
    margin: 0;
    color: var(--ao-white);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.05;
    font-size: var(--ao-title);
  }

  .ao-subtitle {
    margin: 0.65rem 0 0;
    color: var(--ao-white-soft);
    font-size: var(--ao-sub);
    font-weight: 500;
  }

  .ao-title-bar {
    margin-top: 0.85rem;
    height: 2px;
    width: 5rem;
    border-radius: 2px;
    background: var(--ao-red);
    transform-origin: left center;
    animation: ao-draw 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
  }

  @keyframes ao-draw {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  /* refresh button: icon + label, icon-only on very small phones */
  .ao-refresh {
    flex: 0 0 auto;
    gap: 0.5rem;
  }

  .ao-refresh svg {
    flex: 0 0 auto;
    width: 15px;
    height: 15px;
  }

  /* ── Panel ── */

  .ao-panel {
    position: relative;
    background: transparent;
    border: 1px solid var(--ao-line);
    border-radius: var(--ao-radius);
    transition: border-color 0.3s ease;
  }

  .ao-panel:hover {
    border-color: var(--ao-line-hover);
  }

  /* ── Tabs: two equal tiles on phones, inline from 480px ── */

  .ao-tabs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.6rem;
    margin-bottom: var(--ao-sect);
  }

  .ao-tab {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    min-width: 0;
    min-height: 2.75rem;
    padding: var(--ao-tab-py) var(--ao-tab-px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    font-family: inherit;
    font-size: var(--ao-tab-fs);
    font-weight: 700;
    cursor: pointer;
    transition:
      background 0.25s ease,
      color 0.25s ease,
      border-color 0.25s ease,
      box-shadow 0.25s ease;
  }

  .ao-tab:hover {
    color: #ffffff;
    border-color: rgba(255, 45, 63, 0.6);
  }

  .ao-tab--active {
    color: #ffffff;
    background: rgba(255, 45, 63, 0.16);
    border-color: #ff2d3f;
    box-shadow: 0 0 16px rgba(255, 45, 63, 0.12);
  }

  .ao-tab-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    font-size: 0.72rem;
    font-weight: 800;
  }

  .ao-tab--active .ao-tab-count {
    background: #ff2d3f;
  }

  /* ── Table (≥ 1024px) ── */

  .ao-table {
    width: 100%;
    border-collapse: collapse;
  }

  .ao-th {
    padding: calc(var(--ao-cell-py) * 0.95) var(--ao-cell-px);
    text-align: left;
    color: var(--ao-white-soft);
    font-size: var(--ao-th-fs);
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .ao-thead-row {
    border-bottom: 1px solid var(--ao-line);
  }

  .ao-td {
    padding: var(--ao-cell-py) var(--ao-cell-px);
    vertical-align: middle;
  }

  /* column widths: email takes the flexible space */
  .ao-th:nth-child(1),
  .ao-td:nth-child(1) { width: 22%; }

  .ao-th:nth-child(2),
  .ao-td:nth-child(2) { width: 34%; }

  .ao-th:nth-child(3),
  .ao-td:nth-child(3) { width: 24%; }

  .ao-th:nth-child(4),
  .ao-td:nth-child(4) { width: 20%; }

  .ao-row {
    position: relative;
    background: transparent;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    transition: background 0.25s ease;
  }

  .ao-row:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .ao-row:last-child {
    border-bottom: none;
  }

  .ao-row td:first-child {
    box-shadow: inset 0 0 0 0 var(--ao-red);
    transition: box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .ao-row:hover td:first-child {
    box-shadow: inset 3px 0 0 0 var(--ao-red);
  }

  .ao-cell-id {
    color: var(--ao-white);
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.9rem;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .ao-cell-date {
    margin-top: 0.3rem;
    color: var(--ao-white-soft);
    font-size: 0.78rem;
    font-weight: 500;
  }

  .ao-cell-email {
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.84rem;
    font-weight: 500;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .ao-muted {
    color: var(--ao-white-soft);
    font-size: 0.8rem;
    font-weight: 500;
  }

  .ao-label {
    color: var(--ao-white-soft);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 0.3rem;
  }

  /* status / action stacks inside table cells */
  .ao-status-stack {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .ao-actions-stack {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 9px;
  }

  /* ── Status badge ── */

  .ao-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.3rem 0.8rem;
    border-radius: 999px;
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    white-space: nowrap;
  }

  .ao-badge-dot {
    flex: 0 0 auto;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
  }

  /* ── Select ── */

  .ao-select {
    appearance: none;
    -webkit-appearance: none;
    font-family: inherit;
    font-size: max(16px, 0.82rem);
    font-weight: 600;
    color: #ffffff;
    background-color: #000000;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ff2d3f' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    border: 1px solid var(--ao-line);
    border-radius: 10px;
    min-height: 2.5rem;
    padding: 0.55rem 2rem 0.55rem 0.8rem;
    outline: none;
    transition: border-color 0.25s ease, box-shadow 0.25s ease;
  }

  .ao-select--table { width: var(--ao-sel-w); max-width: 100%; }

  .ao-select--card { width: 100%; }

  .ao-select:hover:not(:disabled) {
    border-color: var(--ao-line-hover);
  }

  .ao-select:focus-visible {
    border-color: var(--ao-red);
    box-shadow: 0 0 0 3px rgba(255, 45, 63, 0.25);
  }

  .ao-select option {
    background: #000000;
    color: #ffffff;
  }

  /* ── Buttons ── */

  .ao-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.5rem;
    font-family: inherit;
    font-size: var(--ao-btn-fs);
    font-weight: 700;
    letter-spacing: 0.02em;
    padding: var(--ao-btn-py) var(--ao-btn-px);
    border-radius: 10px;
    background: transparent;
    white-space: nowrap;
    transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  }

  .ao-btn--cancel {
    color: #ff2d3f;
    border: 1px solid rgba(255, 45, 63, 0.6);
  }

  .ao-btn--cancel:hover:not(:disabled) {
    background: #ff2d3f;
    color: #ffffff;
    border-color: #ff2d3f;
    box-shadow: 0 0 18px rgba(255, 45, 63, 0.4);
  }

  .ao-btn--ghost {
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.4);
  }

  .ao-btn--ghost:hover:not(:disabled) {
    background: #ffffff;
    color: #000000;
    border-color: #ffffff;
  }

  .ao-btn--details {
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.4);
  }

  .ao-btn--details:hover:not(:disabled) {
    background: #ffffff;
    color: #000000;
    border-color: #ffffff;
  }

  .ao-btn:focus-visible,
  .ao-tab:focus-visible {
    outline: 2px solid #ffffff;
    outline-offset: 2px;
  }

  .ao-btn:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  /* ── Glass toasts ── */

  .ao-toast-stack {
    position: fixed;
    top: calc(max(12px, env(safe-area-inset-top)) + 4rem);
    left: max(12px, env(safe-area-inset-left));
    right: max(12px, env(safe-area-inset-right));
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: auto;
    pointer-events: none;
  }

  .ao-toast {
    --toast-accent: 255, 255, 255;
    position: relative;
    overflow: hidden;
    pointer-events: auto;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.85rem 0.75rem 1rem 0.85rem;
    border-radius: 16px;
    color: #ffffff;
    background:
      linear-gradient(135deg,
        rgba(var(--toast-accent), 0.20) 0%,
        rgba(255, 255, 255, 0.06) 45%,
        rgba(var(--toast-accent), 0.08) 100%);
    border: 1px solid rgba(255, 255, 255, 0.2);
    -webkit-backdrop-filter: blur(20px) saturate(170%);
    backdrop-filter: blur(20px) saturate(170%);
    box-shadow:
      0 18px 44px rgba(0, 0, 0, 0.55),
      0 0 30px rgba(var(--toast-accent), 0.14),
      inset 0 1px 0 rgba(255, 255, 255, 0.35),
      inset 0 -1px 0 rgba(255, 255, 255, 0.05);
    animation: ao-toast-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  /* soft specular highlight across the top of the glass */
  .ao-toast::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.16), transparent 42%);
    pointer-events: none;
  }

  .ao-toast--success { --toast-accent: 255, 255, 255; }
  .ao-toast--error   { --toast-accent: 255, 45, 63; border-color: rgba(255, 45, 63, 0.5); }

  @keyframes ao-toast-in {
    from { opacity: 0; transform: translate3d(36px, -6px, 0) scale(0.96); }
    to   { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
  }

  .ao-toast-icon {
    position: relative;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 12px;
    color: #ffffff;
    background: rgba(var(--toast-accent), 0.16);
    border: 1px solid rgba(var(--toast-accent), 0.4);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  .ao-toast--error .ao-toast-icon {
    color: #ff5563;
    background: rgba(255, 45, 63, 0.18);
  }

  .ao-toast-body {
    position: relative;
    flex: 1 1 auto;
    min-width: 0;
    padding-top: 1px;
  }

  .ao-toast-title {
    margin: 0;
    font-size: 0.88rem;
    font-weight: 800;
    letter-spacing: -0.005em;
    color: #ffffff;
  }

  .ao-toast-text {
    margin: 0.2rem 0 0;
    font-size: 0.82rem;
    font-weight: 500;
    line-height: 1.45;
    color: rgba(255, 255, 255, 0.78);
    overflow-wrap: anywhere;
  }

  .ao-toast-close {
    position: relative;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: rgba(255, 255, 255, 0.55);
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
  }

  .ao-toast-close:hover {
    background: rgba(255, 255, 255, 0.14);
    color: #ffffff;
  }

  .ao-toast-close:focus-visible {
    outline: 2px solid #ffffff;
    outline-offset: 1px;
  }

  .ao-toast-progress {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 3px;
    width: 100%;
    background: rgba(var(--toast-accent), 0.85);
    box-shadow: 0 0 10px rgba(var(--toast-accent), 0.6);
    transform-origin: left center;
    animation: ao-toast-timer linear forwards;
  }

  @keyframes ao-toast-timer {
    from { transform: scaleX(1); }
    to   { transform: scaleX(0); }
  }

  /* ── Glass confirm dialog: bottom sheet on phones, centred card from 521px ── */

  .ao-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1100;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0;
    background: rgba(0, 0, 0, 0.55);
    -webkit-backdrop-filter: blur(10px) saturate(120%);
    backdrop-filter: blur(10px) saturate(120%);
    animation: ao-fade 0.25s ease both;
  }

  @keyframes ao-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .ao-modal {
    position: relative;
    width: 100%;
    max-width: 100%;
    max-height: 92vh;
    max-height: 92dvh;
    overflow-y: auto;
    padding: 1.5rem 1.15rem calc(1.25rem + env(safe-area-inset-bottom));
    border-radius: 22px 22px 0 0;
    text-align: center;
    background:
      linear-gradient(145deg,
        rgba(255, 255, 255, 0.16) 0%,
        rgba(255, 255, 255, 0.05) 50%,
        rgba(255, 45, 63, 0.12) 100%),
      rgba(0, 0, 0, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.22);
    -webkit-backdrop-filter: blur(28px) saturate(180%);
    backdrop-filter: blur(28px) saturate(180%);
    box-shadow:
      0 30px 80px rgba(0, 0, 0, 0.7),
      0 0 50px rgba(255, 45, 63, 0.18),
      inset 0 1px 0 rgba(255, 255, 255, 0.4),
      inset 0 -1px 0 rgba(255, 255, 255, 0.06);
    animation: ao-sheet-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .ao-modal::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.14), transparent 38%);
    pointer-events: none;
  }

  @keyframes ao-sheet-in {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes ao-modal-in {
    from { opacity: 0; transform: translateY(16px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .ao-modal-icon {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    margin-bottom: 0.9rem;
    border-radius: 16px;
    color: #ff5563;
    background: rgba(255, 45, 63, 0.16);
    border: 1px solid rgba(255, 45, 63, 0.5);
    box-shadow: 0 0 24px rgba(255, 45, 63, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  .ao-modal-title {
    position: relative;
    margin: 0;
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #ffffff;
  }

  .ao-modal-text {
    position: relative;
    margin: 0.55rem 0 0;
    font-size: 0.88rem;
    font-weight: 500;
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.75);
  }

  .ao-modal-text strong {
    color: #ffffff;
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .ao-modal-actions {
    position: relative;
    display: flex;
    flex-direction: column-reverse;
    gap: 10px;
    margin-top: 1.35rem;
  }

  .ao-modal-actions .ao-btn {
    flex: 1 1 0;
    min-height: 2.9rem;
    padding: 0.7rem 1rem;
  }

  .ao-btn--glass {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.3);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    cursor: pointer;
  }

  .ao-btn--glass:hover {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.55);
  }

  .ao-btn--danger {
    color: #ffffff;
    background: rgba(255, 45, 63, 0.78);
    border: 1px solid rgba(255, 120, 132, 0.7);
    box-shadow: 0 0 20px rgba(255, 45, 63, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3);
    cursor: pointer;
  }

  .ao-btn--danger:hover {
    background: #ff2d3f;
    box-shadow: 0 0 28px rgba(255, 45, 63, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.35);
  }

  /* ── Empty / loading ── */

  .ao-empty {
    padding: 2.5rem 1.25rem;
    text-align: center;
  }

  .ao-empty-icon {
    font-size: 2.25rem;
    margin-bottom: 0.85rem;
  }

  .ao-empty-title {
    margin: 0;
    color: var(--ao-white);
    font-size: 1.1rem;
    font-weight: 700;
  }

  .ao-empty-text {
    color: var(--ao-white-soft);
    font-size: 0.88rem;
    font-weight: 500;
  }

  .ao-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .ao-loader {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 2px solid var(--ao-line);
    border-top-color: var(--ao-red);
    animation: ao-spin 0.8s linear infinite;
  }

  @keyframes ao-spin {
    to { transform: rotate(360deg); }
  }

  /* ── Order cards (below 1024px) ── */

  .ao-cards {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--ao-card-gap);
  }

  .ao-desktop { display: none; }

  /* the cell is the "container": cards respond to their own width */
  .ao-card-cell {
    min-width: 0;
    display: flex;
    container-type: inline-size;
  }

  .ao-card {
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    padding: var(--ao-card-p);
    display: flex;
    flex-direction: column;
    gap: 0.95rem;
  }

  .ao-card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.6rem;
    flex-wrap: wrap;
  }

  .ao-card-id {
    color: var(--ao-white);
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: var(--ao-card-id);
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  /* email + status fields: stacked in narrow cards, side by side in wide ones */
  .ao-card-fields {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.95rem;
    padding-top: 0.95rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .ao-card-field { min-width: 0; }

  .ao-card-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.55rem;
    margin-top: auto;
  }

  .ao-card-actions .ao-btn {
    min-width: 0;
    padding-left: 0.6rem;
    padding-right: 0.6rem;
    white-space: normal;
    text-align: center;
    line-height: 1.2;
  }

  @container (min-width: 25rem) {
    .ao-card-fields--two {
      grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
      gap: 1.1rem;
    }
  }

  @container (max-width: 16.5rem) {
    .ao-card-actions { grid-template-columns: minmax(0, 1fr); }
  }

  /* ── Scrollbar (table overflow safety net) ── */

  .ao-desktop::-webkit-scrollbar {
    height: 6px;
  }

  .ao-desktop::-webkit-scrollbar-thumb {
    background: var(--ao-line-hover);
    border-radius: 6px;
  }

  /* ═══════════ Responsive scale ═══════════ */

  /* < 375px: refresh becomes an icon-only square, tabs tighten */
  @media (max-width: 374px) {
    .ao-head { align-items: flex-start; }

    .ao-refresh {
      width: 2.75rem;
      min-height: 2.75rem;
      padding: 0;
    }

    .ao-refresh-label { display: none; }

    .ao-tab { padding-left: 0.5rem; padding-right: 0.5rem; gap: 0.4rem; }
  }

  /* ≥ 375px: iPhone-size phones */
  @media (min-width: 375px) {
    .ao-root {
      --ao-px: 1rem;
      --ao-py: 1.1rem;
      --ao-title: 2.05rem;
      --ao-card-p: 1.1rem;
    }
  }

  /* ≥ 480px: large phones / landscape */
  @media (min-width: 480px) {
    .ao-root {
      --ao-py: 1.25rem;
      --ao-sect: 1.4rem;
      --ao-over: 0.72rem;
      --ao-sub: 0.9rem;
      --ao-card-p: 1.25rem;
      --ao-card-id: 0.95rem;
      --ao-tab-px: 1.25rem;
      --ao-btn-fs: 0.82rem;
    }

    /* tabs hug their content instead of filling the row */
    .ao-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
    }
  }

  /* ≥ 521px: confirm dialog becomes a centred card, toasts dock top-right */
  @media (min-width: 521px) {
    .ao-modal-backdrop {
      align-items: center;
      padding: 20px;
    }

    .ao-modal {
      max-width: 420px;
      padding: 1.75rem 1.6rem 1.5rem;
      border-radius: 22px;
      animation: ao-modal-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    .ao-modal-icon { width: 52px; height: 52px; }
    .ao-modal-title { font-size: 1.25rem; }
    .ao-modal-text { font-size: 0.9rem; }
    .ao-modal-actions { flex-direction: row; }

    .ao-toast-stack {
      left: auto;
      right: 16px;
      top: calc(max(16px, env(safe-area-inset-top)) + 4.5rem);
      width: min(380px, calc(100vw - 32px));
    }
  }

  /* ≥ 640px: tablets (portrait) → two columns of cards */
  @media (min-width: 640px) {
    .ao-root {
      --ao-px: 1.5rem;
      --ao-py: 1.5rem;
      --ao-sect: 1.6rem;
      --ao-title: 2.4rem;
      --ao-card-gap: 1rem;
      --ao-card-p: 1.25rem;
      --ao-radius: 16px;
      --ao-tab-fs: 0.86rem;
    }

    .ao-cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .ao-empty { padding: 3.25rem 1.5rem; }
    .ao-empty-icon { font-size: 2.6rem; }
    .ao-empty-title { font-size: 1.2rem; }
  }

  /* ≥ 768px: tablets (landscape) */
  @media (min-width: 768px) {
    .ao-root {
      --ao-py: 1.75rem;
      --ao-sect: 1.75rem;
      --ao-title: 2.55rem;
      --ao-card-gap: 1.15rem;
      --ao-card-p: 1.4rem;
      --ao-sub: 0.95rem;
    }

    .ao-toast-stack {
      right: 20px;
      width: min(390px, calc(100vw - 40px));
    }
  }

  /* ≥ 1024px: laptops → table layout */
  @media (min-width: 1024px) {
    .ao-root {
      --ao-px: 2rem;
      --ao-py: 2rem;
      --ao-sect: 2rem;
      --ao-cell-px: 1rem;
      --ao-cell-py: 1.05rem;
      --ao-th-fs: 0.7rem;
      --ao-sel-w: 10rem;
    }

    .ao-cards   { display: none; }
    .ao-desktop { display: block; }
  }

  /* ≥ 1280px: desktops → actions sit side by side, select widens */
  @media (min-width: 1280px) {
    .ao-root {
      --ao-py: 2.25rem;
      --ao-title: 2.8rem;
      --ao-cell-px: 1.25rem;
      --ao-cell-py: 1.15rem;
      --ao-th-fs: 0.74rem;
      --ao-sel-w: 10.5rem;
      --ao-btn-px: 1.1rem;
    }

    .ao-th:nth-child(1),
    .ao-td:nth-child(1) { width: 18%; }

    .ao-th:nth-child(2),
    .ao-td:nth-child(2) { width: 30%; }

    .ao-th:nth-child(3),
    .ao-td:nth-child(3) { width: 22%; }

    .ao-th:nth-child(4),
    .ao-td:nth-child(4) { width: 30%; }

    .ao-actions-stack {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
    }
  }

  /* ≥ 1536px: large monitors */
  @media (min-width: 1536px) {
    .ao-root {
      --ao-max: 1680px;
      --ao-px: 2.5rem;
      --ao-py: 2.5rem;
      --ao-sect: 2.5rem;
      --ao-over: 0.8rem;
      --ao-title: 3rem;
      --ao-cell-px: 1.5rem;
      --ao-cell-py: 1.3rem;
      --ao-btn-fs: 0.88rem;
      --ao-tab-fs: 0.92rem;
      --ao-sel-w: 11.5rem;
    }

    .ao-cell-id { font-size: 0.98rem; }
    .ao-cell-email { font-size: 0.92rem; }
    .ao-badge { font-size: 0.8rem; }
  }

  /* ≥ 1920px: ultra-wide */
  @media (min-width: 1920px) {
    .ao-root {
      --ao-max: 1840px;
    }
  }

  /* ── Short landscape screens (phones turned sideways) ── */

  @media (max-height: 500px) and (orientation: landscape) {
    .ao-modal-backdrop {
      align-items: center;
      padding: 12px;
    }

    .ao-modal {
      max-width: 460px;
      padding: 1rem 1.25rem;
      border-radius: 18px;
    }

    .ao-modal-icon { display: none; }
    .ao-modal-actions { flex-direction: row; margin-top: 1rem; }
    .ao-modal-actions .ao-btn { min-height: 2.6rem; }
  }

  /* ── Reduced motion ── */

  @media (prefers-reduced-motion: reduce) {
    .ao-rise,
    .ao-title-bar,
    .ao-toast,
    .ao-modal,
    .ao-modal-backdrop {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }

    .ao-loader {
      animation-duration: 2s;
    }

    .ao-toast-progress {
      display: none;
    }

    .ao-row,
    .ao-row td:first-child,
    .ao-btn,
    .ao-select,
    .ao-panel,
    .ao-tab {
      transition: none !important;
    }
  }
`;


/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */

const AdminOrders = () => {

  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("orders");

  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [confirmOrderId, setConfirmOrderId] = useState(null);


  /* ─────────────────────────────────────────────────────────
     FILTER ORDERS
  ───────────────────────────────────────────────────────── */

  const activeOrders = useMemo(() => {
    return orders.filter(
      (order) => order.status !== "Cancelled"
    );
  }, [orders]);


  const cancelledOrders = useMemo(() => {
    return orders.filter(
      (order) => order.status === "Cancelled"
    );
  }, [orders]);


  const displayedOrders = useMemo(() => {
    return activeTab === "cancelled"
      ? cancelledOrders
      : activeOrders;
  }, [
    activeTab,
    activeOrders,
    cancelledOrders
  ]);


  /* ─────────────────────────────────────────────────────────
     LOAD ORDERS
  ───────────────────────────────────────────────────────── */

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const res = await axios.get(
        `${API_URL}/admin/orders`,
        {
          withCredentials: true
        }
      );

      const rawOrders = Array.isArray(res.data?.orders)
        ? res.data.orders
        : [];

      const data = [...rawOrders].map((order) => ({
        ...order,

        /*
          Backend returns:
          id      -> MongoDB _id
          orderId -> customer-facing order ID

          Keep both available.
        */

        id: order.id ?? order._id ?? order.orderId,

        total:
          order.total ??
          order.amount ??
          0
      }));

      setOrders(data);

    } catch (err) {
      console.error(
        "Failed to load admin orders:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load orders. Please try again."
      );

    } finally {
      setLoading(false);
    }
  }, []);


  /* ─────────────────────────────────────────────────────────
     INITIAL LOAD
  ───────────────────────────────────────────────────────── */

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);


  /* ─────────────────────────────────────────────────────────
     CLEAR SUCCESS MESSAGE
  ───────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, SUCCESS_TOAST_MS);

    return () => clearTimeout(timer);

  }, [successMessage]);


  /* ─────────────────────────────────────────────────────────
     CLEAR ERROR MESSAGE
  ───────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!error) {
      return;
    }

    const timer = setTimeout(() => {
      setError("");
    }, ERROR_TOAST_MS);

    return () => clearTimeout(timer);

  }, [error]);


  /* ─────────────────────────────────────────────────────────
     CLOSE CONFIRM DIALOG WITH ESCAPE
  ───────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!confirmOrderId) {
      return;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setConfirmOrderId(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);

  }, [confirmOrderId]);


  /* ─────────────────────────────────────────────────────────
     UPDATE ORDER STATUS
  ───────────────────────────────────────────────────────── */

  const handleStatusChange = async (
    orderId,
    status
  ) => {

    if (!orderId || !status) {
      return;
    }

    const currentOrder = orders.find(
      (order) =>
        String(order.id) === String(orderId)
    );

    if (
      !currentOrder ||
      currentOrder.status === "Cancelled"
    ) {
      return;
    }

    try {
      setUpdatingOrderId(orderId);

      setError("");

      setSuccessMessage("");

      await axios.patch(
        `${API_URL}/admin/orders/${encodeURIComponent(
          orderId
        )}/status`,
        {
          status
        },
        {
          withCredentials: true
        }
      );

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          String(order.id) === String(orderId)
            ? {
                ...order,
                status
              }
            : order
        )
      );

      setSuccessMessage(
        "Order status updated successfully."
      );

    } catch (err) {
      console.error(
        "Failed to update order status:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update order status."
      );

    } finally {
      setUpdatingOrderId(null);
    }
  };


  /* ─────────────────────────────────────────────────────────
     CANCEL ORDER
  ───────────────────────────────────────────────────────── */

  const handleCancelOrder = async (orderId) => {

    if (!orderId) {
      return;
    }

    const order = orders.find(
      (item) =>
        String(item.id) === String(orderId)
    );

    /*
      Only these statuses can be cancelled:

      Order Placed
      Processing
      Packing

      Shipped and later statuses cannot be cancelled.
    */

    if (
      !order ||
      !canCancelOrder(order.status)
    ) {
      return;
    }

    // Open the glass confirm dialog instead of window.confirm
    setConfirmOrderId(orderId);
  };


  const confirmCancelOrder = async () => {

    const orderId = confirmOrderId;

    setConfirmOrderId(null);

    if (!orderId) {
      return;
    }

    try {
      setCancellingOrderId(orderId);

      setError("");

      setSuccessMessage("");

      await axios.delete(
        `${API_URL}/admin/orders/${encodeURIComponent(
          orderId
        )}`,
        {
          withCredentials: true
        }
      );

      /*
        Do not delete the order record.

        Backend changes its status to Cancelled.

        Updating local state automatically moves
        the order into the Cancelled tab.
      */

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          String(order.id) === String(orderId)
            ? {
                ...order,
                status: "Cancelled"
              }
            : order
        )
      );

      setSuccessMessage(
        "Order cancelled successfully."
      );

    } catch (err) {
      console.error(
        "Failed to cancel order:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to cancel order."
      );

    } finally {
      setCancellingOrderId(null);
    }
  };


  /* ─────────────────────────────────────────────────────────
     OPEN ORDER DETAILS
  ───────────────────────────────────────────────────────── */

  const handleViewDetails = (orderId) => {

    if (!orderId) {
      return;
    }

    /*
      Use the existing MongoDB _id.

      Do not use the customer-facing orderId here.
    */

    navigate(
      `/admin/orders/${encodeURIComponent(orderId)}`
    );
  };


  /* ─────────────────────────────────────────────────────────
     RENDER STATUS BADGE
  ───────────────────────────────────────────────────────── */

  const renderStatusBadge = (status) => {

    const statusStyle = getStatusStyle(status);

    return (
      <span
        className="ao-badge"
        style={{
          background: statusStyle.background,
          color: statusStyle.color,
          border: statusStyle.border
        }}
      >
        <span className="ao-badge-dot" />

        {status || "Order Placed"}
      </span>
    );
  };


  /* ─────────────────────────────────────────────────────────
     RENDER STATUS SELECT
  ───────────────────────────────────────────────────────── */

  const renderStatusSelect = (order) => {

    const isUpdating =
      String(updatingOrderId) === String(order.id);

    const isCancelling =
      String(cancellingOrderId) === String(order.id);

    const isCancelled =
      order.status === "Cancelled";

    return (
      <div className="ao-status-stack">

        {renderStatusBadge(order.status)}

        <select
          className="ao-select ao-select--table"
          value={order.status || "Order Placed"}
          disabled={
            isCancelled ||
            isUpdating ||
            isCancelling
          }
          onChange={(event) =>
            handleStatusChange(
              order.id,
              event.target.value
            )
          }
          style={{
            cursor:
              isCancelled ||
              isUpdating ||
              isCancelling
                ? "not-allowed"
                : "pointer",
            opacity:
              isCancelled ||
              isUpdating ||
              isCancelling
                ? 0.55
                : 1
          }}
        >
          {STATUS_OPTIONS.map((status) => (
            <option
              key={status}
              value={status}
            >
              {status}
            </option>
          ))}
        </select>

        {isUpdating && (
          <span className="ao-muted">
            Updating...
          </span>
        )}
      </div>
    );
  };


  /* ─────────────────────────────────────────────────────────
     RENDER ACTION BUTTONS
  ───────────────────────────────────────────────────────── */

  const renderOrderActions = (order) => {

    const isUpdating =
      String(updatingOrderId) === String(order.id);

    const isCancelling =
      String(cancellingOrderId) === String(order.id);

    const isCancelled =
      order.status === "Cancelled";

    const cancellable =
      canCancelOrder(order.status);

    return (
      <div className="ao-actions-stack">

        <button
          type="button"
          className="ao-btn ao-btn--details"
          onClick={() =>
            handleViewDetails(order.id)
          }
          disabled={isCancelling || isUpdating}
          style={{
            cursor:
              isCancelling || isUpdating
                ? "not-allowed"
                : "pointer"
          }}
        >
          More Details
        </button>

        <button
          type="button"
          className="ao-btn ao-btn--cancel"
          onClick={() =>
            handleCancelOrder(order.id)
          }
          disabled={
            !cancellable ||
            isCancelled ||
            isCancelling ||
            isUpdating
          }
          title={
            !cancellable && !isCancelled
              ? "This order can no longer be cancelled."
              : ""
          }
        >
          {isCancelling
            ? "Cancelling..."
            : isCancelled
            ? "Cancelled"
            : cancellable
            ? "Cancel"
            : "Not cancellable"}
        </button>

      </div>
    );
  };


  /* ─────────────────────────────────────────────────────────
     GLASS TOAST
  ───────────────────────────────────────────────────────── */

  const renderToast = (type, message, onClose, duration) => {

    const isError = type === "error";

    return (
      <div
        className={`ao-toast ao-toast--${type}`}
        role={isError ? "alert" : "status"}
      >

        <span className="ao-toast-icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isError ? (
              <>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </>
            ) : (
              <polyline points="20 6 9 17 4 12" />
            )}
          </svg>
        </span>

        <div className="ao-toast-body">
          <p className="ao-toast-title">
            {isError ? "Something went wrong" : "Success"}
          </p>
          <p className="ao-toast-text">{message}</p>
        </div>

        <button
          type="button"
          className="ao-toast-close"
          onClick={onClose}
          aria-label="Dismiss notification"
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <span
          className="ao-toast-progress"
          style={{ animationDuration: `${duration}ms` }}
        />

      </div>
    );
  };


  const confirmOrder = confirmOrderId
    ? orders.find(
        (item) => String(item.id) === String(confirmOrderId)
      )
    : null;


  /* ─────────────────────────────────────────────────────────
     LOADING STATE
  ───────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="ao-root ao-center">

        <style>{THEME_CSS}</style>

        <div className="ao-loading ao-rise">

          <div className="ao-loader" />

          <p className="ao-empty-text">
            Loading orders...
          </p>

        </div>

      </div>
    );
  }


  /* ─────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────── */

  return (
    <div className="ao-root">

      <style>{THEME_CSS}</style>

      {/* GLASS TOASTS */}

      <div className="ao-toast-stack" aria-live="polite">

        {successMessage &&
          renderToast(
            "success",
            successMessage,
            () => setSuccessMessage(""),
            SUCCESS_TOAST_MS
          )}

        {error &&
          renderToast(
            "error",
            error,
            () => setError(""),
            ERROR_TOAST_MS
          )}

      </div>


      {/* GLASS CONFIRM DIALOG */}

      {confirmOrder && (
        <div
          className="ao-modal-backdrop"
          onClick={() => setConfirmOrderId(null)}
        >
          <div
            className="ao-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ao-confirm-title"
            aria-describedby="ao-confirm-text"
            onClick={(event) => event.stopPropagation()}
          >

            <span className="ao-modal-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>

            <h3 id="ao-confirm-title" className="ao-modal-title">
              Cancel this order?
            </h3>

            <p id="ao-confirm-text" className="ao-modal-text">
              Are you sure you want to cancel order{" "}
              <strong>#{confirmOrder.orderId || confirmOrder.id}</strong>?
              It will move to the Cancelled tab.
            </p>

            <div className="ao-modal-actions">

              <button
                type="button"
                className="ao-btn ao-btn--glass"
                onClick={() => setConfirmOrderId(null)}
                autoFocus
              >
                Keep order
              </button>

              <button
                type="button"
                className="ao-btn ao-btn--danger"
                onClick={confirmCancelOrder}
              >
                Yes, cancel
              </button>

            </div>

          </div>
        </div>
      )}

      <div className="ao-wrap">

        {/* ───────────────────────────────────────────────────
            HEADER
        ─────────────────────────────────────────────────── */}

        <div className="ao-head ao-rise">

          <div className="ao-head-text">

            <p className="ao-overline">
              Management
            </p>

            <h1 className="ao-title">
              Orders
            </h1>

            <p className="ao-subtitle">
              Manage and track customer orders
            </p>

            <div className="ao-title-bar" />

          </div>

          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="ao-btn ao-btn--ghost ao-refresh"
            aria-label="Refresh orders"
            title="Refresh"
            style={{
              cursor: loading
                ? "not-allowed"
                : "pointer",
              opacity: loading ? 0.6 : 1
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>

            <span className="ao-refresh-label">
              Refresh
            </span>
          </button>

        </div>


        {/* Success and error messages are shown as glass toasts */}


        {/* ───────────────────────────────────────────────────
            ORDER TABS
        ─────────────────────────────────────────────────── */}

        <div className="ao-tabs ao-rise">

          <button
            type="button"
            className={`ao-tab ${
              activeTab === "orders"
                ? "ao-tab--active"
                : ""
            }`}
            onClick={() => setActiveTab("orders")}
            aria-pressed={activeTab === "orders"}
          >
            Orders

            <span className="ao-tab-count">
              {activeOrders.length}
            </span>
          </button>


          <button
            type="button"
            className={`ao-tab ${
              activeTab === "cancelled"
                ? "ao-tab--active"
                : ""
            }`}
            onClick={() => setActiveTab("cancelled")}
            aria-pressed={activeTab === "cancelled"}
          >
            Cancelled

            <span className="ao-tab-count">
              {cancelledOrders.length}
            </span>
          </button>

        </div>


        {/* ───────────────────────────────────────────────────
            EMPTY STATE
        ─────────────────────────────────────────────────── */}

        {displayedOrders.length === 0 ? (

          <div
            className="ao-panel ao-rise ao-empty"
            style={{
              animationDelay: "0.15s"
            }}
          >

            <div className="ao-empty-icon">
              {activeTab === "cancelled"
                ? "↩"
                : "📦"}
            </div>

            <h2 className="ao-empty-title">
              {activeTab === "cancelled"
                ? "No cancelled orders"
                : "No orders found"}
            </h2>

            <p className="ao-empty-text ao-mt">
              {activeTab === "cancelled"
                ? "Cancelled orders will appear here."
                : "Customer orders will appear here."}
            </p>

          </div>

        ) : (

          <>

            {/* ───────────────────────────────────────────────
                ORDER CARDS (below 1024px: 1 column, then 2)
            ─────────────────────────────────────────────── */}

            <div className="ao-cards">

              {displayedOrders.map((order, i) => {

                const isUpdating =
                  String(updatingOrderId) ===
                  String(order.id);

                const isCancelling =
                  String(cancellingOrderId) ===
                  String(order.id);

                return (

                  <div
                    key={order.id}
                    className="ao-card-cell"
                  >

                    <div
                      className="ao-panel ao-rise ao-card"
                      style={{
                        animationDelay: `${Math.min(i, 8) * 0.05}s`
                      }}
                    >

                      {/* ORDER ID AND STATUS */}

                      <div className="ao-card-top">

                        <div style={{ minWidth: 0 }}>

                          <div className="ao-card-id">
                            #
                            {order.orderId || order.id}
                          </div>

                          <div className="ao-cell-date">
                            {formatDate(
                              order.createdAt ||
                              order.date
                            )}
                          </div>

                        </div>

                        {renderStatusBadge(order.status)}

                      </div>


                      {/* EMAIL + STATUS UPDATE
                          (side by side when the card is wide enough) */}

                      <div
                        className={`ao-card-fields ${
                          activeTab === "orders"
                            ? "ao-card-fields--two"
                            : ""
                        }`}
                      >

                        {/* CUSTOMER EMAIL */}

                        <div className="ao-card-field">

                          <div className="ao-label">
                            Customer Email
                          </div>

                          <div className="ao-cell-email">
                            {order.email || "—"}
                          </div>

                        </div>


                        {/* STATUS UPDATE */}

                        {activeTab === "orders" && (

                          <div className="ao-card-field">

                            <div className="ao-label">
                              Update Status
                            </div>

                            <select
                              className="ao-select ao-select--card"
                              value={
                                order.status ||
                                "Order Placed"
                              }
                              disabled={
                                isUpdating ||
                                isCancelling
                              }
                              onChange={(event) =>
                                handleStatusChange(
                                  order.id,
                                  event.target.value
                                )
                              }
                              style={{
                                cursor:
                                  isUpdating ||
                                  isCancelling
                                    ? "not-allowed"
                                    : "pointer",
                                opacity:
                                  isUpdating ||
                                  isCancelling
                                    ? 0.6
                                    : 1
                              }}
                            >

                              {STATUS_OPTIONS.map((status) => (
                                <option
                                  key={status}
                                  value={status}
                                >
                                  {status}
                                </option>
                              ))}

                            </select>

                            {isUpdating && (
                              <p className="ao-muted ao-mt">
                                Updating...
                              </p>
                            )}

                          </div>

                        )}

                      </div>


                      {/* ACTIONS */}

                      <div className="ao-card-actions">

                        <button
                          type="button"
                          className="ao-btn ao-btn--details"
                          onClick={() =>
                            handleViewDetails(order.id)
                          }
                          disabled={
                            isUpdating ||
                            isCancelling
                          }
                          style={{
                            cursor:
                              isUpdating ||
                              isCancelling
                                ? "not-allowed"
                                : "pointer"
                          }}
                        >
                          More Details
                        </button>


                        <button
                          type="button"
                          className="ao-btn ao-btn--cancel"
                          onClick={() =>
                            handleCancelOrder(order.id)
                          }
                          disabled={
                            !canCancelOrder(order.status) ||
                            isUpdating ||
                            isCancelling
                          }
                          title={
                            !canCancelOrder(order.status)
                              ? "This order can no longer be cancelled."
                              : ""
                          }
                        >
                          {isCancelling
                            ? "Cancelling..."
                            : canCancelOrder(order.status)
                            ? "Cancel"
                            : "Not cancellable"}
                        </button>

                      </div>

                    </div>

                  </div>

                );

              })}

            </div>


            {/* ───────────────────────────────────────────────
                DESKTOP TABLE (1024px and up)
            ─────────────────────────────────────────────── */}

            <div
              className="ao-desktop ao-panel ao-rise"
              style={{
                overflowX: "auto",
                animationDelay: "0.15s"
              }}
            >

              <table className="ao-table">

                <thead>

                  <tr className="ao-thead-row">

                    <th className="ao-th">
                      Order
                    </th>

                    <th className="ao-th">
                      Customer Email
                    </th>

                    <th className="ao-th">
                      Status
                    </th>

                    <th className="ao-th">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {displayedOrders.map((order) => {

                    return (

                      <tr
                        key={order.id}
                        className="ao-row"
                      >

                        {/* ORDER ID AND DATE */}

                        <td className="ao-td">

                          <div className="ao-cell-id">
                            #
                            {order.orderId || order.id}
                          </div>

                          <div className="ao-cell-date">
                            {formatDate(
                              order.createdAt ||
                              order.date
                            )}
                          </div>

                        </td>


                        {/* CUSTOMER EMAIL */}

                        <td className="ao-td">

                          <span className="ao-cell-email">
                            {order.email || "—"}
                          </span>

                        </td>


                        {/* STATUS */}

                        <td className="ao-td">

                          {activeTab === "orders"
                            ? renderStatusSelect(order)
                            : renderStatusBadge(order.status)}

                        </td>


                        {/* ACTIONS */}

                        <td className="ao-td">

                          {renderOrderActions(order)}

                        </td>

                      </tr>

                    );

                  })}

                </tbody>

              </table>

            </div>

          </>

        )}

      </div>

    </div>
  );

};


export default AdminOrders;