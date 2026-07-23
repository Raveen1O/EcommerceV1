import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function AdminRoute({ children }) {

    const idToken = localStorage.getItem("idToken");

    if (!idToken) {
        return <Navigate to="/login" replace />;
    }

    try {

        const decoded = jwtDecode(idToken);

        const groups = decoded["cognito:groups"] || [];

        if (!groups.includes("Admin")) {
            return <Navigate to="/" replace />;
        }

        return children;

    } catch (err) {

        return <Navigate to="/login" replace />;
    }
}