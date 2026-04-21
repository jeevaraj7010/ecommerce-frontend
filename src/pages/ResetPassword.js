import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const token = query.get("token");

  const handleReset = async () => {
    if (!token) {
      alert("Invalid reset link");
      return;
    }

    if (!password || !confirm) {
      alert("Fill all fields");
      return;
    }

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://ecommerce-backend-1-tsra.onrender.com/auth/reset-password",
        { token, password }
      );

      alert(res.data);
      navigate("/login");

    } catch (err) {
      console.error(err);

      if (err.message === "Network Error") {
        alert("Server waking up... try again in few seconds");
      } else {
        alert(err.response?.data || "Reset failed");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a, #1e293b, #334155)" }}>

      <div className="card p-4 shadow"
        style={{ width: "100%", maxWidth: "400px", borderRadius: "20px" }}>

        <h3 className="text-center mb-3">Reset Password</h3>

        <input
          type="password"
          className="form-control mb-2"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button className="btn btn-success w-100" onClick={handleReset}>
          {loading ? "Updating..." : "Reset Password"}
        </button>

      </div>
    </div>
  );
}

export default ResetPassword;