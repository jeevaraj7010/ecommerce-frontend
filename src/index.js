import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CartProvider } from "./pages/CartContext";
import "bootstrap/dist/css/bootstrap.min.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <CartProvider>
    <App />
  </CartProvider>
);