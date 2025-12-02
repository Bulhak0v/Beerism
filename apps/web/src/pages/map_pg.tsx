import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/map.css";
import { RouteData, useAuth } from "../components/authProvider";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

const BeerIcon = L.icon({
    iconUrl: '/profileIcons/Beer.svg', 
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40],
});

const defaultCenter: [number, number] = [50.4501, 30.5234];

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

interface RouteStop extends Location {
  note: string;
}

const MapPage = () => {
  const navigate = useNavigate();
  const { addRoute, user, routes, updateRoute, deleteRoute } = useAuth();
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState<string | null>(null);
  
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

  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [routeStats, setRouteStats] = useState<{ time: string; distance: string } | null>(null);

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
  
  useEffect(() => { fetchAllLocations(); }, [fetchAllLocations]);

  const filteredLocations = useMemo(() => {
    let current = locations;
    if (selectedBudget) current = current.filter(loc => loc.average_budget_requirment === selectedBudget);
    if (selectedStyle === 'Dunkel') current = current.filter(loc => loc.description.toLowerCase().includes('темне') || loc.description.toLowerCase().includes('стаут'));
    else if (selectedStyle === 'IPA') current = current.filter(loc => loc.description.toLowerCase().includes('ipa') || loc.name.toLowerCase().includes('point'));
    if (selectedAtmosphere === 'Historic') current = current.filter(loc => loc.description.toLowerCase().includes('історична') || loc.city === 'Львів');
    else if (selectedAtmosphere === 'Modern') current = current.filter(loc => loc.description.toLowerCase().includes('модний') || loc.city === 'Одеса');
    return current;
  }, [locations, selectedBudget, selectedStyle, selectedAtmosphere]);

  const calculateRoute = async (stops: RouteStop[]) => {
    if (!stops || stops.length < 2) {
        setRouteCoordinates([]);
        setRouteStats(null);
        return;
    }
    let profile = 'foot'; 
    if (travelMode === 'Driving') profile = 'car';
    if (travelMode === 'Bicycling') profile = 'bike';
    const pointsQuery = stops.map(s => `point=${s.latitude},${s.longtitude}`).join('&');
    
    const API_KEY = "41204871-6d14-410c-bd2f-2aa89b8050a3"; 
    const url = `https://graphhopper.com/api/1/route?${pointsQuery}&profile=${profile}&locale=en&key=${API_KEY}&points_encoded=false`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Routing failed");
        const data = await response.json();
        const path = data.paths[0];
        const coords: [number, number][] = path.points.coordinates.map((p: number[]) => [p[1], p[0]]);
        setRouteCoordinates(coords);
        
        const totalMinutes = Math.round(path.time / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;
        setRouteStats({ time: timeStr, distance: `${(path.distance / 1000).toFixed(1)} km` });
    } catch (error) {
        console.error("Error calculating route:", error);
    }
  };

  const toggleStop = useCallback((location: Location) => {
    setSelectedStops(prevStops => {
        const isAlreadyAdded = prevStops.some(stop => stop.location_id === location.location_id);
        if (isAlreadyAdded) {
            setRouteCoordinates([]); setRouteStats(null);
            return prevStops.filter(stop => stop.location_id !== location.location_id);
        } else {
            if (prevStops.length >= 10) { alert("Maximum 10 stops."); return prevStops; }
            setRouteCoordinates([]); setRouteStats(null);
            return [...prevStops, { ...location, note: "" }];
        }
    });
  }, []);

  const updateStopNote = useCallback((locationId: string, newNote: string) => {
    setSelectedStops(prevStops => prevStops.map(stop => stop.location_id === locationId ? { ...stop, note: newNote } : stop));
  }, []);

  const saveRoute = useCallback(() => {
    if (!user) { alert("Login required"); return; }
    if (!routeName.trim()) { alert("Enter route name"); return; }

    const stopsWithNotes = selectedStops.map(stop => ({ location_id: stop.location_id, note: stop.note.trim() }));
    const routePayload: any = {
        name: routeName.trim(), description: routeDescription.trim(), travel_mode: travelMode, stops: stopsWithNotes,
    }; 
    if (editingRouteId) {
        routePayload.client_route_id = editingRouteId;
        updateRoute(routePayload as RouteData);
    } else {
        addRoute(routePayload); 
    }
    resetRouteCreationState();
    setIsCreatingNewRoute(false);
  }, [routeName, routeDescription, travelMode, selectedStops, editingRouteId, updateRoute, addRoute, user]);

  const loadRoute = useCallback((route: RouteData) => {
    const stopsToLoad: RouteStop[] = route.stops.map(savedStop => {
        const fullLocation = locations.find(loc => loc.location_id === savedStop.location_id);
        if (fullLocation) return { ...fullLocation, note: savedStop.note || '' };
        return undefined; 
    }).filter((stop): stop is RouteStop => stop !== undefined);

    setRouteName(route.name); setRouteDescription(route.description); setTravelMode(route.travel_mode as any);
    setSelectedStops(stopsToLoad); setIsCreatingNewRoute(true); setEditingRouteId(route.client_route_id);
    if(stopsToLoad.length > 1) calculateRoute(stopsToLoad);
  }, [locations]);

  const handleDeleteRoute = useCallback((e: React.MouseEvent, routeId: string) => {
      e.stopPropagation();
      if(window.confirm("Are you sure you want to delete this route?")) {
        if (deleteRoute) {
            deleteRoute(routeId);
        } else {
            alert("Delete function not connected in AuthProvider");
        }
      }
  }, [deleteRoute]);

  const resetRouteCreationState = useCallback(() => {
    setRouteName(`Route #${Date.now().toString().slice(-4)}`); setRouteDescription(''); setTravelMode('Walking');
    setSelectedStops([]); setEditingRouteId(null); setRouteCoordinates([]); setRouteStats(null);
  }, []);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.dataTransfer.setData("stopIndex", index.toString());
      e.dataTransfer.effectAllowed = "move";
      e.currentTarget.classList.add("dragging");
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
      e.currentTarget.classList.remove("dragging");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
      e.preventDefault();
      const dragIndexStr = e.dataTransfer.getData("stopIndex");
      if (!dragIndexStr) return;
      
      const dragIndex = parseInt(dragIndexStr, 10);
      if (dragIndex === dropIndex) return;

      const newStops = [...selectedStops];
      const [movedStop] = newStops.splice(dragIndex, 1);
      newStops.splice(dropIndex, 0, movedStop);
      
      setSelectedStops(newStops);
      setRouteCoordinates([]);
      setRouteStats(null);
  };

  return (
    <div className="map-page-container">
      <div className="map-content-wrapper">
        <div className="map-controls">
            <h1 className="map-page-title">Locations Map</h1>
            <div className="filter-container">
                <FilterDropdown value={selectedBudget} onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setSelectedBudget(e.target.value)} options={[{ label: 'High', value: 'High' }, { label: 'Medium', value: 'Medium' }, { label: 'Low', value: 'Low' }]} defaultLabel="Budget" />
                <FilterDropdown value={selectedAtmosphere} onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setSelectedAtmosphere(e.target.value)} options={[{ label: 'Historic', value: 'Historic' }, { label: 'Modern', value: 'Modern' }]} defaultLabel="Atmosphere" />
                <FilterDropdown value={selectedStyle} onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setSelectedStyle(e.target.value)} options={[{ label: 'Dunkel', value: 'Dunkel' }, { label: 'IPA', value: 'IPA' }]} defaultLabel="Style" />
                
                <button className="route-planning-btn" onClick={() => setIsRoutePlannerOpen(true)}>
                    Routes <img src="/Compass.png" alt="" />
                </button>
                <button className="back-btn" onClick={() => navigate("/home")}>← Back</button>
            </div>
        </div>
        
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}

        <div className="map-wrapper">
            {isRoutePlannerOpen && (
                <RoutePlannerPanel 
                    isRoutePlannerOpen={isRoutePlannerOpen} setIsRoutePlannerOpen={setIsRoutePlannerOpen}
                    isCreatingNewRoute={isCreatingNewRoute} setIsCreatingNewRoute={setIsCreatingNewRoute}
                    selectedStops={selectedStops} toggleStop={toggleStop} userRoutes={routes}
                    routeName={routeName} setRouteName={setRouteName}
                    routeDescription={routeDescription} setRouteDescription={setRouteDescription}
                    travelMode={travelMode} setTravelMode={setTravelMode}
                    updateStopNote={updateStopNote} loadRoute={loadRoute} saveRoute={saveRoute}
                    resetRouteCreationState={resetRouteCreationState} calculateRoute={() => calculateRoute(selectedStops)}
                    routeStats={routeStats} handleDeleteRoute={handleDeleteRoute}
                    handleDragStart={handleDragStart} handleDragOver={handleDragOver} handleDrop={handleDrop} handleDragEnd={handleDragEnd}
                />
            )}

            <MapContainer center={defaultCenter} zoom={12} scrollWheelZoom={true}>
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {filteredLocations.map((location) => (
                    <Marker key={location.location_id} position={[location.latitude, location.longtitude]} icon={DefaultIcon}>
                        <Popup>
                            <div className="map-info-card">
                                <div className="map-info-image-container">
                                    <img src={location.picture || "/beer1.jpg"} alt={location.name} className="map-info-image" onError={(e) => { e.currentTarget.src = "/beer1.jpg"; }} />
                                    <h3 className="map-info-title">{location.name}</h3>
                                </div>
                                <div className="map-info-content">
                                    <p className="info-window-desc">{location.description}</p>
                                    <ul className="info-window-list">
                                        <li>⭐ {location.rating} | 💰 {location.average_budget_requirment}</li>
                                        <li>⏱️ {location.opens_at.slice(0,5)} - {location.closes_at.slice(0,5)}</li>
                                    </ul>
                                    <button className="map-details-btn" onClick={() => navigate(`/locationDetails/${location.location_id}`)}>View Full Details</button>
                                    
                                    {isCreatingNewRoute && (
                                        <button className="map-route-toggle-btn" onClick={() => toggleStop(location)}>
                                            {selectedStops.some(stop => stop.location_id === location.location_id) ? 'Remove from Route' : 'Add to Route'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
                {routeCoordinates.length > 0 && <Polyline positions={routeCoordinates} color="#ff9900" weight={5} opacity={0.8} />}
            </MapContainer>
        </div>
      </div>
    </div>
  );
};

const FilterDropdown: React.FC<{ value: string; onChange: any; options: any[]; defaultLabel: string }> = ({ value, onChange, options, defaultLabel }) => (
    <select value={value} onChange={onChange} className="filter-select">
        <option value="">{defaultLabel}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
);

interface RoutePlannerPanelProps {
    isRoutePlannerOpen: boolean; setIsRoutePlannerOpen: (isOpen: boolean) => void;
    isCreatingNewRoute: boolean; setIsCreatingNewRoute: (isCreating: boolean) => void;
    loadRoute: (route: RouteData) => void; userRoutes: RouteData[];
    selectedStops: RouteStop[]; toggleStop: (location: Location) => void;
    routeName: string; setRouteName: (name: string) => void;
    routeDescription: string; setRouteDescription: (desc: string) => void;
    travelMode: 'Walking' | 'Driving' | 'Bicycling'; setTravelMode: (mode: any) => void;
    updateStopNote: (locationId: string, newNote: string) => void;
    resetRouteCreationState: () => void; saveRoute: () => void; calculateRoute: () => void;
    routeStats: { time: string; distance: string } | null;
    handleDeleteRoute: (e: React.MouseEvent, routeId: string) => void;
    // DnD
    handleDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
    handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
}

const RoutePlannerPanel: React.FC<RoutePlannerPanelProps> = ({
    setIsRoutePlannerOpen, setIsCreatingNewRoute, isCreatingNewRoute,
    selectedStops, userRoutes, routeName, setRouteName, routeDescription, setRouteDescription,
    travelMode, setTravelMode, toggleStop, updateStopNote,
    loadRoute, saveRoute, resetRouteCreationState, calculateRoute, routeStats, handleDeleteRoute,
    handleDragStart, handleDragOver, handleDrop, handleDragEnd
}) => {
    const handleClose = () => { setIsRoutePlannerOpen(false); setIsCreatingNewRoute(false); };
    const handleCreateNewRoute = () => { resetRouteCreationState(); setIsCreatingNewRoute(true); };
    const handleBackToList = () => { resetRouteCreationState(); setIsCreatingNewRoute(false); };

    return (
        <div className="route-planner-panel">
            <div className="route-planner-header">
                <h3>Route Planner</h3>
                <button className="close-btn" onClick={handleClose}>&times;</button>
            </div>
            
            {!isCreatingNewRoute ? (
                <div className="route-list-view">
                    <div className="saved-routes-container">
                        <h4>Saved Routes ({userRoutes.length})</h4>
                        {userRoutes.length === 0 && <p>No routes yet.</p>}
                        {userRoutes.map((route: any) => (
                            <div key={route.client_route_id} className="saved-route-item" onClick={() => loadRoute(route)}>
                                <div className="route-info">
                                    <span className="route-name">{route.name}</span>
                                    <span className="route-mode"> ({route.travel_mode}) - {route.stops?.length || 0} stops</span>
                                </div>

                                <button className="route-delete-btn" onClick={(e) => handleDeleteRoute(e, route.client_route_id)}>
                                    <img src="/Trash.png" alt="Del" style={{width: '20px'}}/>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="create-new-route-btn" onClick={handleCreateNewRoute}>+ Create new route</button>
                </div>
            ) : (
                <div className="route-creation-form">

                    <div className="form-scroll-content">
                        <label>Name</label>
                        <input value={routeName} onChange={(e) => setRouteName(e.target.value)} />

                        <label>Description</label>
                        <textarea value={routeDescription} onChange={(e) => setRouteDescription(e.target.value)}></textarea>

                        <label>Travel Mode</label>
                        <select value={travelMode} onChange={(e) => setTravelMode(e.target.value as any)}>
                            <option value="Walking">Walking</option>
                            <option value="Driving">Driving</option>
                            <option value="Bicycling">Bicycling</option>
                        </select>
                        
                        <p className={selectedStops.length > 0 ? "stops-info-active" : "stops-info"}>
                            Stops ({selectedStops.length})
                        </p>

                        <div className="stops-list-container">
                            {selectedStops.map((stop: any, index: number) => (
                                <div 
                                    key={stop.location_id} 
                                    className="stop-item"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={handleDragOver}
                                    onDragEnd={handleDragEnd}
                                    onDrop={(e) => handleDrop(e, index)}
                                    title="Drag to reorder"
                                >
                                    <span className="stop-name">{index + 1}. {stop.name}</span>
                                    <button className="stop-delete-btn" onClick={(e) => { e.stopPropagation(); toggleStop(stop); }}>
                                        <img src="/Trash.png" alt="Del" style={{width: '20px'}}/>
                                    </button>
                                    <input 
                                        className="stop-note-input" 
                                        placeholder="Add note" 
                                        value={stop.note} 
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onChange={(e) => updateStopNote(stop.location_id, e.target.value)} 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-footer-actions">
                        {selectedStops.length > 1 && (
                            <button className="create-new-route-btn" style={{backgroundColor: '#e69500', marginTop: '0'}} onClick={calculateRoute}>
                                Calculate Path 🔄
                            </button>
                        )}

                        {routeStats && (
                            <div style={{backgroundColor: '#D9FFD9', padding: '10px', marginTop: '10px', borderRadius: '4px', color: '#2d572c', fontWeight: 'bold', textAlign: 'center'}}>
                                ⏳ {routeStats.time} | 📏 {routeStats.distance}
                            </div>
                        )}

                        <button className="save-route-btn" onClick={saveRoute}>Save Route</button>
                        <button className="back-to-list-btn" onClick={handleBackToList}>← Back list</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapPage;