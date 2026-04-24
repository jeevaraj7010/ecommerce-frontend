import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // 🔥 ADD THIS

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login to view orders ❌"); // 🔥 REPLACED
      navigate("/login", { state: { from: "/orders" } });
      return;
    }

    axios
      .get("https://ecommerce-backend-1-tsra.onrender.com/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setOrders(res.data))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load orders ❌"); // 🔥 REPLACED
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const getStatusColor = (status) => {
    if (!status) return "secondary";
    if (status === "DELIVERED") return "success";
    if (status === "PENDING") return "warning";
    if (status === "CANCELLED") return "danger";
    return "secondary";
  };

  if (loading) {
    return <h4 className="text-center mt-5">Loading orders...</h4>;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 fw-bold">My Orders 🛍️</h2>

      {orders.length === 0 ? (
        <div className="text-center mt-5">
          <h5>No orders yet 😢</h5>
          <button
            className="btn btn-dark mt-3"
            onClick={() => navigate("/products")}
          >
            Shop Now
          </button>
        </div>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="card p-3 mb-3 shadow-sm border-0"
            style={{ borderRadius: "15px" }}
          >
            <div className="row align-items-center">

              <div className="col-md-6">
                <h5 className="fw-semibold mb-1">
                  {order.productName || "Product"}
                </h5>

                <p className="text-muted mb-1">
                  ID: {order.productId}
                </p>

                <p className="mb-1">
                  Quantity: <strong>{order.quantity}</strong>
                </p>
              </div>

              <div className="col-md-3 text-center">
                <h5 className="text-success fw-bold">
                  ₹{order.totalPrice}
                </h5>

                <span className={`badge bg-${getStatusColor(order.status)}`}>
                  {order.status || "PLACED"}
                </span>
              </div>

              <div className="col-md-3 text-end">
                <small className="text-muted">
                  {order.orderDate
                    ? new Date(order.orderDate).toLocaleString()
                    : "N/A"}
                </small>
              </div>

            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Orders;