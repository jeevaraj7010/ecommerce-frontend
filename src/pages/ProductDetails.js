import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CartContext } from "./CartContext";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [avg, setAvg] = useState(0);

  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  // 🚀 Fetch data
  useEffect(() => {
    axios.get(`https://ecommerce-backend-1-tsra.onrender.com/api/products/${id}`)
      .then(res => setProduct(res.data));

    axios.get(`https://ecommerce-backend-1-tsra.onrender.com/api/reviews/${id}`)
      .then(res => setReviews(res.data));

    axios.get(`https://ecommerce-backend-1-tsra.onrender.com/api/reviews/average/${id}`)
      .then(res => setAvg(res.data));
  }, [id]);

  if (!product) return <h3 className="text-center mt-5">Loading...</h3>;

  // ⭐ Submit Review
  const submitReview = () => {
    axios.post(
      "https://ecommerce-backend-1-tsra.onrender.com/api/reviews",
      { productId: id, username, rating, comment },
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(() => {
      alert("Review added");
      window.location.reload();
    });
  };

  // ❌ Delete Review
  const deleteReview = (rid) => {
    axios.delete(
      `https://ecommerce-backend-1-tsra.onrender.com/api/reviews/${rid}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(() => {
      alert("Deleted");
      window.location.reload();
    });
  };

  // ✏️ Edit Review
  const editReview = (rid) => {
    axios.put(
      `https://ecommerce-backend-1-tsra.onrender.com/api/reviews/${rid}`,
      { rating, comment },
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(() => {
      alert("Updated");
      window.location.reload();
    });
  };

  return (
    <div className="container mt-5">

      {/* PRODUCT */}
      <div className="text-center">
        <h2>{product.name}</h2>

        <img
          src={product.imageUrl || "https://via.placeholder.com/300"}
          alt={product.name}
          className="img-fluid mb-3"
          style={{ maxWidth: "300px" }}
        />

        <p>{product.description}</p>

        {/* ⭐ Average Rating */}
        <div style={{ fontSize: "18px" }}>
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ color: i < Math.round(avg) ? "gold" : "#ccc" }}>
              ★
            </span>
          ))}
          <span style={{ marginLeft: "8px" }}>({avg.toFixed(1)})</span>
        </div>

        <h4>₹{product.price}</h4>

        <button
          className="btn btn-dark mt-3 me-2"
          onClick={() => {
            addToCart(product);
            alert("Added to cart");
          }}
        >
          Add to Cart
        </button>

        <button
          className="btn btn-outline-dark mt-3"
          onClick={() => navigate("/cart")}
        >
          Go to Cart
        </button>
      </div>

      <hr />

      {/* ADD REVIEW */}
      <div className="mt-4">
        <h4>Add Review</h4>

        {/* ⭐ Star Select */}
        <div>
          {[1,2,3,4,5].map(star => (
            <span
              key={star}
              style={{
                fontSize: "20px",
                cursor: "pointer",
                color: star <= rating ? "gold" : "#ccc"
              }}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>

        <input
          className="form-control mt-2"
          placeholder="Write your review"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button className="btn btn-success mt-2" onClick={submitReview}>
          Submit
        </button>
      </div>

      <hr />

      {/* REVIEWS LIST */}
      <div>
        <h4>Reviews</h4>

        {reviews.length === 0 ? (
          <p>No reviews yet</p>
        ) : (
          reviews.map(r => (
            <div key={r.id} className="border p-2 mb-2 rounded">

              <b>{r.username}</b>

              {/* ⭐ Stars */}
              <div>
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </div>

              <p>{r.comment}</p>

              {/* ✏️ Edit + Delete */}
              {r.username === username && (
                <>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => editReview(r.id)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteReview(r.id)}
                  >
                    Delete
                  </button>
                </>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default ProductDetails;