import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { MoreHorizontal } from "lucide-react";
import { PaymentStatus, UserRoles } from "@/types/models";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";

interface PaymentStatusDropdownProps {
  application: { payment_status: PaymentStatus };
  handleChangeStatus: (status: PaymentStatus) => void;
  buttonText?: string;
}

const ChangePaymentStatusDropdown: React.FC<PaymentStatusDropdownProps> = ({
  application,
  handleChangeStatus,
  buttonText,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Track dropdown menu state

  const handleSelectChange = (value: PaymentStatus) => {
    setSelectedStatus(value);
    setIsDialogOpen(true);
  };

  const confirmStatusChange = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (selectedStatus) {
      handleChangeStatus(selectedStatus);
    }
    setIsDialogOpen(false);
    window.location.reload();
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger aria-label="open menu" asChild>
        {buttonText ? (
          <Button
            variant="outline"
            className="m-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
          >
            {buttonText}
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Payment Status</DropdownMenuLabel>
        <Select
          value={application.payment_status}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger aria-label="change-status-form">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(PaymentStatus)
              .filter((status) => status !== PaymentStatus.Null)
              .map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </DropdownMenuContent>

      {/* Confirmation Dialog */}
      {isDialogOpen && (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>

          <AlertDialogContent>
            <p>
              Are you sure you want to change the payment status to{" "}
              <strong>{selectedStatus}</strong>?
            </p>
            <AlertDialogFooter>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDialogOpen(false);
                  setIsDropdownOpen(false);
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  confirmStatusChange(e);
                  setIsDropdownOpen(false);
                }}
              >
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </DropdownMenu>
  );
};

export default ChangePaymentStatusDropdown;
