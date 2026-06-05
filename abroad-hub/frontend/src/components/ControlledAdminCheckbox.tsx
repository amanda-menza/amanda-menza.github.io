import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserRoles, UserTableData } from "@/types/models";
import { Row } from "@tanstack/react-table";

interface ControlledRolesCheckboxProps {
  user: UserTableData;
  row: Row<UserTableData>;
  onChangeRoles: (newRoles: UserRoles[]) => Promise<void>;
}

export const ControlledRolesCheckbox: React.FC<
  ControlledRolesCheckboxProps
> = ({ user, row, onChangeRoles }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<UserRoles[]>(user.roles);
  const [pendingRoles, setPendingRoles] = useState<UserRoles[]>(user.roles);

  const allRoles = [
    UserRoles.Student,
    UserRoles.Faculty,
    UserRoles.Reviewer,
    UserRoles.Administrator,
    UserRoles.Partner,
  ];

  const isStudentSelected = pendingRoles.includes(UserRoles.Student);
  const isPartnerSelected = pendingRoles.includes(UserRoles.Partner);

  const isOtherRoleSelected = pendingRoles.some((role) =>
    [UserRoles.Faculty, UserRoles.Reviewer, UserRoles.Administrator].includes(
      role
    )
  );

  const getWarningDescription = () => {
    const removedRoles = user.roles.filter(
      (role) => !pendingRoles.includes(role)
    );
    const addedRoles = pendingRoles.filter(
      (role) => !user.roles.includes(role)
    );

    const warningParts = [];

    if (removedRoles.length > 0) {
      warningParts.push(`Removing role(s): ${removedRoles.join(", ")}`);
    }
    if (addedRoles.length > 0) {
      warningParts.push(`Adding role(s): ${addedRoles.join(", ")}`);
    }
    if (
      (removedRoles.length > 0 || addedRoles.length > 0) &&
      row.original.involved_programs.length > 0
    ) {
      warningParts.push(
        `This will affect ${
          removedRoles.includes(UserRoles.Faculty)
            ? "faculty leads for "
            : removedRoles.includes(UserRoles.Student)
            ? "applications for "
            : removedRoles.includes(UserRoles.Partner)
            ? "partner providers for"
            : ""
        }${
          row.original.involved_programs.length
        } program(s): ${row.original.involved_programs.join(", ")}`
      );
    }

    return warningParts.length > 0
      ? warningParts.join(". ")
      : "No changes to user roles.";
  };

  const handleRoleChange = (role: UserRoles) => {
    let newPendingRoles = [...pendingRoles];

    if (pendingRoles.includes(role)) {
      newPendingRoles = newPendingRoles.filter((r) => r !== role);
    } else {
      if (role === UserRoles.Student) {
        newPendingRoles = [UserRoles.Student]; // Student alone
      } else {
        newPendingRoles = newPendingRoles.filter(
          (r) => r !== UserRoles.Student
        );
        newPendingRoles.push(role);
      }
    }

    setPendingRoles(newPendingRoles);
  };

  const handleSaveClick = () => {
    setIsDialogOpen(true);
  };

  const handleConfirmRoleChange = async () => {
    await onChangeRoles(pendingRoles);
    setSelectedRoles(pendingRoles);
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setPendingRoles(selectedRoles);
    setIsDialogOpen(false);
  };
  const arraysAreEqual = (arr1: UserRoles[], arr2: UserRoles[]): boolean => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((value) => arr2.includes(value));
  };
  const isSaveDisabled =
    arraysAreEqual(pendingRoles, selectedRoles) || pendingRoles.length == 0;

  return (
    <>
      <div className="flex flex-col space-y-2">
        {allRoles.map((role) => (
          <div key={role} className="flex items-center space-x-2">
            <Checkbox
              id={`role-${role}`}
              checked={pendingRoles.includes(role)}
              onCheckedChange={() => handleRoleChange(role)}
              disabled={
                (isStudentSelected && role !== UserRoles.Student) ||
                (isOtherRoleSelected && role === UserRoles.Student) ||
                (isPartnerSelected && role !== UserRoles.Partner) ||
                (!isPartnerSelected &&
                  pendingRoles.length > 0 &&
                  role === UserRoles.Partner)
              }
            />
            <Label htmlFor={`role-${role}`}>{role}</Label>
          </div>
        ))}
      </div>

      <Button
        className="mt-4 w-full bg-[var(--theme-color)] text-gray-600 py-2 px-4 rounded-md hover:bg-[var(--theme-color)]"
        style={{ color: 'var(--secondary-color)' }}
        onClick={handleSaveClick}
        disabled={isSaveDisabled}
      >
        Save Changes
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Changes</AlertDialogTitle>
            <AlertDialogDescription>
              {getWarningDescription()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRoleChange}>
              Confirm Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ControlledRolesCheckbox;
