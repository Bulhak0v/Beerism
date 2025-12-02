import React, { createContext, useState, useContext, useEffect, useCallback } from "react";

export interface RouteData {
    client_route_id: string; // Used for UI keying
    route_id?: number;       // Database ID
    name: string;
    description: string;
    travel_mode: 'Walking' | 'Driving' | 'Bicycling';
    stops: {
        location_id: string; // Frontend uses string IDs usually
        note: string;
    }[];
}

interface AuthContextUser {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  routes: RouteData[]; 
  addRoute: (newRoute: Omit<RouteData, 'client_route_id'>) => void;
  setRoutes: React.Dispatch<React.SetStateAction<RouteData[]>>;
  updateRoute: (updatedRoute: RouteData) => void;
  deleteRoute: (routeId: string) => void;
  logout: () => void;
}

const getRouteKey = (userId: number) => `routes_user_${userId}`;
export interface RouteData {
    client_route_id: string;
    name: string;
    description: string;
    travel_mode: 'Walking' | 'Driving' | 'Bicycling';
    stops: {
        location_id: string;
        note: string;
    }[];
}
const AuthContext = createContext<AuthContextUser | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [routes, setRoutes] = useState<RouteData[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
        fetchRoutes(user.user_id);
    } else {
        setRoutes([]);
    }
  }, [user]);

  const fetchRoutes = async (userId: number) => {
      try {
          const res = await fetch(`https://beerism-backend.onrender.com/api/routes/user/${userId}`);
          if (res.ok) {
              const dbRoutes = await res.json();
              const mappedRoutes: RouteData[] = dbRoutes.map((r: any) => ({
                  client_route_id: r.route_id.toString(),
                  route_id: r.route_id,
                  name: r.name,
                  description: r.description,
                  travel_mode: r.travel_mode || 'Walking',
                  stops: r.stops.map((s: any) => ({
                      location_id: s.location_id.toString(),
                      note: s.note || ''
                  }))
              }));
              setRoutes(mappedRoutes);
          }
      } catch (err) {
          console.error("Failed to fetch routes", err);
      }
  };

  const addRoute = async (newRoute: Omit<RouteData, 'client_route_id'>) => {
    if (!user) return;

    try {
        const res = await fetch(`https://beerism-backend.onrender.com/api/routes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: user.user_id,
                name: newRoute.name,
                description: newRoute.description,
                travel_mode: newRoute.travel_mode,
                stops: newRoute.stops.map(s => ({ 
                    location_id: parseInt(s.location_id),
                    note: s.note 
                }))
            })
        });

        if (res.ok) {
            fetchRoutes(user.user_id);
        }
    } catch (err) {
        console.error("Error adding route", err);
    }
  };

  const updateRoute = async (updatedRoute: RouteData) => {
      if (!user || !updatedRoute.client_route_id) return;

      try {
          const res = await fetch(`https://beerism-backend.onrender.com/api/routes/${updatedRoute.client_route_id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  name: updatedRoute.name,
                  description: updatedRoute.description,
                  travel_mode: updatedRoute.travel_mode,
                  stops: updatedRoute.stops.map(s => ({ 
                      location_id: parseInt(s.location_id), 
                      note: s.note 
                  }))
              })
          });

          if (res.ok) {
              fetchRoutes(user.user_id);
          }
      } catch (err) {
          console.error("Error updating route", err);
      }
  };

  const deleteRoute = async (routeId: string) => {
      if (!user) return;
      try {
          const res = await fetch(`https://beerism-backend.onrender.com/api/routes/${routeId}`, {
              method: "DELETE"
          });
          if (res.ok) {
              setRoutes(prev => prev.filter(r => r.client_route_id !== routeId));
          }
      } catch (err) {
          console.error("Error deleting route", err);
      }
  };

 const logout = () => {
    if (user) {
        localStorage.removeItem(getRouteKey(user.user_id));
    }
    setUser(null);
    setRoutes([]);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        setUser, 
        routes,
        setRoutes,
        addRoute,
        updateRoute,
        deleteRoute,
        logout 
      }}
    >
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