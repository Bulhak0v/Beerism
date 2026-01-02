import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app'; 
import './styles/style.css';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from './components/authProvider';
import { BrowserRouter } from "react-router-dom";

const rootElement = document.getElementById('app');

ReactDOM.createRoot(rootElement!).render(
  <React.StrictMode>
     <BrowserRouter>
    <GoogleOAuthProvider clientId="761586987657-5qnpb50bbi1kqq8dpdoecl3tes4pbqeu.apps.googleusercontent.com">
      <AuthProvider>
          <App />
      </AuthProvider>
    </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
