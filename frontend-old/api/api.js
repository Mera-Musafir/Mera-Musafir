import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Use the backend URL directly
const BACKEND_URL = "https://backend-production-b554.up.railway.app";

// const getBackendURL = () => {
//   // Use localhost in development
//   if (typeof window !== "undefined" && window.location.hostname === "localhost") {
//     return "http://127.0.0.1:8000";
//   }
//   // Production always uses HTTPS backend
//   return BACKEND_URL;
// };

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 100000,
});

api.interceptors.request.use(async (config) => {
  try {
    const userId = await AsyncStorage.getItem("user_id");
    if (userId) {
      config.headers["X-User-Id"] = userId;
    }
  } catch (err) {
    console.error("Error fetching user_id from AsyncStorage:", err);
  }
  return config;
});

export default api;
