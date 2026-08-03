import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { toast } from "react-toastify";

const INITIAL_FORM = {
  id: null,
  fullName: "",
  phone: "",
  alternatePhone: "",
  addressType: "HOME",
  addressLabel: "Home",
  houseNo: "",
  street: "",
  landmark: "",
  pincode: "",
  city: "",
  district: "",
  state: "",
  deliveryInstructions: "",
  defaultAddress: false,
};

function AddAddressModal({ show, onClose, onSave, editingAddress }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [fetchingPincode, setFetchingPincode] = useState(false);

  useEffect(() => {
    if (editingAddress) {
      setForm({
        id: editingAddress.id,
        fullName: editingAddress.fullName || "",
        phone: editingAddress.phone || "",
        alternatePhone: editingAddress.alternatePhone || "",
        addressType: editingAddress.addressType || "HOME",
        addressLabel: editingAddress.addressLabel || "Home",
        houseNo: editingAddress.houseNo || "",
        street: editingAddress.street || "",
        landmark: editingAddress.landmark || "",
        pincode: editingAddress.pincode || "",
        city: editingAddress.city || "",
        district: editingAddress.district || "",
        state: editingAddress.state || "",
        deliveryInstructions: editingAddress.deliveryInstructions || "",
        defaultAddress: editingAddress.defaultAddress || false,
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [editingAddress, show]);

  // Handle pincode 6-digit auto lookup
  const handlePincodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setForm((prev) => ({ ...prev, pincode: val }));

    if (val.length === 6) {
      setFetchingPincode(true);
      API.get(`/api/location/pincode/${val}`)
        .then((res) => {
          if (res.data) {
            setForm((prev) => ({
              ...prev,
              city: res.data.city || prev.city,
              district: res.data.district || prev.district,
              state: res.data.state || prev.state,
            }));
            if (res.data.available) {
              toast.success(res.data.message || "Delivery available in this area ✓");
            } else {
              toast.warning(res.data.message || "Delivery unavailable in this area ❌");
            }
          }
        })
        .catch(() => {
          toast.error("Failed to lookup pincode ❌");
        })
        .finally(() => setFetchingPincode(false));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      toast.warning("Full name is required 👤");
      return;
    }

    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.trim())) {
      toast.warning("Enter a valid 10-digit phone number starting with 6, 7, 8, or 9 📱");
      return;
    }

    if (!form.houseNo.trim()) {
      toast.warning("House No / Flat No is required 🏠");
      return;
    }

    if (!form.street.trim()) {
      toast.warning("Area / Street is required 📍");
      return;
    }

    if (!form.pincode || form.pincode.length !== 6) {
      toast.warning("Enter a valid 6-digit pincode 📮");
      return;
    }

    onSave(form);
  };

  if (!show) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center z-3 p-3"
      style={{ zIndex: 1060 }}
    >
      <div
        className="bg-white rounded-4 shadow-lg p-4 w-100"
        style={{ maxWidth: "620px", maxHeight: "92vh", overflowY: "auto" }}
      >
        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
          <h5 className="fw-extrabold text-dark m-0">
            {form.id ? "Edit Address ✏️" : "Add Delivery Address 🏠"}
          </h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* FULL NAME & PHONE */}
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark">Full Name *</label>
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="e.g. Jeeva R"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark">Phone Number (10 digits) *</label>
              <input
                type="tel"
                className="form-control rounded-3"
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                maxLength="10"
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark">Alternate Phone (Optional)</label>
              <input
                type="tel"
                className="form-control rounded-3"
                placeholder="e.g. 9123456789"
                value={form.alternatePhone}
                onChange={(e) => setForm({ ...form, alternatePhone: e.target.value })}
                maxLength="10"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark">Address Type</label>
              <select
                className="form-select rounded-3"
                value={form.addressType}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm({
                    ...form,
                    addressType: val,
                    addressLabel: val === "HOME" ? "Home" : val === "OFFICE" ? "Office" : "Other",
                  });
                }}
              >
                <option value="HOME">🏠 Home</option>
                <option value="OFFICE">🏢 Office</option>
                <option value="OTHER">📍 Other</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label small fw-bold text-dark">Address Nickname / Label</label>
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="e.g. Parents House, Hostel, Rental House"
                value={form.addressLabel}
                onChange={(e) => setForm({ ...form, addressLabel: e.target.value })}
              />
            </div>

            {/* HOUSE NO & STREET */}
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark">House No / Flat No *</label>
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="e.g. Flat 4B, Building 12"
                value={form.houseNo}
                onChange={(e) => setForm({ ...form, houseNo: e.target.value })}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark">Area / Street *</label>
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="e.g. Anna Nagar, 2nd Main Road"
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark">Landmark (Optional)</label>
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="e.g. Near Metro Station"
                value={form.landmark}
                onChange={(e) => setForm({ ...form, landmark: e.target.value })}
              />
            </div>

            {/* PINCODE */}
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark">
                Pincode (6 digits) * {fetchingPincode && <span className="spinner-border spinner-border-sm text-primary"></span>}
              </label>
              <input
                type="text"
                className="form-control rounded-3 font-monospace"
                placeholder="e.g. 600001"
                value={form.pincode}
                onChange={handlePincodeChange}
                maxLength="6"
                required
              />
            </div>

            {/* AUTO FILLED READONLY LOCATION FIELDS */}
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-muted">City (Auto)</label>
              <input
                type="text"
                className="form-control rounded-3 bg-light border-0"
                value={form.city}
                readOnly
                placeholder="Auto-filled"
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-muted">District (Auto)</label>
              <input
                type="text"
                className="form-control rounded-3 bg-light border-0"
                value={form.district}
                readOnly
                placeholder="Auto-filled"
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-muted">State (Auto)</label>
              <input
                type="text"
                className="form-control rounded-3 bg-light border-0"
                value={form.state}
                readOnly
                placeholder="Auto-filled"
              />
            </div>

            {/* DELIVERY INSTRUCTIONS */}
            <div className="col-12">
              <label className="form-label small fw-bold text-dark">Delivery Instructions (Optional)</label>
              <select
                className="form-select rounded-3 mb-2"
                value={form.deliveryInstructions}
                onChange={(e) => setForm({ ...form, deliveryInstructions: e.target.value })}
              >
                <option value="">Select or type below...</option>
                <option value="Leave at security">Leave at security</option>
                <option value="Call before delivery">Call before delivery</option>
                <option value="Ring the bell">Ring the bell</option>
                <option value="Hand to neighbour">Hand to neighbour</option>
              </select>
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="Or custom instructions..."
                value={form.deliveryInstructions}
                onChange={(e) => setForm({ ...form, deliveryInstructions: e.target.value })}
              />
            </div>

            <div className="col-12">
              <div className="form-check form-switch mt-1">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="primaryAddressCheck"
                  checked={form.defaultAddress}
                  onChange={(e) => setForm({ ...form, defaultAddress: e.target.checked })}
                />
                <label className="form-check-label fw-bold small text-dark" htmlFor="primaryAddressCheck">
                  ⭐ Set as Primary / Default Delivery Address
                </label>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-dark rounded-pill px-4 fw-bold shadow-sm"
              style={{ background: "#111827" }}
            >
              {form.id ? "Save Changes" : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAddressModal;
