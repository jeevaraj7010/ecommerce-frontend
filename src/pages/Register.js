import React, { useState } from "react";
import axios from "axios";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    password: "",
    otp: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendOtp = async () => {
    if (!formData.phone) {
      alert("Enter phone number first");
      return;
    }

    try {
      setLoadingOtp(true);

      const response = await axios.post("http://localhost:8081/auth/send-otp", {
        phone: formData.phone,
      });

      alert(response.data);
      setOtpSent(true);
    } catch (error) {
      console.error(error);
      alert(error.response?.data || "Failed to send OTP");
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoadingRegister(true);

      const response = await axios.post(
        "http://localhost:8081/auth/register",
        formData
      );

      alert(response.data);

      setFormData({
        username: "",
        phone: "",
        password: "",
        otp: "",
      });
      setOtpSent(false);
    } catch (error) {
      console.error(error);
      alert(error.response?.data || "Registration failed");
    } finally {
      setLoadingRegister(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e293b, #334155)",
      }}
    >
      <div
        className="card border-0 shadow-lg p-4"
        style={{
          width: "100%",
          maxWidth: "430px",
          borderRadius: "20px",
        }}
      >
        <h2 className="text-center fw-bold mb-2">Create Account</h2>
        <p className="text-center text-muted mb-4">
          Register with phone and OTP
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Username</label>
            <input
              type="text"
              name="username"
              className="form-control py-2"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Phone Number</label>
            <div className="d-flex gap-2">
              <input
                type="text"
                name="phone"
                className="form-control py-2"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSendOtp}
                disabled={loadingOtp}
              >
                {loadingOtp ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </div>

          {otpSent && (
            <div className="mb-3">
              <label className="form-label fw-semibold">OTP</label>
              <input
                type="text"
                name="otp"
                className="form-control py-2"
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              name="password"
              className="form-control py-2"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-dark w-100 py-2"
            disabled={loadingRegister}
          >
            {loadingRegister ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;