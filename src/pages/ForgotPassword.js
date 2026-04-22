import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleNext = () => {
    if (!email) {
      alert("Enter email");
      return;
    }

    navigate("/otp-reset", { state: { email } });
  };

  return (
    <div className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", background: "#f1f5f9" }}>

      <div className="card p-4 shadow-lg" style={{ width: "400px" }}>
        <h4 className="text-center mb-3">Forgot Password</h4>

        <input
          className="form-control mb-3"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="btn btn-dark w-100" onClick={handleNext}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;