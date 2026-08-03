import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 🔐 Protect admin route using backend
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetch("https://ecommerce-backend-1-tsra.onrender.com/api/admin/overview", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 403 || res.status === 401) {
          alert("Access Denied");
          navigate("/home");
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        alert("Server error");
        navigate("/home");
      });
  }, [navigate]);

  const linkStyle = (path) => ({
    display: "block",
    padding: "12px 16px",
    marginBottom: "8px",
    color: location.pathname === path ? "#22c55e" : "#e5e7eb",
    textDecoration: "none",
    fontWeight: location.pathname === path ? "bold" : "500",
    background: location.pathname === path ? "#1f2937" : "transparent",
    borderRadius: "10px",
    fontSize: "14px",
    transition: "background 0.2s ease, color 0.2s ease",
  });

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.removeItem("products_cache");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Checking admin access...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column flex-md-row min-vh-100 bg-light">
      {/* MOBILE ADMIN TOP BAR (< 768px) */}
      <div className="d-flex d-md-none align-items-center justify-content-between bg-dark text-white p-3 shadow-sm sticky-top" style={{ zIndex: 1040 }}>
        <div className="d-flex align-items-center gap-2 fw-bold fs-5">
          <span>⚡</span> Admin Portal
        </div>
        <button
          className="btn btn-outline-light btn-sm rounded-circle p-1 d-flex align-items-center justify-content-center"
          style={{ width: "38px", height: "38px" }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle admin sidebar"
        >
          {isSidebarOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* BACKDROP OVERLAY FOR MOBILE SIDEBAR */}
      {isSidebarOpen && (
        <div
          className="d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1045 }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ADMIN SIDEBAR */}
      <div
        className={`bg-dark text-white p-4 d-flex flex-column justify-content-between transition-all ${
          isSidebarOpen ? "position-fixed top-0 start-0 h-100 shadow-lg" : "d-none d-md-flex"
        }`}
        style={{
          width: "240px",
          minWidth: "240px",
          zIndex: 1050,
        }}
      >
        <div>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h3 className="fw-extrabold m-0 text-white fs-4">Admin Dashboard</h3>
            <button
              className="btn-close btn-close-white d-md-none"
              onClick={() => setIsSidebarOpen(false)}
            ></button>
          </div>

          <nav>
            <Link to="/admin" style={linkStyle("/admin")} onClick={() => setIsSidebarOpen(false)}>
              📊 Dashboard
            </Link>
            <Link to="/admin/orders" style={linkStyle("/admin/orders")} onClick={() => setIsSidebarOpen(false)}>
              📦 Orders
            </Link>
            <Link to="/admin/users" style={linkStyle("/admin/users")} onClick={() => setIsSidebarOpen(false)}>
              👥 Users
            </Link>
            <Link to="/admin/inventory" style={linkStyle("/admin/inventory")} onClick={() => setIsSidebarOpen(false)}>
              🏷️ Inventory
            </Link>
            <Link to="/admin/customizations" style={linkStyle("/admin/customizations")} onClick={() => setIsSidebarOpen(false)}>
              ✨ Customizations
            </Link>
            <Link to="/admin/coupons" style={linkStyle("/admin/coupons")} onClick={() => setIsSidebarOpen(false)}>
              🎟️ Coupons
            </Link>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-danger w-100 rounded-pill py-2.5 fw-bold mt-4"
        >
          Logout
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow-1 p-3 p-md-4 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;