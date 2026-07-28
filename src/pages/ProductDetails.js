import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CartContext } from "./CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { toast } from "react-toastify";
import Pagination from "../components/Pagination";

const REVIEWS_PER_PAGE = 5;

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { isWishlisted, toggleWishlist } = useContext(WishlistContext);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [avg, setAvg] = useState(0);
  const [reviewSort, setReviewSort] = useState("newest");
  const [distribution, setDistribution] = useState({ total: 0, stars: {} });
  const [isVerifiedBuyer, setIsVerifiedBuyer] = useState(false);

  // Multi-image upload, custom text & customization state
  const [customText, setCustomText] = useState("");
  const [customFile, setCustomFile] = useState(null);
  const [customPreview, setCustomPreview] = useState("");
  const [uploadedCustomUrl, setUploadedCustomUrl] = useState("");
  const [customImageUrls, setCustomImageUrls] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);

  // Pagination for reviews
  const [reviewPage, setReviewPage] = useState(1);

  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Fetch reviews with sorting
  const fetchReviews = useCallback((sortOpt = reviewSort) => {
    axios
      .get(`https://ecommerce-backend-1-tsra.onrender.com/api/reviews/${id}?sort=${sortOpt}`)
      .then((res) => setReviews(res.data || []))
      .catch(console.error);
  }, [id, reviewSort]);

  // 🚀 Fetch product & review data
  useEffect(() => {
    axios
      .get(`https://ecommerce-backend-1-tsra.onrender.com/api/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(console.error);

    fetchReviews();

    axios
      .get(`https://ecommerce-backend-1-tsra.onrender.com/api/reviews/average/${id}`)
      .then((res) => setAvg(res.data || 0))
      .catch(console.error);

    axios
      .get(`https://ecommerce-backend-1-tsra.onrender.com/api/reviews/distribution/${id}`)
      .then((res) => setDistribution(res.data || { total: 0, stars: {} }))
      .catch(console.error);

    if (username) {
      axios
        .get(`https://ecommerce-backend-1-tsra.onrender.com/api/reviews/verified/${id}/${username}`)
        .then((res) => setIsVerifiedBuyer(res.data?.verified === true))
        .catch(console.error);
    }
  }, [id, username, fetchReviews]);

  if (!product) return <h3 className="text-center mt-5">Loading product...</h3>;

  const isCustomizable =
    product.customizable === true ||
    (product.category && product.category.toLowerCase() === "custom clothing") ||
    (product.name && product.name.toLowerCase().includes("custom"));

  const isOut = product.quantity <= 0;
  const isLow = product.quantity > 0 && product.quantity <= 5;
  const wishlisted = isWishlisted(product.id);

  // 🎨 Image Compression & Dimension Validation
  const processAndCompressImage = (file) => {
    return new Promise((resolve, reject) => {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        reject("Invalid file format. Please upload JPG, PNG, or WEBP ❌");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        reject("File size exceeds 5MB limit ❌");
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        if (img.width < 300 || img.height < 300) {
          reject("Image dimensions too small. Minimum size is 300x300px for print quality ❌");
          return;
        }

        if (img.width > 5000 || img.height > 5000) {
          reject("Image dimensions too large. Maximum size is 5000x5000px ❌");
          return;
        }

        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/webp", 0.85);
        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject("Failed to read image file ❌");
      };

      img.src = objectUrl;
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCustomFile(file);
    const localPreview = URL.createObjectURL(file);
    setCustomPreview(localPreview);

    setIsUploading(true);
    setUploadProgress(20);

    try {
      setUploadProgress(50);
      const compressedUrl = await processAndCompressImage(file);
      setUploadProgress(90);

      // Attempt immediate upload to backend Cloudinary endpoint if logged in
      const currentToken = localStorage.getItem("token");
      if (currentToken) {
        try {
          const formData = new FormData();
          formData.append("productId", product.id);
          formData.append("image", file);
          if (customText.trim()) {
            formData.append("customText", customText);
          }

          const res = await axios.post(
            "https://ecommerce-backend-1-tsra.onrender.com/api/customization/upload",
            formData,
            { headers: { Authorization: `Bearer ${currentToken}`, "Content-Type": "multipart/form-data" } }
          );

          if (res.data && res.data.imageUrl) {
            setUploadedCustomUrl(res.data.imageUrl);
          }
        } catch (err) {
          console.error("Cloudinary endpoint upload fallback:", err);
        }
      }

      setTimeout(() => {
        setUploadProgress(100);
        setCustomImageUrls((prev) => [...prev, compressedUrl]);
        setIsUploading(false);
        setUploadProgress(0);
        toast.success("Design image ready for preview & upload ✨");
      }, 300);
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      toast.error(typeof error === "string" ? error : "Image processing failed ❌");
    }
  };

  const handleRemoveCustomImage = (indexToRemove) => {
    setCustomImageUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setCustomFile(null);
    setCustomPreview("");
    setUploadedCustomUrl("");
  };

  const handleAddToCart = async () => {
    if (isOut) {
      toast.error("This product is currently out of stock ❌");
      return;
    }

    if (isCustomizable && !customFile && customImageUrls.length === 0 && !customPreview) {
      toast.warning("Please upload a custom design image 🎨");
      return;
    }

    let finalImageUrl = uploadedCustomUrl || (customImageUrls.length > 0 ? customImageUrls[0] : customPreview);

    // If file is selected but hasn't uploaded yet and user is logged in, upload now
    if (isCustomizable && customFile && !uploadedCustomUrl) {
      const currentToken = localStorage.getItem("token");
      if (currentToken) {
        try {
          const formData = new FormData();
          formData.append("productId", product.id);
          formData.append("image", customFile);
          if (customText.trim()) {
            formData.append("customText", customText);
          }

          const res = await axios.post(
            "https://ecommerce-backend-1-tsra.onrender.com/api/customization/upload",
            formData,
            { headers: { Authorization: `Bearer ${currentToken}`, "Content-Type": "multipart/form-data" } }
          );

          if (res.data && res.data.imageUrl) {
            finalImageUrl = res.data.imageUrl;
            setUploadedCustomUrl(res.data.imageUrl);
          }
        } catch (err) {
          console.error("Customization upload error:", err);
        }
      }
    }

    const productToAdd = {
      ...product,
      customImageUrl: finalImageUrl || null,
      customImageUrls: finalImageUrl ? [finalImageUrl] : customImageUrls,
      customText: customText.trim() || null,
    };

    addToCart(productToAdd);
    toast.success(`${product.name} added to cart 🛒`);
  };


  // ⭐ Submit Review
  const submitReview = () => {
    if (!token) {
      toast.error("Please login to submit a review ❌");
      return;
    }

    if (!isVerifiedBuyer) {
      toast.error("Only verified buyers with a delivered order can review this product ❌");
      return;
    }

    axios
      .post(
        "https://ecommerce-backend-1-tsra.onrender.com/api/reviews",
        { productId: id, username, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        toast.success("Review added ✅");
        fetchReviews(reviewSort);
        setComment("");
      })
      .catch((err) => toast.error(err.response?.data || "Review submission failed ❌"));
  };

  // ❌ Delete Review
  const deleteReview = (rid) => {
    axios
      .delete(`https://ecommerce-backend-1-tsra.onrender.com/api/reviews/${rid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        toast.error("Deleted ❌");
        setReviews((prev) => prev.filter((r) => r.id !== rid));
      });
  };

  // ✏️ Edit Review
  const editReview = (rid) => {
    axios
      .put(
        `https://ecommerce-backend-1-tsra.onrender.com/api/reviews/${rid}`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        toast.info("Updated ✏️");
        setReviews((prev) =>
          prev.map((r) => (r.id === rid ? { ...r, rating, comment } : r))
        );
      });
  };

  const handleSortChange = (e) => {
    const sortVal = e.target.value;
    setReviewSort(sortVal);
    setReviewPage(1);
    fetchReviews(sortVal);
  };

  // Pagination for reviews (5 reviews per page)
  const totalReviewPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE) || 1;
  const currentReviews = reviews.slice(
    (reviewPage - 1) * REVIEWS_PER_PAGE,
    reviewPage * REVIEWS_PER_PAGE
  );

  return (
    <div className="container mt-5 py-3">
      {/* PRODUCT MAIN CONTAINER */}
      <div className="row justify-content-center align-items-center g-4">
        <div className="col-12 col-md-5 text-center position-relative">
          <div className="position-relative d-inline-block">
            <img
              src={product.imageUrl || "https://via.placeholder.com/300"}
              alt={product.name}
              className="img-fluid rounded shadow-sm"
              style={{ maxHeight: "350px", objectFit: "cover" }}
            />
            {role !== "ROLE_ADMIN" && (
              <button
                className="position-absolute top-0 end-0 m-3 btn btn-light rounded-circle shadow border-0 p-2"
                style={{ width: "42px", height: "42px", lineHeight: "1" }}
                onClick={() => toggleWishlist(product)}
                title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <span style={{ fontSize: "20px", color: wishlisted ? "red" : "#aaa" }}>
                  {wishlisted ? "❤️" : "🤍"}
                </span>
              </button>
            )}
            {isCustomizable && (
              <span className="position-absolute top-0 start-0 m-2 badge bg-primary">
                Customizable Product ✨
              </span>
            )}
          </div>
        </div>

        <div className="col-12 col-md-6">
          <h2>{product.name}</h2>
          <p className="text-muted">{product.description}</p>

          {/* ⭐ Average Rating & Stock Status */}
          <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
            <div className="d-flex align-items-center">
              <div style={{ fontSize: "18px" }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    style={{ color: i < Math.round(avg) ? "gold" : "#ccc" }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="ms-2 fw-semibold">({avg.toFixed(1)}) • {reviews.length} Reviews</span>
            </div>

            {/* Stock Badge */}
            <div>
              {isOut ? (
                <span className="badge bg-danger fs-6">🔴 Out of Stock</span>
              ) : isLow ? (
                <span className="badge bg-warning text-dark fs-6">
                  🟡 Only {product.quantity} Left
                </span>
              ) : (
                <span className="badge bg-success fs-6">🟢 In Stock ({product.quantity})</span>
              )}
            </div>
          </div>

          <h3 className="text-success fw-bold">₹{product.price}</h3>

          {/* 🎨 CUSTOMIZATION SECTION */}
          {isCustomizable && (
            <div className="card bg-light border-dashed p-3 my-3 shadow-sm rounded-3">
              <h5 className="fw-bold text-primary mb-3">Customize Your Product ✨</h5>

              {/* 1. Upload image option */}
              <div className="mb-3">
                <label className="form-label fw-semibold small">1. Upload Design Image 🖼️</label>
                <input
                  type="file"
                  className="form-control form-control-sm"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={isUploading}
                />
                <small className="text-muted d-block mt-1">Accepted: JPG, PNG, WEBP (Min 300x300px)</small>
              </div>

              {/* Progress Indicator */}
              {isUploading && (
                <div className="progress mb-3" style={{ height: "8px" }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                    role="progressbar"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}

              {/* 2. Image preview before upload / after select */}
              {(customPreview || customImageUrls.length > 0) && (
                <div className="mb-3">
                  <label className="form-label fw-semibold small">2. Image Preview 🔍</label>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <div className="position-relative d-inline-block">
                      <img
                        src={customPreview || customImageUrls[0]}
                        alt="Design Preview"
                        className="rounded border shadow-sm cursor-pointer"
                        style={{ width: "90px", height: "90px", objectFit: "cover", cursor: "pointer" }}
                        onClick={() => setEnlargedImage(customPreview || customImageUrls[0])}
                        title="Click to enlarge preview"
                      />
                      <button
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 rounded-circle"
                        style={{ width: "20px", height: "20px", fontSize: "10px", lineHeight: "1" }}
                        onClick={() => handleRemoveCustomImage(0)}
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                    <span className="small text-success fw-semibold">✓ Image uploaded & preview ready</span>
                  </div>
                </div>
              )}

              {/* 3. Optional custom text input */}
              <div className="mb-2">
                <label className="form-label fw-semibold small">3. Custom Text (Optional) ✍️</label>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-2"
                  placeholder='Enter your text (e.g. "Dream Big")'
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                />
              </div>
            </div>
          )}


          <div className="mt-4">
            <button
              className="btn btn-dark btn-lg me-2"
              onClick={handleAddToCart}
              disabled={isOut}
            >
              {isOut ? "Out of Stock 🔴" : "Add to Cart 🛒"}
            </button>
            <button
              className="btn btn-outline-dark btn-lg"
              onClick={() => navigate("/cart")}
            >
              Go to Cart
            </button>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* RATING DISTRIBUTION BREAKDOWN */}
      <div className="row justify-content-center mb-5">
        <div className="col-12 col-md-8">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-light">
            <h5 className="fw-bold mb-3">Rating Breakdown ⭐</h5>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution.stars?.[`${star}star`] || 0;
              const total = distribution.total || 1;
              const pct = Math.round((count / total) * 100);

              return (
                <div key={star} className="d-flex align-items-center gap-2 mb-2">
                  <span style={{ width: "40px", fontSize: "14px", fontWeight: "bold" }}>{star} ★</span>
                  <div className="progress flex-grow-1" style={{ height: "10px" }}>
                    <div
                      className="progress-bar bg-warning"
                      role="progressbar"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <span className="small text-muted" style={{ width: "60px", textAlign: "right" }}>
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ADD REVIEW FORM */}
      <div className="row justify-content-center">
        <div className="col-12 col-md-8">
          <h4 className="fw-bold">Write a Review</h4>

          {!token ? (
            <div className="alert alert-warning py-2 mb-3">
              Please login to submit a review for this product.
            </div>
          ) : !isVerifiedBuyer ? (
            <div className="alert alert-info py-2 mb-3 fw-semibold">
              🔒 Only verified buyers with a delivered order can review this product.
            </div>
          ) : (
            <div className="card p-3 shadow-sm border-0 mb-4">
              <div className="mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{
                      fontSize: "24px",
                      cursor: "pointer",
                      color: star <= rating ? "gold" : "#ccc",
                    }}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>

              <input
                className="form-control mb-3"
                placeholder="Share your experience with this item..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <button className="btn btn-success rounded-pill px-4" onClick={submitReview}>
                Submit Verified Review ✅
              </button>
            </div>
          )}
        </div>
      </div>

      <hr className="my-5" />

      {/* REVIEWS LIST */}
      <div className="row justify-content-center">
        <div className="col-12 col-md-8">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4 className="fw-bold m-0">Customer Reviews ({reviews.length})</h4>

            {/* Sort Dropdown */}
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted">Sort by:</span>
              <select
                className="form-select form-select-sm rounded-pill border-0 shadow-sm"
                value={reviewSort}
                onChange={handleSortChange}
              >
                <option value="newest">Newest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          </div>

          {reviews.length === 0 ? (
            <p className="text-muted">No reviews yet. Be the first to review!</p>
          ) : (
            currentReviews.map((r) => (
              <div key={r.id} className="card p-3 mb-3 shadow-sm border-0 rounded-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <b className="fs-6">{r.username}</b>
                    <span className="badge bg-success-subtle text-success border border-success rounded-pill" style={{ fontSize: "10px" }}>
                      Verified Buyer ✔️
                    </span>
                  </div>
                  <div style={{ color: "gold" }}>
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </div>
                </div>

                <p className="mt-2 mb-2 text-secondary">{r.comment}</p>

                {(r.username === username || role === "ROLE_ADMIN") && (
                  <div className="mt-2">
                    {r.username === username && (
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => editReview(r.id)}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteReview(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Reviews Pagination */}
          <Pagination
            currentPage={reviewPage}
            totalPages={totalReviewPages}
            onPageChange={(p) => setReviewPage(p)}
          />
        </div>
      </div>

      {/* CLICK TO ENLARGE MODAL */}
      {enlargedImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center z-3"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="bg-white p-3 rounded text-center">
            <h6 className="fw-bold mb-2">Uploaded Design Preview</h6>
            <img
              src={enlargedImage}
              alt="Enlarged design"
              style={{ maxWidth: "80vw", maxHeight: "70vh", objectFit: "contain" }}
            />
            <div className="mt-3">
              <button className="btn btn-secondary btn-sm" onClick={() => setEnlargedImage(null)}>
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