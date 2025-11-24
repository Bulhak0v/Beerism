import React, { useState, useCallback, useEffect, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import "../styles/map.css";
import { RouteData, useAuth } from "../components/authProvider";

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
  const { addRoute, user, routes, updateRoute} = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeMarker, setActiveMarker] = useState<Location | null>(null);
  
  const [selectedBudget, setSelectedBudget] = useState<string>('');
  const [selectedAtmosphere, setSelectedAtmosphere] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');

  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState(false);
  const [isCreatingNewRoute, setIsCreatingNewRoute] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [selectedStops, setSelectedStops] = useState<RouteStop[]>([]);
  const [routeName, setRouteName] = useState('Route #1');
  const [routeDescription, setRouteDescription] = useState('This is an example description of a route');
  const [travelMode, setTravelMode] = useState<'Walking' | 'Driving' | 'Bicycling'>('Walking');

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

  const focusStop = useCallback((stop: RouteStop) => {
    setActiveMarker(stop); 
    
    }, []);
 const toggleStop = useCallback((location: Location) => {
    setSelectedStops(prevStops => {
        const isAlreadyAdded = prevStops.some(stop => stop.location_id === location.location_id);

        if (isAlreadyAdded) {
            return prevStops.filter(stop => stop.location_id !== location.location_id);
        } else {
            if (prevStops.length >= 10) {
                alert("Maximum number of stops reached (10).");
                return prevStops;
            }
            
            const newRouteStop: RouteStop = {
                ...location,
                note: "", 
            };
            
            return [...prevStops, newRouteStop];
        }
        });
    }, []);
    const updateStopNote = useCallback((locationId: string, newNote: string) => {
        setSelectedStops(prevStops => 
            prevStops.map(stop => 
                stop.location_id === locationId ? { ...stop, note: newNote } : stop
            )
        );
    }, []);

    const saveRoute = useCallback(() => {
        if (!user) {
            alert("You must be logged in to save a route.");
            return;
        }

        if (!routeName.trim()) {
            alert("Please provide a name for your route.");
            return;
        }

        if (selectedStops.length === 0) {
            alert("Please select at least one stop for your route.");
            return;
        }

        const stopsWithNotes = selectedStops.map(stop => ({
            location_id: stop.location_id,
            note: stop.note.trim(),
        }));

       const routePayload: Omit<RouteData, 'client_route_id'> & { client_route_id?: string } = {
            name: routeName.trim(),
            description: routeDescription.trim(),
            travel_mode: travelMode,
            stops: stopsWithNotes,
        }; 

       if (editingRouteId) {
            routePayload.client_route_id = editingRouteId;
            updateRoute(routePayload as RouteData);
            alert(`Route '${routeName.trim()}' updated successfully!`);
        } else {
            addRoute(routePayload as Omit<RouteData, 'client_route_id'>); 
            alert(`Route '${routeName.trim()}' saved successfully!`);
        }
        
        setRouteName(`Route #${Date.now().toString().slice(-4)}`);
        setRouteDescription('');
        setTravelMode('Walking');
        setSelectedStops([]);
        setIsCreatingNewRoute(false);
        
    }, [routeName, routeDescription, travelMode, selectedStops, editingRouteId, updateRoute, addRoute, user, 
    setRouteName, setRouteDescription, setSelectedStops, setIsCreatingNewRoute, setEditingRouteId]);



   const loadRoute = useCallback((route: RouteData) => {
    
    const stopsToLoad: RouteStop[] = route.stops 
            .map(savedStop => {
                const fullLocation = locations.find(loc => loc.location_id === savedStop.location_id);
                
                if (fullLocation) {
                    const routeStop: RouteStop = {
                        ...fullLocation,
                        note: savedStop.note || '', 
                    };
                    return routeStop;
                }
                return undefined; 
            })
            .filter((stop): stop is RouteStop => stop !== undefined);

        setRouteName(route.name);
        setRouteDescription(route.description);
        setTravelMode(route.travel_mode);
        
        setSelectedStops(stopsToLoad); 
        setIsCreatingNewRoute(true); 
        setEditingRouteId(route.client_route_id);
        
    }, [locations, setRouteName, setRouteDescription, setTravelMode, setSelectedStops, setIsCreatingNewRoute, setEditingRouteId]);


    const resetRouteCreationState = useCallback(() => {
        const newRouteName = `Route #${Date.now().toString().slice(-4)}`; 

        setRouteName(newRouteName);
        setRouteDescription('This is an example description of a route');
        setTravelMode('Walking');
        setSelectedStops([]);
        setEditingRouteId(null); 
    }, [setRouteName, setRouteDescription, setTravelMode, setSelectedStops, setEditingRouteId]);


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
                <button className="route-planning-btn" onClick={() => setIsRoutePlannerOpen(true)}>Routes <img src="/Compass.png"></img></button>
           
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
            {isRoutePlannerOpen && (
                        <RoutePlannerPanel 
                            isRoutePlannerOpen={isRoutePlannerOpen}
                            setIsRoutePlannerOpen={setIsRoutePlannerOpen}
                            isCreatingNewRoute={isCreatingNewRoute}
                            setIsCreatingNewRoute={setIsCreatingNewRoute}
                            selectedStops={selectedStops} 
                            toggleStop={toggleStop}    
                            userRoutes={routes}
                            routeName={routeName}
                            setRouteName={setRouteName}
                            routeDescription={routeDescription}
                            setRouteDescription={setRouteDescription}
                            travelMode={travelMode}
                            updateStopNote={updateStopNote}
                            setTravelMode={setTravelMode}
                            loadRoute={loadRoute}
                            saveRoute={saveRoute}
                            focusStop={focusStop}
                            resetRouteCreationState={resetRouteCreationState}
                        />
                    )}
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
                                    <button 
                                        className="map-route-toggle-btn"
                                        onClick={() => {
                                            if (activeMarker) {
                                                toggleStop(activeMarker);
                                            }
                                        }}
                                    >
                                        {selectedStops.some(stop => stop.location_id === activeMarker.location_id) 
                                            ? 'Remove from Route' 
                                            : 'Add to Route'}
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
interface RouteStop extends Location {
    note: string; 
}
interface RoutePlannerPanelProps {
    isRoutePlannerOpen: boolean;
    setIsRoutePlannerOpen: (isOpen: boolean) => void;
    isCreatingNewRoute: boolean;
    setIsCreatingNewRoute: (isCreating: boolean) => void;
    loadRoute: (route: RouteData) => void;
    userRoutes: RouteData[];
    selectedStops: RouteStop[];
    toggleStop: (location: Location) => void;
    routeName: string;
    setRouteName: (name: string) => void;
    focusStop: (stop: RouteStop) => void;
    routeDescription: string;
    updateStopNote: (locationId: string, newNote: string) => void;
    setRouteDescription: (desc: string) => void;
    travelMode: 'Walking' | 'Driving' | 'Bicycling';
    setTravelMode: (mode: 'Walking' | 'Driving' | 'Bicycling') => void;
    resetRouteCreationState: () => void;
    saveRoute: () => void;
}

