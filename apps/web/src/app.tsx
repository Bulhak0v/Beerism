import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/auth_pg";
import ProfilePage from "./pages/profile_pg";
import AdminPage from "./pages/admin_pg";
import PasswordRecovery from "./pages/passwordRecovery_pg";
import LocationsPage from "./pages/locations_pg";
import LocationDetailsPage from "./pages/locationDetails_pg";
import MapPage from "./pages/map_pg";
import AdminUserPage from "./pages/adminUser_pg";
import Layout from "./components/layout";
import HomePage from "./pages/home_pg";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<Layout />}>
        <Route path="/home" element={<HomePage />} /> 
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/locationDetails/:id" element={<LocationDetailsPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/adminUser" element={<AdminUserPage />} />
        {/* <Route path="/about" element={<AboutPage />} /> */}
        {/* <Route path="/contact" element={<ContactPage />} /> */}
      </Route>
      
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

export default App;
