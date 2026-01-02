import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/leaderboard.css";
import avatarPlaceholder from "/avatar_placeholder.png";

interface LeaderboardUser {
    user_id: number;
    nickname: string;
    profile_picture: string | null;
    level: number;
    xp: number;
    completed_quests: number;
    rank: number;
}

type SortOption = 'rank' | 'quests' | 'level' | 'name';

const LeaderboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState<SortOption>('rank');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch("https://beerism-backend.onrender.com/api/users/leaderboard");
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error("Failed to load leaderboard", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const processedUsers = useMemo(() => {
        let result = [...users];

        if (searchTerm.trim()) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(u => u.nickname.toLowerCase().includes(lowerTerm));
        }

        result.sort((a, b) => {
            switch (sortOption) {
                case 'rank':
                    return (a.rank || 999999) - (b.rank || 999999);
                case 'quests':
                    return (b.completed_quests - a.completed_quests) || ((a.rank || 0) - (b.rank || 0));
                case 'level':
                    if (b.level !== a.level) return b.level - a.level;
                    if (b.xp !== a.xp) return b.xp - a.xp;
                    return (a.rank || 0) - (b.rank || 0);
                case 'name':
                    return a.nickname.localeCompare(b.nickname);
                default:
                    return 0;
            }
        });

        return result;
    }, [users, searchTerm, sortOption]);

    const renderRank = (user: LeaderboardUser) => {
        const rankToDisplay = Number(user.rank);

        if (rankToDisplay === 1) return <span className="rank-medal rank-1">1</span>;
        if (rankToDisplay === 2) return <span className="rank-medal rank-2">2</span>;
        if (rankToDisplay === 3) return <span className="rank-medal rank-3">3</span>;
        return <span className="rank-other">#{rankToDisplay}</span>;
    };

    return (
        <div className="leaderboard-main">
            <div className="topTitle">
                <h2>Leaderboard</h2>
                <button className="backButton" onClick={() => navigate("/home")}>
                    <span><img src="/profileIcons/Arrow.svg" alt="back" /></span> Back
                </button>
            </div>

            <div className="leaderboard-cover">
                
                <div className="lb-controls">
                    <div className="lb-search-wrapper">
                        <input 
                            type="text" 
                            placeholder="Search user..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="lb-search-input"
                        />
                        <span className="lb-search-icon">🔍</span>
                    </div>

                    <div className="lb-sort-wrapper">
                        <label>Sort by:</label>
                        <select 
                            value={sortOption} 
                            onChange={(e) => setSortOption(e.target.value as SortOption)}
                            className="lb-select"
                        >
                            <option value="rank">Global Rank</option>
                            <option value="quests">Quests Completed</option>
                            <option value="level">Level (High to Low)</option>
                            <option value="name">Name (A-Z)</option>
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <p style={{textAlign: 'center', fontSize: '20px', padding: '40px'}}>Loading champions...</p>
                ) : (
                    <div className="leaderboard-table-wrapper">
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th style={{textAlign: 'center'}}>Global Rank</th>
                                    <th>User</th>
                                    <th>Level</th>
                                    <th>Quests Completed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processedUsers.length > 0 ? (
                                    processedUsers.map((user) => (
                                        <tr key={user.user_id}>
                                            <td className="lb-rank-cell">
                                                {renderRank(user)}
                                            </td>
                                            <td>
                                                <div className="lb-user-cell">
                                                    <img 
                                                        src={user.profile_picture || avatarPlaceholder} 
                                                        alt={user.nickname} 
                                                        className="lb-avatar"
                                                    />
                                                    <span className="lb-nickname">{user.nickname}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="lb-level-badge">Lvl {user.level}</span>
                                                <span style={{fontSize: '14px', marginLeft: '8px', color:'#777'}}>
                                                    ({user.xp} XP)
                                                </span>
                                            </td>
                                            <td className="lb-quest-count">
                                                {user.completed_quests} 🏆
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} style={{textAlign: 'center', padding: '30px', color: '#666'}}>
                                            No users found matching "{searchTerm}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardPage;