import axios from "axios";
import {
  ACCESS_TOKEN,
  ID_TOKEN,
  REFRESH_TOKEN,
  LAST_ACTIVITY_TIMESTAMP,
} from "./constants";
import logger from "./components/Logger";
import { AuthManager } from "./components/AuthManager";

const isDevelopment = process.env.NODE_ENV === "development";
const baseURL = isDevelopment
  ? "http://localhost:8000"
  : process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Activity and Authentication Management

// Token refresh function
const refreshTokens = async () => {
  try {
    // Check user activity before attempting to refresh
    if (!AuthManager.isUserActive()) {
      throw new Error("User inactive");
    }

    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const refreshApi = axios.create({
      baseURL,
      withCredentials: true,
    });

    const response = await refreshApi.post("/api/token/refresh/", {
      refresh: refreshToken,
    });

    // Update tokens in localStorage
    localStorage.setItem(ACCESS_TOKEN, response.data.access);

    // Update refresh token if provided
    if (response.data.refresh) {
      localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
      // Store the timestamp when refresh token was issued
      localStorage.setItem("refreshTokenTimestamp", Date.now().toString());
    }

    if (response.data.id_token) {
      localStorage.setItem(ID_TOKEN, response.data.id_token);
    }

    return response.data;
  } catch (error) {
    // Clear tokens if refresh fails
    AuthManager.logout();
    throw error;
  }
};

// Track user activity on network requests
const trackActivity = (config) => {
  AuthManager.updateActivity();
  return config;
};

// Request interceptor - Add tokens and track activity
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    const id_token = localStorage.getItem(ID_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (id_token) {
      config.headers["X-ID-Token"] = id_token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (AuthManager.isUserActive()) {
      // Only update activity for successful responses
      AuthManager.updateActivity();
      logger.debug("update activity");
      return response;
    } else {
      AuthManager.showAlertOnce(
        "tokenInvalid",
        "Session expired. Please log in again.",
        true
      );
    }
    return Promise.reject(new Error("Session expired due to inactivity"));
  },
  async (error) => {
    const originalRequest = error.config;

    // Early return if no response (network error)
    if (!error.response) {
      logger.debug(error);

      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const isLoginRequest = originalRequest.url.includes("/api/token");

    // Prevent retry on login requests
    if (isLoginRequest) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized or invalid token errors
    if (status === 403 && data?.code === "token_not_valid") {
      // Prevent multiple retry attempts
      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      try {
        // Mark request as retried
        originalRequest._retry = true;
        logger.debug("trying refresh token");

        // // Show session expiring alert
        // AuthManager.showAlertOnce(
        //   "sessionExpiring",
        //   "Your session has expired. Attempting to restore it...",
        //   false
        // );

        // Attempt to refresh tokens
        await refreshTokens();

        // Update headers with new tokens
        const token = localStorage.getItem(ACCESS_TOKEN);
        const id_token = localStorage.getItem(ID_TOKEN);

        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }

        if (id_token) {
          originalRequest.headers["X-ID-Token"] = id_token;
        }
        logger.debug("refresh token accepted");

        // Retry original request
        return await api(originalRequest);
      } catch (refreshError) {
        // Logout on refresh failure
        AuthManager.showAlertOnce(
          "tokenInvalid",
          "Session expired please log in again.",
          true
        );

        return Promise.reject(refreshError);
      }
    }

    // For all other errors, reject
    return Promise.reject(error);
  }
);

export default api;
