import React, { useState, useRef } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/auth.css";

function OtpReset() {
  const location = useLocation();
  const initialEmail = location.state?.email || "";

  const [email, setEmail] = useState(initialEmail);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const otpInputRefs = useRef([]);

  const startTimer = () => {
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next input box
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedText)) {
      const digits = pastedText.split("");
      setOtpDigits(digits);
      otpInputRefs.current[5]?.focus();
    }
  };

  const sendOtp = async () => {
    if (!email.trim()) return toast.warning("Please enter email address ⚠️");

    try {
      await axios.post(
        "https://ecommerce-backend-1-tsra.onrender.com/auth/send-otp",
        { email }
      );

      toast.success("OTP sent successfully to your email 📧");
      setOtpSent(true);
      startTimer();
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data || "Failed to send OTP ❌");
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (!email.trim() || fullOtp.length < 6 || !password.trim()) {
      return toast.warning("Please fill in all 6 OTP digits and new password ⚠️");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://ecommerce-backend-1-tsra.onrender.com/auth/verify-otp",
        { email, otp: fullOtp, password }
      );

      toast.success(res.data || "Password reset successfully! ✅");
    } catch (err) {
      toast.error(err.response?.data || "Invalid or expired OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-floating-circle auth-floating-circle-1"></div>
      <div className="auth-floating-circle auth-floating-circle-2"></div>
      <div className="auth-floating-circle auth-floating-circle-3"></div>

      <div className="auth-card">
        <div className="auth-brand-badge" aria-hidden="true">
          
        </div>

        <h2 className="auth-title">OTP Password Reset</h2>
        <p className="auth-subtitle">Verify your email and set a new password.</p>

        <form onSubmit={verifyOtp} noValidate>
          {/* EMAIL FIELD */}
          <div className="auth-input-wrapper">
            <label htmlFor="otp-email" className="auth-label">
              Email Address
            </label>
            <div className="d-flex gap-2">
              <input
                id="otp-email"
                type="email"
                className="auth-input"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-dark rounded-4 px-3 text-nowrap text-xs font-semibold"
                style={{ height: "50px", minWidth: "110px" }}
                onClick={sendOtp}
                disabled={timer > 0}
              >
                {timer > 0 ? `${timer}s` : otpSent ? "Resend 🔄" : "Send OTP 📧"}
              </button>
            </div>
          </div>

          {/* 6 INDIVIDUAL OTP DIGIT BOXES */}
          <div className="auth-input-wrapper">
            <label className="auth-label">Enter 6-Digit OTP</label>
            <div className="d-flex gap-2 justify-content-between mb-2">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  className="auth-input text-center fw-bold fs-5 p-0"
                  style={{ width: "42px", height: "50px" }}
                  value={digit}
                  onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                />
              ))}
            </div>
          </div>

          {/* NEW PASSWORD FIELD */}
          <div className="auth-input-wrapper mb-4">
            <label htmlFor="otp-password" className="auth-label">
              New Password
            </label>
            <div className="position-relative">
              <input
                id="otp-password"
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-auth-primary mb-3" disabled={loading}>
            {loading ? (
              <>
                <span className="auth-spinner" aria-hidden="true"></span>
                Resetting Password...
              </>
            ) : (
              "Verify & Reset Password ✅"
            )}
          </button>
        </form>

        <p className="auth-footer-text mt-3">
          Done resetting password?
          <Link to="/login" className="auth-footer-link">
            Back to Login
          </Link>
        </p>

        <div className="auth-divider"></div>

        <div className="auth-trust-badges">
          <span className="auth-trust-item">
            <span className="auth-trust-icon" aria-hidden="true">🛡</span>
            Encrypted Verification
          </span>
        </div>
      </div>
    </div>
  );
}

export default OtpReset;