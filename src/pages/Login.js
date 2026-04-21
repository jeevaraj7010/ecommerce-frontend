import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from || "/home";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post(
        "https://ecommerce-backend-1-tsra.onrender.com/auth/login",
        formData
      );

      const token = response.data.token || response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("username", formData.username);

      alert("Login successful");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      alert(error.response?.data || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a, #1e293b, #334155)" }}>

      <div className="card border-0 shadow-lg p-4"
        style={{ width: "100%", maxWidth: "420px", borderRadius: "20px" }}>

        <h2 className="text-center fw-bold mb-2">Welcome Back</h2>

        <form onSubmit={handleSubmit}>

          <input name="username" className="form-control mb-3"
            placeholder="Username" value={formData.username}
            onChange={handleChange} required />

          <input type="password" name="password" className="form-control mb-3"
            placeholder="Password" value={formData.password}
            onChange={handleChange} required />

          <button className="btn btn-dark w-100 mb-2">
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* 🔥 NEW */}
        <p className="text-center">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>

        <p className="text-center mt-2">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;