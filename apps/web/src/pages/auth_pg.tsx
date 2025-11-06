import React, { useState } from "react";
import logo from "/logo.svg";
import CustomSlider from "../components/slider";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
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


const LogoHeader: React.FC = () => {
  const navigate = useNavigate();
  
  return(
       <div
        className="logo-header"
        onClick={() => navigate("/auth")}
        >
          <a
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={logo} className="logo" />
          </a>
          <h1 className="title">Beerism</h1>
    </div>
  );
};

const RegistrationForm: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(false);
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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Паролі не співпадають!");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          nickname: formData.email.split("@")[0], 
          password: formData.password
        }),
      });

      let data: any = {};
      try {
        data = await res.json();

      } catch {
        console.log("Empty or invalid JSON response from server");
      }

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
        
      }
      console.log("Registered user:", data.user);
      setUser(data.user);
      navigate("/profile");

    } catch (err: any) {

      setError(err.message);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      let data: any = {};
      try {
        data = await res.json();

      } catch {
        console.log("Empty or invalid JSON response from server");
      }

      if (!res.ok) {
        throw new Error(data?.message || "Login failed");
      }

      console.log("Loged in user:", data.user);
      setUser(data.user);
      navigate("/profile");

    } catch (err: any) {

      setError(err.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {

  if (credentialResponse.credential) {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);

      const email = decoded.email;
      const nickname = decoded.name || decoded.given_name || email.split("@")[0];
      const idToken = credentialResponse.credential;

      let res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: idToken,
        }),
      });

       let data: any = await res.json();

    if (!res.ok) {
      console.log("User not found, registering new Google user...");
      res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          nickname,
          password: idToken, 
        }),
      });
      data = await res.json();
    }

    if (!res.ok) throw new Error(data.message || "Google authentication failed");

    setUser(data.user || data);
    localStorage.setItem("user", JSON.stringify(data.user || data));

    navigate("/profile");
    } catch (error) {
      console.error("JWT decode failed:", error);
    }
    } else {
      console.warn("No credential found in Google response");
    }
  };
  const handleGoogleError = () => {
    console.log("Google Sign In Failed");
  };

  return (
    <div className="form-section">
      {isSignIn ? (
        
        <div className="signIn_form">
          <h2>Sign in now</h2>
          <p>Welcome back!</p>
          
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            shape="rectangular"
            text="continue_with"
            size="large"
          />

          <div className="divider">
            <p>or</p>
          </div>

        <form onSubmit={handleSignInSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          <a onClick={() => navigate("/passwordRecovery")}>Forgot your password?</a>
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Sign In</button>

          <h3>
            Don’t have an account?{" "}
            <a onClick={() => setIsSignIn(false)}>Sign Up</a>
          </h3>
          </form>
        </div>
      ) : (
        <div className="registration_form">
          <h2>Sign up now</h2>
          <p>Start your journey!</p>

          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            shape="rectangular"
            text="continue_with"
            size="large"
          />

          <div className="divider">
            <p>or</p>
          </div>

          <form className="registerData_form" onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                name="email"
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                onChange={handleChange}
                name="password"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                onChange={handleChange}
                name="confirmPassword"
                placeholder="Confirm your password"
                required
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit">Sign Up</button>
          </form>

          <h3>
            Already have an account?{" "}
            <a onClick={() => setIsSignIn(true)}>Sign In</a>
          </h3>
        </div>
      )}
    </div>
  );
};



const AuthPage: React.FC = () => {
  return (
    <div className="auth-container">
      <LogoHeader />
      <RegistrationForm />
      <SliderSection />
    </div>
  );
};

export default AuthPage;
