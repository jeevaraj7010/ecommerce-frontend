import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const ProductContext = createContext();

const CACHE_KEY = "products_cache";
const CACHE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async (forceRefresh = false) => {
    // Step 1: Check cache if not forcing refresh
    if (!forceRefresh) {
      try {
        const cachedStr = sessionStorage.getItem(CACHE_KEY);
        if (cachedStr) {
          const cachedData = JSON.parse(cachedStr);
          const now = Date.now();
          if (
            cachedData &&
            Array.isArray(cachedData.products) &&
            cachedData.timestamp &&
            now - cachedData.timestamp < CACHE_EXPIRY_MS
          ) {
            setProducts(cachedData.products);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error("Error reading products cache from sessionStorage:", e);
      }
    }

    // Step 2: Call backend API if cache is missing, expired, or forceRefresh requested
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

      // Store in sessionStorage
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          products: updatedProducts,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.error("Error fetching products from backend:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProducts = useCallback(() => {
    return fetchProducts(true);
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        fetchProducts,
        refreshProducts,
        setProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}
