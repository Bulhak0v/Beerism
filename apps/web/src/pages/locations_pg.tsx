import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/locations.css';
import { useAuth } from "../components/authProvider"; 

const FALLBACK_PICTURES = [
  "/beer1.jpg",
  "/beer2.svg",
  "/beer3.jpg",
  "/beer4.jpg",
  "/beer5.jpg"
];

const LocationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);

  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;


  const fetchAllLocations = useCallback(async () => {
    try {
      // Temporary, remove after proper user geolocation is implemented. 
      let city = encodeURIComponent("Київ");

      if (searchTerm)
      {
        city = encodeURIComponent(searchTerm);
      }

      const res = await fetch(`https://beerism-backend.onrender.com/api/locations/recommendations/byCity?user_id=${user!.user_id}&city=${city}}`);
      if (!res.ok) {
        throw new Error('Failed to fetch locations');
      }
      const data = await res.json();
      setLocations(data);
      setCurrentPage(1); 
    } catch (err: any) {
      setError(err.message || "Error fetching locations");
    }
  }, []);

  useEffect(() => {
    fetchAllLocations();
  }, [fetchAllLocations]);

 useEffect(() => {
    if (searchTerm === "") {
        setFilteredLocations(locations); 
    } else {
        const lowerSearch = searchTerm.toLowerCase();
        setFilteredLocations(locations.filter(item => 
            item.name.toLowerCase().includes(lowerSearch) ||
            (item.city && item.city.toLowerCase().includes(lowerSearch)) ||
            item.rating.toString().includes(lowerSearch)
        ));
      }
    setCurrentPage(1);
  }, [locations, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
    setSearchTerm(e.target.value);
  };

  const paginatedLocations = filteredLocations.slice(
      (currentPage - 1) * itemsPerPage, 
      currentPage * itemsPerPage
  );


  return (
    <>
       <div className="locations-main">
        <div className="topTitle">
          <h2>Locations</h2>
          <button className="backButton" onClick={() => navigate("/home")}>
            <span><img src="/profileIcons/Arrow.svg" alt="back"></img></span> Back
          </button>
        </div>

        <div className="locations-cover">
            <div className="search-and-pagination">
              
              <div className="search-bar-container">
                <div className="search-bar"> 
                  <form className="search-form" onSubmit={(e) => e.preventDefault()}>
                    <input
                      type="text"
                      placeholder="Search (name, city, rating...)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      autoComplete="off"
                    /> 
                  </form>
                  <button 
                    type="button" 
                    className="searchButton"
                    onClick={() => setSearchTerm(searchTerm.trim())}
                  />
                </div>
              </div>
             
              <PaginationControls
                currentPage={currentPage}
                totalPages={Math.ceil(filteredLocations.length / itemsPerPage)}
                onPageChange={setCurrentPage}
              />
            </div>
            
            <div className="locations-card">
            {paginatedLocations.map(location => {
              return (
                <LocationCard 
                  key={location.location_id} 
                  location={location} 
                  onClick={(location) => navigate(`/locationDetails/${location.location_id}`)} 
                />
              );
            })}
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
    picture: string | null;
}

interface LocationCardProps {
  location: Location;
  onClick?: (location: Location) => void;
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

const LocationCard: React.FC<LocationCardProps> = ({ location, onClick }) => {
  const pictureIndex = (location.location_id - 1) % FALLBACK_PICTURES.length;

  return (
    <div className="location-card"  onClick={() => onClick && onClick(location)}>
      <img src={FALLBACK_PICTURES[pictureIndex]} className="location-image" alt={location.name} />
      <div className="location-info">
        <div className="location-info-title">
          <div className="location-info-titleName">{location.name}</div>
          <span className="location-rating-value">{location.rating.toFixed(2).replace('.', ',')}</span>
          <StarRating rating={location.rating} />
        </div>
        
        <p className="location-description">{location.description ?? "No description available"}</p>
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
      pageNumbers.push(-1); 
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