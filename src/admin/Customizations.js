import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function Customizations() {
  const [customizations, setCustomizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enlargedImage, setEnlargedImage] = useState(null);

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
        toast.error("Failed to load customization requests ❌");
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchCustomizations();
  }, [fetchCustomizations]);


  const handleStatusUpdate = (id, status) => {
    axios
      .put(
        `https://ecommerce-backend-1-tsra.onrender.com/api/admin/customizations/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        toast.success(`Customization ${status.toLowerCase()} successfully ✨`);
        setCustomizations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: res.data.status || status } : c))
        );
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to update customization status ❌");
      });
  };

  const getStatusBadge = (status) => {
    if (status === "APPROVED") return <span className="badge bg-success">APPROVED ✓</span>;
    if (status === "REJECTED") return <span className="badge bg-danger">REJECTED ✕</span>;
    return <span className="badge bg-warning text-dark">PENDING ⏳</span>;
  };

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Customization Requests ✨</h2>
        <button className="btn btn-outline-dark btn-sm" onClick={fetchCustomizations}>
          Refresh 🔄
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading customization requests...</span>
          </div>
        </div>
      ) : customizations.length === 0 ? (
        <div className="card p-5 text-center shadow-sm border-0">
          <h5 className="text-muted">No customization requests submitted yet.</h5>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Req ID</th>
                  <th>Customer Name</th>
                  <th>Product Name</th>
                  <th>Design Preview</th>
                  <th>Custom Text</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customizations.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-bold">#{item.id}</td>
                    <td>{item.user?.username || "N/A"}</td>
                    <td className="fw-semibold">{item.product?.name || "N/A"}</td>
                    <td>
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt="Custom Design"
                          className="rounded border shadow-sm cursor-pointer"
                          style={{ width: "50px", height: "50px", objectFit: "cover", cursor: "pointer" }}
                          onClick={() => setEnlargedImage(item.imageUrl)}
                          title="Click to Enlarge"
                        />
                      ) : (
                        <span className="text-muted small">No Image</span>
                      )}
                    </td>
                    <td>
                      {item.customText ? (
                        <span className="badge bg-light text-dark border p-2">
                          "{item.customText}"
                        </span>
                      ) : (
                        <span className="text-muted small">N/A</span>
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
                    <td>{getStatusBadge(item.status)}</td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-success fw-semibold"
                          onClick={() => handleStatusUpdate(item.id, "APPROVED")}
                          disabled={item.status === "APPROVED"}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-danger fw-semibold"
                          onClick={() => handleStatusUpdate(item.id, "REJECTED")}
                          disabled={item.status === "REJECTED"}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ENLARGED IMAGE PREVIEW MODAL */}
      {enlargedImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center z-3"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="bg-white p-3 rounded text-center shadow-lg">
            <h6 className="fw-bold mb-2">Uploaded Design Image</h6>
            <img
              src={enlargedImage}
              alt="Enlarged custom design"
              style={{ maxWidth: "80vw", maxHeight: "70vh", objectFit: "contain" }}
            />
            <div className="mt-3">
              <button className="btn btn-secondary btn-sm" onClick={() => setEnlargedImage(null)}>
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
