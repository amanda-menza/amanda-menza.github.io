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
import { ApplicationStatus, UserRoles } from "@/types/models";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";

interface StatusDropdownProps {
  application: { status: ApplicationStatus };
  userRoles: UserRoles[];
  handleChangeStatus: (status: ApplicationStatus) => void;
  buttonText?: string;
}

const ChangeStatusDropdown: React.FC<StatusDropdownProps> = ({
  application,
  userRoles,
  handleChangeStatus,
  buttonText,
}) => {
  const [selectedStatus, setSelectedStatus] =
    useState<ApplicationStatus | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Track dropdown menu state

  const handleSelectChange = (value: ApplicationStatus) => {
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
  const adminStatuses = [
    ApplicationStatus.Applied,
    ApplicationStatus.Eligible,
    ApplicationStatus.Approved,
    ApplicationStatus.Canceled,
    ApplicationStatus.Enrolled,
  ];
  const facultyStatuses = [
    ApplicationStatus.Applied,
    ApplicationStatus.Eligible,
    ApplicationStatus.Approved,
  ];
  const reviewerStatuses = [
    ApplicationStatus.Applied,
    ApplicationStatus.Eligible,
  ];
  const studentStatuses = [
    ApplicationStatus.Applied,
    ApplicationStatus.Withdrawn,
  ];

  const roleHasPermission = () => {
    if (
      userRoles.includes(UserRoles.Administrator) &&
      adminStatuses.includes(application.status)
    )
      return true;
    else if (
      userRoles.includes(UserRoles.Faculty) &&
      facultyStatuses.includes(application.status)
    )
      return true;
    else if (
      userRoles.includes(UserRoles.Reviewer) &&
      reviewerStatuses.includes(application.status)
    )
      return true;
    else if (
      userRoles.includes(UserRoles.Student) &&
      studentStatuses.includes(application.status)
    )
      return true;
    else return false;
  };
  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      {roleHasPermission() ? (
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
      ) : buttonText ? null : (
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 cursor-not-allowed"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal />
        </Button>
      )}

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
        <Select value={application.status} onValueChange={handleSelectChange}>
          <SelectTrigger aria-label="change-status-form">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {userRoles.includes(UserRoles.Administrator)
              ? adminStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))
              : userRoles.includes(UserRoles.Faculty)
              ? facultyStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))
              : userRoles.includes(UserRoles.Reviewer)
              ? reviewerStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))
              : userRoles.includes(UserRoles.Student)
              ? studentStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))
              : null}
          </SelectContent>
        </Select>
      </DropdownMenuContent>

      {/* Confirmation Dialog */}
      {isDialogOpen && (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>

          <AlertDialogContent>
            <p>
              Are you sure you want to change the application status to{" "}
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

export default ChangeStatusDropdown;
