import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../frontend/Footer/Footer';

function UserLayout() {
  return (
    <>
      <Navbar />
      <div>
        <Outlet /> {/* renders the child route here */}
        </div>
      <Footer />
    </>
  );
}

export default UserLayout