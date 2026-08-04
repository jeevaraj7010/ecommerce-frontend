import axios from "axios";
import { toast } from "react-toastify";

const API = axios.create({
  baseURL: "https://ecommerce-backend-1-tsra.onrender.com",
});

let isSessionExpiredToastShown = false;

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🌐 Handle Network Connection Failure
    if (!error.response || error.code === "ERR_NETWORK") {
      toast.error("⚠ Unable to connect. Please check your internet connection.", {
        toastId: "network-error-toast",
      });
      return Promise.reject(error);
    }

    const status = error.response.status;

    // 🔒 Handle Expired Session (401 Unauthorized / 403 Forbidden)
    if (status === 401 || status === 403) {
      const token = localStorage.getItem("token");

      if (token) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        sessionStorage.removeItem("hoodify_applied_coupon");

        window.dispatchEvent(new Event("authChange"));

        if (!isSessionExpiredToastShown) {
          isSessionExpiredToastShown = true;
          toast.error("🔒 Your session has expired. Please login again.", {
            toastId: "session-expired-toast",
          });
          setTimeout(() => {
            isSessionExpiredToastShown = false;
          }, 3000);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default API;