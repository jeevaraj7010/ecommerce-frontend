import { useEffect, useState } from "react";
import axios from "axios";

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios.get("https://ecommerce-backend-1-tsra.onrender.com/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setUsers(res.data))
    .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Users</h2>

      {users.map(u => (
        <div key={u.id}>
          {u.username} - {u.phone}
        </div>
      ))}
    </div>
  );
}

export default Users;