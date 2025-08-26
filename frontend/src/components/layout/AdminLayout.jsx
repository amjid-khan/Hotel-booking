import React, { useState } from 'react';
import AdminNavbar from '../common/AdminNavbar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar/Navbar */}
      <AdminNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main content area, passes sidebar state as context */}
      <div style={{ flex: 1, transition: 'margin-left 0.3s ease' }}>
        <Outlet context={{ collapsed, setCollapsed }} />
      </div>
    </div>
  );
};

export default AdminLayout;
