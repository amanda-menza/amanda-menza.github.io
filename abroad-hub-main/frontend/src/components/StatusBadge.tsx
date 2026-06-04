import { Badge } from "@/components/ui/badge";
import { ApplicationStatus } from "../types/models";
interface StatusBadgeProps {
  status: ApplicationStatus;
  hoverable?: boolean; // New prop to control hover effect
}

export function StatusBadge({ status, hoverable = false }: StatusBadgeProps) {
  const baseClasses = "text-base py-2 px-4 rounded-md font-semibold";

  const statusColors: Record<ApplicationStatus, string> = {
    [ApplicationStatus.Applied]: "bg-blue-500 text-white",
    [ApplicationStatus.Eligible]: "bg-yellow-500 text-white",
    [ApplicationStatus.Approved]: "bg-green-400 text-white",
    [ApplicationStatus.Enrolled]: "bg-green-500 text-white",
    [ApplicationStatus.Completed]: "bg-purple-500 text-white",
    [ApplicationStatus.Canceled]: "bg-red-500 text-white",
    [ApplicationStatus.Withdrawn]: "bg-red-500 text-white",
    [ApplicationStatus.Not_Applied]: "bg-transparent-500 text-white",
  };

  const hoverEffect = hoverable ? "hover:opacity-80 transition-opacity" : "";

  return (
    <Badge
      id="status-badge"
      className={`${baseClasses} ${statusColors[status]} ${hoverEffect}`}
    >
      {status}
    </Badge>
  );
}
