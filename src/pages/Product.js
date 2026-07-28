import { useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  const { products: allProducts, loading } = useContext(ProductContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const { addToCart } = useContext(CartContext);
  const { isWishlisted, toggleWishlist } = useContext(WishlistContext);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");


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

  // Reset pagination to page 1 upon search query or category change
  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Pagination calculation (12 items per page)
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mt-4">
      {/* Search & Category Filter Bar */}
      <div className="row g-3 align-items-center mb-4">
        <div className="col-12 col-md-5">
          <input
            type="text"
            className="form-control rounded-pill px-3 shadow-sm border-0"
            placeholder="Search Hoodies, T-Shirts, Jackets..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className="col-12 col-md-7">
          <div className="d-flex align-items-center gap-2 overflow-auto pb-1 scrollbar-hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`btn btn-sm rounded-pill px-3 py-1 text-nowrap ${
                  selectedCategory === cat ? "btn-dark fw-bold" : "btn-outline-secondary"
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
        <div className="row g-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="col-6 col-md-4 col-lg-3" key={i}>
              <SkeletonProductCard />
            </div>
          ))}
        </div>
      ) : currentProducts.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm p-4 my-3">
          <h5 className="fw-bold mb-2">No clothing items found</h5>
          <p className="text-muted mb-3">Try clearing your search query or selecting another category.</p>
          <button
            className="btn btn-dark btn-sm rounded-pill px-4"
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
        <div className="row g-4">
          {currentProducts.map((p) => {
            const isCustom =
              p.customizable === true ||
              p.category === "Custom Clothing" ||
              (p.name && p.name.toLowerCase().includes("custom"));

            const isOut = p.quantity <= 0;
            const isLow = p.quantity > 0 && p.quantity <= 5;
            const wishlisted = isWishlisted(p.id);

            return (
              <div className="col-6 col-md-4 col-lg-3" key={p.id}>
                <div
                  className="card border-0 shadow-sm p-2 h-100 product-card position-relative"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  {/* Heart Wishlist Icon */}
                  {role !== "ROLE_ADMIN" && (
                    <button
                      className="position-absolute top-0 end-0 m-2 btn btn-light btn-sm rounded-circle p-1 shadow-sm border-0 z-2"
                      style={{ width: "32px", height: "32px", lineHeight: "1" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(p);
                      }}
                      title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <span style={{ fontSize: "16px", color: wishlisted ? "red" : "#aaa" }}>
                        {wishlisted ? "❤️" : "🤍"}
                      </span>
                    </button>
                  )}

                  {/* Customizable Badge */}
                  {isCustom && (
                    <span className="position-absolute top-0 start-0 m-2 badge bg-primary z-1">
                      Customizable ✨
                    </span>
                  )}

                  <img
                    src={p.imageUrl || "https://picsum.photos/300"}
                    alt={p.name}
                    className="img-fluid rounded"
                    style={{ height: "180px", objectFit: "cover" }}
                    loading="lazy"
                  />

                  <div className="mt-2 text-center">
                    <h6 className="fw-semibold text-truncate">{p.name}</h6>

                    <div style={{ fontSize: "14px" }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          style={{
                            color: i < Math.round(p.rating) ? "gold" : "#ccc",
                          }}
                        >
                          ★
                        </span>
                      ))}
                      <span style={{ marginLeft: "5px", color: "#555" }}>
                        ({p.rating ? p.rating.toFixed(1) : "0.0"})
                      </span>
                    </div>

                    <p className="text-success fw-bold mb-1">₹{p.price}</p>

                    {/* Stock Status Badge */}
                    <div className="mb-2">
                      {isOut ? (
                        <span className="badge bg-danger">🔴 Out of Stock</span>
                      ) : isLow ? (
                        <span className="badge bg-warning text-dark">
                          🟡 Only {p.quantity} Left
                        </span>
                      ) : (
                        <span className="badge bg-success">🟢 In Stock</span>
                      )}
                    </div>

                    <button
                      className="btn btn-dark btn-sm w-100"
                      disabled={isOut}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p);
                        toast.success(`${p.name} added to cart 🛒`);
                      }}
                    >
                      {isOut ? "Out of Stock" : "Add to Cart"}
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
}

export default Products;