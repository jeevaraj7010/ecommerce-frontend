import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { toast } from "react-toastify";
import "./Cart.css";

function Cart() {
  const {
    cartItems,
    increaseQty,
    decreaseQty,
    removeFromCart,
    getTotal,
  } = useContext(CartContext);

  const { toggleWishlist, isWishlisted } = useContext(WishlistContext) || {
    toggleWishlist: () => {},
    isWishlisted: () => false,
  };

  const [enlargedImage, setEnlargedImage] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
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

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.info("Please enter a valid coupon code 🏷️");
      return;
    }
    setCouponApplied(true);
    toast.success(`Coupon "${couponCode.toUpperCase()}" applied successfully! 🎉`);
  };

  const totalAmount = getTotal();
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="cart-page-wrapper">
      <div className="container">
        {/* PAGE HEADER */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <div>
            <h1 className="cart-header-title">Your Cart</h1>
            <p className="cart-header-subtitle">
              Review your apparel & custom print items before checkout
            </p>
          </div>

          <div className="d-flex align-items-center gap-3">
            <span className="cart-count-badge">
              {totalItemsCount} {totalItemsCount === 1 ? "Item" : "Items"}
            </span>
          </div>
        </div>

        {/* EMPTY CART STATE */}
        {cartItems.length === 0 ? (
          <div className="empty-cart-card">
            <div className="empty-cart-icon" aria-hidden="true">
              🛍️
            </div>
            <h2 className="empty-cart-title">Your cart feels empty</h2>
            <p className="empty-cart-text">
              Looks like you haven't added anything to your shopping bag yet. Explore our luxury collection and custom studio!
            </p>
            <button
              className="btn-checkout-primary mx-auto"
              style={{ maxWidth: "260px" }}
              onClick={() => navigate("/products")}
            >
              Continue Shopping →
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {/* LEFT COLUMN: PRODUCT CARDS LIST (70%) */}
            <div className="col-12 col-lg-8">
              <div className="d-flex flex-column gap-3">
                {cartItems.map((item, index) => {
                  const customImg = item.customImageUrl || item.customImage;
                  const itemWishlisted = isWishlisted(item.id);

                  return (
                    <div key={index} className="cart-item-card">
                      <div className="row align-items-center g-3">
                        {/* LEFT: PRODUCT IMAGE (120x120) */}
                        <div className="col-12 col-sm-auto">
                          <div className="cart-image-wrapper">
                            <img
                              src={item.imageUrl || "https://picsum.photos/300"}
                              alt={item.name}
                              loading="lazy"
                            />
                            {customImg && (
                              <div
                                className="cart-custom-thumb"
                                onClick={() => setEnlargedImage(customImg)}
                                title="Click to view custom artwork preview"
                              >
                                <img src={customImg} alt="Custom artwork preview" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* MIDDLE: PRODUCT DETAILS & CONTROLS */}
                        <div className="col-12 col-sm">
                          <div className="d-flex align-items-start justify-content-between">
                            <div>
                              <h3 className="cart-product-title">{item.name}</h3>
                              <div className="cart-product-meta">
                                <span className="cart-meta-tag">
                                  {item.category || "Hoodify Premium"}
                                </span>
                                <span className="text-muted small">₹{item.price} each</span>
                              </div>

                              {/* CUSTOM TEXT BADGE */}
                              {item.customText && (
                                <div className="mb-2">
                                  <span className="cart-custom-text-badge">
                                    ✨ Custom Text: "{item.customText}"
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* QUANTITY CONTROLS */}
                          <div className="d-flex align-items-center justify-content-between mt-3 pt-2 border-top border-light">
                            <div className="cart-quantity-selector">
                              <button
                                type="button"
                                className="cart-qty-btn"
                                onClick={() => decreaseQty(index)}
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>
                              <span className="cart-qty-value">{item.quantity}</span>
                              <button
                                type="button"
                                className="cart-qty-btn"
                                onClick={() => increaseQty(index)}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>

                            {/* ITEM SUBTOTAL & ACTION BUTTONS */}
                            <div className="d-flex align-items-center gap-3">
                              <span className="cart-item-subtotal">
                                ₹{item.price * item.quantity}
                              </span>

                              {/* WISHLIST TOGGLE */}
                              <button
                                type="button"
                                className="cart-action-btn"
                                onClick={() => toggleWishlist(item)}
                                title={
                                  itemWishlisted
                                    ? "Remove from Wishlist"
                                    : "Move to Wishlist"
                                }
                                aria-label="Toggle Wishlist"
                              >
                                {itemWishlisted ? "❤️" : "🤍"}
                              </button>

                              {/* REMOVE ITEM */}
                              <button
                                type="button"
                                className="cart-action-btn remove"
                                onClick={() => removeFromCart(index)}
                                title="Remove item"
                                aria-label="Remove item from cart"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ESTIMATED DELIVERY BADGE */}
              <div className="mt-4 p-3 bg-white rounded-4 border d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2 text-dark font-medium small">
                  <span className="fs-5">🚚</span>
                  <span>Estimated Delivery: <strong>2 - 4 Business Days</strong></span>
                </div>
                <span className="badge bg-success bg-opacity-10 text-success fw-semibold px-3 py-1.5 rounded-pill">
                  FREE Express Delivery
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: STICKY ORDER SUMMARY (30%) */}
            <div className="col-12 col-lg-4">
              <div className="cart-summary-card">
                <h2 className="cart-summary-title">Order Summary</h2>

                <div className="cart-summary-row">
                  <span>Subtotal ({totalItemsCount} items)</span>
                  <span className="fw-bold text-dark">₹{totalAmount}</span>
                </div>

                <div className="cart-summary-row">
                  <span>Delivery Fee</span>
                  <span className="text-success fw-bold">FREE</span>
                </div>

                <div className="cart-summary-row">
                  <span>Estimated Taxes</span>
                  <span className="text-muted">Included</span>
                </div>

                {couponApplied && (
                  <div className="cart-summary-row text-success">
                    <span>Coupon Discount</span>
                    <span className="fw-bold">-₹0</span>
                  </div>
                )}

                <div className="cart-divider my-3"></div>

                <div className="cart-summary-row total">
                  <span>Total Amount</span>
                  <span>₹{totalAmount}</span>
                </div>

                {/* COUPON CODE FORM */}
                <form onSubmit={handleApplyCoupon} className="cart-coupon-wrapper">
                  <input
                    type="text"
                    className="cart-coupon-input"
                    placeholder="Enter Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button type="submit" className="btn-coupon-apply">
                    Apply
                  </button>
                </form>

                {/* CHECKOUT BUTTON */}
                <button
                  type="button"
                  className="btn-checkout-primary mb-3"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout →
                </button>

                <button
                  type="button"
                  className="btn btn-outline-dark w-100 rounded-pill py-2.5 fw-semibold text-sm"
                  onClick={() => navigate("/products")}
                >
                  Continue Shopping
                </button>

                {/* TRUST BADGES GRID */}
                <div className="cart-trust-grid">
                  <div className="cart-trust-badge">
                    <span className="cart-trust-icon">🛡️</span>
                    <span>Secure Checkout</span>
                  </div>
                  <div className="cart-trust-badge">
                    <span className="cart-trust-icon">⚡</span>
                    <span>Fast Delivery</span>
                  </div>
                  <div className="cart-trust-badge">
                    <span className="cart-trust-icon">❤</span>
                    <span>Money Back</span>
                  </div>
                  <div className="cart-trust-badge">
                    <span className="cart-trust-icon">✓</span>
                    <span>In Stock</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE STICKY CHECKOUT BAR */}
      {cartItems.length > 0 && (
        <div className="cart-mobile-sticky-bar">
          <div>
            <div className="text-muted small">Total</div>
            <div className="fw-extrabold fs-5 text-dark">₹{totalAmount}</div>
          </div>
          <button
            type="button"
            className="btn-checkout-primary"
            style={{ width: "auto", padding: "0 28px", height: "46px" }}
            onClick={handleCheckout}
          >
            Checkout →
          </button>
        </div>
      )}

      {/* ENLARGE ARTWORK MODAL */}
      {enlargedImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center z-3 p-3"
          onClick={() => setEnlargedImage(null)}
          style={{ zIndex: 1060 }}
        >
          <div
            className="bg-white p-4 rounded-4 text-center shadow-lg"
            style={{ maxWidth: "480px", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="fw-bold mb-3 fs-5">Custom Artwork Preview</h3>
            <img
              src={enlargedImage}
              alt="Uploaded custom artwork"
              className="rounded-3 img-fluid mb-3"
              style={{ maxHeight: "350px", objectFit: "contain" }}
            />
            <div>
              <button
                type="button"
                className="btn btn-dark rounded-pill px-4 py-2"
                onClick={() => setEnlargedImage(null)}
              >
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