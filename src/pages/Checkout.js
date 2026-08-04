import { useState, useContext, useEffect } from "react";
import axios from "axios";
import API from "../api/axios";
import { CartContext } from "./CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AddressSelector from "../components/address/AddressSelector";

function Checkout() {
  const { cartItems, getTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const fetchAddresses = async () => {
    try {
      const res = await API.get("/api/profile/address");
      const list = res.data || [];
      setAddresses(list);

      // Auto-select Primary address or first address
      if (list.length > 0) {
        const primary = list.find((a) => a.defaultAddress);
        setSelectedAddress(primary || list[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load saved addresses ❌");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first ❌");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    try {
      const savedCoupon = sessionStorage.getItem("hoodify_applied_coupon");
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {
      console.error(e);
    }

    fetchAddresses().finally(() => setLoading(false));
  }, [navigate]);

  const handleSaveNewAddress = async (formData) => {
    try {
      const res = await API.post("/api/profile/address", formData);
      toast.success("Address saved successfully 🎉");
      setSelectedAddress(res.data);
      fetchAddresses();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save address ❌");
    }
  };

  const rawSubtotal = getTotal();
  const discountAmount = appliedCoupon ? appliedCoupon.discount || 0 : 0;
  const subtotalAfterDiscount = Math.max(0, rawSubtotal - discountAmount);
  const shippingCharge = subtotalAfterDiscount >= 1500 ? 0 : 99;
  const savedShipping = shippingCharge === 0 ? 99 : 0;
  const totalSavings = discountAmount + savedShipping;
  const grandTotal = subtotalAfterDiscount + shippingCharge;

  const handlePayment = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Session expired. Login again ❌");
      navigate("/login");
      return;
    }

    if (!selectedAddress) {
      toast.warning("Please select or add a delivery address 🏠");
      return;
    }

    if (cartItems.length === 0) {
      toast.warning("Your cart is empty 🛒");
      return;
    }

    try {
      // Distribute discount & shipping proportionally across items
      const itemCount = cartItems.length;
      const perItemDiscount = itemCount > 0 ? discountAmount / itemCount : 0;
      const perItemShipping = itemCount > 0 ? shippingCharge / itemCount : 0;
      const perItemSavings = itemCount > 0 ? totalSavings / itemCount : 0;

      await Promise.all(
        cartItems.map((item) => {
          const itemSubtotal = item.price * item.quantity;
          const itemFinalTotal = Math.max(
            0,
            itemSubtotal - perItemDiscount + perItemShipping
          );

          return axios.post(
            `https://ecommerce-backend-1-tsra.onrender.com/api/orders/${item.id}/${item.quantity}`,
            {
              variantId: item.variantId || null,
              size: item.size || null,
              designImageUrl: item.customImageUrl || null,
              customImageUrl: item.customImageUrl || null,
              customText: item.customText || null,
              couponCode: appliedCoupon ? appliedCoupon.code : null,
              discountAmount: Math.round(perItemDiscount * 100.0) / 100.0,
              shippingCharge: Math.round(perItemShipping * 100.0) / 100.0,
              totalSavings: Math.round(perItemSavings * 100.0) / 100.0,
              finalTotal: Math.round(itemFinalTotal * 100.0) / 100.0,

              // Delivery address snapshot
              deliveryName: selectedAddress.fullName,
              deliveryPhone: selectedAddress.phone,
              deliveryHouseNo: selectedAddress.houseNo,
              deliveryStreet: selectedAddress.street,
              deliveryLandmark: selectedAddress.landmark,
              deliveryInstructions: selectedAddress.deliveryInstructions,
              deliveryCity: selectedAddress.city,
              deliveryDistrict: selectedAddress.district,
              deliveryState: selectedAddress.state,
              deliveryPincode: selectedAddress.pincode,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        })
      );

      toast.success("Order placed successfully 🎉");
      sessionStorage.removeItem("hoodify_applied_coupon");
      clearCart();
      navigate("/order-success");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.response?.data || "Failed to complete order placement ❌");
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
        <p className="text-muted small">Select delivery address, review summary & complete order</p>
      </div>

      <div className="row g-4">
        {/* LEFT COLUMN: ADDRESS SELECTION & PAYMENT METHOD */}
        <div className="col-12 col-lg-7">
          {/* STEP 1: DELIVERY ADDRESS SELECTOR */}
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-4">
            <h5 className="fw-bold text-dark mb-3">1. Delivery Address</h5>
            <AddressSelector
              addresses={addresses}
              selectedAddress={selectedAddress}
              onSelectAddress={(addr) => setSelectedAddress(addr)}
              onSaveNewAddress={handleSaveNewAddress}
            />
          </div>

          {/* STEP 2: ADDRESS CONFIRMATION STEP */}
          {selectedAddress && (
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-4" style={{ borderLeft: "4px solid #22c55e" }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold text-dark m-0">Confirm Delivery Destination 📍</h6>
                <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2.5 py-1 rounded-pill small">
                  SELECTED
                </span>
              </div>
              <div className="fw-extrabold text-dark">{selectedAddress.fullName}</div>
              <div className="text-muted small mb-1">📱 {selectedAddress.phone}</div>
              <div className="text-secondary small">
                {selectedAddress.houseNo && `${selectedAddress.houseNo}, `}
                {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
              </div>
              {selectedAddress.deliveryInstructions && (
                <small className="text-muted fst-italic d-block mt-1">
                  Note: {selectedAddress.deliveryInstructions}
                </small>
              )}
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD SELECTION */}
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
            <h5 className="fw-bold text-dark mb-3">3. Payment Method</h5>

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

        {/* RIGHT COLUMN: ORDER SUMMARY CARD */}
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
                      {item.size && (
                        <small className="badge bg-dark text-white me-1 px-2 py-0.5" style={{ fontSize: "11px" }}>
                          Size: {item.size}
                        </small>
                      )}
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
              <span>Items Subtotal</span>
              <span className="fw-semibold text-dark">₹{rawSubtotal}</span>
            </div>

            {appliedCoupon && (
              <div className="d-flex justify-content-between mb-2 text-success">
                <span>
                  Coupon Applied (<strong className="font-monospace">{appliedCoupon.code}</strong>)
                </span>
                <span className="fw-bold">-₹{discountAmount}</span>
              </div>
            )}

            <div className="d-flex justify-content-between mb-2 text-secondary">
              <span>Shipping Fee</span>
              <span className={`fw-semibold ${shippingCharge === 0 ? "text-success" : "text-dark"}`}>
                {shippingCharge === 0 ? "FREE" : `₹${shippingCharge}`}
              </span>
            </div>

            {totalSavings > 0 && (
              <div className="p-2 bg-success bg-opacity-10 text-success rounded-3 text-center fw-bold small my-2">
                🎉 Total Savings: ₹{totalSavings}
              </div>
            )}

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
              <span className="fw-extrabold fs-4 text-dark">₹{grandTotal}</span>
            </div>

            <button
              className="btn btn-dark w-100 py-3 rounded-pill fw-bold shadow"
              onClick={handlePayment}
              disabled={cartItems.length === 0 || !selectedAddress}
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