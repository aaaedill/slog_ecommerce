import React from "react";
import AdminNavbar from "./AdminNavbar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {

  return (

    <div className="min-h-screen bg-black text-white">

      <AdminNavbar />

      <div className="p-4 sm:p-6 lg:p-6">
        <Outlet />
      </div>

    </div>

  );
};

export default AdminLayout;