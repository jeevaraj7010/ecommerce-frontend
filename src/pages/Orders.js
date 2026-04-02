import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Orders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to view orders");
      navigate("/login", { state: { from: "/orders" } });
      return;
    }

    axios
      .get("http://localhost:8081/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [navigate]);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">My Orders</h2>

      {orders.length === 0 ? (
        <p className="text-center">No orders found</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="card p-3 mb-3 shadow-sm">
            <div className="row align-items-center">
              <div className="col-md-6">
                <h5>{order.productName}</h5>
                <p className="text-muted">Product ID: {order.productId}</p>
                <p>Quantity: {order.quantity}</p>
              </div>

              <div className="col-md-3 text-center">
                <h6>₹{order.totalPrice}</h6>
              </div>

              <div className="col-md-3 text-end">
                <small className="text-muted">
                  {new Date(order.orderDate).toLocaleString()}
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