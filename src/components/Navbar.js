import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../pages/CartContext";

const SUGGESTIONS_DATABASE = [
  "Hoodie",
  "Custom Hoodie",
  "Oversized Hoodie",
  "T-Shirt",
  "Custom T-Shirt",
  "Oversized T-Shirt",
  "Track Pants",
  "Sweatshirts",
  "Jackets",
  "Cargo Pants",
  "Custom Clothing",
  "Winter Fleece Hoodie",
  "Graphic Tee",
  "Denim Jacket",
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { wishlistCount } = useContext(WishlistContext);
  const { cartItems } = useContext(CartContext);

  const cartCount = cartItems ? cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0;

  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [token, setToken] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Search Suggestions State
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const updateNavbar = () => {
      setUsername(localStorage.getItem("username") || "");
      setRole(localStorage.getItem("role") || "");
      setToken(localStorage.getItem("token") || "");
    };

    updateNavbar();
    window.addEventListener("authChange", updateNavbar);
    window.addEventListener("storage", updateNavbar);

    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("authChange", updateNavbar);
      window.removeEventListener("storage", updateNavbar);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      const filtered = SUGGESTIONS_DATABASE.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setIsNavOpen(false);
    navigate(`/products?search=${encodeURIComponent(suggestion)}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setIsNavOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.removeItem("products_cache");
    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/home" || path === "/") {
      return location.pathname === "/" || location.pathname === "/home";
    }
    return location.pathname.startsWith(path);
  };

  const linkClass = (path) =>
    `px-3 py-2 rounded-pill font-medium transition-all text-sm d-flex align-items-center gap-1 ${
      isActive(path)
        ? "bg-dark text-white fw-semibold shadow-sm"
        : "text-dark hover-bg-light"
    }`;

  return (
    <nav
      className="navbar navbar-expand-lg sticky-top glassmorphism py-2 px-3 px-md-4"
      style={{ zIndex: 1040 }}
    >
      <div className="container-fluid px-0">
        {/* BRAND LOGO */}
        <Link
          className="navbar-brand fw-bold text-dark fs-4 d-flex align-items-center gap-2 me-4"
          to="/home"
          style={{ letterSpacing: "-0.5px" }}
        >
          <span
            className="d-inline-flex align-items-center justify-content-center bg-dark text-white rounded-circle"
            style={{ width: "32px", height: "32px", fontSize: "16px" }}
          >
            
          </span>
          <span style={{ fontFamily: "Inter, sans-serif" }}>HOODIFY</span>
        </Link>

        {/* MOBILE TOGGLER */}
        <button
          className="navbar-toggler border-0 p-1"
          type="button"
          onClick={() => setIsNavOpen(!isNavOpen)}
          aria-expanded={isNavOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* NAV COLLAPSE CONTENT */}
        <div className={`collapse navbar-collapse ${isNavOpen ? "show mt-3 mt-lg-0" : ""}`}>
          {/* SEARCH SUGGESTIONS BAR */}
          <div className="mx-auto my-2 my-lg-0 position-relative" style={{ width: "100%", maxWidth: "320px" }} ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control rounded-pill bg-light border-0 ps-4 pe-4 py-2 text-sm"
                  placeholder="Search Hoodie, Oversized..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                  style={{ fontSize: "14px" }}
                />
                <span className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted" style={{ fontSize: "12px" }}>
                  🔍
                </span>
              </div>
            </form>

            {/* SUGGESTIONS DROPDOWN */}
            {showSuggestions && (
              <div
                className="position-absolute top-100 start-0 w-100 bg-white rounded-4 shadow-lg border mt-1 overflow-hidden z-3"
                style={{ zIndex: 1050 }}
              >
                <div className="p-2 text-xs text-muted fw-bold border-bottom">SEARCH SUGGESTIONS</div>
                {suggestions.length > 0 ? (
                  suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 text-dark text-sm cursor-pointer hover-suggestion d-flex align-items-center justify-content-between"
                      onClick={() => handleSelectSuggestion(item)}
                      style={{ cursor: "pointer", transition: "background 0.15s ease" }}
                    >
                      <span>{item}</span>
                      <span className="text-muted small">↗</span>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-3 text-muted text-sm text-center fw-semibold">
                    No products found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT NAV LINKS */}
          <div className="ms-auto d-flex align-items-center gap-1 flex-wrap">
            {/* CUSTOMER LINKS */}
            {role !== "ROLE_ADMIN" && (
              <>
                <Link to="/home" className={linkClass("/home")} onClick={() => setIsNavOpen(false)}>
                  Home
                </Link>
                <Link to="/products" className={linkClass("/products")} onClick={() => setIsNavOpen(false)}>
                  Products
                </Link>
                <Link to="/wishlist" className={`${linkClass("/wishlist")} position-relative`} onClick={() => setIsNavOpen(false)}>
                  Wishlist ❤️
                  {wishlistCount > 0 && (
                    <span className="badge rounded-pill bg-danger ms-1" style={{ fontSize: "10px" }}>
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className={`${linkClass("/cart")} position-relative`} onClick={() => setIsNavOpen(false)}>
                  Cart 🛒
                  {cartCount > 0 && (
                    <span className="badge rounded-pill bg-dark text-white ms-1" style={{ fontSize: "10px" }}>
                      {cartCount}
                    </span>
                  )}
                </Link>
                {token && (
                  <Link to="/orders" className={linkClass("/orders")} onClick={() => setIsNavOpen(false)}>
                    Orders 📦
                  </Link>
                )}
              </>
            )}

            {/* ADMIN LINKS */}
            {token && role === "ROLE_ADMIN" && (
              <div className="d-flex align-items-center gap-1 flex-wrap">
                <Link to="/admin" className={linkClass("/admin")} onClick={() => setIsNavOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/admin/orders" className={linkClass("/admin/orders")} onClick={() => setIsNavOpen(false)}>
                  Orders
                </Link>
                <Link to="/admin/inventory" className={linkClass("/admin/inventory")} onClick={() => setIsNavOpen(false)}>
                  Inventory
                </Link>
                <Link to="/admin/users" className={linkClass("/admin/users")} onClick={() => setIsNavOpen(false)}>
                  Users
                </Link>
                <Link to="/admin/customizations" className={linkClass("/admin/customizations")} onClick={() => setIsNavOpen(false)}>
                  Customizations
                </Link>
              </div>
            )}

            {/* PROFILE & AUTH */}
            {token ? (
              <div className="d-flex align-items-center gap-2 ms-2">
                <Link
                  to="/profile"
                  className="d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-light text-dark fw-semibold text-sm hover-bg"
                  onClick={() => setIsNavOpen(false)}
                >
                  <div
                    className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: "26px", height: "26px", fontSize: "12px" }}
                  >
                    {username ? username.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="d-none d-sm-inline">{username}</span>
                </Link>

                <button
                  className="btn btn-outline-danger btn-sm rounded-pill px-3"
                  onClick={() => {
                    handleLogout();
                    setIsNavOpen(false);
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2 ms-2">
                <Link
                  to="/login"
                  className="btn btn-dark btn-sm rounded-pill px-3 py-1.5"
                  onClick={() => setIsNavOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-outline-dark btn-sm rounded-pill px-3 py-1.5"
                  onClick={() => setIsNavOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;