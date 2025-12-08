import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const getBackendURL = () => {
  const backendURL = Constants.manifest?.extra?.apiUrl;
  if (!backendURL) {
    console.warn("No backend URL defined. Using localhost for development.");
    return "http://127.0.0.1:8000";
  }
  console.log("Backend URL:", backendURL);
  return backendURL;
};

const api = axios.create({
  baseURL: getBackendURL(),
  timeout: 100000,
});

// Add request interceptor
api.interceptors.request.use(async (config) => {
  const userId = await AsyncStorage.getItem("user_id");
  if (userId) {
    config.headers["X-User-Id"] = userId;
  }
  return config;
});

export default api;
