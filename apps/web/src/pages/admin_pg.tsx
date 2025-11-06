import React, { useEffect, useState } from "react";
import { Location } from "../../../../shared/types/locations.model";
import '../styles/admin.css';

export default function AdminPage() {
    const [data, setData] = useState<Location[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Location>>({});
    const [editingLocationId, setEditingLocationId] = useState<number | null>(null);

    useEffect(() => {
        async function getData() {
            try {
                const response = await fetch('http://localhost:4000/api/locations');
                const answer: Location[] = await response.json();
                setData(answer);
            } catch (err) {
                console.error("Failed to fetch locations:", err);
            }
        }
        getData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAddOrEditLocation = async () => {
        try {
            const method = editingLocationId ? "PUT" : "POST";
            const url = editingLocationId
                ? `http://localhost:4000/api/locations/${editingLocationId}`
                : "http://localhost:4000/api/locations";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            // Check for response status first
            if (!response.ok) {
                // Fetch the error body (which could be JSON or text)
                // For simplicity, let's stick to text for the error console.
                const errorText = await response.text(); 
                console.error("Failed to add/update location:", errorText);
                return;
            }

            // For a successful response (response.ok is true), use .json()
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

    const handleEditClick = (location: Location) => {
        setFormData(location);
        setEditingLocationId(location.location_id);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this location?")) return;

        try {
            const response = await fetch(`http://localhost:4000/api/locations/${id}`, {
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
        "Rating", "Budget Range", "Opens At", "Closes At", "Latitude", "Longitude", "Actions"
    ];

    return (
        <>
            <div className="logo">
                <img src="logo.svg" alt="logo" />
                <h1 className="title">Beerism</h1>
            </div>
            <div className="container">
                <h1 className="admin-title">Location list</h1>
                <div className="admin-top-buttons">
                    <form className="search-form">
                        <input type="text" placeholder="Search (name, city, rating...)" />
                        <div className="search-buttons">
                            <button className="search"><img src="adminIcons/search.svg" alt="search" /></button>
                            <button className="denie"><img src="adminIcons/denie.svg" alt="denie" /></button>
                        </div>
                    </form>
                    <BackButton />
                </div>

                <div style={{ width: "100%", overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ccc", borderRadius: "10px", overflow: "hidden", textAlign: "center" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#ffffff" }}>
                                {tableHeaders.map((header, index) => (
                                    <th
                                        key={header}
                                        style={{
                                            color: "#456DC5",
                                            fontSize: "20px",
                                            borderRight: index !== tableHeaders.length - 1 ? "1px solid #000" : "none",
                                            padding: "8px",
                                            textAlign: "center"
                                        }}
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, idx) => (
                                <tr key={item.location_id} style={{ backgroundColor: idx % 2 === 0 ? "#F2EFE5" : "#ffffff", fontSize: "16px" }}>
                                    <td>{item.location_id}</td>
                                    <td>{item.name}</td>
                                    <td>{item.description}</td>
                                    <td>{item.city}</td>
                                    <td>{item.address}</td>
                                    <td>{item.website}</td>
                                    <td>{item.rating}</td>
                                    <td>{item.average_budget_requirment}</td>
                                    <td>{item.opens_at}</td>
                                    <td>{item.closes_at}</td>
                                    <td>{item.latitude}</td>
                                    <td>{item.longtitude}</td>
                                    <td>
                                        <div style={{display: "flex", gap: "10px"}}>
                                          <button onClick={() => handleEditClick(item)}>Edit</button>
                                          <button onClick={() => handleDeleteClick(item.location_id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="admin-bottom-buttons">
                    <button className="admin-button admin-button-add" onClick={() => setIsModalOpen(true)}>Add</button>
                </div>
            </div>

            {/* Модальное окно для Add/Edit */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{editingLocationId ? "Edit Location" : "Add New Location"}</h2>
                        {Object.keys({
                            name: "", description: "", city: "", adress: "", website: "",
                            rating: "", average_budget_requirment: "", opens_at: "", closes_at: "", latitude: "", longtitude: ""
                        }).map((key) => (
                            <input
                                key={key}
                                name={key}
                                value={(formData as any)[key] || ""}
                                onChange={handleInputChange}
                                placeholder={key.replace("_", " ")}
                            />
                        ))}
                        <div className="modal-buttons">
                            <button onClick={handleAddOrEditLocation}>Save</button>
                            <button onClick={() => { setIsModalOpen(false); setEditingLocationId(null); setFormData({}); }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function BackButton() {
    return (
        <button className="backButton">
            <img src="adminIcons/arrow.svg" alt="arrow" />
            <p>Back</p>
        </button>
    );
}
