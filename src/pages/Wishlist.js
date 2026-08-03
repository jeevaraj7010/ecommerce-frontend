import React, { useContext } from "react";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "./CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80";
  };

  const handleMoveToCart = (product) => {
    if (product.quantity <= 0) {
      toast.error("This product is currently out of stock ❌");
      return;
    }
    addToCart(product);
    removeFromWishlist(product.id);
    toast.success(`Moved ${product.name} to Cart 🛒`);
  };

  return (
    <div className="container py-4 py-md-5">
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <h2 className="fw-extrabold text-dark m-0 fs-3 fs-md-2">My Wishlist ❤️</h2>
        <span className="badge bg-danger rounded-pill px-3 py-2 fs-6">
          {wishlistItems.length} {wishlistItems.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-5 shadow-sm p-4 my-3">
          <div className="display-1 text-muted mb-3">💔</div>
          <h4 className="fw-bold mb-2">Your Wishlist is Empty</h4>
          <p className="text-muted mb-4 small">
            Explore our clothing categories and save your favorite hoodies, t-shirts, and jackets!
          </p>
          <button
            className="btn btn-dark rounded-pill px-4 py-2.5 fw-semibold"
            onClick={() => navigate("/products")}
          >
            Browse Collection 🛍️
          </button>
        </div>
      ) : (
        <div className="row g-3 g-md-4">
          {wishlistItems.map((p) => {
            const isOutOfStock = p.quantity <= 0;
            const isLowStock = p.quantity > 0 && p.quantity <= 5;

            return (
              <div key={p.id} className="col-6 col-md-4 col-lg-3 d-flex">
                <div
                  className="card border-0 shadow-sm p-3 w-100 apple-card-hover position-relative d-flex flex-column"
                  style={{ cursor: "pointer", borderRadius: "20px" }}
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  <div className="img-zoom-container mb-3" style={{ height: "180px" }}>
                    <img
                      src={p.imageUrl || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80"}
                      alt={p.name}
                      className="img-fluid rounded"
                      style={{ height: "100%", width: "100%", objectFit: "contain" }}
                      loading="lazy"
                      onError={handleImageError}
                    />
                  </div>

                  <div className="mt-auto d-flex flex-column text-center">
                    <h6 className="fw-bold text-dark text-truncate mb-1" style={{ fontSize: "14px" }}>
                      {p.name}
                    </h6>
                    <p className="text-dark fw-extrabold mb-2">₹{p.price}</p>

                    {/* Stock Status Badge */}
                    <div className="mb-3">
                      {isOutOfStock ? (
                        <span className="badge bg-danger text-xs">🔴 Out of Stock</span>
                      ) : isLowStock ? (
                        <span className="badge bg-warning text-dark text-xs">
                          🟡 Only {p.quantity} Left
                        </span>
                      ) : (
                        <span className="badge bg-success text-xs">🟢 In Stock</span>
                      )}
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-dark btn-sm rounded-pill flex-grow-1 text-xs py-2 fw-semibold text-truncate"
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveToCart(p);
                        }}
                      >
                        Move to Cart 🛒
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm rounded-circle p-1 d-flex align-items-center justify-content-center"
                        style={{ width: "32px", height: "32px", minWidth: "32px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWishlist(p.id);
                          toast.info(`Removed ${p.name} from wishlist`);
                        }}
                        title="Remove from wishlist"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
