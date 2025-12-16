import React from "react";
import "../styles/about.css";

const AboutPage: React.FC = () => {
  return (
    <div className="about-page-container">
      
      <section className="about-hero">
        <h1>About <span className="highlight-text">Beerism</span></h1>
        <p className="hero-subtitle">
          Beerism was created by people who truly love beer, bars,
          and discovering new places with friends.
        </p>
      </section>

      <section className="about-split-section">
        <div className="about-text-content">
          <h2>Who are we?</h2>
          <p>
            We are beer enthusiasts, explorers, and a little bit
            adventurers. For us, beer is not just a drink — it’s
            a culture, a story, and a reason to discover new places.
            Our team travels far and wide, tasting craft beers,
            chatting with bartenders, and collecting stories from
            local pubs. We are passionate about sharing this
            experience with everyone who joins Beerism.
          </p>
        </div>
        <div className="about-image-wrapper">
            <img src="/beer-glass.jpg" alt="Glass of beer" className="about-img" /> 
        </div>
      </section>

      <section className="about-split-section dark-theme rounded-section">
        <div className="about-image-wrapper logo-wrapper">
          <img src="/logo.svg" alt="Beerism Logo" className="about-logo-img"/>
        </div>

        <div className="about-text-content">
          <h2>Why Beerism?</h2>
          <p>
            We wanted an app that combines bars, beer routes, quests,
            and fun challenges. Beerism is more than just a guide —
            it’s an adventure companion. Whether you’re exploring
            your own city or traveling abroad, Beerism helps you
            find hidden gems, track your quests, and earn rewards
            for your discoveries.
          </p>
        </div>
      </section>

      <section className="about-steps-section">
        <h2>How It Works</h2>
        <p className="section-intro">
            Explore Beerism step by step and see how easy it is to discover bars, create routes, take notes, and complete quests.
        </p>
        
        <div className="steps-grid">
            <div className="step-card">
                <div className="step-icon">📍</div>
                <h3>Find Bars Nearby</h3>
                <p>Discover local bars wherever you are and see their ratings, reviews, and specialties.</p>
            </div>

            <div className="step-card">
                <div className="step-icon">🗺️</div>
                <h3>Build Routes</h3>
                <p>Create beer routes with multiple bar stops and plan your perfect night out.</p>
            </div>

            <div className="step-card">
                <div className="step-icon">📝</div>
                <h3>Save Notes</h3>
                <p>Add personal notes to your routes and remember your favorite drinks or experiences.</p>
            </div>

            <div className="step-card">
                <div className="step-icon">🏆</div>
                <h3>Complete Quests</h3>
                <p>Take on fun challenges, earn XP, and level up as you explore new bars and routes.</p>
            </div>
        </div>
      </section>

       <section className="about-split-section dark-theme rounded-section flush-image-container">
        <div className="about-text-content padding-fix">
            <h2>Join the Adventure</h2>
            <p>
                Beerism is more than an app — it’s a community of beer lovers, adventurers, 
                and friends exploring new bars together. Ready to start your journey? Grab a pint, gather your friends, and let the adventure begin!
            </p>
        </div>
        <div className="about-image-wrapper full-stretch">
            <img src="/beer-cheers2.jpg" alt="Cheers" className="about-img cover-full"/>
        </div>
      </section>

      <footer className="about-footer">
        <p>Made with care and good vibes by beer lovers for beer lovers.</p>
        <p>
            Follow us on {' '}
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
        </p>
      </footer>

    </div>
  );
};

export default AboutPage;