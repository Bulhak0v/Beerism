import React, { useState } from "react";
import avatarPlaceholder from "/avatar_placeholder.png"; 
import '../styles/profile.css';
import logo from "/logo.svg";
import { useNavigate } from "react-router-dom";


const ProfilePage: React.FC = () => {
  const [nickname, setNickname] = useState(() => localStorage.getItem("nickname") || "");
  const [bio, setBio] = useState("");
  const [favoriteBeer, setFavoriteBeer] = useState("Not set");
  const [budget, setBudget] = useState("Not set");
  const [favoriteBarStyle, setFavoriteBarStyle] = useState("Not set");
  const [activeTab, setActiveTab] = useState("Profile"); 
  const navigate = useNavigate();

  return (
    <>
    <LogoHeader />
      <div className="profile-main">
        <div className="topTitle">
          <h2 className="account-title">Account settings</h2>
          <button className="backButton" onClick={() => navigate("/auth")}><span><img src="/profileIcons/Arrow.svg"></img></span> Back</button>
        </div>
         <div className="settings-cover">
     
             <div className="profile-settings">
                <ul>
                  {["Profile", "Security", "Notifications", "Privacy"].map((tab) => (
                    <li
                      key={tab}
                      className={activeTab === tab ? "active" : ""}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab} <span>
                        <img src={`/profileIcons/${tab === "Profile" ? "User" : tab === "Security" ? "Lock" : tab === "Notifications" ? "Bell" : "Eye"}.png`} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
         </div>

        <div className="profile-card">
          <div className="avatar-section">
            <img src={avatarPlaceholder} alt="Avatar" className="avatar" />
               <div className="field">
                <label>Nickname</label>
                <input
                  type="text"
                  placeholder="Nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>
          </div>

          <div className="field">
            <label>Bio</label>
            <textarea
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="preferences">
            <div className="field">
              <label>Favorite kind of beer</label>
              <select
                value={favoriteBeer}
                onChange={(e) => setFavoriteBeer(e.target.value)}
              >
                <option>Not set</option>
                <option>Lager</option>
                <option>Ale</option>
                <option>Stout</option>
              </select>
            </div>

            <div className="field">
              <label>Budget</label>
              <select value={budget} onChange={(e) => setBudget(e.target.value)}>
                <option>Not set</option>
                <option>50$</option>
                <option>100$</option>
                <option>200$</option>
              </select>
            </div>

            <div className="field">
              <label>Favorite bar style</label>
              <select
                value={favoriteBarStyle}
                onChange={(e) => setFavoriteBarStyle(e.target.value)}
              >
                <option>Not set</option>
                <option>Pub</option>
                <option>Lounge</option>
                <option>Beer Garden</option>
              </select>
            </div>
          </div>
      </div>
    </div>
    </>
  );
};


export default ProfilePage;

const LogoHeader: React.FC = () => {
  const navigate = useNavigate();

  return(
        <div
        className="logo-header"
        onClick={() => navigate("/auth")}
        style={{ cursor: "pointer" }}
      >
          <img src={logo} className="logo" />
          <h1 className="title">Beerism</h1>
    </div>
  );
};