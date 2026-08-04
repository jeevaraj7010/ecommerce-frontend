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
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-extrabold text-dark m-0 fs-4">Order & Customer Fulfillment 📦</h2>
          <p className="text-muted small m-0">View customer order details & update shipping status</p>
        </div>
        <button className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-bold" onClick={fetchOrders}>
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
        <div className="card border-0 shadow-sm p-5 text-center rounded-4 bg-white">
          <p className="text-muted fs-5 m-0">No customer orders found.</p>
        </div>
      ) : (
        <>
          <div className="d-flex flex-column gap-3">
            {currentOrders.map((o) => {
              const isCustom = Boolean(o.designImageUrl || o.customText);
              const options = isCustom ? CUSTOM_STATUS_OPTIONS : NORMAL_STATUS_OPTIONS;
              const currentStatusUpper = (o.status || "").trim().toUpperCase();
              const customerName = o.deliveryName || o.username || "Customer";
              const customerPhone = o.deliveryPhone || o.phone || "Not provided";
              const customerEmail = o.email || o.userEmail || `${(o.username || "user").toLowerCase()}@hoodify.com`;
              const formattedDate = o.orderDate ? new Date(o.orderDate).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "Recent";

              return (
                <div key={o.id} className="card border-0 shadow-sm p-3 p-md-4 rounded-4 bg-white">
                  <div className="row align-items-start g-3">
                    
                    {/* PRODUCT & CUSTOM DESIGN PREVIEW */}
                    <div className="col-12 col-md-4 d-flex align-items-start gap-3">
                      {o.designImageUrl ? (
                        <div className="text-center position-relative flex-shrink-0">
                          <img
                            src={o.designImageUrl}
                            alt="Custom Design"
                            className="rounded-3 border border-primary cursor-pointer shadow-sm"
                            style={{ width: "64px", height: "64px", objectFit: "cover" }}
                            onClick={() => setPreviewImage(o.designImageUrl)}
                            title="Click to enlarge design"
                          />
                          <small className="badge bg-primary d-block mt-1 text-xs">Custom Print</small>
                        </div>
                      ) : (
                        <div className="rounded-3 bg-light p-3 fw-bold text-dark text-center flex-shrink-0" style={{ width: "64px", height: "64px" }}>
                          📦
                        </div>
                      )}

                      <div>
                        <h6 className="fw-bold text-dark mb-1 text-truncate" style={{ maxWidth: "200px" }}>{o.productName}</h6>
                        <span className="badge bg-dark text-white me-1">Order #{o.id}</span>
                        {o.size && <span className="badge bg-light text-dark border">Size: {o.size}</span>}
                        <small className="text-muted d-block mt-1">Date: {formattedDate}</small>
                      </div>
                    </div>

                    {/* COMPACT CUSTOMER DETAILS SECTION (SPECIFIC TO THIS ORDER) */}
                    <div className="col-12 col-md-4 bg-light p-3 rounded-3 border">
                      <h6 className="fw-bold text-dark mb-1 small">Customer Info 👤</h6>
                      <div className="small text-secondary">
                        <div><strong>Name:</strong> {customerName}</div>
                        <div><strong>Email:</strong> {customerEmail}</div>
                        <div><strong>Phone:</strong> {customerPhone}</div>
                        {o.deliveryAddress && <div><strong>Address:</strong> {o.deliveryAddress}</div>}
                        {o.deliveryCity && (
                          <div className="text-dark fw-semibold mt-1" style={{ fontSize: "11px" }}>
                            📍 {o.deliveryCity}, {o.deliveryState} - {o.deliveryPincode}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* PAYMENT & ORDER STATUS */}
                    <div className="col-12 col-md-4">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div>
                          <small className="text-muted d-block">Grand Total</small>
                          <span className="fw-extrabold text-dark fs-5">₹{o.totalPrice}</span>
                          <small className="text-muted"> ({o.quantity} qty)</small>
                        </div>
                        <div>
                          <small className="text-muted d-block">Payment</small>
                          <span className="badge bg-success bg-opacity-10 text-success fw-bold">PAID</span>
                        </div>
                      </div>

                      {o.couponCode && (
                        <small className="d-block text-success fw-bold font-monospace mb-2" style={{ fontSize: "11px" }}>
                          🎟️ {o.couponCode} (-₹{o.discountAmount})
                        </small>
                      )}

                      <div className="mt-2">
                        <label className="form-label small text-muted fw-semibold mb-1 d-block">Order Status</label>
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
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center z-3 p-3"
          style={{ zIndex: 1060 }}
          onClick={() => setPreviewImage(null)}
        >
          <div className="bg-white p-4 rounded-4 text-center shadow-lg" style={{ maxWidth: "500px", width: "100%" }}>
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