import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CartContext } from "./CartContext";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    axios
      .get(`https://ecommerce-backend-1-tsra.onrender.com/api/products/${id}`)
      .then((res) => {
        setProduct(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id]);

  if (!product) {
    return <h3 className="text-center mt-5">Loading...</h3>;
  }

  return (
    <div className="container mt-5 text-center">
      <h2>{product.name}</h2>

      <img
        src={product.imageUrl || "https://via.placeholder.com/300"}
        alt={product.name}
        className="img-fluid mb-3"
        style={{ maxWidth: "300px" }}
      />

      <p>{product.description}</p>
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
  );
}

export default ProductDetails;