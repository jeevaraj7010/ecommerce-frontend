import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    username: "",
    phone: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to view profile");
      navigate("/login", { replace: true, state: { from: "/profile" } });
      return;
    }

    axios
      .get("http://localhost:8081/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load profile");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return <h3 className="text-center mt-5">Loading profile...</h3>;
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center bg-light"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="card shadow border-0 p-4"
        style={{ width: "100%", maxWidth: "450px", borderRadius: "18px" }}
      >
        <div className="text-center mb-4">
          <div
            className="rounded-circle bg-dark text-white d-inline-flex align-items-center justify-content-center"
            style={{
              width: "80px",
              height: "80px",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            {profile.username ? profile.username.charAt(0).toUpperCase() : "U"}
          </div>

          <h2 className="mt-3 mb-1 fw-bold">My Profile</h2>
          <p className="text-muted mb-0">Manage your account details</p>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Username</label>
          <input
            type="text"
            className="form-control"
            value={profile.username || ""}
            readOnly
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Phone Number</label>
          <input
            type="text"
            className="form-control"
            value={profile.phone || "Not available"}
            readOnly
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">Role</label>
          <input
            type="text"
            className="form-control"
            value={profile.role || ""}
            readOnly
          />
        </div>

        <button
          className="btn btn-dark w-100"
          onClick={() => navigate("/orders")}
        >
          View My Orders
        </button>
      </div>
    </div>
  );
}

export default Profile;