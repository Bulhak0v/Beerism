import React, { useState, useEffect } from "react";
import LogoHeader from "../components/logoHeader";
import CustomSlider from "../components/slider";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/authProvider";

const SliderSection: React.FC = () => {
  const images = [
    { imgURL: "/sliderImages/img1.svg", imgAlt: "First Slide" },
    { imgURL: "/sliderImages/img2.svg", imgAlt: "Second Slide" },
    { imgURL: "/sliderImages/img3.svg", imgAlt: "Third Slide" },
  ];

  return (
    <div className="slider-section">
      <CustomSlider>
        {images.map((image, index) => (
          <img key={index} src={image.imgURL} alt={image.imgAlt} />
        ))}
      </CustomSlider>
    </div>
  );
};

const AuthForms: React.FC = () => {

  const [view, setView] = useState<"signIn" | "signUp" | "recovery">("signIn");
  
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryStatus, setRecoveryStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [recoveryMessage, setRecoveryMessage] = useState("");

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Паролі не співпадають!");
      return;
    }
    try {
      const res = await fetch(`https://beerism-backend.onrender.com/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          nickname: formData.email.split("@")[0],
          password: formData.password
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      
      setUser(data.user || data); 
      saveLocation();
      navigate("/profile");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`https://beerism-backend.onrender.com/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Login failed");

      setUser(data.user);
      saveLocation();
      navigate("/profile");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const token = credentialResponse.credential;
    if (!token) return;
    try {
      const res = await fetch("https://beerism-backend.onrender.com/api/users/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Google authentication failed");

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      saveLocation();
      navigate("/profile");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const saveCity = async () => {
    const storedString = sessionStorage.getItem("user_location");

    if (!storedString) {
      console.log("⚠️ Нет данных в sessionStorage");
      return;
    }

    try {
      const locationData = JSON.parse(storedString);

      if (!locationData.latitude || !locationData.longitude) {
        console.error("Координаты не найдены в объекте:", locationData);
        return;
      }

      const lat = locationData.latitude;
      const lng = locationData.longitude;

      console.log(`📍 Запрос города для: ${lat}, ${lng}`);

      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );

      if (!response.ok) throw new Error("Ошибка сети");

      const data = await response.json();

      const city = data.city || data.locality || "Unknown City";

      console.log("ВАШ ГОРОД:", city);

      localStorage.setItem("user_city", city);

    } catch (e) {
      console.error("Ошибка определения города:", e);
    }
  };

  const saveLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        sessionStorage.setItem("user_location", JSON.stringify(coords));
      }, (err) => console.warn(err));
    }
    saveCity();
  };


const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryStatus("loading");
    setRecoveryMessage("");

    try {
      const res = await fetch("https://beerism-backend.onrender.com/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setRecoveryStatus("success");
      } else {
        setRecoveryStatus("error");
        setRecoveryMessage(data.message || "Something went wrong.");
      }
    } catch (err) {
      setRecoveryStatus("error");
      setRecoveryMessage("Network error. Please try again.");
    }
  };

  if (view === "recovery") {
    return (
      <div className="signIn_form">
        <h2>Forgot your password?</h2>

        {recoveryStatus === "success" ? (
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>📩</div>
            <h3 style={{ color: '#5C4033', fontSize: '24px', margin: '10px 0' }}>Email Sent!</h3>
            <p style={{ fontSize: '18px', color: '#555', marginBottom: '25px', lineHeight: '1.4' }}>
              We've sent a new password to <b>{recoveryEmail}</b>.<br />
              Please check your inbox (and spam folder).
            </p>
            <button onClick={() => setView("signIn")} style={{ width: '100%' }}>
              Return to Login
            </button>
          </div>
        ) : (
          <>
            <p>Enter your email to reset instructions!</p>
            
            <div className="divider"></div>

            <form onSubmit={handleRecoverySubmit}>
              <div className="form-group">
                <label htmlFor="rec-email">Email address</label>
                <input
                  id="rec-email"
                  type="email"
                  placeholder="Enter your email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  required
                />
              </div>

              {recoveryStatus === "error" && (
                 <p style={{ color: "#FF2A2A", fontWeight: "bold", textAlign: "center", margin: "10px 0" }}>
                   {recoveryMessage}
                 </p>
              )}

              <button type="submit" disabled={recoveryStatus === "loading"}>
                {recoveryStatus === "loading" ? "Sending..." : "Reset password"}
              </button>
              
              <h3>
                Remembered your password?{" "}
                <a onClick={() => setView("signIn")}>Sign In</a>
              </h3>
            </form>
          </>
        )}
      </div>
    );
  }


  if (view === "signIn") {
    return (
      <div className="signIn_form">
        <h2>Sign in to Beerism!</h2>
        <p>Welcome back!</p>
        
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log("Failed")} theme="outline" shape="rectangular" text="continue_with" size="large" locale="en" />

        <div className="divider"><p>or</p></div>

        <form onSubmit={handleSignInSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" name="email" placeholder="Enter your email" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" onChange={handleChange} placeholder="Enter your password" required />
          </div>
          
          <a onClick={() => setView("recovery")}>Forgot your password?</a>
          
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Sign In</button>

          <h3>Don’t have an account? <a onClick={() => setView("signUp")}>Sign Up</a></h3>
        </form>
      </div>
    );
  }


  return (
    <div className="registration_form">
      <h2>Sign up for Beerism!</h2>
      <p>Start your journey!</p>

      <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log("Failed")} theme="outline" shape="rectangular" text="continue_with" size="large" locale="en"/>

      <div className="divider"><p>or</p></div>

      <form className="registerData_form" onSubmit={handleRegisterSubmit}>
        <div className="form-group">
          <label htmlFor="up-email">Email address</label>
          <input id="up-email" type="email" name="email" onChange={handleChange} placeholder="Enter your email" required />
        </div>
        <div className="form-group">
          <label htmlFor="up-password">Password</label>
          <input id="up-password" type="password" onChange={handleChange} name="password" placeholder="Enter your password" required />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input id="confirmPassword" type="password" onChange={handleChange} name="confirmPassword" placeholder="Confirm your password" required />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Sign Up</button>
      </form>

      <h3>Already have an account? <a onClick={() => setView("signIn")}>Sign In</a></h3>
    </div>
  );
};

const AuthPage: React.FC = () => {
  useEffect(() => {
    document.body.style.overflow = "hidden"; 
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  return (
    <div className="auth-container">
      <div className="form-section">
        <AuthForms />
      </div>
      <SliderSection />
    </div>
  );
};

export default AuthPage;

