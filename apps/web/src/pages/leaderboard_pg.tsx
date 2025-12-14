import React, { useEffect, useState } from "react";
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
}

const LeaderboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const renderRank = (index: number) => {
        const rank = index + 1;
        if (rank === 1) return <span className="rank-medal rank-1">1</span>;
        if (rank === 2) return <span className="rank-medal rank-2">2</span>;
        if (rank === 3) return <span className="rank-medal rank-3">3</span>;
        return <span className="rank-other">#{rank}</span>;
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
                {isLoading ? (
                    <p style={{textAlign: 'center', fontSize: '20px'}}>Loading champions...</p>
                ) : (
                    <div className="leaderboard-table-wrapper">
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th style={{textAlign: 'center'}}>Rank</th>
                                    <th>User</th>
                                    <th>Level</th>
                                    <th>Quests Completed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr key={user.user_id}>
                                        <td className="lb-rank-cell">{renderRank(index)}</td>
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
                                            <span style={{fontSize: '14px', marginLeft: '8px', color:'#777'}}>({user.xp} XP)</span>
                                        </td>
                                        <td className="lb-quest-count">
                                            {user.completed_quests} 🏆
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardPage;