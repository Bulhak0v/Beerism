import React, { useState, useEffect, useCallback } from "react";
import { Location } from "../../../../shared/types/locations.model";
import '../styles/admin.css';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/authProvider";

export default function AdminPage() {
    const navigate = useNavigate();
    const [data, setData] = useState<Location[]>([]);
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Location>>({});
    const [editingLocationId, setEditingLocationId] = useState<number | null>(null);
    const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [cityList, setCityList] = useState<string[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const fetchAllLocations = useCallback(async () => {
          try {
            const res = await fetch(`https://beerism-backend.onrender.com/api/locations`);
            if (!res.ok) {
              throw new Error('Failed to fetch locations');
            }
            const data = await res.json();
            setData(data);
          } catch (err: any) {
            console.error("Error fetching recommendations");
          }
        }, []);
        
    useEffect(() => {
        fetchAllLocations();
      }, [fetchAllLocations]);

    useEffect(() => {
        const fetchCities = async () => {
          try {
            const res = await fetch(`https://beerism-backend.onrender.com/api/locations/cities`);
            if (!res.ok) {
              throw new Error('Failed to fetch cities');
            }
            const cities: string[] = await res.json();
            setCityList(cities);
          } catch (err: any) {
            console.error("Error fetching city list:", err.message);
          }
        };
    
        fetchCities();
      }, []);
    
      const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
        const value = e.target.value;
        setSearchTerm(value);
    
        if (value.length > 0) {
          const filteredSuggestions = cityList.filter(city =>
            city.toLowerCase().startsWith(value.toLowerCase())
          );
          setSuggestions(filteredSuggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      };
    
      const handleSuggestionClick = (city: string) => {
        setSearchTerm(city);
        setSuggestions([]);
        setShowSuggestions(false);
      };
    
      const handleSearch = async () => {
        setSuggestions([]);
        setShowSuggestions(false);
        if (searchTerm) {
          try {
            const res = await fetch(
              `https://beerism-backend.onrender.com/api/locations/recommendations/byCity?user_id=${user!.user_id}&city=${encodeURIComponent(
                searchTerm 
              )}`
            );
    
            if (!res.ok) {
              throw new Error(`Failed to fetch recommendations: ${res.statusText}`);
            }
    
            const data = await res.json();
            setData(data);
            
          } catch (err: any) {
            console.error("Error fetching recommendations");
          }
        }
        else{
          fetchAllLocations();
        }
      };

    const handleAddClick = () => {
        setEditingLocationId(null);
        setFormData({});
        setSelectedLocationId(null); 
        setIsModalOpen(true);
    };

    const handleAddOrEditLocation = async () => {
        try {
            const dataToSend = {
                ...formData,
                rating: formData.rating ? parseFloat(formData.rating as unknown as string) : null,
                latitude: formData.latitude ? parseFloat(formData.latitude as unknown as string) : null,
                longtitude: formData.longtitude ? parseFloat(formData.longtitude as unknown as string) : null,
            };

            const method = editingLocationId ? "PUT" : "POST";
            const url = editingLocationId
                ? `https://beerism-backend.onrender.com/api/locations/${editingLocationId}`
                : `https://beerism-backend.onrender.com/api/locations`;

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                const errorText = await response.text(); 
                console.error("Failed to add/update location:", errorText);
                return;
            }

            const result = await response.json(); 

            if (editingLocationId) {
                setData(data.map(item => item.location_id === editingLocationId ? result : item));
            } else {
                setData([...data, result]);
            }

            setIsModalOpen(false);
            setFormData({});
            setEditingLocationId(null);

        } catch (err) {
            console.error("Error during add/edit:", err);
        }
    };

    const handleEdit = (location: Location) => {
        setFormData(location);
        setEditingLocationId(location.location_id);
        setIsModalOpen(true);
    };

    const handleEditBottomClick = () => {
        if (!selectedLocationId) {
            alert("Please select a location to edit.");
            return;
        }
        const locationToEdit = data.find(item => item.location_id === selectedLocationId);
        
        if (locationToEdit) {
            handleEdit(locationToEdit);
        }
    };

    const handleDeleteClick = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this location?")) return;

        try {
            const response = await fetch(`https://beerism-backend.onrender.com/api/locations/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setData(data.filter(item => item.location_id !== id));
            } else {
                const text = await response.text();
                console.error("Failed to delete location:", text);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const tableHeaders = [
        "ID", "Name", "Description", "City", "Address", "Website",
        "Rating", "Budget Range", "Opens At", "Closes At", "Latitude", "Longitude"
    ];

    return (
        <div className="container">
            <h1 className="admin-title">Location list</h1>
            
            <div className="admin-top-buttons">
                <div className="search-bar-container">
                    <div className="search-bar"> 
                        <input
                            type="text"
                            placeholder="Search (name, city, rating...)"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            autoComplete="off"
                        /> 
                        <button onClick={handleSearch} className="searchButton"></button>
                    </div>
                    
                    {showSuggestions && suggestions.length > 0 && (
                        <ul className="suggestions-dropdown">
                        {suggestions.map((city) => (
                            <li key={city} onClick={() => handleSuggestionClick(city)}>
                            {city}
                            </li>
                        ))}
                        </ul>
                    )}
                </div>
            
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            {tableHeaders.map((header, index) => (
                                <th key={header}>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, idx) => (
                            <tr key={item.location_id}
                                className={`admin-row ${selectedLocationId === item.location_id ? 'selected-row' : ''}`}
                                onClick={() => setSelectedLocationId(item.location_id)}
                                style={{ backgroundColor: idx % 2 === 0 ? "#F2EFE5" : "#ffffff" }}
                            >
                                <td>{item.location_id}</td>
                                <td>{item.name}</td>
                                <td className="cell-truncate" title={item.description || ""}>{item.description}</td>
                                <td>{item.city}</td>
                                <td>{item.address}</td>
                                <td className="cell-truncate">{item.website}</td>
                                <td>{item.rating}</td>
                                <td>{item.average_budget_requirment}</td>
                                <td>{item.opens_at}</td>
                                <td>{item.closes_at}</td>
                                <td>{item.latitude}</td>
                                <td>{item.longtitude}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="admin-bottom-buttons">
                <button className="admin-button admin-button-add" onClick={handleAddClick}>Add</button>
                <button className="admin-button admin-button-edit" onClick={handleEditBottomClick}>Edit</button>
                <button className="admin-button admin-button-delete" onClick={() => {
                    if (selectedLocationId) {
                        handleDeleteClick(selectedLocationId);
                    } else {
                        alert("Please select a location to delete.");
                    }
                }} >Delete</button>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{editingLocationId ? "Edit Location" : "Add New Location"}</h2>
                        {Object.keys({
                            name: "", description: "", city: "", address: "", website: "",
                            rating: "", average_budget_requirment: "", opens_at: "", closes_at: "", latitude: "", longtitude: ""
                        }).map((key) => (
                            <div key={key}>
                                <label style={{textTransform: 'capitalize'}}>{key.replace(/_/g, " ")}</label>
                                <input
                                    name={key}
                                    value={(formData as any)[key] || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                                />
                            </div>
                        ))}
                        <div className="modal-buttons">
                            <button onClick={handleAddOrEditLocation}>Save</button>
                            <button onClick={() => { setIsModalOpen(false); setEditingLocationId(null); setFormData({}); }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}