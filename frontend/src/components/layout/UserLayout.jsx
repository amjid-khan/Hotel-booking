import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../common/Navbar";

function UserLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="min-h-screen lg:pl-72">
        <div className="p-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default UserLayout;
