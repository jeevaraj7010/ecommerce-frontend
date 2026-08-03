import React from "react";

function AddressCard({ address, onEdit, onDelete, onSetDefault, isOnlyOne }) {
  if (!address) return null;

  const getTypeIcon = (type, label) => {
    const text = (label || type || "").toLowerCase();
    if (text.includes("office") || text.includes("work")) return "🏢";
    if (text.includes("parents")) return "🏡";
    if (text.includes("hostel") || text.includes("college")) return "🏫";
    if (text.includes("rental")) return "🏠";
    return "🏠";
  };

  const icon = getTypeIcon(address.addressType, address.addressLabel);
  const label = address.addressLabel || address.addressType || "Address";

  return (
    <div
      className="card border-0 shadow-sm p-3.5 rounded-4 h-100 position-relative"
      style={{
        background: address.defaultAddress
          ? "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)"
          : "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(12px)",
        border: address.defaultAddress
          ? "2px solid #22c55e"
          : "1px solid rgba(229, 231, 235, 0.8)",
        transition: "all 0.2s ease",
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex align-items-center gap-2">
          <span className="fs-5">{icon}</span>
          <span className="fw-extrabold text-dark text-uppercase fs-6">
            {label}
          </span>
        </div>
        {address.defaultAddress && (
          <span className="badge bg-success text-white fw-bold px-3 py-1 rounded-pill small">
            ⭐ Primary
          </span>
        )}
      </div>

      <div className="mb-2">
        <h6 className="fw-bold text-dark m-0">{address.fullName}</h6>
        <div className="text-muted small">
          📱 {address.phone}
          {address.alternatePhone && ` | Alt: ${address.alternatePhone}`}
        </div>
      </div>

      <div className="text-secondary small mb-3 leading-relaxed">
        {address.houseNo && <div>{address.houseNo},</div>}
        <div>{address.street}</div>
        {address.landmark && (
          <div className="text-muted fst-italic">Landmark: {address.landmark}</div>
        )}
        <div className="fw-semibold text-dark mt-1">
          {address.city}, {address.district}, {address.state} - {address.pincode}
        </div>
      </div>

      {address.deliveryInstructions && (
        <div className="mb-3 p-2 bg-light rounded-3 text-muted small border">
          <span className="fw-bold text-dark">📋 Instructions:</span> {address.deliveryInstructions}
        </div>
      )}

      <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top">
        {!address.defaultAddress ? (
          <button
            type="button"
            className="btn btn-sm btn-link text-success text-decoration-none fw-bold p-0"
            onClick={() => onSetDefault(address.id)}
          >
            Set as Primary
          </button>
        ) : (
          <span className="text-muted small">Primary Address</span>
        )}

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-dark rounded-pill px-3 py-1"
            onClick={() => onEdit(address)}
          >
            Edit ✏️
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1"
            onClick={() => onDelete(address.id)}
            title={isOnlyOne ? "At least one address is required" : "Delete Address"}
          >
            Delete 🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddressCard;
