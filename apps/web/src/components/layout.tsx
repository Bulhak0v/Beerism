import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./navbar";

const Layout: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="page-content">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;