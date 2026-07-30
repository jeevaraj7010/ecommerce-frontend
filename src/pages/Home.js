import React, { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ProductContext } from "../context/ProductContext";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "./CartContext";
import { toast } from "react-toastify";
import SkeletonProductCard from "../components/SkeletonProductCard";

const CATEGORIES = [
  { name: "Hoodies", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80", count: "12+ Items" },
  { name: "T-Shirts", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80", count: "20+ Items" },
  { name: "Oversized T-Shirts", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop&q=80", count: "15+ Items" },
  { name: "Sweatshirts", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=80", count: "10+ Items" },
  { name: "Jackets", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=80", count: "8+ Items" },
  { name: "Custom Clothing", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=80", count: "Unlimited" },
];

const REVIEWS = [
  {
    name: "Alex Rivera",
    role: "Verified Buyer",
    rating: 5,
    comment: "The heavy fabric quality and minimalist finish exceed high-end retail brands. The custom hoodie preview was spot on!",
    avatar: "https://i.pravatar.cc/100?img=33"
  },
  {
    name: "Sophia Chen",
    role: "Verified Buyer",
    rating: 5,
    comment: "Instant delivery updates and top-tier customer experience. The oversized tee fits like an absolute dream.",
    avatar: "https://i.pravatar.cc/100?img=47"
  },
  {
    name: "Marcus Vance",
    role: "Custom Designer",
    rating: 5,
    comment: "Uploaded my artwork for print on demand. The quality control and final printing surpassed my expectations!",
    avatar: "https://i.pravatar.cc/100?img=12"
  }
];

function Home() {
  const navigate = useNavigate();
  const { products, loading } = useContext(ProductContext);
  const { isWishlisted, toggleWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const role = localStorage.getItem("role");

  const trendingProducts = products.slice(0, 4);
  const newArrivals = products.slice(4, 8);

  return (
    <div style={{ backgroundColor: "#F8F8F8", overflowX: "hidden" }}>
      {/* 🚀 HERO SECTION */}
      <section className="py-5 py-lg-6 position-relative text-center" style={{ minHeight: "82vh", display: "flex", alignItems: "center" }}>
        <div className="container py-4">
          <div className="row justify-content-center align-items-center">
            <div className="col-12 col-lg-8">
              <span className="badge rounded-pill bg-dark text-white px-3 py-2 text-xs fw-semibold mb-3 tracking-wide">
                NEW SEASON COLLECTION 2026
              </span>
              <h1 className="display-3 fw-extrabold text-dark tracking-tight mb-3" style={{ letterSpacing: "-1.5px", lineHeight: "1.1" }}>
                Minimal. Modern.<br />Made For You.
              </h1>
              <p className="lead text-secondary mb-4 mx-auto" style={{ maxWidth: "580px", fontSize: "1.2rem", fontWeight: "400" }}>
                Premium clothing designed for your style and creativity. Crafted with sustainable fabrics and precision detail.
              </p>
              
              <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap">
                <button
                  className="btn btn-dark btn-lg rounded-pill px-5 py-3 fw-semibold shadow-sm"
                  onClick={() => navigate("/products")}
                >
                  Shop Now →
                </button>
                <button
                  className="btn btn-outline-dark btn-lg rounded-pill px-5 py-3 fw-semibold"
                  onClick={() => navigate("/products")}
                >
                  Customize Your Style ✨
                </button>
              </div>
            </div>

            {/* HERO BANNER IMAGE */}
            <div className="col-12 col-lg-10 mt-5">
              <div className="rounded-5 overflow-hidden shadow-lg position-relative" style={{ height: "420px" }}>
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&auto=format&fit=crop&q=80"
                  alt="Premium Hoodify Collection"
                  className="w-100 h-100"
                  style={{ objectFit: "cover" }}
                />
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-end p-4 p-md-5" style={{ background: "linear-gradient(to top, rgba(17,24,39,0.7), transparent)" }}>
                  <div className="text-start text-white">
                    <h3 className="fw-bold mb-1">Titanium Edition Hoodies</h3>
                    <p className="mb-0 text-white-50">Heavyweight 450 GSM French Terry Fleece</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔥 1. TRENDING PRODUCTS */}
      <section className="py-5">
        <div className="container py-3">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-uppercase text-muted text-xs fw-bold tracking-wider d-block">CURATED SELECTION</span>
              <h2 className="fw-bold m-0 text-dark" style={{ letterSpacing: "-0.5px" }}>Trending Products 🔥</h2>
            </div>
            <button className="btn btn-link text-dark fw-semibold text-decoration-none p-0" onClick={() => navigate("/products")}>
              View All Products →
            </button>
          </div>

          {loading ? (
            <div className="row g-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div className="col-6 col-md-3" key={i}><SkeletonProductCard /></div>
              ))}
            </div>
          ) : (
            <div className="row g-4">
              {trendingProducts.map((p) => {
                const isOut = p.quantity <= 0;
                const wishlisted = isWishlisted(p.id);

                return (
                  <div className="col-6 col-md-3" key={p.id}>
                    <div
                      className="card border-0 shadow-sm p-3 h-100 apple-card-hover position-relative"
                      style={{ cursor: "pointer", borderRadius: "20px" }}
                      onClick={() => navigate(`/product/${p.id}`)}
                    >
                      {role !== "ROLE_ADMIN" && (
                        <button
                          className="position-absolute top-0 end-0 m-3 btn btn-light btn-sm rounded-circle shadow-sm border-0 z-2"
                          style={{ width: "34px", height: "34px", lineHeight: "1" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(p);
                          }}
                        >
                          <span style={{ fontSize: "16px", color: wishlisted ? "red" : "#aaa" }}>
                            {wishlisted ? "❤️" : "🤍"}
                          </span>
                        </button>
                      )}

                      <div className="img-zoom-container mb-3" style={{ height: "200px" }}>
                        <img src={p.imageUrl || "https://picsum.photos/300"} alt={p.name} loading="lazy" />
                      </div>

                      <h6 className="fw-bold text-truncate mb-1">{p.name}</h6>
                      <div className="d-flex align-items-center justify-content-between mt-2">
                        <span className="fw-bold text-dark fs-5">₹{p.price}</span>
                        <div className="small text-warning">
                          ★ <span className="text-dark fw-semibold">{p.rating ? p.rating.toFixed(1) : "5.0"}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <button
                          className={`btn btn-sm w-100 ${isOut ? "btn-secondary" : "btn-dark"} rounded-pill py-2`}
                          disabled={isOut}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isOut) {
                              addToCart(p);
                              toast.success(`${p.name} added to cart 🛒`);
                            }
                          }}
                        >
                          {isOut ? "OUT OF STOCK" : "Add To Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 🚀 2. NEW ARRIVALS */}
      <section className="py-5 bg-white">
        <div className="container py-3">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-uppercase text-muted text-xs fw-bold tracking-wider d-block">FRESH DROPS</span>
              <h2 className="fw-bold m-0 text-dark" style={{ letterSpacing: "-0.5px" }}>New Arrivals ✨</h2>
            </div>
            <button className="btn btn-link text-dark fw-semibold text-decoration-none p-0" onClick={() => navigate("/products")}>
              Explore Collection →
            </button>
          </div>

          <div className="row g-4">
            {newArrivals.map((p) => {
              const isOut = p.quantity <= 0;
              const wishlisted = isWishlisted(p.id);

              return (
                <div className="col-6 col-md-3" key={p.id}>
                  <div
                    className="card border-0 shadow-sm p-3 h-100 apple-card-hover position-relative"
                    style={{ cursor: "pointer", borderRadius: "20px" }}
                    onClick={() => navigate(`/product/${p.id}`)}
                  >
                    {role !== "ROLE_ADMIN" && (
                      <button
                        className="position-absolute top-0 end-0 m-3 btn btn-light btn-sm rounded-circle shadow-sm border-0 z-2"
                        style={{ width: "34px", height: "34px", lineHeight: "1" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(p);
                        }}
                      >
                        <span style={{ fontSize: "16px", color: wishlisted ? "red" : "#aaa" }}>
                          {wishlisted ? "❤️" : "🤍"}
                        </span>
                      </button>
                    )}

                    <div className="img-zoom-container mb-3" style={{ height: "200px" }}>
                      <img src={p.imageUrl || "https://picsum.photos/300"} alt={p.name} loading="lazy" />
                    </div>

                    <h6 className="fw-bold text-truncate mb-1">{p.name}</h6>
                    <div className="d-flex align-items-center justify-content-between mt-2">
                      <span className="fw-bold text-dark fs-5">₹{p.price}</span>
                      <div className="small text-warning">
                        ★ <span className="text-dark fw-semibold">{p.rating ? p.rating.toFixed(1) : "5.0"}</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <button
                        className={`btn btn-sm w-100 ${isOut ? "btn-secondary" : "btn-dark"} rounded-pill py-2`}
                        disabled={isOut}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOut) {
                            addToCart(p);
                            toast.success(`${p.name} added to cart 🛒`);
                          }
                        }}
                      >
                        {isOut ? "OUT OF STOCK" : "Add To Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🏷️ 3. CATEGORIES */}
      <section className="py-5">
        <div className="container py-3">
          <div className="text-center mb-5">
            <span className="text-uppercase text-muted text-xs fw-bold tracking-wider d-block">EXPLORE STYLES</span>
            <h2 className="fw-bold text-dark" style={{ letterSpacing: "-0.5px" }}>Shop By Category</h2>
          </div>

          <div className="row g-4">
            {CATEGORIES.map((cat, idx) => (
              <div className="col-6 col-md-4 col-lg-2" key={idx}>
                <div
                  className="card border-0 shadow-sm overflow-hidden text-center p-3 apple-card-hover"
                  style={{ cursor: "pointer", borderRadius: "20px" }}
                  onClick={() => navigate(`/products`)}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="rounded-circle mx-auto mb-3"
                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                  />
                  <h6 className="fw-bold mb-1 text-truncate" style={{ fontSize: "14px" }}>{cat.name}</h6>
                  <span className="small text-muted">{cat.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ✨ 4. CUSTOM DESIGN SECTION */}
      <section className="py-5 bg-dark text-white position-relative">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6">
              <span className="badge rounded-pill bg-primary px-3 py-2 text-xs mb-3">CUSTOM LAB STUDIO</span>
              <h2 className="display-5 fw-bold mb-3" style={{ letterSpacing: "-1px" }}>
                Design Your Custom Outfit
              </h2>
              <p className="text-white-50 lead mb-4" style={{ fontSize: "1.1rem" }}>
                Upload your custom image, add personalized text, and preview high-definition prints in real time. We print with durable eco-pigment inks.
              </p>
              
              <button
                className="btn btn-light rounded-pill px-5 py-3 fw-semibold text-dark shadow-sm"
                onClick={() => navigate("/products")}
              >
                Start Designing Now ✨
              </button>
            </div>

            <div className="col-12 col-lg-6">
              <div className="position-relative text-center">
                <img
                  src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80"
                  alt="Custom Studio Hoodie"
                  className="img-fluid rounded-4 shadow-lg"
                  style={{ maxHeight: "360px", objectFit: "cover" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ⭐ 5. CUSTOMER REVIEWS */}
      <section className="py-5">
        <div className="container py-3">
          <div className="text-center mb-5">
            <span className="text-uppercase text-muted text-xs fw-bold tracking-wider d-block">COMMUNITY FEEDBACK</span>
            <h2 className="fw-bold text-dark" style={{ letterSpacing: "-0.5px" }}>What Our Customers Say</h2>
          </div>

          <div className="row g-4">
            {REVIEWS.map((rev, i) => (
              <div className="col-12 col-md-4" key={i}>
                <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <img src={rev.avatar} alt={rev.name} className="rounded-circle" style={{ width: "48px", height: "48px" }} />
                    <div>
                      <h6 className="fw-bold mb-0">{rev.name}</h6>
                      <small className="text-success fw-semibold">{rev.role} ✓</small>
                    </div>
                  </div>
                  <div className="text-warning mb-2">{"★".repeat(rev.rating)}</div>
                  <p className="text-secondary small mb-0">"{rev.comment}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🌟 6. WHY CHOOSE HOODIFY? */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="text-uppercase text-muted text-xs fw-bold tracking-wider d-block">THE HOODIFY DIFFERENCE</span>
            <h2 className="fw-extrabold text-dark" style={{ letterSpacing: "-0.5px" }}>Why Choose Hoodify?</h2>
          </div>

          <div className="row g-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-4 text-center apple-card-hover bg-light">
                <div className="fs-1 mb-3">✨</div>
                <h5 className="fw-bold text-dark mb-2">Premium Quality</h5>
                <p className="text-secondary small mb-0">Made with high quality fabrics and premium craftsmanship.</p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-4 text-center apple-card-hover bg-light">
                <div className="fs-1 mb-3">🎨</div>
                <h5 className="fw-bold text-dark mb-2">Custom Designs</h5>
                <p className="text-secondary small mb-0">Upload your own designs and make your clothing truly yours.</p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-4 text-center apple-card-hover bg-light">
                <div className="fs-1 mb-3">🔒</div>
                <h5 className="fw-bold text-dark mb-2">Secure Shopping</h5>
                <p className="text-secondary small mb-0">Protected authentication and smooth shopping experience.</p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-4 text-center apple-card-hover bg-light">
                <div className="fs-1 mb-3">🚀</div>
                <h5 className="fw-bold text-dark mb-2">Fast Delivery</h5>
                <p className="text-secondary small mb-0">Quick and reliable delivery for all your orders.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🖤 7. PREMIUM FOOTER */}
      <footer className="bg-dark text-white pt-5 pb-4">
        <div className="container">
          <div className="row g-4 mb-4">
            <div className="col-12 col-md-4">
              <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <span></span> HOODIFY
              </h4>
              <p className="text-white-50 small mb-0" style={{ maxWidth: "300px" }}>
                Minimalist fashion engineered for comfort, durability, and unlimited self-expression.
              </p>
            </div>

            <div className="col-6 col-md-2">
              <h6 className="fw-bold mb-3 text-white">Shop</h6>
              <ul className="list-unstyled small text-white-50">
                <li className="mb-2"><Link to="/products" className="hover-white">Hoodies</Link></li>
                <li className="mb-2"><Link to="/products" className="hover-white">T-Shirts</Link></li>
                <li className="mb-2"><Link to="/products" className="hover-white">Oversized</Link></li>
                <li className="mb-2"><Link to="/products" className="hover-white">Sweatshirts</Link></li>
              </ul>
            </div>

            <div className="col-6 col-md-2">
              <h6 className="fw-bold mb-3 text-white">Company</h6>
              <ul className="list-unstyled small text-white-50">
                <li className="mb-2">About Us</li>
                <li className="mb-2">Sustainability</li>
                <li className="mb-2">Careers</li>
                <li className="mb-2">Press</li>
              </ul>
            </div>

            <div className="col-12 col-md-4">
              <h6 className="fw-bold mb-3 text-white">Support & Legal</h6>
              <p className="text-white-50 small mb-2">Need assistance with a custom order or tracking?</p>
              <small className="text-white-50 d-block">Email: support@hoodify.com</small>
            </div>
          </div>

          <hr className="border-secondary" />

          <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between small text-white-50 py-2">
            <span>© 2026 HOODIFY Inc. All rights reserved.</span>
            <span>Privacy Policy • Terms of Service • Shipping Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;