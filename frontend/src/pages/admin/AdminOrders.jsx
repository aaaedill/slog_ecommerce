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
───────────────────────────────────────────────────────────── */

const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

  .ad-root {
    --ad-red:        #ff2d3f;
    --ad-line:       rgba(255, 45, 63, 0.22);
    --ad-line-hover: rgba(255, 45, 63, 0.6);
    --ad-white:      #ffffff;
    --ad-white-soft: rgba(255, 255, 255, 0.7);

    /* ── responsive scale (overridden per breakpoint below) ── */
    --ad-max:        100%;
    --ad-px:         0.625rem;
    --ad-py:         0.75rem;
    --ad-pb:         4rem;
    --ad-sect:       1.5rem;
    --ad-title:      clamp(1.9rem, 1.4rem + 2.6vw, 3.6rem);
    --ad-over:       0.68rem;
    --ad-sub:        0.85rem;
    --ad-card-p:     1rem;
    --ad-card-gap:   0.75rem;
    --ad-card-id:    0.9rem;
    --ad-tab-px:     0.9rem;
    --ad-tab-py:     0.7rem;
    --ad-tab-fs:     0.82rem;
    --ad-btn-fs:     0.8rem;
    --ad-btn-px:     0.9rem;
    --ad-btn-py:     0.6rem;
    --ad-th-fs:      0.68rem;
    --ad-cell-px:    0.9rem;
    --ad-cell-py:    1rem;
    --ad-sel-w:      9.5rem;
    --ad-radius:     14px;

    position: relative;
    overflow: hidden;
    width: 100%;
    background: #000000;
    color: var(--ad-white);
    font-family: 'Manrope', 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .ad-page {
    padding:
      var(--ad-py)
      max(var(--ad-px), env(safe-area-inset-right))
      var(--ad-pb)
      max(var(--ad-px), env(safe-area-inset-left));
  }

  .ad-wrap {
    position: relative;
    width: 100%;
    min-width: 0;
    max-width: var(--ad-max);
    margin: 0 auto;
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

  /* ── Header ── */

  .ad-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: var(--ad-sect);
  }

  .ad-head-text { min-width: 0; }

  .ad-overline {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    color: var(--ad-red);
    font-size: var(--ad-over);
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    margin: 0 0 0.5rem;
  }

  .ad-overline::before {
    content: '';
    width: 24px;
    height: 2px;
    background: var(--ad-red);
  }

  .ad-title {
    margin: 0;
    color: var(--ad-white);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.05;
    font-size: var(--ad-title);
  }

  .ad-subtitle {
    margin: 0.65rem 0 0;
    color: var(--ad-white-soft);
    font-size: var(--ad-sub);
    font-weight: 500;
  }

  .ad-title-bar {
    margin-top: 0.9rem;
    height: 2px;
    width: 72px;
    border-radius: 2px;
    background: var(--ad-red);
    transform-origin: left center;
    animation: ad-draw 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
  }

  @keyframes ad-draw {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  /* refresh button: icon + label, icon-only on very small phones */
  .ad-refresh {
    flex: 0 0 auto;
    gap: 0.5rem;
  }

  .ad-refresh svg {
    flex: 0 0 auto;
    width: 15px;
    height: 15px;
  }

  /* ── Panel ── */

  .ad-panel {
    position: relative;
    background: transparent;
    border: 1px solid var(--ad-line);
    border-radius: var(--ad-radius);
    transition: border-color 0.3s ease;
  }

  .ad-panel:hover {
    border-color: var(--ad-line-hover);
  }

  /* ── Tabs: two equal tiles on phones, inline from 480px ── */

  .ad-tabs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.6rem;
    margin-bottom: var(--ad-sect);
  }

  .ad-tab {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    min-width: 0;
    min-height: 2.75rem;
    padding: var(--ad-tab-py) var(--ad-tab-px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    font-family: inherit;
    font-size: var(--ad-tab-fs);
    font-weight: 700;
    cursor: pointer;
    transition:
      background 0.25s ease,
      color 0.25s ease,
      border-color 0.25s ease,
      box-shadow 0.25s ease;
  }

  .ad-tab:hover {
    color: #ffffff;
    border-color: rgba(255, 45, 63, 0.6);
  }

  .ad-tab--active {
    color: #ffffff;
    background: rgba(255, 45, 63, 0.16);
    border-color: #ff2d3f;
    box-shadow: 0 0 16px rgba(255, 45, 63, 0.12);
  }

  .ad-tab-count {
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

  .ad-tab--active .ad-tab-count {
    background: #ff2d3f;
  }

  /* ── Table (≥ 1024px) ── */

  .ad-table {
    width: 100%;
    border-collapse: collapse;
  }

  .ad-th {
    padding: calc(var(--ad-cell-py) * 0.95) var(--ad-cell-px);
    text-align: left;
    color: var(--ad-white-soft);
    font-size: var(--ad-th-fs);
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .ad-thead-row {
    border-bottom: 1px solid var(--ad-line);
  }

  .ad-td {
    padding: var(--ad-cell-py) var(--ad-cell-px);
    vertical-align: middle;
  }

  /* column widths: email takes the flexible space */
  .ad-th:nth-child(1),
  .ad-td:nth-child(1) { width: 22%; }

  .ad-th:nth-child(2),
  .ad-td:nth-child(2) { width: 34%; }

  .ad-th:nth-child(3),
  .ad-td:nth-child(3) { width: 24%; }

  .ad-th:nth-child(4),
  .ad-td:nth-child(4) { width: 20%; }

  .ad-row {
    position: relative;
    background: transparent;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    transition: background 0.25s ease;
  }

  .ad-row:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .ad-row:last-child {
    border-bottom: none;
  }

  .ad-row td:first-child {
    box-shadow: inset 0 0 0 0 var(--ad-red);
    transition: box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .ad-row:hover td:first-child {
    box-shadow: inset 3px 0 0 0 var(--ad-red);
  }

  .ad-cell-id {
    color: var(--ad-white);
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.9rem;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .ad-cell-date {
    margin-top: 0.3rem;
    color: var(--ad-white-soft);
    font-size: 0.78rem;
    font-weight: 500;
  }

  .ad-cell-text {
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.88rem;
    font-weight: 500;
    line-height: 1.5;
  }

  .ad-cell-email {
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.84rem;
    font-weight: 500;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .ad-cell-amount {
    color: var(--ad-white);
    font-size: 0.98rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  .ad-muted {
    color: var(--ad-white-soft);
    font-size: 0.8rem;
    font-weight: 500;
  }

  .ad-label {
    color: var(--ad-white-soft);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 0.3rem;
  }

  /* status / action stacks inside table cells */
  .ad-status-stack {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .ad-actions-stack {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 9px;
  }

  /* ── Status badge ── */

  .ad-badge {
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

  .ad-badge-dot {
    flex: 0 0 auto;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
  }

  /* ── Select ── */

  .ad-select {
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
    border: 1px solid var(--ad-line);
    border-radius: 10px;
    min-height: 2.5rem;
    padding: 0.55rem 2rem 0.55rem 0.8rem;
    outline: none;
    transition: border-color 0.25s ease, box-shadow 0.25s ease;
  }

  .ad-select--table { width: var(--ad-sel-w); max-width: 100%; }

  .ad-select--card { width: 100%; }

  .ad-select:hover:not(:disabled) {
    border-color: var(--ad-line-hover);
  }

  .ad-select:focus-visible {
    border-color: var(--ad-red);
    box-shadow: 0 0 0 3px rgba(255, 45, 63, 0.25);
  }

  .ad-select option {
    background: #000000;
    color: #ffffff;
  }

  /* ── Buttons ── */

  .ad-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.5rem;
    font-family: inherit;
    font-size: var(--ad-btn-fs);
    font-weight: 700;
    letter-spacing: 0.02em;
    padding: var(--ad-btn-py) var(--ad-btn-px);
    border-radius: 10px;
    background: transparent;
    white-space: nowrap;
    transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  }

  .ad-btn--cancel {
    color: #ff2d3f;
    border: 1px solid rgba(255, 45, 63, 0.6);
  }

  .ad-btn--cancel:hover:not(:disabled) {
    background: #ff2d3f;
    color: #ffffff;
    border-color: #ff2d3f;
    box-shadow: 0 0 18px rgba(255, 45, 63, 0.4);
  }

  .ad-btn--ghost {
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.4);
  }

  .ad-btn--ghost:hover:not(:disabled) {
    background: #ffffff;
    color: #000000;
    border-color: #ffffff;
  }

  .ad-btn--details {
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.4);
  }

  .ad-btn--details:hover:not(:disabled) {
    background: #ffffff;
    color: #000000;
    border-color: #ffffff;
  }

  .ad-btn:focus-visible,
  .ad-tab:focus-visible {
    outline: 2px solid #ffffff;
    outline-offset: 2px;
  }

  .ad-btn:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  /* ── Glass toasts ── */

  .ad-toast-stack {
    position: fixed;
    top: max(12px, env(safe-area-inset-top));
    left: max(12px, env(safe-area-inset-left));
    right: max(12px, env(safe-area-inset-right));
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: auto;
    pointer-events: none;
  }

  .ad-toast {
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
    animation: ad-toast-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  /* soft specular highlight across the top of the glass */
  .ad-toast::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.16), transparent 42%);
    pointer-events: none;
  }

  .ad-toast--success { --toast-accent: 255, 255, 255; }
  .ad-toast--error   { --toast-accent: 255, 45, 63; border-color: rgba(255, 45, 63, 0.5); }

  @keyframes ad-toast-in {
    from { opacity: 0; transform: translate3d(36px, -6px, 0) scale(0.96); }
    to   { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
  }

  .ad-toast-icon {
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

  .ad-toast--error .ad-toast-icon {
    color: #ff5563;
    background: rgba(255, 45, 63, 0.18);
  }

  .ad-toast-body {
    position: relative;
    flex: 1 1 auto;
    min-width: 0;
    padding-top: 1px;
  }

  .ad-toast-title {
    margin: 0;
    font-size: 0.88rem;
    font-weight: 800;
    letter-spacing: -0.005em;
    color: #ffffff;
  }

  .ad-toast-text {
    margin: 0.2rem 0 0;
    font-size: 0.82rem;
    font-weight: 500;
    line-height: 1.45;
    color: rgba(255, 255, 255, 0.78);
    overflow-wrap: anywhere;
  }

  .ad-toast-close {
    position: relative;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: rgba(255, 255, 255, 0.55);
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
  }

  .ad-toast-close:hover {
    background: rgba(255, 255, 255, 0.14);
    color: #ffffff;
  }

  .ad-toast-close:focus-visible {
    outline: 2px solid #ffffff;
    outline-offset: 1px;
  }

  .ad-toast-progress {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 3px;
    width: 100%;
    background: rgba(var(--toast-accent), 0.85);
    box-shadow: 0 0 10px rgba(var(--toast-accent), 0.6);
    transform-origin: left center;
    animation: ad-toast-timer linear forwards;
  }

  @keyframes ad-toast-timer {
    from { transform: scaleX(1); }
    to   { transform: scaleX(0); }
  }

  /* ── Glass confirm dialog: bottom sheet on phones, centred card from 521px ── */

  .ad-modal-backdrop {
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
    animation: ad-fade 0.25s ease both;
  }

  @keyframes ad-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .ad-modal {
    position: relative;
    overflow: hidden;
    width: 100%;
    max-width: 100%;
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
    animation: ad-sheet-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .ad-modal::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.14), transparent 38%);
    pointer-events: none;
  }

  @keyframes ad-sheet-in {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes ad-modal-in {
    from { opacity: 0; transform: translateY(16px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .ad-modal-icon {
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

  .ad-modal-title {
    position: relative;
    margin: 0;
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #ffffff;
  }

  .ad-modal-text {
    position: relative;
    margin: 0.55rem 0 0;
    font-size: 0.88rem;
    font-weight: 500;
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.75);
  }

  .ad-modal-text strong {
    color: #ffffff;
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .ad-modal-actions {
    position: relative;
    display: flex;
    flex-direction: column-reverse;
    gap: 10px;
    margin-top: 1.35rem;
  }

  .ad-modal-actions .ad-btn {
    flex: 1 1 0;
    min-height: 2.9rem;
    padding: 0.7rem 1rem;
  }

  .ad-btn--glass {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.3);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    cursor: pointer;
  }

  .ad-btn--glass:hover {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.55);
  }

  .ad-btn--danger {
    color: #ffffff;
    background: rgba(255, 45, 63, 0.78);
    border: 1px solid rgba(255, 120, 132, 0.7);
    box-shadow: 0 0 20px rgba(255, 45, 63, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3);
    cursor: pointer;
  }

  .ad-btn--danger:hover {
    background: #ff2d3f;
    box-shadow: 0 0 28px rgba(255, 45, 63, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.35);
  }

  /* ── Empty / loading ── */

  .ad-empty {
    padding: 2.5rem 1.25rem;
    text-align: center;
  }

  .ad-empty-icon {
    font-size: 2.25rem;
    margin-bottom: 0.85rem;
  }

  .ad-empty-title {
    margin: 0;
    color: var(--ad-white);
    font-size: 1.1rem;
    font-weight: 700;
  }

  .ad-empty-text {
    color: var(--ad-white-soft);
    font-size: 0.88rem;
    font-weight: 500;
  }

  .ad-loader {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 2px solid var(--ad-line);
    border-top-color: var(--ad-red);
    animation: ad-spin 0.8s linear infinite;
  }

  @keyframes ad-spin {
    to { transform: rotate(360deg); }
  }

  /* ── Order cards (below 1024px) ── */

  .admin-orders-mobile {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--ad-card-gap);
  }

  .admin-orders-desktop { display: none; }

  /* the cell is the "container": cards respond to their own width */
  .ad-card-cell {
    min-width: 0;
    display: flex;
    container-type: inline-size;
  }

  .ad-card {
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    padding: var(--ad-card-p);
    display: flex;
    flex-direction: column;
    gap: 0.95rem;
  }

  .ad-card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.6rem;
    flex-wrap: wrap;
  }

  .ad-card-id {
    color: var(--ad-white);
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: var(--ad-card-id);
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  /* email + status fields: stacked in narrow cards, side by side in wide ones */
  .ad-card-fields {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.95rem;
    padding-top: 0.95rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .ad-card-field { min-width: 0; }

  .ad-card-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.55rem;
    margin-top: auto;
  }

  .ad-card-actions .ad-btn {
    min-width: 0;
    padding-left: 0.6rem;
    padding-right: 0.6rem;
    white-space: normal;
    text-align: center;
    line-height: 1.2;
  }

  @container (min-width: 25rem) {
    .ad-card-fields--two {
      grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
      gap: 1.1rem;
    }
  }

  @container (max-width: 16.5rem) {
    .ad-card-actions { grid-template-columns: minmax(0, 1fr); }
  }

  /* ── Scrollbar (table overflow safety net) ── */

  .admin-orders-desktop::-webkit-scrollbar {
    height: 6px;
  }

  .admin-orders-desktop::-webkit-scrollbar-thumb {
    background: var(--ad-line-hover);
    border-radius: 6px;
  }

  /* ═══════════ Responsive scale ═══════════ */

  /* < 400px: refresh becomes an icon-only square */
  @media (max-width: 399px) {
    .ad-refresh {
      width: 2.75rem;
      min-height: 2.75rem;
      padding: 0;
    }

    .ad-refresh-label { display: none; }
  }

  /* < 360px: very small phones */
  @media (max-width: 359px) {
    .ad-head { align-items: flex-start; }
    .ad-tab { padding-left: 0.5rem; padding-right: 0.5rem; gap: 0.4rem; }
  }

  /* ≥ 360px: standard phones */
  @media (min-width: 360px) {
    .ad-root {
      --ad-px: 0.75rem;
      --ad-card-p: 1.1rem;
    }
  }

  /* ≥ 480px: large phones / landscape */
  @media (min-width: 480px) {
    .ad-root {
      --ad-px: 1rem;
      --ad-py: 1rem;
      --ad-pb: 4.5rem;
      --ad-over: 0.72rem;
      --ad-sub: 0.9rem;
      --ad-card-p: 1.25rem;
      --ad-card-id: 0.95rem;
      --ad-tab-px: 1.25rem;
      --ad-btn-fs: 0.82rem;
    }

    /* tabs hug their content instead of filling the row */
    .ad-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
    }
  }

  /* ≥ 521px: confirm dialog becomes a centred card */
  @media (min-width: 521px) {
    .ad-modal-backdrop {
      align-items: center;
      padding: 20px;
    }

    .ad-modal {
      max-width: 420px;
      padding: 1.75rem 1.6rem 1.5rem;
      border-radius: 22px;
      animation: ad-modal-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    .ad-modal-icon { width: 52px; height: 52px; }
    .ad-modal-title { font-size: 1.25rem; }
    .ad-modal-text { font-size: 0.9rem; }
    .ad-modal-actions { flex-direction: row; }

    /* toasts dock to the top-right corner */
    .ad-toast-stack {
      left: auto;
      right: 16px;
      top: 16px;
      width: min(380px, calc(100vw - 32px));
    }
  }

  /* ≥ 640px: tablets (portrait) → two columns of cards */
  @media (min-width: 640px) {
    .ad-root {
      --ad-px: 1.5rem;
      --ad-py: 1.25rem;
      --ad-sect: 1.75rem;
      --ad-card-gap: 1rem;
      --ad-card-p: 1.25rem;
      --ad-radius: 16px;
      --ad-tab-fs: 0.86rem;
    }

    .admin-orders-mobile {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .ad-empty { padding: 3.25rem 1.5rem; }
    .ad-empty-icon { font-size: 2.6rem; }
    .ad-empty-title { font-size: 1.2rem; }
  }

  /* ≥ 768px: tablets (landscape) */
  @media (min-width: 768px) {
    .ad-root {
      --ad-px: 2rem;
      --ad-py: 1.75rem;
      --ad-pb: 5rem;
      --ad-card-gap: 1.15rem;
      --ad-card-p: 1.4rem;
      --ad-sub: 0.95rem;
    }

    .ad-toast-stack { top: 20px; right: 20px; width: min(390px, calc(100vw - 40px)); }
  }

  /* ≥ 1024px: laptops → table layout */
  @media (min-width: 1024px) {
    .ad-root {
      --ad-max: 72rem;
      --ad-px: 2.25rem;
      --ad-py: 2rem;
      --ad-cell-px: 1rem;
      --ad-cell-py: 1.05rem;
      --ad-th-fs: 0.7rem;
      --ad-sel-w: 10rem;
    }

    .admin-orders-mobile  { display: none; }
    .admin-orders-desktop { display: block; }
  }

  /* ≥ 1280px: desktops → actions sit side by side, select widens */
  @media (min-width: 1280px) {
    .ad-root {
      --ad-max: 82rem;
      --ad-px: 3rem;
      --ad-py: 2.5rem;
      --ad-cell-px: 1.25rem;
      --ad-cell-py: 1.15rem;
      --ad-th-fs: 0.74rem;
      --ad-sel-w: 10.5rem;
      --ad-btn-px: 1.1rem;
    }

    .ad-th:nth-child(1),
    .ad-td:nth-child(1) { width: 18%; }

    .ad-th:nth-child(2),
    .ad-td:nth-child(2) { width: 30%; }

    .ad-th:nth-child(3),
    .ad-td:nth-child(3) { width: 22%; }

    .ad-th:nth-child(4),
    .ad-td:nth-child(4) { width: 30%; }

    .ad-actions-stack {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
    }
  }

  /* ≥ 1536px: large monitors */
  @media (min-width: 1536px) {
    .ad-root {
      --ad-max: 92rem;
      --ad-px: 3.5rem;
      --ad-cell-px: 1.5rem;
      --ad-cell-py: 1.3rem;
      --ad-btn-fs: 0.88rem;
      --ad-tab-fs: 0.92rem;
      --ad-sel-w: 11.5rem;
    }

    .ad-cell-id { font-size: 0.98rem; }
    .ad-cell-email { font-size: 0.92rem; }
    .ad-badge { font-size: 0.8rem; }
  }

  /* ≥ 1920px: ultra-wide */
  @media (min-width: 1920px) {
    .ad-root {
      --ad-max: 104rem;
    }
  }

  /* ── Short landscape screens (phones turned sideways) ── */

  @media (max-height: 500px) and (orientation: landscape) {
    .ad-modal-backdrop {
      align-items: center;
      padding: 12px;
    }

    .ad-modal {
      max-width: 460px;
      padding: 1rem 1.25rem;
      border-radius: 18px;
    }

    .ad-modal-icon { display: none; }
    .ad-modal-actions { flex-direction: row; margin-top: 1rem; }
    .ad-modal-actions .ad-btn { min-height: 2.6rem; }
  }

  /* ── Reduced motion ── */

  @media (prefers-reduced-motion: reduce) {
    .ad-rise,
    .ad-title-bar,
    .ad-toast,
    .ad-modal,
    .ad-modal-backdrop {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }

    .ad-loader {
      animation-duration: 2s;
    }

    .ad-toast-progress {
      display: none;
    }

    .ad-row,
    .ad-row td:first-child,
    .ad-btn,
    .ad-select,
    .ad-panel,
    .ad-tab {
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
        className="ad-badge"
        style={{
          background: statusStyle.background,
          color: statusStyle.color,
          border: statusStyle.border
        }}
      >
        <span className="ad-badge-dot" />

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
      <div className="ad-status-stack">

        {renderStatusBadge(order.status)}

        <select
          className="ad-select ad-select--table"
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
          <span className="ad-muted">
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
      <div className="ad-actions-stack">

        <button
          type="button"
          className="ad-btn ad-btn--details"
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
          className="ad-btn ad-btn--cancel"
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
        className={`ad-toast ad-toast--${type}`}
        role={isError ? "alert" : "status"}
      >

        <span className="ad-toast-icon" aria-hidden="true">
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

        <div className="ad-toast-body">
          <p className="ad-toast-title">
            {isError ? "Something went wrong" : "Success"}
          </p>
          <p className="ad-toast-text">{message}</p>
        </div>

        <button
          type="button"
          className="ad-toast-close"
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
          className="ad-toast-progress"
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
      <div className="ad-root min-h-screen flex items-center justify-center p-8">

        <style>{THEME_CSS}</style>

        <div className="flex flex-col items-center gap-4 ad-rise">

          <div className="ad-loader" />

          <p className="ad-empty-text">
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
    <div className="ad-root ad-page min-h-screen flex justify-center items-start">

      <style>{THEME_CSS}</style>

      {/* GLASS TOASTS */}

      <div className="ad-toast-stack" aria-live="polite">

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
          className="ad-modal-backdrop"
          onClick={() => setConfirmOrderId(null)}
        >
          <div
            className="ad-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ad-confirm-title"
            aria-describedby="ad-confirm-text"
            onClick={(event) => event.stopPropagation()}
          >

            <span className="ad-modal-icon" aria-hidden="true">
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

            <h3 id="ad-confirm-title" className="ad-modal-title">
              Cancel this order?
            </h3>

            <p id="ad-confirm-text" className="ad-modal-text">
              Are you sure you want to cancel order{" "}
              <strong>#{confirmOrder.orderId || confirmOrder.id}</strong>?
              It will move to the Cancelled tab.
            </p>

            <div className="ad-modal-actions">

              <button
                type="button"
                className="ad-btn ad-btn--glass"
                onClick={() => setConfirmOrderId(null)}
                autoFocus
              >
                Keep order
              </button>

              <button
                type="button"
                className="ad-btn ad-btn--danger"
                onClick={confirmCancelOrder}
              >
                Yes, cancel
              </button>

            </div>

          </div>
        </div>
      )}

      <div className="ad-wrap">

        {/* ───────────────────────────────────────────────────
            HEADER
        ─────────────────────────────────────────────────── */}

        <div className="ad-head ad-rise">

          <div className="ad-head-text">

            <p className="ad-overline">
              Management
            </p>

            <h1 className="ad-title">
              Orders
            </h1>

            <p className="ad-subtitle">
              Manage and track customer orders
            </p>

            <div className="ad-title-bar" />

          </div>

          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="ad-btn ad-btn--ghost ad-refresh"
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

            <span className="ad-refresh-label">
              Refresh
            </span>
          </button>

        </div>


        {/* Success and error messages are shown as glass toasts */}


        {/* ───────────────────────────────────────────────────
            ORDER TABS
        ─────────────────────────────────────────────────── */}

        <div className="ad-tabs ad-rise">

          <button
            type="button"
            className={`ad-tab ${
              activeTab === "orders"
                ? "ad-tab--active"
                : ""
            }`}
            onClick={() => setActiveTab("orders")}
            aria-pressed={activeTab === "orders"}
          >
            Orders

            <span className="ad-tab-count">
              {activeOrders.length}
            </span>
          </button>


          <button
            type="button"
            className={`ad-tab ${
              activeTab === "cancelled"
                ? "ad-tab--active"
                : ""
            }`}
            onClick={() => setActiveTab("cancelled")}
            aria-pressed={activeTab === "cancelled"}
          >
            Cancelled

            <span className="ad-tab-count">
              {cancelledOrders.length}
            </span>
          </button>

        </div>


        {/* ───────────────────────────────────────────────────
            EMPTY STATE
        ─────────────────────────────────────────────────── */}

        {displayedOrders.length === 0 ? (

          <div
            className="ad-panel ad-rise ad-empty"
            style={{
              animationDelay: "0.15s"
            }}
          >

            <div className="ad-empty-icon">
              {activeTab === "cancelled"
                ? "↩"
                : "📦"}
            </div>

            <h2 className="ad-empty-title">
              {activeTab === "cancelled"
                ? "No cancelled orders"
                : "No orders found"}
            </h2>

            <p className="ad-empty-text mt-2">
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

            <div className="admin-orders-mobile">

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
                    className="ad-card-cell"
                  >

                    <div
                      className="ad-panel ad-rise ad-card"
                      style={{
                        animationDelay: `${Math.min(i, 8) * 0.05}s`
                      }}
                    >

                      {/* ORDER ID AND STATUS */}

                      <div className="ad-card-top">

                        <div style={{ minWidth: 0 }}>

                          <div className="ad-card-id">
                            #
                            {order.orderId || order.id}
                          </div>

                          <div className="ad-cell-date">
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
                        className={`ad-card-fields ${
                          activeTab === "orders"
                            ? "ad-card-fields--two"
                            : ""
                        }`}
                      >

                        {/* CUSTOMER EMAIL */}

                        <div className="ad-card-field">

                          <div className="ad-label">
                            Customer Email
                          </div>

                          <div className="ad-cell-email">
                            {order.email || "—"}
                          </div>

                        </div>


                        {/* STATUS UPDATE */}

                        {activeTab === "orders" && (

                          <div className="ad-card-field">

                            <div className="ad-label">
                              Update Status
                            </div>

                            <select
                              className="ad-select ad-select--card"
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
                              <p className="ad-muted mt-2">
                                Updating...
                              </p>
                            )}

                          </div>

                        )}

                      </div>


                      {/* ACTIONS */}

                      <div className="ad-card-actions">

                        <button
                          type="button"
                          className="ad-btn ad-btn--details"
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
                          className="ad-btn ad-btn--cancel"
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
              className="admin-orders-desktop ad-panel ad-rise"
              style={{
                overflowX: "auto",
                animationDelay: "0.15s"
              }}
            >

              <table className="ad-table">

                <thead>

                  <tr className="ad-thead-row">

                    <th className="ad-th">
                      Order
                    </th>

                    <th className="ad-th">
                      Customer Email
                    </th>

                    <th className="ad-th">
                      Status
                    </th>

                    <th className="ad-th">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {displayedOrders.map((order) => {

                    return (

                      <tr
                        key={order.id}
                        className="ad-row"
                      >

                        {/* ORDER ID AND DATE */}

                        <td className="ad-td">

                          <div className="ad-cell-id">
                            #
                            {order.orderId || order.id}
                          </div>

                          <div className="ad-cell-date">
                            {formatDate(
                              order.createdAt ||
                              order.date
                            )}
                          </div>

                        </td>


                        {/* CUSTOMER EMAIL */}

                        <td className="ad-td">

                          <span className="ad-cell-email">
                            {order.email || "—"}
                          </span>

                        </td>


                        {/* STATUS */}

                        <td className="ad-td">

                          {activeTab === "orders"
                            ? renderStatusSelect(order)
                            : renderStatusBadge(order.status)}

                        </td>


                        {/* ACTIONS */}

                        <td className="ad-td">

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