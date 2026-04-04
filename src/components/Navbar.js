import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg px-4 shadow-sm" style={{ background: "#0f172a" }}>
      <div className="container-fluid">

        <Link className="navbar-brand text-white fw-bold" to="/">
          🧥 Hoodify
        </Link>

        <div className="d-flex align-items-center ms-auto gap-3">

          <Link className="text-white text-decoration-none" to="/">Home</Link>
          <Link className="text-white text-decoration-none" to="/products">Shop</Link>
          <Link className="text-white text-decoration-none" to="/cart">Cart</Link>

          {token ? (
            <>
              <span className="text-white">Hi, {username}</span>

              <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/profile")}>
                Profile
              </button>

              <button className="btn btn-success btn-sm" onClick={() => navigate("/orders")}>
                Orders
              </button>

              <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/login")}>
                Login
              </button>

              <button className="btn btn-success btn-sm" onClick={() => navigate("/register")}>
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