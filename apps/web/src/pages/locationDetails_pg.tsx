import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LogoHeader from "../components/logoHeader";
import "../styles/locationDetails.css";
import LocationImage from "../components/locationImage";
import ReviewModal from "../components/reviewModal";
import "../styles/reviews.css";
import avatarPlaceholder from "/avatar_placeholder.png";
import { useAuth } from "../components/authProvider";

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

interface BeerStyle {
    beer_style_id: number;
    beer_style_name: string;
}

interface LocationDetails extends Location {
    atmospheres: string[];
    beer_styles: BeerStyle[];
}

interface Review {
    review_id: number;
    user_id: number;
    rating: number;
    review_text: string;
    created_at: string;
    nickname: string;
    profile_picture: string | null;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const percentage = Math.min(100, Math.max(0, (rating / 5) * 100));

  return (
    <div className="star-rating-wrapper" title={`Rating: ${rating}`}>
      <div className="star-rating-base">★★★★★</div>
      <div className="star-rating-fill" style={{ width: `${percentage}%` }}>
        ★★★★★
      </div>
    </div>
  );
};

const LocationDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [location, setLocation] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [userReview, setUserReview] = useState<Review | null>(null);
    const [editingReviewData, setEditingReviewData] = useState<any>(null);
  const fetchReviews = async () => {
        if (!id) return;
        try {
            const res = await fetch(`https://beerism-backend.onrender.com/api/reviews/${id}`);
            if (res.ok) {
                const data: Review[] = await res.json();
                setReviews(data);
                
                if (user) {
                    const found = data.find(r => r.user_id === user.user_id);
                    setUserReview(found || null);
                }
            }
        } catch (e) { console.error(e); }
    };
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
    fetchReviews();
  }, [id, user]);

  const parseRichText = (text: string) => {
        const parts = text.split(/(<b>.*?<\/b>|<i>.*?<\/i>)/g);
        
        return parts.map((part, index) => {
            if (part.startsWith("<b>") && part.endsWith("</b>")) {
                return <b key={index}>{part.replace(/<\/?b>/g, "")}</b>;
            }
            if (part.startsWith("<i>") && part.endsWith("</i>")) {
                return <i key={index}>{part.replace(/<\/?i>/g, "")}</i>;
            }
            return part;
        });
    };

    const handleEditClick = (review: Review) => {
        setEditingReviewData({
            review_id: review.review_id,
            rating: review.rating,
            text: review.review_text
        });
        setIsReviewModalOpen(true);
    };

    const handleDeleteClick = async (reviewId: number) => {
        if (!user || !window.confirm("Delete this review?")) return;
        try {
            const res = await fetch(`https://beerism-backend.onrender.com/api/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.user_id })
            });
            if (res.ok) fetchReviews();
        } catch (e) { console.error(e); }
    };

    const handleOpenModal = () => {
        setEditingReviewData(null);
        setIsReviewModalOpen(true);
    };

    const renderStars = (rating: number) => {
        return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
    };

  const [activeTab, setActiveTab] = useState<"info" | "reviews">("info");

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "N/A";
    return timeString.slice(0, 5);
  };

  if (!location) {
    return (
      <>
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
      <div className="locationDetails-main">
        <div className="topTitle">
            <h2>Location: {location.name}</h2>
            <button className="backButton" onClick={() => navigate("/locations")}>
              <span><img src="/profileIcons/Arrow.svg" alt="back"></img></span> Back
            </button>
        </div>
        
        <div className="details-card">
          
          <div className="details-image-container">
            <LocationImage 
                src={location.picture} 
                alt={location.name} 
                locationId={location.location_id}
                className="details-image"
            />
            
            <h2 className="details-title">{location.name}</h2>
          </div>

          <div className="details-content">
            
            <div className="details-rating">
              <span className="rating-number">{location.rating.toFixed(2).replace(".", ",")}</span>
              <StarRating rating={location.rating} />
            </div>

            <p className="details-description">
              {location.description ??
                `${location.name} is a wonderful place offering great experiences.`}
            </p>

            <div className="details-meta">

              <p>
                  <strong>Atmosphere: </strong> 
                  {location.atmospheres && location.atmospheres.length > 0 
                    ? location.atmospheres.join(", ") 
                    : "Not specified"} 🏛️
              </p>

              <p>
                  <strong>Beer Styles: </strong>
                  {location.beer_styles && location.beer_styles.length > 0
                    ? location.beer_styles.map((b: any) => b.beer_style_name).join(", ")
                    : "Unknown"} 🍺
              </p>

              <p><strong>Budget Range:</strong> {location.average_budget_requirment ?? "High $"}</p>
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
                <p>🕒 <strong>Opens at:</strong> {formatTime(location.opens_at)}</p>
                <p>🕓 <strong>Closes at:</strong> {formatTime(location.closes_at)}</p>
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
                {!userReview ? (
                         <button className="leave-review-btn-large" onClick={handleOpenModal}>
                             Leave a Review
                         </button>
                    ) : (
                        <div style={{marginBottom: '20px', fontStyle: 'italic', color: '#555'}}>
                            You have already reviewed this location. Check your review below to edit.
                        </div>
                    )}

                    {reviews.length === 0 && <p>No reviews yet.</p>}
                    
                    {reviews.map(review => (
                        <div key={review.review_id} className="review-item">
                            <div className="review-header">
                                <img 
                                    src={review.profile_picture || avatarPlaceholder} 
                                    alt="User" 
                                    className="review-avatar"
                                />
                                <span className="review-author">{review.nickname}</span>
                            </div>
                            <div className="review-meta">
                                <span className="review-stars">{renderStars(review.rating)}</span>
                                <span className="review-date">
                                    {new Date(review.created_at).toLocaleDateString("de-DE")}
                                </span>
                            </div>
                            
                            <div className="review-text">
                                {parseRichText(review.review_text)}
                            </div>

                            {user && user.user_id === review.user_id && (
                                <div className="review-actions">
                                    <button className="review-action-btn btn-edit" onClick={() => handleEditClick(review)}>
                                        Edit
                                    </button>
                                    <button className="review-action-btn btn-delete" onClick={() => handleDeleteClick(review.review_id)}>
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            {location && (
                <ReviewModal 
                    isOpen={isReviewModalOpen} 
                    onClose={() => setIsReviewModalOpen(false)}
                    locationId={location.location_id}
                    locationName={location.name}
                    onReviewAdded={fetchReviews}
                    initialData={editingReviewData}
                />
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
