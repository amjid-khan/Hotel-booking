import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';

function UserLayout() {
  return (
    <>
      <Navbar />
      <div>
        <Outlet /> {/* renders the child route here */}
        </div>
    </>
  );
}

export default UserLayout