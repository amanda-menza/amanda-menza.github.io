"use client";
import { getStoredUserData } from "@/lib/utils";
import ProfileUpdateForm from "../../../../components/ProfileUpdateForm";
import { AppUser } from "../../../../types/models";
import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function EditProfilePage() {
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    // Fetch user data from localStorage on the client side
    const storedUser = getStoredUserData();
    setUser(storedUser);
  }, []);

  if (user === null) {
    // Render a loading state or message while user data is being fetched
    return <LoadingSpinner message={"Loading"} />;
  }

  return <ProfileUpdateForm user={user} />;
}
