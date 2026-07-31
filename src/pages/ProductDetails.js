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

  const [reviewPage, setReviewPage] = useState(1);

  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const fetchReviews = useCallback((sortOpt = reviewSort) => {
    axios
      .get(`https://ecommerce-backend-1-tsra.onrender.com/api/reviews/${id}?sort=${sortOpt}`)
      .then((res) => setReviews(res.data || []))
      .catch(console.error);
  }, [id, reviewSort]);

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

    if (username) {
      axios
        .get(`https://ecommerce-backend-1-tsra.onrender.com/api/reviews/verified/${id}/${username}`)
        .then((res) => setIsVerifiedBuyer(res.data?.verified === true))
        .catch(console.error);
    }
  }, [id, username, fetchReviews]);

  if (!product) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading product details...</span>
        </div>
      </div>
    );
  }

  const isCustomizable =
    product.customizable === true ||
    (product.category && product.category.toLowerCase() === "custom clothing") ||
    (product.name && product.name.toLowerCase().includes("custom"));

  const isOut = product.quantity <= 0;
  const wishlisted = isWishlisted(product.id);

  // File Validation: JPG, PNG, WEBP, Max 5MB
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

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveCustomImage = () => {
    setCustomImageUrls([]);
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

  const totalReviewPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE) || 1;
  const currentReviews = reviews.slice(
    (reviewPage - 1) * REVIEWS_PER_PAGE,
    reviewPage * REVIEWS_PER_PAGE
  );

  return (
    <div className="container py-5">
      <div className="row g-5 align-items-start">
        {/* PRODUCT & CUSTOM REAL-TIME PREVIEW IMAGE */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm p-4 text-center rounded-5 bg-white position-relative overflow-hidden">
            <div className="position-relative d-flex align-items-center justify-content-center mx-auto rounded-4 overflow-hidden" style={{ width: "100%", minHeight: "360px", maxHeight: "480px", backgroundColor: "#F9FAFB" }}>
              <img
                src={product.imageUrl || "https://picsum.photos/400"}
                alt={product.name}
                className="img-fluid rounded-4 shadow-sm"
                style={{
                  maxHeight: "450px",
                  maxWidth: "100%",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  display: "block",
                  margin: "0 auto"
                }}
              />
            </div>

            {role !== "ROLE_ADMIN" && (
              <button
                className="position-absolute top-0 end-0 m-4 btn btn-light rounded-circle shadow border-0 p-2 d-flex align-items-center justify-content-center"
                style={{ width: "44px", height: "44px" }}
                onClick={() => toggleWishlist(product)}
                title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <span style={{ fontSize: "20px", color: wishlisted ? "#EF4444" : "#aaa" }}>
                  {wishlisted ? "❤️" : "🤍"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* DETAILS & CUSTOMIZATION CONTROLS */}
        <div className="col-12 col-md-6">
          <span className="badge rounded-pill bg-dark text-white px-3 py-1.5 text-xs mb-2">
            {product.category || "Premium Apparel"}
          </span>
          <h1 className="fw-extrabold text-dark mb-2" style={{ letterSpacing: "-1px" }}>{product.name}</h1>
          <p className="text-secondary mb-3">{product.description}</p>

          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="d-flex align-items-center text-warning fs-5">
              {"★".repeat(Math.round(avg))}
              <span className="ms-2 text-dark fs-6 fw-bold">({avg.toFixed(1)})</span>
            </div>
            <span className="text-muted small">• {reviews.length} Reviews</span>
          </div>

          <h2 className="fw-extrabold text-dark mb-4">₹{product.price}</h2>

          {/* 🎨 CUSTOM PRODUCT SECTION */}
          {isCustomizable && (
            <div className="card border-0 bg-light p-4 rounded-4 mb-4 shadow-sm">
              <h5 className="fw-bold text-dark mb-1">Customize Your Product ✨</h5>
              <p className="small text-muted mb-3">Upload your artwork and add personalized custom text.</p>

              {/* Drag and Drop Image Upload Zone */}
              <div
                className={`border-2 border-dashed rounded-4 p-4 text-center bg-white transition-all ${
                  isDragging ? "border-primary bg-primary-subtle" : "border-gray-300"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                style={{ cursor: "pointer" }}
              >
                <div className="fs-2 mb-1">🖼️</div>
                <h6 className="fw-bold mb-1">Drag & Drop Image Here</h6>
                <p className="small text-muted mb-2">Supported: JPG, PNG, WEBP (Max 5 MB)</p>

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

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="progress mt-3" style={{ height: "6px" }}>
                  <div className="progress-bar bg-dark" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}

              {/* Uploaded Preview */}
              {(customPreview || customImageUrls[0]) && (
                <div className="d-flex align-items-center justify-content-between bg-white p-3 rounded-3 border mt-3">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={customPreview || customImageUrls[0]}
                      alt="Uploaded preview"
                      className="rounded border"
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                    <div>
                      <small className="fw-bold d-block text-dark">Custom Design Ready</small>
                      <small className="text-success">✓ Verified format & size</small>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline-danger rounded-circle" onClick={handleRemoveCustomImage}>
                    ✕
                  </button>
                </div>
              )}

              {/* Custom Text Input */}
              <div className="mt-3">
                <label className="form-label small fw-bold text-dark mb-1">Custom Text</label>
                <input
                  type="text"
                  className="form-control rounded-3 border-0 shadow-sm"
                  placeholder='Enter text to print (e.g. "HOODIFY 2026")'
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                />
              </div>

              {/* PREMIUM DESIGN PREVIEW CARD */}
              {(customPreview || customImageUrls[0] || customText) && (
                <div className="card border-0 bg-white p-3 rounded-4 mt-4 shadow-sm">
                  <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center justify-content-between">
                    <span>✨ Design Preview</span>
                    <small className="badge bg-dark text-white fw-normal">Customization</small>
                  </h6>

                  <div className="row align-items-center g-3">
                    <div className="col-4 text-center">
                      <small className="text-muted d-block mb-1" style={{ fontSize: "11px" }}>Apparel</small>
                      <img
                        src={product.imageUrl || "https://picsum.photos/200"}
                        alt={product.name}
                        className="rounded-3 img-fluid border"
                        style={{ maxHeight: "80px", objectFit: "contain" }}
                      />
                      <small className="fw-bold text-dark d-block text-truncate mt-1" style={{ fontSize: "11px" }}>
                        {product.name}
                      </small>
                    </div>

                    <div className="col-4 text-center">
                      <small className="text-muted d-block mb-1" style={{ fontSize: "11px" }}>Artwork</small>
                      {customPreview || customImageUrls[0] ? (
                        <img
                          src={customPreview || customImageUrls[0]}
                          alt="Uploaded artwork preview"
                          className="rounded-3 img-fluid border shadow-sm"
                          style={{ maxHeight: "80px", objectFit: "contain" }}
                        />
                      ) : (
                        <div className="rounded-3 bg-light border p-2 text-muted small">No Image</div>
                      )}
                    </div>

                    <div className="col-4">
                      <small className="text-muted d-block mb-1" style={{ fontSize: "11px" }}>Custom Text</small>
                      <p className="fw-bold text-dark bg-light p-2 rounded-3 border mb-0 small text-truncate">
                        {customText ? `"${customText}"` : "None"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADD TO CART / GO TO CART BUTTONS */}
          <div className="d-flex gap-3 mt-4">
            <button
              className={`btn btn-lg flex-grow-1 rounded-pill py-3 fw-bold ${
                isOut ? "btn-secondary" : "btn-dark shadow"
              }`}
              disabled={isOut}
              onClick={handleAddToCart}
            >
              {isOut ? "OUT OF STOCK" : "Add To Cart"}
            </button>
            <button
              className="btn btn-outline-dark btn-lg rounded-pill px-4"
              onClick={() => navigate("/cart")}
            >
              Go to Cart
            </button>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* WRITE A REVIEW SECTION */}
      <div className="row justify-content-center mb-5">
        <div className="col-12 col-md-8">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
            <h5 className="fw-bold text-dark mb-3">Write a Customer Review</h5>

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
                  />
                </div>

                <button className="btn btn-dark rounded-pill px-4" onClick={submitReview}>
                  Submit Verified Review ✅
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REVIEWS LIST */}
      <div className="row justify-content-center">
        <div className="col-12 col-md-8">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="fw-bold m-0 text-dark">Customer Reviews ({reviews.length})</h4>
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

      {/* ENLARGE PREVIEW MODAL */}
      {enlargedImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center z-3"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="bg-white p-4 rounded-4 text-center shadow-lg">
            <h6 className="fw-bold mb-3">Custom Uploaded Artwork</h6>
            <img
              src={enlargedImage}
              alt="Enlarged design"
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

export default ProductDetails;