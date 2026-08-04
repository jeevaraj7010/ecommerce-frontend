import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AddressCard from "../components/address/AddressCard";
import AddAddressModal from "../components/address/AddAddressModal";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    district: "",
    pincode: "",
  });

  const [addresses, setAddresses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Address modal states
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    const fetchProfileAndAddresses = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const [resProfile, resAddresses] = await Promise.all([
          axios.get("https://ecommerce-backend-1-tsra.onrender.com/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          API.get("/api/profile/address"),
        ]);

        setProfile(resProfile.data || {});
        setAddresses(resAddresses.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndAddresses();
  }, []);

  const refreshAddresses = async () => {
    try {
      const res = await API.get("/api/profile/address");
      setAddresses(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenAdd = () => {
    if (addresses.length >= 5) {
      toast.warning("You can save a maximum of 5 delivery addresses. ⚠️");
      return;
    }
    setEditingAddress(null);
    setShowModal(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    setShowModal(true);
  };

  const handleSaveAddress = async (formData) => {
    try {
      if (formData.id) {
        await API.put(`/api/profile/address/${formData.id}`, formData);
        toast.success("Address updated successfully ✨");
      } else {
        await API.post("/api/profile/address", formData);
        toast.success("New address added successfully 🎉");
      }
      setShowModal(false);
      refreshAddresses();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save address ❌");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await API.put(`/api/profile/address/${id}/default`);
      toast.success("Primary address updated ⭐");
      refreshAddresses();
    } catch (err) {
      toast.error("Failed to set primary address ❌");
    }
  };

  const handleDeleteAddress = async (id) => {
    if (addresses.length <= 1) {
      toast.warning("At least one delivery address is required. ⚠️");
      return;
    }

    try {
      await API.delete(`/api/profile/address/${id}`);
      toast.success("Address deleted successfully 🗑️");
      refreshAddresses();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete address ❌");
    }
  };

  // Filtered addresses
  const filteredAddresses = addresses.filter((addr) => {
    const q = searchQuery.toLowerCase();
    const label = (addr.addressLabel || addr.addressType || "").toLowerCase();
    const street = (addr.street || "").toLowerCase();
    const city = (addr.city || "").toLowerCase();
    const pin = (addr.pincode || "").toLowerCase();
    return label.includes(q) || street.includes(q) || city.includes(q) || pin.includes(q);
  });

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading profile...</span>
        </div>
      </div>
    );
  }

  const colors = ["#ffc107", "#0d6efd", "#20c997", "#dc3545"];
  const avatarBg = colors[(profile.username || "U").length % colors.length];

  return (
    <div className="container py-5">
      <div className="row g-4">
        {/* LEFT COLUMN: USER PROFILE CARD (40%) */}
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm border-0 p-4 rounded-4 bg-white sticky-top" style={{ top: "90px" }}>
            <div className="text-center mb-4">
              <div
                className="rounded-circle text-white d-inline-flex align-items-center justify-content-center shadow-sm"
                style={{
                  width: "80px",
                  height: "80px",
                  background: avatarBg,
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              >
                {profile.username ? profile.username.charAt(0).toUpperCase() : "U"}
              </div>

              <h3 className="mt-3 mb-1 fw-extrabold text-dark">My Profile</h3>
              <p className="text-muted small">Manage your account details & saved addresses</p>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Username</label>
              <input className="form-control rounded-3 bg-light border-0" value={profile.username || ""} readOnly />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Email Address</label>
              <input className="form-control rounded-3 bg-light border-0" value={profile.email || "Not added"} readOnly />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">Phone Number</label>
              <input className="form-control rounded-3 bg-light border-0" value={profile.phone || "Not available"} readOnly />
            </div>

            <button
              className="btn btn-dark w-100 rounded-pill py-2.5 fw-bold shadow-sm"
              style={{ background: "#111827" }}
              onClick={() => navigate("/orders")}
            >
              View My Orders 🛍️
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: DELIVERY ADDRESS MANAGEMENT (60%) */}
        <div className="col-12 col-lg-8">
          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="fw-extrabold text-dark m-0">Delivery Addresses 🏠</h3>
              <p className="text-muted small m-0">
                Manage your saved delivery destinations & set a primary address
              </p>
            </div>

            <button
              className="btn btn-dark rounded-pill px-4 py-2 fw-bold shadow-sm"
              style={{ background: "#111827" }}
              onClick={handleOpenAdd}
            >
              + Add New Address
            </button>
          </div>

          {/* SEARCH ADDRESS BAR */}
          <div className="mb-4">
            <input
              type="text"
              className="form-control rounded-pill border-light bg-white shadow-sm px-4 py-2.5 text-sm"
              placeholder="🔍 Search address by nickname, street, city, or pincode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* SAVED ADDRESSES GRID */}
          {filteredAddresses.length === 0 ? (
            <div className="card border-0 shadow-sm p-5 text-center rounded-4 bg-white">
              <span className="fs-1 d-block mb-2 text-muted">🏠</span>
              <h5 className="fw-bold text-dark mb-1">No Addresses Found</h5>
              <p className="text-muted small mb-3">
                {searchQuery ? "No address matches your search query." : "You haven't saved any delivery addresses yet."}
              </p>
              <button
                className="btn btn-outline-dark rounded-pill px-4 py-2 fw-bold mx-auto"
                style={{ maxWidth: "220px" }}
                onClick={handleOpenAdd}
              >
                + Add Address Now
              </button>
            </div>
          ) : (
            <div className="row g-3">
              {filteredAddresses.map((addr) => (
                <div key={addr.id} className="col-12 col-md-6">
                  <AddressCard
                    address={addr}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteAddress}
                    onSetDefault={handleSetDefault}
                    isOnlyOne={addresses.length <= 1}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT ADDRESS MODAL */}
      <AddAddressModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveAddress}
        editingAddress={editingAddress}
      />
    </div>
  );
}

export default Profile;