import React, { useState, useEffect } from "react"; 
import avatarPlaceholder from "/avatar_placeholder.png"; 
import '../styles/profile.css';
import logo from "/logo.svg";
import { useNavigate } from "react-router-dom";
import { useAuth, User } from "../components/authProvider"; 

import { useEffect } from "react";
import { getUserLocation } from "../utils/getUserLocation";//костя хуесос добавил строчки 

const ProfilePage: React.FC = () => {
  const CLOUD_NAME = "djtsu5y8b"; 
  const UPLOAD_PRESET = "userImages"
  const { user, setUser, logout } = useAuth(); 
  const navigate = useNavigate();

  const [nickname, setNickname] = useState(() => localStorage.getItem("nickname") || "");
  const [bio, setBio] = useState("");
  const [initialPrefs, setInitialPrefs] = useState({
    favoriteBeer: "Not set",
    budget: "Not set",
    favoriteBarStyle: "Not set"
  });
  const [favoriteBeer, setFavoriteBeer] = useState("Not set");
  const [budget, setBudget] = useState("Not set");
  const [favoriteBarStyle, setFavoriteBarStyle] = useState("Not set");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    user?.profile_picture || avatarPlaceholder
  );

  const handleLogout = () => {
    logout(); 
    navigate("/auth");
  };

  const [activeTab, setActiveTab] = useState("Profile"); 
  useEffect(() => {
    if (user) {
      setNickname(user.nickname || "");
      setBio(user.bio || "");

      setAvatarPreview(user.profile_picture || avatarPlaceholder);

      const beer = user.preferred_beer_style_id
        ? user.preferred_beer_style_id.toString()
        : "";
      const bud = user.preferred_budget_range || "";
      const bar = user.preferred_venue_atmosphere || "";

      setFavoriteBeer(beer);
      setBudget(bud);
      setFavoriteBarStyle(bar);

      setInitialPrefs({
        favoriteBeer: beer,
        budget: bud,
        favoriteBarStyle: bar,
      });
      (async () => {//
        const coords = await getUserLocation();//
        if (coords) {//
          console.log("User coordinates:", coords);//
          try {//
            await fetch("https://beerism-backend.onrender.com/api/users/location", {//
              method: "POST",//
              headers: { "Content-Type": "application/json" },//
              body: JSON.stringify({//
                user_id: user.user_id,//
                latitude: coords.latitude,//
                longitude: coords.longitude,//
              }),//
            });//
          } catch (err) {//
            console.error("Failed to send location:", err);//
          }//
        }//
      })();//
    }
  }, [user, setUser]); 


  const handleSaveProfile = async () => {
    if (!user) {
      console.log("no user"); 
      return;
    }
    let imageUrl;

    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        formData.append("upload_preset", UPLOAD_PRESET);

        const resCloudinary = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, 
          {
            method: "POST",
            body: formData,
          }
        );

        if (!resCloudinary.ok) {
          throw new Error("Cloudinary upload failed");
        }

        const cloudinaryData = await resCloudinary.json();
        imageUrl = cloudinaryData.secure_url; 
        setAvatarFile(null); 
      }
    } catch (err) {
        console.error("Avatar upload error:", err);
        alert("Error uploading image.");
        return; 
    }
    let updatedUser = { ...user };

    try {
      const resProfile = await fetch(`https://beerism-backend.onrender.com/api/users/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          nickname,
          bio,
          profile_picture: imageUrl,
        }),
      });


      if (!resProfile.ok) throw new Error("Failed to update profile");
      
      updatedUser = await resProfile.json();
      
      setAvatarFile(null); 

    } catch (err) {
      console.error("Profile update error:", err);
    }
 
    if (
      favoriteBeer !== initialPrefs.favoriteBeer ||
      budget !== initialPrefs.budget ||
      favoriteBarStyle !== initialPrefs.favoriteBarStyle
    ) {
    const prefData = {
      preferred_beer_style_id: favoriteBeer ? parseInt(favoriteBeer) : null,
      preferred_budget_range: budget || null,
      preferred_venue_atmosphere: favoriteBarStyle || null,
    };

      try {
        const resPref = await fetch(`https://beerism-backend.onrender.com/api/users/edit/preferences`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.user_id, ...prefData }),
        });
        if (!resPref.ok) throw new Error("Failed to update preferences");
        updatedUser = await resPref.json();
      } catch (err) {
        console.error("Preferences update error:", err);
      }
    }

    setUser(updatedUser); 
    alert("Profile saved!");
  };

 
  return (
    <>
    <LogoHeader />
      <div className="profile-main">
        <div className="topTitle">
          <h2 className="account-title">Account settings</h2>
          <button className="backButton" onClick={() => handleLogout()}><span><img src="/profileIcons/Arrow.svg"></img></span> Back</button>
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
            <img
              src={avatarPreview}
              alt="Avatar"
              className="avatar"
            />
            <div className="field"> 
              <label>Nickname</label>
              <input 
                type="text"
                placeholder="Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)} /> 
              </div>
            
          </div>


          <div className="field">
              <input 
              className="upload-button"
              type="file"
              accept="image/*"
              id="avatarUpload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setAvatarFile(file);
                  setAvatarPreview(URL.createObjectURL(file));
                }
              }}
            />
    
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
                <option value="">Not set</option>
                <option value="1">Lager</option>
                <option value="2">Ale</option>
                <option value="3">Stout</option>
              </select>
            </div>


            <div className="field">
              <label>Budget</label>
              <select value={budget} onChange={(e) => setBudget(e.target.value)}>
                <option value="">Not set</option>
                <option value="Low">~50$</option>
                <option value="Medium">~100$</option>
                <option value="High">~200$</option>
              </select>

            </div>

            <div className="field">
              <label>Favorite bar style</label>
              <select
                value={favoriteBarStyle}
                onChange={(e) => setFavoriteBarStyle(e.target.value)}
              >
                <option value="">Not set</option>
                <option value="Cozy">Cozy</option>
                <option value="Modern">Modern</option>
                <option value="Historic">Historic</option>
              </select>
            </div>


          </div>
           <div className="profile-actions">
            <button onClick={handleSaveProfile} className="save-button">Save</button>
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