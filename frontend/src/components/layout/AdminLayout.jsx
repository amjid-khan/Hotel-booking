import React from 'react'
import AdminNavbar from '../common/AdminNavbar'
import AdminDashboard from '../../pages/AdminDashboard'
import { Outlet } from 'react-router-dom'

const AdminLayout = () => {
  return (
    <div>
      <AdminNavbar />
      <Outlet />
    </div>
  )
}

export default AdminLayout
