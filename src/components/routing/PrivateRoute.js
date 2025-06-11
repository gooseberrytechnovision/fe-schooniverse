import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import FullPageSpinner from "../layout/FullPageSpinner";

const PrivateRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading, isFirstTimeLogin } = useSelector(
    (state) => state.auth
  );
  const location = useLocation();

  if (loading) return <FullPageSpinner loading={loading} />; // Prevent redirection while authentication state is loading

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If user is on first time login, they should only access the reset-password route
  if (isFirstTimeLogin && location.pathname !== "/reset-password") {
    return <Navigate to="/reset-password" />;
  }
  
  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />; // Render the nested route if authenticated
};

export default PrivateRoute;
