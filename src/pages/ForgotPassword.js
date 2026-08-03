import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleNext = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.warning("Please enter your registered email address ⚠️");
      return;
    }

    navigate("/otp-reset", { state: { email } });
  };

  return (
    <div className="auth-page-container">
      {/* Blurred Floating Circles (Background Glow) */}
      <div className="auth-floating-circle auth-floating-circle-1"></div>
      <div className="auth-floating-circle auth-floating-circle-2"></div>
      <div className="auth-floating-circle auth-floating-circle-3"></div>

      {/* Centered Glassmorphism Card */}
      <div className="auth-card">
        {/* Brand Badge */}
        <div className="auth-brand-badge" aria-hidden="true">
          
        </div>

        <h2 className="auth-title">Forgot Password?</h2>
        <p className="auth-subtitle">
          Enter your registered email address to receive your password reset OTP.
        </p>

        <form onSubmit={handleNext} noValidate>
          <div className="auth-input-wrapper mb-4">
            <label htmlFor="forgot-email" className="auth-label">
              Email Address
            </label>
            <input
              id="forgot-email"
              type="email"
              className="auth-input"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <button type="submit" className="btn-auth-primary mb-3">
            Continue to Send OTP →
          </button>
        </form>

        <p className="auth-footer-text mt-3">
          Remembered your password?
          <Link to="/login" className="auth-footer-link">
            Back to Login
          </Link>
        </p>

        <div className="auth-divider"></div>

        <div className="auth-trust-badges">
          <span className="auth-trust-item">
            <span className="auth-trust-icon" aria-hidden="true">🛡</span>
            Secure OTP Verification
          </span>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;