import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ShopContext } from "../../context/ShopContext";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import API_URL from "../../config/api";

/* Chart colours: Last Week = white, This Week = red */
const COLORS = ["#ffffff", "#ff2d3f"];

const AdminDashboard = () => {

  const { products } = useContext(ShopContext);

  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  /* ─────────────────────────────────────────────────────────
     FETCH ORDERS
  ───────────────────────────────────────────────────────── */

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/admin/orders`,
        {
          withCredentials: true
        }
      );

      const rawOrders = Array.isArray(
        res.data?.orders
      )
        ? res.data.orders
        : [];

      const normalizedOrders =
        rawOrders.map((order) => ({
          ...order,

          id:
            order.id ??
            order._id ??
            order.orderId,

          total:
            order.total ??
            order.amount ??
            0
        }));

      setOrders(normalizedOrders);

    } catch (err) {
      console.error(
        "Failed to load admin orders:",
        err
      );

      setOrders([]);

    }
  };

  /* ─────────────────────────────────────────────────────────
     FETCH USERS
  ───────────────────────────────────────────────────────── */

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/admin/users`,
        {
          withCredentials: true
        }
      );

      const rawUsers = Array.isArray(
        res.data?.users
      )
        ? res.data.users
        : [];

      const normalizedUsers =
        rawUsers.map((user) => ({
          ...user,

          id:
            user.id ??
            user._id
        }));

      setUsers(normalizedUsers);

    } catch (err) {
      console.error(
        "Failed to load admin users:",
        err
      );

      setUsers([]);

    }
  };

  /* ─────────────────────────────────────────────────────────
     INITIAL LOAD
  ───────────────────────────────────────────────────────── */

  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, []);

  /* ─────────────────────────────────────────────────────────
     ACTIVE ORDERS
  ───────────────────────────────────────────────────────── */

  /*
    Cancelled orders remain stored in the database
    and accessible from the Cancelled tab.

    However, they must not affect dashboard statistics,
    weekly comparisons, or recent orders.
  */

  const activeOrders =
    orders.filter(
      (order) =>
        order.status !== "Cancelled"
    );

  /* ─────────────────────────────────────────────────────────
     GET ORDER DATE
  ───────────────────────────────────────────────────────── */

  const getOrderDate = (order) => {

    /*
      createdAt is generated automatically by
      Mongoose and is the most reliable date.

      date is kept as a fallback for compatibility
      with the previous JSON Server structure.
    */

    const rawDate =
      order.createdAt ??
      order.date;

    if (!rawDate) {
      return null;
    }

    const parsedDate =
      new Date(rawDate);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return null;
    }

    return parsedDate;
  };

  /* ─────────────────────────────────────────────────────────
     TOTALS
  ───────────────────────────────────────────────────────── */

  const totalSales =
    activeOrders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.total ??
          order.amount ??
          0
        ),
      0
    );

  const totalOrders =
    activeOrders.length;

  const totalProducts =
    products.length;

  const totalCustomers =
    users.filter(
      (user) =>
        user.role !== "admin"
    ).length;

  /* ─────────────────────────────────────────────────────────
     WEEK CALCULATION
  ───────────────────────────────────────────────────────── */

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const day =
    today.getDay();

  const diffToMonday =
    (day === 0 ? -6 : 1) - day;

  const thisWeekStart =
    new Date(today);

  thisWeekStart.setDate(
    today.getDate() +
    diffToMonday
  );

  const lastWeekStart =
    new Date(
      thisWeekStart
    );

  lastWeekStart.setDate(
    thisWeekStart.getDate() - 7
  );

  const lastWeekEnd =
    new Date(
      thisWeekStart
    );

  /* ─────────────────────────────────────────────────────────
     LAST WEEK / THIS WEEK ORDERS
  ───────────────────────────────────────────────────────── */

  const lastWeekOrderList =
    activeOrders.filter((order) => {

      const date =
        getOrderDate(order);

      if (!date) {
        return false;
      }

      return (
        date >=
          lastWeekStart &&
        date <
          lastWeekEnd
      );
    });

  const thisWeekOrderList =
    activeOrders.filter((order) => {

      const date =
        getOrderDate(order);

      if (!date) {
        return false;
      }

      return (
        date >=
        thisWeekStart
      );
    });

  const lastWeekSales =
    lastWeekOrderList.reduce(
      (sum, order) =>
        sum +
        Number(
          order.total ??
          order.amount ??
          0
        ),
      0
    );

  const thisWeekSales =
    thisWeekOrderList.reduce(
      (sum, order) =>
        sum +
        Number(
          order.total ??
          order.amount ??
          0
        ),
      0
    );

  const lastWeekOrders =
    lastWeekOrderList.length;

  const thisWeekOrders =
    thisWeekOrderList.length;

  /* ─────────────────────────────────────────────────────────
     CHART DATA
  ───────────────────────────────────────────────────────── */

  /*
    Recharts Pie does not draw anything if every value
    is zero.

    We therefore give the chart a tiny visual fallback
    when both weeks have zero values.

    The actual displayed values are still shown in
    the labels/tooltips.
  */

  const salesChart = [
    {
      name: "Last Week",
      value:
        lastWeekSales > 0
          ? lastWeekSales
          : 0
    },
    {
      name: "This Week",
      value:
        thisWeekSales > 0
          ? thisWeekSales
          : 0
    }
  ];

  const ordersChart = [
    {
      name: "Last Week",
      value:
        lastWeekOrders > 0
          ? lastWeekOrders
          : 0
    },
    {
      name: "This Week",
      value:
        thisWeekOrders > 0
          ? thisWeekOrders
          : 0
    }
  ];

  /*
    Fallback data used ONLY when both values are zero.
    This guarantees that the Recharts pie is visible.
  */

  const salesChartData =
    lastWeekSales === 0 &&
    thisWeekSales === 0
      ? [
          {
            name: "No Sales Yet",
            value: 1
          }
        ]
      : salesChart;

  const ordersChartData =
    lastWeekOrders === 0 &&
    thisWeekOrders === 0
      ? [
          {
            name: "No Orders Yet",
            value: 1
          }
        ]
      : ordersChart;

  /* ─────────────────────────────────────────────────────────
     RECENT ORDERS
  ───────────────────────────────────────────────────────── */

  const recentOrders =
    [...activeOrders]
      .sort((a, b) => {

        const dateA =
          getOrderDate(a);

        const dateB =
          getOrderDate(b);

        if (!dateA && !dateB) {
          return 0;
        }

        if (!dateA) {
          return 1;
        }

        if (!dateB) {
          return -1;
        }

        return (
          dateB.getTime() -
          dateA.getTime()
        );
      })
      .slice(0, 2);

  /* ─────────────────────────────────────────────────────────
     STAT CARDS
  ───────────────────────────────────────────────────────── */

  const statCards = [
    {
      label: "Total Sales",
      value: `₹${totalSales.toLocaleString()}`,
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line
            x1="12"
            y1="1"
            x2="12"
            y2="23"
          />

          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      accent: "#ff2d3f",
    },

    {
      label: "Total Orders",
      value: totalOrders,
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />

          <line
            x1="3"
            y1="6"
            x2="21"
            y2="6"
          />

          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
      accent: "#ff2d3f",
    },

    {
      label: "Total Products",
      value: totalProducts,
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect
            x="2"
            y="3"
            width="20"
            height="14"
            rx="2"
          />

          <path d="M8 21h8M12 17v4" />
        </svg>
      ),
      accent: "#ff2d3f",
    },

    {
      label: "Total Customers",
      value: totalCustomers,
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />

          <circle
            cx="9"
            cy="7"
            r="4"
          />

          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />

          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      accent: "#ff2d3f",
    },
  ];

  /* ─────────────────────────────────────────────────────────
     TOOLTIP
  ───────────────────────────────────────────────────────── */

  const customTooltipStyle = {
    backgroundColor: "#000000",
    border: "1px solid #ff2d3f",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "13px",
  };

  /* ─────────────────────────────────────────────────────────
     STATUS CLASS (styling only)
  ───────────────────────────────────────────────────────── */

  const statusClass =
    order_status =>
      order_status === "Delivered"
        ? "ad-badge ad-badge--delivered"
        : order_status === "Cancelled"
        ? "ad-badge ad-badge--cancelled"
        : "ad-badge ad-badge--pending";

  /* ─────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────── */

  return (
    <div className="ad-root">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        .ad-root {
          --ad-red:        #ff2d3f;
          --ad-line:       rgba(255, 45, 63, 0.22);
          --ad-line-hover: rgba(255, 45, 63, 0.6);
          --ad-white:      #ffffff;
          --ad-white-soft: rgba(255, 255, 255, 0.7);

          /* responsive scale (overridden per breakpoint below).
             --ad-max and --ad-px match the navbar so edges line up. */
          --ad-max:       1400px;
          --ad-px:        0.875rem;
          --ad-py:        1rem;
          --ad-gap:       0.75rem;
          --ad-sec:       1.25rem;
          --ad-pad:       0.9rem;
          --ad-radius:    14px;
          --ad-icon:      2.25rem;
          --ad-icon-svg:  1rem;
          --ad-over:      0.68rem;
          --ad-title:     1.9rem;
          --ad-label:     0.8rem;
          --ad-value:     1.45rem;
          --ad-ptitle:    1rem;
          --ad-chart-h:   230px;
          --ad-legend:    0.78rem;
          --ad-pie-label: 0.82rem;
          --ad-thead:     0.68rem;
          --ad-cell:      0.85rem;
          --ad-cell-big:  0.95rem;
          --ad-badge:     0.7rem;
          --ad-pill:      0.7rem;
          --ad-rowpx:     0.25rem;
          --ad-rowpy:     0.85rem;

          position: relative;
          overflow-x: hidden;
          min-height: 100vh;
          background: #000000;
          color: var(--ad-white);
          font-family: 'Manrope', 'Inter', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          padding:
            var(--ad-py)
            max(var(--ad-px), env(safe-area-inset-right))
            calc(var(--ad-py) + env(safe-area-inset-bottom))
            max(var(--ad-px), env(safe-area-inset-left));
        }

        .ad-inner {
          position: relative;
          width: 100%;
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
        .ad-head {
          position: relative;
          margin-bottom: var(--ad-sec);
        }

        .ad-overline {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          color: var(--ad-red);
          font-size: var(--ad-over);
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          margin-bottom: 0.4rem;
        }

        .ad-overline::before {
          content: '';
          width: 1.75rem;
          height: 2px;
          background: var(--ad-red);
        }

        .ad-title {
          color: var(--ad-white);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
          font-size: var(--ad-title);
        }

        .ad-title-bar {
          margin-top: 0.85rem;
          height: 2px;
          width: 5rem;
          border-radius: 2px;
          background: var(--ad-red);
          transform-origin: left center;
          animation: ad-draw 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
        }

        @keyframes ad-draw {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        /* ── Stat cards grid ── */
        .ad-stats {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: var(--ad-gap);
          margin-bottom: var(--ad-sec);
        }

        .ad-stat {
          position: relative;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: calc(var(--ad-pad) * 0.8);
          padding: var(--ad-pad);
          background: transparent;
          border: 1px solid var(--ad-line);
          border-radius: var(--ad-radius);
          transition: border-color 0.3s ease, transform 0.3s ease;
        }

        .ad-stat:hover {
          transform: translateY(-2px);
          border-color: var(--ad-line-hover);
        }

        .ad-stat-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .ad-stat-label {
          min-width: 0;
          padding-top: 0.15rem;
          color: var(--ad-white-soft);
          font-size: var(--ad-label);
          font-weight: 600;
          line-height: 1.25;
          letter-spacing: 0.01em;
        }

        .ad-stat-value {
          min-width: 0;
          color: var(--ad-white);
          font-weight: 800;
          letter-spacing: -0.03em;
          font-variant-numeric: tabular-nums;
          font-size: var(--ad-value);
          line-height: 1.1;
          overflow-wrap: anywhere;
        }

        .ad-icon {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--ad-icon);
          height: var(--ad-icon);
          border-radius: 10px;
          color: var(--accent);
          background: rgba(255, 45, 63, 0.1);
          border: 1px solid var(--ad-line);
          transition: background 0.3s ease, color 0.3s ease;
        }

        .ad-icon svg {
          width: var(--ad-icon-svg);
          height: var(--ad-icon-svg);
        }

        .ad-stat:hover .ad-icon {
          background: var(--accent);
          color: #ffffff;
        }

        .ad-stat-bar {
          height: 2px;
          width: 3rem;
          border-radius: 2px;
          background: var(--accent);
          transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .ad-stat:hover .ad-stat-bar { width: 100%; }

        /* ── Charts grid ── */
        .ad-charts {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: var(--ad-gap);
          margin-bottom: var(--ad-sec);
        }

        /* ── Panels (charts + orders) ── */
        .ad-panel {
          position: relative;
          min-width: 0;
          padding: var(--ad-pad);
          background: transparent;
          border: 1px solid var(--ad-line);
          border-radius: var(--ad-radius);
          transition: border-color 0.3s ease;
        }

        .ad-panel:hover {
          border-color: var(--ad-line-hover);
        }

        .ad-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem 0.75rem;
          margin-bottom: calc(var(--ad-pad) * 0.9);
        }

        .ad-panel-title {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          min-width: 0;
          color: var(--ad-white);
          font-weight: 700;
          letter-spacing: -0.015em;
          line-height: 1.2;
          font-size: var(--ad-ptitle);
        }

        .ad-panel-title::before {
          content: '';
          flex: 0 0 auto;
          width: 3px;
          height: 1.1em;
          border-radius: 2px;
          background: var(--ad-red);
        }

        .ad-chart-box {
          width: 100%;
          height: var(--ad-chart-h);
        }

        /* ── Recharts text → white ── */
        .ad-root .recharts-pie-label-text {
          fill: #ffffff !important;
          font-size: var(--ad-pie-label);
          font-weight: 700;
        }

        .ad-root .recharts-legend-item-text {
          color: #ffffff !important;
          font-size: var(--ad-legend);
          font-weight: 600;
        }

        .ad-root .recharts-sector {
          outline: none;
          transition: opacity 0.2s ease;
        }

        .ad-root .recharts-sector:hover {
          opacity: 0.85;
        }

        .ad-root .recharts-wrapper,
        .ad-root .recharts-surface {
          outline: none;
        }

        /* ── Latest pill ── */
        .ad-pill {
          flex: 0 0 auto;
          padding: 0.25rem 0.7rem;
          border-radius: 999px;
          color: #ffffff;
          background: var(--ad-red);
          font-size: var(--ad-pill);
          font-weight: 700;
          letter-spacing: 0.03em;
          white-space: nowrap;
        }

        /* ── Orders list ──
           Phone: each order is a 2 × 2 card
                  [ ID        status ]
                  [ amount     date  ]
           ≥ 640px: classic 4 column table */
        .ad-thead {
          display: none;
          color: var(--ad-white-soft);
          border-bottom: 1px solid var(--ad-line);
          font-size: var(--ad-thead);
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .ad-thead,
        .ad-row {
          grid-template-columns: minmax(0, 1fr) auto;
          grid-template-areas:
            "id     status"
            "amount date";
          column-gap: 1rem;
          padding-left: var(--ad-rowpx);
          padding-right: var(--ad-rowpx);
        }

        .ad-list {
          display: flex;
          flex-direction: column;
        }

        .ad-row {
          position: relative;
          display: grid;
          align-items: center;
          row-gap: 0.4rem;
          padding-top: var(--ad-rowpy);
          padding-bottom: var(--ad-rowpy);
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

        .ad-c-id     { grid-area: id; }
        .ad-c-amount { grid-area: amount; }
        .ad-c-date   { grid-area: date; justify-self: end; }
        .ad-c-status { grid-area: status; justify-self: end; }

        .ad-c-id,
        .ad-c-amount,
        .ad-c-date {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ad-cell-id {
          color: var(--ad-white);
          font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: var(--ad-cell);
          font-weight: 600;
        }

        .ad-cell-amount {
          color: var(--ad-white);
          font-size: var(--ad-cell-big);
          font-weight: 800;
          font-variant-numeric: tabular-nums;
        }

        .ad-cell-date {
          color: var(--ad-white-soft);
          font-size: var(--ad-cell);
          font-weight: 500;
        }

        .ad-empty {
          padding: 2rem 0.5rem;
          text-align: center;
          color: var(--ad-white-soft);
          font-size: var(--ad-cell-big);
          font-weight: 500;
        }

        /* ── Status badges ── */
        .ad-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.28rem 0.7rem;
          border-radius: 999px;
          font-size: var(--ad-badge);
          font-weight: 700;
          letter-spacing: 0.03em;
          white-space: nowrap;
        }

        .ad-badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .ad-badge--delivered {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .ad-badge--pending {
          color: #ff9aa4;
          background: rgba(255, 154, 164, 0.08);
          border: 1px solid rgba(255, 154, 164, 0.3);
        }

        .ad-badge--cancelled {
          color: #ffffff;
          background: rgba(255, 45, 63, 0.22);
          border: 1px solid rgba(255, 45, 63, 0.6);
        }

        /* ── Responsive scale ── */

        /* ≥ 375px: large phones. Stat cards go 2 across. */
        @media (min-width: 375px) {
          .ad-root {
            --ad-px:       1rem;
            --ad-py:       1.1rem;
            --ad-pad:      1rem;
            --ad-title:    2.05rem;
            --ad-value:    1.6rem;
            --ad-chart-h:  250px;
          }

          .ad-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        /* ≥ 480px: phones in landscape / small tablets */
        @media (min-width: 480px) {
          .ad-root {
            --ad-py:        1.25rem;
            --ad-gap:       0.875rem;
            --ad-sec:       1.4rem;
            --ad-pad:       1.1rem;
            --ad-icon:      2.4rem;
            --ad-icon-svg:  1.05rem;
            --ad-label:     0.86rem;
            --ad-value:     1.7rem;
            --ad-ptitle:    1.05rem;
            --ad-chart-h:   270px;
            --ad-legend:    0.82rem;
            --ad-pie-label: 0.88rem;
          }
        }

        /* ≥ 640px: tablets (portrait). Orders become a table. */
        @media (min-width: 640px) {
          .ad-root {
            --ad-px:        1.5rem;
            --ad-py:        1.5rem;
            --ad-gap:       1rem;
            --ad-sec:       1.6rem;
            --ad-pad:       1.25rem;
            --ad-icon:      2.5rem;
            --ad-icon-svg:  1.1rem;
            --ad-over:      0.74rem;
            --ad-title:     2.4rem;
            --ad-value:     1.85rem;
            --ad-ptitle:    1.1rem;
            --ad-chart-h:   290px;
            --ad-thead:     0.72rem;
            --ad-cell:      0.9rem;
            --ad-cell-big:  0.98rem;
            --ad-badge:     0.74rem;
            --ad-pill:      0.76rem;
            --ad-rowpx:     1rem;
            --ad-rowpy:     1rem;
          }

          .ad-thead,
          .ad-row {
            grid-template-columns:
              minmax(0, 1.25fr)
              minmax(0, 1fr)
              minmax(0, 1.1fr)
              minmax(0, 1fr);
            grid-template-areas: "id amount date status";
            column-gap: 1rem;
          }

          .ad-thead { display: grid; padding-top: 0.75rem; padding-bottom: 0.75rem; }
          .ad-row   { row-gap: 0; }

          .ad-c-date,
          .ad-c-status { justify-self: start; }
        }

        /* ≥ 768px: charts sit side by side */
        @media (min-width: 768px) {
          .ad-root {
            --ad-py:       1.75rem;
            --ad-sec:       1.75rem;
            --ad-title:     2.55rem;
            --ad-chart-h:   270px;
            --ad-legend:    0.8rem;
            --ad-pie-label: 0.85rem;
          }

          .ad-charts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        /* ≥ 1024px: laptops. Stat cards go 4 across. */
        @media (min-width: 1024px) {
          .ad-root {
            --ad-px:        2rem;
            --ad-py:        2rem;
            --ad-gap:       1.25rem;
            --ad-sec:       2rem;
            --ad-pad:       1.4rem;
            --ad-radius:    16px;
            --ad-icon:      2.6rem;
            --ad-label:     0.88rem;
            --ad-value:     1.75rem;
            --ad-ptitle:    1.15rem;
            --ad-chart-h:   300px;
            --ad-legend:    0.85rem;
            --ad-pie-label: 0.92rem;
            --ad-rowpx:     1.1rem;
          }

          .ad-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }

        /* ≥ 1280px: desktops */
        @media (min-width: 1280px) {
          .ad-root {
            --ad-py:        2.25rem;
            --ad-pad:       1.6rem;
            --ad-icon:      2.75rem;
            --ad-icon-svg:  1.2rem;
            --ad-title:     2.8rem;
            --ad-value:     2rem;
            --ad-ptitle:    1.2rem;
            --ad-chart-h:   320px;
            --ad-thead:     0.74rem;
            --ad-cell:      0.95rem;
            --ad-cell-big:  1.02rem;
            --ad-badge:     0.76rem;
            --ad-rowpy:     1.1rem;
          }
        }

        /* ≥ 1536px: large monitors */
        @media (min-width: 1536px) {
          .ad-root {
            --ad-max:       1680px;
            --ad-px:        2.5rem;
            --ad-py:        2.5rem;
            --ad-gap:       1.5rem;
            --ad-sec:       2.5rem;
            --ad-pad:       1.85rem;
            --ad-icon:      3rem;
            --ad-icon-svg:  1.3rem;
            --ad-over:      0.8rem;
            --ad-title:     3rem;
            --ad-label:     0.95rem;
            --ad-value:     2.3rem;
            --ad-ptitle:    1.3rem;
            --ad-chart-h:   360px;
            --ad-legend:    0.92rem;
            --ad-pie-label: 1rem;
            --ad-cell:      1rem;
            --ad-cell-big:  1.08rem;
            --ad-badge:     0.8rem;
            --ad-pill:      0.82rem;
          }
        }

        /* ≥ 1920px: ultra-wide */
        @media (min-width: 1920px) {
          .ad-root {
            --ad-max:       1840px;
            --ad-value:     2.5rem;
            --ad-chart-h:   400px;
          }
        }

        /* ── Touch devices: no sticky hover lift ── */
        @media (hover: none) {
          .ad-stat:hover { transform: none; }
          .ad-stat:hover .ad-stat-bar { width: 3rem; }
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .ad-rise,
          .ad-title-bar {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }

          .ad-stat,
          .ad-icon,
          .ad-stat-bar,
          .ad-row,
          .ad-row::before {
            transition: none !important;
          }
        }
      `}</style>

      <div className="ad-inner">

        {/* PAGE HEADING */}

        <div className="ad-head ad-rise">

          <p className="ad-overline">
            Overview
          </p>

          <h1 className="ad-title">
            Dashboard
          </h1>

          <div className="ad-title-bar" />

        </div>

        {/* STATS */}

        <div className="ad-stats">

          {statCards.map(
            (card, i) => (

              <div
                key={i}
                className="ad-stat ad-rise"
                style={{
                  "--accent": card.accent,
                  animationDelay: `${0.1 + i * 0.07}s`,
                }}
              >

                <div className="ad-stat-top">

                  <p className="ad-stat-label">
                    {card.label}
                  </p>

                  <div className="ad-icon">
                    {card.icon}
                  </div>

                </div>

                <h2 className="ad-stat-value">
                  {card.value}
                </h2>

                <div className="ad-stat-bar" />

              </div>

            )
          )}

        </div>

        {/* CHARTS */}

        <div className="ad-charts">

          {[
            {
              title:
                "Weekly Sales Comparison",

              data:
                salesChartData
            },

            {
              title:
                "Weekly Orders Comparison",

              data:
                ordersChartData
            },

          ].map(
            (chart, i) => (

              <div
                key={i}
                className="ad-panel ad-rise"
                style={{
                  animationDelay: `${0.4 + i * 0.08}s`,
                }}
              >

                <div className="ad-panel-head">
                  <h2 className="ad-panel-title">
                    {chart.title}
                  </h2>
                </div>

                {/* Height is set per breakpoint in CSS (--ad-chart-h);
                    the pie radius is a percentage so it scales with it. */}
                <div className="ad-chart-box">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <PieChart>

                      <Pie
                        data={chart.data}
                        dataKey="value"
                        nameKey="name"
                        outerRadius="68%"
                        innerRadius="42%"
                        label={({
                          name,
                          value
                        }) => {

                          /*
                            Don't display the fake
                            fallback value as "1".
                          */

                          if (
                            name ===
                            "No Sales Yet"
                          ) {
                            return "No Sales";
                          }

                          if (
                            name ===
                            "No Orders Yet"
                          ) {
                            return "No Orders";
                          }

                          return `${value}`;
                        }}
                        labelLine={false}
                        stroke="#000000"
                        strokeWidth={2}
                        isAnimationActive={true}
                      >

                        {chart.data.map(
                          (
                            entry,
                            index
                          ) => (

                            <Cell
                              key={
                                `${entry.name}-${index}`
                              }
                              fill={
                                entry.name ===
                                "No Sales Yet"
                                  ? "#2a2a2a"
                                  : entry.name ===
                                    "No Orders Yet"
                                  ? "#2a2a2a"
                                  : COLORS[
                                      index %
                                        COLORS.length
                                    ]
                              }
                            />

                          )
                        )}

                      </Pie>

                      <Tooltip
                        contentStyle={
                          customTooltipStyle
                        }
                        itemStyle={{
                          color:
                            "#ffffff"
                        }}
                        labelStyle={{
                          color:
                            "#ffffff"
                        }}
                        cursor={false}
                      />

                      <Legend
                        wrapperStyle={{
                          color:
                            "#ffffff"
                        }}
                      />

                    </PieChart>

                  </ResponsiveContainer>

                </div>

              </div>

            )
          )}

        </div>

        {/* RECENT ORDERS */}

        <div
          className="ad-panel ad-rise"
          style={{
            animationDelay: "0.55s",
          }}
        >

          <div className="ad-panel-head">

            <h2 className="ad-panel-title">
              Recent Orders
            </h2>

            <span className="ad-pill">
              Latest{" "}
              {recentOrders.length}
            </span>

          </div>

          {/* TABLE HEADER (≥ 640px only) */}

          <div className="ad-thead">

            <span style={{ gridArea: "id" }}>
              Order ID
            </span>

            <span style={{ gridArea: "amount" }}>
              Amount
            </span>

            <span style={{ gridArea: "date" }}>
              Date
            </span>

            <span style={{ gridArea: "status" }}>
              Status
            </span>

          </div>

          <div className="ad-list">

            {recentOrders.map(
              (order) => (

                <div
                  key={order.id}
                  className="ad-row"
                >

                  <div className="ad-c-id ad-cell-id">
                    #
                    {order.orderId ||
                      order.id}
                  </div>

                  <div className="ad-c-amount ad-cell-amount">
                    ₹
                    {Number(
                      order.total ??
                      order.amount ??
                      0
                    ).toLocaleString()}
                  </div>

                  <div className="ad-c-date ad-cell-date">
                    {order.date ||
                      (
                        order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "—"
                      )}
                  </div>

                  <div className="ad-c-status">

                    <span
                      className={statusClass(
                        order.status
                      )}
                    >

                      <span
                        className="ad-badge-dot"
                      />

                      {order.status ===
                      "Delivered"
                        ? "Delivered"
                        : order.status ===
                          "Cancelled"
                        ? "Cancelled"
                        : "Pending"}

                    </span>

                  </div>

                </div>
              )
            )}

            {recentOrders.length ===
              0 && (

              <div className="ad-empty">
                No orders found.
              </div>

            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;