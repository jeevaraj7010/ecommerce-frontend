import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../components/Pagination";
import "./Orders.css";

const ORDERS_PER_PAGE = 10;

function Orders() {
  const [orders, setOrders] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    setLoading(true);
    axios
      .get("https://ecommerce-backend-1-tsra.onrender.com/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data.content || []);
        setOrders(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 🔥 STATUS STEP CALCULATION
  const getStep = (status) => {
    if (status === "PENDING" || status === "PLACED") return 1;
    if (status === "SHIPPED") return 2;
    if (status === "DELIVERED") return 3;
    return 1;
  };

  // Pagination calculation (10 per page)
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE) || 1;
  const currentOrders = orders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4 fw-bold">My Orders 📦</h2>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading orders...</span>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-5">
          <p className="fs-5 text-muted">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <>
          {currentOrders.map((o) => {
            const step = getStep(o.status);

            return (
              <div className="order-card shadow-sm p-4 mb-4 border-0 rounded-4 bg-white" key={o.id}>
                {/* TOP SECTION */}
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div className="d-flex align-items-center gap-3">
                    {/* CUSTOM DESIGN PREVIEW */}
                    {o.designImageUrl && (
                      <div className="text-center">
                        <img
                          src={o.designImageUrl}
                          alt="Custom design"
                          className="custom-design-preview rounded"
                          style={{ width: "75px", height: "75px", objectFit: "cover" }}
                        />
                        <span className="badge bg-primary d-block mt-1 small">Custom</span>
                      </div>
                    )}

                    <div>
                      <h5 className="fw-bold mb-1">{o.productName}</h5>
                      <p className="text-muted small mb-1">Order ID: #{o.id}</p>
                      {o.customText && (
                        <p className="small mb-1 text-primary fw-semibold">
                          Customization Text: "{o.customText}"
                        </p>
                      )}
                      <p className="fw-bold text-success mb-0">₹{o.totalPrice} ({o.quantity} qty)</p>
                    </div>
                  </div>


                  {/* 3 DOT MENU */}
                  <div className="position-relative">
                    <span
                      className="menu-dots fs-4 cursor-pointer"
                      onClick={() => setOpenMenu(openMenu === o.id ? null : o.id)}
                      style={{ cursor: "pointer" }}
                    >
                      ⋮
                    </span>

                    {openMenu === o.id && (
                      <div className="menu-box border rounded p-2 bg-white shadow-sm position-absolute end-0 z-3" style={{ width: "140px" }}>
                        <p className="mb-1 cursor-pointer hover-bg p-1 rounded" style={{ cursor: "pointer" }}>View Details</p>
                        <p className="mb-1 cursor-pointer hover-bg p-1 rounded" style={{ cursor: "pointer" }}>Track Order</p>
                        {(o.status === "PENDING" || o.status === "PLACED") && (
                          <p className="mb-0 text-danger cursor-pointer hover-bg p-1 rounded" style={{ cursor: "pointer" }}>Cancel Order</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* STATUS BADGE */}
                <div className="mt-3">
                  <span className={`badge ${o.status === 'DELIVERED' ? 'bg-success' : o.status === 'SHIPPED' ? 'bg-info' : 'bg-warning text-dark'} px-3 py-2 fs-6`}>
                    {o.status}
                  </span>
                </div>

                {/* PROGRESS TRACKER */}
                <div className="progress-container mt-4">
                  <div className={`step ${step >= 1 ? "active" : ""}`}></div>
                  <div className={`step ${step >= 2 ? "active" : ""}`}></div>
                  <div className={`step ${step >= 3 ? "active" : ""}`}></div>
                </div>

                <div className="progress-labels d-flex justify-content-between small text-muted mt-2">
                  <span className={step >= 1 ? "fw-bold text-dark" : ""}>Ordered</span>
                  <span className={step >= 2 ? "fw-bold text-dark" : ""}>Shipped</span>
                  <span className={step >= 3 ? "fw-bold text-dark" : ""}>Delivered</span>
                </div>

                {/* TRACK BUTTON */}
                <button className="btn btn-dark w-100 mt-3 rounded-3">
                  Track Order 🚚
                </button>
              </div>
            );
          })}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => {
              setCurrentPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}
    </div>
  );
}

export default Orders;