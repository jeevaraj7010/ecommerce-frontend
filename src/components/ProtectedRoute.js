import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;
