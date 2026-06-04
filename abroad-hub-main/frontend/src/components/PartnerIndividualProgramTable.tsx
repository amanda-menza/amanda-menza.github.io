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
  HeaderContext,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  CircleCheck,
  CircleX,
  ClipboardCopy,
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
import {
  PartnerProgramDetailsTableData,
  ApplicationStatus,
  PaymentStatus,
  UserRoles,
} from "../types/models";
import { useState } from "react";
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
  application_id: "ID",
  display_name: "Name",
  username: "Username",
  email: "Email",
  status: "Application Status",
  payment_status: "Payment Status",
};
import logger from "../components/Logger";
import ChangeStatusDropdown from "@/components/ChangeStatusDropdown";
import { getStoredUserData } from "@/lib/utils";
import ChangePaymentStatusDropdown from "./PaymentStatusDropdown";

export function PartnerIndividualProgramTable({
  data,
  fetchTable,
}: {
  data: PartnerProgramDetailsTableData[];
  fetchTable: () => Promise<void>;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = useState("All");
  const currentUserRoles = getStoredUserData().roles;

  const router = useRouter();
  type PartnerProgramDetailsTableDataValues =
    | number
    | string // for fields like display_name, username, email, dob, major
    | PaymentStatus
    | ApplicationStatus; // for the status field

  const columns: ColumnDef<
    PartnerProgramDetailsTableData,
    PartnerProgramDetailsTableDataValues
  >[] = [
    {
      id: "payment_actions",
      enableHiding: false,
      header: ({ column }) => (
        <strong className="text-xs">Change Pay Status</strong>
      ),
      cell: ({ row }) => {
        const application = row.original;

        const handleChangePaymentStatus = async (newStatus: string) => {
          try {
            await api.patch(
              `/api/applications/${application.application_id}/change_payment_status/`,
              {
                payment_status: newStatus,
              }
            );
            // Update the status locally
            fetchTable();
          } catch (error) {
            logger.error("Failed to change status:", error);
          }
        };

        return (
          <div>
            <ChangePaymentStatusDropdown
              application={application}
              handleChangeStatus={handleChangePaymentStatus}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "display_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-0"
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
          size="sm"
          className="flex gap-0"
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
          size="sm"
          className="flex gap-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },

    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Application Status <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("status")}</div>,
    },

    {
      accessorKey: "payment_status",
      header: ({
        column,
      }: HeaderContext<PartnerProgramDetailsTableData, unknown>) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Payment
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const paymentStatus: PaymentStatus = row.getValue("payment_status");

        let statusClass = "";
        if (paymentStatus === PaymentStatus.Fully) {
          statusClass = "bg-green-300 text-black"; // Green for fully paid
        } else if (paymentStatus === PaymentStatus.Partially) {
          statusClass = "bg-yellow-300 text-black"; // Yellow for partially paid
        } else if (paymentStatus === PaymentStatus.Unpaid) {
          statusClass = "bg-red-300 text-black"; // Red for unpaid
        }

        return (
          <div className={`p-2 rounded ${statusClass}`}>{paymentStatus}</div>
        );
      },
    },
  ];

  const customFilterFn: FilterFn<PartnerProgramDetailsTableData> = (
    row,
    columnId,
    filterValue
  ) => {
    logger.info("Global Filter Called with:", row, filterValue);
    const data: PartnerProgramDetailsTableData = row.original; // Access the full row data

    switch (filterValue) {
      case ApplicationStatus.Approved:
        return data.status == ApplicationStatus.Approved;
      case ApplicationStatus.Enrolled:
        return data.status == ApplicationStatus.Enrolled;
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

  const copyEmailsToClipboard = () => {
    const emails = table
      .getFilteredRowModel()
      .rows.map((row) => row.original.email);
    const emailText = emails.join("; ");
    navigator.clipboard.writeText(emailText).then(() => {
      alert("Emails copied to clipboard!");
    });
  };

  return (
    <div className="overflow-x-auto">
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
          <SelectTrigger aria-label="Status Filter Menu">
            <SelectValue placeholder="Filter by Application Status" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(ApplicationStatus)
              .filter(
                (status) =>
                  status === ApplicationStatus.Enrolled ||
                  status === ApplicationStatus.Approved
              )
              .map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            <SelectItem value="All">All Applications</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={copyEmailsToClipboard}>
          <ClipboardCopy></ClipboardCopy>Copy Emails
        </Button>

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
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
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
                  className="hover:bg-inherit"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="text-gray-900 dark:text-gray-100 text-center align-middle"
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
