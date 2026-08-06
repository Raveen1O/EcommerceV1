import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function CustomerRoute({ children }) {
    const idToken = localStorage.getItem("idToken");
    
    if (idToken) {
        try {
            const decoded = jwtDecode(idToken);
            const groups = decoded["cognito:groups"] || [];
            if (groups.includes("Admin")) {
                return <Navigate to="/admin" replace />;
            }
        } catch (err) {}
    }
    
    return children;
}
