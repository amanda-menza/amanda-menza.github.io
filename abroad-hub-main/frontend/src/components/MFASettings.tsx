import React, { useState } from "react";
import api from "../api";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppUser } from "@/types/models";
import { useRouter } from "next/navigation";
import { storeUserData, fetchCurrentUser } from "../lib/utils";

const MFASettings: React.FC<{ user: AppUser; route: string }> = ({
  user,
  route,
}) => {
  const [enableMFA, setEnableMFA] = useState<boolean>(user.use_mfa);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUpdateLoading(true);

    try {
      const response = await api.post<{ detail: string }>(
        "/api/mfa-settings/",
        {
          enable_mfa: enableMFA,
        }
      );

      if (response.data.detail) {
        setSuccess(response.data.detail);
      }
      const current_user = await fetchCurrentUser();
      storeUserData(current_user);
      router.replace(route);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update MFA settings.");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (user.is_sso) {
    return (
      <Card className="max-w-md mx-auto mt-6">
        <CardHeader>
          <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            MFA settings are not available for SSO users. You are already
            protected by your identity provider's authentication.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-6">
      <CardHeader>
        <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium">
              Enable Google Authenticator Verification
            </label>
            <Switch checked={enableMFA} onCheckedChange={setEnableMFA} />
          </div>
          <p className="text-sm text-gray-500 mb-4">
            When enabled, you'll see a QR code, upon login, to register your
            username with Google Authenticator and must enter the numeric pass
            code shown by the app on each login.
          </p>
          <Button type="submit" disabled={updateLoading} className="mt-4 w-full bg-[var(--theme-color)] text-gray-600 hover:bg-[var(--theme-color)]"    
          style={{ color: 'var(--secondary-color)' }}      
          >
            {updateLoading ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MFASettings;
