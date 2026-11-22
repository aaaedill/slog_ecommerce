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
    orders.reduce(
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
    orders.length;

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
    orders.filter((order) => {

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
    orders.filter((order) => {

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
    [...orders]
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
    <div
      className="ad-root min-h-screen flex justify-center items-start p-3 sm:p-5 md:p-8"
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

        /* ── Stat cards ── */
        .ad-stat {
          position: relative;
          background: transparent;
          border: 1px solid var(--ad-line);
          border-radius: 16px;
          transition: border-color 0.3s ease, transform 0.3s ease;
        }

        .ad-stat:hover {
          transform: translateY(-2px);
          border-color: var(--ad-line-hover);
        }

        .ad-stat-label {
          color: var(--ad-white-soft);
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.01em;
        }

        .ad-stat-value {
          color: var(--ad-white);
          font-weight: 800;
          letter-spacing: -0.03em;
          font-variant-numeric: tabular-nums;
          font-size: clamp(1.9rem, 2.6vw, 2.4rem);
          line-height: 1.1;
        }

        .ad-icon {
          color: var(--accent);
          background: rgba(255, 45, 63, 0.1);
          border: 1px solid var(--ad-line);
          transition: background 0.3s ease, color 0.3s ease;
        }

        .ad-stat:hover .ad-icon {
          background: var(--accent);
          color: #ffffff;
        }

        .ad-stat-bar {
          height: 2px;
          width: 48px;
          border-radius: 2px;
          background: var(--accent);
          transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .ad-stat:hover .ad-stat-bar { width: 100%; }

        /* ── Panels (charts + orders) ── */
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

        /* ── Recharts text → white ── */
        .ad-root .recharts-pie-label-text {
          fill: #ffffff !important;
          font-size: 0.95rem;
          font-weight: 700;
        }

        .ad-root .recharts-legend-item-text {
          color: #ffffff !important;
          font-weight: 600;
        }

        .ad-root .recharts-sector {
          outline: none;
          transition: opacity 0.2s ease;
        }

        .ad-root .recharts-sector:hover {
          opacity: 0.85;
        }

        /* ── Latest pill ── */
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

        .ad-cell-id {
          color: var(--ad-white);
          font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .ad-cell-amount {
          color: var(--ad-white);
          font-size: 0.98rem;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
        }

        .ad-cell-date {
          color: var(--ad-white-soft);
          font-size: 0.9rem;
          font-weight: 500;
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

      <div
        className="w-full max-w-7xl relative p-2 sm:p-4 md:p-6"
      >

        {/* PAGE HEADING */}

        <div
          className="mb-8 sm:mb-10 relative ad-rise"
        >

          <p className="ad-overline">
            Overview
          </p>

          <h1 className="ad-title">
            Dashboard
          </h1>

          <div className="ad-title-bar" />

        </div>

        {/* STATS */}

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8 sm:mb-10 relative"
        >

          {statCards.map(
            (card, i) => (

              <div
                key={i}
                className="ad-stat ad-rise rounded-xl p-5 flex flex-col gap-4"
                style={{
                  "--accent": card.accent,
                  animationDelay: `${0.1 + i * 0.07}s`,
                }}
              >

                <div className="flex items-center justify-between">

                  <p className="ad-stat-label">
                    {card.label}
                  </p>

                  <div
                    className="ad-icon w-10 h-10 rounded-lg flex items-center justify-center"
                  >
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

        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mb-8 sm:mb-10 relative"
        >

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
                className="ad-panel ad-rise rounded-xl p-5 sm:p-6"
                style={{
                  animationDelay: `${0.4 + i * 0.08}s`,
                }}
              >

                <h2
                  className="ad-panel-title mb-5"
                >
                  {chart.title}
                </h2>

                <ResponsiveContainer
                  width="100%"
                  height={240}
                >

                  <PieChart>

                    <Pie
                      data={chart.data}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      innerRadius={55}
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
                          "#ffffff",

                        fontSize:
                          "13px"
                      }}
                    />

                  </PieChart>

                </ResponsiveContainer>

              </div>

            )
          )}

        </div>

        {/* RECENT ORDERS */}

        <div
          className="ad-panel ad-rise rounded-xl p-5 sm:p-6 relative"
          style={{
            animationDelay: "0.55s",
          }}
        >

          <div
            className="flex items-center justify-between mb-5"
          >

            <h2
              className="ad-panel-title"
            >
              Recent Orders
            </h2>

            <span
              className="ad-pill px-3 py-1 rounded-full"
            >
              Latest{" "}
              {recentOrders.length}
            </span>

          </div>

          {/* TABLE HEADER */}

          <div
            className="ad-thead hidden sm:grid grid-cols-4 gap-4 px-4 py-3 mb-1"
          >

            <span>
              Order ID
            </span>

            <span>
              Amount
            </span>

            <span>
              Date
            </span>

            <span>
              Status
            </span>

          </div>

          <div
            className="flex flex-col"
          >

            {recentOrders.map(
              (order) => (

                <div
                  key={order.id}
                  className="ad-row grid grid-cols-2 sm:grid-cols-4 gap-4 px-4 py-4 items-center"
                >

                  <div
                    className="ad-cell-id"
                  >
                    #
                    {order.orderId ||
                      order.id}
                  </div>

                  <div
                    className="ad-cell-amount"
                  >
                    ₹
                    {Number(
                      order.total ??
                      order.amount ??
                      0
                    ).toLocaleString()}
                  </div>

                  <div
                    className="ad-cell-date hidden sm:block"
                  >
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

                  <div>

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

              <div
                className="ad-empty text-center py-10"
              >
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