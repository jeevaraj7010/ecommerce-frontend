import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Pagination from "../components/Pagination";

const ORDERS_PER_PAGE = 10;

function Orders() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch orders
  useEffect(() => {
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
  }, []);

  // Ship with tracking
  const shipOrder = (id, trackingId, courier) => {
    const token = localStorage.getItem("token");

    if (!trackingId || !courier) {
      toast.warning("Please enter both Tracking ID and Courier name ⚠️");
      return;
    }

    axios
      .put(
        `https://ecommerce-backend-1-tsra.onrender.com/api/orders/${id}/ship`,
        { trackingId, courier },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        toast.success("Order shipped 🚚");

        setOrders((prev) =>
          prev.map((o) =>
            o.id === id
              ? { ...o, status: "SHIPPED", trackingId, courier }
              : o
          )
        );
      })
      .catch((err) => {
        console.error(err);
        toast.error("Shipping failed ❌");
      });
  };

  // Mark delivered
  const deliverOrder = (id) => {
    const token = localStorage.getItem("token");

    axios
      .put(
        `https://ecommerce-backend-1-tsra.onrender.com/api/orders/${id}/deliver`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        toast.success("Delivered 🎉");

        setOrders((prev) =>
          prev.map((o) =>
            o.id === id ? { ...o, status: "DELIVERED" } : o
          )
        );
      })
      .catch((err) => {
        console.error(err);
        toast.error("Update failed ❌");
      });
  };

  // Pagination calculation (10 per page)
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE) || 1;
  const currentOrders = orders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  return (
    <div className="container mt-4 py-2">
      <h2 className="mb-4 fw-bold">Admin Orders Dashboard 📦</h2>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading orders...</span>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted fs-5">No orders found.</p>
        </div>
      ) : (
        <>
          {currentOrders.map((o) => {
            let trackingInput = o.trackingId || "";
            let courierInput = o.courier || "";

            return (
              <div
                key={o.id}
                className="card p-3 mb-3 shadow-sm border-0"
                style={{ borderRadius: "14px" }}
              >
                <div className="row align-items-center g-3">
                  {/* CUSTOM DESIGN PREVIEW */}
                  <div className="col-12 col-md-3 d-flex align-items-center gap-3">
                    {o.designImageUrl ? (
                      <div className="text-center">
                        <img
                          src={o.designImageUrl}
                          alt="Custom Design"
                          className="custom-design-preview rounded cursor-pointer"
                          style={{ width: "70px", height: "70px", objectFit: "cover", cursor: "pointer" }}
                          onClick={() => setPreviewImage(o.designImageUrl)}
                          title="Click to Enlarge Custom Design"
                        />
                        <small className="d-block text-primary fw-bold mt-1">Custom Design</small>
                      </div>
                    ) : (
                      <span className="badge bg-secondary p-2">Standard Product</span>
                    )}

                    <div>
                      <h6 className="fw-bold mb-1">{o.productName}</h6>
                      <small className="text-muted d-block">Order #{o.id}</small>
                      <small className="text-muted d-block">Customer: {o.username}</small>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <p className="mb-1">Price: <b>₹{o.totalPrice}</b></p>
                    <p className="mb-0">Qty: <b>{o.quantity}</b></p>
                  </div>

                  <div className="col-6 col-md-2">
                    <span className={`badge ${o.status === 'DELIVERED' ? 'bg-success' : o.status === 'SHIPPED' ? 'bg-info' : 'bg-warning text-dark'} fs-6`}>
                      {o.status}
                    </span>
                  </div>

                  <div className="col-12 col-md-4">
                    {/* Tracking Inputs */}
                    {o.status !== "SHIPPED" && o.status !== "DELIVERED" && (
                      <div>
                        <div className="row g-2 mb-2">
                          <div className="col-6">
                            <input
                              type="text"
                              placeholder="Tracking ID"
                              className="form-control form-control-sm"
                              defaultValue={trackingInput}
                              onChange={(e) => (trackingInput = e.target.value)}
                            />
                          </div>
                          <div className="col-6">
                            <input
                              type="text"
                              placeholder="Courier Name"
                              className="form-control form-control-sm"
                              defaultValue={courierInput}
                              onChange={(e) => (courierInput = e.target.value)}
                            />
                          </div>
                        </div>

                        <button
                          className="btn btn-primary btn-sm w-100"
                          onClick={() =>
                            shipOrder(o.id, trackingInput, courierInput)
                          }
                        >
                          Ship Order 🚚
                        </button>
                      </div>
                    )}

                    {/* Deliver Button */}
                    {o.status === "SHIPPED" && (
                      <button
                        className="btn btn-success btn-sm w-100 mt-1"
                        onClick={() => deliverOrder(o.id)}
                      >
                        Mark Delivered ✅
                      </button>
                    )}
                  </div>
                </div>
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

      {/* ENLARGE PREVIEW MODAL */}
      {previewImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center z-3"
          onClick={() => setPreviewImage(null)}
        >
          <div className="bg-white p-3 rounded text-center max-vw-80 max-vh-80">
            <h6 className="fw-bold mb-2">Custom Uploaded Design</h6>
            <img
              src={previewImage}
              alt="Enlarged design"
              style={{ maxWidth: "80vw", maxHeight: "70vh", objectFit: "contain" }}
            />
            <div className="mt-3">
              <button className="btn btn-secondary btn-sm" onClick={() => setPreviewImage(null)}>
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