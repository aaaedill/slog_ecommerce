import React from "react";
import AdminNavbar from "./AdminNavbar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {

  return (

    <>
      <AdminNavbar />
      <div className="p-4 sm:p-6 lg:p-6">
        <Outlet />
      </div>
    </>
  );
};

export default AdminLayout;