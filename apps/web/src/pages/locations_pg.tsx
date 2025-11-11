import React, { useState, useEffect } from "react"; 
import LogoHeader from "../components/logoHeader";
import { useNavigate } from "react-router-dom";
import '../styles/locations.css';
import { useAuth } from "../components/authProvider"; 

const LocationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, []);
  
    useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user || !userLocation) return;

      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.latitude}&lon=${userLocation.longitude}&zoom=10&addressdetails=1`,
          { headers: { "User-Agent": "beerism-app" } }
        );
        const geoData = await geoRes.json();
        const city =
          geoData.address?.city ||
          geoData.address?.town ||
          geoData.address?.village ||
          geoData.address?.county ||
          "Unknown";

        const res = await fetch(
          `https://beerism-backend.onrender.com/api/locations/recommendations/byCity?user_id=${user.user_id}&city=${encodeURIComponent(
            city
          )}`
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch recommendations: ${res.statusText}`);
        }

        const data = await res.json();
        setLocations(data);
      } catch (err: any) {
        setError(err.message || "Error fetching recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userLocation, user]);


    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
        setSearchTerm(e.target.value);
        setCurrentPage(1); 
  };

  return (
    <>
      <LogoHeader />
       <div className="locations-main">
        <div className="topTitle">
          <h2>Locations</h2>
          <button className="backButton" onClick={() => navigate("/profile")}><span><img src="/profileIcons/Arrow.svg"></img></span> Back</button>
        </div>

        <div className="locations-cover">
            <div className="search-and-pagination">
              <div className="search-bar"> 
                <input
                  type="text"
                  placeholder="Search (name, city, rating...)"
                  value={searchTerm}
                  onChange={handleSearchChange}
                /> 
                <button className="searchButton"></button>
              </div>

              <PaginationControls
                currentPage={currentPage}
                totalPages={Math.ceil(locations.length / itemsPerPage)}
                onPageChange={setCurrentPage}
              />
            </div>
            
            <div className="locations-card">
                {locations.map(location => (
                    <LocationCard 
                      key={location.location_id} 
                      location={location} 
                      onClick={(location) => navigate(`/locationDetails/${location.location_id}`, { state: { location } })} 
                    />

                ))}
            </div>
        </div>
         
      </div>
    </>
  );
};

export default LocationsPage;

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
}

interface LocationCardProps {
  location: Location;
  onClick?: (location: Location) => void;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="star-rating">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`}>★</span>
      ))}
      {halfStar && <span>☆</span>}

      {[...Array(Math.max(0, emptyStars))].map((_, i) => (
        <span key={`empty-${i}`} className="star-empty">★</span> 
      ))}
    </div>
  );
};

const LocationCard: React.FC<LocationCardProps> = ({ location, onClick }) => {
  return (
    <div className="location-card"  onClick={() => onClick && onClick(location)}>
      <img src="/placeholder-image.png" className="location-image" />
      <div className="location-info">
        <div className="location-info-title">
          <div className="location-info-titleName">{location.name}</div>
          <span className="location-rating-value">{location.rating.toFixed(2).replace('.', ',')}</span>
          <StarRating rating={location.rating} />
        </div>
        
        <p>{location.description ?? "No description available"}</p>
        <div className="location-meta">
          <span>City: {location.city ?? "Unknown"}</span>
          <span>Address: {location.address ?? "Unknown"}</span>
          <span>Budget: {location.average_budget_requirment ?? "N/A"}</span>
        </div>
      </div>
    </div>
  );
};
interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  const maxPagesToShow = 5;

  if (totalPages <= maxPagesToShow + 2) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    pageNumbers.push(1);
    if (currentPage > 3) {
      pageNumbers.push(-1); 
    }
    

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage === 1) end = 3;
    if (currentPage === totalPages) start = totalPages - 2;

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }

    if (currentPage < totalPages - 2) {
      pageNumbers.push(-1); // "..."
    }
    pageNumbers.push(totalPages);
  }


  return (
    <div className="pagination-controls">
      {pageNumbers.map((num, index) => 
        num === -1 ? (
          <span key={`ellipsis-${index}`} className="page-ellipsis">...</span>
        ) : (
          <button 
            key={num}
            onClick={() => onPageChange(num)}
            className={`page-number ${currentPage === num ? 'active' : ''}`}
          >
            {num}
          </button>
        )
      )}

      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
        className="page-arrow"
      >
        &gt;
      </button>
    </div>
  );
};

