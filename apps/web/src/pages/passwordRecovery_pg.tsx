import React from "react";
import LogoHeader from "../components/logoHeader";
import CustomSlider from "../components/slider";
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

const PasswordForm: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="form-section">
        <div className="recovery_form">
          <h2>Forgot your password?</h2>
          <p>Enter your email so we can send reset instructions to you!</p>
          
          <div className="divider">
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

          <button type="submit">Reset password</button>
            <h3>
                Remembered your password?{" "}
                <a onClick={() => navigate("/auth")}>Sign In</a>
          </h3>
        </div>
    </div>
  );
};



export default function PasswordRecovery() {
  return (
    <div className="passwordRecovery-container">
      <LogoHeader />
      <PasswordForm />
      <SliderSection />
    </div>
  );
};
