"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import logger from "./Logger";
import { LoadingSpinner } from "./LoadingSpinner";

// Define types for Props
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Refresh the authentication token
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      if (!refreshToken) throw new Error("No refresh token found");

      const response = await api.post("/api/token/refresh/", {
        refresh: refreshToken,
      });

      if (response.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, response.data.access);
        if (response.data.refresh) {
          localStorage.setItem(REFRESH_TOKEN, response.data.refresh); // Update refresh token if provided
        }
        setIsAuthorized(true);
      } else {
        throw new Error("Refresh failed");
      }
    } catch (error) {
      logger.error("Error refreshing token:", error);
    }
  };

  // Authenticate and check token status
  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setIsAuthorized(false);
      return;
    }

    try {
      const decoded: { exp: number } = jwtDecode(token);
      const tokenExpiration = decoded.exp * 1000; // Convert to milliseconds
      const now = Date.now();

      // Refresh token if expired
      if (tokenExpiration < now) {
        await refreshToken();
      } else {
        setIsAuthorized(true);
      }
    } catch (error) {
      logger.error("Error decoding token:", error);
    }
  };

  useEffect(() => {
    auth(); // Perform authentication check on mount
  }, []);

  if (isAuthorized === null) {
    return <LoadingSpinner message={"Loading"} />;
  }

  return isAuthorized ? (
    <>{children}</>
  ) : (
    <div>You do not have access to this page</div>
  );
}
