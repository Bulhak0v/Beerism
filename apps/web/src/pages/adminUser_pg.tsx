import React, { useEffect, useState } from "react";
import '../styles/admin.css';
import { useNavigate } from "react-router-dom";

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
            if (selectedUserId === id) setSelectedUserId(null);
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
        <div className="container">
            <h1 className="admin-title">Users list</h1>
            
            <div className="admin-top-buttons">
                <div className="search-bar-container">
                    <div className="search-bar"> 
                        <input 
                            type="text" 
                            placeholder="Search (email, nickname...)" 
                            value={searchTerm}            
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="searchButton"></button>
                    </div>
                </div>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            {tableHeaders.map((header) => (
                                <th key={header}>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item, idx) => (
                            <tr 
                                key={item.user_id}
                                className={`admin-row ${selectedUserId === item.user_id ? 'selected-row' : ''}`}
                                onClick={() => setSelectedUserId(item.user_id)}
                                style={{ backgroundColor: idx % 2 === 0 ? "#F2EFE5" : "#ffffff" }}
                            >
                                <td>{item.user_id}</td>
                                <td>{new Date(item.created_at).toLocaleDateString()}</td>
                                <td className="cell-truncate" title={item.email}>{item.email}</td>
                                <td>{item.nickname}</td>
                                <td className="cell-truncate" title={item.profile_picture || ""}>{item.profile_picture}</td>
                                <td className="cell-truncate" title={item.bio || ""}>{item.bio}</td>
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

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{editingUserId ? "Edit User" : "Add New User"}</h2>
                        
                        <label>Email</label>
                        <input name="email" value={formData.email || ""} onChange={handleInputChange} placeholder="Email" />
                        
                        <label>Nickname</label>
                        <input name="nickname" value={formData.nickname || ""} onChange={handleInputChange} placeholder="Nickname" />
                        
                        <label>Password</label>
                        <input name="password" type="password" onChange={handleInputChange} placeholder={editingUserId ? "Leave blank to keep same" : "Password"} />
                        
                        <label>Profile Picture URL</label>
                        <input name="profile_picture" value={formData.profile_picture || ""} onChange={handleInputChange} placeholder="http://..." />
                        
                        <label>Bio</label>
                        <textarea name="bio" value={formData.bio || ""} onChange={handleInputChange} placeholder="User bio..." />

                        <label>Preferred Budget</label>
                        <select name="preferred_budget_range" value={formData.preferred_budget_range || ""} onChange={handleInputChange}>
                            <option value="">Select Budget</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>

                        <label>Preferred Atmosphere</label>
                        <select name="preferred_venue_atmosphere" value={formData.preferred_venue_atmosphere || ""} onChange={handleInputChange}>
                            <option value="">Select Atmosphere</option>
                            <option value="Cozy">Cozy</option>
                            <option value="Modern">Modern</option>
                            <option value="Historic">Historic</option>
                            <option value="Lively">Lively</option>
                            <option value="Industrial">Industrial</option>
                            <option value="Outdoor">Outdoor</option>
                            <option value="Family_Friendly">Family_Friendly</option>
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
        </div>
    );
}