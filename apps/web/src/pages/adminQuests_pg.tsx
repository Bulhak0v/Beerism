import React, { useState, useEffect, useCallback } from "react";
import '../styles/admin.css';
import { useNavigate } from "react-router-dom";

interface Quest {
    quest_id: number;
    title: string;
    description: string;
    requirements: { visits: number };
    rewards: { xp: number };
    validity_start: string;
    validity_end: string;
    linked_location_ids: number[];
}

interface SimpleLocation {
    location_id: number;
    name: string;
    city: string;
}

export default function AdminQuestsPage() {
    const navigate = useNavigate();
    
    const [quests, setQuests] = useState<Quest[]>([]);
    const [locations, setLocations] = useState<SimpleLocation[]>([]);
    const [filteredData, setFilteredData] = useState<Quest[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        xp_reward: 100,
        visit_count: 1,
        validity_start: "",
        validity_end: "",
        location_ids: [] as number[]
    });


    const fetchData = useCallback(async () => {
        try {
            const qRes = await fetch(`https://beerism-backend.onrender.com/api/quests`);
            if (qRes.ok) {
                const qData = await qRes.json();
                setQuests(qData);
            }
            const lRes = await fetch(`https://beerism-backend.onrender.com/api/locations`);
            if (lRes.ok) {
                const lData = await lRes.json();
                setLocations(lData);
            }
        } catch (err) {
            console.error("Error fetching admin data", err);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (searchTerm === "") {
            setFilteredData(quests);
        } else {
            const lower = searchTerm.toLowerCase();
            setFilteredData(quests.filter(q => q.title.toLowerCase().includes(lower)));
        }
    }, [quests, searchTerm]);

    const handleAddClick = () => {
        setEditingId(null);
        setFormData({
            title: "", description: "", xp_reward: 100, visit_count: 1,
            validity_start: new Date().toISOString().split('T')[0],
            validity_end: "",
            location_ids: []
        });
        setSelectedId(null);
        setIsModalOpen(true);
    };

    const handleEditClick = () => {
        if (!selectedId) { alert("Select a quest first."); return; }
        const quest = quests.find(q => q.quest_id === selectedId);
        if (quest) {
            setEditingId(quest.quest_id);
            setFormData({
                title: quest.title,
                description: quest.description,
                xp_reward: quest.rewards?.xp || 0,
                visit_count: quest.requirements?.visits || 1,
                validity_start: quest.validity_start ? new Date(quest.validity_start).toISOString().split('T')[0] : "",
                validity_end: quest.validity_end ? new Date(quest.validity_end).toISOString().split('T')[0] : "",
                location_ids: quest.linked_location_ids || []
            });
            setIsModalOpen(true);
        }
    };

    const handleSave = async () => {
        const method = editingId ? "PUT" : "POST";
        const url = editingId 
            ? `https://beerism-backend.onrender.com/api/quests/${editingId}`
            : `https://beerism-backend.onrender.com/api/quests`;

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchData();
                setIsModalOpen(false);
            } else {
                console.error("Failed to save quest");
            }
        } catch (err) { console.error(err); }
    };

    const handleDelete = async () => {
        if (!selectedId) return;
        if (!window.confirm("Delete this quest?")) return;
        try {
            const res = await fetch(`https://beerism-backend.onrender.com/api/quests/${selectedId}`, { method: "DELETE" });
            if (res.ok) {
                setQuests(prev => prev.filter(q => q.quest_id !== selectedId));
                setSelectedId(null);
            }
        } catch (err) { console.error(err); }
    };

    const toggleLocation = (locId: number) => {
        setFormData(prev => {
            const exists = prev.location_ids.includes(locId);
            if (exists) return { ...prev, location_ids: prev.location_ids.filter(id => id !== locId) };
            return { ...prev, location_ids: [...prev.location_ids, locId] };
        });
    };

    const tableHeaders = ["ID", "Title", "Description", "XP Reward", "Visits Req.", "Start Date", "End Date", "Locations"];

    return (
        <div className="container">
            <h1 className="admin-title">Quests List</h1>
            
            <div className="admin-top-buttons">
                <div className="search-bar-container">
                    <div className="search-bar"> 
                        <input 
                            type="text" 
                            placeholder="Search by title..." 
                            value={searchTerm}            
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="searchButton"></button>
                    </div>
                </div>
                <button className="backButton" onClick={() => navigate("/profile")}>
                    <span><img src="/profileIcons/Arrow.svg" alt="back"></img></span> Back
                </button>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            {tableHeaders.map(h => <th key={h}>{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((q, idx) => (
                            <tr 
                                key={q.quest_id}
                                className={`admin-row ${selectedId === q.quest_id ? 'selected-row' : ''}`}
                                onClick={() => setSelectedId(q.quest_id)}
                                style={{ backgroundColor: idx % 2 === 0 ? "#F2EFE5" : "#ffffff" }}
                            >
                                <td>{q.quest_id}</td>
                                <td>{q.title}</td>
                                <td className="cell-truncate" title={q.description}>{q.description}</td>
                                <td>{q.rewards?.xp || 0} XP</td>
                                <td>{q.requirements?.visits || 1}</td>
                                <td>{new Date(q.validity_start).toLocaleDateString()}</td>
                                <td>{new Date(q.validity_end).toLocaleDateString()}</td>
                                <td>{q.linked_location_ids?.length || 0} Pubs</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="admin-bottom-buttons">
                 <button className="admin-button admin-button-add" onClick={handleAddClick}>Add</button>
                 <button className="admin-button admin-button-edit" onClick={handleEditClick}>Edit</button>
                 <button className="admin-button admin-button-delete" onClick={handleDelete}>Delete</button>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{editingId ? "Edit Quest" : "New Quest"}</h2>
                        
                        <label>Title</label>
                        <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />

                        <label>Description</label>
                        <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />

                        <div style={{display:'flex', gap:'10px'}}>
                            <div style={{flex:1}}>
                                <label>XP Reward</label>
                                <input type="number" value={formData.xp_reward} onChange={e => setFormData({...formData, xp_reward: parseInt(e.target.value)})} />
                            </div>
                            <div style={{flex:1}}>
                                <label>Visits Required</label>
                                <input type="number" value={formData.visit_count} onChange={e => setFormData({...formData, visit_count: parseInt(e.target.value)})} />
                            </div>
                        </div>

                        <div style={{display:'flex', gap:'10px'}}>
                            <div style={{flex:1}}>
                                <label>Start Date</label>
                                <input type="date" value={formData.validity_start} onChange={e => setFormData({...formData, validity_start: e.target.value})} />
                            </div>
                            <div style={{flex:1}}>
                                <label>End Date</label>
                                <input type="date" value={formData.validity_end} onChange={e => setFormData({...formData, validity_end: e.target.value})} />
                            </div>
                        </div>

                        <label>Linked Locations ({formData.location_ids.length})</label>
                        <div style={{maxHeight: '150px', overflowY: 'auto', border:'1px solid #ccc', borderRadius:'6px', padding:'5px'}}>
                            {locations.map(loc => (
                                <div key={loc.location_id} style={{display:'flex', alignItems:'center', marginBottom:'5px'}}>
                                    <input 
                                        type="checkbox" 
                                        checked={formData.location_ids.includes(loc.location_id)} 
                                        onChange={() => toggleLocation(loc.location_id)}
                                        style={{width:'auto', marginRight:'10px'}}
                                    />
                                    <span>{loc.name} ({loc.city})</span>
                                </div>
                            ))}
                        </div>

                        <div className="modal-buttons">
                            <button onClick={handleSave}>Save</button>
                            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}