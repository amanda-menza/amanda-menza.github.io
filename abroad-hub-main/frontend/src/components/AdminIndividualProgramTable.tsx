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
  AdminProgramDetailsTableData,
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
  display_name: "Name",
  username: "Username",
  email: "Email",
  dob: "DOB",
  major: "Major",
  gpa: "GPA",
  status: "Status",
  docuemnts: "Documents",
  confidential_notes_count: "Confidential Notes Count",
  latest_confidential_note: "Latest Confidential Note",
  recommendation_letters_count: "Rec Letters",
};
import logger from "../components/Logger";
import ChangeStatusDropdown from "@/components/ChangeStatusDropdown";
import { getStoredUserData } from "@/lib/utils";
import ChangePaymentStatusDropdown from "./PaymentStatusDropdown";

export function AdminIndividualProgramTable({
  data,
  fetchTable,
  track_payment,
}: {
  data: AdminProgramDetailsTableData[];
  fetchTable: () => Promise<void>;
  track_payment: boolean;
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
  type AdminProgramDetailsTableDataValues =
    | number // for fields like application_id, gpa
    | string // for fields like display_name, username, email, dob, major
    | ApplicationStatus; // for the status field
  type DocumentKeys =
    | "assumption_of_risk_form"
    | "acknowledgement_of_code_of_conduct"
    | "housing_questionnaire"
    | "medical_health_history_and_immunization_records";
  const columns: ColumnDef<
    AdminProgramDetailsTableData,
    AdminProgramDetailsTableDataValues
  >[] = [
    {
      id: "actions",
      enableHiding: false,
      header: ({ column }) => (
        <strong className="text-xs">Change App. Status</strong>
      ),
      cell: ({ row }) => {
        const application = row.original;

        const handleChangeStatus = async (newStatus: string) => {
          try {
            await api.patch(
              `/api/applications/${application.application_id}/change_status/`,
              {
                status: newStatus,
              }
            );
            // Update the status locally
            fetchTable();
          } catch (error) {
            logger.error("Failed to change status:", error);
          }
        };

        return (
          <>
            <div>
              <ChangeStatusDropdown
                application={application}
                userRoles={currentUserRoles}
                handleChangeStatus={handleChangeStatus}
              />
            </div>
          </>
        );
      },
    },
    ...(track_payment && currentUserRoles.includes(UserRoles.Administrator)
      ? [
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
                <>
                  {currentUserRoles.includes(UserRoles.Administrator) ? (
                    <div>
                      <ChangePaymentStatusDropdown
                        application={application}
                        handleChangeStatus={handleChangePaymentStatus}
                      />
                    </div>
                  ) : null}
                </>
              );
            },
          } as ColumnDef<
            AdminProgramDetailsTableData,
            AdminProgramDetailsTableDataValues
          >,
        ]
      : []),
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
      accessorKey: "dob",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          DOB
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("dob")}</div>,
    },
    {
      accessorKey: "major",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Major
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("major")}</div>,
    },
    {
      accessorKey: "gpa",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          GPA <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("gpa")}</div>,
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
          Status <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("status")}</div>,
    },
    {
      accessorKey: "documents",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Documents <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const status: ApplicationStatus = row.getValue("status");

        // Check if the row should display icons or just '-'
        if (!["Approved", "Enrolled", "Completed"].includes(status)) {
          return <div>-</div>;
        }

        // Define the document keys and their labels
        const documents = [
          {
            key: "assumption_of_risk_form",
            label: "Risk",
          },
          {
            key: "acknowledgement_of_code_of_conduct",
            label: "Conduct",
          },
          {
            key: "housing_questionnaire",
            label: "Housing",
          },
          {
            key: "medical_health_history_and_immunization_records",
            label: "Health",
          },
        ];

        return (
          <div className="flex gap-2">
            {documents.map(({ key }) => {
              const form = row.original[key as DocumentKeys];
              return form ? (
                <span key={key} className="text-green-500">
                  <CircleCheck className="w-5 h-5" /> {/* Green check */}
                </span>
              ) : (
                <span key={key} className="text-red-500">
                  <CircleX className="w-5 h-5" /> {/* Red X */}
                </span>
              );
            })}
          </div>
        );
      },
    },

    {
      accessorKey: "confidential_notes_count",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-0 items-center justify-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Notes Count <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const notes = row.original.confidential_notes;
        return <div>{Array.isArray(notes) ? notes.length : 0}</div>;
      },
    },
    {
      accessorKey: "latest_confidential_notes",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Latest Note <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const notes = row.original.confidential_notes;

        // Check if notes is defined and has elements
        if (!Array.isArray(notes) || notes.length === 0) {
          return <div>No notes</div>;
        }

        // Get the most recent note (assumes notes are sorted in reverse chronological order)
        const latestNote = notes[0];

        // Make sure all properties exist before trying to access them
        return (
          <div>
            <strong>
              {latestNote.author
                ? `${latestNote.author.display_name || "Unknown"} (${
                    latestNote.author.username || ""
                  })`
                : "Administrator"}
            </strong>
            <br />
            <small>
              {latestNote.timestamp
                ? new Date(latestNote.timestamp).toLocaleDateString()
                : "Unknown date"}
            </small>
          </div>
        );
      },
    },
    {
      accessorKey: "recommendation_letters_count",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="flex gap-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Rec Letters
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        // Get recommendation letters from the row and show count + status
        const letters = row.original.recommendation_letters || [];
        const submittedCount = letters.filter(
          (letter) => letter.status === "Fulfilled"
        ).length;
        const total = letters.length;

        if (total === 0) {
          return <span className="text-muted-foreground">0</span>;
        }

        return (
          <span>
            {submittedCount}/{total}
          </span>
        );
      },
    },
    ...(track_payment
      ? [
          {
            accessorKey: "payment_status",
            header: ({
              column,
            }: HeaderContext<AdminProgramDetailsTableData, unknown>) => (
              <Button
                variant="ghost"
                size="sm"
                className="flex gap-0"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Payment
                <ArrowUpDown />
              </Button>
            ),
            cell: ({ row }) => {
              const paymentStatus: PaymentStatus =
                row.getValue("payment_status");

              let statusClass = "";
              if (paymentStatus === PaymentStatus.Fully) {
                statusClass = "bg-green-300 text-black"; // Green for fully paid
              } else if (paymentStatus === PaymentStatus.Partially) {
                statusClass = "bg-yellow-300 text-black"; // Yellow for partially paid
              } else if (paymentStatus === PaymentStatus.Unpaid) {
                statusClass = "bg-red-300 text-black"; // Red for unpaid
              }

              return (
                <div className={`p-2 rounded ${statusClass}`}>
                  {paymentStatus}
                </div>
              );
            },
          } as ColumnDef<AdminProgramDetailsTableData>,
        ]
      : []),
  ];

  const customFilterFn: FilterFn<AdminProgramDetailsTableData> = (
    row,
    columnId,
    filterValue
  ) => {
    logger.info("Global Filter Called with:", row, filterValue);
    const data: AdminProgramDetailsTableData = row.original; // Access the full row data

    switch (filterValue) {
      case ApplicationStatus.Applied:
        return data.status == ApplicationStatus.Applied;
      case ApplicationStatus.Eligible:
        return data.status == ApplicationStatus.Eligible;
      case ApplicationStatus.Approved:
        return data.status == ApplicationStatus.Approved;
      case ApplicationStatus.Withdrawn:
        return data.status == ApplicationStatus.Withdrawn;
      case ApplicationStatus.Canceled:
        return data.status == ApplicationStatus.Canceled;
      case ApplicationStatus.Enrolled:
        return data.status == ApplicationStatus.Enrolled;
      case ApplicationStatus.Completed:
        return data.status == ApplicationStatus.Completed;
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
              .filter((status) => status != ApplicationStatus.Not_Applied)
              .map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            <SelectItem value="All">All Applications</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          onClick={copyEmailsToClipboard}
          className="py-3 bg-[var(--theme-color)] text-gray-600 font-semibold rounded-lg hover:bg-[var(--theme-color)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-color)]"
          style={{ color: 'var(--secondary-color)' }}
        >
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
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/administrator/dashboard/applications/${row.original.application_id}`
                    )
                  }
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
