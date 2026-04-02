import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { CartContext } from "./CartContext";
import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("ALL");

  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const url =
      category === "ALL"
        ? "http://localhost:8081/api/products"
        : `http://localhost:8081/api/products/category/${category}`;

    axios
      .get(url)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, [category]);

  return (
    <div className="container mt-4">
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

      <div className="row g-3">
        {products.map((p) => (
          <div className="col-6 col-md-3 col-lg-2" key={p.id}>
            <div className="card border-0 shadow-sm p-2 h-100">
              <img
                src={p.imageUrl}
                alt={p.name}
                className="img-fluid"
                style={{ height: "150px", objectFit: "cover" }}
              />

              <div className="mt-2">
                <h6 className="mb-1">{p.name}</h6>
                <p className="fw-bold mb-1">₹{p.price}</p>

                <button
                  className="btn btn-sm btn-success w-100"
                  onClick={() => {
                    addToCart(p);
                    alert(`${p.name} added to cart`);
                  }}
                >
                  Add
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