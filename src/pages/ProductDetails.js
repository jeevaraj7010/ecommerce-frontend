import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { CartContext } from "./CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { toast } from "react-toastify";
import Pagination from "../components/Pagination";
import DeliveryCheck from "../components/address/DeliveryCheck";

const REVIEWS_PER_PAGE = 5;
const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { isWishlisted, toggleWishlist } = useContext(WishlistContext) || {
    isWishlisted: () => false,
    toggleWishlist: () => {},
  };

  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantitySelected, setQuantitySelected] = useState(1);

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [avg, setAvg] = useState(0);
  const [reviewSort, setReviewSort] = useState("newest");
  const [isVerifiedBuyer, setIsVerifiedBuyer] = useState(false);

  // Customization state
  const [customText, setCustomText] = useState("");
  const [customFile, setCustomFile] = useState(null);
  const [customPreview, setCustomPreview] = useState("");
  const [uploadedCustomUrl, setUploadedCustomUrl] = useState("");
  const [customImageUrls, setCustomImageUrls] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);

  // Mobile collapsible description
  const [descriptionOpen, setDescriptionOpen] = useState(true);

  // Hover zoom state
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  const [reviewPage, setReviewPage] = useState(1);

  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const fetchReviews = useCallback((sortOpt = reviewSort) => {
    API.get(`/api/reviews/${id}?sort=${sortOpt}`)
      .then((res) => setReviews(res.data || []))
      .catch(console.error);
  }, [id, reviewSort]);

  useEffect(() => {
    API.get(`/api/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        // Pre-select first available size if variants enabled
        if (res.data?.variants && res.data.variants.length > 0) {
          const firstAvail = res.data.variants.find((v) => v.available);
          if (firstAvail) {
            setSelectedSize(firstAvail.size);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load product details ❌");
      });

    fetchReviews();

    API.get(`/api/reviews/average/${id}`)
      .then((res) => setAvg(res.data || 0))
      .catch(console.error);

    if (username) {
      API.get(`/api/reviews/verified/${id}/${username}`)
        .then((res) => setIsVerifiedBuyer(res.data?.verified === true))
        .catch(console.error);
    }
  }, [id, username, fetchReviews]);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80";
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  if (!product) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading product details...</span>
        </div>
      </div>
    );
  }

  const galleryImages = (product.images && product.images.length > 0)
    ? product.images
    : [product.imageUrl || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80"];

  const currentMainImage = galleryImages[selectedImageIndex] || galleryImages[0];

  const isCustomizable =
    product.customizable === true ||
    (product.category && product.category.toLowerCase() === "custom clothing") ||
    (product.name && product.name.toLowerCase().includes("custom"));

  const hasVariants = Boolean(product.variantEnabled) || (product.variants && product.variants.length > 0);

  // Variant map
  const variantMap = {};
  if (product.variants) {
    product.variants.forEach((v) => {
      variantMap[v.size.toUpperCase()] = v;
    });
  }

  // Stock status check
  const selectedVariantObj = selectedSize ? variantMap[selectedSize.toUpperCase()] : null;
  const isOut = hasVariants
    ? (selectedVariantObj ? !selectedVariantObj.available : false)
    : product.quantity <= 0;

  const mrpPrice = Math.round(product.price * 1.5);
  const discountPct = Math.round(((mrpPrice - product.price) / mrpPrice) * 100);
  const wishlisted = isWishlisted(product.id);

  // File Upload Logic for Custom Hoodie
  const processAndCompressImage = (file) => {
    return new Promise((resolve, reject) => {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        reject("Invalid file format. Supported formats: JPG, PNG, WEBP ❌");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        reject("File size exceeds maximum limit of 5 MB ❌");
        return;
      }
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement("canvas");
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/webp", 0.85));
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject("Failed to read image file ❌");
      };
      img.src = objectUrl;
    });
  };

  const handleSelectedFile = async (file) => {
    if (!file) return;
    setCustomFile(file);
    const localPreview = URL.createObjectURL(file);
    setCustomPreview(localPreview);
    setIsUploading(true);
    setUploadProgress(30);

    try {
      const compressedUrl = await processAndCompressImage(file);
      setUploadProgress(70);
      const currentToken = localStorage.getItem("token");
      if (currentToken) {
        try {
          const formData = new FormData();
          formData.append("productId", product.id);
          formData.append("image", file);
          if (customText.trim()) formData.append("customText", customText);

          const res = await API.post("/api/customization/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (res.data?.imageUrl) setUploadedCustomUrl(res.data.imageUrl);
        } catch (err) {
          console.error("Customization upload error:", err);
        }
      }
      setUploadProgress(100);
      setCustomImageUrls([compressedUrl]);
      setIsUploading(false);
      setUploadProgress(0);
      toast.success("Design image uploaded & preview updated ✨");
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      toast.error(typeof error === "string" ? error : "Image processing failed ❌");
    }
  };

  const handleAddToCartAction = (navigateToCartAfter = false) => {
    if (hasVariants && !selectedSize) {
      toast.error("Please select a size ❌");
      return;
    }

    if (isOut) {
      toast.error("Selected size is out of stock ❌");
      return;
    }

    if (isCustomizable && !customFile && customImageUrls.length === 0 && !customPreview) {
      toast.warning("Please upload a custom design image 🎨");
      return;
    }

    let finalImageUrl = uploadedCustomUrl || (customImageUrls.length > 0 ? customImageUrls[0] : customPreview);

    const itemToAdd = {
      ...product,
      size: selectedSize || null,
      variantId: selectedVariantObj ? selectedVariantObj.id : null,
      customImageUrl: finalImageUrl || null,
      customText: customText.trim() || null,
    };

    addToCart(itemToAdd, quantitySelected);
    toast.success(`${product.name} (${selectedSize || "Standard"}) added to cart 🛒`);

    if (navigateToCartAfter) {
      navigate("/cart");
    }
  };

  const submitReview = () => {
    if (!token) {
      toast.error("Please login to submit a review ❌");
      return;
    }

    if (!isVerifiedBuyer) {
      toast.error("Only verified buyers with a delivered order can review this product ❌");
      return;
    }

    API.post("/api/reviews", { productId: id, username, rating, comment })
      .then(() => {
        toast.success("Review added ✅");
        fetchReviews(reviewSort);
        setComment("");
      })
      .catch((err) => toast.error(err.response?.data || "Review submission failed ❌"));
  };

  const totalReviewPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE) || 1;
  const currentReviews = reviews.slice(
    (reviewPage - 1) * REVIEWS_PER_PAGE,
    reviewPage * REVIEWS_PER_PAGE
  );

  return (
    <div className="container py-4 py-md-5 pb-5 mb-5 mb-md-0">
      {/* PRODUCT SECTION */}
      <div className="row g-4 g-md-5 align-items-start">
        
        {/* LEFT COLUMN: MULTI-IMAGE GALLERY */}
        <div className="col-12 col-md-6">
          <div className="d-flex flex-column-reverse flex-md-row gap-3">
            
            {/* THUMBNAIL LIST (Desktop & Mobile view) */}
            {galleryImages.length > 1 && (
              <div className="d-flex flex-row flex-md-column gap-2 overflow-auto justify-content-center justify-content-md-start" style={{ maxHeight: "480px" }}>
                {galleryImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className={`rounded-3 border cursor-pointer ${selectedImageIndex === idx ? "border-dark border-2 shadow-sm" : "opacity-75"}`}
                    style={{ width: "64px", height: "64px", objectFit: "cover", transition: "all 0.2s" }}
                    onClick={() => setSelectedImageIndex(idx)}
                    loading="lazy"
                    onError={handleImageError}
                  />
                ))}
              </div>
            )}

            {/* MAIN IMAGE DISPLAY WITH HOVER ZOOM */}
            <div className="card border-0 shadow-sm p-3 p-md-4 text-center rounded-5 bg-white position-relative flex-grow-1 overflow-hidden">
              <div
                className="position-relative d-flex align-items-center justify-content-center mx-auto rounded-4 overflow-hidden"
                style={{ width: "100%", minHeight: "280px", maxHeight: "480px", backgroundColor: "#F9FAFB", cursor: "zoom-in" }}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setEnlargedImage(currentMainImage)}
              >
                <img
                  src={currentMainImage}
                  alt={product.name}
                  className="img-fluid rounded-4 shadow-sm"
                  style={{
                    maxHeight: "450px",
                    maxWidth: "100%",
                    objectFit: "contain",
                    transition: isZoomed ? "none" : "transform 0.3s ease-in-out",
                    transform: isZoomed ? "scale(2)" : "scale(1)",
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }}
                  loading="lazy"
                  onError={handleImageError}
                  title="Hover to zoom, click to expand"
                />
              </div>

              {/* WISHLIST BUTTON */}
              {role !== "ROLE_ADMIN" && (
                <button
                  className="position-absolute top-0 end-0 m-3 btn btn-light rounded-circle shadow border-0 p-2 d-flex align-items-center justify-content-center"
                  style={{ width: "42px", height: "42px" }}
                  onClick={() => toggleWishlist(product)}
                  title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <span style={{ fontSize: "20px", color: wishlisted ? "#EF4444" : "#aaa" }}>
                    {wishlisted ? "❤️" : "🤍"}
                  </span>
                </button>
              )}

              {/* MOBILE IMAGE INDICATOR DOTS */}
              {galleryImages.length > 1 && (
                <div className="d-flex d-md-none justify-content-center gap-1.5 mt-3">
                  {galleryImages.map((_, idx) => (
                    <span
                      key={idx}
                      className={`rounded-circle ${selectedImageIndex === idx ? "bg-dark" : "bg-secondary opacity-50"}`}
                      style={{ width: "8px", height: "8px", cursor: "pointer" }}
                      onClick={() => setSelectedImageIndex(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRODUCT INFORMATION */}
        <div className="col-12 col-md-6">
          <span className="badge rounded-pill bg-dark text-white px-3 py-1.5 text-xs mb-2">
            {product.category || "Fashion Apparel"}
          </span>
          <h1 className="fw-extrabold text-dark mb-2 fs-3 fs-md-2" style={{ letterSpacing: "-0.5px" }}>
            {product.name}
          </h1>

          {/* RATING & REVIEWS */}
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="d-flex align-items-center text-warning fs-5">
              {"★".repeat(Math.round(avg))}
              <span className="ms-2 text-dark fs-6 fw-bold">({avg.toFixed(1)})</span>
            </div>
            <span className="text-muted small">• {reviews.length} Customer Reviews</span>
          </div>

          {/* PRICING BREAKDOWN */}
          <div className="d-flex align-items-baseline gap-3 mb-4">
            <h2 className="fw-extrabold text-dark mb-0 fs-2">₹{product.price}</h2>
            <span className="text-muted text-decoration-line-through fs-5">₹{mrpPrice}</span>
            <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2.5 py-1 text-xs fw-bold">
              {discountPct}% OFF
            </span>
          </div>

          {/* SIZE SELECTION UI */}
          {hasVariants && (
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <label className="fw-bold text-dark fs-6">Select Size</label>
                {selectedSize && (
                  <span className="small text-success fw-semibold">
                    Selected: {selectedSize}
                  </span>
                )}
              </div>

              <div className="d-flex flex-wrap gap-2">
                {ALL_SIZES.map((sz) => {
                  const varObj = variantMap[sz];
                  const existsInCatalog = varObj !== undefined;
                  const isAvailable = existsInCatalog && varObj.available;
                  const isSelected = selectedSize === sz;

                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={!isAvailable}
                      className={`btn rounded-3 fw-bold position-relative text-uppercase transition-all ${
                        isSelected
                          ? "btn-dark shadow"
                          : isAvailable
                          ? "btn-outline-dark"
                          : "btn-light text-muted border-secondary-subtle"
                      }`}
                      style={{
                        minWidth: "52px",
                        height: "46px",
                        cursor: isAvailable ? "pointer" : "not-allowed",
                        backgroundColor: !isAvailable ? "#E5E7EB" : undefined,
                        opacity: !isAvailable ? 0.7 : 1,
                        textDecoration: !isAvailable ? "line-through" : "none",
                      }}
                      onClick={() => isAvailable && setSelectedSize(sz)}
                      title={!isAvailable ? `${sz} - Out Of Stock` : `Select ${sz}`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>

              {hasVariants && !selectedSize && (
                <small className="text-danger d-block mt-1">
                  ⚠️ Size selection is mandatory for this product.
                </small>
              )}
            </div>
          )}

          {/* QUANTITY SELECTOR */}
          <div className="mb-4">
            <label className="fw-bold text-dark fs-6 mb-2 d-block">Quantity</label>
            <div className="d-flex align-items-center gap-2" style={{ maxWidth: "140px" }}>
              <button
                className="btn btn-outline-dark rounded-circle p-0 d-flex align-items-center justify-content-center"
                style={{ width: "36px", height: "36px" }}
                onClick={() => setQuantitySelected(Math.max(1, quantitySelected - 1))}
              >
                -
              </button>
              <span className="fw-bold fs-5 px-3">{quantitySelected}</span>
              <button
                className="btn btn-outline-dark rounded-circle p-0 d-flex align-items-center justify-content-center"
                style={{ width: "36px", height: "36px" }}
                onClick={() => setQuantitySelected(quantitySelected + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* CUSTOMIZABLE SECTION (preserved) */}
          {isCustomizable && (
            <div className="card border-0 bg-light p-3 p-md-4 rounded-4 mb-4 shadow-sm">
              <h5 className="fw-bold text-dark mb-1">Customize Your Product ✨</h5>
              <p className="small text-muted mb-3">Upload your artwork and add personalized custom text.</p>

              <div
                className={`border-2 border-dashed rounded-4 p-3 p-md-4 text-center bg-white transition-all ${
                  isDragging ? "border-primary bg-primary-subtle" : "border-gray-300"
                }`}
                style={{ cursor: "pointer" }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleSelectedFile(e.dataTransfer.files[0]);
                  }
                }}
              >
                <div className="fs-2 mb-1">🖼️</div>
                <h6 className="fw-bold mb-1 text-sm">Drag & Drop Image Here</h6>
                <p className="small text-muted mb-2" style={{ fontSize: "12px" }}>
                  Supported: JPG, PNG, WEBP (Max 5 MB)
                </p>

                <label className="btn btn-outline-dark btn-sm rounded-pill px-4 cursor-pointer">
                  Browse File
                  <input
                    type="file"
                    className="d-none"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => e.target.files[0] && handleSelectedFile(e.target.files[0])}
                    disabled={isUploading}
                  />
                </label>
              </div>

              {isUploading && (
                <div className="progress mt-3" style={{ height: "6px" }}>
                  <div className="progress-bar bg-dark" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}

              {(customPreview || customImageUrls[0]) && (
                <div className="d-flex align-items-center justify-content-between bg-white p-3 rounded-3 border mt-3">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={customPreview || customImageUrls[0]}
                      alt="Uploaded preview"
                      className="rounded border"
                      style={{ width: "48px", height: "48px", objectFit: "cover" }}
                    />
                    <div>
                      <small className="fw-bold d-block text-dark">Custom Artwork Ready</small>
                      <small className="text-success" style={{ fontSize: "11px" }}>
                        ✓ Verified format & size
                      </small>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline-danger rounded-circle p-1" onClick={() => setCustomPreview("")}>
                    ✕
                  </button>
                </div>
              )}

              <div className="mt-3">
                <label className="form-label small fw-bold text-dark mb-1">Custom Text</label>
                <input
                  type="text"
                  className="form-control rounded-3 border-0 shadow-sm"
                  placeholder='Enter text to print (e.g. "HOODIFY 2026")'
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  style={{ height: "44px", fontSize: "14px" }}
                />
              </div>
            </div>
          )}

          {/* ACTION BUTTONS (DESKTOP) */}
          <div className="d-none d-md-flex gap-3 mt-4">
            <button
              className={`btn btn-lg flex-grow-1 rounded-pill py-3 fw-bold ${
                isOut ? "btn-secondary" : "btn-dark shadow"
              }`}
              disabled={isOut}
              onClick={() => handleAddToCartAction(false)}
            >
              {isOut ? "OUT OF STOCK" : "Add To Cart"}
            </button>
            <button
              className="btn btn-outline-dark btn-lg flex-grow-1 rounded-pill py-3 fw-bold"
              disabled={isOut}
              onClick={() => handleAddToCartAction(true)}
            >
              Buy Now ⚡
            </button>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* DESCRIPTION SECTION (Collapsible on mobile) */}
      <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-5">
        <div className="d-flex align-items-center justify-content-between cursor-pointer" onClick={() => setDescriptionOpen(!descriptionOpen)}>
          <h4 className="fw-bold m-0 text-dark fs-5">Product Description 📄</h4>
          <span className="fs-5">{descriptionOpen ? "▲" : "▼"}</span>
        </div>
        {descriptionOpen && (
          <div className="mt-3 pt-3 border-top">
            <p className="text-secondary mb-0 leading-relaxed" style={{ fontSize: "15px", whiteSpace: "pre-line" }}>
              {product.description || "Premium fashion apparel designed with super soft fabric and durable stitching for all-day comfort."}
            </p>
          </div>
        )}
      </div>

      {/* DELIVERY INFORMATION */}
      <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-5">
        <h4 className="fw-bold text-dark fs-5 mb-3">Delivery Information 🚚</h4>
        <DeliveryCheck />
      </div>

      {/* REVIEWS SECTION */}
      <div className="row justify-content-center mb-5">
        <div className="col-12 col-md-10">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-4">
            <h4 className="fw-bold text-dark mb-3">Customer Reviews & Ratings ⭐</h4>

            {!token ? (
              <div className="alert alert-warning py-2 mb-0 small">
                Please login to submit a review for this product.
              </div>
            ) : !isVerifiedBuyer ? (
              <div className="alert alert-light border py-2 mb-0 small text-muted">
                🔒 Only verified buyers with a delivered order can review this product.
              </div>
            ) : (
              <div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted me-2">Your Rating:</label>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      style={{ fontSize: "22px", cursor: "pointer", color: star <= rating ? "#F59E0B" : "#D1D5DB" }}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>

                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control rounded-3 border-0 bg-light"
                    placeholder="Write your review experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ height: "46px" }}
                  />
                </div>

                <button className="btn btn-dark rounded-pill px-4" onClick={submitReview}>
                  Submit Verified Review ✅
                </button>
              </div>
            )}
          </div>

          {/* REVIEWS LIST */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h5 className="fw-bold m-0 text-dark">Reviews ({reviews.length})</h5>
            <select
              className="form-select form-select-sm rounded-pill w-auto border-0 shadow-sm"
              value={reviewSort}
              onChange={(e) => {
                setReviewSort(e.target.value);
                setReviewPage(1);
                fetchReviews(e.target.value);
              }}
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>

          {reviews.length === 0 ? (
            <p className="text-muted">No reviews yet for this product.</p>
          ) : (
            currentReviews.map((r) => (
              <div key={r.id} className="card border-0 shadow-sm p-4 mb-3 rounded-4 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold text-dark">{r.username}</span>
                  <div className="text-warning">{"★".repeat(r.rating)}</div>
                </div>
                <p className="text-secondary small mb-0">{r.comment}</p>
              </div>
            ))
          )}

          {reviews.length > 0 && (
            <Pagination
              currentPage={reviewPage}
              totalPages={totalReviewPages}
              onPageChange={(p) => setReviewPage(p)}
            />
          )}
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      <div className="d-flex d-md-none position-fixed bottom-0 start-0 w-100 bg-white p-3 border-top shadow-lg z-3 align-items-center justify-content-between gap-2" style={{ zIndex: 1030 }}>
        <div>
          <span className="small text-muted d-block" style={{ fontSize: "11px" }}>Total Price</span>
          <span className="fw-extrabold text-dark fs-5">₹{product.price * quantitySelected}</span>
        </div>
        <div className="d-flex gap-2">
          <button
            className={`btn btn-dark rounded-pill px-3 py-2 fw-bold text-xs ${isOut ? "btn-secondary" : ""}`}
            disabled={isOut}
            onClick={() => handleAddToCartAction(false)}
          >
            {isOut ? "OUT OF STOCK" : "Add to Cart"}
          </button>
          <button
            className="btn btn-outline-dark rounded-pill px-3 py-2 fw-bold text-xs"
            disabled={isOut}
            onClick={() => handleAddToCartAction(true)}
          >
            Buy Now ⚡
          </button>
        </div>
      </div>

      {/* ENLARGE PREVIEW MODAL */}
      {enlargedImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center z-3 p-3"
          style={{ zIndex: 1060 }}
          onClick={() => setEnlargedImage(null)}
        >
          <div className="bg-white p-4 rounded-4 text-center shadow-lg" style={{ maxWidth: "480px", width: "100%" }}>
            <h6 className="fw-bold mb-3">Product Image Preview</h6>
            <img
              src={enlargedImage}
              alt="Enlarged design"
              className="rounded-3 img-fluid mb-3"
              style={{ maxHeight: "380px", objectFit: "contain" }}
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

export default ProductDetails;