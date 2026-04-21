import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Product";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import AddProduct from "./pages/AddProduct";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// ✅ Admin imports
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import AdminOrders from "./admin/Orders";
import Users from "./admin/Users";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>

        {/* public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/home" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />

        {/* auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* protected flow */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />

        {/* admin old */}
        <Route path="/add-product" element={<AddProduct />} />

        {/* 🔥 NEW ADMIN DASHBOARD */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<Users />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;