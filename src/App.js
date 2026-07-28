import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ProductProvider } from "./context/ProductContext";
import { WishlistProvider } from "./context/WishlistContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Product";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import AddProduct from "./pages/AddProduct";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import OtpReset from "./pages/OtpReset";
import OrderSuccess from "./pages/OrderSuccess";

// ✅ Admin imports
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import AdminOrders from "./admin/Orders";
import Users from "./admin/Users";
import Inventory from "./admin/Inventory";
import Customizations from "./admin/Customizations";

function App() {
  return (
    <ProductProvider>
      <WishlistProvider>
        <BrowserRouter>
          <Navbar />

          {/* 🔥 GLOBAL TOAST */}
          <ToastContainer position="top-right" autoClose={2000} />

          <Routes>

            {/* public pages */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />

            <Route path="/order-success" element={<OrderSuccess />} />

            {/* 🔥 OTP FLOW */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-reset" element={<OtpReset />} />

            {/* auth pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* protected flow */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />

            {/* admin old */}
            <Route path="/add-product" element={<AddProduct />} />

            {/* 🔥 ADMIN DASHBOARD */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<Users />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="customizations" element={<Customizations />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </WishlistProvider>
    </ProductProvider>
  );
}


export default App; 