import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ ADD THIS
import { CartContext } from "./CartContext";
import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("ALL");

  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate(); // ✅ ADD THIS

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url =
          category === "ALL"
            ? "https://ecommerce-backend-1-tsra.onrender.com/api/products"
            : `https://ecommerce-backend-1-tsra.onrender.com/api/products/category/${category}`;

        const [productRes, ratingRes] = await Promise.all([
          axios.get(url),
          axios.get("https://ecommerce-backend-1-tsra.onrender.com/api/reviews/average/all"),
        ]);

        const ratingsMap = ratingRes.data;

        const updatedProducts = productRes.data.map((p) => ({
          ...p,
          rating: ratingsMap[p.id] || 0,
        }));

        setProducts(updatedProducts);

      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [category]);

  return (
    <div className="container mt-4">

      {/* Category Buttons */}
      <div className="d-flex justify-content-center gap-3 mb-4">
        <button className="btn btn-dark" onClick={() => setCategory("ALL")}>
          All
        </button>

        <button
          className="btn btn-outline-dark"
          onClick={() => setCategory("MEN")}
        >
          Men
        </button>

        <button
          className="btn btn-outline-dark"
          onClick={() => setCategory("WOMEN")}
        >
          Women
        </button>
      </div>

      {/* Products Grid */}
      <div className="row g-4">
        {products.map((p) => (
          <div className="col-6 col-md-4 col-lg-3" key={p.id}>

            {/* 🔥 MAKE CARD CLICKABLE */}
            <div
              className="card border-0 shadow-sm p-2 h-100 product-card"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/product/${p.id}`)}
            >

              {/* Image */}
              <img
                src={p.imageUrl || "https://via.placeholder.com/150"}
                alt={p.name}
                className="img-fluid rounded"
                style={{ height: "180px", objectFit: "cover" }}
              />

              {/* Content */}
              <div className="mt-2 text-center">

                <h6 className="fw-semibold">{p.name}</h6>

                {/* ⭐ Rating */}
                <div style={{ fontSize: "14px" }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      style={{
                        color: i < Math.round(p.rating) ? "gold" : "#ccc"
                      }}
                    >
                      ★
                    </span>
                  ))}
                  <span style={{ marginLeft: "5px", color: "#555" }}>
                    ({p.rating.toFixed(1)})
                  </span>
                </div>

                <p className="text-success fw-bold mb-2">₹{p.price}</p>

                {/* 🔥 PREVENT REDIRECT */}
                <button
                  className="btn btn-dark btn-sm w-100"
                  onClick={(e) => {
                    e.stopPropagation(); // ✅ VERY IMPORTANT
                    addToCart(p);
                    alert(`${p.name} added to cart`);
                  }}
                >
                  Add to Cart
                </button>

              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;