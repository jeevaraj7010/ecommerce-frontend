import { useEffect, useState } from "react";
import axios from "axios";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("https://ecommerce-backend-1-tsra.onrender.com/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3 py-md-4">
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-extrabold text-dark m-0 fs-4">Registered Users 👥</h2>
          <p className="text-muted small m-0">View registered customer accounts and admin roles</p>
        </div>
        <span className="badge rounded-pill bg-dark text-white px-3 py-2">
          {users.length} {users.length === 1 ? "User" : "Users"}
        </span>
      </div>

      {users.length === 0 ? (
        <div className="card border-0 shadow-sm p-4 rounded-4 text-center bg-white">
          <p className="text-muted m-0">No registered users found.</p>
        </div>
      ) : (
        <div className="row g-3">
          {users.map((u) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={u.id}>
              <div className="card border-0 shadow-sm p-3 rounded-4 bg-white h-100 d-flex flex-row align-items-center gap-3">
                <div
                  className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                  style={{ width: "46px", height: "46px", fontSize: "18px" }}
                >
                  {(u.username || "U").charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <h6 className="fw-bold text-dark mb-0 text-truncate">{u.username}</h6>
                  <small className="text-muted d-block text-truncate">📱 {u.phone || "No phone"}</small>
                  <span className={`badge mt-1 rounded-pill ${u.role === "ROLE_ADMIN" ? "bg-primary" : "bg-light text-dark border"}`}>
                    {u.role || "ROLE_USER"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Users;