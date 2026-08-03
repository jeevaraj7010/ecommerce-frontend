import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../pages/CartContext";
import "./Navbar.css";

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
  const [isScrolled, setIsScrolled] = useState(false);

  // Search Suggestions State
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  // Info Modal states for Settings, About, Contact
  const [activeModal, setActiveModal] = useState(null);

  // Swipe handling state for mobile drawer
  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    const updateNavbar = () => {
      setUsername(localStorage.getItem("username") || "");
      setRole(localStorage.getItem("role") || "");
      setToken(localStorage.getItem("token") || "");
    };

    updateNavbar();
    window.addEventListener("authChange", updateNavbar);
    window.addEventListener("storage", updateNavbar);

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("authChange", updateNavbar);
      window.removeEventListener("storage", updateNavbar);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      setIsSearching(true);
      const filtered = SUGGESTIONS_DATABASE.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
      setTimeout(() => setIsSearching(false), 150);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
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
    `px-3 py-2 rounded-pill font-medium transition-all text-sm d-flex align-items-center gap-1 nav-link-item ${
      isActive(path)
        ? "bg-dark text-white fw-semibold shadow-sm"
        : "text-dark hover-bg-light"
    }`;

  // Helper to highlight matching text in search suggestions
  const renderHighlightedText = (text, query) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="search-highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Touch handlers for swipe to close drawer
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    const diffX = currentX - touchStartX;
    if (diffX > 60) {
      setIsNavOpen(false);
      setTouchStartX(null);
    }
  };

  return (
    <>
      <nav
        className={`navbar navbar-expand-lg sticky-top sticky-navbar py-2 px-3 px-md-4 ${
          isScrolled ? "scrolled" : ""
        }`}
      >
        <div className="container-fluid px-0">
          {/* ==========================================
              DESKTOP NAVBAR HEADER (>= 992px) ONLY
              ========================================== */}
          <div className="d-none d-lg-flex align-items-center justify-content-between w-100">
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

            {/* SEARCH BAR (DESKTOP CENTER) */}
            <div className="mx-auto position-relative" style={{ width: "100%", maxWidth: "340px" }} ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control rounded-pill bg-light border-0 ps-4 pe-4 py-2 text-sm"
                    placeholder="Search Hoodie, Oversized..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                    style={{ fontSize: "14px", height: "42px" }}
                    aria-label="Search clothing items"
                  />
                  <span className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted" style={{ fontSize: "14px" }}>
                    {isSearching ? <span className="spinner-border spinner-border-sm text-secondary" /> : "🔍"}
                  </span>
                </div>
              </form>

              {/* SEARCH SUGGESTIONS DROPDOWN */}
              {showSuggestions && (
                <div
                  className="position-absolute top-100 start-0 w-100 bg-white rounded-4 shadow-lg border mt-1 overflow-hidden"
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
                        <span>{renderHighlightedText(item, searchQuery)}</span>
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

            {/* DESKTOP RIGHT NAV LINKS */}
            <div className="d-flex align-items-center gap-1">
              {role !== "ROLE_ADMIN" && (
                <>
                  <Link to="/home" className={linkClass("/home")}>
                    Home
                  </Link>
                  <Link to="/products" className={linkClass("/products")}>
                    Products
                  </Link>
                  <Link to="/wishlist" className={`${linkClass("/wishlist")} position-relative`}>
                    Wishlist ❤️
                    {wishlistCount > 0 && (
                      <span className="badge rounded-pill bg-danger ms-1" style={{ fontSize: "10px" }}>
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/cart" className={`${linkClass("/cart")} position-relative`}>
                    Cart 🛒
                    {cartCount > 0 && (
                      <span className="badge rounded-pill bg-dark text-white ms-1" style={{ fontSize: "10px" }}>
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  {token && (
                    <Link to="/orders" className={linkClass("/orders")}>
                      Orders 📦
                    </Link>
                  )}
                </>
              )}

              {token && role === "ROLE_ADMIN" && (
                <div className="d-flex align-items-center gap-1">
                  <Link to="/admin" className={linkClass("/admin")}>
                    Dashboard
                  </Link>
                  <Link to="/admin/orders" className={linkClass("/admin/orders")}>
                    Orders
                  </Link>
                  <Link to="/admin/inventory" className={linkClass("/admin/inventory")}>
                    Inventory
                  </Link>
                  <Link to="/admin/users" className={linkClass("/admin/users")}>
                    Users
                  </Link>
                  <Link to="/admin/customizations" className={linkClass("/admin/customizations")}>
                    Customizations
                  </Link>
                </div>
              )}

              {token ? (
                <div className="d-flex align-items-center gap-2 ms-2">
                  <Link
                    to="/profile"
                    className="d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-light text-dark fw-semibold text-sm hover-bg"
                  >
                    <div
                      className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold"
                      style={{ width: "26px", height: "26px", fontSize: "12px" }}
                    >
                      {username ? username.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span>{username}</span>
                  </Link>

                  <button
                    className="btn btn-outline-danger btn-sm rounded-pill px-3"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2 ms-2">
                  <Link to="/login" className="btn btn-dark btn-sm rounded-pill px-3 py-1.5">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-outline-dark btn-sm rounded-pill px-3 py-1.5">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ==========================================
              MOBILE HEADER LAYOUT (< 992px ONLY)
              ========================================== */}
          <div className="d-flex d-lg-none mobile-header-container">
            {/* ROW 1: BRAND LOGO + HAMBURGER BUTTON */}
            <div className="mobile-top-bar">
              <Link
                className="navbar-brand fw-bold text-dark fs-4 d-flex align-items-center gap-2"
                to="/home"
                style={{ letterSpacing: "-0.5px" }}
              >
                <span
                  className="d-inline-flex align-items-center justify-content-center bg-dark text-white rounded-circle"
                  style={{ width: "30px", height: "30px", fontSize: "14px" }}
                >
                  
                </span>
                <span style={{ fontFamily: "Inter, sans-serif" }}>HOODIFY</span>
              </Link>

              <button
                className="mobile-hamburger-btn"
                type="button"
                onClick={() => setIsNavOpen(true)}
                aria-label="Open mobile navigation drawer"
              >
                ☰
              </button>
            </div>

            {/* ROW 2: FULL-WIDTH ROUNDED SEARCH BAR */}
            <div className="mobile-search-row position-relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control rounded-pill bg-light border-0 ps-4 pe-4 py-2 text-sm"
                    placeholder="Search Hoodie, Oversized..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                    style={{ fontSize: "14px", height: "42px" }}
                    aria-label="Search clothing items"
                  />
                  <span className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted" style={{ fontSize: "14px" }}>
                    {isSearching ? <span className="spinner-border spinner-border-sm text-secondary" /> : "🔍"}
                  </span>
                </div>
              </form>

              {/* SEARCH SUGGESTIONS DROPDOWN (MOBILE) */}
              {showSuggestions && (
                <div
                  className="position-absolute top-100 start-0 w-100 bg-white rounded-4 shadow-lg border mt-1 overflow-hidden"
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
                        <span>{renderHighlightedText(item, searchQuery)}</span>
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
          </div>
        </div>
      </nav>

      {/* ==========================================
          MOBILE SLIDE DRAWER MENU OVERLAY (< 992px ONLY)
          ========================================== */}
      <div
        className={`drawer-overlay d-lg-none ${isNavOpen ? "open" : ""}`}
        onClick={() => setIsNavOpen(false)}
      >
        <div
          className="drawer-content"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {/* DRAWER HEADER */}
          <div className="drawer-header">
            <div className="d-flex align-items-center gap-2 fw-bold text-dark fs-5">
              <span
                className="d-inline-flex align-items-center justify-content-center bg-dark text-white rounded-circle"
                style={{ width: "28px", height: "28px", fontSize: "14px" }}
              >
                
              </span>
              HOODIFY
            </div>
            <button
              className="btn-close text-reset shadow-none"
              onClick={() => setIsNavOpen(false)}
              aria-label="Close navigation drawer"
            ></button>
          </div>

          {/* DRAWER BODY NAV LIST */}
          <div className="drawer-body">
            <Link
              to="/home"
              className={`drawer-link ${isActive("/home") ? "active" : ""}`}
              onClick={() => setIsNavOpen(false)}
            >
              <span>🏠 Home</span>
              <span>→</span>
            </Link>

            <Link
              to="/products"
              className={`drawer-link ${isActive("/products") ? "active" : ""}`}
              onClick={() => setIsNavOpen(false)}
            >
              <span>👕 Products</span>
              <span>→</span>
            </Link>

            <Link
              to="/wishlist"
              className={`drawer-link ${isActive("/wishlist") ? "active" : ""}`}
              onClick={() => setIsNavOpen(false)}
            >
              <span>❤️ Wishlist</span>
              {wishlistCount > 0 ? (
                <span className="badge rounded-pill bg-danger">{wishlistCount}</span>
              ) : (
                <span>→</span>
              )}
            </Link>

            <Link
              to="/cart"
              className={`drawer-link ${isActive("/cart") ? "active" : ""}`}
              onClick={() => setIsNavOpen(false)}
            >
              <span>🛒 Shopping Cart</span>
              {cartCount > 0 ? (
                <span className="badge rounded-pill bg-dark text-white">{cartCount}</span>
              ) : (
                <span>→</span>
              )}
            </Link>

            {token && (
              <Link
                to="/orders"
                className={`drawer-link ${isActive("/orders") ? "active" : ""}`}
                onClick={() => setIsNavOpen(false)}
              >
                <span>📦 My Orders</span>
                <span>→</span>
              </Link>
            )}

            {token && (
              <Link
                to="/profile"
                className={`drawer-link ${isActive("/profile") ? "active" : ""}`}
                onClick={() => setIsNavOpen(false)}
              >
                <span>👤 Profile</span>
                <span>→</span>
              </Link>
            )}

            {token && role === "ROLE_ADMIN" && (
              <Link
                to="/admin"
                className={`drawer-link ${isActive("/admin") ? "active" : ""}`}
                onClick={() => setIsNavOpen(false)}
              >
                <span>⚡ Admin Dashboard</span>
                <span>→</span>
              </Link>
            )}

            <hr className="my-2" />

            <div
              className="drawer-link"
              onClick={() => {
                setIsNavOpen(false);
                setActiveModal("Settings");
              }}
              style={{ cursor: "pointer" }}
            >
              <span>⚙️ Settings</span>
              <span>→</span>
            </div>

            <div
              className="drawer-link"
              onClick={() => {
                setIsNavOpen(false);
                setActiveModal("About");
              }}
              style={{ cursor: "pointer" }}
            >
              <span>ℹ️ About Us</span>
              <span>→</span>
            </div>

            <div
              className="drawer-link"
              onClick={() => {
                setIsNavOpen(false);
                setActiveModal("Contact");
              }}
              style={{ cursor: "pointer" }}
            >
              <span>💬 Contact Support</span>
              <span>→</span>
            </div>
          </div>

          {/* DRAWER FOOTER (AUTH CONTROLS) */}
          <div className="drawer-footer">
            {token ? (
              <div>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div
                    className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: "32px", height: "32px", fontSize: "14px" }}
                  >
                    {username ? username.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <strong className="d-block text-dark text-sm">{username}</strong>
                    <small className="text-muted" style={{ fontSize: "11px" }}>
                      {role === "ROLE_ADMIN" ? "Administrator" : "Verified Customer"}
                    </small>
                  </div>
                </div>
                <button
                  className="btn btn-outline-danger w-100 rounded-pill py-2 text-sm fw-bold"
                  onClick={() => {
                    handleLogout();
                    setIsNavOpen(false);
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                <Link
                  to="/login"
                  className="btn btn-dark w-100 rounded-pill py-2.5 text-sm fw-bold"
                  onClick={() => setIsNavOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-outline-dark w-100 rounded-pill py-2.5 text-sm fw-bold"
                  onClick={() => setIsNavOpen(false)}
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==========================================
          INFORMATIONAL MODAL (Settings, About, Contact)
          ========================================== */}
      {activeModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center z-3 p-3"
          style={{ zIndex: 1060 }}
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white p-4 rounded-4 shadow-lg text-start"
            style={{ maxWidth: "440px", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h5 className="fw-bold text-dark m-0">{activeModal}</h5>
              <button className="btn-close" onClick={() => setActiveModal(null)}></button>
            </div>

            {activeModal === "Settings" && (
              <div>
                <p className="text-secondary small mb-3">Configure app preferences and notifications.</p>
                <div className="form-check form-switch mb-3">
                  <input className="form-check-input" type="checkbox" id="emailNotif" defaultChecked />
                  <label className="form-check-label text-sm fw-semibold text-dark" htmlFor="emailNotif">
                    Order Delivery Notifications
                  </label>
                </div>
                <div className="form-check form-switch mb-3">
                  <input className="form-check-input" type="checkbox" id="offerNotif" defaultChecked />
                  <label className="form-check-label text-sm fw-semibold text-dark" htmlFor="offerNotif">
                    Promotional Coupon Offers
                  </label>
                </div>
              </div>
            )}

            {activeModal === "About" && (
              <div>
                <p className="text-secondary small mb-2">
                  <strong>HOODIFY</strong> is a luxury streetwear and custom apparel platform built with React and Spring Boot.
                </p>
                <p className="text-secondary small mb-0">
                  Engineered for maximum sustainability, heavy fabric durability, and custom real-time design printing.
                </p>
              </div>
            )}

            {activeModal === "Contact" && (
              <div>
                <p className="text-secondary small mb-2">Need assistance with your order or custom print artwork?</p>
                <p className="small mb-1">📧 Email: <strong>support@hoodify.com</strong></p>
                <p className="small mb-0">📞 Phone: <strong>+1 (800) 555-HOOD</strong></p>
              </div>
            )}

            <div className="mt-4 text-end">
              <button className="btn btn-dark rounded-pill px-4 py-2 text-sm fw-bold" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;