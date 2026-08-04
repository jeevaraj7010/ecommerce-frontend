import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/home" replace />;
  }

  return children ? children : <Outlet />;
}

export default PublicRoute;
