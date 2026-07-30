import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Pagination from "../components/Pagination";

const ORDERS_PER_PAGE = 10;

const NORMAL_STATUS_OPTIONS = [
  "PLACED",
  "PACKED",
  "SHIPPED",
  "OUT FOR DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const CUSTOM_STATUS_OPTIONS = [
  "PLACED",
  "PRINTING STARTED",
  "QUALITY CHECK",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function Orders() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  const fetchOrders = () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .get("https://ecommerce-backend-1-tsra.onrender.com/api/orders/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data.content || []);
        setOrders(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load orders ❌");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
    const token = localStorage.getItem("token");

    axios
      .put(
        `https://ecommerce-backend-1-tsra.onrender.com/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        toast.success(`Order status updated to ${newStatus} ✨`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to update order status ❌");
      });
  };

  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE) || 1;
  const currentOrders = orders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-extrabold text-dark m-0">Admin Order Management 📦</h2>
          <p className="text-muted small m-0">Manage customer order statuses & fulfillment workflows</p>
        </div>
        <button className="btn btn-outline-dark btn-sm rounded-pill" onClick={fetchOrders}>
          Refresh Orders 🔄
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading orders...</span>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center rounded-4">
          <p className="text-muted fs-5 m-0">No customer orders found.</p>
        </div>
      ) : (
        <>
          <div className="d-flex flex-column gap-3">
            {currentOrders.map((o) => {
              const isCustom = Boolean(o.designImageUrl || o.customText);
              const options = isCustom ? CUSTOM_STATUS_OPTIONS : NORMAL_STATUS_OPTIONS;
              const currentStatusUpper = (o.status || "").trim().toUpperCase();

              return (
                <div key={o.id} className="card border-0 shadow-sm p-3 rounded-4 bg-white">
                  <div className="row align-items-center g-3">
                    <div className="col-12 col-md-3 d-flex align-items-center gap-3">
                      {o.designImageUrl ? (
                        <div className="text-center position-relative">
                          <img
                            src={o.designImageUrl}
                            alt="Custom Design"
                            className="rounded-3 border border-primary cursor-pointer shadow-sm"
                            style={{ width: "60px", height: "60px", objectFit: "cover", cursor: "pointer" }}
                            onClick={() => setPreviewImage(o.designImageUrl)}
                            title="Click to enlarge design"
                          />
                          <small className="badge bg-primary d-block mt-1" style={{ fontSize: "9px" }}>Custom Print</small>
                        </div>
                      ) : (
                        <div className="rounded-3 bg-light p-3 fw-bold text-dark text-center" style={{ width: "60px", height: "60px" }}>
                          📦
                        </div>
                      )}

                      <div>
                        <h6 className="fw-bold text-dark mb-0 text-truncate">{o.productName}</h6>
                        <small className="text-muted d-block">Order #{o.id}</small>
                        <small className="text-muted d-block">Customer: {o.username}</small>
                      </div>
                    </div>

                    <div className="col-6 col-md-2">
                      <small className="text-muted d-block">Price & Qty</small>
                      <span className="fw-bold text-dark">₹{o.totalPrice}</span>
                      <small className="text-muted"> ({o.quantity} qty)</small>
                    </div>

                    <div className="col-6 col-md-3">
                      <small className="text-muted d-block mb-1">Current Status</small>
                      <span className={`badge rounded-pill px-3 py-1.5 ${
                        currentStatusUpper === 'DELIVERED' ? 'bg-success' : currentStatusUpper === 'CANCELLED' ? 'bg-danger' : 'bg-dark'
                      }`}>
                        {o.status}
                      </span>
                    </div>

                    {/* STATUS SELECTOR DROPDOWN */}
                    <div className="col-12 col-md-4">
                      <label className="form-label small text-muted fw-semibold mb-1">Update Status</label>
                      <select
                        className="form-select form-select-sm rounded-pill border-0 bg-light shadow-sm fw-semibold"
                        value={currentStatusUpper}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      >
                        {options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => {
                setCurrentPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        </>
      )}

      {/* ENLARGE PREVIEW MODAL */}
      {previewImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center z-3"
          onClick={() => setPreviewImage(null)}
        >
          <div className="bg-white p-4 rounded-4 text-center shadow-lg" style={{ maxWidth: "500px" }}>
            <h6 className="fw-bold mb-3">Custom Uploaded Artwork</h6>
            <img
              src={previewImage}
              alt="Enlarged design"
              className="rounded-3 img-fluid mb-3"
              style={{ maxHeight: "350px", objectFit: "contain" }}
            />
            <div>
              <button className="btn btn-secondary rounded-pill px-4" onClick={() => setPreviewImage(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;