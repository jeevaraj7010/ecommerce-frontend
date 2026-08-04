import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ProductProvider } from "./context/ProductContext";
import { WishlistProvider } from "./context/WishlistContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

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

// Admin imports
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import AdminOrders from "./admin/Orders";
import Users from "./admin/Users";
import Inventory from "./admin/Inventory";
import Customizations from "./admin/Customizations";
import Coupons from "./admin/Coupons";

function App() {
  return (
    <ProductProvider>
      <WishlistProvider>
        <BrowserRouter>
          <Navbar />

          {/* GLOBAL TOAST */}
          <ToastContainer position="top-right" autoClose={2000} />

          <Routes>

            {/* PUBLIC SHOPPING PAGES */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order-success" element={<OrderSuccess />} />

            {/* PUBLIC AUTHENTICATION PAGES (Redirects logged-in users to /home) */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/otp-reset" element={<OtpReset />} />
            </Route>

            {/* PROTECTED AUTHENTICATED PAGES (Requires valid token) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
            </Route>

            {/* ADMIN DASHBOARD */}
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<Users />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="customizations" element={<Customizations />} />
              <Route path="coupons" element={<Coupons />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </WishlistProvider>
    </ProductProvider>
  );
}

export default App;