import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { WishlistContext } from "../context/WishlistContext";

function Navbar() {
  const navigate = useNavigate();
  const { wishlistCount } = useContext(WishlistContext);

  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [token, setToken] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    const updateNavbar = () => {
      setUsername(localStorage.getItem("username") || "");
      setRole(localStorage.getItem("role") || "");
      setToken(localStorage.getItem("token") || "");
    };

    updateNavbar();
    window.addEventListener("authChange", updateNavbar);

    return () => {
      window.removeEventListener("authChange", updateNavbar);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const colors = ["#ffc107", "#0d6efd", "#20c997", "#dc3545"];
  const bg = colors[username ? username.length % colors.length : 0];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3 px-md-4 shadow-sm sticky-top">
      <div className="container-fluid px-0">
        <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-1" to="/home">
          Hoodify 🔥
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setIsNavOpen(!isNavOpen)}
          aria-expanded={isNavOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isNavOpen ? "show mt-3 mt-lg-0" : ""}`}>
          <div className="ms-auto d-flex align-items-center gap-2 flex-wrap">
            <Link to="/products" className="btn btn-outline-light btn-sm" onClick={() => setIsNavOpen(false)}>
              Products
            </Link>

            <Link to="/cart" className="btn btn-outline-light btn-sm" onClick={() => setIsNavOpen(false)}>
              Cart
            </Link>

            {/* WISHLIST (USER) */}
            {role !== "ROLE_ADMIN" && (
              <Link to="/wishlist" className="btn btn-outline-light btn-sm position-relative" onClick={() => setIsNavOpen(false)}>
                Wishlist ❤️
                {wishlistCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "10px" }}>
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* USER ORDERS */}
            {token && role === "ROLE_USER" && (
              <Link to="/orders" className="btn btn-outline-light btn-sm" onClick={() => setIsNavOpen(false)}>
                Orders
              </Link>
            )}

            {/* ADMIN */}
            {token && role === "ROLE_ADMIN" && (
              <Link to="/admin" className="btn btn-warning btn-sm" onClick={() => setIsNavOpen(false)}>
                Admin Panel
              </Link>
            )}

            {/* PROFILE AVATAR */}
            {token && username && (
              <div
                onClick={() => {
                  handleProfileClick();
                  setIsNavOpen(false);
                }}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: bg,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "15px",
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
                onClick={() => {
                  handleLogout();
                  setIsNavOpen(false);
                }}
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-success btn-sm" onClick={() => setIsNavOpen(false)}>
                  Login
                </Link>

                <Link to="/register" className="btn btn-outline-light btn-sm" onClick={() => setIsNavOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;