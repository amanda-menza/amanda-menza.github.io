"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  FilterFn,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  CircleCheck,
  CircleX,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRoles, UserTableData } from "../types/models";
import { useEffect, useState } from "react";
import api from "../api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
const columnNameMap = {
  display_name: "Name",
  username: "Username",
  email: "Email",
  roles: "User Roles",
  is_sso: "Account Type",
};
import { AlertDialogButton, AlertDialogProps } from "./AlertDialogButton";
import logger from "../components/Logger";
import ControlledAdminCheckbox from "./ControlledAdminCheckbox";

export function UserTable({
  data,
  fetchTable,
  currentUser,
}: {
  data: UserTableData[];
  fetchTable: () => Promise<void>;
  currentUser: string | null;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = useState("All");

  const router = useRouter();
  type UserTableDataValues =
    | string // for fields like display_name, username, email
    | UserRoles;

  const columns: ColumnDef<UserTableData, UserTableDataValues>[] = [
    {
      id: "actions",
      enableHiding: false,
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;

        const handleChangeRoles = async (newType: UserRoles[]) => {
          try {
            await api.patch(`/api/user-management/${user.id}/`, {
              roles: newType,
            });
            // Update the status locally
            fetchTable();
          } catch (error) {
            logger.error("Failed to change type:", error);
          }
        };

        const handleDeleteUser = async () => {
          try {
            await api.delete(`/api/user-management/${user.id}/`);
            // Update the status locally
            fetchTable();
          } catch (error) {
            logger.error("Failed to delete user:", error);
          }
        };

        const alertDeleteBoxProps: AlertDialogProps = {
          triggerElement: (
            <DropdownMenuLabel className="cursor-pointer">
              Delete
            </DropdownMenuLabel>
          ),
          warningDescription: `This action will delete user ${row.original.display_name.toUpperCase()}(${row.original.username.toUpperCase()}). ${
            row.original.roles.includes(UserRoles.Faculty) &&
            row.original.involved_programs.length !== 0
              ? `
                This will alter the faculty leads for the following ${
                  row.original.involved_programs.length
                } program(s): ${row.original.involved_programs.join(", ")}
              `
              : row.original.roles.includes(UserRoles.Faculty) &&
                row.original.involved_programs.length === 0
              ? "No program leads will be affected."
              : row.original.roles.includes(UserRoles.Student) &&
                row.original.involved_programs.length !== 0
              ? `
                This will delete the applications for the following ${
                  row.original.involved_programs.length
                } program(s): ${row.original.involved_programs.join(",")}
              `
              : row.original.roles.includes(UserRoles.Student) &&
                row.original.involved_programs.length === 0
              ? "No program applications will be affected."
              : ""
          }
          <br />THIS CANNOT BE UNDONE!`,
          clickAction: async () => handleDeleteUser(),
        };

        return (
          <div>
            {currentUser == user.username && user.is_sso ? (
              <div className="m-8" />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger aria-label="open menu" asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="m-4"
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuSeparator />
                  {currentUser !== user.username &&
                    user.username !== "admin" && (
                      <>
                        <DropdownMenuLabel className="cursor-default">
                          Change Roles
                        </DropdownMenuLabel>
                        <ControlledAdminCheckbox
                          user={user}
                          row={row}
                          onChangeRoles={handleChangeRoles}
                        />
                        {!user.is_sso && (
                          <>
                            <DropdownMenuSeparator />
                            <AlertDialogButton
                              alertDialogProps={alertDeleteBoxProps}
                            />
                            <DropdownMenuSeparator />
                          </>
                        )}
                      </>
                    )}
                  {!user.is_sso && (
                    <DropdownMenuLabel
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (currentUser == user.username) {
                          router.push(
                            `/administrator/dashboard/profile/change-password`
                          );
                        } else {
                          router.push(
                            `/administrator/dashboard/reset-password/${user.id}/`
                          );
                        }
                      }}
                    >
                      Reset Password
                    </DropdownMenuLabel>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "display_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("display_name")}</div>,
    },
    {
      accessorKey: "username", // Same here
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Username
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("username")}</div>,
    },
    {
      accessorKey: "email", // Again using accessorKey for direct property access
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "roles",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User Roles <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const roles = row.getValue("roles") as UserRoles[]; // Explicitly cast to string[]
        return <div>{roles.join(", ")}</div>;
      },
    },
    {
      accessorKey: "is_sso",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Account Type <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div>{row.getValue("is_sso") ? "SSO" : "Traditional"}</div>
      ),
    },
    {
      accessorKey: "has_ulink",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ulink Activated <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.getValue("ulink_username") ? (
            <CircleCheck className="w-5 h-5 text-green-500" />
          ) : (
            <CircleX className="w-5 h-5 text-red-500" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "ulink_username",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ulink Username <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          {row.getValue("ulink_username") ? (
            row.getValue("ulink_username")
          ) : (
            <span>-</span>
          )}
        </div>
      ),
    },
  ];

  const customFilterFn: FilterFn<UserTableData> = (
    row,
    columnId,
    filterValue,
    addMeta
  ) => {
    void addMeta;
    logger.info(
      `Global Filter Called with column: ${columnId}, value:`,
      filterValue
    );
    const data: UserTableData = row.original; // Access the full row data

    const userType = data.roles;
    const normalizedFilterValue = filterValue;

    switch (normalizedFilterValue) {
      case UserRoles.Administrator:
        return userType.includes(UserRoles.Administrator);
      case UserRoles.Faculty:
        return userType.includes(UserRoles.Faculty);
      case UserRoles.Reviewer:
        return userType.includes(UserRoles.Reviewer);
      case UserRoles.Student:
        return userType.includes(UserRoles.Student);
      default:
        return true;
    }
  };

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    globalFilterFn: customFilterFn,
  });
  logger.info("Rows in Row Model:", table.getRowModel().rows);

  return (
    <div className="w-full h-screen">
      <div className="flex items-center py-4 space-x-4">
        <Input
          placeholder="Filter by name..."
          value={
            (table.getColumn("display_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("display_name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm border-gray-300 dark:border-gray-700"
        />

        <Select
          value={globalFilter}
          onValueChange={(value) => {
            setGlobalFilter(value);
            logger.info("Global Filter Changed:", globalFilter);
          }}
        >
          <SelectTrigger aria-label="User Type Menu">
            <SelectValue placeholder="Filter by User Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UserRoles.Administrator}>
              {UserRoles.Administrator}
            </SelectItem>
            <SelectItem value={UserRoles.Student}>
              {UserRoles.Student}
            </SelectItem>
            <SelectItem value={UserRoles.Faculty}>
              {UserRoles.Faculty}
            </SelectItem>
            <SelectItem value={UserRoles.Reviewer}>
              {UserRoles.Reviewer}
            </SelectItem>
            <SelectItem value="All">All Users</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="max-h-60 overflow-y-auto" // Apply max height and scrolling
          >
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {columnNameMap[column.id as keyof typeof columnNameMap]}{" "}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="text-center text-gray-900 dark:text-gray-100"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500 dark:text-gray-400"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-gray-300 dark:border-gray-700"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-gray-300 dark:border-gray-700"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
