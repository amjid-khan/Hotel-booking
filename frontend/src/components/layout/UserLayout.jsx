import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../Footer/Footer';

function UserLayout() {
  return (
    <>
      <Navbar />
      <Outlet /> {/* renders the child route here */}
      <Footer />
    </>
  );
}

export default UserLayout;
