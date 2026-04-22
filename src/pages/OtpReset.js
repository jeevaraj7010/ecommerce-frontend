import React, { useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

function OtpReset() {
  const location = useLocation();
  const initialEmail = location.state?.email || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  const startTimer = () => {
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendOtp = async () => {
    if (!email) return alert("Enter email");

    try {
      await axios.post(
        "https://ecommerce-backend-1-tsra.onrender.com/auth/send-otp",
        { email }
      );

      alert("OTP sent 📧");
      startTimer();

    } catch (err) {
      alert(err.response?.data || "Error ❌");
    }
  };

  const verifyOtp = async () => {
    if (!email || !otp || !password) {
      return alert("Fill all fields");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://ecommerce-backend-1-tsra.onrender.com/auth/verify-otp",
        { email, otp, password }
      );

      alert(res.data);

    } catch (err) {
      alert(err.response?.data || "Invalid OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", background: "#f1f5f9" }}>

      <div className="card p-4 shadow-lg" style={{ width: "400px" }}>
        <h3 className="text-center mb-3">OTP Reset</h3>

        <input
          className="form-control mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />

        <button className="btn btn-dark w-100 mb-3" onClick={sendOtp}>
          Send OTP
        </button>

        <input
          className="form-control mb-2"
          placeholder="Enter OTP"
          onChange={(e) => setOtp(e.target.value)}
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="New Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn btn-success w-100 mb-2" onClick={verifyOtp}>
          {loading ? "Verifying..." : "Verify & Reset"}
        </button>

        <button
          className="btn btn-warning w-100"
          disabled={timer > 0}
          onClick={sendOtp}
        >
          {timer > 0 ? `Resend in ${timer}s` : "Resend OTP 🔄"}
        </button>
      </div>
    </div>
  );
}

export default OtpReset;