import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from "../types/models";
interface StatusBadgeProps {
  status: PaymentStatus;
  hoverable?: boolean; // New prop to control hover effect
}

export function PaymentStatusBadge({
  status,
  hoverable = false,
}: StatusBadgeProps) {
  const baseClasses = "text-base py-2 px-4 rounded-md font-semibold";

  const statusColors: Record<PaymentStatus, string> = {
    [PaymentStatus.Unpaid]: "bg-red-500 text-white",
    [PaymentStatus.Partially]: "bg-yellow-500 text-white",
    [PaymentStatus.Fully]: "bg-green-500 text-white",
    [PaymentStatus.Null]: "bg-transparent-500 text-white",
  };

  const hoverEffect = hoverable ? "hover:opacity-80 transition-opacity" : "";

  return (
    <Badge
      id="payment-status-badge"
      className={`${baseClasses} ${statusColors[status]} ${hoverEffect}`}
    >
      {status}
    </Badge>
  );
}
