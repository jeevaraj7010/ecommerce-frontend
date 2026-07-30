import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function Customizations() {
  const [customizations, setCustomizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const token = localStorage.getItem("token");

  const fetchCustomizations = useCallback(() => {
    setLoading(true);
    axios
      .get("https://ecommerce-backend-1-tsra.onrender.com/api/admin/customizations", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCustomizations(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching admin customizations", err);
        toast.error("Failed to load customization submissions ❌");
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchCustomizations();
  }, [fetchCustomizations]);

  const triggerDownload = (imageUrl, fileName) => {
    if (!imageUrl) {
      toast.warning("No design image available for download ⚠️");
      return;
    }
    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName || "custom_design.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Design download started 📥");
      })
      .catch(() => {
        window.open(imageUrl, "_blank");
      });
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-extrabold text-dark m-0">Customer Customization Submissions ✨</h2>
          <p className="text-muted small m-0">Dashboard view for custom clothing design artwork & text</p>
        </div>
        <button className="btn btn-outline-dark btn-sm rounded-pill" onClick={fetchCustomizations}>
          Refresh Requests 🔄
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading submissions...</span>
          </div>
        </div>
      ) : customizations.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center rounded-4">
          <h5 className="text-muted m-0">No customer design submissions recorded yet.</h5>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th className="ps-4">Req ID</th>
                  <th>Customer Name</th>
                  <th>Product Name</th>
                  <th>Design Preview</th>
                  <th>Custom Text</th>
                  <th>Date</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customizations.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-bold ps-4">#{item.id}</td>
                    <td className="fw-semibold text-dark">{item.user?.username || "Guest Customer"}</td>
                    <td className="fw-semibold text-primary">{item.product?.name || "Custom Apparel"}</td>
                    <td>
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt="Custom artwork"
                          className="rounded-3 border cursor-pointer shadow-sm"
                          style={{ width: "48px", height: "48px", objectFit: "cover", cursor: "pointer" }}
                          onClick={() => setSelectedDetail(item)}
                          title="Click to view details"
                        />
                      ) : (
                        <span className="text-muted small">No Image</span>
                      )}
                    </td>
                    <td>
                      {item.customText ? (
                        <span className="badge bg-light text-dark border px-2.5 py-1.5 fw-semibold">
                          "{item.customText}"
                        </span>
                      ) : (
                        <span className="text-muted small">None</span>
                      )}
                    </td>
                    <td className="small text-muted">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-2">
                        {/* 1. VIEW DETAILS BUTTON */}
                        <button
                          className="btn btn-sm btn-dark rounded-pill px-3 py-1.5 fw-semibold"
                          onClick={() => setSelectedDetail(item)}
                        >
                          View Details 🔍
                        </button>

                        {/* 2. DOWNLOAD DESIGN BUTTON */}
                        {item.imageUrl && (
                          <button
                            className="btn btn-sm btn-outline-dark rounded-pill px-3 py-1.5 fw-semibold"
                            onClick={() => triggerDownload(item.imageUrl, `custom_design_${item.id}.png`)}
                          >
                            Download Design 📥
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {selectedDetail && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center z-3"
          style={{ zIndex: 1060 }}
        >
          <div className="bg-white p-4 rounded-4 shadow-lg text-start" style={{ maxWidth: "550px", width: "90%" }}>
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h5 className="fw-extrabold text-dark m-0">Customization Details #{selectedDetail.id}</h5>
              <button className="btn-close" onClick={() => setSelectedDetail(null)}></button>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <small className="text-muted d-block fw-semibold">Customer Name</small>
                <span className="fw-bold text-dark fs-6">{selectedDetail.user?.username || "Guest Customer"}</span>
              </div>
              <div className="col-6">
                <small className="text-muted d-block fw-semibold">Product Name</small>
                <span className="fw-bold text-primary fs-6">{selectedDetail.product?.name || "Custom Apparel"}</span>
              </div>
            </div>

            {selectedDetail.imageUrl && (
              <div className="mb-3 text-center bg-light p-3 rounded-4 border">
                <small className="text-muted d-block fw-bold mb-2">Uploaded Artwork Image</small>
                <img
                  src={selectedDetail.imageUrl}
                  alt="Customer design artwork"
                  className="rounded-3 img-fluid shadow-sm"
                  style={{ maxHeight: "280px", objectFit: "contain" }}
                />
              </div>
            )}

            <div className="mb-3">
              <small className="text-muted d-block fw-semibold">Custom Text</small>
              <p className="fw-bold text-dark bg-light p-2 rounded border mb-0">
                {selectedDetail.customText ? `"${selectedDetail.customText}"` : "No custom text requested"}
              </p>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-6">
                <small className="text-muted d-block fw-semibold">Submission Date</small>
                <span className="small text-dark">
                  {selectedDetail.createdAt ? new Date(selectedDetail.createdAt).toLocaleString() : "N/A"}
                </span>
              </div>
              <div className="col-6">
                <small className="text-muted d-block fw-semibold">Order Status</small>
                <span className="badge bg-dark rounded-pill px-3 py-1">
                  {selectedDetail.status || "RECIEVED"}
                </span>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              {selectedDetail.imageUrl && (
                <button
                  className="btn btn-dark rounded-pill px-4"
                  onClick={() => triggerDownload(selectedDetail.imageUrl, `design_${selectedDetail.id}.png`)}
                >
                  Download Design Artwork 📥
                </button>
              )}
              <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setSelectedDetail(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customizations;
