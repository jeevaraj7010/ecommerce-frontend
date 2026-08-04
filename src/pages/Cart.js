import React, { useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { toast } from "react-toastify";
import API from "../api/axios";
import "./Cart.css";

function Cart() {
  const {
    cartItems,
    addToCart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    getTotal,
  } = useContext(CartContext);

  const { toggleWishlist, isWishlisted } = useContext(WishlistContext) || {
    toggleWishlist: () => {},
    isWishlisted: () => false,
  };

  const navigate = useNavigate();

  // State Management
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [isCouponDrawerOpen, setIsCouponDrawerOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  const [allProducts, setAllProducts] = useState([]);

  const [savedForLater, setSavedForLater] = useState(() => {
    try {
      const saved = localStorage.getItem("hoodify_saved_for_later");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [enlargedImage, setEnlargedImage] = useState(null);

  // Sync Save For Later to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("hoodify_saved_for_later", JSON.stringify(savedForLater));
    } catch (e) {
      console.error("SavedForLater localStorage error", e);
    }
  }, [savedForLater]);

  // Fetch Available Coupons & Catalog Products
  useEffect(() => {
    API.get("/api/coupons/available")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setAvailableCoupons(res.data);
        } else {
          setAvailableCoupons([]);
        }
      })
      .catch(() => {
        setAvailableCoupons([]);
      });

    API.get("/api/products")
      .then((res) => {
        setAllProducts(res.data || []);
      })
      .catch((err) => console.error(err));
  }, []);

  // Restore Applied Coupon from SessionStorage
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

  const totalAmount = getTotal();
  const totalItemsCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // Price calculations
  const discountAmount = appliedCoupon ? appliedCoupon.discount || 0 : 0;
  const subtotalAfterDiscount = Math.max(0, totalAmount - discountAmount);
  const shippingCharge = subtotalAfterDiscount >= 1500 || totalAmount === 0 ? 0 : 99;
  const savedShipping = shippingCharge === 0 && subtotalAfterDiscount > 0 ? 99 : 0;
  const totalSavings = discountAmount + savedShipping;
  const grandTotal = subtotalAfterDiscount + shippingCharge;

  // Free Shipping Progress
  const shippingTarget = 1500;
  const remainingForFreeShipping = Math.max(0, shippingTarget - subtotalAfterDiscount);
  const shippingProgressPct = Math.min(100, Math.round((subtotalAfterDiscount / shippingTarget) * 100));

  // Image fallback handler
  const handleImageError = useCallback((e) => {
    e.target.onerror = null;
    e.target.src = "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80";
  }, []);

  // Coupon Application Logic
  const handleApplyCouponCode = async (codeToApply) => {
    const code = (codeToApply || couponCodeInput).trim().toUpperCase();
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
    setCouponCodeInput("");
    sessionStorage.removeItem("hoodify_applied_coupon");
    toast.info("Coupon removed 🗑️");
  };

  // Save For Later Actions
  const moveToSaveForLater = (index) => {
    const itemToSave = cartItems[index];
    if (!itemToSave) return;
    setSavedForLater((prev) => [...prev, itemToSave]);
    removeFromCart(index);
    toast.info(`${itemToSave.name} moved to Saved For Later 📌`);
  };

  const moveToCartFromSaved = (index) => {
    const itemToMove = savedForLater[index];
    if (!itemToMove) return;
    addToCart(itemToMove, itemToMove.quantity || 1);
    setSavedForLater((prev) => prev.filter((_, i) => i !== index));
    toast.success(`${itemToMove.name} moved back to Cart 🛒`);
  };

  const removeFromSavedForLater = (index) => {
    setSavedForLater((prev) => prev.filter((_, i) => i !== index));
    toast.info("Item removed from Saved For Later 🗑️");
  };

  // Smart Recommendations Engine
  const recommendedProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];

    const cartProductIds = new Set(cartItems.map((i) => i.id));
    const cartCategories = new Set(cartItems.map((i) => i.category).filter(Boolean));

    const candidates = allProducts.filter((p) => !cartProductIds.has(p.id));

    return candidates
      .sort((a, b) => {
        const aCatMatch = cartCategories.has(a.category) ? 1 : 0;
        const bCatMatch = cartCategories.has(b.category) ? 1 : 0;
        if (aCatMatch !== bCatMatch) return bCatMatch - aCatMatch;

        const avgCartPrice = totalAmount / (cartItems.length || 1);
        const aPriceDiff = Math.abs(a.price - avgCartPrice);
        const bPriceDiff = Math.abs(b.price - avgCartPrice);
        return aPriceDiff - bPriceDiff;
      })
      .slice(0, 6);
  }, [allProducts, cartItems, totalAmount]);

  const handleCheckoutNavigation = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Please login to continue to checkout ⚠️");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

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
    <div className="cart-page-bg py-3 py-md-5">
      <div className="container">
        
        {/* SHOPPING BAG HEADER */}
        <div className="d-flex align-items-center justify-content-between mb-3 mb-md-4 flex-wrap gap-2">
          <div>
            <h1 className="cart-main-title m-0">Shopping Bag</h1>
            <p className="cart-sub-title mb-0">
              {totalItemsCount > 0
                ? `${totalItemsCount} ${totalItemsCount === 1 ? "item" : "items"} in your shopping bag`
                : "Your shopping bag is empty"}
            </p>
          </div>

          {totalItemsCount > 0 && (
            <button
              className="btn btn-outline-dark btn-sm rounded-pill px-3 d-none d-md-inline-block"
              onClick={() => navigate("/products")}
            >
              Continue Shopping →
            </button>
          )}
        </div>

        {/* TRUST BAR (Desktop: horizontal row, Mobile: 2x2 grid) */}
        {cartItems.length > 0 && (
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white mb-4">
            <div className="d-none d-md-flex align-items-center justify-content-around text-muted small">
              <span>✔ Secure Payments</span>
              <span>✔ Easy Returns</span>
              <span>✔ Fast Shipping</span>
              <span>✔ Genuine Products</span>
            </div>

            <div className="d-grid d-md-none trust-grid-mobile gap-2 text-center text-muted small">
              <div className="p-2 bg-light rounded-3">✔ Secure</div>
              <div className="p-2 bg-light rounded-3">✔ Returns</div>
              <div className="p-2 bg-light rounded-3">✔ Shipping</div>
              <div className="p-2 bg-light rounded-3">✔ Genuine</div>
            </div>
          </div>
        )}

        {/* EMPTY CART VIEW */}
        {cartItems.length === 0 && savedForLater.length === 0 ? (
          <div className="card border-0 shadow-sm p-5 text-center rounded-4 bg-white mx-auto my-4" style={{ maxWidth: "520px" }}>
            <div className="empty-bag-illustration mb-3 mx-auto">
              <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <h3 className="fw-extrabold text-dark mb-2 fs-4">Your Shopping Bag is Empty</h3>
            <p className="text-secondary small mb-4">
              Looks like you haven't added anything yet. Explore our latest luxury apparel & custom collections!
            </p>
            <button
              className="btn btn-dark rounded-pill px-4 py-3 fw-bold mx-auto shadow"
              style={{ maxWidth: "240px", minHeight: "56px" }}
              onClick={() => navigate("/products")}
            >
              Continue Shopping →
            </button>
          </div>
        ) : (
          <div className="row g-4 align-items-start">
            
            {/* LEFT COLUMN: FREE SHIPPING + CART ITEMS + SAVED FOR LATER (70% DESKTOP) */}
            <div className="col-12 col-lg-8">
              
              {/* FREE SHIPPING PROGRESS BANNER */}
              {cartItems.length > 0 && (
                <div className="card border-0 shadow-sm p-3 p-md-4 rounded-4 bg-white mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fw-bold text-dark small">
                      {remainingForFreeShipping > 0 ? (
                        <>
                          🚚 You're only <strong>₹{remainingForFreeShipping}</strong> away from <strong>FREE Shipping</strong>
                        </>
                      ) : (
                        <>🎉 <strong>FREE Shipping Unlocked</strong></>
                      )}
                    </span>
                    <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2 py-1 rounded-pill" style={{ fontSize: "11px" }}>
                      {shippingProgressPct}% Unlocked
                    </span>
                  </div>

                  <div className="progress rounded-pill bg-light" style={{ height: "8px" }}>
                    <div
                      className="progress-bar rounded-pill"
                      style={{
                        width: `${shippingProgressPct}%`,
                        backgroundColor: "#10B981",
                        transition: "width 0.5s ease-in-out",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* CART ITEM CARDS LIST */}
              <div className="d-flex flex-column gap-3 mb-4">
                {cartItems.map((item, index) => {
                  const customImg = item.customImageUrl || item.customImage;

                  return (
                    <div key={index} className="card border-0 shadow-sm p-3 p-md-4 rounded-4 bg-white cart-item-card transition-all">
                      <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3">
                        
                        {/* ITEM IMAGE (DESKTOP: 140x170, TABLET: 120x150, MOBILE: 100x120) */}
                        <div className="cart-image-container mx-auto mx-sm-0 flex-shrink-0">
                          <img
                            src={item.imageUrl || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80"}
                            alt={item.name || "Product image"}
                            className="cart-product-img cursor-pointer"
                            loading="lazy"
                            decoding="async"
                            onError={handleImageError}
                            onClick={() => navigate(`/product/${item.id}`)}
                          />

                          {customImg && (
                            <div
                              className="position-absolute bottom-0 end-0 m-1 rounded-3 border border-dark overflow-hidden shadow-sm bg-white cursor-pointer"
                              style={{ width: "32px", height: "32px" }}
                              onClick={() => setEnlargedImage(customImg)}
                              title="Click to view custom design preview"
                            >
                              <img src={customImg} alt="Custom design preview" className="w-100 h-100" style={{ objectFit: "cover" }} onError={handleImageError} />
                            </div>
                          )}
                        </div>

                        {/* ITEM DETAILS & CONTROLS */}
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-start justify-content-between mb-2">
                            <div>
                              <h5
                                className="fw-bold text-dark mb-1 cursor-pointer fs-6 line-clamp-2"
                                onClick={() => navigate(`/product/${item.id}`)}
                              >
                                {item.name}
                              </h5>

                              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                                <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill" style={{ fontSize: "11px" }}>
                                  {item.category || "Hoodify Apparel"}
                                </span>

                                {item.size && (
                                  <span className="badge bg-dark text-white px-2.5 py-1 rounded-2" style={{ fontSize: "11px" }}>
                                    Size: {item.size}
                                  </span>
                                )}
                              </div>

                              {item.customText && (
                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 rounded-2 text-xs d-inline-block mb-2">
                                  ✨ Custom Text: "{item.customText}"
                                </span>
                              )}
                            </div>

                            {/* PRICE */}
                            <div className="text-end ps-2">
                              <span className="fw-extrabold text-dark fs-5 d-block">₹{item.price * item.quantity}</span>
                              <small className="text-muted" style={{ fontSize: "12px" }}>
                                ₹{item.price} each
                              </small>
                            </div>
                          </div>

                          {/* QUANTITY STEPPER (MINIMUM 44PX TOUCH TARGET) & ACTIONS */}
                          <div className="d-flex align-items-center justify-content-between pt-2 border-top flex-wrap gap-2">
                            
                            {/* QUANTITY STEPPER − 2 + */}
                            <div className="d-flex align-items-center gap-2 bg-light p-1 rounded-pill border">
                              <button
                                type="button"
                                className="btn btn-sm btn-light rounded-circle p-0 d-flex align-items-center justify-content-center fw-bold shadow-sm min-touch-target"
                                style={{ width: "36px", height: "36px" }}
                                disabled={item.quantity <= 1}
                                onClick={() => decreaseQty(index)}
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>

                              <span className="fw-extrabold px-2 small">{item.quantity}</span>

                              <button
                                type="button"
                                className="btn btn-sm btn-light rounded-circle p-0 d-flex align-items-center justify-content-center fw-bold shadow-sm min-touch-target"
                                style={{ width: "36px", height: "36px" }}
                                onClick={() => increaseQty(index)}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>

                            {/* ELEGANT ACTIONS */}
                            <div className="d-flex align-items-center gap-3">
                              <button
                                type="button"
                                className="btn btn-link btn-sm text-secondary text-decoration-none p-0 fw-semibold min-touch-target"
                                style={{ fontSize: "13px" }}
                                onClick={() => toggleWishlist(item)}
                              >
                                {isWishlisted(item.id) ? "❤️ Wishlisted" : "🤍 Wishlist"}
                              </button>

                              <button
                                type="button"
                                className="btn btn-link btn-sm text-secondary text-decoration-none p-0 fw-semibold min-touch-target"
                                style={{ fontSize: "13px" }}
                                onClick={() => moveToSaveForLater(index)}
                              >
                                ♡ Save for Later
                              </button>

                              <button
                                type="button"
                                className="btn btn-link btn-sm text-danger text-decoration-none p-0 fw-semibold min-touch-target"
                                style={{ fontSize: "13px" }}
                                onClick={() => removeFromCart(index)}
                              >
                                Remove
                              </button>
                            </div>

                          </div>

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SAVED FOR LATER SECTION */}
              {savedForLater.length > 0 && (
                <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-4">
                  <h5 className="fw-bold text-dark mb-3">Saved For Later ({savedForLater.length}) 📌</h5>
                  <div className="d-flex flex-column gap-3">
                    {savedForLater.map((sItem, sIdx) => (
                      <div key={sIdx} className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 border flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={sItem.imageUrl}
                            alt={sItem.name || "Saved item"}
                            className="rounded-3 border"
                            style={{ width: "54px", height: "54px", objectFit: "cover" }}
                            onError={handleImageError}
                          />
                          <div>
                            <h6 className="fw-bold text-dark mb-0 line-clamp-1">{sItem.name}</h6>
                            <span className="small text-muted">₹{sItem.price} {sItem.size ? `• Size: ${sItem.size}` : ""}</span>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          <button
                            className="btn btn-sm btn-dark rounded-pill px-3 fw-bold min-touch-target"
                            onClick={() => moveToCartFromSaved(sIdx)}
                          >
                            Move to Cart
                          </button>
                          <button
                            className="btn btn-sm text-danger p-1 border-0 bg-transparent min-touch-target"
                            onClick={() => removeFromSavedForLater(sIdx)}
                            title="Remove item"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: STICKY ORDER SUMMARY (30% DESKTOP) */}
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm p-4 rounded-4 bg-white sticky-summary-card">
                <h5 className="fw-extrabold text-dark mb-3 pb-2 border-bottom">Order Summary</h5>

                {/* PRICING BREAKDOWN */}
                <div className="d-flex justify-content-between mb-2 text-secondary small">
                  <span>Subtotal</span>
                  <span className="fw-bold text-dark">₹{totalAmount}</span>
                </div>

                {appliedCoupon && (
                  <div className="d-flex justify-content-between mb-2 text-success small">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="fw-bold">-₹{discountAmount}</span>
                  </div>
                )}

                <div className="d-flex justify-content-between mb-3 text-secondary small">
                  <span>Shipping</span>
                  <span className={`fw-bold ${shippingCharge === 0 ? "text-success" : "text-dark"}`}>
                    {shippingCharge === 0 ? "FREE" : `₹${shippingCharge}`}
                  </span>
                </div>

                <hr className="my-3" />

                <div className="d-flex justify-content-between align-items-baseline mb-4">
                  <span className="fw-extrabold text-dark fs-5">Grand Total</span>
                  <span className="fw-extrabold text-dark fs-3">₹{grandTotal}</span>
                </div>

                {/* ELEGANT 250MS EXPANDABLE COUPON DRAWER (Renders ONLY if active coupons exist in DB) */}
                {availableCoupons.length > 0 && (
                  <div className="mb-4 p-3 bg-light rounded-3 border">
                    <label className="fw-bold text-dark small mb-2 d-block">Apply Coupon</label>
                    <div className="d-flex gap-2 mb-2">
                      <input
                        type="text"
                        className="form-control form-control-sm rounded-pill border-0 shadow-sm uppercase px-3"
                        placeholder="Coupon Code"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      />
                      <button
                        className="btn btn-sm btn-dark rounded-pill px-3 fw-bold min-touch-target"
                        disabled={applying}
                        onClick={() => handleApplyCouponCode()}
                      >
                        Apply
                      </button>
                    </div>

                    {appliedCoupon ? (
                      <div className="d-flex align-items-center justify-content-between bg-white p-2 rounded border mt-2">
                        <span className="small fw-bold text-success">✓ {appliedCoupon.code} Applied</span>
                        <button className="btn btn-sm text-danger p-0" onClick={handleRemoveCoupon}>Remove</button>
                      </div>
                    ) : (
                      <div>
                        <button
                          type="button"
                          className="btn btn-link btn-sm text-dark p-0 text-decoration-none fw-bold min-touch-target"
                          style={{ fontSize: "12px" }}
                          onClick={() => setIsCouponDrawerOpen(!isCouponDrawerOpen)}
                        >
                          {isCouponDrawerOpen ? "▲ View Available Coupons" : `View Available Coupons ▼ (${availableCoupons.length})`}
                        </button>

                        <div className={`coupon-drawer ${isCouponDrawerOpen ? "open" : ""}`}>
                          <div className="pt-2 border-top d-flex flex-column gap-2 mt-2">
                            {availableCoupons.map((c) => (
                              <div key={c.code} className="bg-white p-2 rounded border d-flex align-items-center justify-content-between">
                                <div>
                                  <span className="badge bg-dark me-1">{c.code}</span>
                                  <small className="text-muted d-block" style={{ fontSize: "11px" }}>{c.description}</small>
                                </div>
                                <button
                                  className="btn btn-sm btn-outline-dark rounded-pill px-2 py-0 text-xs min-touch-target"
                                  onClick={() => handleApplyCouponCode(c.code)}
                                >
                                  Apply
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CHECKOUT BUTTONS (56px HEIGHT, 16px RADIUS) */}
                <button
                  className="btn btn-dark w-100 fw-bold shadow mb-2 fs-6 main-checkout-btn"
                  style={{ height: "56px", borderRadius: "16px" }}
                  onClick={handleCheckoutNavigation}
                >
                  Secure Checkout →
                </button>

                <button
                  className="btn btn-outline-dark w-100 fw-semibold fs-6"
                  style={{ height: "48px", borderRadius: "16px" }}
                  onClick={() => navigate("/products")}
                >
                  Continue Shopping
                </button>

              </div>
            </div>

          </div>
        )}

        {/* RECOMMENDED PRODUCTS SECTION ("Recommended For You") */}
        {recommendedProducts.length > 0 && (
          <div className="mt-5 pt-4">
            <h4 className="fw-extrabold text-dark mb-3">Recommended For You ✨</h4>
            <div className="row g-3">
              {recommendedProducts.map((rec) => (
                <div key={rec.id} className="col-6 col-md-4 col-lg-2">
                  <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-2 position-relative hover-elevate transition-all">
                    <img
                      src={rec.imageUrl}
                      alt={rec.name || "Recommended product"}
                      className="rounded-3 img-fluid mb-2 cursor-pointer"
                      style={{ height: "150px", width: "100%", objectFit: "cover" }}
                      loading="lazy"
                      decoding="async"
                      onError={handleImageError}
                      onClick={() => navigate(`/product/${rec.id}`)}
                    />
                    <h6 className="fw-bold text-dark text-truncate mb-1" style={{ fontSize: "13px" }}>{rec.name}</h6>
                    <span className="fw-extrabold text-dark d-block mb-2" style={{ fontSize: "14px" }}>₹{rec.price}</span>
                    <button
                      className="btn btn-sm btn-dark w-100 rounded-pill fw-bold text-xs min-touch-target"
                      onClick={() => {
                        addToCart(rec, 1);
                        toast.success(`${rec.name} added to cart 🛒`);
                      }}
                    >
                      Quick Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* MOBILE STICKY BOTTOM CHECKOUT BAR (Visible ONLY on mobile < 768px when cart is not empty) */}
      {cartItems.length > 0 && (
        <div className="d-flex d-md-none position-fixed bottom-0 start-0 w-100 bg-white p-3 border-top shadow-lg z-3 align-items-center justify-content-between gap-2 mobile-bottom-checkout-bar" style={{ zIndex: 1040 }}>
          <div>
            <span className="small text-muted d-block" style={{ fontSize: "11px" }}>{totalItemsCount} {totalItemsCount === 1 ? "Item" : "Items"}</span>
            <span className="fw-extrabold text-dark fs-5">₹{grandTotal}</span>
          </div>
          <button
            className="btn btn-dark rounded-pill px-4 py-2.5 fw-bold text-sm shadow min-touch-target"
            style={{ height: "48px" }}
            onClick={handleCheckoutNavigation}
          >
            Secure Checkout →
          </button>
        </div>
      )}

      {/* ENLARGE PREVIEW MODAL */}
      {enlargedImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center z-3 p-3"
          style={{ zIndex: 1060 }}
          onClick={() => setEnlargedImage(null)}
        >
          <div className="bg-white p-4 rounded-4 text-center shadow-lg" style={{ maxWidth: "480px", width: "100%" }}>
            <h6 className="fw-bold mb-3">Custom Artwork Preview</h6>
            <img
              src={enlargedImage}
              alt="Enlarged custom design preview"
              className="rounded-3 img-fluid mb-3"
              style={{ maxHeight: "360px", objectFit: "contain" }}
            />
            <div>
              <button className="btn btn-secondary rounded-pill px-4 min-touch-target" onClick={() => setEnlargedImage(null)}>
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