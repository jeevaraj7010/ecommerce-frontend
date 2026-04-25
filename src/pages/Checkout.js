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
    email: "", // 🔥 NEW
    street: "",
    city: "",
    district: "",
    pincode: "",
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
          email: res.data.email || "", // 🔥 AUTO-FILL
          street: res.data.street || "",
          city: res.data.city || "",
          district: res.data.district || "",
          pincode: res.data.pincode || "",
        });
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load user ❌");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 FINAL ORDER HANDLER
  const handlePayment = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Session expired. Login again ❌");
      navigate("/login");
      return;
    }

    // 🔥 VALIDATION
    if (
      !form.phone ||
      !form.email ||
      !form.street ||
      !form.city ||
      !form.district ||
      !form.pincode
    ) {
      toast.warning("Please fill all details ⚠️");
      return;
    }

    if (cartItems.length === 0) {
      toast.warning("Cart is empty 🛒");
      return;
    }

    try {
      // 🔥 SAVE EMAIL + ADDRESS
      await axios.put(
        "https://ecommerce-backend-1-tsra.onrender.com/auth/update-address",
        {
          phone: form.phone,
          email: form.email, // 🔥 NEW
          street: form.street,
          city: form.city,
          district: form.district,
          pincode: form.pincode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 🔥 SAVE ORDERS
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

      toast.success("Order placed successfully 🎉");
      clearCart();
      navigate("/order-success");

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data || "Something went wrong ❌");
    }
  };

  // 🔄 Loading
  if (loading) {
    return (
      <div className="text-center mt-5">
        <h4>Loading checkout...</h4>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">

        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-lg p-4" style={{ borderRadius: "20px" }}>

            <h3 className="text-center fw-bold mb-3">Checkout</h3>

            {/* Name */}
            <input
              className="form-control mb-3"
              value={form.name}
              readOnly
            />

            {/* Phone */}
            <input
              name="phone"
              className="form-control mb-3"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number"
            />

            {/* 🔥 EMAIL */}
            <input
              name="email"
              type="email"
              className="form-control mb-3"
              value={form.email}
              onChange={handleChange}
              placeholder="Email (Required)"
            />

            {/* Street */}
            <textarea
              name="street"
              className="form-control mb-3"
              rows="2"
              value={form.street}
              onChange={handleChange}
              placeholder="Street / House No / Area"
            />

            {/* City + District */}
            <div className="row">
              <div className="col-12 col-md-6">
                <input
                  name="city"
                  className="form-control mb-3"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>

              <div className="col-12 col-md-6">
                <input
                  name="district"
                  className="form-control mb-3"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="District"
                />
              </div>
            </div>

            {/* Pincode */}
            <input
              name="pincode"
              className="form-control mb-3"
              value={form.pincode}
              onChange={handleChange}
              placeholder="Pincode"
            />

            {/* Total */}
            <h5 className="mb-3 text-center">
              Total: ₹{getTotal()}
            </h5>

            {/* Button */}
            <button
              className="btn btn-success w-100 py-2"
              onClick={handlePayment}
              disabled={cartItems.length === 0}
            >
              Place Order
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Checkout;