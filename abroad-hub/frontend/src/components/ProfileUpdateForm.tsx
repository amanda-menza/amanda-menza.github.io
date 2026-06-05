"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppUser } from "../types/models";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { storeUserData } from "@/lib/utils";
import api from "../api";
import logger from "../components/Logger";

interface ProfileUpdateFormData {
  dob: string;
  major: string;
  gpa: number | undefined;
}

// Define validation schema with zod
const formSchema = z.object({
  major: z
    .string()
    .trim()
    .max(100, "Major cannot exceed 100 characters.")
    .min(1, "Major is required."), // Make major required
  gpa: z
    .string() // Accepts input as a string
    .min(1, "GPA is required.") // Make GPA required
    .transform((val) => {
      const num = parseFloat(val);
      return isNaN(num) ? NaN : Math.round(num * 100) / 100; // Auto-round to 2 decimal places
    })
    .refine((val) => !isNaN(val), {
      message: "GPA must be a number", // Error message if not a valid number
    })
    .refine((val) => val >= 0 && val <= 4, {
      message: "GPA must be between 0.00 and 4.00",
    }),
  dob: z
    .string()
    .min(1, "Date of Birth is required.") // Make dob required
    .refine(
      (value) => {
        const dob = new Date(value);
        const today = new Date();

        // Check if the date is valid
        if (isNaN(dob.getTime())) {
          return false;
        }

        // Calculate age
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age -= 1;
        }

        return age >= 10; // Must be at least 10 years old
      },
      {
        message: "You must be at least 10 years old.",
      }
    ),
});

async function getCurrentUser() {
  try {
    const res = await api.get("/api/current-user/"); // Assuming you have an endpoint like this
    return res.data;
  } catch (error) {
    logger.error("Failed to fetch user profile:", error);
    return null;
  }
}

export default function ProfileUpdateForm({ user }: { user: AppUser }) {
  const router = useRouter();

  const dob = user?.dob ?? "";
  const major = user?.profile?.major ?? "";
  const gpa: number | undefined = user?.profile?.gpa ?? undefined;
  // Use react-hook-form with zod resolver for validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dob,
      major,
      gpa: gpa ?? undefined,
    },
  });

  const handleFormSubmit = async (data: ProfileUpdateFormData) => {
    const formattedMajor = data.major
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    const profile_payload = {
      major: formattedMajor,
      gpa: data.gpa ?? 0,
    };
    const dob_update = {
      dob: data.dob.trim(),
    };
    try {
      const response1 = await api.patch("/api/user/profile/", profile_payload);
      const response2 = await api.patch("/api/update-dob/", dob_update);
      const current_user = await getCurrentUser();
      storeUserData(current_user);
      // Replace this with actual submission logic
      logger.info("Form submitted with data:", response1.data, response2.data);

      router.replace("/dashboard/profile");
    } catch (error: unknown) {
      logger.error("Error submitting form:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800">
        Profile Update Form
      </h1>
      <form
        role="form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        {/* Date of Birth */}
        <div>
          <label
            htmlFor="dob"
            className="block text-gray-700 font-semibold mb-2"
          >
            Date of Birth
          </label>
          <input
            id="dob"
            type="date"
            max="2040-12-31"
            {...register("dob")}
            className={`w-full p-3 border rounded-lg ${
              errors.dob
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors.dob && (
            <p className="text-red-500 text-sm mt-2">
              {errors.dob.message as string}
            </p>
          )}
        </div>

        {/* Major Section */}
        <div>
          <label
            htmlFor="major"
            className="block text-gray-700 font-semibold mb-2"
          >
            Major
          </label>
          <input
            id="major"
            type="text"
            {...register("major")}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.major ? "border-red-500" : ""
            }`}
          />
          {errors.major && (
            <p className="text-red-500 text-sm mt-2">
              {errors.major.message as string}
            </p>
          )}
        </div>

        {/* GPA Section */}
        <div>
          {/* GPA Section */}
          <div>
            <label
              htmlFor="gpa"
              className="block text-gray-700 font-semibold mb-2"
            >
              GPA
            </label>
            <input
              id="gpa"
              type="text" // Change type to "text" to allow any decimal input
              inputMode="decimal" // Helps mobile keyboards show decimal input
              {...register("gpa")}
              onBlur={(e) => {
                const roundedValue =
                  Math.round(parseFloat(e.target.value) * 100) / 100;
                e.target.value = isNaN(roundedValue)
                  ? ""
                  : roundedValue.toFixed(2); // Ensure it stays 2 decimals
              }}
              className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.gpa ? "border-red-500" : ""
              }`}
            />

            {errors.gpa && (
              <p className="text-red-500 text-sm mt-2">
                {errors.gpa.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-4">
          <Link href="/dashboard/profile">
            <button className="w-full m-1 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-black">
              Cancel
            </button>
          </Link>
          <button
            type="submit"
            className="w-full m-1 py-3 bg-[var(--theme-color)] text-white font-semibold rounded-lg hover:bg-[var(--theme-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-focus-ring)]"
            style={{ color: 'var(--secondary-color)' }}
          >
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
}
