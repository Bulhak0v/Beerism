import React, { useState, useEffect, useCallback } from "react";
import '../styles/admin.css';
import { useNavigate } from "react-router-dom";

interface Quest {
    quest_id: number;
    title: string;
    description: string;
    requirements: any;
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

type QuestType = 'visit' | 'review' | 'atmosphere' | 'budget' | 'beer_style';

export default function AdminQuestsPage() {
    const navigate = useNavigate();
    
    const [quests, setQuests] = useState<Quest[]>([]);
    const [locations, setLocations] = useState<SimpleLocation[]>([]);
    const [filteredData, setFilteredData] = useState<Quest[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [baseForm, setBaseForm] = useState({
        title: "",
        description: "",
        xp_reward: 100,
        validity_start: "",
        validity_end: "",
        location_ids: [] as number[]
    });

    const [questType, setQuestType] = useState<QuestType>('visit');
    
    const [reqCount, setReqCount] = useState(1);
    const [reqUnique, setReqUnique] = useState(true);
    const [reqMinRating, setReqMinRating] = useState(4); 
    const [reqTargetString, setReqTargetString] = useState("");
    const [reqTargetId, setReqTargetId] = useState(0);

    const fetchData = useCallback(async () => {
        try {
            const qRes = await fetch(`https://beerism-backend.onrender.com/api/quests`);
            if (qRes.ok) setQuests(await qRes.json());
            
            const lRes = await fetch(`https://beerism-backend.onrender.com/api/locations`);
            if (lRes.ok) setLocations(await lRes.json());
        } catch (err) { console.error(err); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (searchTerm === "") setFilteredData(quests);
        else setFilteredData(quests.filter(q => q.title.toLowerCase().includes(searchTerm.toLowerCase())));
    }, [quests, searchTerm]);

    const resetForm = () => {
        setBaseForm({
            title: "", description: "", xp_reward: 100,
            validity_start: new Date().toISOString().split('T')[0],
            validity_end: "", location_ids: []
        });
        setQuestType('visit');
        setReqCount(1);
        setReqUnique(true);
        setReqMinRating(4);
        setReqTargetString("");
        setReqTargetId(0);
    };

    const handleAddClick = () => {
        setEditingId(null);
        setSelectedId(null);
        resetForm();
        setIsModalOpen(true);
    };

    const handleEditClick = () => {
        if (!selectedId) { alert("Select a quest first."); return; }
        const quest = quests.find(q => q.quest_id === selectedId);
        if (quest) {
            setEditingId(quest.quest_id);
            setBaseForm({
                title: quest.title,
                description: quest.description,
                xp_reward: quest.rewards?.xp || 0,
                validity_start: quest.validity_start ? new Date(quest.validity_start).toISOString().split('T')[0] : "",
                validity_end: quest.validity_end ? new Date(quest.validity_end).toISOString().split('T')[0] : "",
                location_ids: quest.linked_location_ids || []
            });

            const req = quest.requirements || {};
            const type = req.type || 'visit';
            setQuestType(type as QuestType);
            
            setReqCount(req.count || req.visits || 1);
            setReqUnique(req.unique ?? true);
            setReqMinRating(req.min_rating || 4);
            setReqTargetString(req.target || "");
            setReqTargetId(req.target_id || 0);

            setIsModalOpen(true);
        }
    };

    const handleSave = async () => {
        let requirementsPayload: any = { type: questType };

        switch (questType) {
            case 'visit':
                requirementsPayload.visits = reqCount;
                requirementsPayload.unique = reqUnique;
                break;
            case 'review':
                requirementsPayload.count = reqCount;
                requirementsPayload.min_rating = reqMinRating;
                break;
            case 'atmosphere':
                requirementsPayload.count = reqCount;
                requirementsPayload.target = reqTargetString;
                break;
            case 'budget':
                requirementsPayload.count = reqCount;
                requirementsPayload.target = reqTargetString;
                break;
            case 'beer_style':
                requirementsPayload.count = reqCount;
                requirementsPayload.target_id = reqTargetId;
                break;
        }

        const payload = {
            ...baseForm,
            requirements: requirementsPayload
        };

        const method = editingId ? "PUT" : "POST";
        const url = editingId 
            ? `https://beerism-backend.onrender.com/api/quests/${editingId}`
            : `https://beerism-backend.onrender.com/api/quests`;

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
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
        setBaseForm(prev => {
            const exists = prev.location_ids.includes(locId);
            if (exists) return { ...prev, location_ids: prev.location_ids.filter(id => id !== locId) };
            return { ...prev, location_ids: [...prev.location_ids, locId] };
        });
    };

    const renderReqString = (req: any) => {
        if (!req) return "N/A";
        switch (req.type) {
            case 'visit': return `${req.visits} Visits (${req.unique ? 'Unique' : 'Any'})`;
            case 'review': return `${req.count} Reviews (Min ${req.min_rating}★)`;
            case 'atmosphere': return `${req.count}x '${req.target}' Vibe`;
            case 'budget': return `${req.count}x '${req.target}' Cost`;
            case 'beer_style': return `${req.count}x Style #${req.target_id}`;
            default: return JSON.stringify(req);
        }
    };

    const tableHeaders = ["ID", "Title", "XP Reward", "Requirement", "Start", "End", "Locations"];

    return (
        <div className="container">
            <h1 className="admin-title">Quests List</h1>
            
            <div className="admin-top-buttons">
                <div className="search-bar-container">
                    <div className="search-bar"> 
                        <input type="text" placeholder="Search by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                        <tr>{tableHeaders.map(h => <th key={h}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                        {filteredData.map((q, idx) => (
                            <tr key={q.quest_id} className={`admin-row ${selectedId === q.quest_id ? 'selected-row' : ''}`} onClick={() => setSelectedId(q.quest_id)} style={{ backgroundColor: idx % 2 === 0 ? "#F2EFE5" : "#ffffff" }}>
                                <td>{q.quest_id}</td>
                                <td>{q.title}</td>
                                <td>{q.rewards?.xp || 0} XP</td>
                                <td style={{fontWeight:'bold', color: '#456DC5'}}>{renderReqString(q.requirements)}</td>
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
                        <h2 style={{borderBottom:'1px solid #eee', paddingBottom:'10px', marginBottom:'15px'}}>{editingId ? "Edit Quest" : "New Quest"}</h2>
                        
                        <div className="form-row">
                            <div className="form-col" style={{flex: 2}}>
                                <label>Title</label>
                                <input value={baseForm.title} onChange={e => setBaseForm({...baseForm, title: e.target.value})} />
                            </div>
                            <div className="form-col">
                                <label style={{color: '#E69500'}}>Quest Type</label>
                                <select value={questType} onChange={e => setQuestType(e.target.value as QuestType)}>
                                    <option value="visit">Visit Locations</option>
                                    <option value="review">Critic (Reviews)</option>
                                    <option value="atmosphere">Atmosphere Hunter</option>
                                    <option value="budget">Budget Challenge</option>
                                    <option value="beer_style">Style Hunter</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-col">
                                <label>Description</label>
                                <textarea value={baseForm.description} onChange={e => setBaseForm({...baseForm, description: e.target.value})} style={{height:'60px'}}/>
                            </div>
                        </div>

                        <div style={{backgroundColor: '#F9F9F9', padding: '15px', borderRadius: '6px', border:'1px solid #ddd'}}>
                            <label style={{marginBottom:'10px', color: '#202020', display:'block', fontWeight:'bold'}}>Configuring: {questType.toUpperCase()}</label>
                            
                            <div className="form-row">
                                <div className="form-col small">
                                    <label>Quantity Needed</label>
                                    <input type="number" value={reqCount} onChange={e => setReqCount(parseInt(e.target.value))} />
                                </div>

                                {questType === 'visit' && (
                                    <div className="form-col" style={{justifyContent: 'center'}}>
                                        <div style={{display:'flex', alignItems:'center', marginTop:'25px'}}>
                                            <input type="checkbox" checked={reqUnique} onChange={e => setReqUnique(e.target.checked)} style={{width:'auto', marginRight:'8px', height:'20px'}} />
                                            <span>Require unique locations?</span>
                                        </div>
                                    </div>
                                )}

                                {questType === 'review' && (
                                    <div className="form-col small">
                                        <label>Min Rating (1-5)</label>
                                        <input type="number" min="1" max="5" value={reqMinRating} onChange={e => setReqMinRating(parseInt(e.target.value))} />
                                    </div>
                                )}

                                {questType === 'atmosphere' && (
                                    <div className="form-col">
                                        <label>Target Atmosphere</label>
                                        <select value={reqTargetString} onChange={e => setReqTargetString(e.target.value)}>
                                            <option value="">Select Vibe...</option>
                                            <option value="Cozy">Cozy</option>
                                            <option value="Modern">Modern</option>
                                            <option value="Historic">Historic</option>
                                            <option value="Loud">Loud</option>
                                            <option value="Sporty">Sporty</option>
                                        </select>
                                    </div>
                                )}

                                {questType === 'budget' && (
                                    <div className="form-col">
                                        <label>Target Budget</label>
                                        <select value={reqTargetString} onChange={e => setReqTargetString(e.target.value)}>
                                            <option value="">Select...</option>
                                            <option value="Low">Low ($)</option>
                                            <option value="Medium">Medium ($$)</option>
                                            <option value="High">High ($$$)</option>
                                        </select>
                                    </div>
                                )}

                                {questType === 'beer_style' && (
                                    <div className="form-col">
                                        <label>Beer Style ID</label>
                                        <input type="number" placeholder="e.g. 1" value={reqTargetId} onChange={e => setReqTargetId(parseInt(e.target.value))} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-col small">
                                <label>Start Date</label>
                                <input type="date" value={baseForm.validity_start} onChange={e => setBaseForm({...baseForm, validity_start: e.target.value})} />
                            </div>
                            <div className="form-col small">
                                <label>End Date</label>
                                <input type="date" value={baseForm.validity_end} onChange={e => setBaseForm({...baseForm, validity_end: e.target.value})} />
                            </div>
                            <div className="form-col small">
                                <label>XP Reward</label>
                                <input type="number" value={baseForm.xp_reward} onChange={e => setBaseForm({...baseForm, xp_reward: parseInt(e.target.value)})} style={{borderColor:'#60BB5A', fontWeight:'bold'}}/>
                            </div>
                        </div>

                        <div className="form-col">
                            <label>Linked Locations (Optional: Restrict quest to these places)</label>
                            <div style={{height: '120px', overflowY: 'auto', border:'1px solid #ccc', borderRadius:'6px', padding:'10px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px'}}>
                                {locations.map(loc => (
                                    <div key={loc.location_id} style={{display:'flex', alignItems:'center'}}>
                                        <input 
                                            type="checkbox" 
                                            checked={baseForm.location_ids.includes(loc.location_id)} 
                                            onChange={() => toggleLocation(loc.location_id)}
                                            style={{width:'auto', marginRight:'8px'}}
                                        />
                                        <span style={{fontSize:'14px'}}>{loc.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="modal-buttons" style={{marginTop:'10px'}}>
                            <button onClick={handleSave}>Save Quest</button>
                            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}