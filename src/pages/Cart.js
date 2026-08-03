import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { toast } from "react-toastify";
import API from "../api/axios";
import DeliveryCheck from "../components/address/DeliveryCheck";
import "./Cart.css";

const DEFAULT_OFFERS = [
  {
    code: "SAVE10",
    description: "10% OFF on all orders above ₹1000",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minimumPurchase: 1000,
    maximumDiscount: 500,
    couponType: "GENERAL",
  },
  {
    code: "HOODIFY200",
    description: "Flat ₹200 OFF on orders above ₹2500",
    discountType: "FLAT",
    discountValue: 200,
    minimumPurchase: 2500,
    maximumDiscount: 200,
    couponType: "SPECIAL",
  },
  {
    code: "NEWUSER",
    description: "15% OFF for new customers",
    discountType: "PERCENTAGE",
    discountValue: 15,
    minimumPurchase: 500,
    maximumDiscount: 300,
    couponType: "NEW_USER",
  },
];

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
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();

  const totalAmount = getTotal();
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80";
  };

  // Fetch available coupons from backend
  useEffect(() => {
    API.get("/api/coupons/available")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setAvailableCoupons(res.data);
        } else {
          setAvailableCoupons(DEFAULT_OFFERS);
        }
      })
      .catch(() => {
        setAvailableCoupons(DEFAULT_OFFERS);
      });
  }, []);

  // Restore applied coupon from sessionStorage if present
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("hoodify_applied_coupon");
      if (saved) {
        setAppliedCoupon(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Calculate pricing breakdown
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const subtotalAfterDiscount = Math.max(0, totalAmount - discountAmount);
  
  // Free Shipping rule: Free if subtotal after discount >= 1500, else 99
  const shippingCharge = subtotalAfterDiscount >= 1500 ? 0 : 99;
  const savedShipping = shippingCharge === 0 ? 99 : 0;
  const totalSavings = discountAmount + savedShipping;
  const grandTotal = subtotalAfterDiscount + shippingCharge;

  // Free shipping progress bar (target: 1500)
  const shippingTarget = 1500;
  const remainingForFreeShipping = Math.max(0, shippingTarget - subtotalAfterDiscount);
  const shippingProgressPct = Math.min(100, Math.round((subtotalAfterDiscount / shippingTarget) * 100));

  // Auto Suggest Best Coupon calculation
  const getBestCoupon = () => {
    if (!availableCoupons || availableCoupons.length === 0 || totalAmount <= 0) return null;
    let best = null;
    let maxEstDiscount = 0;

    availableCoupons.forEach((c) => {
      if (totalAmount >= (c.minimumPurchase || 0)) {
        let est = 0;
        if (c.discountType === "PERCENTAGE") {
          est = totalAmount * (c.discountValue / 100);
        } else {
          est = c.discountValue;
        }
        if (c.maximumDiscount > 0) {
          est = Math.min(est, c.maximumDiscount);
        }
        if (est > maxEstDiscount) {
          maxEstDiscount = est;
          best = { ...c, estDiscount: Math.round(est) };
        }
      }
    });
    return best;
  };

  const bestOffer = getBestCoupon();

  const handleApplyCouponCode = async (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) {
      toast.info("Please enter a valid coupon code 🏷️");
      return;
    }

    setApplying(true);
    try {
      const payload = {
        coupon: code,
        cartTotal: totalAmount,
        cartItems: cartItems.map((i) => ({
          productId: i.id,
          category: i.category,
          price: i.price,
          quantity: i.quantity,
        })),
      };

      const res = await API.post("/api/coupons/apply", payload);

      if (res.data && res.data.success) {
        const couponData = {
          code: res.data.couponCode || code,
          discount: res.data.discount,
          shipping: res.data.shipping,
          subtotal: res.data.subtotal,
          finalTotal: res.data.finalTotal,
          totalSavings: res.data.totalSavings,
          description: res.data.description || "Coupon Applied Successfully",
        };

        setAppliedCoupon(couponData);
        sessionStorage.setItem("hoodify_applied_coupon", JSON.stringify(couponData));
        toast.success(res.data.message || `Coupon "${code}" applied successfully! 🎉`);
      } else {
        toast.error(res.data?.message || "Invalid coupon code ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to validate coupon ❌");
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    sessionStorage.removeItem("hoodify_applied_coupon");
    toast.info("Coupon removed 🗑️");
  };

  const handleCopyCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    toast.success(`Coupon "${code}" copied to clipboard! 📋`);
  };

  const handleCheckout = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.warning("Please login to continue checkout ⚠️");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    // Persist coupon summary for checkout
    if (appliedCoupon) {
      sessionStorage.setItem(
        "hoodify_applied_coupon",
        JSON.stringify({
          ...appliedCoupon,
          discount: discountAmount,
          shipping: shippingCharge,
          totalSavings: totalSavings,
          grandTotal: grandTotal,
        })
      );
    }

    navigate("/checkout");
  };

  return (
    <div className="cart-page-wrapper py-4">
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
            {/* LEFT COLUMN: PRODUCT CARDS & AVAILABLE OFFERS (70%) */}
            <div className="col-12 col-lg-8">
              {/* FREE SHIPPING VISUAL PROGRESS BAR */}
              <div
                className="p-3 mb-4 rounded-4 border bg-white shadow-sm"
                style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-bold text-dark small">
                    {remainingForFreeShipping > 0 ? (
                      <>
                        🚚 Add <strong>₹{remainingForFreeShipping}</strong> more to unlock <strong>FREE Shipping</strong>
                      </>
                    ) : (
                      <>🎉 <strong>Congratulations!</strong> You've unlocked FREE Shipping.</>
                    )}
                  </span>
                  <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2.5 py-1 rounded-pill">
                    {shippingProgressPct}% Unlocked
                  </span>
                </div>
                <div className="progress rounded-pill bg-light" style={{ height: "10px" }}>
                  <div
                    className="progress-bar bg-success rounded-pill"
                    role="progressbar"
                    style={{
                      width: `${shippingProgressPct}%`,
                      transition: "width 0.5s ease-in-out",
                    }}
                    aria-valuenow={shippingProgressPct}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>

              {/* PRODUCT CARDS LIST */}
              <div className="d-flex flex-column gap-3">
                {cartItems.map((item, index) => {
                  const customImg = item.customImageUrl || item.customImage;
                  const itemWishlisted = isWishlisted(item.id);

                  return (
                    <div key={index} className="cart-item-card">
                      <div className="row align-items-center g-3">
                        {/* LEFT: PRODUCT IMAGE */}
                        <div className="col-12 col-sm-auto text-center text-sm-start">
                          <div className="cart-image-wrapper mx-auto mx-sm-0">
                            <img
                              src={item.imageUrl || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80"}
                              alt={item.name}
                              loading="lazy"
                              onError={handleImageError}
                            />
                            {customImg && (
                              <div
                                className="cart-custom-thumb"
                                onClick={() => setEnlargedImage(customImg)}
                                title="Click to view custom artwork preview"
                              >
                                <img src={customImg} alt="Custom artwork preview" onError={handleImageError} />
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

                          {/* QUANTITY CONTROLS & ITEM SUBTOTAL */}
                          <div className="d-flex align-items-center justify-content-between mt-3 pt-2 border-top border-light flex-wrap gap-2">
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

              {/* AUTO SUGGEST BEST COUPON CARD */}
              {bestOffer && !appliedCoupon && (
                <div
                  className="mt-4 p-3.5 rounded-4 border bg-white shadow-sm d-flex align-items-center justify-content-between flex-wrap gap-3"
                  style={{
                    borderLeft: "4px solid #22c55e",
                    background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="fs-3">💡</span>
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-success text-white fw-bold px-2.5 py-1 rounded-pill small">
                          BEST OFFER AVAILABLE
                        </span>
                        <strong className="text-dark font-monospace">{bestOffer.code}</strong>
                      </div>
                      <small className="text-muted d-block mt-0.5">
                        Save <strong>₹{bestOffer.estDiscount}</strong> on this order! {bestOffer.description}
                      </small>
                    </div>
                  </div>
                  <button
                    onClick={() => handleApplyCouponCode(bestOffer.code)}
                    className="btn btn-sm btn-dark rounded-pill px-4 py-2 fw-bold shadow-sm"
                    style={{ background: "#111827" }}
                    disabled={applying}
                  >
                    {applying ? "Applying..." : "One-Click Apply ⚡"}
                  </button>
                </div>
              )}

              {/* PINCODE DELIVERY AVAILABILITY WIDGET */}
              <div className="mt-4">
                <DeliveryCheck />
              </div>

              {/* AVAILABLE COUPONS / OFFERS SECTION */}
              <div className="mt-4">
                <h5 className="fw-extrabold text-dark mb-3">Available Offers 🎟️</h5>
                <div className="row g-3">
                  {availableCoupons.map((offer, idx) => (
                    <div key={idx} className="col-12 col-md-6">
                      <div
                        className="card border-0 shadow-sm p-3 rounded-4 h-100 position-relative overflow-hidden"
                        style={{
                          background: "rgba(255, 255, 255, 0.9)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(229, 231, 235, 0.8)",
                          transition: "transform 0.2s ease, shadow 0.2s ease",
                        }}
                      >
                        {offer.bannerImage && (
                          <img
                            src={offer.bannerImage}
                            alt="Coupon Banner"
                            className="rounded-3 mb-2 w-100"
                            style={{ height: "90px", objectFit: "cover" }}
                            onError={handleImageError}
                          />
                        )}
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="badge bg-dark text-white font-monospace px-3 py-1.5 rounded-pill fs-6">
                            {offer.code}
                          </span>
                          <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2.5 py-1 rounded-pill small">
                            {offer.discountType === "PERCENTAGE" ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                          </span>
                        </div>
                        <p className="text-dark small fw-semibold mb-2">
                          {offer.description || `Get discount on orders above ₹${offer.minimumPurchase}`}
                        </p>
                        <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top">
                          <button
                            type="button"
                            className="btn btn-sm btn-light border rounded-pill px-3 py-1 text-muted small"
                            onClick={(e) => handleCopyCode(offer.code, e)}
                          >
                            Copy Code 📋
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-dark rounded-pill px-3.5 py-1 fw-bold"
                            style={{ background: "#111827" }}
                            onClick={() => handleApplyCouponCode(offer.code)}
                            disabled={applying || (appliedCoupon && appliedCoupon.code === offer.code)}
                          >
                            {appliedCoupon && appliedCoupon.code === offer.code ? "Applied ✓" : "Apply"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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

                {appliedCoupon && (
                  <div className="cart-summary-row text-success">
                    <span>
                      Coupon (<strong className="font-monospace">{appliedCoupon.code}</strong>)
                    </span>
                    <span className="fw-bold">-₹{discountAmount}</span>
                  </div>
                )}

                <div className="cart-summary-row">
                  <span>Delivery Fee</span>
                  <span className={`fw-bold ${shippingCharge === 0 ? "text-success" : "text-dark"}`}>
                    {shippingCharge === 0 ? "FREE" : `₹${shippingCharge}`}
                  </span>
                </div>

                <div className="cart-summary-row">
                  <span>Estimated Taxes</span>
                  <span className="text-muted">Included</span>
                </div>

                {totalSavings > 0 && (
                  <div className="p-2.5 bg-success bg-opacity-10 text-success rounded-3 text-center fw-bold small my-2">
                    🎉 You saved ₹{totalSavings} on this order!
                  </div>
                )}

                <div className="cart-divider my-3"></div>

                <div className="cart-summary-row total">
                  <span>Grand Total</span>
                  <span>₹{grandTotal}</span>
                </div>

                {/* APPLIED COUPON CARD OR COUPON INPUT FORM */}
                {appliedCoupon ? (
                  <div className="p-3 bg-light rounded-4 border mb-3">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="badge bg-success text-white fw-bold px-2.5 py-1 rounded-pill">
                        COUPON APPLIED ✓
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-danger text-decoration-none fw-bold p-0"
                        onClick={handleRemoveCoupon}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="fw-extrabold text-dark font-monospace fs-6">{appliedCoupon.code}</div>
                    <small className="text-muted d-block">{appliedCoupon.description}</small>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleApplyCouponCode();
                    }}
                    className="cart-coupon-wrapper mb-3"
                  >
                    <input
                      type="text"
                      className="cart-coupon-input"
                      placeholder="Enter Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <button type="submit" className="btn-coupon-apply" disabled={applying}>
                      {applying ? "Checking..." : "Apply"}
                    </button>
                  </form>
                )}

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
                <div className="cart-trust-grid mt-3">
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
            <div className="text-muted small">Grand Total</div>
            <div className="fw-extrabold fs-5 text-dark">₹{grandTotal}</div>
          </div>
          <button
            type="button"
            className="btn-checkout-primary"
            style={{ width: "auto", padding: "0 24px", height: "44px", fontSize: "14px" }}
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
              onError={handleImageError}
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