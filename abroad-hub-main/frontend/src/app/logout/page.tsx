"use client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Perform logout logic (clear localStorage)
    localStorage.clear();
    router.push("/sso/login");
  }, [router]); // Empty dependency array ensures this only runs once

  return <LoadingSpinner message={"Logging Out"} />;
}
