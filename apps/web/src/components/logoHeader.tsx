import React, { useState, useEffect } from "react"; 
import '../styles/profile.css';
import logo from "/logo.svg";
import { useNavigate } from "react-router-dom";

const LogoHeader: React.FC = () => {
  const navigate = useNavigate();

  return(
        <div
        className="logo-header"
        onClick={() => navigate("/auth")}
        style={{ cursor: "pointer" }}
      >
          <img src={logo} className="logo" />
    </div>
  );
};

export default LogoHeader;