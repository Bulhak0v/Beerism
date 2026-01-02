import React, { useState } from "react";
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
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("https://beerism-backend.onrender.com/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setMessage(data.message || "Something went wrong.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="form-section">
        <div className="recovery_form">
          <h2>Forgot your password?</h2>
          
          {status === "success" ? (
            <div style={{textAlign: 'center', marginTop: '20px'}}>
              <div style={{fontSize: '50px', marginBottom: '10px'}}>📩</div>
              <h3 style={{color: '#5C4033', fontSize: '24px'}}>Email Sent!</h3>
              <p style={{fontSize: '18px', color: '#555'}}>
                We've sent a new password to <b>{email}</b>.<br/>
                Please check your inbox (and spam folder).
              </p>
              <button onClick={() => navigate("/auth")} style={{marginTop: '20px'}}>
                Return to Login
              </button>
            </div>
          ) : (
            <>
              <p>Enter your email so we can send reset instructions to you!</p>
              
              <div className="divider"></div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {status === "error" && (
                    <p style={{color: "#FF2A2A", fontWeight: "bold", textAlign: 'center'}}>
                        {message}
                    </p>
                )}

                <button type="submit" disabled={status === "loading"}>
                    {status === "loading" ? "Sending..." : "Reset password"}
                </button>
              </form>

              <h3>
                  Remembered your password?{" "}
                  <a onClick={() => navigate("/auth")}>Sign In</a>
              </h3>
            </>
          )}
        </div>
    </div>
  );
};

export default function PasswordRecovery() {
  return (
    <div className="passwordRecovery-container">
      <PasswordForm />
      <SliderSection />
    </div>
  );
};