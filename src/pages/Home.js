import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "90vh",
        background: "linear-gradient(to right, #0f172a, #1e293b)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center"
      }}
    >
      <h1 className="fw-bold">Premium Hoodies</h1>
      <p>Style meets comfort 🔥</p>

      <button
        className="btn btn-success mt-3 px-4 py-2"
        onClick={() => navigate("/products")}
      >
        Shop Now
      </button>
    </div>
  );
}

export default Home;