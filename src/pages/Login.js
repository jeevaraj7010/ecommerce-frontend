import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

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

    // 🔥 VALIDATION
    if (!formData.username.trim() || !formData.password.trim()) {
      toast.warning("Please enter username & password ⚠️");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://ecommerce-backend-1-tsra.onrender.com/auth/login",
        formData
      );

      // 🔥 HANDLE RESPONSE SAFELY
      const token = res.data.token || res.data;
      const role = res.data.role || "ROLE_USER";

      localStorage.setItem("token", token);
      localStorage.setItem("username", formData.username);
      localStorage.setItem("role", role);

      toast.success("Login successful ✅");

      navigate(redirectTo);

    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        toast.error("Invalid username or password ❌");
      } else {
        toast.error("Server error. Try again ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", background: "#f1f5f9" }}
    >
      <div className="card shadow-lg p-4" style={{ width: "400px" }}>

        <h3 className="text-center fw-bold mb-3">Login</h3>

        <form onSubmit={handleSubmit}>

          <input
            className="form-control mb-3"
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />

          <div className="position-relative mb-3">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "8px",
                cursor: "pointer",
              }}
            >
              👁️
            </span>
          </div>

          <button className="btn btn-dark w-100" disabled={loading}>
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