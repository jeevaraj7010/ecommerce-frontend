import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function Orders() {
  const [orders, setOrders] = useState([]);

  // 🔥 Fetch orders
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("https://ecommerce-backend-1-tsra.onrender.com/api/orders/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOrders(res.data))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load orders ❌");
      });
  }, []);

  // 🔥 Ship with tracking
  const shipOrder = (id, trackingId, courier) => {
    const token = localStorage.getItem("token");

    axios
      .put(
        `https://ecommerce-backend-1-tsra.onrender.com/api/orders/${id}/ship`,
        { trackingId, courier },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        toast.success("Order shipped 🚚");

        // update UI
        setOrders((prev) =>
          prev.map((o) =>
            o.id === id
              ? { ...o, status: "SHIPPED", trackingId, courier }
              : o
          )
        );
      })
      .catch((err) => {
        console.error(err);
        toast.error("Shipping failed ❌");
      });
  };

  // 🔥 Mark delivered
  const deliverOrder = (id) => {
    const token = localStorage.getItem("token");

    axios
      .put(
        `https://ecommerce-backend-1-tsra.onrender.com/api/orders/${id}/deliver`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        toast.success("Delivered 🎉");

        setOrders((prev) =>
          prev.map((o) =>
            o.id === id ? { ...o, status: "DELIVERED" } : o
          )
        );
      })
      .catch((err) => {
        console.error(err);
        toast.error("Update failed ❌");
      });
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Admin Orders</h2>

      {orders.map((o) => {
        let trackingInput = "";
        let courierInput = "";

        return (
          <div
            key={o.id}
            className="card p-3 mb-3 shadow-sm"
            style={{ borderRadius: "12px" }}
          >
            <p><b>{o.productName}</b> - ₹{o.totalPrice}</p>
            <p>Status: <b>{o.status}</b></p>

            {o.designImageUrl && (
              <img src={o.designImageUrl} width="100" alt="design" />
            )}

            {/* 🔥 Tracking Inputs */}
            {o.status !== "SHIPPED" && o.status !== "DELIVERED" && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Tracking ID"
                  className="form-control mb-2"
                  onChange={(e) => (trackingInput = e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Courier (DTDC/DHL)"
                  className="form-control mb-2"
                  onChange={(e) => (courierInput = e.target.value)}
                />

                <button
                  className="btn btn-primary me-2"
                  onClick={() =>
                    shipOrder(o.id, trackingInput, courierInput)
                  }
                >
                  Ship 🚚
                </button>
              </div>
            )}

            {/* 🔥 Deliver Button */}
            {o.status === "SHIPPED" && (
              <button
                className="btn btn-success mt-2"
                onClick={() => deliverOrder(o.id)}
              >
                Mark Delivered ✅
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Orders;