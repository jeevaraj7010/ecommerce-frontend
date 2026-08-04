import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    username: localStorage.getItem("hoodify_remember_username") || "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(Boolean(localStorage.getItem("hoodify_remember_username")));
  const [loading, setLoading] = useState(false);

  const fromLocation = location.state?.from;
  const redirectTo = fromLocation || "/home";

  // Dynamic contextual message based on redirected page
  const getRedirectMessage = () => {
    if (!fromLocation) return null;
    if (fromLocation.includes("profile")) return "Please login to view your profile.";
    if (fromLocation.includes("orders")) return "Please login to view your orders.";
    if (fromLocation.includes("wishlist")) return "Please login to access your wishlist.";
    if (fromLocation.includes("checkout")) return "Please login to continue to checkout.";
    return "Please login to continue.";
  };

  const redirectMsg = getRedirectMessage();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      toast.warning("Please enter username & password ⚠️");
      return;
    }

    if (loading) return; // Prevent double submissions

    try {
      setLoading(true);

      const res = await axios.post(
        "https://ecommerce-backend-1-tsra.onrender.com/auth/login",
        formData
      );

      const token = res.data.token || res.data;
      const role = res.data.role || "ROLE_USER";

      localStorage.setItem("token", token);
      localStorage.setItem("username", formData.username);
      localStorage.setItem("role", role);

      if (rememberMe) {
        localStorage.setItem("hoodify_remember_username", formData.username);
      } else {
        localStorage.removeItem("hoodify_remember_username");
      }

      window.dispatchEvent(new Event("authChange"));

      toast.success("Login successful ✅");

      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);

      if (!err.response || err.code === "ERR_NETWORK") {
        toast.error("⚠ Unable to connect. Please check your internet connection.");
      } else if (err.response?.status === 401) {
        toast.error("❌ Incorrect username or password.");
      } else {
        toast.error("❌ Incorrect username or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container py-4 py-md-5">
      <div className="auth-floating-circle auth-floating-circle-1"></div>
      <div className="auth-floating-circle auth-floating-circle-2"></div>
      <div className="auth-floating-circle auth-floating-circle-3"></div>

      <div className="container" style={{ maxWidth: "480px" }}>
        
        {/* COMPACT MINIMAL INFORMATIONAL BANNER (< 60px HEIGHT) */}
        {redirectMsg && (
          <div className="p-3 bg-dark text-white rounded-4 shadow-sm mb-3 d-flex align-items-center gap-2 border border-secondary" style={{ minHeight: "52px" }}>
            <span className="fs-5 flex-shrink-0">🔒</span>
            <div className="small fw-medium">{redirectMsg}</div>
          </div>
        )}

        {/* AUTHENTICATION FORM CARD */}
        <div className="auth-card mx-auto w-100">
          <div className="auth-brand-badge" aria-hidden="true">
            
          </div>

          <h2 className="auth-title">Welcome Back 👋</h2>
          <p className="auth-subtitle">Login to continue shopping at HOODIFY.</p>

          <form onSubmit={handleSubmit} noValidate>
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
            </div>

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
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

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

            <button
              type="submit"
              className="btn-auth-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" aria-hidden="true"></span>
                  Signing In...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account?
            <Link to="/register" className="auth-footer-link">
              Create Account
            </Link>
          </p>

          <div className="auth-divider"></div>

          <div className="auth-trust-badges">
            <span className="auth-trust-item">
              <span className="auth-trust-icon" aria-hidden="true">🛡</span> Secure Authentication
            </span>
            <span className="auth-trust-item">
              <span className="auth-trust-icon" aria-hidden="true">⚡</span> Fast Checkout
            </span>
            <span className="auth-trust-item">
              <span className="auth-trust-icon" aria-hidden="true">❤</span> Wishlist Support
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;