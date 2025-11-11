import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LogoHeader from "../components/logoHeader";
import "../styles/locationDetails.css";

interface Location {
  location_id: number;
  name: string;
  description: string | null;
  city: string | null;
  address: string | null;
  website: string | null;
  rating: number;
  average_budget_requirment: string | null;
  opens_at: string | null;
  closes_at: string | null;
  latitude: number;
  longtitude: number;
  picture: string;
}

const LocationDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (!id) return; 

      try {
        const res = await fetch(
          `https://beerism-backend.onrender.com/api/locations/${id}`
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch location: ${res.statusText}`);
        }
        
        const data: Location = await res.json();
        setLocation(data);
      } catch (err: any) {
        setError(err.message);
      } 
    };

    fetchLocationDetails();
  }, [id]);

  const [activeTab, setActiveTab] = useState<"info" | "reviews">("info");

  if (!location) {
    return (
      <>
        <LogoHeader />
        <div className="locationDetails-main">
          <div className="locations-cover">
                <div className="topTitle">
                    <h2>No location data available.</h2>
                    <button className="backButton" onClick={() => navigate("/locations")}><span><img src="/profileIcons/Arrow.svg"></img></span> Back</button>
                </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <LogoHeader />
      <div className="locationDetails-main">
        <div className="topTitle">
            <h2>Location: {location.name}</h2>
            <button className="backButton" onClick={() => navigate("/locations")}><span><img src="/profileIcons/Arrow.svg"></img></span> Back</button>
        </div>
        <div className="details-card">
          <img
            src={location.picture}
            alt={location.name}
            className="details-image"
          />

          <div className="details-content">
            <h2 className="details-title">{location.name}</h2>

            <div className="details-rating">
              <span>{location.rating.toFixed(2).replace(".", ",")}</span>
              <span className="stars">★★★★☆</span>
            </div>

            <p className="details-description">
              {location.description ??
                `${location.name} is a wonderful place offering great experiences.`}
            </p>

            <div className="details-meta">
              <p>Atmosphere Style: Historic 🏛️</p>
              <p>Beer Style: (Dunkel) 🍺</p>
              <p>Budget Range:{location.average_budget_requirment ?? "High $"}</p>
            </div>

            <div className="details-tabs">
              <button
                className={activeTab === "info" ? "active" : ""}
                onClick={() => setActiveTab("info")}
              >
                Information
              </button>
              <button
                className={activeTab === "reviews" ? "active" : ""}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews
              </button>
            </div>

            {activeTab === "info" ? (
              <div className="tab-content">
                <p>📍 <strong>Address:</strong> {location.address ?? "Unknown"}</p>
                <p>🕒 <strong>Opens at:</strong> {location.opens_at ?? "N/A"}</p>
                <p>🕓 <strong>Closes at:</strong> {location.closes_at ?? "N/A"}</p>
                {location.website && (
                  <p>
                    🌐 <strong>Website:</strong>{" "}
                    <a href={location.website} target="_blank" rel="noreferrer">
                      {location.website}
                    </a>
                  </p>
                )}
              </div>
            ) : (
              <div className="tab-content">
                <p>No reviews yet.</p>
              </div>
            )}

            <div className="details-map">
              <iframe
                title="Location Map"
                width="100%"
                height="310"
                frameBorder="0"
                src={`https://maps.google.com/maps?q=${location.latitude},${location.longtitude}&z=15&output=embed`}
              ></iframe>
            </div>
          
          </div>
        </div>
      </div>
    </>
  );
};

export default LocationDetailsPage;
