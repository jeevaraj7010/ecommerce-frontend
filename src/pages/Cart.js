import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import { toast } from "react-toastify";

function Cart() {
  const {
    cartItems,
    increaseQty,
    decreaseQty,
    removeFromCart,
    getTotal,
  } = useContext(CartContext);

  const [enlargedImage, setEnlargedImage] = useState(null);
  const navigate = useNavigate();

  const handleCheckout = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.warning("Please login to continue checkout ⚠️");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    navigate("/checkout");
  };

  return (
    <div className="container py-5" style={{ minHeight: "80vh" }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-extrabold text-dark m-0" style={{ letterSpacing: "-0.5px" }}>
            Shopping Cart 🛒
          </h2>
          <p className="text-muted small mb-0">Review your apparel & custom print items</p>
        </div>

        <span className="badge rounded-pill bg-dark px-3 py-2 text-white fw-semibold">
          {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      {cartItems.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center rounded-5 bg-white my-4">
          <div className="fs-1 mb-2 text-muted">🛍️</div>
          <h4 className="fw-bold mb-2">Your Bag is Empty</h4>
          <p className="text-muted mb-4 mx-auto" style={{ maxWidth: "400px" }}>
            Explore our latest hoodies, t-shirts, oversized collections, and custom printing studio.
          </p>
          <div>
            <button
              className="btn btn-dark rounded-pill px-5 py-2.5 fw-semibold shadow-sm"
              onClick={() => navigate("/products")}
            >
              Explore Collection
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* CART ITEMS LIST */}
          <div className="col-12 col-lg-8">
            <div className="d-flex flex-column gap-3">
              {cartItems.map((item, index) => (
                <div key={index} className="card border-0 shadow-sm p-4 rounded-4 bg-white">
                  <div className="row align-items-center g-3">
                    {/* Image & Custom Thumbnail */}
                    <div className="col-12 col-sm-3 d-flex align-items-center gap-2">
                      <img
                        src={item.imageUrl || "https://picsum.photos/200"}
                        alt={item.name}
                        className="rounded-3 shadow-sm"
                        style={{ width: "80px", height: "80px", objectFit: "cover" }}
                      />

                      {item.customImageUrl && (
                        <div className="text-center position-relative">
                          <img
                            src={item.customImageUrl}
                            alt="Custom print design"
                            className="rounded-3 border border-primary cursor-pointer shadow-sm"
                            style={{ width: "56px", height: "56px", objectFit: "cover", cursor: "pointer" }}
                            onClick={() => setEnlargedImage(item.customImageUrl)}
                            title="Click to Enlarge Custom Design"
                          />
                          <small className="badge bg-primary d-block mt-1" style={{ fontSize: "9px" }}>
                            Custom Print
                          </small>
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="col-12 col-sm-4">
                      <h6 className="fw-bold text-dark mb-1">{item.name}</h6>
                      {item.customText && (
                        <span className="badge bg-light text-dark border px-2 py-1 mb-1 d-inline-block small">
                          Text: "{item.customText}"
                        </span>
                      )}
                      <p className="text-muted small mb-0 text-truncate">{item.description}</p>
                    </div>

                    {/* Quantity Adjustment */}
                    <div className="col-6 col-sm-2 text-center">
                      <div className="d-inline-flex align-items-center border rounded-pill px-3 py-1 bg-light">
                        <button
                          className="btn btn-sm btn-link text-dark text-decoration-none p-0 fw-bold fs-6"
                          onClick={() => decreaseQty(index)}
                        >
                          −
                        </button>
                        <span className="px-3 fw-bold text-dark">{item.quantity}</span>
                        <button
                          className="btn btn-sm btn-link text-dark text-decoration-none p-0 fw-bold fs-6"
                          onClick={() => increaseQty(index)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price & Remove */}
                    <div className="col-6 col-sm-3 text-end">
                      <h5 className="fw-extrabold text-dark mb-1">
                        ₹{item.price * item.quantity}
                      </h5>
                      <button
                        className="btn btn-link text-danger text-decoration-none p-0 small fw-semibold"
                        onClick={() => removeFromCart(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SUMMARY SIDEBAR */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white sticky-top" style={{ top: "100px" }}>
              <h5 className="fw-extrabold text-dark mb-3">Order Summary</h5>

              <div className="d-flex justify-content-between mb-2 text-secondary">
                <span>Subtotal</span>
                <span className="fw-semibold text-dark">₹{getTotal()}</span>
              </div>

              <div className="d-flex justify-content-between mb-3 text-secondary">
                <span>Estimated Shipping</span>
                <span className="text-success fw-semibold">FREE</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold fs-5 text-dark">Total</span>
                <span className="fw-extrabold fs-4 text-dark">₹{getTotal()}</span>
              </div>

              <div className="d-grid gap-2">
                <button
                  className="btn btn-dark rounded-pill py-3 fw-bold shadow-sm"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout 💳
                </button>

                <button
                  className="btn btn-outline-dark rounded-pill py-2.5 fw-semibold"
                  onClick={() => navigate("/products")}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ENLARGE PREVIEW MODAL */}
      {enlargedImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center z-3"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="bg-white p-4 rounded-4 text-center shadow-lg" style={{ maxWidth: "500px" }}>
            <h6 className="fw-bold mb-3">Custom Uploaded Artwork</h6>
            <img
              src={enlargedImage}
              alt="Enlarged artwork"
              className="rounded-3 img-fluid mb-3"
              style={{ maxHeight: "350px", objectFit: "contain" }}
            />
            <div>
              <button className="btn btn-secondary rounded-pill px-4" onClick={() => setEnlargedImage(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;