import { useEffect } from "react";

function Dashboard() {

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  return (
    <div className="container mt-5">
      <h2>Welcome to Dashboard 🎉</h2>
      <button
        className="btn btn-danger"
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;