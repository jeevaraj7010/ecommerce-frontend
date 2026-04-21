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

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from || "/home";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        "https://ecommerce-backend-1-tsra.onrender.com/auth/login",
        formData
      );

      const token = res.data.token || res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("username", formData.username);

      navigate(redirectTo);
    } catch {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", background: "#f1f5f9" }}>

      <div className="card shadow-lg p-4" style={{ width: "400px" }}>

        <h3 className="text-center fw-bold mb-3">Login</h3>

        <form onSubmit={handleSubmit}>

          <input
            className="form-control mb-3"
            placeholder="Username"
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />

          {/* 🔥 Password with eye */}
          <div className="position-relative mb-3">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Password"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "8px",
                cursor: "pointer"
              }}
            >
              👁️
            </span>
          </div>

          <button className="btn btn-dark w-100">
            {loading ? "Logging..." : "Login"}
          </button>

        </form>

        <p className="text-center mt-2">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;