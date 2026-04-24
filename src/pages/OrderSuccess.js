import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function OrderSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => navigate("/orders"), 3000);
  }, [navigate]);

  return (
    <div
      className="d-flex justify-content-center align-items-center text-center"
      style={{ minHeight: "100vh", background: "#ecfdf5" }}
    >
      <div>
        <h1 style={{ fontSize: "70px" }}>🎉</h1>

        <h2 className="text-success fw-bold">
          Payment Successful!
        </h2>

        <p>Your order is placed successfully 🚚</p>

        <button
          className="btn btn-dark mt-3"
          onClick={() => navigate("/orders")}
        >
          View Orders
        </button>
      </div>
    </div>
  );
}

export default OrderSuccess;