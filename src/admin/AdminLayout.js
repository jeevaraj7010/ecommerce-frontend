import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔐 Protect admin route
  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role !== "ROLE_ADMIN") {
      alert("Access Denied");
      navigate("/home");
    }
  }, [navigate]);

  // 🔥 Active link style
  const linkStyle = (path) => ({
    display: "block",
    padding: "10px",
    marginBottom: "10px",
    color: location.pathname === path ? "#22c55e" : "#fff",
    textDecoration: "none",
    fontWeight: location.pathname === path ? "bold" : "normal",
    background: location.pathname === path ? "#1f2937" : "transparent",
    borderRadius: "5px"
  });

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Sidebar */}
      <div style={{
        width: "220px",
        background: "#111827",
        color: "#fff",
        padding: "20px"
      }}>
        <h2 style={{ marginBottom: "20px" }}>Admin</h2>

        <nav>
          <Link to="/admin" style={linkStyle("/admin")}>Dashboard</Link>
          <Link to="/admin/orders" style={linkStyle("/admin/orders")}>Orders</Link>
          <Link to="/admin/users" style={linkStyle("/admin/users")}>Users</Link>
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: "30px",
            width: "100%",
            padding: "10px",
            background: "#ef4444",
            border: "none",
            color: "#fff",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: "20px",
        background: "#f9fafb"
      }}>
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;