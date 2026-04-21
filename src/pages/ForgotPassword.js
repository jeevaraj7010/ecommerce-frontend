import React, { useState } from "react";
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email) {
      alert("Enter email");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://ecommerce-backend-1-tsra.onrender.com/auth/forgot-password",
        { email }
      );

      alert(res.data);

    } catch (err) {
      console.error(err);

      if (err.message === "Network Error") {
        alert("Server waking up... try again in few seconds");
      } else {
        alert(err.response?.data || "Error sending email");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a, #1e293b, #334155)" }}>

      <div className="card p-4 shadow"
        style={{ width: "100%", maxWidth: "400px", borderRadius: "20px" }}>

        <h3 className="text-center mb-3">Forgot Password</h3>

        <input
          type="email"
          className="form-control mb-3"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="btn btn-dark w-100" onClick={handleSend}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

      </div>
    </div>
  );
}

export default ForgotPassword;