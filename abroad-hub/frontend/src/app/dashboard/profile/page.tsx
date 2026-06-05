"use client";
import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { useRouter } from "next/navigation";
import { AppUser } from "../../../types/models";
import { getStoredUserData } from "../../../lib/utils";
import logger from "../../../components/Logger";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import TranscriptViewer from "@/components/transcript-viewer";

const ProfilePage = () => {
  const [appUser, setAppUser] = useState<AppUser>();
  const router = useRouter();
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const triggerReload = () => {
    setReloadTrigger((prev) => prev + 1); // triggers refetch
  };

  const fetchUserData = async () => {
    try {
      const userData = await getStoredUserData();
      setAppUser(userData);
    } catch (error) {
      logger.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    // Fetch user data when the component loads
    fetchUserData();
  }, [reloadTrigger]); // Empty dependency array ensures it runs only on component mount

  if (!appUser) {
    return <LoadingSpinner message={"Loading"} />; // Optionally, show a loading state
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <Avatar>
            <AvatarFallback className="bg-white">
              {appUser?.display_name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold">{appUser.display_name}</h2>
          <p className="text-gray-500">{appUser.username}</p>
          <p className="text-gray-500">{appUser.email}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
          <div className="space-y-4">
            <div>
              <strong>Date of Birth:</strong> {appUser.dob}
            </div>
            <div>
              <strong>Major:</strong> {appUser.profile?.major}
            </div>
            <div>
              <strong>GPA:</strong> {appUser.profile?.gpa}
            </div>
          </div>
          <Button
            onClick={() => router.push("/dashboard/profile/edit")}
            className="w-full mt-4 bg-[var(--theme-color)] text-gray-600 py-2 px-4 rounded-md hover:bg-[var(--theme-color)]"
            style={{ color: "var(--secondary-color)" }}
          >
            Edit Profile
          </Button>
          {!appUser.ulink_username ? (
            <Button
              onClick={() => router.push("/dashboard/profile/ulink-connect")}
              className="w-full mt-4 bg-[var(--theme-color)] text-gray-600 py-2 px-4 rounded-md hover:bg-[var(--theme-color)]"
              style={{ color: "var(--secondary-color)" }}
            >
              Connect Ulink
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="mt-4 w-full bg-gray-200 text-black hover:bg-gray-200"
            >
              Ulink Connected: {appUser.ulink_username}
            </Button>
          )}
          {!appUser.is_sso && (
            <>
              <Button
                onClick={() =>
                  router.push("/dashboard/profile/change-password")
                }
                className="w-full mt-4 bg-[var(--theme-color)] text-gray-600 py-2 px-4 rounded-md hover:bg-[var(--theme-color)]"
                style={{ color: "var(--secondary-color)" }}
              >
                Change Password
              </Button>
              <Button
                onClick={() => router.push("/dashboard/profile/mfa-settings")}
                className="w-full mt-4 bg-[var(--theme-color)] text-gray-600 py-2 px-4 rounded-md hover:bg-[var(--theme-color)]"
                style={{ color: "var(--secondary-color)" }}
              >
                {" "}
                MFA Settings
              </Button>
            </>
          )}
        </div>

        {/* Transcript section using the V0 component */}
        <div className="w-full">
          <TranscriptViewer
            ulink_username={appUser.ulink_username}
            onRequestReload={triggerReload}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
