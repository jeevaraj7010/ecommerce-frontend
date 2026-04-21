import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "90vh",
      background: "linear-gradient(135deg, #0f172a, #1e293b)",
      color: "white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div className="text-center">

        <h1 className="fw-bold display-4">Hoodify</h1>
        <p style={{ opacity: 0.7 }}>Premium Style 🔥</p>

        <button
          className="btn btn-success px-5 py-2 mt-3"
          onClick={() => navigate("/products")}
        >
          Shop Now →
        </button>

      </div>
    </div>
  );
}

export default Home;