import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const getToken = () => localStorage.getItem("token");
  const getRole = () => localStorage.getItem("role");

  // Fetch wishlist from backend using fresh token
  const fetchWishlist = useCallback(async () => {
    const currentToken = getToken();
    const currentRole = getRole();

    if (!currentToken || currentRole === "ROLE_ADMIN") {
      setWishlistItems([]);
      setWishlistCount(0);
      setWishlistIds(new Set());
      return;
    }

    try {
      const res = await axios.get("https://ecommerce-backend-1-tsra.onrender.com/api/wishlist", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      const products = res.data.products || [];
      const count = res.data.count || 0;
      setWishlistItems(products);
      setWishlistCount(count);
      setWishlistIds(new Set(products.map((p) => p.id)));
    } catch (err) {
      console.error("Wishlist fetch error", err);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();

    const handleAuthChange = () => {
      fetchWishlist();
    };

    window.addEventListener("authChange", handleAuthChange);
    return () => {
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, [fetchWishlist]);

  // Optimistic Toggle Wishlist
  const toggleWishlist = async (product) => {
    const token = getToken();

    if (!token) {
      toast.warning("Please login to save items to your wishlist ⚠️");
      return;
    }

    const isWishlisted = wishlistIds.has(product.id);

    // Optimistic UI Update
    setWishlistIds((prev) => {
      const updated = new Set(prev);
      if (isWishlisted) {
        updated.delete(product.id);
      } else {
        updated.add(product.id);
      }
      return updated;
    });

    setWishlistItems((prev) => {
      if (isWishlisted) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });

    setWishlistCount((prev) => (isWishlisted ? Math.max(0, prev - 1) : prev + 1));

    try {
      const res = await axios.post(
        `https://ecommerce-backend-1-tsra.onrender.com/api/wishlist/${product.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const serverCount = res.data.count;
      if (serverCount !== undefined) {
        setWishlistCount(serverCount);
      }

      if (isWishlisted) {
        toast.info(`Removed ${product.name} from Wishlist`);
      } else {
        toast.success(`Added ${product.name} to Wishlist ❤️`);
      }
    } catch (err) {
      // Rollback on failure
      fetchWishlist();
      toast.error("Failed to update wishlist on server ❌");
    }
  };

  const isWishlisted = (productId) => wishlistIds.has(productId);

  const removeFromWishlist = async (productId) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await axios.delete(
        `https://ecommerce-backend-1-tsra.onrender.com/api/wishlist/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWishlistItems((prev) => prev.filter((p) => p.id !== productId));
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      if (res.data.count !== undefined) {
        setWishlistCount(res.data.count);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
