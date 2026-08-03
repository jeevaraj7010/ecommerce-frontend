import React, { useState } from "react";
import AddAddressModal from "./AddAddressModal";

function AddressSelector({ addresses, selectedAddress, onSelectAddress, onSaveNewAddress }) {
  const [showModal, setShowModal] = useState(false);

  const handleSaveModal = (addressData) => {
    onSaveNewAddress(addressData);
    setShowModal(false);
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="fw-extrabold text-dark m-0">Select Delivery Address 🚚</h6>
        <button
          type="button"
          className="btn btn-sm btn-outline-dark rounded-pill px-3 py-1 fw-bold"
          onClick={() => setShowModal(true)}
        >
          + Add New Address
        </button>
      </div>

      {(!addresses || addresses.length === 0) ? (
        <div className="p-4 bg-light rounded-4 text-center border">
          <p className="text-muted small mb-3">No saved addresses found.</p>
          <button
            type="button"
            className="btn btn-dark rounded-pill px-4 py-2 fw-bold btn-sm"
            onClick={() => setShowModal(true)}
          >
            + Add Delivery Address
          </button>
        </div>
      ) : (
        <div className="row g-3">
          {addresses.map((addr) => {
            const isSelected = selectedAddress && selectedAddress.id === addr.id;
            return (
              <div key={addr.id} className="col-12 col-md-6">
                <div
                  className="card p-3 rounded-4 cursor-pointer position-relative"
                  onClick={() => onSelectAddress(addr)}
                  style={{
                    cursor: "pointer",
                    background: isSelected ? "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)" : "#ffffff",
                    border: isSelected ? "2px solid #22c55e" : "1px solid #e5e7eb",
                    boxShadow: isSelected ? "0 4px 12px rgba(34, 197, 94, 0.15)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="radio"
                        name="checkoutAddressRadio"
                        checked={isSelected}
                        onChange={() => onSelectAddress(addr)}
                        className="form-check-input mt-0"
                      />
                      <span className="fw-bold text-dark text-uppercase small">
                        {addr.addressLabel || addr.addressType || "Address"}
                      </span>
                    </div>
                    {addr.defaultAddress && (
                      <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2 py-0.5 rounded-pill small">
                        ⭐ Primary
                      </span>
                    )}
                  </div>

                  <div className="fw-bold text-dark small">{addr.fullName}</div>
                  <small className="text-muted d-block">📱 {addr.phone}</small>
                  <small className="text-secondary d-block mt-1 text-truncate">
                    {addr.houseNo ? `${addr.houseNo}, ` : ""}
                    {addr.street}, {addr.city} - {addr.pincode}
                  </small>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD NEW ADDRESS MODAL */}
      <AddAddressModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveModal}
        editingAddress={null}
      />
    </div>
  );
}

export default AddressSelector;
