import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';

function UserLayout() {
  return (
    <>
      <Navbar />
      <div>
        <Outlet />
        </div>
    </>
  );
}

export default UserLayout