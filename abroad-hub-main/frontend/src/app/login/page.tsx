"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants.js";
import api from "../../api.js";
import { AxiosError, AxiosResponse } from "axios";
import logger from "../../components/Logger";
import OTPVerification from "@/components/OTPVerification";
import { fetchCurrentUser } from "@/lib/utils";
import { UserRoles } from "@/types/models";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [otpUrl, setOtpUrl] = useState<string>("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [loading, setLoading] = useState(false);

  const onLoginSuccess = async (res: AxiosResponse<any, any>) => {
    setLoading(true);
    // Save the tokens to localStorage
    localStorage.setItem(ACCESS_TOKEN, res.data.access);
    localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

    // Set loading state while determining user role

    try {
      // Make an API call to determine if the user is an admin or a student
      const userResponse = await fetchCurrentUser(); // This endpoint should return the user's role
      logger.debug("user response: ", userResponse);
      // Assume the response contains a "role" property, e.g., "admin" or "student"
      const userRole = userResponse.roles;
      logger.debug(userRole);
      const rolesToCheck = [
        UserRoles.Administrator,
        UserRoles.Faculty,
        UserRoles.Reviewer,
      ];
      if (rolesToCheck.some((role) => userRole.includes(role))) {
        // Redirect to the admin dashboard
        router.replace("/administrator/dashboard");
      } else if (userRole.includes("Student")) {
        // Redirect to the student dashboard
        router.replace("/dashboard");
      } else if (userRole.includes("Partner")) {
        // Redirect to the student dashboard
        router.replace("/partner");
      } else {
        // Handle unknown roles or errors
        logger.error("Unknown role:", userRole);
        router.replace("/");
      }
    } catch (error) {
      logger.error("Error fetching user role:", error);
      router.replace("/"); // Redirect to an error page in case of failure
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    logger.info("Login attempt with:", { username, password });
    try {
      const res = await api.post("/api/token/", { username, password });
      if (res.data.mfa_required) {
        setMfaRequired(true);
        setOtpUrl(res.data.otp_url);
      } else {
        onLoginSuccess(res);
      }
    } catch (error: unknown) {
      logger.error(error);
      if (error instanceof AxiosError) {
        if (error.response && error.response.status === 401) {
          setErrorMessage("Username and Password Combination Incorrect");
        }
      }
    }
  };

  const ssoRedirect = async () => {
    try {
      const response = await api.get("/api/sso-auth-redirect/");
      window.location.href = response.data.request_url;
    } catch (error) {
      logger.error("Error redirecting to SSO: ", error);
    }
  };
  // Conditional render for OTP verification when MFA is required
  if (mfaRequired) {
    return (
      <OTPVerification onVerificationSuccess={onLoginSuccess} otpUrl={otpUrl} />
    );
  }
  if (loading) {
    return <LoadingSpinner message={"Loading"} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-extrabold text-gray-900">
            Log in to Abroadhub
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* SSO Button */}
          <div>
            <Button
              className="w-full bg-[var(--theme-color)] text-gray-600 py-2 px-4 rounded-md hover:bg-[var(--theme-color)]"
              style={{ color: 'var(--secondary-color)' }}
              onClick={(e) => {
                localStorage.clear();
                ssoRedirect();
              }}
            >
              Log In with SSO
            </Button>
          </div>
          {/* OR Separator */}
          <div className="relative flex py-3 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="username"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            {errorMessage && (
              <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
            )}
            <div>
              <Button type="submit" className="w-full bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-700">
                Log in
              </Button>
            </div>
          </form>
        </CardContent>
        {/* Another Horizontal Line */}
        <div className="relative flex py-3 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <CardFooter className="text-center">
          <p className="text-sm text-gray-600">
            Don't have SSO or an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
