import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // 🔥 ADD THIS

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
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

      toast.success(response.data); // 🔥 REPLACED

      setFormData({
        username: "",
        email: "",
        phone: "",
        password: "",
      });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data || "Registration failed ❌"); // 🔥 REPLACED
    } finally {
      setLoadingRegister(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a, #1e293b, #334155)" }}>

      <div className="card border-0 shadow-lg p-4"
        style={{ width: "100%", maxWidth: "430px", borderRadius: "20px" }}>

        <h2 className="text-center fw-bold mb-2">Create Account</h2>
        <p className="text-center text-muted mb-4">
          Register with email
        </p>

        <form onSubmit={handleSubmit}>

          <input name="username" className="form-control mb-3" placeholder="Username"
            value={formData.username} onChange={handleChange} required />

          <input name="email" type="email" className="form-control mb-3" placeholder="Email"
            value={formData.email} onChange={handleChange} required />

          <input name="phone" className="form-control mb-3" placeholder="Phone"
            value={formData.phone} onChange={handleChange} required />

          <input type="password" name="password" className="form-control mb-3"
            placeholder="Password" value={formData.password} onChange={handleChange} required />

          <button className="btn btn-dark w-100">
            {loadingRegister ? "Registering..." : "Register"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default Register;