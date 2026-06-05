"use client";
import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { useRouter } from "next/navigation";
import { AppUser } from "../../../types/models";
import { getStoredUserData } from "../../../lib/utils";
import logger from "../../../components/Logger";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const ProfilePage = () => {
  const [appUser, setAppUser] = useState<AppUser>();
  const router = useRouter();

  useEffect(() => {
    // Fetch user data when the component loads
    const fetchUserData = async () => {
      try {
        const userData = await getStoredUserData(); // Ensure getUserData is async if it fetches data
        setAppUser(userData);
      } catch (error) {
        logger.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []); // Empty dependency array ensures it runs only on component mount
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
          {!appUser.is_sso && (
            <>
              <Button
                onClick={() => router.push("/partner/profile/change-password")}
                className="w-full mt-4 bg-[var(--theme-color)] text-gray-600 font-semibold rounded-lg hover:bg-[var(--theme-color)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-color)]"
                style={{ color: 'var(--secondary-color)' }}
              >
                Change Password
              </Button>
              <Button
                onClick={() => router.push("/partner/profile/mfa-settings")}
                className="w-full mt-4 bg-[var(--theme-color)] text-gray-600 font-semibold rounded-lg hover:bg-[var(--theme-color)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-color)]"
                style={{ color: 'var(--secondary-color)' }}
              >
                {" "}
                MFA Settings
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
