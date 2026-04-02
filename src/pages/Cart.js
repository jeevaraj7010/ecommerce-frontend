import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";

function Cart() {
  const {
    cartItems,
    increaseQty,
    decreaseQty,
    removeFromCart,
    getTotal,
  } = useContext(CartContext);

  const navigate = useNavigate();

  const handleCheckout = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to continue checkout");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    navigate("/checkout");
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Your Cart</h2>

      {cartItems.length === 0 ? (
        <p className="text-center">No items added yet.</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item.id} className="card p-3 mb-3">
              <div className="row align-items-center">
                <div className="col-md-3">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="img-fluid"
                    style={{ maxHeight: "120px", objectFit: "cover" }}
                  />
                </div>

                <div className="col-md-3">
                  <h5>{item.name}</h5>
                  <p>{item.description}</p>
                </div>

                <div className="col-md-3 text-center">
                  <button
                    className="btn btn-secondary me-2"
                    onClick={() => decreaseQty(item.id)}
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    className="btn btn-secondary ms-2"
                    onClick={() => increaseQty(item.id)}
                  >
                    +
                  </button>
                </div>

                <div className="col-md-3 text-end">
                  <h6>₹{item.price * item.quantity}</h6>

                  <button
                    className="btn btn-danger btn-sm mt-2"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="text-end mt-4">
            <h4>Total: ₹{getTotal()}</h4>

            <button className="btn btn-primary mt-3" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;