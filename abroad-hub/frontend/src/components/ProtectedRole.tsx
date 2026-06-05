import { ReactNode, useContext } from "react";
import { AppUser, UserRoles } from "@/types/models"; // Replace with actual context path
import { AlertTriangle } from "lucide-react";
import { getStoredUserData } from "@/lib/utils";

interface RoleGuardProps {
  requiredRoles: UserRoles[]; // Accepts an array of required roles
  children: ReactNode;
}

const ProtectedRole: React.FC<RoleGuardProps> = ({
  requiredRoles,
  children,
}) => {
  const userRoles = getStoredUserData().roles;
  // Check if user has at least one of the required roles
  const userHasAccess = requiredRoles.some((role) => userRoles.includes(role));

  if (!userHasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Unauthorized</h2>
        <p className="text-gray-600">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRole;
