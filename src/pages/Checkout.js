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
    email: "",
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
          email: res.data.email || "",
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
    if (!form.phone.trim()) {
      toast.warning("Phone is required 📱");
      return;
    }

    if (!form.email.trim()) {
      toast.warning("Email is required 📧");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast.warning("Enter valid email ❌");
      return;
    }

    if (
      !form.street.trim() ||
      !form.city.trim() ||
      !form.district.trim() ||
      !form.pincode.trim()
    ) {
      toast.warning("Please fill address completely 🏠");
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
          email: form.email,
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
      await Promise.all(
        cartItems.map((item) =>
          axios.post(
            `https://ecommerce-backend-1-tsra.onrender.com/api/orders/${item.id}/${item.quantity}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        )
      );

      toast.success("Order placed successfully 🎉");
      clearCart();
      navigate("/order-success");

    } catch (error) {
      console.error(error);

      if (error.response?.data?.includes("Email already")) {
        toast.error("Email already used ❌");
      } else {
        toast.error(error.response?.data || "Something went wrong ❌");
      }
    }
  };

  // 🔄 Loading UI
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

            <input className="form-control mb-3" value={form.name} readOnly />

            <input
              name="phone"
              className="form-control mb-3"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number"
            />

            <input
              name="email"
              type="email"
              className="form-control mb-3"
              value={form.email}
              onChange={handleChange}
              placeholder="Email (Required)"
            />

            <textarea
              name="street"
              className="form-control mb-3"
              rows="2"
              value={form.street}
              onChange={handleChange}
              placeholder="Street / House No / Area"
            />

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

            <input
              name="pincode"
              className="form-control mb-3"
              value={form.pincode}
              onChange={handleChange}
              placeholder="Pincode"
            />

            <h5 className="mb-3 text-center">
              Total: ₹{getTotal()}
            </h5>

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