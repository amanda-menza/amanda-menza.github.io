"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { ACCESS_TOKEN, ID_TOKEN } from "../../../constants.js";
import api from "../../../api.js";
import logger from "../../../components/Logger";
import { fetchCurrentUser } from "@/lib/utils";
import { UserRoles } from "@/types/models";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function LogoutPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  const getToken = async (code: string): Promise<void> => {
    try {
      logger.info(`Attempting to get token with code: ${code.substring(0, 5)}...`);
      
      const response = await api.get(`/api/sso-token-redirect/${code}/`);
      logger.info("Token response received");
      
      if (!response.data) {
        logger.error("Empty response data");
        setError("Invalid response from authentication server");
        setErrorDetails("The server returned an empty response.");
        setLoading(false);
        return;
      }
      
      // Check for error response
      if (response.data.error) {
        logger.error(`Server returned error: ${response.data.error}`);
        setError("Authentication server error");
        setErrorDetails(response.data.error);
        setLoading(false);
        return;
      }
      
      // Validate tokens
      if (!response.data.access_token) {
        logger.error("Missing access_token in response");
        setError("Invalid authentication response");
        setErrorDetails("The authentication response is missing required data (access_token).");
        setLoading(false);
        return;
      }
      
      if (!response.data.id_token) {
        logger.error("Missing id_token in response");
        setError("Invalid authentication response");
        setErrorDetails("The authentication response is missing required data (id_token).");
        setLoading(false);
        return;
      }
      
      // Store tokens
      logger.info("Storing tokens in localStorage");
      localStorage.setItem(ACCESS_TOKEN, response.data.access_token);
      localStorage.setItem(ID_TOKEN, response.data.id_token);
      
      try {
        // Get user info
        logger.info("Fetching user information");
        const userResponse = await fetchCurrentUser();
        logger.info(`User data retrieved with roles: ${userResponse.roles.join(', ')}`);
        
        const userRole = userResponse.roles;
        const rolesToCheck = [
          UserRoles.Administrator,
          UserRoles.Faculty,
          UserRoles.Reviewer,
        ];
        
        // Redirect based on role
        if (rolesToCheck.some((role) => userRole.includes(role))) {
          logger.info("Redirecting to admin dashboard");
          router.replace("/administrator/dashboard");
        } else if (userRole.includes("Student")) {
          logger.info("Redirecting to student dashboard");
          router.replace("/dashboard");
        } else {
          logger.error(`Unknown role(s): ${userRole.join(', ')}`);
          setError("Account role not recognized");
          setErrorDetails(`User roles (${userRole.join(', ')}) are not recognized for navigation.`);
          setLoading(false);
        }
      } catch (error: any) {
        logger.error("Error fetching user details:", error);
        setError("Failed to get user information");
        setErrorDetails(error?.message || "An unknown error occurred while retrieving user information.");
        setLoading(false);
      }
    } catch (error: any) {
      logger.error("Error in SSO authentication:", error);
      
      // Extract detailed error information
      let errorMsg = "Authentication failed";
      let details = "An unknown error occurred during authentication.";
      
      if (error?.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        logger.error(`Server returned status ${error.response.status}`);
        logger.error("Response data:", error.response.data);
        
        errorMsg = `Authentication failed (${error.response.status})`;
        
        if (error.response.data?.error) {
          details = `Server error: ${error.response.data.error}`;
        } else if (error.response.data) {
          details = `Server response: ${JSON.stringify(error.response.data)}`;
        } else {
          details = `Server returned status ${error.response.status} without details`;
        }
      } else if (error?.request) {
        // The request was made but no response was received
        logger.error("No response received from server");
        errorMsg = "Authentication server unavailable";
        details = "No response was received from the authentication server. Please try again later.";
      } else {
        // Something happened in setting up the request that triggered an Error
        logger.error("Error message:", error.message);
        details = error.message || details;
      }
      
      setError(errorMsg);
      setErrorDetails(details);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Parse the URL for the 'code' parameter
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      getToken(code);
    } else {
      logger.error("No code parameter found in URL");
      setError("Missing authentication code");
      setErrorDetails("The authentication code is missing from the URL. Please try logging in again.");
      setLoading(false);
    }
  }, []);

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[300px] max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-red-600 mb-4">{error}</h2>
        
        {errorDetails && (
          <>
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-500 mb-4 hover:underline"
            >
              {showDetails ? "Hide details" : "Show details"}
            </button>
            
            {showDetails && (
              <div className="bg-gray-100 p-4 rounded-md mb-4 w-full text-sm text-gray-700 whitespace-pre-wrap">
                {errorDetails}
              </div>
            )}
          </>
        )}
        
        <Button
          onClick={() => router.push("/sso/login")}
          className="mt-4 w-full max-w-xs bg-blue-600 text-white hover:bg-blue-700"
        >
          Back to Login
        </Button>
        
        <Button
          onClick={() => router.push("/")}
          className="mt-2 w-full max-w-xs bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Return Home
        </Button>
      </div>
    );
  }

  return <LoadingSpinner message={"Logging in..."} />;
}
