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
  const [enlargedImage, setEnlargedImage] = useState(null);

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
        toast.error("Failed to load user info ❌");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Session expired. Login again ❌");
      navigate("/login");
      return;
    }

    if (!form.phone.trim()) {
      toast.warning("Phone number is required 📱");
      return;
    }

    if (!form.email.trim()) {
      toast.warning("Email is required 📧");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast.warning("Enter a valid email address ❌");
      return;
    }

    if (
      !form.street.trim() ||
      !form.city.trim() ||
      !form.district.trim() ||
      !form.pincode.trim()
    ) {
      toast.warning("Please complete shipping address 🏠");
      return;
    }

    if (cartItems.length === 0) {
      toast.warning("Your cart is empty 🛒");
      return;
    }

    try {
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

      await Promise.all(
        cartItems.map((item) =>
          axios.post(
            `https://ecommerce-backend-1-tsra.onrender.com/api/orders/${item.id}/${item.quantity}`,
            {
              designImageUrl: item.customImageUrl || null,
              customImageUrl: item.customImageUrl || null,
              customText: item.customText || null,
            },
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
        toast.error("Email already registered to another account ❌");
      } else {
        toast.error(error.response?.data || "Failed to complete order placement ❌");
      }
    }
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading checkout...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-extrabold text-dark m-0" style={{ letterSpacing: "-0.5px" }}>Checkout</h2>
        <p className="text-muted small">Complete your delivery address & payment details</p>
      </div>

      <div className="row g-4">
        {/* SHIPPING & PAYMENT FORM */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-4">
            <h5 className="fw-bold text-dark mb-3">1. Shipping Address</h5>

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Customer Name</label>
              <input className="form-control rounded-3 bg-light border-0" value={form.name} readOnly />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold text-dark">Phone Number</label>
                <input
                  name="phone"
                  className="form-control rounded-3 border-0 bg-light"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold text-dark">Email Address</label>
                <input
                  name="email"
                  type="email"
                  className="form-control rounded-3 border-0 bg-light"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-dark">Street / Flat / Locality</label>
              <textarea
                name="street"
                className="form-control rounded-3 border-0 bg-light"
                rows="2"
                value={form.street}
                onChange={handleChange}
                placeholder="Building No, Street Name, Area..."
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-dark">City</label>
                <input
                  name="city"
                  className="form-control rounded-3 border-0 bg-light"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-dark">District</label>
                <input
                  name="district"
                  className="form-control rounded-3 border-0 bg-light"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="District"
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-dark">Pincode</label>
                <input
                  name="pincode"
                  className="form-control rounded-3 border-0 bg-light"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="600001"
                />
              </div>
            </div>
          </div>

          {/* PAYMENT METHOD SELECTION */}
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
            <h5 className="fw-bold text-dark mb-3">2. Payment Method</h5>

            <div className="card border-2 border-dark p-3 rounded-4 bg-dark text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="fw-bold mb-1">Cash On Delivery (COD) 🚚</h6>
                  <small className="text-white-50">Pay cash upon package arrival at your doorstep</small>
                </div>
                <span className="badge bg-success rounded-pill px-3 py-1.5 fw-bold">ONLY SUPPORTED METHOD</span>
              </div>
            </div>
          </div>
        </div>

        {/* SUMMARY CARD */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white sticky-top" style={{ top: "100px" }}>
            <h5 className="fw-bold text-dark mb-3">Order Summary</h5>

            <div className="d-flex flex-column gap-3 mb-4" style={{ maxHeight: "320px", overflowY: "auto" }}>
              {cartItems.map((item, idx) => (
                <div key={idx} className="d-flex align-items-center justify-content-between pb-2 border-bottom">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={item.imageUrl || "https://picsum.photos/200"}
                      alt={item.name}
                      className="rounded"
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                    {item.customImageUrl && (
                      <img
                        src={item.customImageUrl}
                        alt="Custom artwork"
                        className="rounded border border-primary cursor-pointer"
                        style={{ width: "40px", height: "40px", objectFit: "cover", cursor: "pointer" }}
                        onClick={() => setEnlargedImage(item.customImageUrl)}
                        title="Click to enlarge design"
                      />
                    )}
                    <div>
                      <h6 className="mb-0 fw-bold text-dark text-truncate" style={{ maxWidth: "160px" }}>{item.name}</h6>
                      {item.customText && (
                        <small className="badge bg-light text-dark border d-block my-1 text-truncate" style={{ maxWidth: "150px" }}>
                          Text: "{item.customText}"
                        </small>
                      )}
                      <small className="text-muted">Qty: {item.quantity}</small>
                    </div>
                  </div>
                  <span className="fw-bold text-dark">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-between mb-2 text-secondary">
              <span>Items Total</span>
              <span className="fw-semibold text-dark">₹{getTotal()}</span>
            </div>

            <div className="d-flex justify-content-between mb-2 text-secondary">
              <span>Shipping</span>
              <span className="text-success fw-semibold">FREE</span>
            </div>

            {/* ESTIMATED DELIVERY */}
            <div className="p-3 bg-light rounded-3 mb-3 border">
              <small className="text-muted d-block fw-bold mb-1">ESTIMATED DELIVERY</small>
              {cartItems.some((i) => i.customImageUrl || i.customText) ? (
                <span className="fw-bold text-primary">7-10 Working Days (Custom Order)</span>
              ) : (
                <span className="fw-bold text-dark">3-5 Working Days (Standard Order)</span>
              )}
            </div>

            <hr />

            <div className="d-flex justify-content-between mb-4">
              <span className="fw-bold fs-5 text-dark">Grand Total</span>
              <span className="fw-extrabold fs-4 text-dark">₹{getTotal()}</span>
            </div>

            <button
              className="btn btn-dark w-100 py-3 rounded-pill fw-bold shadow"
              onClick={handlePayment}
              disabled={cartItems.length === 0}
            >
              Place Order Now 💳
            </button>
          </div>
        </div>
      </div>

      {/* ENLARGE PREVIEW MODAL */}
      {enlargedImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center z-3"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="bg-white p-4 rounded-4 text-center shadow-lg">
            <h6 className="fw-bold mb-3">Custom Uploaded Artwork</h6>
            <img
              src={enlargedImage}
              alt="Enlarged design"
              className="rounded-3 img-fluid mb-3"
              style={{ maxHeight: "350px", objectFit: "contain" }}
            />
            <div>
              <button className="btn btn-secondary rounded-pill px-4" onClick={() => setEnlargedImage(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;