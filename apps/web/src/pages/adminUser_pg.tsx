import React, { useEffect, useState } from "react";
import '../styles/admin.css';
import { useNavigate } from "react-router-dom";
import LogoHeader from "../components/logoHeader";

export interface User {
  user_id: number;
  created_at: Date;
  email: string;
  nickname: string;
  password: string;
  profile_picture: string | null;
  bio: string | null;
  preferred_budget_range: string | null;
  preferred_venue_atmosphere: string | null;
  preferred_beer_style_id: number | null;
}

export default function AdminUserPage() {
    const navigate = useNavigate();
    const [data, setData] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [filteredData, setFilteredData] = useState<User[]>([]);

    useEffect(() => {
        if (searchTerm === "") {
            setFilteredData(data); 
        } else {
            const lowerSearch = searchTerm.toLowerCase();
            setFilteredData(data.filter(item => 
                item.email.toLowerCase().includes(lowerSearch) ||
                item.nickname.toLowerCase().includes(lowerSearch)
            ));
        }
    }, [data, searchTerm]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
        ...prev,
        [name]:
            name === "preferred_beer_style_id"
            ? value === "" ? null : parseInt(value)
            : value === "" ? null : value, 
        }));
    };

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await fetch(`https://beerism-backend.onrender.com/api/users/all`);
               if (!response.ok) throw new Error("Failed to fetch users");
                const users: User[] = await response.json();
                setData(users);
            } catch (err) {
                console.error("Error fetching users:", err);
            }
        }
        fetchUsers();
    }, []);

    const handleAddOrEditUser = async () => {
        try {
        const dataToSend = { ...formData };
        if (editingUserId && !formData.password) {
            delete dataToSend.password; 
        }
        const method = editingUserId ? "PUT" : "POST";
        const url = editingUserId
            ? `https://beerism-backend.onrender.com/api/users/update/${editingUserId}`
            : `https://beerism-backend.onrender.com/api/users/add`;

        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToSend),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to add/update user:", errorText);
            return;
        }

        const result = await response.json();

        if (editingUserId) {
            setData(data.map(u => (u.user_id === editingUserId ? result : u)));
        } else {
            setData([...data, result]);
        }

        setIsModalOpen(false);
        setFormData({});
        setEditingUserId(null);
        } catch (err) {
        console.error("Error during add/edit:", err);
        }
    };

    const handleAddClick = () => {
        setEditingUserId(null);
        setFormData({}); 
        setSelectedUserId(null); 
        setIsModalOpen(true);
    };

    const handleEditClick = (user: User) => {
        setFormData(user);
        setEditingUserId(user.user_id);
        setIsModalOpen(true);
    };

    const handleEditBottomClick = () => {
        if (!selectedUserId) {
            alert("Please select a user to edit.");
            return;
        }
        const userToEdit = data.find(u => u.user_id === selectedUserId);
        if (userToEdit) {
            handleEditClick(userToEdit); 
        }
    };

    const handleDeleteClick = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
        const res = await fetch(`https://beerism-backend.onrender.com/api/users/${id}`, { 
            method: "DELETE",
        });

        if (res.ok) {
            setData(data.filter(u => u.user_id !== id));
        } else {
            const text = await res.text();
            console.error("Failed to delete user:", text);
        }
        } catch (err) {
        console.error(err);
        }
    };

    const tableHeaders = [
        "ID", "Created At", "Email", "Nickname", "Profile Picture",
        "Bio", "Budget", "Atmosphere", "Beer Style ID",
    ];

    return (
        <>
            <LogoHeader />
            <div className="container">
                <h1 className="admin-title">Users list</h1>
                <div className="admin-top-buttons">
                    <form className="search-form">
                        <input 
                        type="text" 
                        placeholder="Search (email, nickname...)" 
                        value={searchTerm}            
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="search-buttons">
                            <button className="search"><img src="adminIcons/search.svg" alt="search" /></button>
                            <button className="denie"><img src="adminIcons/denie.svg" alt="denie" /></button>
                        </div>
                    </form>
                    <button className="backButton" onClick={() => navigate("/profile")}><span><img src="/profileIcons/Arrow.svg"></img></span> Back</button>
                </div>

                <div style={{ width: "100%"}}>
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
                            {filteredData.map((item) => (
                                <tr 
                                key={item.user_id}
                                className={`admin-row ${selectedUserId === item.user_id ? 'selected-row' : ''}`}
                                onClick={() => setSelectedUserId(item.user_id)}
                            >
                                    <td>{item.user_id}</td>
                                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                                    <td className="cell-truncate">{item.email}</td>
                                    <td>{item.nickname}</td>
                                    <td className="cell-truncate">{item.profile_picture}</td>
                                    <td className="cell-truncate">{item.bio}</td>
                                    <td>{item.preferred_budget_range}</td>
                                    <td>{item.preferred_venue_atmosphere}</td>
                                    <td>{item.preferred_beer_style_id}</td>
                                </tr>
                           ))}
                        </tbody>
                    </table>
                </div>

                <div className="admin-bottom-buttons">
                     <button className="admin-button admin-button-add" onClick={handleAddClick}>Add</button>
                     <button className="admin-button admin-button-edit" onClick={handleEditBottomClick}>Edit</button>
                      <button className="admin-button admin-button-delete" onClick={() => {
                        if (selectedUserId) {
                            handleDeleteClick(selectedUserId);
                        } else {
                            alert("Please select a user to delete.");
                        }
                    }} >Delete</button>
                </div>
            </div>

            {/* Модальное окно для Add/Edit */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                      D <h2>{editingUserId ? "Edit User" : "Add New User"}</h2>
                        
                        <label>Email</label>
                        <input name="email" value={formData.email || ""} onChange={handleInputChange} placeholder="Email" />
                        
                        <label>Nickname</label>
                        <input name="nickname" value={formData.nickname || ""} onChange={handleInputChange} placeholder="Nickname" />
                        
                        <label>Password</label>
                        <input name="password" type="password" onChange={handleInputChange} placeholder={editingUserId ? "Leave blank to keep same password" : "Password"} />
                        
                        <label>Profile Picture URL</label>
                        <input name="profile_picture" value={formData.profile_picture || ""} onChange={handleInputChange} placeholder="http://..." />
                        
                        <label>Bio</label>
                        <textarea name="bio" value={formData.bio || ""} onChange={handleInputChange} placeholder="User bio..." />

                        <label>Preferred Budget</label>
                        <select name="preferred_budget_range" value={formData.preferred_budget_range || ""} onChange={handleInputChange}>
                            <option value="">Select Budget</option>
                            <option value="low">Low</option>
                            <option value="average">Average</option>
                            <option value="high">High</option>
                        </select>

                        <label>Preferred Atmosphere</label>
                        <select name="preferred_venue_atmosphere" value={formData.preferred_venue_atmosphere || ""} onChange={handleInputChange}>
                            <option value="">Select Atmosphere</option>
                            <option value="cozy">Cozy</option>
                            <option value="loud">Loud</option>
                            <option value="modern">Modern</option>
                            <option value="traditional">Traditional</option>
                            <option value="sporty">Sporty</option>
                            <option value="quiet">Quiet</option>
                            <option value="lively">Lively</option>
                        </select>

                        <label>Preferred Beer Style ID</label>
                        <input name="preferred_beer_style_id" type="number" value={formData.preferred_beer_style_id || ""} onChange={handleInputChange} placeholder="Beer Style ID" />

                        <div className="modal-buttons">
                            <button onClick={handleAddOrEditUser}>Save</button>
                            <button type="button" onClick={() => { setIsModalOpen(false); setEditingUserId(null); setFormData({}); }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

