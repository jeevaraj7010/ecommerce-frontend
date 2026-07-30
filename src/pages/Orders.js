import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Pagination from "../components/Pagination";

const ORDERS_PER_PAGE = 8;

const NORMAL_STEPS = ["Placed", "Packed", "Shipped", "Out For Delivery", "Delivered"];
const CUSTOM_STEPS = ["Placed", "Printing Started", "Quality Check", "Packed", "Shipped", "Delivered"];

function Orders() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);

  const fetchOrders = () => {
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
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load orders ❌");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirmCancel = () => {
    if (!cancelModalOrder) return;
    const token = localStorage.getItem("token");

    setCancelling(true);
    axios
      .put(
        `https://ecommerce-backend-1-tsra.onrender.com/api/orders/${cancelModalOrder.id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        toast.success("Order Cancelled ✅");
        setOrders((prev) =>
          prev.map((o) => (o.id === cancelModalOrder.id ? { ...o, status: "CANCELLED" } : o))
        );
        setCancelModalOrder(null);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response?.data?.message || err.response?.data || "Failed to cancel order ❌");
      })
      .finally(() => setCancelling(false));
  };

  const getActiveStepIndex = (status, steps) => {
    if (!status) return 0;
    const normalized = status.toUpperCase().replace(/_/g, " ");
    const foundIdx = steps.findIndex((s) => s.toUpperCase() === normalized);
    return foundIdx !== -1 ? foundIdx : 0;
  };

  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE) || 1;
  const currentOrders = orders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  return (
    <div className="container py-5" style={{ minHeight: "80vh" }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-extrabold text-dark m-0" style={{ letterSpacing: "-0.5px" }}>My Orders 📦</h2>
          <p className="text-muted small m-0">Track real-time shipment status & custom printing progress</p>
        </div>
        <span className="badge rounded-pill bg-dark px-3 py-2 text-white">
          {orders.length} {orders.length === 1 ? "Order" : "Orders"}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading orders...</span>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center rounded-5 bg-white my-4">
          <div className="fs-1 mb-2 text-muted">📦</div>
          <h4 className="fw-bold mb-2">No Orders Found</h4>
          <p className="text-muted mb-4">You haven't placed any apparel or custom print orders yet.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {currentOrders.map((o) => {
            const isCustom = Boolean(o.designImageUrl || o.customText);
            const steps = isCustom ? CUSTOM_STEPS : NORMAL_STEPS;
            const currentStatusUpper = (o.status || "").trim().toUpperCase();

            // STRICT CANCELLATION ELIGIBILITY: ONLY STATUS = PLACED (or PENDING)
            const canCancel = currentStatusUpper === "PLACED" || currentStatusUpper === "PENDING";
            const activeStepIdx = currentStatusUpper === "CANCELLED" ? -1 : getActiveStepIndex(o.status, steps);

            return (
              <div key={o.id} className="card border-0 shadow-sm p-4 rounded-4 bg-white">
                {/* HEADER ROW */}
                <div className="d-flex flex-wrap align-items-center justify-content-between pb-3 border-bottom gap-3">
                  <div className="d-flex align-items-center gap-3">
                    {o.designImageUrl ? (
                      <div className="position-relative">
                        <img
                          src={o.designImageUrl}
                          alt="Custom print artwork"
                          className="rounded-3 border border-primary cursor-pointer shadow-sm"
                          style={{ width: "64px", height: "64px", objectFit: "cover", cursor: "pointer" }}
                          onClick={() => setEnlargedImage(o.designImageUrl)}
                          title="Click to enlarge artwork"
                        />
                        <span className="badge bg-primary position-absolute bottom-0 start-50 translate-middle-x mb-n2" style={{ fontSize: "9px" }}>
                          Custom Print
                        </span>
                      </div>
                    ) : (
                      <div
                        className="rounded-3 bg-light d-flex align-items-center justify-content-center fw-bold text-dark"
                        style={{ width: "64px", height: "64px", fontSize: "24px" }}
                      >
                        👕
                      </div>
                    )}

                    <div>
                      <h5 className="fw-bold text-dark mb-1">{o.productName}</h5>
                      <div className="d-flex align-items-center gap-2 small text-muted flex-wrap mb-1">
                        <span>Order ID: <b>#{o.id}</b></span>
                        <span>•</span>
                        <span>Qty: <b>{o.quantity}</b></span>
                        <span>•</span>
                        <span className="fw-bold text-dark">Total: ₹{o.totalPrice}</span>
                      </div>

                      <div className="d-flex align-items-center gap-2 text-xs flex-wrap">
                        <span className="badge bg-light text-dark border">
                          📅 Placed On: {o.orderDate ? new Date(o.orderDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                        <span className={`badge ${isCustom ? "bg-primary-subtle text-primary border border-primary" : "bg-success-subtle text-success border border-success"}`}>
                          🚚 {isCustom ? "Estimated Delivery: 7-10 Working Days" : "Estimated Delivery: 3-5 Working Days"}
                        </span>
                      </div>

                      {o.customText && (
                        <span className="badge bg-light text-dark border mt-1 small d-inline-block">
                          Custom Text: "{o.customText}"
                        </span>
                      )}
                    </div>
                  </div>

                  {/* STATUS BADGE & CANCEL BUTTON */}
                  <div className="d-flex align-items-center gap-3 ms-auto">
                    <span
                      className={`badge rounded-pill px-3 py-2 text-xs fw-bold ${
                        currentStatusUpper === "DELIVERED"
                          ? "bg-success text-white"
                          : currentStatusUpper === "CANCELLED"
                          ? "bg-danger text-white"
                          : "bg-dark text-white"
                      }`}
                    >
                      {o.status}
                    </span>

                    {canCancel && (
                      <button
                        className="btn btn-outline-danger btn-sm rounded-pill px-3 py-1.5 fw-semibold"
                        onClick={() => setCancelModalOrder(o)}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* ANIMATED MULTI-STEP ORDER TRACKER */}
                {currentStatusUpper === "CANCELLED" ? (
                  <div className="alert alert-danger mb-0 mt-4 rounded-4 d-flex align-items-center gap-2">
                    <span>⚠️</span>
                    <span className="fw-semibold">This order was cancelled. Restocked in inventory.</span>
                  </div>
                ) : (
                  <div className="pt-4 pb-2">
                    <div className="d-flex align-items-center justify-content-between position-relative px-2">
                      {steps.map((stepName, sIdx) => {
                        const isCompleted = sIdx <= activeStepIdx;
                        const isCurrent = sIdx === activeStepIdx;

                        return (
                          <div key={sIdx} className="d-flex flex-column align-items-center text-center flex-grow-1 position-relative z-2">
                            <div
                              className={`tracker-step-circle ${
                                isCompleted ? "active" : "inactive"
                              }`}
                            >
                              {isCompleted ? "✓" : sIdx + 1}
                            </div>
                            <span
                              className={`small mt-2 ${
                                isCurrent ? "fw-bold text-dark fs-6" : isCompleted ? "fw-semibold text-dark" : "text-muted"
                              }`}
                              style={{ fontSize: "11px" }}
                            >
                              {stepName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => {
              setCurrentPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}

      {/* CONFIRMATION MODAL FOR CANCELLATION */}
      {cancelModalOrder && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center z-3"
          style={{ zIndex: 1060 }}
        >
          <div className="bg-white p-4 rounded-4 shadow-lg text-center" style={{ maxWidth: "420px", width: "90%" }}>
            <div className="fs-1 mb-2 text-danger">⚠️</div>
            <h5 className="fw-extrabold text-dark mb-2">Cancel this order?</h5>
            <p className="text-secondary small mb-4">
              Are you sure you want to cancel this order? This action will immediately release reserved inventory.
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <button
                className="btn btn-danger rounded-pill px-4 py-2 fw-bold"
                onClick={handleConfirmCancel}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
              <button
                className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-bold"
                onClick={() => setCancelModalOrder(null)}
                disabled={cancelling}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

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

export default Orders;