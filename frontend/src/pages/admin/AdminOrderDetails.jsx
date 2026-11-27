import React, {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  useNavigate,
  useParams
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

const ORDER_STATUSES = [
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


const formatDateTime = (dateValue) => {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};


const formatCurrency = (amount) => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return "₹0";
  }

  return `₹${numericAmount.toLocaleString("en-IN")}`;
};


const getCustomerAddress = (address) => {
  if (!address) {
    return [];
  }

  if (typeof address === "string") {
    return [address];
  }

  if (typeof address !== "object") {
    return [];
  }

  return [
    address.firstName,
    address.lastName,
    address.name,
    address.street,
    address.address,
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.zipcode,
    address.postalCode,
    address.country,
    address.phone
  ].filter(Boolean);
};


/* ─────────────────────────────────────────────────────────────
   SHARED STYLES
   MATCHES ADMIN ORDERS PAGE

   Responsive layout map
   ─ < 640px      one column, every panel stacked
   ─ 640–1023px   customer + address side by side, payment + total
                  side by side, progress becomes a horizontal stepper
   ─ ≥ 1024px     two columns: products + payment/total on the left,
                  progress + customer + address in a side column

   Inside the panels, fields / product rows / the progress stepper
   re-arrange based on the panel's own width (container queries).
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
    --ad-title:      clamp(1.9rem, 1.4rem + 2.6vw, 3.4rem);
    --ad-over:       0.68rem;
    --ad-sub:        0.85rem;
    --ad-radius:     14px;
    --ad-btn-fs:     0.8rem;
    --ad-btn-px:     1rem;
    --ad-btn-py:     0.6rem;

    --od-gap:        0.875rem;
    --od-pad:        1.05rem;
    --od-title-mb:   1rem;
    --od-id-fs:      clamp(1.15rem, 0.9rem + 1.6vw, 1.8rem);
    --od-panel-fs:   clamp(1rem, 0.92rem + 0.45vw, 1.25rem);
    --od-value-fs:   0.9rem;
    --od-label-fs:   0.68rem;
    --od-prod-fs:    0.92rem;
    --od-total-fs:   1.4rem;
    --od-img-w:      4rem;
    --od-img-h:      5rem;
    --od-row-gap:    0.85rem;
    --od-row-py:     0.95rem;

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

  /* ── Heading ── */

  .od-head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: var(--ad-sect);
  }

  .od-head-text { min-width: 0; }

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
    overflow-wrap: anywhere;
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

  /* ── Panel ── */

  .ad-panel {
    position: relative;
    min-width: 0;
    container-type: inline-size;
    background: transparent;
    border: 1px solid var(--ad-line);
    border-radius: var(--ad-radius);
    transition: border-color 0.3s ease;
  }

  .ad-panel:hover {
    border-color: var(--ad-line-hover);
  }

  .od-pad { padding: var(--od-pad); }

  .ad-panel-title {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin: 0 0 var(--od-title-mb);
    color: var(--ad-white);
    font-weight: 700;
    letter-spacing: -0.015em;
    font-size: var(--od-panel-fs);
  }

  .ad-panel-title::before {
    content: '';
    flex: 0 0 auto;
    width: 3px;
    height: 1.1em;
    border-radius: 2px;
    background: var(--ad-red);
  }

  .od-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;
    margin-bottom: calc(var(--od-title-mb) * 0.5);
  }

  .od-panel-head .ad-panel-title { margin: 0; }

  /* ── Labels ── */

  .ad-label {
    margin: 0 0 0.35rem;
    color: var(--ad-white-soft);
    font-size: var(--od-label-fs);
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .ad-detail-value {
    margin: 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: var(--od-value-fs);
    font-weight: 600;
    line-height: 1.7;
    overflow-wrap: anywhere;
  }

  .ad-muted {
    margin: 0;
    color: var(--ad-white-soft);
    font-size: 0.8rem;
    font-weight: 500;
  }

  .ad-cell-amount {
    margin: 0;
    color: var(--ad-white);
    font-size: 0.98rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  /* ── Status badge ── */

  .ad-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.3rem 0.8rem;
    border-radius: 999px;
    font-size: 0.76rem;
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

  /* ── Buttons ── */

  .ad-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    min-height: 2.5rem;
    font-family: inherit;
    font-size: var(--ad-btn-fs);
    font-weight: 700;
    letter-spacing: 0.02em;
    padding: var(--ad-btn-py) var(--ad-btn-px);
    border-radius: 10px;
    background: transparent;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background 0.25s ease,
      color 0.25s ease,
      border-color 0.25s ease,
      box-shadow 0.25s ease;
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

  .ad-btn:focus-visible {
    outline: 2px solid #ffffff;
    outline-offset: 2px;
  }

  .ad-btn:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  /* ── Alerts ── */

  .ad-alert {
    margin-bottom: var(--od-gap);
    padding: 0.8rem 1rem;
    border-radius: 12px;
    font-size: 0.88rem;
    font-weight: 600;
    line-height: 1.5;
    overflow-wrap: anywhere;
    animation: ad-rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .ad-alert--success {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .ad-alert--error {
    color: #ffffff;
    background: rgba(255, 45, 63, 0.16);
    border: 1px solid rgba(255, 45, 63, 0.6);
  }

  /* ── Page layout ── */

  .od-section { margin-bottom: var(--od-gap); }

  .od-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--od-gap);
  }

  /* below 1024px the two columns dissolve into one flowing grid */
  .od-aside,
  .od-main { display: contents; }

  .od-pair {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
    gap: var(--od-gap);
    min-width: 0;
  }

  /* ── Order summary ── */

  .od-summary {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem 1.5rem;
  }

  .od-summary-main {
    flex: 1 1 14rem;
    min-width: 0;
  }

  .od-order-id {
    margin: 0;
    font-size: var(--od-id-fs);
    font-weight: 800;
    letter-spacing: -0.025em;
    line-height: 1.15;
    overflow-wrap: anywhere;
  }

  .od-summary-side {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    max-width: 100%;
  }

  /* ── Detail fields ── */

  .od-fields {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 1.1rem;
  }

  .od-field { min-width: 0; }

  .od-lines {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  /* ── Product image ── */

  .ad-product-image {
    grid-area: img;
    width: var(--od-img-w);
    height: var(--od-img-h);
    object-fit: cover;
    border-radius: 10px;
    border: 1px solid rgba(255, 45, 63, 0.25);
    background: rgba(255, 255, 255, 0.04);
    flex-shrink: 0;
  }

  /* ── Product row ── */

  .od-product-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-areas:
      "img info"
      "img price";
    column-gap: var(--od-row-gap);
    row-gap: 0.55rem;
    align-items: start;
    padding: var(--od-row-py) 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .od-product-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .od-product-info {
    grid-area: info;
    min-width: 0;
  }

  .od-product-name {
    margin: 0;
    color: #ffffff;
    font-size: var(--od-prod-fs);
    font-weight: 700;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .od-product-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem 1rem;
    margin-top: 0.4rem;
  }

  .od-product-price {
    grid-area: price;
    align-self: end;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.15rem 0.6rem;
  }

  @container (min-width: 32rem) {
    .od-product-row {
      grid-template-columns: auto minmax(0, 1fr) auto;
      grid-template-areas: "img info price";
      align-items: center;
    }

    .od-product-price {
      align-self: center;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
      text-align: right;
    }
  }

  /* customer fields go two-up when the panel is wide enough */
  @container (min-width: 24rem) {
    .od-fields { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .od-field--wide { grid-column: 1 / -1; }
  }

  /* ── Payment + total ── */

  .od-pay-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem 1rem;
  }

  .od-total-row {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.25rem 1rem;
  }

  .od-total-divider {
    margin-top: 1.1rem;
    padding-top: 1.1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }

  .od-total-label {
    color: #ffffff;
    font-size: 0.95rem;
    font-weight: 700;
  }

  .od-total-amount {
    color: #ffffff;
    font-size: var(--od-total-fs);
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }

  /* ── Timeline: vertical by default, horizontal stepper in wide panels ── */

  .ad-timeline {
    display: flex;
    flex-direction: column;
  }

  .ad-timeline-item {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    min-height: 48px;
  }

  .ad-timeline-marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 16px;
    flex-shrink: 0;
  }

  .ad-timeline-dot {
    flex: 0 0 auto;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.25);
    background: #000000;
  }

  .ad-timeline-dot--active {
    border-color: var(--ad-red);
    background: var(--ad-red);
    box-shadow: 0 0 12px rgba(255, 45, 63, 0.5);
  }

  .ad-timeline-line {
    width: 1px;
    height: 30px;
    background: rgba(255, 255, 255, 0.15);
  }

  .ad-timeline-line--active {
    background: var(--ad-red);
  }

  .ad-timeline-body {
    padding-bottom: 15px;
    min-width: 0;
  }

  .ad-timeline-label {
    margin: 0;
    font-size: 0.88rem;
    line-height: 1.3;
  }

  .od-cancelled {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 0.85rem;
  }

  @container (min-width: 34rem) {
    .ad-timeline {
      flex-direction: row;
      gap: 0.25rem;
    }

    .ad-timeline-item {
      flex: 1 1 0;
      min-width: 0;
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
      min-height: 0;
    }

    .ad-timeline-marker {
      flex-direction: row;
      width: 100%;
      height: 14px;
    }

    .ad-timeline-line {
      flex: 1 1 auto;
      width: auto;
      min-width: 0;
      height: 2px;
      margin: 0 0.5rem;
    }

    .ad-timeline-body { padding-bottom: 0; }
    .ad-timeline-label { font-size: 0.84rem; }
  }

  /* ── Footer ── */

  .od-foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.85rem 1rem;
    margin-top: calc(var(--od-gap) * 1.5);
  }

  /* ── Empty / loading ── */

  .od-empty {
    padding: 2.75rem 1.25rem;
    text-align: center;
  }

  .od-empty-icon {
    font-size: 2.6rem;
    margin-bottom: 0.85rem;
  }

  .od-empty-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .ad-empty-title {
    margin: 0;
    color: var(--ad-white);
    font-size: 1.2rem;
    font-weight: 700;
  }

  .ad-empty-text {
    margin: 0;
    color: var(--ad-white-soft);
    font-size: 0.92rem;
    font-weight: 500;
    overflow-wrap: anywhere;
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

  /* ═══════════ Responsive scale ═══════════ */

  /* < 480px: buttons that sit alone in a row fill the row */
  @media (max-width: 479px) {
    .od-summary-side { width: 100%; }
    .od-summary-side .ad-btn { width: 100%; }
    .od-foot .ad-btn { width: 100%; }
    .od-head .ad-btn { width: 100%; }
    .od-empty-actions { flex-direction: column; }
    .od-empty-actions .ad-btn { width: 100%; }
    .od-foot { flex-direction: column-reverse; align-items: stretch; }
    .od-foot .ad-muted { text-align: center; }
  }

  /* ≥ 360px: standard phones */
  @media (min-width: 360px) {
    .ad-root {
      --ad-px: 0.75rem;
      --od-pad: 1.15rem;
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
      --od-gap: 1rem;
      --od-pad: 1.25rem;
      --od-title-mb: 1.15rem;
      --od-value-fs: 0.92rem;
      --od-prod-fs: 0.95rem;
      --od-img-w: 4.5rem;
      --od-img-h: 5.6rem;
      --od-row-gap: 1rem;
      --ad-btn-fs: 0.82rem;
    }
  }

  /* ≥ 640px: tablets (portrait) */
  @media (min-width: 640px) {
    .ad-root {
      --ad-px: 1.5rem;
      --ad-py: 1.25rem;
      --ad-sect: 1.75rem;
      --ad-radius: 16px;
      --od-gap: 1.15rem;
      --od-pad: 1.4rem;
      --od-title-mb: 1.25rem;
      --od-label-fs: 0.7rem;
    }

    .od-layout { grid-template-columns: repeat(2, minmax(0, 1fr)); }

    /* progress + products take the full row; the pair block too */
    .od-span { grid-column: 1 / -1; }

    .od-summary-side {
      align-items: flex-end;
      text-align: right;
    }

    .od-empty { padding: 3.5rem 1.5rem; }
  }

  /* ≥ 768px: tablets (landscape) */
  @media (min-width: 768px) {
    .ad-root {
      --ad-px: 2rem;
      --ad-py: 1.75rem;
      --ad-pb: 5rem;
      --ad-sub: 0.95rem;
      --od-gap: 1.25rem;
      --od-pad: 1.5rem;
      --od-img-w: 5.25rem;
      --od-img-h: 6.5rem;
    }
  }

  /* ≥ 1024px: laptops → main column + side column */
  @media (min-width: 1024px) {
    .ad-root {
      --ad-max: 72rem;
      --ad-px: 2.25rem;
      --ad-py: 2rem;
      --od-gap: 1.25rem;
      --od-total-fs: 1.5rem;
    }

    .od-layout {
      grid-template-columns: minmax(0, 1fr) minmax(19rem, 23rem);
      align-items: start;
    }

    .od-main,
    .od-aside {
      display: flex;
      flex-direction: column;
      gap: var(--od-gap);
      min-width: 0;
    }

    .od-main  { grid-column: 1; grid-row: 1; }
    .od-aside { grid-column: 2; grid-row: 1; }

    .od-span { grid-column: auto; }
  }

  /* ≥ 1280px: desktops */
  @media (min-width: 1280px) {
    .ad-root {
      --ad-max: 82rem;
      --ad-px: 3rem;
      --ad-py: 2.5rem;
      --od-gap: 1.4rem;
      --od-pad: 1.65rem;
      --od-value-fs: 0.95rem;
      --od-prod-fs: 1rem;
      --od-img-w: 6rem;
      --od-img-h: 7.25rem;
      --od-row-py: 1.15rem;
    }

    .od-layout { grid-template-columns: minmax(0, 1fr) minmax(21rem, 25rem); }
  }

  /* ≥ 1536px: large monitors */
  @media (min-width: 1536px) {
    .ad-root {
      --ad-max: 92rem;
      --ad-px: 3.5rem;
      --od-gap: 1.5rem;
      --od-pad: 1.85rem;
      --od-value-fs: 1rem;
      --od-label-fs: 0.74rem;
      --od-prod-fs: 1.05rem;
      --od-total-fs: 1.7rem;
      --od-img-w: 6.5rem;
      --od-img-h: 8rem;
      --ad-btn-fs: 0.88rem;
    }

    .od-layout { grid-template-columns: minmax(0, 1fr) minmax(24rem, 28rem); }
    .ad-badge { font-size: 0.82rem; }
  }

  /* ≥ 1920px: ultra-wide */
  @media (min-width: 1920px) {
    .ad-root { --ad-max: 104rem; }
  }

  /* ── Reduced motion ── */

  @media (prefers-reduced-motion: reduce) {
    .ad-rise,
    .ad-title-bar,
    .ad-alert {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }

    .ad-loader {
      animation-duration: 2s;
    }

    .ad-panel,
    .ad-btn {
      transition: none !important;
    }
  }
`;


/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */

const AdminOrderDetails = () => {

  const {
    id
  } = useParams();

  const navigate = useNavigate();


  /* ─────────────────────────────────────────────────────────
     STATE
  ───────────────────────────────────────────────────────── */

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  const [cancelling, setCancelling] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");


  /* ─────────────────────────────────────────────────────────
     FETCH ORDER DETAILS
  ───────────────────────────────────────────────────────── */

  const fetchOrder = useCallback(async () => {

    try {

      setLoading(true);

      setError("");

      const res = await axios.get(
        `${API_URL}/admin/orders/${encodeURIComponent(id)}`,
        {
          withCredentials: true
        }
      );

      const fetchedOrder =
        res.data?.order;

      if (!fetchedOrder) {
        throw new Error(
          "Order details could not be found."
        );
      }

      setOrder({
        ...fetchedOrder,

        id:
          fetchedOrder.id ??
          fetchedOrder._id,

        total:
          fetchedOrder.total ??
          fetchedOrder.amount ??
          0
      });

    } catch (err) {

      console.error(
        "Failed to load order details:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load order details. Please try again."
      );

    } finally {

      setLoading(false);

    }

  }, [id]);


  /* ─────────────────────────────────────────────────────────
     INITIAL LOAD
  ───────────────────────────────────────────────────────── */

  useEffect(() => {

    fetchOrder();

  }, [fetchOrder]);


  /* ─────────────────────────────────────────────────────────
     CLEAR SUCCESS MESSAGE
  ───────────────────────────────────────────────────────── */

  useEffect(() => {

    if (!successMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timer);

  }, [successMessage]);


  /* ─────────────────────────────────────────────────────────
     CANCEL ORDER
  ───────────────────────────────────────────────────────── */

  const handleCancelOrder = async () => {

    if (!order?.id) {
      return;
    }

    if (
      !CANCELLABLE_STATUSES.includes(
        order.status
      )
    ) {
      setError(
        "This order can no longer be cancelled."
      );

      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order? The ordered product quantities will be returned to inventory."
    );

    if (!confirmed) {
      return;
    }

    try {

      setCancelling(true);

      setError("");

      setSuccessMessage("");

      const res = await axios.delete(
        `${API_URL}/admin/orders/${encodeURIComponent(
          order.id
        )}`,
        {
          withCredentials: true
        }
      );

      if (
        res.data?.success === false
      ) {
        throw new Error(
          res.data?.message ||
          "Failed to cancel order."
        );
      }

      setOrder((previousOrder) => ({
        ...previousOrder,
        status: "Cancelled"
      }));

      setSuccessMessage(
        "Order cancelled successfully. Inventory has been restored."
      );

    } catch (err) {

      console.error(
        "Failed to cancel order:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to cancel order."
      );

    } finally {

      setCancelling(false);

    }

  };


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
            Loading order details...
          </p>

        </div>

      </div>

    );

  }


  /* ─────────────────────────────────────────────────────────
     ERROR / NOT FOUND STATE
  ───────────────────────────────────────────────────────── */

  if (!order) {

    return (

      <div className="ad-root ad-page min-h-screen flex justify-center items-start">

        <style>{THEME_CSS}</style>

        <div className="ad-wrap">

          <div className="od-head ad-rise">

            <div className="od-head-text">

              <p className="ad-overline">
                Management
              </p>

              <h1 className="ad-title">
                Order Details
              </h1>

              <div className="ad-title-bar" />

            </div>

          </div>

          <div className="ad-panel ad-rise od-empty">

            <div className="od-empty-icon">
              📦
            </div>

            <h2 className="ad-empty-title">
              Order not found
            </h2>

            <p className="ad-empty-text mt-2">
              {error || "The requested order could not be found."}
            </p>

            <div className="od-empty-actions">

              <button
                type="button"
                className="ad-btn ad-btn--ghost"
                onClick={() => navigate("/admin/orders")}
              >
                Back to Orders
              </button>

              <button
                type="button"
                className="ad-btn ad-btn--cancel"
                onClick={fetchOrder}
              >
                Try Again
              </button>

            </div>

          </div>

        </div>

      </div>

    );

  }


  /* ─────────────────────────────────────────────────────────
     DERIVED ORDER INFORMATION
  ───────────────────────────────────────────────────────── */

  const statusStyle =
    getStatusStyle(order.status);

  const canCancel =
    CANCELLABLE_STATUSES.includes(
      order.status
    );

  const customerAddress =
    getCustomerAddress(
      order.address
    );

  const orderItems =
    Array.isArray(order.items)
      ? order.items
      : [];

  const currentStatusIndex =
    ORDER_STATUSES.indexOf(
      order.status
    );

  const isCancelled =
    order.status === "Cancelled";


  /* ─────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────── */

  return (

    <div className="ad-root ad-page min-h-screen flex justify-center items-start">

      <style>{THEME_CSS}</style>

      <div className="ad-wrap">

        {/* ───────────────────────────────────────────────────
            HEADER
        ─────────────────────────────────────────────────── */}

        <div className="od-head ad-rise">

          <div className="od-head-text">

            <p className="ad-overline">
              Management
            </p>

            <h1 className="ad-title">
              Order Details
            </h1>

            <p className="ad-subtitle">
              Complete information about this customer order
            </p>

            <div className="ad-title-bar" />

          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="ad-btn ad-btn--ghost"
          >
            ← Back to Orders
          </button>

        </div>


        {/* ───────────────────────────────────────────────────
            SUCCESS MESSAGE
        ─────────────────────────────────────────────────── */}

        {successMessage && (

          <div className="ad-alert ad-alert--success" role="status">
            {successMessage}
          </div>

        )}


        {/* ───────────────────────────────────────────────────
            ERROR MESSAGE
        ─────────────────────────────────────────────────── */}

        {error && (

          <div className="ad-alert ad-alert--error" role="alert">
            {error}
          </div>

        )}


        {/* ───────────────────────────────────────────────────
            ORDER SUMMARY
        ─────────────────────────────────────────────────── */}

        <div
          className="ad-panel ad-rise od-pad od-section"
          style={{
            animationDelay: "0.1s"
          }}
        >

          <div className="od-summary">

            <div className="od-summary-main">

              <p className="ad-label">
                Order ID
              </p>

              <h2 className="od-order-id">
                #{order.orderId || order.id}
              </h2>

              <p className="ad-muted mt-2">
                Placed on {formatDateTime(
                  order.createdAt || order.date
                )}
              </p>

            </div>

            <div className="od-summary-side">

              <span
                className="ad-badge"
                style={{
                  background: statusStyle.background,
                  color: statusStyle.color,
                  border: statusStyle.border
                }}
              >

                <span className="ad-badge-dot" />

                {order.status || "Order Placed"}

              </span>

              {canCancel && (

                <button
                  type="button"
                  className="ad-btn ad-btn--cancel"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling
                    ? "Cancelling..."
                    : "Cancel Order"}
                </button>

              )}

              {isCancelled && (

                <span className="ad-muted">
                  This order has been cancelled.
                </span>

              )}

              {!canCancel && !isCancelled && (

                <span className="ad-muted">
                  Cancellation is unavailable after shipping.
                </span>

              )}

            </div>

          </div>

        </div>


        {/* ───────────────────────────────────────────────────
            MAIN LAYOUT
            (one flowing column on phones, two columns on laptops)
        ─────────────────────────────────────────────────── */}

        <div className="od-layout">

          {/* ─────────────── SIDE COLUMN ─────────────── */}

          <div className="od-aside">

            {/* ORDER STATUS TIMELINE */}

            <div
              className="ad-panel ad-rise od-pad od-span"
              style={{
                animationDelay: "0.15s"
              }}
            >

              <h2 className="ad-panel-title">
                Order Progress
              </h2>

              {isCancelled ? (

                <div className="od-cancelled">

                  <span
                    className="ad-badge"
                    style={{
                      background: statusStyle.background,
                      color: statusStyle.color,
                      border: statusStyle.border,
                      padding: "0.55rem 1rem"
                    }}
                  >

                    <span className="ad-badge-dot" />

                    Cancelled

                  </span>

                  <span className="ad-muted">
                    This order will not proceed further.
                  </span>

                </div>

              ) : (

                <div className="ad-timeline">

                  {ORDER_STATUSES.map(
                    (status, index) => {

                      const isActive =
                        currentStatusIndex >= index;

                      const isLast =
                        index === ORDER_STATUSES.length - 1;

                      return (

                        <div
                          key={status}
                          className="ad-timeline-item"
                        >

                          <div className="ad-timeline-marker">

                            <div
                              className={`ad-timeline-dot ${
                                isActive
                                  ? "ad-timeline-dot--active"
                                  : ""
                              }`}
                            />

                            {!isLast && (

                              <div
                                className={`ad-timeline-line ${
                                  currentStatusIndex > index
                                    ? "ad-timeline-line--active"
                                    : ""
                                }`}
                              />

                            )}

                          </div>

                          <div className="ad-timeline-body">

                            <p
                              className="ad-timeline-label"
                              style={{
                                color: isActive
                                  ? "#ffffff"
                                  : "rgba(255,255,255,0.4)",

                                fontWeight: isActive
                                  ? 700
                                  : 500
                              }}
                            >
                              {status}
                            </p>

                            {order.status === status && (

                              <p
                                className="ad-muted"
                                style={{
                                  marginTop: "3px"
                                }}
                              >
                                Current status
                              </p>

                            )}

                          </div>

                        </div>

                      );

                    }
                  )}

                </div>

              )}

            </div>


            {/* CUSTOMER INFORMATION */}

            <div
              className="ad-panel ad-rise od-pad"
              style={{
                animationDelay: "0.2s"
              }}
            >

              <h2 className="ad-panel-title">
                Customer Information
              </h2>

              <div className="od-fields">

                <div className="od-field od-field--wide">

                  <p className="ad-label">
                    Customer Email
                  </p>

                  <p className="ad-detail-value">
                    {order.email || "No email provided"}
                  </p>

                </div>

                <div className="od-field">

                  <p className="ad-label">
                    Phone Number
                  </p>

                  <p className="ad-detail-value">
                    {order.phone || "No phone provided"}
                  </p>

                </div>

                <div className="od-field">

                  <p className="ad-label">
                    Customer ID
                  </p>

                  <p className="ad-detail-value">
                    {order.userId || "—"}
                  </p>

                </div>

              </div>

            </div>


            {/* DELIVERY ADDRESS */}

            <div
              className="ad-panel ad-rise od-pad"
              style={{
                animationDelay: "0.22s"
              }}
            >

              <h2 className="ad-panel-title">
                Delivery Address
              </h2>

              {customerAddress.length > 0 ? (

                <div className="od-lines">

                  {customerAddress.map(
                    (line, index) => (

                      <p
                        key={`${line}-${index}`}
                        className="ad-detail-value"
                      >
                        {line}
                      </p>

                    )
                  )}

                </div>

              ) : (

                <p className="ad-muted">
                  Delivery address is not available.
                </p>

              )}

            </div>

          </div>


          {/* ─────────────── MAIN COLUMN ─────────────── */}

          <div className="od-main">

            {/* ORDERED PRODUCTS */}

            <div
              className="ad-panel ad-rise od-pad od-span"
              style={{
                animationDelay: "0.25s"
              }}
            >

              <div className="od-panel-head">

                <h2 className="ad-panel-title">
                  Ordered Products
                </h2>

                <span className="ad-muted">
                  {orderItems.length} product
                  {orderItems.length !== 1 ? "s" : ""}
                </span>

              </div>

              {orderItems.length > 0 ? (

                <div>

                  {orderItems.map(
                    (item, index) => (

                      <div
                        key={`${item.productId || item.name}-${index}`}
                        className="od-product-row"
                      >

                        {/* PRODUCT IMAGE */}

                        {item.image ? (

                          <img
                            src={item.image}
                            alt={item.name || "Product"}
                            className="ad-product-image"
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.visibility = "hidden";
                            }}
                          />

                        ) : (

                          <div
                            className="ad-product-image flex items-center justify-center"
                            style={{
                              color: "rgba(255,255,255,0.4)",
                              fontSize: "1.6rem"
                            }}
                          >
                            📦
                          </div>

                        )}


                        {/* PRODUCT INFORMATION */}

                        <div className="od-product-info">

                          <h3 className="od-product-name">
                            {item.name || "Product"}
                          </h3>

                          <div className="od-product-meta">

                            <span className="ad-muted">
                              Size: {item.size || "—"}
                            </span>

                            <span className="ad-muted">
                              Quantity: {item.quantity || 1}
                            </span>

                          </div>

                          <p className="ad-muted mt-2">
                            Product ID: {item.productId || "—"}
                          </p>

                        </div>


                        {/* PRODUCT PRICE */}

                        <div className="od-product-price">

                          <p className="ad-cell-amount">
                            {formatCurrency(
                              Number(item.price || 0) *
                              Number(item.quantity || 1)
                            )}
                          </p>

                          <p className="ad-muted">
                            {formatCurrency(item.price)} each
                          </p>

                        </div>

                      </div>

                    )

                  )}

                </div>

              ) : (

                <p className="ad-muted">
                  No product information available.
                </p>

              )}

            </div>


            {/* PAYMENT + ORDER TOTAL */}

            <div
              className="od-pair od-span ad-rise"
              style={{
                animationDelay: "0.3s"
              }}
            >

              {/* PAYMENT INFORMATION */}

              <div className="ad-panel od-pad">

                <h2 className="ad-panel-title">
                  Payment Information
                </h2>

                <div className="od-pay-row">

                  <div style={{ minWidth: 0 }}>

                    <p className="ad-label">
                      Payment Method
                    </p>

                    <p className="ad-detail-value">
                      {order.paymentMethod || "—"}
                    </p>

                  </div>

                  <span
                    className="ad-badge"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      color: "#ffffff",
                      border: "1px solid rgba(255,255,255,0.22)"
                    }}
                  >
                    {order.paymentMethod || "Payment"}
                  </span>

                </div>

              </div>


              {/* ORDER TOTAL */}

              <div className="ad-panel od-pad">

                <h2 className="ad-panel-title">
                  Order Summary
                </h2>

                <div className="od-total-row">

                  <span className="ad-muted">
                    Total Items
                  </span>

                  <span className="ad-detail-value">
                    {orderItems.reduce(
                      (total, item) =>
                        total + Number(item.quantity || 0),
                      0
                    )}
                  </span>

                </div>

                <div className="od-total-divider">

                  <div className="od-total-row">

                    <span className="od-total-label">
                      Total Amount
                    </span>

                    <span className="od-total-amount">
                      {formatCurrency(order.total)}
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ───────────────────────────────────────────────────
            ORDER FOOTER
        ─────────────────────────────────────────────────── */}

        <div
          className="od-foot ad-rise"
          style={{
            animationDelay: "0.35s"
          }}
        >

          <p className="ad-muted">
            Last updated: {formatDateTime(order.updatedAt)}
          </p>

          <button
            type="button"
            className="ad-btn ad-btn--ghost"
            onClick={() => navigate("/admin/orders")}
          >
            ← Back to Orders
          </button>

        </div>

      </div>

    </div>

  );

};


export default AdminOrderDetails;