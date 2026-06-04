"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import api from "../../../api.js";
import logger from "../../../components/Logger";

export default function LoginPage() {
  const router = useRouter();

  const ssoRedirect = async () => {
    try {
      const response = await api.get("/api/sso-auth-redirect/");
      window.location.href = response.data.request_url;
    } catch (error) {
      logger.error("Error redirecting to SSO: ", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-extrabold text-gray-900">
            Log in to Abroahub
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
              Continue with SSO
            </Button>
          </div>
          {/* Another Horizontal Line */}
          <div className="relative flex py-3 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-gray-600">
            Don't have SSO?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Log in
            </Link>{" "}
            with a traditional account or{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign up
            </Link>
            !
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
