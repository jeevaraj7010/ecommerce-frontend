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

  useEffect(() => {
    const token = localStorage.getItem("token");

    if(!token) {
      alert("Please login first");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    axios
      .get("http://localhost:8081/auth/me", {
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
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    const token = localStorage.getItem("token");

    if (!form.name || !form.phone || !form.address) {
      alert("Please fill all address details");
      return;
    }

    try {
      // Save/update address before payment
      await axios.put(
        "http://localhost:8081/auth/update-address",
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
        key:"rzp_test_SYFtpVxC2rCFbs",
        amount: getTotal() * 100,
        currency: "INR",
        name: "MyStore",
        description: "Order Payment",
        handler: async function () {
          try {
            for (let item of cartItems) {
              await axios.post(
                `http://localhost:8081/api/orders/${item.id}/${item.quantity}`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
            }

            alert("Payment successful and order placed");
            clearCart();
            navigate("/orders");
          } catch (error) {
            console.error(error);
            alert(error.response?.data || "Order failed after payment");
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
      rzp.open();
    } catch (error) {
      console.error(error);
      alert(error.response?.data || "Failed to save address");
    }
  };

  if (loading) {
    return <h3 className="text-center mt-5">Loading checkout...</h3>;
  }

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <div className="card p-4 shadow">
        <h2 className="text-center mb-4">Checkout</h2>

        <input
          type="text"
          name="name"
          className="form-control mb-3"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          readOnly
        />

        <input
          type="text"
          name="phone"
          className="form-control mb-3"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
        />

        <textarea
          name="address"
          className="form-control mb-3"
          placeholder="Delivery Address"
          rows="4"
          value={form.address}
          onChange={handleChange}
        />

        <h5 className="mb-3">Total: ₹{getTotal()}</h5>

        <button className="btn btn-success w-100" onClick={handlePayment}>
          Pay Now
        </button>
      </div>
    </div>
  );
}

export default Checkout;