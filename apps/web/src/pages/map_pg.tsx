import React, { useState, useCallback, useEffect, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import "../styles/map.css";

interface Location {
  location_id: string;
  name: string;
  description: string;
  adress: string;
  average_budget_requirment: "Low" | "Medium" | "High";
  city: string;
  closes_at: string;
  opens_at: string;
  latitude: number;
  longtitude: number;
  picture: string | null;
  rating: number;
  website: string;
}

const defaultCenter = {
  lat: 50.4501, 
  lng: 30.5234, 
};

const mapContainerStyle = {
  width: "100%",
  height: "100%", 
};

const MapPage = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeMarker, setActiveMarker] = useState<Location | null>(null);
  
  const [selectedBudget, setSelectedBudget] = useState<string>('');
  const [selectedAtmosphere, setSelectedAtmosphere] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyDi4S7u2L4oxzpOa3dNIyytp2Igly6fBVw", 
  });

  const fetchAllLocations = useCallback(async () => {
    try {
      const res = await fetch(`https://beerism-backend.onrender.com/api/locations`);
      if (!res.ok) throw new Error("Failed to fetch locations");
      const data: Location[] = await res.json();
      
      const validLocations = data.filter(loc => 
        typeof loc.latitude === 'number' && loc.latitude >= -90 && loc.latitude <= 90 &&
        typeof loc.longtitude === 'number' && loc.longtitude >= -180 && loc.longtitude <= 180
      );

      setLocations(validLocations);
    } catch (err: any) {
      setError(err.message || "Error fetching locations");
    }
  }, []);
  
  useEffect(() => {
    fetchAllLocations();
  }, [fetchAllLocations]);

  const filteredLocations = useMemo(() => {
    let current = locations;

    if (selectedBudget) {
        current = current.filter(loc => loc.average_budget_requirment === selectedBudget);
    }
    if (selectedStyle === 'Dunkel') {
        current = current.filter(loc => loc.description.toLowerCase().includes('темне') || loc.description.toLowerCase().includes('стаут'));
    } else if (selectedStyle === 'IPA') {
        current = current.filter(loc => loc.description.toLowerCase().includes('ipa') || loc.name.toLowerCase().includes('point'));
    }
    if (selectedAtmosphere === 'Historic') {
        current = current.filter(loc => loc.description.toLowerCase().includes('історична') || loc.city === 'Львів');
    } else if (selectedAtmosphere === 'Modern') {
        current = current.filter(loc => loc.description.toLowerCase().includes('модний') || loc.city === 'Одеса');
    }

    return current;
  }, [locations, selectedBudget, selectedStyle, selectedAtmosphere]);

  const mapCenter = useMemo(() => {
      if (filteredLocations.length > 0) {
          const avgLat = filteredLocations.reduce((sum, loc) => sum + loc.latitude, 0) / filteredLocations.length;
          const avgLng = filteredLocations.reduce((sum, loc) => sum + loc.longtitude, 0) / filteredLocations.length;
          return { lat: avgLat, lng: avgLng };
      }
      return defaultCenter;
  }, [filteredLocations]);

  return (
    <div className="map-page-container">

      <div className="map-content-wrapper">
        <div className="map-controls">
            <h1 className="map-page-title">Locations Map</h1>

            <div className="filter-container">
                <FilterDropdown 
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    options={[{ label: 'High Budget', value: 'High' }, { label: 'Medium Budget', value: 'Medium' }, { label: 'Low Budget', value: 'Low' }]}
                    defaultLabel="Select Budget" 
                />

                <FilterDropdown 
                    value={selectedAtmosphere}
                    onChange={(e) => setSelectedAtmosphere(e.target.value)}
                    options={[{ label: 'Historic', value: 'Historic' }, { label: 'Modern', value: 'Modern' }, { label: 'Cozy', value: 'Cozy' }]}
                    defaultLabel="Select Atmosphere" 
                />

                <FilterDropdown 
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    options={[{ label: 'Dunkel', value: 'Dunkel' }, { label: 'IPA', value: 'IPA' }, { label: 'Lager', value: 'Lager' }]}
                    defaultLabel="Select Style"
                />
                
                <button className="back-btn" onClick={() => navigate("/home")}>
                    ← Back
                </button>
            </div>
        </div>
        
        {error && <p style={{ color: 'red' }}>Error loading data: {error}</p>}
        
        {filteredLocations.length === 0 && (selectedBudget || selectedStyle || selectedAtmosphere) && (
             <p style={{ color: '#5C4033' }}>No locations found for current filters.</p>
        )}
        
        <div className="map-wrapper">
            {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter} 
                    zoom={ filteredLocations.length > 1 ? 6 : 10 } 
                    options={{ 
                        disableDefaultUI: false, 
                        styles: [
                            { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
                            { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
                            { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
                            { featureType: "landscape", stylers: [{ color: "#e6ffe6" }] }
                        ],
                    }}
                    onClick={() => setActiveMarker(null)}
                >
                    {filteredLocations.map((location) => (
                        <Marker
                            key={location.location_id}
                            position={{
                                lat: location.latitude,
                                lng: location.longtitude,
                            }}
                            title={location.name} 
                            onClick={() => setActiveMarker(location)}
                        />
                    ))}

                    {activeMarker && (
                        <InfoWindow
                            position={{ lat: activeMarker.latitude, lng: activeMarker.longtitude }}
                            onCloseClick={() => setActiveMarker(null)}
                        >
                            <div className="map-info-card">
                                
                                <div className="map-info-image-container">
                                    <img 
                                        src={activeMarker.picture || "/beer1.jpg"} 
                                        alt={activeMarker.name} 
                                        className="map-info-image"
                                        onError={(e) => { e.currentTarget.src = "/beer1.jpg"; }}
                                    />
                                    <h3 className="map-info-title">{activeMarker.name}</h3>
                                </div>

                                <div className="map-info-content">
                                    <p className="info-window-desc">
                                        {activeMarker.description.length > 80 
                                            ? activeMarker.description.substring(0, 80) + "..." 
                                            : activeMarker.description}
                                    </p>
                                    <ul className="info-window-list">
                                        <li>⭐ Rating: {activeMarker.rating}</li>
                                        <li>💰 Budget: {activeMarker.average_budget_requirment}</li>
                                        <li>🏙️ Address: {activeMarker.adress}, {activeMarker.city}</li>
                                        <li>⏱️ Hours: {activeMarker.opens_at.substring(0, 5)} - {activeMarker.closes_at.substring(0, 5)}</li>
                                        <li>
                                            🌐 <a href={activeMarker.website} target="_blank" rel="noopener noreferrer">Visit Website</a>
                                        </li>
                                    </ul>
                                    
                                    <button 
                                        className="map-details-btn"
                                        onClick={() => navigate(`/locationDetails/${activeMarker.location_id}`)}
                                    >
                                        View Full Details
                                    </button>
                                </div>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            ) : (
                <div className="loading-map">
                    <p>Loading Google Maps API...</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

interface DropdownOption {
    label: string;
    value: string;
}

interface FilterDropdownProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: DropdownOption[];
    defaultLabel: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ value, onChange, options, defaultLabel }) => {
    return (
        <select value={value} onChange={onChange} className="filter-select">
            <option value="">{defaultLabel}</option>
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export default MapPage;