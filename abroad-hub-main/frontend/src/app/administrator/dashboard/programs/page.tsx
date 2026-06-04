"use client";
import { AdminProgramTable } from "../../../../components/AdminProgramTable";
import { useState, useEffect } from "react";
import { AdminTableData, UserRoles } from "../../../../types/models";
import { useRouter } from "next/navigation";
import api from "../../../../api";
import { Button } from "@/components/ui/button";
import logger from "../../../../components/Logger";
import { fetchCurrentUserRoles } from "@/lib/utils";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function AdministrativeProgramList() {
  const [programs, setPrograms] = useState<AdminTableData[]>([]);
  const [roles, setRoles] = useState<UserRoles[]>([]);
  const router = useRouter();

  const fetchProgramsWithCounts = async () => {
    try {
      const response = await api.get("/api/program-application-counts/"); // Replace with your actual API endpoint
      const data = response.data;
      setPrograms(data); // Assuming data is an array of programs
    } catch (error) {
      logger.error("Error fetching programs:", error);
    } finally {
    }
  };

  const fetchRoles = async () => {
    try {
      const roles: UserRoles[] = await fetchCurrentUserRoles();
      setRoles(roles);
    } catch (error) {
      logger.error("Error fetching roles:", error);
    }
  };

  const handleCreateProgram = () => {
    router.push("/administrator/dashboard/programs/create");
  };

  // Fetch programs from API
  useEffect(() => {
    fetchProgramsWithCounts();
    fetchRoles();
  }, []); // Empty dependency array ensures the effect runs once when the component mounts
  if (!roles) {
    <LoadingSpinner message={"Verifying"} />;
  }

  return (
    <div className="overflow-x-auto">
      <h1 className="text-3xl font-bold mb-3">Programs Overview</h1>
      <div className="mb-4 flex justify-start">
        {roles.includes(UserRoles.Administrator) ? (
          <Button
            onClick={handleCreateProgram}
            className="text-gray-600 bg-[var(--theme-color)] hover:bg-[var(--theme-color)]"
            style={{ color: 'var(--secondary-color)' }}
          >
          Create Program
        </Button>
        ) : null}
      </div>
      <AdminProgramTable data={programs} />
    </div>
  );
}
