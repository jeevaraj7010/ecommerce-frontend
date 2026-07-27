import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import { toast } from "react-toastify";

function Cart() {
  const {
    cartItems,
    increaseQty,
    decreaseQty,
    removeFromCart,
    getTotal,
  } = useContext(CartContext);

  const [enlargedImage, setEnlargedImage] = useState(null);
  const navigate = useNavigate();

  const handleCheckout = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.warning("Please login to continue checkout ⚠️");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    navigate("/checkout");
  };

  return (
    <div className="container mt-5 py-3">
      <h2 className="text-center mb-4 fw-bold">Your Cart 🛒</h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-5">
          <p className="fs-5 text-muted">No items added yet.</p>

          <button
            className="btn btn-dark mt-2"
            onClick={() => navigate("/products")}
          >
            Explore Clothing Categories
          </button>
        </div>
      ) : (
        <>
          {cartItems.map((item, index) => (
            <div key={index} className="card p-3 mb-3 shadow-sm border-0">
              <div className="row align-items-center g-3">
                <div className="col-12 col-md-3 d-flex align-items-center gap-2">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="img-fluid rounded"
                    style={{ maxHeight: "100px", objectFit: "cover" }}
                  />

                  {/* 🎨 CUSTOM DESIGN THUMBNAIL */}
                  {item.customImageUrl && (
                    <div className="text-center ms-2">
                      <span className="badge bg-primary d-block mb-1">Your Design</span>
                      <img
                        src={item.customImageUrl}
                        alt="Custom design"
                        className="custom-design-preview rounded border cursor-pointer"
                        style={{ width: "55px", height: "55px", objectFit: "cover", cursor: "pointer" }}
                        onClick={() => setEnlargedImage(item.customImageUrl)}
                        title="Click to Enlarge"
                      />
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-4">
                  <h5 className="fw-bold mb-1">{item.name}</h5>
                  <p className="text-muted small mb-0">{item.description}</p>
                </div>

                <div className="col-6 col-md-2 text-center">
                  <div className="d-inline-flex align-items-center border rounded px-2 py-1 bg-light">
                    <button
                      className="btn btn-sm btn-link text-dark text-decoration-none px-2 fw-bold"
                      onClick={() => decreaseQty(index)}
                    >
                      -
                    </button>
                    <span className="px-2 fw-bold">{item.quantity}</span>
                    <button
                      className="btn btn-sm btn-link text-dark text-decoration-none px-2 fw-bold"
                      onClick={() => increaseQty(index)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="col-6 col-md-3 text-end">
                  <h5 className="fw-bold text-success mb-2">
                    ₹{item.price * item.quantity}
                  </h5>

                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => removeFromCart(index)}
                  >
                    Remove ❌
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="card p-4 mt-4 shadow-sm border-0 bg-light text-end">
            <h4 className="fw-bold">Total: ₹{getTotal()}</h4>

            <div className="mt-3">
              <button
                className="btn btn-outline-dark me-2"
                onClick={() => navigate("/products")}
              >
                Continue Shopping
              </button>

              <button className="btn btn-success btn-lg" onClick={handleCheckout}>
                Proceed to Checkout 💳
              </button>
            </div>
          </div>
        </>
      )}

      {/* CLICK TO ENLARGE MODAL */}
      {enlargedImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center z-3"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="bg-white p-3 rounded text-center">
            <h6 className="fw-bold mb-2">Custom Design Preview</h6>
            <img
              src={enlargedImage}
              alt="Enlarged design"
              style={{ maxWidth: "80vw", maxHeight: "70vh", objectFit: "contain" }}
            />
            <div className="mt-3">
              <button className="btn btn-secondary btn-sm" onClick={() => setEnlargedImage(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;