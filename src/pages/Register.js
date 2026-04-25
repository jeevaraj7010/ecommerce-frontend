import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    password: "",
  });

  const [loadingRegister, setLoadingRegister] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoadingRegister(true);

      const response = await axios.post(
        "https://ecommerce-backend-1-tsra.onrender.com/auth/register",
        formData
      );

      toast.success(response.data);

      setFormData({
        username: "",
        phone: "",
        password: "",
      });

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data || "Registration failed ❌");
    } finally {
      setLoadingRegister(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e293b, #334155)"
      }}
    >
      <div
        className="card border-0 shadow-lg p-4"
        style={{ width: "100%", maxWidth: "430px", borderRadius: "20px" }}
      >
        <h2 className="text-center fw-bold mb-2">Create Account</h2>

        <p className="text-center text-muted mb-4">
          Signup
        </p>

        <form onSubmit={handleSubmit}>

          {/* Username */}
          <input
            name="username"
            className="form-control mb-3"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          {/* Phone (Optional) */}
          <input
            name="phone"
            className="form-control mb-3"
            placeholder="Phone (optional)"
            value={formData.phone}
            onChange={handleChange}
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            className="form-control mb-3"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {/* Button */}
          <button className="btn btn-dark w-100">
            {loadingRegister ? "Registering..." : "Register"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default Register;