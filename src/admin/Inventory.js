import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Pagination from "../components/Pagination";

const ITEMS_PER_PAGE = 10;

function Inventory() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // 'all', 'low', 'out'
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    axios
      .get("https://ecommerce-backend-1-tsra.onrender.com/api/products")
      .then((res) => {
        setProducts(res.data || []);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load inventory ❌");
      })
      .finally(() => setLoading(false));
  };

  const handleStockChange = (id, val) => {
    setEditingStock((prev) => ({
      ...prev,
      [id]: val,
    }));
  };

  const saveStockUpdate = (id) => {
    const newQty = parseInt(editingStock[id], 10);
    if (isNaN(newQty) || newQty < 0) {
      toast.error("Stock quantity must be a non-negative number ❌");
      return;
    }

    axios
      .put(`https://ecommerce-backend-1-tsra.onrender.com/api/products/${id}/stock`, {
        quantity: newQty,
      })
      .then((res) => {
        sessionStorage.removeItem("products_cache");
        toast.success(`Updated ${res.data.name} stock to ${newQty} ✅`);
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, quantity: newQty } : p))
        );
        setEditingStock((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to update stock ❌");
      });
  };

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(search.toLowerCase()));

      let matchesStock = true;
      if (stockFilter === "low") {
        matchesStock = p.quantity > 0 && p.quantity <= 5;
      } else if (stockFilter === "out") {
        matchesStock = p.quantity <= 0;
      }

      return matchesSearch && matchesStock;
    });
  }, [products, search, stockFilter]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h3 className="fw-bold m-0">Inventory Management 📦</h3>
        <button className="btn btn-outline-dark btn-sm rounded-pill" onClick={fetchProducts}>
          Refresh Inventory 🔄
        </button>
      </div>

      {/* Controls Bar */}
      <div className="row g-3 align-items-center mb-4">
        <div className="col-12 col-md-5">
          <input
            type="text"
            className="form-control rounded-pill px-3 shadow-sm border-0"
            placeholder="Search product name or category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="col-12 col-md-7 d-flex gap-2 justify-content-md-end">
          <button
            className={`btn btn-sm rounded-pill px-3 ${
              stockFilter === "all" ? "btn-dark fw-bold" : "btn-outline-secondary"
            }`}
            onClick={() => {
              setStockFilter("all");
              setCurrentPage(1);
            }}
          >
            All Stock
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 ${
              stockFilter === "low" ? "btn-warning text-dark fw-bold" : "btn-outline-warning text-dark"
            }`}
            onClick={() => {
              setStockFilter("low");
              setCurrentPage(1);
            }}
          >
            Low Stock (≤ 5)
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 ${
              stockFilter === "out" ? "btn-danger fw-bold" : "btn-outline-danger"
            }`}
            onClick={() => {
              setStockFilter("out");
              setCurrentPage(1);
            }}
          >
            Out of Stock (0)
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-5">
          <h5>Loading inventory records...</h5>
        </div>
      ) : currentProducts.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm p-4">
          <h5 className="fw-bold mb-2">No matching products found</h5>
          <p className="text-muted">Try resetting search filters.</p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Status</th>
                  <th>Current Stock</th>
                  <th>Quick Update</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((p) => {
                  const isOut = p.quantity <= 0;
                  const isLow = p.quantity > 0 && p.quantity <= 5;
                  const editVal = editingStock[p.id] !== undefined ? editingStock[p.id] : p.quantity;

                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={p.imageUrl || "https://picsum.photos/100"}
                            alt={p.name}
                            style={{ width: "45px", height: "45px", objectFit: "cover" }}
                            className="rounded"
                          />
                          <span className="fw-semibold">{p.name}</span>
                        </div>
                      </td>
                      <td>{p.category || "Uncategorized"}</td>
                      <td className="fw-bold text-success">₹{p.price}</td>
                      <td>
                        {isOut ? (
                          <span className="badge bg-danger">Out of Stock</span>
                        ) : isLow ? (
                          <span className="badge bg-warning text-dark">Low Stock ({p.quantity})</span>
                        ) : (
                          <span className="badge bg-success">In Stock</span>
                        )}
                      </td>
                      <td className="fw-bold fs-6">{p.quantity} units</td>
                      <td>
                        <div className="d-flex align-items-center gap-2" style={{ maxWidth: "180px" }}>
                          <input
                            type="number"
                            className="form-control form-control-sm rounded"
                            value={editVal}
                            min="0"
                            onChange={(e) => handleStockChange(p.id, e.target.value)}
                          />
                          <button
                            className="btn btn-sm btn-success text-nowrap"
                            onClick={() => saveStockUpdate(p.id)}
                          >
                            Save
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setCurrentPage(p)}
        />
      )}
    </div>
  );
}

export default Inventory;
