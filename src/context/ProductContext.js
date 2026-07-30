import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const ProductContext = createContext();

const CACHE_KEY = "products_cache";

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invalidate cache helper
  const clearProductCache = useCallback(() => {
    sessionStorage.removeItem(CACHE_KEY);
    setProducts([]);
  }, []);

  const fetchProducts = useCallback(async (forceRefresh = false) => {
    // Step 1: Check sessionStorage cache if not forcing refresh
    if (!forceRefresh) {
      try {
        const cachedStr = sessionStorage.getItem(CACHE_KEY);
        if (cachedStr) {
          const cachedData = JSON.parse(cachedStr);
          if (cachedData && Array.isArray(cachedData.products) && cachedData.products.length > 0) {
            setProducts(cachedData.products);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error("Error reading products_cache from sessionStorage:", e);
      }
    }

    // Step 2: Fetch products from backend when cache missing or forceRefresh requested
    setLoading(true);
    try {
      const [productRes, ratingRes] = await Promise.all([
        axios.get("https://ecommerce-backend-1-tsra.onrender.com/api/products"),
        axios.get("https://ecommerce-backend-1-tsra.onrender.com/api/reviews/average/all").catch(() => ({ data: {} })),
      ]);

      const rawProducts = Array.isArray(productRes.data)
        ? productRes.data
        : productRes.data.content || [];
      const ratingsMap = ratingRes.data || {};

      const updatedProducts = rawProducts.map((p) => ({
        ...p,
        rating: ratingsMap[p.id] || p.rating || 0,
      }));

      setProducts(updatedProducts);

      // Save to sessionStorage ONLY if request succeeded and returned valid data
      if (productRes.status === 200 && Array.isArray(updatedProducts)) {
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            products: updatedProducts,
            updatedAt: Date.now(),
          })
        );
      }
    } catch (err) {
      console.error("Error fetching products from backend - cache withheld:", err);
      // DO NOT cache failed API responses
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProducts = useCallback(() => {
    return fetchProducts(true);
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();

    const handleAuthChange = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        // Clear cache on logout
        clearProductCache();
      }
    };

    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, [fetchProducts, clearProductCache]);

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        fetchProducts,
        refreshProducts,
        clearProductCache,
        setProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}
