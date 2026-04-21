import { useEffect, useState } from "react";
import axios from "axios";

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios.get("https://ecommerce-backend-1-tsra.onrender.com/api/admin/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setOrders(res.data))
    .catch(console.error);
  }, []);

  const updateStatus = (id, status) => {
    const token = localStorage.getItem("token");

    axios.put(
      `https://ecommerce-backend-1-tsra.onrender.com/api/admin/orders/${id}/status?status=${status}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(() => {
      alert("Updated!");
    });
  };

  return (
    <div>
      <h2>Orders</h2>

      {orders.map(o => (
        <div key={o.id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
          <p>{o.productName} - ₹{o.totalPrice}</p>
          <p>Status: {o.status}</p>

          {o.designImageUrl && (
            <img src={o.designImageUrl} width="100" alt="design" />
          )}

          <button onClick={() => updateStatus(o.id, "SHIPPED")}>Ship</button>
          <button onClick={() => updateStatus(o.id, "DELIVERED")}>Deliver</button>
        </div>
      ))}
    </div>
  );
}

export default Orders;