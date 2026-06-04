"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "../../../../api";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import logger from "../../../../components/Logger";

// Define the schema using Zod
const passwordSchema = z
  .object({
    oldPassword: z.string().trim(),
    newPassword: z
      .string()
      .trim()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .trim()
      .min(6, "Confirmation password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation must match",
    path: ["confirmPassword"],
  });

interface ChangePasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null); // State for storing error message
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(passwordSchema), // Apply the Zod validation schema
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      const response = await api.post("/api/change-password/", {
        old_password: data.oldPassword,
        new_password: data.newPassword,
      });
      if (response.status === 200) {
        alert("Password updated successfully!");
        // Optionally, you can redirect the user or log them out
        setServerError(null); // Reset the error if the password update is successful
        router.replace("/partner/profile");
      }
    } catch (error) {
      logger.error("Error updating password:", error);
      if (error instanceof AxiosError) {
        // Check if the error response contains a message
        if (error.response && error.response.data) {
          // Extract error message correctly
          const errorMessage = Array.isArray(error.response.data)
            ? error.response.data[0] // Extract the first error message if it's an array
            : typeof error.response.data === "object"
            ? error.response.data.errorMessage || "Error updating password" // Handle object response
            : error.response.data; // Handle string error messages

          setServerError(errorMessage); // Ensure it's a string
        } else {
          setServerError("An unknown error occurred");
        }
      } else {
        setServerError("An unknown error occurred");
      }
    }
    logger.info("Form Submitted:", data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-4">
          Change Password
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="oldPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Old Password
            </label>
            <input
              type="password"
              id="oldPassword"
              {...register("oldPassword")}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.oldPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.oldPassword.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              {...register("newPassword")}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...register("confirmPassword")}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Display the server error */}
          {serverError && (
            <p className="text-red-500 text-xs mt-1">{serverError}</p>
          )}

          <div>
            <button
              type="submit"
              className="w-full mt-4 bg-[var(--theme-color)] text-gray-600 py-2 px-4 rounded-md hover:bg-[var(--theme-color)]"
              style={{ color: 'var(--secondary-color)' }}>
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
