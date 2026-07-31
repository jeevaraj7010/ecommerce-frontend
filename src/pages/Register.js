import React, { useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/auth.css";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Password Strength Calculation (Weak, Fair, Strong)
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { label: "", score: 0, class: "" };

    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd) || pwd.length >= 12) score += 1;

    if (score <= 1) return { label: "Weak", score: 1, class: "weak", textClass: "error" };
    if (score === 2) return { label: "Fair", score: 2, class: "fair", textClass: "muted" };
    return { label: "Strong", score: 3, class: "strong", textClass: "success" };
  }, [formData.password]);

  // Passwords match validation check
  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return formData.password === confirmPassword;
  }, [formData.password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password && confirmPassword && formData.password !== confirmPassword) {
      toast.error("Passwords do not match ❌");
      return;
    }

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
      setConfirmPassword("");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data || "Registration failed ❌");
    } finally {
      setLoadingRegister(false);
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
        <h2 className="auth-title">Create Your Account</h2>
        <p className="auth-subtitle">Join HOODIFY and discover premium fashion.</p>

        {/* Form Container */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Username Field */}
          <div className="auth-input-wrapper">
            <label htmlFor="reg-username" className="auth-label">
              Username
            </label>
            <input
              id="reg-username"
              name="username"
              type="text"
              className="auth-input"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              disabled={loadingRegister}
              required
              autoComplete="username"
            />
            {formData.username.trim() && (
              <div className="auth-validation-badge success mt-1">
                ✓ Username entered
              </div>
            )}
          </div>

          {/* Phone Field (Optional) */}
          <div className="auth-input-wrapper">
            <label htmlFor="reg-phone" className="auth-label">
              Phone Number <span className="fw-normal text-muted">(Optional)</span>
            </label>
            <input
              id="reg-phone"
              name="phone"
              type="tel"
              className="auth-input"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              disabled={loadingRegister}
              autoComplete="tel"
            />
          </div>

          {/* Password Field with Eye Toggle */}
          <div className="auth-input-wrapper mb-2">
            <label htmlFor="reg-password" className="auth-label">
              Password
            </label>
            <div className="position-relative">
              <input
                id="reg-password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                disabled={loadingRegister}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={0}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loadingRegister}
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

          {/* Password Strength Indicator Bar */}
          {formData.password && (
            <div className="auth-strength-container">
              <div className="auth-strength-track">
                <div
                  className={`auth-strength-fill ${passwordStrength.class}`}
                ></div>
              </div>
              <div className={`auth-validation-badge ${passwordStrength.textClass}`}>
                ✓ Password strength: <strong>{passwordStrength.label}</strong>
              </div>
            </div>
          )}

          {/* Confirm Password Field with Eye Toggle */}
          <div className="auth-input-wrapper mb-3">
            <label htmlFor="reg-confirm-password" className="auth-label">
              Confirm Password
            </label>
            <div className="position-relative">
              <input
                id="reg-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loadingRegister}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-input-icon-right"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={0}
                aria-label={
                  showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                }
                disabled={loadingRegister}
              >
                {showConfirmPassword ? (
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
            {/* Live Password Match Validation */}
            {confirmPassword && (
              <div
                className={`auth-validation-badge ${passwordsMatch ? "success" : "error"
                  } mt-1`}
              >
                {passwordsMatch ? "✓ Passwords match" : "✕ Passwords do not match"}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-auth-primary mt-2"
            disabled={loadingRegister}
          >
            {loadingRegister ? (
              <>
                <span className="auth-spinner" aria-hidden="true"></span>
                Creating Account...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        {/* Footer Navigation Link */}
        <p className="auth-footer-text">
          Already have an account?
          <Link to="/login" className="auth-footer-link">
            Login
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

export default Register;