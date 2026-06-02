import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Route protection wrapper component.
 * Prevents unauthorized access to dashboard and profile details.
 * Redirects the user to the Login page if no JWT token is stored locally.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Session token is missing; redirect back to Login with history clean
    return <Navigate to="/login" replace />;
  }

  // Token exists; permit access to subcomponents
  return children;
};

export default ProtectedRoute;
