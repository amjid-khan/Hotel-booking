import React from 'react'
import SuperAdminNavbar from '../SuperAdmin/SuperAdminNavbar'
import { Outlet } from 'react-router-dom'

const SuperAdminLayout = () => {
  return (
    <div>
          <SuperAdminNavbar />
          <Outlet />
    </div>
  )
}

export default SuperAdminLayout
