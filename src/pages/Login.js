import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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

      // 🔥 SAVE LOGIN DATA
      localStorage.setItem("token", token);
      localStorage.setItem("username", formData.username);
      localStorage.setItem("role", role);

      // 🔥 IMPORTANT: UPDATE NAVBAR WITHOUT REFRESH
      window.dispatchEvent(new Event("authChange"));

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
    <div className="auth-page-container">
      {/* Blurred Floating Circles (Background Glow) */}
      <div className="auth-floating-circle auth-floating-circle-1"></div>
      <div className="auth-floating-circle auth-floating-circle-2"></div>
      <div className="auth-floating-circle auth-floating-circle-3"></div>

      {/* Centered Glassmorphism Authentication Card */}
      <div className="auth-card">
        {/* Brand Logo Badge */}
        <div className="auth-brand-badge" aria-hidden="true">
          
        </div>

        {/* Header Section */}
        <h2 className="auth-title">Welcome Back 👋</h2>
        <p className="auth-subtitle">Login to continue shopping at HOODIFY.</p>

        {/* Form Container */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Username Field */}
          <div className="auth-input-wrapper">
            <label htmlFor="username-input" className="auth-label">
              Username
            </label>
            <input
              id="username-input"
              type="text"
              name="username"
              className="auth-input"
              placeholder="Enter your username"
              value={formData.username}
              disabled={loading}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  username: e.target.value,
                })
              }
              required
              autoComplete="username"
            />
            {formData.username.trim() && (
              <div className="auth-validation-badge success mt-1">
                ✓ Username entered
              </div>
            )}
          </div>

          {/* Password Field with Eye Toggle */}
          <div className="auth-input-wrapper mb-3">
            <label htmlFor="password-input" className="auth-label">
              Password
            </label>
            <div className="position-relative">
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                name="password"
                className="auth-input"
                placeholder="Enter your password"
                value={formData.password}
                disabled={loading}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={0}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Options: Remember Me & Forgot Password */}
          <div className="auth-options">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                className="auth-checkbox"
                checked={rememberMe}
                disabled={loading}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember Me
            </label>
            <Link to="/forgot-password" className="auth-forgot-link">
              Forgot Password?
            </Link>
          </div>

          {/* Premium Login Button */}
          <button
            type="submit"
            className="btn-auth-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="auth-spinner" aria-hidden="true"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Footer Navigation Link */}
        <p className="auth-footer-text">
          Don't have an account?
          <Link to="/register" className="auth-footer-link">
            Create Account
          </Link>
        </p>

        {/* Divider Line */}
        <div className="auth-divider"></div>

        {/* Trust Section */}
        <div className="auth-trust-badges">
          <span className="auth-trust-item">
            <span className="auth-trust-icon" aria-hidden="true">
              🛡
            </span>
            Secure Authentication
          </span>
          <span className="auth-trust-item">
            <span className="auth-trust-icon" aria-hidden="true">
              ⚡
            </span>
            Fast Checkout
          </span>
          <span className="auth-trust-item">
            <span className="auth-trust-icon" aria-hidden="true">
              ❤
            </span>
            Wishlist Support
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;