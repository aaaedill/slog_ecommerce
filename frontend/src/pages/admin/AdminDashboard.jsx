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

const COLORS = ["#ff6600", "#ffffff"];

const AdminDashboard = () => {

  const { products } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  // LOAD ORDERS
  useEffect(() => {
    axios
      .get("http://localhost:4000/orders")
      .then(res => setOrders(res.data));
  }, []);

  // LOAD USERS
  useEffect(() => {
    axios
      .get("http://localhost:4000/users")
      .then(res => setUsers(res.data));
  }, []);

  const totalSales =
    orders.reduce((sum, order) =>
      sum + order.total, 0);
  const totalOrders =
    orders.length;
  const totalProducts =
    products.length;
  const totalCustomers =
    users.filter(u =>
      u.role !== "admin"
    ).length;
  const today =
    new Date();
  today.setHours(0,0,0,0);
  const thisWeekStart =
    new Date(today);
  thisWeekStart.setDate(
    today.getDate() - 7
  );
  const lastWeekStart =
    new Date(today);
  lastWeekStart.setDate(
    today.getDate() - 14
  );
  const lastWeekEnd =
    new Date(today);
  lastWeekEnd.setDate(
    today.getDate() - 7
  );

  const lastWeekSales =
    orders
      .filter(order => {
        const d =
          new Date(order.date);
        d.setHours(0,0,0,0);
        return (
          d >= lastWeekStart &&
          d < lastWeekEnd
        );
      })
      .reduce((sum, o) =>
        sum + o.total, 0);

  const thisWeekSales =
    orders
      .filter(order => {
        const d =
          new Date(order.date);
        d.setHours(0,0,0,0);
        return d >= thisWeekStart;
      })
      .reduce((sum, o) =>
        sum + o.total, 0);

  const lastWeekOrders =
    orders.filter(order => {
      const d =
        new Date(order.date);
      d.setHours(0,0,0,0);
      return (
        d >= lastWeekStart &&
        d < lastWeekEnd
      );
    }).length;

  const thisWeekOrders =
    orders.filter(order => {
      const d =
        new Date(order.date);
      d.setHours(0,0,0,0);
      return d >= thisWeekStart;
    }).length;

  const salesChart = [
    {
      name: "Last Week",
      value: lastWeekSales
    },
    {
      name: "This Week",
      value: thisWeekSales
    }
  ];

  const ordersChart = [
    {
      name: "Last Week",
      value: lastWeekOrders
    },
    {
      name: "This Week",
      value: thisWeekOrders
    }
  ];
  const recentOrders =
    [...orders]
      .reverse()
      .slice(0, 2);

  return (

    <div className="min-h-screen bg-[#0b1120] flex justify-center items-start p-3 sm:p-5 md:p-8 rounded-3xl">

      <div className="
        w-full
        max-w-7xl
        bg-white/5
        backdrop-blur-xl
        border border-white/10
        rounded-2xl sm:rounded-3xl
        shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]
        p-4 sm:p-6 md:p-8
        relative
        overflow-hidden
      ">

        {/* LIQUID GLOW */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-black text-white p-4 sm:p-5 rounded-xl shadow">
            <p className="text-sm sm:text-base">Total Sales</p>
            <h2 className="text-xl sm:text-2xl font-semibold">
              ₹{totalSales}
            </h2>
          </div>
          <div className="bg-black text-white p-4 sm:p-5 rounded-xl shadow">
            <p className="text-sm sm:text-base">Total Orders</p>
            <h2 className="text-xl sm:text-2xl font-semibold">
              {totalOrders}
            </h2>
          </div>
          <div className="bg-black text-white p-4 sm:p-5 rounded-xl shadow">
            <p className="text-sm sm:text-base">Total Products</p>
            <h2 className="text-xl sm:text-2xl font-semibold">
              {totalProducts}
            </h2>
          </div>
          <div className="bg-black text-white p-4 sm:p-5 rounded-xl shadow">
            <p className="text-sm sm:text-base">Total Customers</p>
            <h2 className="text-xl sm:text-2xl font-semibold">
              {totalCustomers}
            </h2>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-8 sm:mb-10">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-white">
              Weekly Sales Comparison
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={salesChart}
                  dataKey="value"
                  outerRadius={90}
                  innerRadius={55}
                  label
                >
                  {salesChart.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-white">
              Weekly Orders Comparison
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={ordersChart}
                  dataKey="value"
                  outerRadius={90}
                  innerRadius={55}
                  label
                >
                  {ordersChart.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT ORDERS */}
        <div className="bg-black text-white p-4 sm:p-6 rounded-xl shadow mt-6 sm:mt-12">
          <h2 className="mb-4 text-base sm:text-lg font-semibold">
            Recent Orders
          </h2>
          {recentOrders.map(order => (
            <div
              key={order.id}
              className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 border-b py-3 text-sm sm:text-base"
            >
              <div>ID: {order.id}</div>
              <div>₹{order.total}</div>
              <div>{order.date}</div>
              <div
                className={
                  order.status === "Delivered"
                    ? "text-green-500"
                    : "text-orange-500"
                }
              >
                {
                  order.status === "Delivered"
                    ? "Delivered"
                    : "Pending"
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;