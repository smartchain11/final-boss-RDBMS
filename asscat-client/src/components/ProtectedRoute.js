import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';


function ProtectedRoute({ children, allowedRoles }) {
    const isAuthenticated = authService.isAuthenticated();
    const userRole = authService.getUserRole();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return allowedRoles.includes(userRole) ? children : <Navigate to="/unauthorized" replace />;
}

export default ProtectedRoute;