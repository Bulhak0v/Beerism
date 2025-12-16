import React, { useState } from "react";
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

  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);


  return (
    <nav className="navbar">
      <div className="nav-left" onClick={() => {
          navigate(isAdminMode ? "/admin" : "/home");
          closeMenu();
        }}
        >
        <img src={logo} alt="Beerism Logo" className="nav-logo" />
        <div className="nav-title-wrapper">
          <span className="nav-title">Beerism</span>
          {isAdminMode && <span> (Admin Panel)</span>}
        </div>
      </div>

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        {isAdminMode ? (
          <>
            <NavLink to="/admin" className="nav-item" end onClick={closeMenu}>
              Locations
            </NavLink>
            <NavLink to="/adminUser" className="nav-item" onClick={closeMenu}>
              Users
            </NavLink>
            <NavLink to="/adminQuests" className="nav-item" onClick={closeMenu}>Quests</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/home" className="nav-item" onClick={closeMenu}>
              Home
            </NavLink>
            <NavLink to="/profile" className="nav-item" onClick={closeMenu}>
              Profile
            </NavLink>
            <NavLink to="/leaderboard" className="nav-item" onClick={closeMenu}>
              Leaderboard
            </NavLink>
            <NavLink to="/about" className="nav-item" onClick={closeMenu}>
              About
            </NavLink>
          </>
        )}

      </div>

      <button
        className="nav-burger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>


      <div className="nav-right">
        <button 
          className="nav-admin-btn" 
          onClick={() => {
            toggleAdminMode();
            closeMenu();
          }} 
          title={isAdminMode ? "Exit Admin" : "Enter Admin"}
        >
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