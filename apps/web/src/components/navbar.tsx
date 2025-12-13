import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "/logo.svg";
import "../styles/navbar.css";
import adminIcon from "../../public/adminIcons/adminEnterIcon.svg";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const isAdminMode = location.pathname.startsWith("/admin");

  const toggleAdminMode = () => {
      if (isAdminMode) {
        navigate("/home");
      } else {
        navigate("/admin");
      }
    };

  return (
    <nav className="navbar">
      <div className="nav-left" onClick={() => navigate(isAdminMode ? "/admin" : "/home")}>
        <img src={logo} alt="Beerism Logo" className="nav-logo" />
        <div className="nav-title-wrapper">
          <span className="nav-title">Beerism</span>
          {isAdminMode && <span> (Admin Panel)</span>}
        </div>
      </div>

      <div className="nav-links">
        {isAdminMode ? (
          <>
            <NavLink to="/admin" className="nav-item" end>
              Locations
            </NavLink>
            <NavLink to="/adminUser" className="nav-item">
              Users
            </NavLink>
            <NavLink to="/adminQuests" className="nav-item">Quests</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/home" className="nav-item">
              Home
            </NavLink>
            <NavLink to="/profile" className="nav-item">
              Profile
            </NavLink>
            <NavLink to="/about" className="nav-item">
              About
            </NavLink>
            <NavLink to="/contact" className="nav-item">
              Contact
            </NavLink>
          </>
        )}
      </div>

      <div className="nav-right">
        <button className="nav-admin-btn" onClick={toggleAdminMode} title={isAdminMode ? "Exit Admin" : "Enter Admin"}>
          <img 
            src={adminIcon} 
            alt="Toggle Admin Mode" 
            className="nav-admin-icon" 
          />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;