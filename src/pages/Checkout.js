import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { CartContext } from "./CartContext";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const { cartItems, getTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);

  // 🔥 Load user data
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    axios
      .get("https://ecommerce-backend-1-tsra.onrender.com/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setForm({
          name: res.data.username || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
        });
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load user ❌");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // 🔥 Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 Handle payment
  const handlePayment = async () => {
    const token = localStorage.getItem("token");

    // ✅ Safety checks
    if (!token) {
      alert("Session expired. Login again");
      navigate("/login");
      return;
    }

    if (!form.phone || !form.address) {
      alert("Fill address details");
      return;
    }

    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    if (!window.Razorpay) {
      alert("Payment system not loaded. Refresh page");
      return;
    }

    try {
      // 🔥 Save address
      await axios.put(
        "https://ecommerce-backend-1-tsra.onrender.com/auth/update-address",
        {
          phone: form.phone,
          address: form.address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 🔥 Razorpay options
      const options = {
        key: "rzp_test_SYFtpVxC2rCFbs",
        amount: getTotal() * 100,
        currency: "INR",
        name: "Hoodify",
        description: "Order Payment",

        handler: async function (response) {
          console.log("PAYMENT SUCCESS:", response);

          try {
            for (let item of cartItems) {
              await axios.post(
                `https://ecommerce-backend-1-tsra.onrender.com/api/orders/${item.id}/${item.quantity}`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
            }

            alert("Payment successful 🎉");
            clearCart();
            navigate("/orders");

          } catch (error) {
            console.error(error);
            alert(error.response?.data || "Order failed ❌");
          }
        },

        prefill: {
          name: form.name,
          contact: form.phone,
        },

        notes: {
          address: form.address,
        },

        theme: {
          color: "#198754",
        },
      };

      const rzp = new window.Razorpay(options);

      // ❌ Payment failure handler
      rzp.on("payment.failed", function (response) {
        console.error("PAYMENT FAILED:", response.error);
        alert("Payment failed ❌");
      });

      rzp.open();

    } catch (error) {
      console.error(error);
      alert(error.response?.data || "Failed to save address ❌");
    }
  };

  // 🔥 Loading UI
  if (loading) {
    return (
      <div className="text-center mt-5">
        <h4>Loading checkout...</h4>
      </div>
    );
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "90vh", background: "#f1f5f9" }}
    >
      <div
        className="card shadow-lg p-4"
        style={{ width: "100%", maxWidth: "450px", borderRadius: "20px" }}
      >
        <h3 className="text-center fw-bold mb-3">Checkout</h3>

        {/* Name */}
        <input className="form-control mb-3" value={form.name} readOnly />

        {/* Phone */}
        <input
          name="phone"
          className="form-control mb-3"
          value={form.phone}
          onChange={handleChange}
          placeholder="Enter phone"
        />

        {/* Address */}
        <textarea
          name="address"
          className="form-control mb-3"
          rows="3"
          value={form.address}
          onChange={handleChange}
          placeholder="Enter address"
        />

        {/* Total */}
        <h5 className="mb-3 text-center">Total: ₹{getTotal()}</h5>

        {/* Button */}
        <button
          className="btn btn-success w-100 py-2"
          onClick={handlePayment}
          disabled={cartItems.length === 0}
        >
          Pay Now
        </button>
      </div>
    </div>
  );
}

export default Checkout;