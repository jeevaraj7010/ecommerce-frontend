import React, { useContext } from "react";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "./CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

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
    <div className="container mt-5 py-3">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="fw-bold m-0">My Wishlist ❤️</h2>
        <span className="badge bg-danger rounded-pill px-3 py-2 fs-6">
          {wishlistItems.length} {wishlistItems.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm p-4 my-3">
          <div className="display-1 text-muted mb-3">💔</div>
          <h4 className="fw-bold mb-2">Your Wishlist is Empty</h4>
          <p className="text-muted mb-4">
            Explore our clothing categories and save your favorite hoodies, t-shirts, and jackets!
          </p>
          <button
            className="btn btn-dark rounded-pill px-4 py-2 fw-semibold"
            onClick={() => navigate("/products")}
          >
            Browse Collection 🛍️
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {wishlistItems.map((p) => {
            const isOutOfStock = p.quantity <= 0;
            const isLowStock = p.quantity > 0 && p.quantity <= 5;

            return (
              <div key={p.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div
                  className="card border-0 shadow-sm p-2 h-100 product-card position-relative"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  <img
                    src={p.imageUrl || "https://picsum.photos/300"}
                    alt={p.name}
                    className="img-fluid rounded"
                    style={{ height: "180px", objectFit: "cover" }}
                    loading="lazy"
                  />

                  <div className="mt-2 text-center">
                    <h6 className="fw-semibold text-truncate">{p.name}</h6>
                    <p className="text-success fw-bold mb-1">₹{p.price}</p>

                    {/* Stock Status Badge */}
                    <div className="mb-2">
                      {isOutOfStock ? (
                        <span className="badge bg-danger">🔴 Out of Stock</span>
                      ) : isLowStock ? (
                        <span className="badge bg-warning text-dark">
                          🟡 Only {p.quantity} Left
                        </span>
                      ) : (
                        <span className="badge bg-success">🟢 In Stock</span>
                      )}
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-dark btn-sm flex-grow-1"
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveToCart(p);
                        }}
                      >
                        Move to Cart 🛒
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWishlist(p.id);
                          toast.info(`Removed ${p.name} from wishlist`);
                        }}
                        title="Remove from wishlist"
                      >
                        ❌
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
