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

const COLORS = ["#f97316", "#38bdf8"];

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
     TOTAL SALES
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

  /* ─────────────────────────────────────────────────────────
     TOTAL ORDERS
  ───────────────────────────────────────────────────────── */

  const totalOrders =
    orders.length;

  /* ─────────────────────────────────────────────────────────
     TOTAL PRODUCTS
  ───────────────────────────────────────────────────────── */

  const totalProducts =
    products.length;

  /* ─────────────────────────────────────────────────────────
     TOTAL CUSTOMERS
  ───────────────────────────────────────────────────────── */

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
     LAST WEEK ORDERS
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

  /* ─────────────────────────────────────────────────────────
     THIS WEEK ORDERS
  ───────────────────────────────────────────────────────── */

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

  /* ─────────────────────────────────────────────────────────
     LAST WEEK SALES
  ───────────────────────────────────────────────────────── */

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

  /* ─────────────────────────────────────────────────────────
     THIS WEEK SALES
  ───────────────────────────────────────────────────────── */

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

  /* ─────────────────────────────────────────────────────────
     LAST WEEK ORDER COUNT
  ───────────────────────────────────────────────────────── */

  const lastWeekOrders =
    lastWeekOrderList.length;

  /* ─────────────────────────────────────────────────────────
     THIS WEEK ORDER COUNT
  ───────────────────────────────────────────────────────── */

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
      accent: "#f97316",
      glow: "rgba(249,115,22,0.15)",
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
      accent: "#38bdf8",
      glow: "rgba(56,189,248,0.15)",
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
      accent: "#a78bfa",
      glow: "rgba(167,139,250,0.15)",
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
      accent: "#34d399",
      glow: "rgba(52,211,153,0.15)",
    },
  ];

  /* ─────────────────────────────────────────────────────────
     TOOLTIP
  ───────────────────────────────────────────────────────── */

  const customTooltipStyle = {
    backgroundColor: "#161b27",
    border:
      "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "13px",
    boxShadow:
      "0 8px 24px rgba(0,0,0,0.4)",
  };

  /* ─────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────── */

  return (
    <div
      className="min-h-screen flex justify-center items-start p-3 sm:p-5 md:p-8 rounded-3xl"
      style={{
        background: "#0b1120"
      }}
    >

      <div
        className="w-full max-w-7xl relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8"
        style={{
          background:
            "linear-gradient(145deg, #0f1623 0%, #131a28 100%)",

          border:
            "1px solid rgba(255,255,255,0.07)",

          boxShadow:
            "0 24px 64px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset",
        }}
      >

        {/* AMBIENT GLOWS */}

        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{
            background:
              "rgba(249,115,22,0.08)"
          }}
        />

        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{
            background:
              "rgba(99,102,241,0.08)"
          }}
        />

        {/* PAGE HEADING */}

        <div
          className="mb-8 sm:mb-10 relative"
        >

          <p
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{
              color: "#f97316",
              letterSpacing:
                "0.18em"
            }}
          >
            Overview
          </p>

          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{
              color: "#f1f5f9",
              letterSpacing:
                "-0.02em"
            }}
          >
            Dashboard
          </h1>

        </div>

        {/* STATS */}

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8 sm:mb-10 relative"
        >

          {statCards.map(
            (card, i) => (

              <div
                key={i}
                className="rounded-xl p-5 flex flex-col gap-4 transition-all duration-300"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",

                  border:
                    "1px solid rgba(255,255,255,0.08)",

                  boxShadow:
                    `0 4px 20px ${card.glow}`,
                }}
              >

                <div className="flex items-center justify-between">

                  <p
                    className="text-sm font-medium"
                    style={{
                      color:
                        "#94a3b8"
                    }}
                  >
                    {card.label}
                  </p>

                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      background:
                        card.glow,

                      border:
                        `1px solid ${card.accent}30`,

                      color:
                        card.accent,
                    }}
                  >
                    {card.icon}
                  </div>

                </div>

                <h2
                  className="text-2xl sm:text-3xl font-bold tracking-tight"
                  style={{
                    color:
                      "#f1f5f9"
                  }}
                >
                  {card.value}
                </h2>

                <div
                  className="h-0.5 rounded-full w-12"
                  style={{
                    background:
                      `linear-gradient(90deg, ${card.accent}, transparent)`
                  }}
                />

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
                className="rounded-xl p-5 sm:p-6"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",

                  border:
                    "1px solid rgba(255,255,255,0.08)",
                }}
              >

                <h2
                  className="text-base sm:text-lg font-semibold mb-5"
                  style={{
                    color:
                      "#e2e8f0",

                    letterSpacing:
                      "-0.01em"
                  }}
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
                      strokeWidth={0}
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
                                ? "#475569"
                                : entry.name ===
                                  "No Orders Yet"
                                ? "#475569"
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
                          "#94a3b8",

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
          className="rounded-xl p-5 sm:p-6 relative"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",

            border:
              "1px solid rgba(255,255,255,0.08)",
          }}
        >

          <div
            className="flex items-center justify-between mb-5"
          >

            <h2
              className="text-base sm:text-lg font-semibold"
              style={{
                color:
                  "#e2e8f0",

                letterSpacing:
                  "-0.01em"
              }}
            >
              Recent Orders
            </h2>

            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{
                background:
                  "rgba(249,115,22,0.12)",

                color:
                  "#f97316",

                border:
                  "1px solid rgba(249,115,22,0.2)",
              }}
            >
              Latest{" "}
              {recentOrders.length}
            </span>

          </div>

          {/* TABLE HEADER */}

          <div
            className="hidden sm:grid grid-cols-4 gap-4 px-4 py-2 rounded-lg mb-2 text-xs font-semibold uppercase tracking-wider"
            style={{
              background:
                "rgba(255,255,255,0.04)",

              color:
                "#64748b",

              letterSpacing:
                "0.08em",
            }}
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
            className="flex flex-col gap-2"
          >

            {recentOrders.map(
              (order) => (

                <div
                  key={order.id}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-4 py-3.5 rounded-xl transition-all duration-200"
                  style={{
                    background:
                      "rgba(255,255,255,0.02)",

                    border:
                      "1px solid rgba(255,255,255,0.05)",
                  }}
                >

                  <div
                    className="text-sm font-medium font-mono"
                    style={{
                      color:
                        "#cbd5e1"
                    }}
                  >
                    #
                    {order.orderId ||
                      order.id}
                  </div>

                  <div
                    className="text-sm font-semibold"
                    style={{
                      color:
                        "#f1f5f9"
                    }}
                  >
                    ₹
                    {Number(
                      order.total ??
                      order.amount ??
                      0
                    ).toLocaleString()}
                  </div>

                  <div
                    className="text-sm hidden sm:block"
                    style={{
                      color:
                        "#64748b"
                    }}
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
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={
                        order.status ===
                        "Delivered"
                          ? {
                              background:
                                "rgba(52,211,153,0.12)",

                              color:
                                "#34d399",

                              border:
                                "1px solid rgba(52,211,153,0.2)",
                            }
                          : order.status ===
                            "Cancelled"
                          ? {
                              background:
                                "rgba(239,68,68,0.12)",

                              color:
                                "#f87171",

                              border:
                                "1px solid rgba(239,68,68,0.2)",
                            }
                          : {
                              background:
                                "rgba(249,115,22,0.12)",

                              color:
                                "#f97316",

                              border:
                                "1px solid rgba(249,115,22,0.2)",
                            }
                      }
                    >

                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background:
                            order.status ===
                            "Delivered"
                              ? "#34d399"
                              : order.status ===
                                "Cancelled"
                              ? "#f87171"
                              : "#f97316",
                        }}
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
                className="text-center py-10 text-sm"
                style={{
                  color:
                    "#475569"
                }}
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