import { useState, useContext, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "./CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { ProductContext } from "../context/ProductContext";
import { toast } from "react-toastify";
import Pagination from "../components/Pagination";
import SkeletonProductCard from "../components/SkeletonProductCard";
import "./Products.css";

const CATEGORIES = [
  "All",
  "Hoodies",
  "T-Shirts",
  "Oversized T-Shirts",
  "Track Pants",
  "Sweatshirts",
  "Jackets",
  "Cargo Pants",
  "Custom Clothing",
];

const ITEMS_PER_PAGE = 12;

function Products() {
  const { products: allProducts, loading, fetchProducts } = useContext(ProductContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const { addToCart } = useContext(CartContext);
  const { isWishlisted, toggleWishlist } = useContext(WishlistContext);
  const role = localStorage.getItem("role");

  // Fetch products immediately on page mount if products list is currently empty
  useEffect(() => {
    if (allProducts.length === 0 && !loading && fetchProducts) {
      fetchProducts();
    }
  }, [allProducts.length, loading, fetchProducts]);

  // Read URL search/category params (e.g. from Navbar search)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search");
    const categoryParam = params.get("category");
    if (searchParam) {
      setSearchQuery(searchParam);
      setCurrentPage(1);
    }
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      setCurrentPage(1);
    }
  }, [location.search]);

  // Filter products by category AND search query
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const matchCategory =
        selectedCategory === "All" ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()) ||
        (p.name && p.name.toLowerCase().includes(selectedCategory.toLowerCase()));

      const matchSearch =
        !searchQuery.trim() ||
        (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCategory && matchSearch;
    });
  }, [allProducts, selectedCategory, searchQuery]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80";
  };

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container py-4">
      {/* Search & Category Filter Bar */}
      <div className="row g-3 align-items-center mb-4">
        <div className="col-12 col-md-5">
          <div className="position-relative">
            <input
              type="text"
              className="form-control rounded-pill px-4 shadow-sm border-0 bg-white"
              placeholder="Search Hoodies, T-Shirts, Jackets..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={{ height: "46px", fontSize: "14px" }}
              aria-label="Search items"
            />
            {searchQuery && (
              <button
                className="btn btn-sm btn-link text-muted position-absolute end-0 top-50 translate-middle-y me-3 text-decoration-none"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="col-12 col-md-7">
          <div className="d-flex align-items-center gap-2 overflow-auto pb-2 scrollbar-hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`btn btn-sm rounded-pill px-3 py-2 text-nowrap transition-all ${
                  selectedCategory === cat
                    ? "btn-dark fw-bold shadow-sm"
                    : "btn-outline-secondary bg-white text-dark border-0 shadow-sm"
                }`}
                onClick={() => handleCategorySelect(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="row g-3 g-md-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="col-6 col-md-4 col-lg-3" key={i}>
              <SkeletonProductCard />
            </div>
          ))}
        </div>
      ) : currentProducts.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-5 shadow-sm p-4 my-3">
          <div className="fs-1 mb-2">🔍</div>
          <h5 className="fw-bold mb-2">No clothing items found</h5>
          <p className="text-muted mb-3">Try resetting search filters or choosing another category.</p>
          <button
            className="btn btn-dark rounded-pill px-4 py-2"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setCurrentPage(1);
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="row g-3 g-md-4">
          {currentProducts.map((p) => {
            const isCustom =
              p.customizable === true ||
              (p.category && p.category.toLowerCase() === "custom clothing") ||
              (p.name && p.name.toLowerCase().includes("custom"));

            const isOut = p.quantity <= 0;
            const wishlisted = isWishlisted(p.id);

            return (
              <div className="col-6 col-md-4 col-lg-3 d-flex" key={p.id}>
                <div
                  className="card border-0 shadow-sm p-3 w-100 apple-card-hover position-relative d-flex flex-column"
                  style={{ cursor: "pointer", borderRadius: "20px" }}
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  {/* Heart Wishlist Icon */}
                  {role !== "ROLE_ADMIN" && (
                    <button
                      className="position-absolute top-0 end-0 m-2.5 m-md-3 btn btn-light btn-sm rounded-circle p-1 shadow-sm border-0 z-2 wishlist-heart-btn d-flex align-items-center justify-content-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(p);
                      }}
                      title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                      aria-label="Toggle Wishlist"
                    >
                      <span style={{ fontSize: "16px", color: wishlisted ? "#EF4444" : "#aaa" }}>
                        {wishlisted ? "❤️" : "🤍"}
                      </span>
                    </button>
                  )}

                  {/* Custom Tag */}
                  {isCustom && (
                    <span
                      className="position-absolute top-0 start-0 m-2.5 m-md-3 badge rounded-pill px-2.5 py-1 z-1 shadow-sm"
                      style={{ backgroundColor: "#8B5CF6", color: "#FFF", fontSize: "10px", fontWeight: "600" }}
                    >
                      CUSTOMIZABLE ✨
                    </span>
                  )}

                  {/* Image Container */}
                  <div className="img-zoom-container mb-3">
                    <img
                      src={p.imageUrl || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80"}
                      alt={p.name}
                      loading="lazy"
                      onError={handleImageError}
                    />
                  </div>

                  <div className="mt-auto d-flex flex-column">
                    <h6 className="fw-bold text-dark text-truncate mb-1 product-title" style={{ fontSize: "14px" }}>
                      {p.name}
                    </h6>

                    {/* Star Rating Display */}
                    <div className="d-flex align-items-center gap-1 mb-2" style={{ fontSize: "12px" }}>
                      <span className="text-warning">★</span>
                      <span className="fw-semibold text-dark">
                        {p.rating ? p.rating.toFixed(1) : "5.0"}
                      </span>
                      <span className="text-muted small">/ 5</span>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="fw-extrabold text-dark product-price">₹{p.price}</span>
                    </div>

                    <button
                      className={`btn btn-sm w-100 rounded-pill py-2 fw-semibold text-truncate ${
                        isOut ? "btn-secondary" : "btn-dark"
                      }`}
                      disabled={isOut}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isOut) {
                          addToCart(p);
                          toast.success(`${p.name} added to cart 🛒`);
                        }
                      }}
                    >
                      {isOut ? "OUT OF STOCK" : "Add To Cart"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredProducts.length > 0 && (
        <div className="mt-5">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Products;