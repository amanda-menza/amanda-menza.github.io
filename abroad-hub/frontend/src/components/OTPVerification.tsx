import React, { useState, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import axios from "axios";
import { LoadingSpinner } from "./LoadingSpinner";

interface OTPVerificationProps {
  onVerificationSuccess: (data: any) => void;
  otpUrl: string; // Add a new prop for the OTP URL (QR code URL)
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  onVerificationSuccess,
  otpUrl,
}) => {
  const [otpCode, setOtpCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    setLoading(true);
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/verify-otp/",
        {
          otp_code: otpCode,
        },
        {
          withCredentials: true, // This ensures session cookies are sent automatically
        }
      );

      if (response.data.access) {
        onVerificationSuccess(response);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Verification failed. Please try again."
      );
    }
  };

  if (loading) {
    return <LoadingSpinner message={"Verifying"} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-extrabold text-gray-900">
            Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-center mt-2 text-sm text-gray-600">
            Please open your authenticator app (e.g., Google Authenticator) and
            scan the QR code or enter the code manually.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Display QR Code */}
          {otpUrl && (
            <div className="text-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                  otpUrl
                )}&size=200x200`}
                alt="Scan this QR code with Google Authenticator"
                className="mx-auto"
              />
            </div>
          )}

          {/* Error message alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <p>{error}</p>
            </Alert>
          )}

          {/* OTP form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp-code">Verification Code</Label>
              <Input
                id="otp-code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                className="mt-1"
              />
            </div>

            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPVerification;
