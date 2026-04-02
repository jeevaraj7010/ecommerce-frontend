import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <div className="bg-dark text-white py-5">
        <div className="container text-center py-5">
          <h1 className="display-4 fw-bold">Welcome to MyStore</h1>
          <p className="lead mt-3">
            Shop electronics, fashion, accessories and more
          </p>
          <Link to="/products" className="btn btn-success btn-lg mt-3">
            Shop Now
          </Link>
        </div>
      </div>

      <div className="container mt-5">
        <h2 className="text-center mb-4">Featured Categories</h2>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card shadow-sm border-0 text-center p-4 h-100">
              <h4>Electronics</h4>
              <p>Mobiles, laptops, watches and accessories.</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-0 text-center p-4 h-100">
              <h4>Fashion</h4>
              <p>T-shirts, hoodies, shoes and more.</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-0 text-center p-4 h-100">
              <h4>Deals</h4>
              <p>Best prices and latest offers for everyone.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-5 mb-5">
        <div className="card bg-light border-0 shadow-sm p-5 text-center">
          <h2 className="fw-bold">Start Browsing Without Login</h2>
          <p className="mt-3 text-muted">
            Login is needed only when you want to checkout or view orders.
          </p>
          <Link to="/products" className="btn btn-dark mt-3">
            Explore Products
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;