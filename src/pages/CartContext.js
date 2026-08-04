import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("hoodify_cart");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("hoodify_cart", JSON.stringify(cartItems));
    } catch (e) {
      console.error("Cart localStorage error", e);
    }
  }, [cartItems]);

  // ✅ Add to cart (matches product.id, size, variantId, AND customImageUrl)
  const addToCart = (product, quantityToAdd = 1) => {
    const qty = quantityToAdd > 0 ? quantityToAdd : 1;
    setCartItems((prev) => {
      const existIndex = prev.findIndex(
        (item) =>
          item.id === product.id &&
          (item.variantId || null) === (product.variantId || null) &&
          (item.size || "") === (product.size || "") &&
          (item.customImageUrl || "") === (product.customImageUrl || "")
      );

      if (existIndex > -1) {
        return prev.map((item, index) =>
          index === existIndex
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: qty }];
      }
    });
  };

  // ➕ Increase
  const increaseQty = (indexOrId) => {
    setCartItems((prev) =>
      prev.map((item, idx) =>
        idx === indexOrId || item.id === indexOrId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // ➖ Decrease
  const decreaseQty = (indexOrId) => {
    setCartItems((prev) =>
      prev.map((item, idx) =>
        (idx === indexOrId || item.id === indexOrId) && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  // ❌ Remove
  const removeFromCart = (indexOrId) => {
    setCartItems((prev) =>
      prev.filter((item, idx) => idx !== indexOrId && item.id !== indexOrId)
    );
  };

  // 💰 Total
  const getTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // 🔥 Clear cart
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("hoodify_cart");
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        getTotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};