const RoutePlannerPanel: React.FC<RoutePlannerPanelProps> = ({
    setIsRoutePlannerOpen,
    isCreatingNewRoute,
    setIsCreatingNewRoute,
    selectedStops,
    userRoutes,
    toggleStop,
    routeName, setRouteName,
    loadRoute,
    routeDescription, setRouteDescription,
    travelMode, setTravelMode,
    saveRoute, 
    focusStop,
    updateStopNote,
    resetRouteCreationState
}) => {

    const handleClose = () => {
        setIsRoutePlannerOpen(false);
        setIsCreatingNewRoute(false); 
    };
    
    const handleBackToList = () => {
        setIsCreatingNewRoute(false);
    };

    const handleCreateNewRoute = () => {
        resetRouteCreationState();
        setIsCreatingNewRoute(true);
    };

    return (
        <div className="route-planner-panel">
            <div className="route-planner-header">
                <h3>Route Planner</h3>
                <button className="close-btn" onClick={handleClose}>
                    &times; 
                </button>
            </div>
            
            {!isCreatingNewRoute ? (
                <div className="route-list-view">
                    {userRoutes.length === 0 ? (
                        <p className="route-list-message">
                            You have no saved routes. Create a new one!
                        </p>
                    ) : (
                        <div className="saved-routes-container">
                            <h4>Saved Routes ({userRoutes.length})</h4>
                            {userRoutes.map((route) => (
                                <div 
                                    key={route.client_route_id} 
                                    className="saved-route-item"
                                    onClick={() => loadRoute(route)}
                                >
                                    <span className="route-name">{route.name}</span>
                                    <span className="route-mode"> ({route.travel_mode}) </span>
                                    <span className="route-stops-count">{route.stops?.length || 0} stops</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <button 
                        className="create-new-route-btn" 
                        onClick={handleCreateNewRoute}
                    >
                        + Create new route
                    </button>
                </div>
            ) : (
                <div className="route-creation-form">
                    
                    <label htmlFor="routeName">Name</label>
                    <input 
                        type="text" 
                        id="routeName" 
                        value={routeName} 
                        onChange={(e) => setRouteName(e.target.value)}
                        placeholder="Route #1" 
                    />

                    <label htmlFor="routeDescription">Description</label>
                    <textarea 
                        id="routeDescription" 
                        value={routeDescription} 
                        onChange={(e) => setRouteDescription(e.target.value)}
                        placeholder="This is an example description of a route"
                    ></textarea>
                   
                    
                    <label htmlFor="travelMode">Travel Mode</label>
                    <select 
                        id="travelMode" 
                        value={travelMode}
                        onChange={(e) => setTravelMode(e.target.value as 'Walking' | 'Driving' | 'Bicycling')}
                    >
                        <option value="Walking">Walking</option>
                        <option value="Driving">Driving</option>
                        <option value="Bicycling">Bicycling</option>
                    </select>

                   <p className={selectedStops.length === 0 ? "stops-info" : "stops-info-active"}>
                        Stops ({selectedStops.length})
                        <br />
                        {selectedStops.length === 0 
                            ? 'Click "Add to Route" on any marker to add it as a stop.'
                            : ''
                        }
                    </p>
                    <div className="stops-list-container">
                        {selectedStops.map((stop, index) => (
                            <div 
                                key={stop.location_id} 
                                className="stop-item" 
                                onClick={() => focusStop(stop)}
                            >
                                <span className="stop-name">{index + 1}. {stop.name}</span>
                                <button 
                                    className="stop-delete-btn"
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        toggleStop(stop);
                                    }} 
                                >
                                    <img src="/Trash.png"></img>
                                </button>
                                <input
                                    type="text"
                                    className="stop-note-input"
                                    placeholder="Add note (e.g. try that beer)"
                                    value={stop.note}
                                    onFocus={(e) => e.stopPropagation()} 
                                    onChange={(e) => updateStopNote(stop.location_id, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                    <button 
                        className="save-route-btn" 
                        onClick={saveRoute}
                    >
                        Save Route
                    </button>
                    <button 
                        className="back-to-list-btn" 
                        onClick={handleBackToList}
                    >
                        ← Back to route list
                    </button>
                </div>
            )}
        </div>
    );
};

export default MapPage;