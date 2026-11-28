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
    address.postCode,
    address.country,
    address.phone
  ].filter(Boolean);
};


/* ─────────────────────────────────────────────────────────────
   SHARED STYLES
   MATCHES THE OTHER ADMIN PAGES

   Responsive layout map
   ─ < 640px      one column, panels stacked in reading order:
                  progress → products → payment → total → customer → address
   ─ 640–1023px   progress, products, payment + total span the full row;
                  customer + address sit side by side
   ─ ≥ 1024px     two columns: products + payment/total on the left,
                  progress + customer + address in a side column

   Inside the panels, fields / product rows / the progress stepper
   re-arrange based on the panel's own width (container queries).

   --od-max and --od-px match the navbar so edges line up.
───────────────────────────────────────────────────────────── */

const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

  .od-root {
    --od-red:        #ff2d3f;
    --od-line:       rgba(255, 45, 63, 0.22);
    --od-line-hover: rgba(255, 45, 63, 0.6);
    --od-white:      #ffffff;
    --od-white-soft: rgba(255, 255, 255, 0.7);

    /* ── responsive scale (overridden per breakpoint below) ── */
    --od-max:        1400px;
    --od-px:         0.875rem;
    --od-py:         1rem;
    --od-sect:       1.25rem;
    --od-title:      1.9rem;
    --od-over:       0.68rem;
    --od-sub:        0.85rem;
    --od-radius:     14px;
    --od-btn-fs:     0.8rem;
    --od-btn-px:     1rem;
    --od-btn-py:     0.6rem;

    --od-gap:        0.75rem;
    --od-pad:        0.95rem;
    --od-title-mb:   1rem;
    --od-id-fs:      1.3rem;
    --od-panel-fs:   1rem;
    --od-value-fs:   0.9rem;
    --od-label-fs:   0.68rem;
    --od-prod-fs:    0.92rem;
    --od-total-fs:   1.4rem;
    --od-img-w:      4rem;
    --od-img-h:      5rem;
    --od-row-gap:    0.85rem;
    --od-row-py:     0.95rem;

    position: relative;
    overflow-x: hidden;
    width: 100%;
    min-height: 100vh;
    background: #000000;
    color: var(--od-white);
    font-family: 'Manrope', 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    padding:
      var(--od-py)
      max(var(--od-px), env(safe-area-inset-right))
      calc(var(--od-py) + 2rem + env(safe-area-inset-bottom))
      max(var(--od-px), env(safe-area-inset-left));
  }

  .od-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .od-wrap {
    position: relative;
    width: 100%;
    min-width: 0;
    max-width: var(--od-max);
    margin: 0 auto;
  }

  .od-mt { margin-top: 0.5rem; }

  /* ── Entrance ── */

  .od-rise {
    opacity: 0;
    animation: od-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  @keyframes od-rise {
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
    margin-bottom: var(--od-sect);
  }

  .od-head-text { min-width: 0; }

  .od-overline {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    color: var(--od-red);
    font-size: var(--od-over);
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    margin: 0 0 0.4rem;
  }

  .od-overline::before {
    content: '';
    width: 1.75rem;
    height: 2px;
    background: var(--od-red);
  }

  .od-title {
    margin: 0;
    color: var(--od-white);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.05;
    font-size: var(--od-title);
    overflow-wrap: anywhere;
  }

  .od-subtitle {
    margin: 0.65rem 0 0;
    color: var(--od-white-soft);
    font-size: var(--od-sub);
    font-weight: 500;
  }

  .od-title-bar {
    margin-top: 0.85rem;
    height: 2px;
    width: 5rem;
    border-radius: 2px;
    background: var(--od-red);
    transform-origin: left center;
    animation: od-draw 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
  }

  @keyframes od-draw {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  /* ── Panel ── */

  .od-panel {
    position: relative;
    min-width: 0;
    container-type: inline-size;
    background: transparent;
    border: 1px solid var(--od-line);
    border-radius: var(--od-radius);
    transition: border-color 0.3s ease;
  }

  .od-panel:hover {
    border-color: var(--od-line-hover);
  }

  .od-pad { padding: var(--od-pad); }

  .od-panel-title {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin: 0 0 var(--od-title-mb);
    color: var(--od-white);
    font-weight: 700;
    letter-spacing: -0.015em;
    line-height: 1.2;
    font-size: var(--od-panel-fs);
  }

  .od-panel-title::before {
    content: '';
    flex: 0 0 auto;
    width: 3px;
    height: 1.1em;
    border-radius: 2px;
    background: var(--od-red);
  }

  .od-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;
    margin-bottom: calc(var(--od-title-mb) * 0.5);
  }

  .od-panel-head .od-panel-title { margin: 0; }

  /* ── Labels ── */

  .od-label {
    margin: 0 0 0.35rem;
    color: var(--od-white-soft);
    font-size: var(--od-label-fs);
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .od-detail-value {
    margin: 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: var(--od-value-fs);
    font-weight: 600;
    line-height: 1.7;
    overflow-wrap: anywhere;
  }

  .od-muted {
    margin: 0;
    color: var(--od-white-soft);
    font-size: 0.8rem;
    font-weight: 500;
  }

  .od-cell-amount {
    margin: 0;
    color: var(--od-white);
    font-size: 0.98rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  /* ── Status badge ── */

  .od-badge {
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

  .od-badge-dot {
    flex: 0 0 auto;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
  }

  /* ── Buttons ── */

  .od-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    min-height: 2.5rem;
    font-family: inherit;
    font-size: var(--od-btn-fs);
    font-weight: 700;
    letter-spacing: 0.02em;
    padding: var(--od-btn-py) var(--od-btn-px);
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

  .od-btn--cancel {
    color: #ff2d3f;
    border: 1px solid rgba(255, 45, 63, 0.6);
  }

  .od-btn--cancel:hover:not(:disabled) {
    background: #ff2d3f;
    color: #ffffff;
    border-color: #ff2d3f;
    box-shadow: 0 0 18px rgba(255, 45, 63, 0.4);
  }

  .od-btn--ghost {
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.4);
  }

  .od-btn--ghost:hover:not(:disabled) {
    background: #ffffff;
    color: #000000;
    border-color: #ffffff;
  }

  .od-btn:focus-visible {
    outline: 2px solid #ffffff;
    outline-offset: 2px;
  }

  .od-btn:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  /* ── Alerts ── */

  .od-alert {
    margin-bottom: var(--od-gap);
    padding: 0.8rem 1rem;
    border-radius: 12px;
    font-size: 0.88rem;
    font-weight: 600;
    line-height: 1.5;
    overflow-wrap: anywhere;
    animation: od-rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .od-alert--success {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .od-alert--error {
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

  /* below 1024px the two columns dissolve into one flowing grid,
     ordered so the products come right after the progress */
  .od-aside,
  .od-main { display: contents; }

  .od-progress { order: 1; }
  .od-products { order: 2; }
  .od-pair     { order: 3; }
  .od-customer { order: 4; }
  .od-address  { order: 5; }

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

  .od-product-image {
    grid-area: img;
    width: var(--od-img-w);
    height: var(--od-img-h);
    object-fit: cover;
    border-radius: 10px;
    border: 1px solid rgba(255, 45, 63, 0.25);
    background: rgba(255, 255, 255, 0.04);
    flex-shrink: 0;
  }

  .od-product-image--ph {
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.4);
    font-size: 1.6rem;
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

  .od-product-row:first-child { padding-top: 0.25rem; }

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

  /* wide products panel: price moves to its own right-hand column */
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

  .od-timeline {
    display: flex;
    flex-direction: column;
  }

  .od-timeline-item {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    min-height: 48px;
  }

  .od-timeline-marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 16px;
    flex-shrink: 0;
  }

  .od-timeline-dot {
    flex: 0 0 auto;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.25);
    background: #000000;
  }

  .od-timeline-dot--active {
    border-color: var(--od-red);
    background: var(--od-red);
    box-shadow: 0 0 12px rgba(255, 45, 63, 0.5);
  }

  .od-timeline-line {
    width: 1px;
    height: 30px;
    background: rgba(255, 255, 255, 0.15);
  }

  .od-timeline-line--active {
    background: var(--od-red);
  }

  .od-timeline-body {
    padding-bottom: 15px;
    min-width: 0;
  }

  .od-timeline-label {
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
    .od-timeline {
      flex-direction: row;
      gap: 0.25rem;
    }

    .od-timeline-item {
      flex: 1 1 0;
      min-width: 0;
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
      min-height: 0;
    }

    .od-timeline-marker {
      flex-direction: row;
      width: 100%;
      height: 14px;
    }

    .od-timeline-line {
      flex: 1 1 auto;
      width: auto;
      min-width: 0;
      height: 2px;
      margin: 0 0.5rem;
    }

    .od-timeline-body { padding-bottom: 0; }
    .od-timeline-label { font-size: 0.84rem; }
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

  .od-empty-title {
    margin: 0;
    color: var(--od-white);
    font-size: 1.2rem;
    font-weight: 700;
  }

  .od-empty-text {
    margin: 0;
    color: var(--od-white-soft);
    font-size: 0.92rem;
    font-weight: 500;
    overflow-wrap: anywhere;
  }

  .od-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .od-loader {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 2px solid var(--od-line);
    border-top-color: var(--od-red);
    animation: od-spin 0.8s linear infinite;
  }

  @keyframes od-spin {
    to { transform: rotate(360deg); }
  }

  /* ═══════════ Responsive scale ═══════════ */

  /* < 480px: buttons that sit alone in a row fill the row */
  @media (max-width: 479px) {
    .od-summary-side { width: 100%; }
    .od-summary-side .od-btn { width: 100%; }
    .od-head .od-btn { width: 100%; }
    .od-empty-actions { flex-direction: column; }
    .od-empty-actions .od-btn { width: 100%; }
    .od-foot { flex-direction: column-reverse; align-items: stretch; }
    .od-foot .od-btn { width: 100%; }
    .od-foot .od-muted { text-align: center; }
  }

  /* ≥ 375px: iPhone-size phones */
  @media (min-width: 375px) {
    .od-root {
      --od-px: 1rem;
      --od-py: 1.1rem;
      --od-title: 2.05rem;
      --od-pad: 1.1rem;
      --od-id-fs: 1.4rem;
    }
  }

  /* ≥ 480px: large phones / landscape */
  @media (min-width: 480px) {
    .od-root {
      --od-py: 1.25rem;
      --od-sect: 1.4rem;
      --od-over: 0.72rem;
      --od-sub: 0.9rem;
      --od-gap: 0.875rem;
      --od-pad: 1.25rem;
      --od-title-mb: 1.15rem;
      --od-panel-fs: 1.05rem;
      --od-id-fs: 1.5rem;
      --od-value-fs: 0.92rem;
      --od-prod-fs: 0.95rem;
      --od-img-w: 4.5rem;
      --od-img-h: 5.6rem;
      --od-row-gap: 1rem;
      --od-btn-fs: 0.82rem;
    }
  }

  /* ≥ 640px: tablets (portrait) */
  @media (min-width: 640px) {
    .od-root {
      --od-px: 1.5rem;
      --od-py: 1.5rem;
      --od-sect: 1.6rem;
      --od-over: 0.74rem;
      --od-title: 2.4rem;
      --od-radius: 16px;
      --od-gap: 1rem;
      --od-pad: 1.4rem;
      --od-title-mb: 1.25rem;
      --od-panel-fs: 1.1rem;
      --od-id-fs: 1.6rem;
      --od-label-fs: 0.7rem;
    }

    .od-layout { grid-template-columns: repeat(2, minmax(0, 1fr)); }

    /* progress, products and the payment/total pair take the full row;
       customer + address share one row */
    .od-progress,
    .od-products,
    .od-pair { grid-column: 1 / -1; }

    .od-summary-side {
      align-items: flex-end;
      text-align: right;
    }

    .od-empty { padding: 3.5rem 1.5rem; }
  }

  /* ≥ 768px: tablets (landscape) */
  @media (min-width: 768px) {
    .od-root {
      --od-py: 1.75rem;
      --od-sect: 1.75rem;
      --od-title: 2.55rem;
      --od-sub: 0.95rem;
      --od-gap: 1.15rem;
      --od-pad: 1.5rem;
      --od-id-fs: 1.7rem;
      --od-img-w: 5.25rem;
      --od-img-h: 6.5rem;
    }
  }

  /* ≥ 1024px: laptops → main column + side column */
  @media (min-width: 1024px) {
    .od-root {
      --od-px: 2rem;
      --od-py: 2rem;
      --od-sect: 2rem;
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

    .od-progress,
    .od-products,
    .od-pair { grid-column: auto; }
  }

  /* ≥ 1280px: desktops */
  @media (min-width: 1280px) {
    .od-root {
      --od-py: 2.25rem;
      --od-title: 2.8rem;
      --od-gap: 1.4rem;
      --od-pad: 1.65rem;
      --od-panel-fs: 1.15rem;
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
    .od-root {
      --od-max: 1680px;
      --od-px: 2.5rem;
      --od-py: 2.5rem;
      --od-sect: 2.5rem;
      --od-over: 0.8rem;
      --od-title: 3rem;
      --od-gap: 1.5rem;
      --od-pad: 1.85rem;
      --od-panel-fs: 1.25rem;
      --od-id-fs: 1.9rem;
      --od-value-fs: 1rem;
      --od-label-fs: 0.74rem;
      --od-prod-fs: 1.05rem;
      --od-total-fs: 1.7rem;
      --od-img-w: 6.5rem;
      --od-img-h: 8rem;
      --od-btn-fs: 0.88rem;
    }

    .od-layout { grid-template-columns: minmax(0, 1fr) minmax(24rem, 28rem); }
    .od-badge { font-size: 0.82rem; }
  }

  /* ≥ 1920px: ultra-wide */
  @media (min-width: 1920px) {
    .od-root { --od-max: 1840px; }
  }

  /* ── Reduced motion ── */

  @media (prefers-reduced-motion: reduce) {
    .od-rise,
    .od-title-bar,
    .od-alert {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }

    .od-loader {
      animation-duration: 2s;
    }

    .od-panel,
    .od-btn {
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

      <div className="od-root od-center">

        <style>{THEME_CSS}</style>

        <div className="od-loading od-rise">

          <div className="od-loader" />

          <p className="od-empty-text">
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

      <div className="od-root">

        <style>{THEME_CSS}</style>

        <div className="od-wrap">

          <div className="od-head od-rise">

            <div className="od-head-text">

              <p className="od-overline">
                Management
              </p>

              <h1 className="od-title">
                Order Details
              </h1>

              <div className="od-title-bar" />

            </div>

          </div>

          <div className="od-panel od-rise od-empty">

            <div className="od-empty-icon">
              📦
            </div>

            <h2 className="od-empty-title">
              Order not found
            </h2>

            <p className="od-empty-text od-mt">
              {error || "The requested order could not be found."}
            </p>

            <div className="od-empty-actions">

              <button
                type="button"
                className="od-btn od-btn--ghost"
                onClick={() => navigate("/admin/orders")}
              >
                Back to Orders
              </button>

              <button
                type="button"
                className="od-btn od-btn--cancel"
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

    <div className="od-root">

      <style>{THEME_CSS}</style>

      <div className="od-wrap">

        {/* ───────────────────────────────────────────────────
            HEADER
        ─────────────────────────────────────────────────── */}

        <div className="od-head od-rise">

          <div className="od-head-text">

            <p className="od-overline">
              Management
            </p>

            <h1 className="od-title">
              Order Details
            </h1>

            <p className="od-subtitle">
              Complete information about this customer order
            </p>

            <div className="od-title-bar" />

          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="od-btn od-btn--ghost"
          >
            ← Back to Orders
          </button>

        </div>


        {/* ───────────────────────────────────────────────────
            SUCCESS MESSAGE
        ─────────────────────────────────────────────────── */}

        {successMessage && (

          <div className="od-alert od-alert--success" role="status">
            {successMessage}
          </div>

        )}


        {/* ───────────────────────────────────────────────────
            ERROR MESSAGE
        ─────────────────────────────────────────────────── */}

        {error && (

          <div className="od-alert od-alert--error" role="alert">
            {error}
          </div>

        )}


        {/* ───────────────────────────────────────────────────
            ORDER SUMMARY
        ─────────────────────────────────────────────────── */}

        <div
          className="od-panel od-rise od-pad od-section"
          style={{
            animationDelay: "0.1s"
          }}
        >

          <div className="od-summary">

            <div className="od-summary-main">

              <p className="od-label">
                Order ID
              </p>

              <h2 className="od-order-id">
                #{order.orderId || order.id}
              </h2>

              <p className="od-muted od-mt">
                Placed on {formatDateTime(
                  order.createdAt || order.date
                )}
              </p>

            </div>

            <div className="od-summary-side">

              <span
                className="od-badge"
                style={{
                  background: statusStyle.background,
                  color: statusStyle.color,
                  border: statusStyle.border
                }}
              >

                <span className="od-badge-dot" />

                {order.status || "Order Placed"}

              </span>

              {canCancel && (

                <button
                  type="button"
                  className="od-btn od-btn--cancel"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling
                    ? "Cancelling..."
                    : "Cancel Order"}
                </button>

              )}

              {isCancelled && (

                <span className="od-muted">
                  This order has been cancelled.
                </span>

              )}

              {!canCancel && !isCancelled && (

                <span className="od-muted">
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
              className="od-panel od-rise od-pad od-progress"
              style={{
                animationDelay: "0.15s"
              }}
            >

              <h2 className="od-panel-title">
                Order Progress
              </h2>

              {isCancelled ? (

                <div className="od-cancelled">

                  <span
                    className="od-badge"
                    style={{
                      background: statusStyle.background,
                      color: statusStyle.color,
                      border: statusStyle.border,
                      padding: "0.55rem 1rem"
                    }}
                  >

                    <span className="od-badge-dot" />

                    Cancelled

                  </span>

                  <span className="od-muted">
                    This order will not proceed further.
                  </span>

                </div>

              ) : (

                <div className="od-timeline">

                  {ORDER_STATUSES.map(
                    (status, index) => {

                      const isActive =
                        currentStatusIndex >= index;

                      const isLast =
                        index === ORDER_STATUSES.length - 1;

                      return (

                        <div
                          key={status}
                          className="od-timeline-item"
                        >

                          <div className="od-timeline-marker">

                            <div
                              className={`od-timeline-dot ${
                                isActive
                                  ? "od-timeline-dot--active"
                                  : ""
                              }`}
                            />

                            {!isLast && (

                              <div
                                className={`od-timeline-line ${
                                  currentStatusIndex > index
                                    ? "od-timeline-line--active"
                                    : ""
                                }`}
                              />

                            )}

                          </div>

                          <div className="od-timeline-body">

                            <p
                              className="od-timeline-label"
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
                                className="od-muted"
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
              className="od-panel od-rise od-pad od-customer"
              style={{
                animationDelay: "0.2s"
              }}
            >

              <h2 className="od-panel-title">
                Customer Information
              </h2>

              <div className="od-fields">

                <div className="od-field od-field--wide">

                  <p className="od-label">
                    Customer Email
                  </p>

                  <p className="od-detail-value">
                    {order.email || "No email provided"}
                  </p>

                </div>

                <div className="od-field">

                  <p className="od-label">
                    Phone Number
                  </p>

                  <p className="od-detail-value">
                    {order.phone || order.address?.phone || "No phone provided"}
                  </p>

                </div>

                <div className="od-field">

                  <p className="od-label">
                    Customer ID
                  </p>

                  <p className="od-detail-value">
                    {order.userId || "—"}
                  </p>

                </div>

              </div>

            </div>


            {/* DELIVERY ADDRESS */}

            <div
              className="od-panel od-rise od-pad od-address"
              style={{
                animationDelay: "0.22s"
              }}
            >

              <h2 className="od-panel-title">
                Delivery Address
              </h2>

              {customerAddress.length > 0 ? (

                <div className="od-lines">

                  {customerAddress.map(
                    (line, index) => (

                      <p
                        key={`${line}-${index}`}
                        className="od-detail-value"
                      >
                        {line}
                      </p>

                    )
                  )}

                </div>

              ) : (

                <p className="od-muted">
                  Delivery address is not available.
                </p>

              )}

            </div>

          </div>


          {/* ─────────────── MAIN COLUMN ─────────────── */}

          <div className="od-main">

            {/* ORDERED PRODUCTS */}

            <div
              className="od-panel od-rise od-pad od-products"
              style={{
                animationDelay: "0.25s"
              }}
            >

              <div className="od-panel-head">

                <h2 className="od-panel-title">
                  Ordered Products
                </h2>

                <span className="od-muted">
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
                            className="od-product-image"
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.visibility = "hidden";
                            }}
                          />

                        ) : (

                          <div className="od-product-image od-product-image--ph">
                            📦
                          </div>

                        )}


                        {/* PRODUCT INFORMATION */}

                        <div className="od-product-info">

                          <h3 className="od-product-name">
                            {item.name || "Product"}
                          </h3>

                          <div className="od-product-meta">

                            <span className="od-muted">
                              Size: {item.size || "—"}
                            </span>

                            <span className="od-muted">
                              Quantity: {item.quantity || 1}
                            </span>

                          </div>

                          <p className="od-muted od-mt">
                            Product ID: {item.productId || "—"}
                          </p>

                        </div>


                        {/* PRODUCT PRICE */}

                        <div className="od-product-price">

                          <p className="od-cell-amount">
                            {formatCurrency(
                              Number(item.price || 0) *
                              Number(item.quantity || 1)
                            )}
                          </p>

                          <p className="od-muted">
                            {formatCurrency(item.price)} each
                          </p>

                        </div>

                      </div>

                    )

                  )}

                </div>

              ) : (

                <p className="od-muted">
                  No product information available.
                </p>

              )}

            </div>


            {/* PAYMENT + ORDER TOTAL */}

            <div
              className="od-pair od-rise"
              style={{
                animationDelay: "0.3s"
              }}
            >

              {/* PAYMENT INFORMATION */}

              <div className="od-panel od-pad">

                <h2 className="od-panel-title">
                  Payment Information
                </h2>

                <div className="od-pay-row">

                  <div style={{ minWidth: 0 }}>

                    <p className="od-label">
                      Payment Method
                    </p>

                    <p className="od-detail-value">
                      {order.paymentMethod || "—"}
                    </p>

                  </div>

                  <span
                    className="od-badge"
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

              <div className="od-panel od-pad">

                <h2 className="od-panel-title">
                  Order Summary
                </h2>

                <div className="od-total-row">

                  <span className="od-muted">
                    Total Items
                  </span>

                  <span className="od-detail-value">
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
          className="od-foot od-rise"
          style={{
            animationDelay: "0.35s"
          }}
        >

          <p className="od-muted">
            Last updated: {formatDateTime(order.updatedAt)}
          </p>

          <button
            type="button"
            className="od-btn od-btn--ghost"
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