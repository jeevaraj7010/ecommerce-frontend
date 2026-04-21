import React, { useState } from "react";
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSend = async () => {
    await axios.post(
      "https://ecommerce-backend-1-tsra.onrender.com/auth/forgot-password",
      { email }
    );
    alert("Check your email 📧");
  };

  return (
    <div className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", background: "#f1f5f9" }}>

      <div className="card p-4 shadow-lg" style={{ width: "400px" }}>

        <h4 className="text-center mb-3">Forgot Password</h4>

        <input
          className="form-control mb-3"
          placeholder="Enter email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="btn btn-dark w-100" onClick={handleSend}>
          Send Reset Link
        </button>

      </div>
    </div>
  );
}

export default ForgotPassword;