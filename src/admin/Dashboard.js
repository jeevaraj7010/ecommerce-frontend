import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [data, setData] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios.get("https://ecommerce-backend-1-tsra.onrender.com/api/admin/overview", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setData(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>

      <div style={{ display: "flex", gap: "20px" }}>
        <div>Users: {data.users}</div>
        <div>Products: {data.products}</div>
        <div>Orders: {data.orders}</div>
        <div>Revenue: ₹{data.revenue}</div>
      </div>
    </div>
  );
}

export default Dashboard;