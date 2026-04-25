import { useEffect, useState } from "react";
import axios from "axios";
import "./Orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("https://ecommerce-backend-1-tsra.onrender.com/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOrders(res.data))
      .catch(console.error);
  }, []);

  // 🔥 STATUS STEP CALCULATION
  const getStep = (status) => {
    if (status === "PENDING") return 1;
    if (status === "SHIPPED") return 2;
    if (status === "DELIVERED") return 3;
    return 1;
  };

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4 fw-bold">My Orders 📦</h2>

      {orders.map((o) => {
        const step = getStep(o.status);

        return (
          <div className="order-card" key={o.id}>

            {/* 🔥 TOP SECTION */}
            <div className="d-flex justify-content-between align-items-start">

              <div>
                <h5 className="fw-bold">{o.productName}</h5>
                <p className="text-muted mb-1">Order ID: {o.id}</p>
                <p>₹{o.totalPrice}</p>
              </div>

              {/* 🔥 3 DOT MENU */}
              <div className="position-relative">
                <span
                  className="menu-dots"
                  onClick={() => setOpenMenu(openMenu === o.id ? null : o.id)}
                >
                  ⋮
                </span>

                {openMenu === o.id && (
                  <div className="menu-box">
                    <p>View Details</p>
                    <p>Track Order</p>
                    {o.status === "PENDING" && <p>Cancel Order</p>}
                  </div>
                )}
              </div>
            </div>

            {/* 🔥 STATUS BADGE */}
            <span className={`status-badge ${o.status.toLowerCase()}`}>
              {o.status}
            </span>

            {/* 🔥 PROGRESS BAR */}
            <div className="progress-container">
              <div className={`step ${step >= 1 ? "active" : ""}`}></div>
              <div className={`step ${step >= 2 ? "active" : ""}`}></div>
              <div className={`step ${step >= 3 ? "active" : ""}`}></div>
            </div>

            <div className="progress-labels">
              <span>Ordered</span>
              <span>Shipped</span>
              <span>Delivered</span>
            </div>

            {/* 🔥 TRACK BUTTON */}
            <button className="btn btn-dark w-100 mt-3">
              Track Order 🚚
            </button>

          </div>
        );
      })}
    </div>
  );
}

export default Orders;