import React, { useState } from "react";
import API from "../../api/axios";
import { toast } from "react-toastify";

function DeliveryCheck() {
  const [pincode, setPincode] = useState("");
  const [checking, setChecking] = useState(false);
  const [statusResult, setStatusResult] = useState(null);

  const handleCheck = (e) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) {
      toast.warning("Please enter a valid 6-digit pincode 📮");
      return;
    }

    setChecking(true);
    API.get(`/api/location/pincode/${pincode}`)
      .then((res) => {
        if (res.data) {
          setStatusResult(res.data);
          if (res.data.available) {
            toast.success("Delivery is available for this pincode! 🚚");
          } else {
            toast.error(res.data.message || "Delivery unavailable ❌");
          }
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to check pincode availability ❌");
      })
      .finally(() => setChecking(false));
  };

  return (
    <div className="card border-0 shadow-sm p-3.5 rounded-4 bg-white mb-4">
      <div className="d-flex align-items-center gap-2 mb-2">
        <span className="fs-5">🚚</span>
        <span className="fw-bold text-dark small">Check Delivery Availability</span>
      </div>

      <form onSubmit={handleCheck} className="d-flex gap-2 mb-2">
        <input
          type="text"
          className="form-control rounded-pill border-light bg-light font-monospace text-sm px-3"
          placeholder="Enter 6-digit Pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength="6"
        />
        <button
          type="submit"
          className="btn btn-dark rounded-pill px-4 fw-bold text-sm"
          style={{ background: "#111827" }}
          disabled={checking}
        >
          {checking ? "Checking..." : "Check"}
        </button>
      </form>

      {statusResult && (
        <div
          className={`p-2.5 rounded-3 small fw-semibold ${
            statusResult.available
              ? "bg-success bg-opacity-10 text-success border border-success"
              : "bg-danger bg-opacity-10 text-danger border border-danger"
          }`}
        >
          {statusResult.message}
          {statusResult.city && (
            <div className="text-muted small mt-1 font-normal">
              Location: {statusResult.city}, {statusResult.district}, {statusResult.state}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DeliveryCheck;
