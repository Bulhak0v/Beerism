import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

import listScreenshot from "/beer1.jpg";
import mapScreenshot from "/beer2.svg";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      
      <section className="feature-section">
        <div className="feature-content">
          <div className="feature-tag">Discover</div>
          <h1 className="feature-title">Find your perfect pint.</h1>
          <p className="feature-description">
            Browse through a curated list of the best pubs and breweries in the city. 
            Filter by rating, budget, or atmosphere to find exactly what you are looking for.
            Read reviews and check ratings before you go.
          </p>
          <button className="feature-button" onClick={() => navigate("/locations")}>
            Browse Locations <span>→</span>
          </button>
        </div>
        
        <div className="feature-image-wrapper">
          <img src={listScreenshot} alt="Locations List Interface" className="feature-image" />
        </div>
      </section>

      <section className="feature-section reversed">
        <div className="feature-content">
          <div className="feature-tag">Explore</div>
          <h1 className="feature-title">Navigate with ease.</h1>
          <p className="feature-description">
            Visualize beer spots near you with our interactive map. 
            Click on markers to see quick details, check opening hours, 
            and get directions instantly. Never get lost on your way to a good drink.
          </p>
          <button className="feature-button" onClick={() => navigate("/map")}>
            Go to Map <span>→</span>
          </button>
        </div>
        
        <div className="feature-image-wrapper">
          <img src={mapScreenshot} alt="Map Interface" className="feature-image" />
        </div>
      </section>

    </div>
  );
};

export default HomePage;