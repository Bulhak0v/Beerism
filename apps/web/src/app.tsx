import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/auth_pg";
import ProfilePage from "./pages/profile_pg";
import AdminPage from "./pages/admin_pg";
import PasswordRecovery from "./pages/passwordRecovery_pg";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/recovery" element={<PasswordRecovery />} />
      
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

export default App;
