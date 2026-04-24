import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // 🔥 ADD

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-4">

      <Link className="navbar-brand" to="/home">
        Hoodify 🔥
      </Link>

      <div>

        <Link to="/products" className="btn btn-outline-light me-2">
          Products
        </Link>

        <Link to="/cart" className="btn btn-outline-light me-2">
          Cart
        </Link>

        {/* 👇 USER BUTTONS */}
        {token && role === "ROLE_USER" && (
          <Link to="/orders" className="btn btn-outline-light me-2">
            Orders
          </Link>
        )}

        {/* 👇 ADMIN BUTTONS */}
        {token && role === "ROLE_ADMIN" && (
          <Link to="/admin" className="btn btn-warning me-2">
            Admin Panel
          </Link>
        )}

        {/* 👇 AUTH BUTTONS */}
        {token ? (
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="btn btn-success me-2">
              Login
            </Link>

            <Link to="/register" className="btn btn-outline-light">
              Register
            </Link>
          </>
        )}

      </div>
    </nav>
  );
}

export default Navbar;