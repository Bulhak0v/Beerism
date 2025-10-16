import React, { useState } from "react";
import logo from "/logo.svg";
import CustomSlider from "../components/slider";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

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
  
   const handleGoogleSuccess = (credentialResponse: any) => {

    if (credentialResponse.credential) {
      try {
        const decoded: any = jwtDecode(credentialResponse.credential);

        const nickname = decoded.name || decoded.given_name || decoded.email;

        localStorage.setItem("nickname", nickname);

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

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit">Sign In</button>

          <h3>
            Don’t have an account?{" "}
            <a onClick={() => setIsSignIn(false)}>Sign Up</a>
          </h3>
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

          <form className="registerData_form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
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
                name="confirmPassword"
                placeholder="Confirm your password"
                required
              />
            </div>

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
