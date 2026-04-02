import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <div className="container-fluid">

        {/* LEFT SIDE - LOGO */}
        <Link className="navbar-brand fw-bold" to="/">
          MyStore
        </Link>

        {/* RIGHT SIDE */}
        <div className="d-flex align-items-center ms-auto gap-3">

          {/* Common Links */}
          <Link className="nav-link text-white" to="/">Home</Link>
          <Link className="nav-link text-white" to="/products">Products</Link>
          <Link className="nav-link text-white" to="/cart">Cart</Link>

          {token ? (
            <>
              {/* Profile Button */}
              <button
                className="btn btn-outline-light btn-sm"
                onClick={() => navigate("/profile")}
              >
                Profile
              </button>

              {/* Orders */}
              <button
                className="btn btn-outline-light btn-sm"
                onClick={() => navigate("/orders")}
              >
                 My Orders
              </button>

              {/* Logout */}
              <button
                className="btn btn-danger btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Guest */}
              <button
                className="btn btn-outline-light btn-sm"
                onClick={() => navigate("/login")}
              >
                Login
              </button>

              <button
                className="btn btn-success btn-sm"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;