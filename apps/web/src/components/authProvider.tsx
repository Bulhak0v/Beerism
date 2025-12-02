import React, { createContext, useState, useContext, useEffect, useCallback } from "react";

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
    console.log(user);

  const [routes, setRoutes] = useState<RouteData[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));

      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      const savedRoutes = localStorage.getItem(getRouteKey(parsedUser.user_id));
      if (savedRoutes) {
        setRoutes(JSON.parse(savedRoutes));
      }
      else{
        setRoutes([]);
      }
    }
   
  }, []);

  useEffect(() => {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
  }, [user]);

  useEffect(() => {
        if (user) {
            localStorage.setItem(getRouteKey(user.user_id), JSON.stringify(routes));
        }
    }, [routes, user]);

  const addRoute = (newRoute: Omit<RouteData, 'client_route_id'>) => {
    const routeWithClientId: RouteData = {
        ...newRoute,
        client_route_id: Date.now().toString(),
    };

    setRoutes(prev => [...prev, routeWithClientId]);
};

  const updateRoute = useCallback((updatedRoute: RouteData) => {
      setRoutes(prevRoutes => 
          prevRoutes.map(route => 
              route.client_route_id === updatedRoute.client_route_id
                  ? updatedRoute
                  : route
          )
      );
  }, []);

  const deleteRoute = useCallback((routeId: string) => {
      setRoutes(prevRoutes => prevRoutes.filter(route => route.client_route_id !== routeId));
  }, []);

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