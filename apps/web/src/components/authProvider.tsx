import React, { createContext, useState, useContext, useEffect } from "react";

interface AuthContextUser {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextUser | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
    console.log(user);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  useEffect(() => {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
  }, [user]);

  const logout = () => {
    setUser(null);
  
  };
  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};


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