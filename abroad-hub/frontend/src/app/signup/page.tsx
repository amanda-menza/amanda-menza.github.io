"use client";

import { useForm } from "react-hook-form";
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
import { isBefore, subYears } from "date-fns";
import { useState } from "react";
import { AxiosError } from "axios"; // Import AxiosError
import logger from "../../components/Logger";
import { AppUser } from "@/types/models.js";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { storeUserData } from "@/lib/utils.js";

interface SignUpFormData {
  display_name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  dob: string;
}

export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    getValues,
  } = useForm<SignUpFormData>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newAppUser, setNewAppUser] = useState<AppUser | null>(null);
  const [showUlinkModal, setShowUlinkModal] = useState(false);
  const [password, setPassword] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // Validation function to check if the user is at least 10 years old
  const validateDob = (dob: string) => {
    const tenYearsAgo = subYears(new Date(), 10);
    return (
      isBefore(new Date(dob), tenYearsAgo) ||
      "You must be at least 10 years old"
    );
  };

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    localStorage.clear();

    const requestBody = {
      user: {
        username: data.username.trim(),
        password: data.password.trim(),
        email: data.email.trim(),
      },
      display_name: data.display_name.trim(),
      dob: data.dob,
    };
    setPassword(data.password.trim());
    setUsername(data.username.trim());

    logger.info(
      "Making request to:",
      api.defaults.baseURL + "/api/user/register/"
    );
    try {
      const res = await api.post("/api/user/register/", requestBody);
      setNewAppUser(res.data);
      setShowUlinkModal(true);
    } catch (error: unknown) {
      logger.error("error caught:", error);
      if (
        error instanceof AxiosError &&
        error.response &&
        error.response.data
      ) {
        logger.error("errorData");
        const errorData = error.response.data;

        // Check if the response contains username-related errors
        if (errorData.user?.username) {
          logger.error("errorData.user.username");
          const usernameError = errorData.user.username[0]; // Assuming the first message is the one you want to show
          setError("username", {
            type: "manual",
            message: usernameError, // Display the error message from the backend
          });
        } else {
          alert("An unexpected error occurred");
        }
      } else {
        alert("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }

    logger.info("Sign-up attempt with:", requestBody);
  };
  const handleUlinkChoice = async (choice: "yes" | "no") => {
    setShowUlinkModal(false);
    if (choice === "yes") {
      try {
        const res = await api.post("/api/token/", { username, password });
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

        router.replace(`/ulink-connect/`);
      } catch (error: unknown) {
        logger.error(error);
      }
    } else {
      router.replace("/sso/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </CardTitle>
          <CardDescription className="text-center mt-2 text-sm text-gray-600">
            Join Abroadhub and start your journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="display_name">Full Name</Label>
              <Input
                id="display_name"
                type="text"
                {...register("display_name", {
                  required: "Full Name is required",
                  maxLength: {
                    value: 50,
                    message: "Full Name cannot exceed 50 characters",
                  },
                })}
                className="mt-1"
              />
              {errors.display_name && (
                <p className="text-red-600 text-sm">
                  {errors.display_name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { required: "Email is required" })}
                className="mt-1"
              />
              {errors.email && (
                <p className="text-red-600 text-sm">{errors.email.message}</p>
              )}
            </div>
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long",
                  },
                })}
                className="mt-1"
              />
              {errors.password && (
                <p className="text-red-600 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === getValues("password") || "Passwords do not match",
                })}
                className="mt-1"
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                max="2040-12-31"
                {...register("dob", {
                  required: "Date of Birth is required",
                  validate: validateDob,
                })}
                className="mt-1"
              />
              {errors.dob && (
                <p className="text-red-600 text-sm">{errors.dob.message}</p>
              )}
            </div>
            <div>
              <Button type="submit" className="w-full bg-[var(--theme-color)] text-gray-600 py-2 px-4 rounded-md hover:bg-[var(--theme-color)]" disabled={loading} style={{ color: 'var(--secondary-color)' }}>
                {loading ? "Loading..." : "Sign up"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-gray-600">
            Already have SSO or an account?{" "}
            <Link
              href="/sso/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
      <AlertDialog open={showUlinkModal} onOpenChange={setShowUlinkModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Link your Ulink account?</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to link your Ulink account now? This step is
              mandatory to apply to programs with course prerequisites. You can
              skip it and do it anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleUlinkChoice("no")}>
              No, continue
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleUlinkChoice("yes")}>
              Yes, link now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
