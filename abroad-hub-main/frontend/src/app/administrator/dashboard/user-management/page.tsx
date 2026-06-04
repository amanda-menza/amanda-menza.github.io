"use client";

import { useEffect, useState } from "react";
import api from "../../../../api.js";
import { UserTableData, UserRoles } from "../../../../types/models";
import { useRouter } from "next/navigation";
import { UserTable } from "@/components/UserTable";
import logger from "../../../../components/Logger";
import ProtectedRole from "@/components/ProtectedRole";

export default function UserDetail() {
  const [users, setUsers] = useState<UserTableData[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null); // Current user data
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/user-management/");
      const data = response.data;

      setUsers(data);
    } catch (error) {
      logger.error("Error fetching users:", error);
    } finally {
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/api/current-user/"); // Assuming this is the endpoint for current user
      setCurrentUser(response.data.username); // Assuming the current user's data is in response.data
    } catch (error) {
      logger.error("Error fetching current user:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []); // Empty dependency array ensures the effect runs once when the component mounts

  return (
    <ProtectedRole requiredRoles={[UserRoles.Administrator]}>
      <div className="overflow-x-auto">
        <h1 className="text-3xl font-bold">User Management</h1>
        <UserTable
          data={users}
          fetchTable={fetchUsers}
          currentUser={currentUser}
        />
      </div>
    </ProtectedRole>
  );
}
