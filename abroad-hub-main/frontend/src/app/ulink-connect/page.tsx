"use client";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import logger from "@/components/Logger";
import api from "@/api";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUserData } from "@/lib/utils";
import { AppUser } from "@/types/models";

interface FormData {
  username: string;
  pin: string;
}

export default function UlinkConnect() {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    logger.debug("Submitting form:", data);

    // Trim the username and pin once to avoid repetition
    const ulink_username = data.username.trim();
    const pin = data.pin.trim();

    const requestBody = {
      ulink_username: ulink_username,
      pin: pin,
    };

    try {
      // Verify Ulink account with the first API request
      const res = await api.post("/api/verify-ulink-account/", requestBody);

      if (res.data.success) {
        // Connect Ulink account with the second API request
        const response = await api.post(
          "/api/connect-ulink-account/",
          requestBody
        );
        if (response.status === 200) {
          logger.debug("Ulink connection successful");
          localStorage.clear();
          router.replace("/sso/login");
        } else {
          setErrorMessage(response.data.error || "Unknown error");
        }
      } else {
        setErrorMessage(res.data.message || "Ulink verification failed");
      }
    } catch (error: unknown) {
      logger.error(error);

      // Handle different types of errors
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const responseData = error.response?.data;
        const errorMsg = responseData?.error || responseData?.message || "";
        
        logger.debug(`Error status: ${status}, message: ${errorMsg || error.message}`);
        
        // Check if this is a connection issue rather than just wrong credentials
        const isConnectionIssue = error.message.includes("ENOTFOUND") || 
                                error.message.includes("ECONNREFUSED") ||
                                error.message.includes("Failed to resolve") ||
                                error.message.includes("Max retries exceeded") ||
                                error.message.includes("Network Error");

        if (status === 401 && isConnectionIssue) {
          setErrorMessage("Unable to connect to Ulink system. Please contact an administrator for assistance.");
        } else if (status === 401) {
          setErrorMessage("Username and Pin combination incorrect.");
        } else if (status === 400) {
          setErrorMessage(errorMsg || "Bad request.");
        } else if (status === 404) {
          setErrorMessage("Not found.");
        } else if (status === 500) {
          // Handle server errors
          setErrorMessage(errorMsg || "An internal server error occurred. Please contact an administrator for assistance.");
        } else if (status === 503) {
          // Handle service unavailable errors
          setErrorMessage(errorMsg || "Ulink service is currently unavailable. Please try again later or contact an administrator.");
        } else {
          // Handle any other HTTP error status
          setErrorMessage(errorMsg || `Error connecting to Ulink (${status}). Please contact an administrator for assistance.`);
        }
      } else {
        // Handle non-Axios errors
        setErrorMessage("An unexpected error occurred. Please contact an administrator for assistance.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-extrabold text-gray-900">
            Enter your Ulink Credentials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                {...register("username", { required: "Username is required" })}
                className="mt-1"
              />
              {errors.username && (
                <p className="text-red-600 text-sm">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="pin">4-Digit Pin</Label>
              <Input
                id="pin"
                type="text"
                {...register("pin", {
                  required: "Pin is required",
                  pattern: {
                    value: /^\d{4}$/,
                    message: "Pin must be exactly 4 digits",
                  },
                })}
                className="mt-1"
              />
              {errors.pin && (
                <p className="text-red-600 text-sm">{errors.pin.message}</p>
              )}
            </div>
            {errorMessage && (
              <div className="text-red-500 border border-red-300 rounded p-3 bg-red-50 text-sm mt-2">
                <p>{errorMessage}</p>

              </div>
            )}
            <div>
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
