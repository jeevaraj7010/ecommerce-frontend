import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

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

  // Filtered customer list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const nameMatch = (u.username || "").toLowerCase().includes(searchQuery.toLowerCase());
      const roleMatch = roleFilter === "ALL" || u.role === roleFilter;
      return nameMatch && roleMatch;
    });
  }, [users, searchQuery, roleFilter]);

  // Top metric card metrics
  const totalCustomers = users.length;
  const activeCustomers = users.filter((u) => u.active !== false).length;
  const adminAccounts = users.filter((u) => u.role === "ROLE_ADMIN").length;
  const newCustomers = users.filter((u) => u.role !== "ROLE_ADMIN").length;

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="card border-0 shadow-sm p-4 rounded-4 placeholder-glow">
          <div className="placeholder col-4 mb-3" style={{ height: "24px" }}></div>
          <div className="row g-3 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="col-6 col-md-3">
                <div className="placeholder rounded-4 w-100" style={{ height: "80px" }}></div>
              </div>
            ))}
          </div>
          <div className="placeholder rounded-4 w-100" style={{ height: "260px" }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3 py-md-4">
      
      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-extrabold text-dark m-0 fs-4">Customer Management 👥</h2>
          <p className="text-muted small m-0">Overview of customer accounts & admin role assignments</p>
        </div>
      </div>

      {/* TOP SUMMARY METRIC CARDS (ONLY 4 CARDS) */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white border-start border-4 border-dark">
            <span className="small text-secondary fw-semibold">Total Customers</span>
            <h3 className="fw-extrabold text-dark m-0 mt-1">{totalCustomers}</h3>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white border-start border-4 border-success">
            <span className="small text-secondary fw-semibold">Active Customers</span>
            <h3 className="fw-extrabold text-success m-0 mt-1">{activeCustomers}</h3>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white border-start border-4 border-primary">
            <span className="small text-secondary fw-semibold">New Customers</span>
            <h3 className="fw-extrabold text-primary m-0 mt-1">{newCustomers}</h3>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white border-start border-4 border-warning">
            <span className="small text-secondary fw-semibold">Admin Accounts</span>
            <h3 className="fw-extrabold text-warning m-0 mt-1">{adminAccounts}</h3>
          </div>
        </div>
      </div>

      {/* CONTROLS: SEARCH & ROLE FILTER */}
      <div className="card border-0 shadow-sm p-3 p-md-4 rounded-4 bg-white mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: "420px" }}>
            <input
              type="text"
              className="form-control rounded-pill border shadow-sm px-3 text-sm"
              placeholder="Search by customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="d-flex align-items-center gap-2">
            <label className="small text-secondary fw-semibold m-0">Role Filter:</label>
            <select
              className="form-select form-select-sm rounded-pill border px-3"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ width: "140px" }}
            >
              <option value="ALL">All Roles</option>
              <option value="ROLE_USER">Customers</option>
              <option value="ROLE_ADMIN">Admins</option>
            </select>
          </div>
        </div>

        {/* COMPACT CUSTOMER TABLE */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-4 text-muted small">
            No customers found matching criteria.
          </div>
        ) : (
          <div className="table-responsive rounded-3 overflow-hidden border">
            <table className="table table-hover align-middle mb-0 text-sm">
              <thead className="table-dark small">
                <tr>
                  <th scope="col" className="py-3 px-3">Customer ID</th>
                  <th scope="col" className="py-3 px-3">Customer Name</th>
                  <th scope="col" className="py-3 px-3">Role</th>
                  <th scope="col" className="py-3 px-3">Status</th>
                  <th scope="col" className="py-3 px-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="px-3 fw-bold text-secondary">#{u.id}</td>
                    <td className="px-3">
                      <span className="fw-bold text-dark">{u.username || "Customer"}</span>
                    </td>
                    <td className="px-3">
                      <span className={`badge rounded-pill px-2.5 py-1 ${u.role === "ROLE_ADMIN" ? "bg-dark text-white" : "bg-light text-dark border"}`}>
                        {u.role === "ROLE_ADMIN" ? "ADMIN" : "CUSTOMER"}
                      </span>
                    </td>
                    <td className="px-3">
                      <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2.5 py-1 fw-bold">
                        Active
                      </span>
                    </td>
                    <td className="px-3 text-end">
                      <button className="btn btn-sm btn-outline-dark rounded-pill px-3 py-1 text-xs fw-bold">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default Users;