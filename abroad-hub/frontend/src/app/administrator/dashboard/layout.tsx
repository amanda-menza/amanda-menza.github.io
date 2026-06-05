"use client";

import { Header } from "@/components/header";
import ProtectedRoute from "../../../components/ProtectedRoute";
import {
  fetchCurrentUser,
  isStudent,
  isAdminType,
  isPartner,
} from "@/lib/utils";
import { AppUser, UserRoles } from "@/types/models";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import logger from "../../../components/Logger";
import { Footer } from "@/components/footer";
import ProtectedRole from "@/components/ProtectedRole";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import InactivityMonitor from "@/components/InactivityMonitor";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [is_student, setIsStudent] = useState<boolean | null>(null);
  const [is_admin, setIsAdminType] = useState<boolean | null>(null);
  const [is_partner, setIsPartner] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const newUser = await fetchCurrentUser();
        setUser(newUser);

        if (newUser) {
          const new_is_student = await isStudent();
          setIsStudent(new_is_student);
          const new_is_admin_type = isAdminType();
          setIsAdminType(new_is_admin_type);
          const new_is_partner = isPartner();
          setIsPartner(new_is_partner);
        } else {
          router.push("/sso/login"); // Redirect immediately if no user
        }
      } catch (error) {
        logger.error("Error fetching user or student status:", error);
      } finally {
        setLoading(false); // Ensure loading stops after fetching
      }
    };

    fetchData();
  }, [router]);

  if (loading || user === null || is_student === null) {
    // Render a loading spinner or message while data is being fetched
    return <LoadingSpinner message={"Loading"} />;
  }

  return (
    <ProtectedRoute>
      <ProtectedRole
        requiredRoles={[
          UserRoles.Administrator,
          UserRoles.Faculty,
          UserRoles.Reviewer,
        ]}
      >
        <InactivityMonitor />
        <div className="flex flex-col min-h-screen bg-gray-100 overflow-x-hidden">
          <Header
            user={user}
            is_student={is_student}
            is_admin_role={is_admin}
            is_partner={is_partner}
          />{" "}
          <div className="flex-1 flex overflow-hidden">
            <div className="relative transition-all duration-300 ease-in-out bg-gray-200 shadow-sm h-full"></div>
            <main className="flex-1 p-6 max-w-full w-full overflow-auto">
              {children}
            </main>
          </div>
          <Footer />
        </div>
      </ProtectedRole>
    </ProtectedRoute>
  );
}
