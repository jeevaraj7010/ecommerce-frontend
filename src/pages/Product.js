import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import { toast } from "react-toastify"; // 🔥 ADD THIS
import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);

  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, ratingRes] = await Promise.all([
          axios.get("https://ecommerce-backend-1-tsra.onrender.com/api/products"),
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
  }, []);

  return (
    <div className="container mt-4">

      <div className="row g-4">
        {products.map((p) => (
          <div className="col-6 col-md-4 col-lg-3" key={p.id}>

            <div
              className="card border-0 shadow-sm p-2 h-100 product-card"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/product/${p.id}`)}
            >

              <img
                src={p.imageUrl || "https://picsum.photos/300"}
                alt={p.name}
                className="img-fluid rounded"
                style={{ height: "180px", objectFit: "cover" }}
              />

              <div className="mt-2 text-center">

                <h6 className="fw-semibold">{p.name}</h6>

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

                <button
                  className="btn btn-dark btn-sm w-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(p);
                    toast.success(`${p.name} added to cart 🛒`); // 🔥 REPLACED
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