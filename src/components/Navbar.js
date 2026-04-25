import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("username") || "";
    setUsername(user);
    setRole(localStorage.getItem("role") || "");
    setToken(localStorage.getItem("token") || "");
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  // 🔥 RANDOM COLOR BASED ON USERNAME
  const colors = ["#ffc107", "#0d6efd", "#20c997", "#dc3545"];
  const bg = colors[username.length % colors.length];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">

      <Link className="navbar-brand fw-bold" to="/home">
        Hoodify 🔥
      </Link>

      <div className="ms-auto d-flex align-items-center gap-2 flex-wrap">

        <Link to="/products" className="btn btn-outline-light btn-sm">
          Products
        </Link>

        <Link to="/cart" className="btn btn-outline-light btn-sm">
          Cart
        </Link>

        {/* USER */}
        {token && role === "ROLE_USER" && (
          <Link to="/orders" className="btn btn-outline-light btn-sm">
            Orders
          </Link>
        )}

        {/* ADMIN */}
        {token && role === "ROLE_ADMIN" && (
          <Link to="/admin" className="btn btn-warning btn-sm">
            Admin Panel
          </Link>
        )}

        {/* 🔥 PROFILE AVATAR */}
        {token && username && (
          <div
            onClick={handleProfileClick}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: bg, // 🔥 USING RANDOM COLOR HERE
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "16px",
            }}
            title={username}
          >
            {username.charAt(0).toUpperCase()}
          </div>
        )}

        {/* AUTH */}
        {token ? (
          <button
            className="btn btn-danger btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="btn btn-success btn-sm">
              Login
            </Link>

            <Link to="/register" className="btn btn-outline-light btn-sm">
              Register
            </Link>
          </>
        )}

      </div>
    </nav>
  );
}

export default Navbar;