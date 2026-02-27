import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// PrivateRoute component to protect authenticated routes
const PrivateRoute = ({ children }) => {
  // SSO Bridge: Check for token from Main Site (localStorage 'token')
  const mainSiteToken = localStorage.getItem('token');
  if (mainSiteToken) {
    if (!sessionStorage.getItem('auth_token')) {
      sessionStorage.setItem('auth_token', mainSiteToken);
    }
    // Default role if missing
    if (!sessionStorage.getItem('role')) {
      sessionStorage.setItem('role', 'ROLE_COMPANY');
    }
  }

  // Check if the user is authenticated
  const authToken =
    localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
  const isAuthenticated = !!authToken; // Convert to boolean

  // If the user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/ginum-login" />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoute;
