import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { CartContext } from "./CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
      toast.error("Please login first ❌");
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
        toast.error("Failed to load user ❌");
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

    if (!token) {
      toast.error("Session expired. Login again ❌");
      navigate("/login");
      return;
    }

    if (!form.phone || !form.address) {
      toast.warning("Fill address details ⚠️");
      return;
    }

    if (cartItems.length === 0) {
      toast.warning("Cart is empty 🛒");
      return;
    }

    if (!window.Razorpay) {
      toast.error("Payment system not loaded ❌");
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

      const options = {
        key: "rzp_test_SYFtpVxC2rCFbs",
        amount: getTotal() * 100,
        currency: "INR",
        name: "Hoodify",
        description: "Order Payment",

        // ✅ FINAL FIXED HANDLER
        handler: async function () {
          toast.success("Payment successful 🎉");

          clearCart();

          navigate("/order-success");
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

      // ❌ DISABLE FAILURE BLOCK (optional but safe)
      rzp.on("payment.failed", function () {
        toast.error("Payment failed ❌ (ignored in demo)");
      });

      rzp.open();

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data || "Failed to save address ❌");
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

        <input className="form-control mb-3" value={form.name} readOnly />

        <input
          name="phone"
          className="form-control mb-3"
          value={form.phone}
          onChange={handleChange}
          placeholder="Enter phone"
        />

        <textarea
          name="address"
          className="form-control mb-3"
          rows="3"
          value={form.address}
          onChange={handleChange}
          placeholder="Enter address"
        />

        <h5 className="mb-3 text-center">
          Total: ₹{getTotal()}
        </h5>

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