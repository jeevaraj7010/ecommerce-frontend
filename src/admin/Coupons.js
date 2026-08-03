import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";

function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [analytics, setAnalytics] = useState({
    activeCoupons: 0,
    totalCoupons: 0,
    totalUsed: 0,
    revenueGenerated: 0,
    totalDiscountGiven: 0,
    avgSavingsPerOrder: 0,
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, coupon: null });

  const initialFormState = {
    id: null,
    code: "",
    description: "",
    couponType: "GENERAL",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minimumPurchase: 500,
    maximumDiscount: 200,
    startDate: "",
    expiryDate: "",
    usageLimit: 100,
    perUserLimit: 1,
    category: "ALL",
    bannerImage: "",
    active: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchCouponsAndAnalytics = async () => {
    setLoading(true);
    try {
      const [resCoupons, resAnalytics] = await Promise.all([
        API.get("/api/admin/coupons"),
        API.get("/api/admin/coupons/analytics"),
      ]);
      setCoupons(resCoupons.data || []);
      if (resAnalytics.data) {
        setAnalytics(resAnalytics.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load coupon data ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouponsAndAnalytics();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const handleOpenEdit = (coupon) => {
    setIsEditing(true);
    setFormData({
      id: coupon.id,
      code: coupon.code || "",
      description: coupon.description || "",
      couponType: coupon.couponType || "GENERAL",
      discountType: coupon.discountType || "PERCENTAGE",
      discountValue: coupon.discountValue || 0,
      minimumPurchase: coupon.minimumPurchase || 0,
      maximumDiscount: coupon.maximumDiscount || 0,
      startDate: coupon.startDate ? coupon.startDate.substring(0, 16) : "",
      expiryDate: coupon.expiryDate ? coupon.expiryDate.substring(0, 16) : "",
      usageLimit: coupon.usageLimit || 0,
      perUserLimit: coupon.perUserLimit || 1,
      category: coupon.category || "ALL",
      bannerImage: coupon.bannerImage || "",
      active: coupon.active ?? true,
    });
    setShowModal(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.warning("Coupon Code is required 🏷️");
      return;
    }

    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        startDate: formData.startDate ? formData.startDate : null,
        expiryDate: formData.expiryDate ? formData.expiryDate : null,
      };

      if (isEditing) {
        await API.put(`/api/admin/coupons/${formData.id}`, payload);
        toast.success(`Coupon "${payload.code}" updated successfully! ✨`);
      } else {
        await API.post("/api/admin/coupons", payload);
        toast.success(`Coupon "${payload.code}" created successfully! 🎉`);
      }

      setShowModal(false);
      fetchCouponsAndAnalytics();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save coupon ❌");
    }
  };

  const handleToggleStatus = async (id, currentStatus, code) => {
    try {
      await API.put(`/api/admin/coupons/${id}/toggle`);
      toast.info(`Coupon "${code}" is now ${currentStatus ? "Disabled ⏸️" : "Activated ✅"}`);
      fetchCouponsAndAnalytics();
    } catch (err) {
      toast.error("Failed to update status ❌");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.coupon) return;
    try {
      await API.delete(`/api/admin/coupons/${deleteModal.coupon.id}`);
      toast.success(`Coupon "${deleteModal.coupon.code}" deleted successfully 🗑️`);
      setDeleteModal({ show: false, coupon: null });
      fetchCouponsAndAnalytics();
    } catch (err) {
      toast.error("Failed to delete coupon ❌");
    }
  };

  const getComputedStatus = (coupon) => {
    if (!coupon.active) return { label: "DISABLED", bg: "#6b7280" };
    const now = new Date();
    if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
      return { label: "EXPIRED", bg: "#ef4444" };
    }
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return { label: "LIMIT REACHED", bg: "#f59e0b" };
    }
    return { label: "ACTIVE", bg: "#22c55e" };
  };

  // Filtering
  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      typeFilter === "ALL" ||
      c.couponType === typeFilter ||
      c.discountType === typeFilter;

    const statusObj = getComputedStatus(c);
    const matchesStatus =
      statusFilter === "ALL" || statusObj.label === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div style={{ padding: "10px" }}>
      {/* HEADER & CREATE BUTTON */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-extrabold text-dark m-0" style={{ letterSpacing: "-0.5px" }}>
            Coupon Management 🎟️
          </h2>
          <p className="text-muted small m-0">
            Create, edit, analyze, and control promotional coupons
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn btn-dark rounded-pill px-4 py-2 fw-semibold shadow-sm"
          style={{ background: "#111827", border: "none" }}
        >
          + Create Coupon
        </button>
      </div>

      {/* TOP ANALYTICS CARDS (APPLE GLASSMORPHISM DESIGN) */}
      <div className="row g-3 mb-4">
        {[
          { title: "Active Coupons", value: analytics.activeCoupons || 0, icon: "⚡", color: "#22c55e" },
          { title: "Total Coupons", value: analytics.totalCoupons || 0, icon: "🏷️", color: "#3b82f6" },
          { title: "Coupons Used", value: `${analytics.totalUsed || 0} Times`, icon: "🎯", color: "#8b5cf6" },
          { title: "Revenue Generated", value: `₹${(analytics.revenueGenerated || 0).toLocaleString()}`, icon: "💰", color: "#10b981" },
          { title: "Discount Given", value: `₹${(analytics.totalDiscountGiven || 0).toLocaleString()}`, icon: "🎁", color: "#ec4899" },
          { title: "Avg Savings / Order", value: `₹${(analytics.avgSavingsPerOrder || 0).toLocaleString()}`, icon: "✨", color: "#f59e0b" },
        ].map((stat, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-lg-2">
            <div
              className="card border-0 shadow-sm p-3 rounded-4"
              style={{
                background: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(229, 231, 235, 0.8)",
                transition: "transform 0.2s ease",
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="small text-muted fw-bold">{stat.title}</span>
                <span className="fs-5">{stat.icon}</span>
              </div>
              <h4 className="fw-extrabold m-0" style={{ color: "#111827", fontSize: "1.25rem" }}>
                {stat.value}
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="card border-0 shadow-sm p-3 rounded-4 bg-white mb-4">
        <div className="row g-3">
          <div className="col-12 col-md-5">
            <input
              type="text"
              className="form-control rounded-pill border-light bg-light text-sm px-3"
              placeholder="🔍 Search coupon code or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select rounded-pill border-light bg-light text-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Types & Offers</option>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FLAT">Flat Discount</option>
              <option value="GENERAL">General</option>
              <option value="NEW_USER">New User</option>
              <option value="FIRST_ORDER">First Order</option>
              <option value="FESTIVAL">Festival</option>
              <option value="SPECIAL">Special</option>
            </select>
          </div>
          <div className="col-6 col-md-4">
            <select
              className="form-select rounded-pill border-light bg-light text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="LIMIT REACHED">LIMIT REACHED</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="DISABLED">DISABLED</option>
            </select>
          </div>
        </div>
      </div>

      {/* COUPONS TABLE */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead style={{ background: "#f8fafc", fontSize: "0.85rem" }}>
              <tr>
                <th className="py-3 px-4 text-muted fw-bold">COUPON CODE</th>
                <th className="py-3 px-3 text-muted fw-bold">TYPE</th>
                <th className="py-3 px-3 text-muted fw-bold">DISCOUNT</th>
                <th className="py-3 px-3 text-muted fw-bold">MIN PURCHASE</th>
                <th className="py-3 px-3 text-muted fw-bold">MAX DISCOUNT</th>
                <th className="py-3 px-3 text-muted fw-bold">EXPIRY DATE</th>
                <th className="py-3 px-3 text-muted fw-bold">STATUS</th>
                <th className="py-3 px-3 text-muted fw-bold text-center">USAGE</th>
                <th className="py-3 px-4 text-muted fw-bold text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">
                    Loading coupons...
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted fw-semibold">
                    No coupons found matching your query 🏷️
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const statusObj = getComputedStatus(coupon);
                  return (
                    <tr key={coupon.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-extrabold text-dark fs-6" style={{ fontFamily: "monospace" }}>
                            {coupon.code}
                          </span>
                          <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill small">
                            {coupon.couponType}
                          </span>
                        </div>
                        {coupon.description && (
                          <small className="text-muted d-block text-truncate" style={{ maxWidth: "200px" }}>
                            {coupon.description}
                          </small>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="fw-semibold small text-uppercase">
                          {coupon.discountType}
                        </span>
                        {coupon.category && coupon.category !== "ALL" && (
                          <small className="d-block text-primary fw-bold">Cat: {coupon.category}</small>
                        )}
                      </td>
                      <td className="py-3 px-3 fw-bold text-dark">
                        {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                      </td>
                      <td className="py-3 px-3 fw-semibold text-secondary">
                        ₹{coupon.minimumPurchase}
                      </td>
                      <td className="py-3 px-3 text-muted">
                        {coupon.maximumDiscount > 0 ? `₹${coupon.maximumDiscount}` : "No Limit"}
                      </td>
                      <td className="py-3 px-3 text-muted small">
                        {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString("en-IN") : "Never"}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className="badge rounded-pill px-3 py-1.5 fw-bold text-white"
                          style={{ background: statusObj.bg, fontSize: "0.75rem" }}
                        >
                          {statusObj.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="fw-bold text-dark">{coupon.usedCount}</span>
                        <span className="text-muted small">
                          /{coupon.usageLimit > 0 ? coupon.usageLimit : "∞"}
                        </span>
                        <small className="d-block text-muted" style={{ fontSize: "0.7rem" }}>
                          ({coupon.perUserLimit}/user)
                        </small>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <div className="d-flex align-items-center justify-content-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(coupon.id, coupon.active, coupon.code)}
                            className={`btn btn-sm rounded-pill px-2.5 py-1 ${coupon.active ? "btn-outline-secondary" : "btn-success"}`}
                            title={coupon.active ? "Disable Coupon" : "Enable Coupon"}
                          >
                            {coupon.active ? "Disable ⏸️" : "Enable ✅"}
                          </button>
                          <button
                            onClick={() => handleOpenEdit(coupon)}
                            className="btn btn-sm btn-outline-dark rounded-pill px-2.5 py-1"
                            title="Edit Coupon"
                          >
                            Edit ✏️
                          </button>
                          <button
                            onClick={() => setDeleteModal({ show: true, coupon })}
                            className="btn btn-sm btn-outline-danger rounded-pill px-2.5 py-1"
                            title="Delete Coupon"
                          >
                            Delete 🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center z-3 p-3"
          style={{ zIndex: 1050 }}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4 w-100"
            style={{ maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <h5 className="fw-extrabold m-0 text-dark">
                {isEditing ? "Edit Coupon ✏️" : "Create New Coupon 🎟️"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
              ></button>
            </div>

            <form onSubmit={handleSaveCoupon}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-dark">Coupon Code *</label>
                  <input
                    type="text"
                    className="form-control rounded-3 font-monospace text-uppercase"
                    placeholder="e.g. SAVE10"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-dark">Coupon Type</label>
                  <select
                    className="form-select rounded-3"
                    value={formData.couponType}
                    onChange={(e) => setFormData({ ...formData, couponType: e.target.value })}
                  >
                    <option value="GENERAL">GENERAL</option>
                    <option value="NEW_USER">NEW_USER</option>
                    <option value="FIRST_ORDER">FIRST_ORDER</option>
                    <option value="FESTIVAL">FESTIVAL</option>
                    <option value="SPECIAL">SPECIAL</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold text-dark">Description</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="e.g. 10% OFF on all orders above ₹1000"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-dark">Discount Type</label>
                  <select
                    className="form-select rounded-3"
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  >
                    <option value="PERCENTAGE">PERCENTAGE (%)</option>
                    <option value="FLAT">FLAT (₹)</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-dark">
                    Discount Value ({formData.discountType === "PERCENTAGE" ? "%" : "₹"}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control rounded-3"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-dark">Minimum Purchase (₹)</label>
                  <input
                    type="number"
                    className="form-control rounded-3"
                    value={formData.minimumPurchase}
                    onChange={(e) => setFormData({ ...formData, minimumPurchase: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-dark">Maximum Discount Cap (₹)</label>
                  <input
                    type="number"
                    className="form-control rounded-3"
                    placeholder="0 for no cap"
                    value={formData.maximumDiscount}
                    onChange={(e) => setFormData({ ...formData, maximumDiscount: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-dark">Start Date</label>
                  <input
                    type="datetime-local"
                    className="form-control rounded-3"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-dark">Expiry Date</label>
                  <input
                    type="datetime-local"
                    className="form-control rounded-3"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-dark">Global Usage Limit (0 = Unlimited)</label>
                  <input
                    type="number"
                    className="form-control rounded-3"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-dark">Per User Limit</label>
                  <input
                    type="number"
                    className="form-control rounded-3"
                    value={formData.perUserLimit}
                    onChange={(e) => setFormData({ ...formData, perUserLimit: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-dark">Category Restriction</label>
                  <select
                    className="form-select rounded-3"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="ALL">ALL (Entire Store)</option>
                    <option value="Hoodies">Hoodies</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Track Pants">Track Pants</option>
                    <option value="Custom">Custom Clothing</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-dark">Banner Image URL</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="https://..."
                    value={formData.bannerImage}
                    onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <div className="form-check form-switch mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="activeCheck"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    />
                    <label className="form-check-label fw-bold small text-dark" htmlFor="activeCheck">
                      Active & Valid for Customers
                    </label>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill px-4"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-dark rounded-pill px-4 fw-bold"
                  style={{ background: "#111827" }}
                >
                  {isEditing ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal.show && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center z-3 p-3"
          style={{ zIndex: 1060 }}
        >
          <div className="bg-white rounded-4 shadow-lg p-4 text-center" style={{ maxWidth: "420px", width: "100%" }}>
            <span className="fs-1 text-danger d-block mb-2">🗑️</span>
            <h5 className="fw-extrabold text-dark mb-2">Delete Coupon?</h5>
            <p className="text-muted small mb-3">
              Are you sure you want to delete coupon{" "}
              <strong className="text-dark">{deleteModal.coupon?.code}</strong>? This action cannot be undone.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button
                className="btn btn-light rounded-pill px-4 fw-semibold border"
                onClick={() => setDeleteModal({ show: false, coupon: null })}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm"
                onClick={handleDeleteConfirm}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Coupons;
