import React, { useState, useEffect, useRef } from "react"; 
import avatarPlaceholder from "/avatar_placeholder.png"; 
import '../styles/profile.css';
import LogoHeader from "../components/logoHeader";
import { useNavigate } from "react-router-dom";
import { useAuth, User } from "../components/authProvider"; 

interface BeerStyleOption {
    beer_style_id: number;
    beer_style_name: string;
}

const ProfilePage: React.FC = () => {
  const CLOUD_NAME = "djtsu5y8b"; 
  const UPLOAD_PRESET = "userImages"
  const { user, setUser, logout } = useAuth(); 
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState(() => localStorage.getItem("nickname") || "");
  const [bio, setBio] = useState("");
  const [initialPrefs, setInitialPrefs] = useState({
    favoriteBeer: "",
    budget: "",
    favoriteBarStyle: ""
  });
  const [availableBeerStyles, setAvailableBeerStyles] = useState<BeerStyleOption[]>([]);
  const [favoriteBeer, setFavoriteBeer] = useState("Not set");
  const [budget, setBudget] = useState("Not set");
  const [favoriteBarStyle, setFavoriteBarStyle] = useState("Not set");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    user?.profile_picture || avatarPlaceholder
  );
const [userCity, setUserCity] = useState(() => {
  const city = localStorage.getItem("user_city")?.toString();
  console.log(city);
  return city || "";
});
  const [beerStyleOptions, setBeerStyleOptions] = useState<BeerStyleOption[]>([]);
  const [atmosphereOptions, setAtmosphereOptions] = useState<string[]>([]);
  const [budgetOptions, setBudgetOptions] = useState<string[]>([]);
  const [cityOptions, setCityOptions] = useState<string[]>([]);

  const handleLogout = () => {
    logout(); 
    navigate("/auth");
  };

  useEffect(() => {
      const fetchDynamicData = async () => {
          try {
              const resStyles = await fetch('https://beerism-backend.onrender.com/api/beer-styles');
              if (resStyles.ok) setBeerStyleOptions(await resStyles.json());

              const resOptions = await fetch('https://beerism-backend.onrender.com/api/locations/options');
              if (resOptions.ok) {
                  const data = await resOptions.json();
                  setAtmosphereOptions(data.atmospheres);
                  setBudgetOptions(data.budgets);
              }

              const resCities = await fetch('https://beerism-backend.onrender.com/api/locations/cities');
              if (resCities.ok) {
                  setCityOptions(await resCities.json());
              }

          } catch (e) { console.error("Error fetching options:", e); }
      };
      
      fetchDynamicData();
  }, []);

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

      setFavoriteBeer(user.preferred_beer_style_id ? user.preferred_beer_style_id.toString() : "");
      setBudget(bud);
      setFavoriteBarStyle(bar);

      setInitialPrefs({
        favoriteBeer: beer,
        budget: bud,
        favoriteBarStyle: bar,
      });
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

  const tabs = [
    { name: "Profile", path: "/profile" },
    { name: "Security", path: "/profile" },
    { name: "Notifications", path: "/profile" },
    { name: "Privacy", path: "/profile" },
  ];

  const handleEditAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleTabClick = (tabName: string, path: string) => {
    setActiveTab(tabName);
    navigate(path); 
  };
  return (
    <>
      <div className="profile-main">
        <div className="topTitle">
          <h2 className="account-title">Account settings</h2>
          <button className="backButton" onClick={() => handleLogout()}><span><img src="/profileIcons/Arrow.svg"></img></span> Back</button>
        </div>
         <div className="settings-cover">
     
             <div className="profile-settings">
                <ul>
        {tabs.map((tab) => (
          <li
            key={tab.name}
            className={activeTab === tab.name ? "active" : ""}
            onClick={() => handleTabClick(tab.name, tab.path)}
          >
            {tab.name}{" "}
            <span>
              <img
                src={`/profileIcons/${
                  tab.name === "Profile"
                    ? "User"
                    : tab.name === "Security"
                    ? "Lock"
                    : tab.name === "Notifications"
                    ? "Bell"
                    : "Eye"
                }.svg`}
                alt={tab.name}
              />
            </span>
          </li>
        ))}
      </ul>
              </div>
         </div>

        <div className="profile-card">
          <div className="avatar-section">
            
            <div className="avatar-wrapper">
              <img
                src={avatarPreview}
                alt="Avatar"
                className="avatar"
              />
              <button className="edit-avatar-btn" onClick={handleEditAvatarClick} title="Change Avatar">
                 <img src="/profileIcons/Camera.svg" alt="Edit" />
              </button>
            </div>

            <div className="field"> 
              <label>Nickname</label>
              <input 
                type="text"
                placeholder="Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)} /> 
              
              <input 
                className="upload-button"
                type="file"
                accept="image/*"
                id="avatarUpload"
                ref={fileInputRef}
                style={{ display: 'none' }} 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAvatarFile(file);
                    setAvatarPreview(URL.createObjectURL(file));
                  }
                }}
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
              <select value={favoriteBeer} onChange={(e) => setFavoriteBeer(e.target.value)}>
                <option value="">Not set</option>
                {beerStyleOptions.map(style => (
                    <option key={style.beer_style_id} value={style.beer_style_id}>
                        {style.beer_style_name}
                    </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Budget</label>
              <select value={budget} onChange={(e) => setBudget(e.target.value)}>
                <option value="">Not set</option>
                {budgetOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Favorite bar style</label>
              <select value={favoriteBarStyle} onChange={(e) => setFavoriteBarStyle(e.target.value)}>
                <option value="">Not set</option>
                 {atmosphereOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Your city</label>
              <select
                value={userCity}
                onChange={(e) => {
                  const val = e.target.value;
                  setUserCity(val);
                  localStorage.setItem("user_city", val);
                }}
              >
                <option value="">Not set</option>
                
                {cityOptions.map((city) => (
                    <option key={city} value={city}>{city}</option>
                ))}

                {userCity && 
                 userCity !== "Not set" && 
                 !cityOptions.includes(userCity) && (
                    <option value={userCity}>{userCity}</option>
                )}
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