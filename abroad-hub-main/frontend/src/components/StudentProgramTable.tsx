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
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  CircleCheck,
  CircleX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  StudentTableData,
  ApplicationStatus,
  SemesterType,
  FacultyLead,
  PaymentStatus,
} from "../types/models";
import { useRouter } from "next/navigation";
import logger from "../components/Logger";

export function StudentProgramTable({ data }: { data: StudentTableData[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const router = useRouter();
  type DocumentKeys =
    | "assumption_of_risk_form"
    | "acknowledgement_of_code_of_conduct"
    | "housing_questionnaire"
    | "medical_health_history_and_immunization_records";
  type StudentTableDataValues =
    | number // for fields like program_id, application_id, year
    | string // for fields like title, location, faculty_leads, start_date, end_date, open_date, deadline
    | ApplicationStatus
    | FacultyLead
    | SemesterType;

  const columnNameMap = {
    program_id: "Program ID",
    application_id: "APP ID",
    title: "Title",
    year: "Year",
    semester: "Semester",
    location: "Location",
    faculty_leads: "Faculty Leads",
    start_date: "Start Date",
    end_date: "End Date",
    open_date: "Open Date",
    deadline: "Deadline",
    essential_doc_deadline: "Document Deadline",
    status: "Status",
    documents: "Documents",
  };

  const seasonOrder: Record<string, number> = { Spring: 1, Summer: 2, Fall: 3 };

  const customSeasonSort = (rowA: any, rowB: any, columnId: string) => {
    const seasonA =
      seasonOrder[rowA.getValue(columnId) as keyof typeof seasonOrder] || 99;
    const seasonB =
      seasonOrder[rowB.getValue(columnId) as keyof typeof seasonOrder] || 99;
    return seasonA - seasonB;
  };

  const columns: ColumnDef<StudentTableData, StudentTableDataValues>[] = [
    {
      accessorKey: "title", // This is fine for simple property access
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("title")}</div>,
    },
    {
      accessorKey: "year", // Same here
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Year
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("year")}</div>,
    },
    {
      accessorKey: "semester", // Again using accessorKey for direct property access
      sortingFn: customSeasonSort,
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Semester
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("semester")}</div>,
    },
    {
      accessorKey: "location", // Same here
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Location
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("location")}</div>,
    },
    {
      accessorKey: "faculty_leads",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Faculty
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const facultyLeads = row.getValue("faculty_leads") as FacultyLead[]; // Type cast to FacultyLead[]
        return (
          <div>
            {/* Check if there are any faculty leads */}
            {facultyLeads && facultyLeads.length > 0 ? (
              facultyLeads.map((faculty) => (
                <div key={faculty.id}>
                  {faculty.display_name}({faculty.username})
                </div>
              ))
            ) : (
              <span>No Faculty Leads</span>
            )}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const facultyA = rowA.getValue("faculty_leads") as FacultyLead[];
        const facultyB = rowB.getValue("faculty_leads") as FacultyLead[];

        // Extract the first faculty's display_name (or empty string if no faculty)
        const nameA =
          facultyA.length > 0 ? facultyA[0].display_name.toLowerCase() : "";
        const nameB =
          facultyB.length > 0 ? facultyB[0].display_name.toLowerCase() : "";

        return nameA.localeCompare(nameB);
      },
    },
    {
      accessorKey: "start_date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Start
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("start_date")}</div>,
    },
    {
      accessorKey: "end_date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          End
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("end_date")}</div>,
    },
    {
      accessorKey: "open_date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Open
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("open_date")}</div>,
    },
    {
      accessorKey: "deadline",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Deadline
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("deadline")}</div>,
    },
    {
      accessorKey: "essential_doc_deadline",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Doc Deadline
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("essential_doc_deadline")}</div>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="flex gap-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            App. Status
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div> {row.getValue("status")}</div>,
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
      accessorKey: "payment_deadline",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="flex gap-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Pay Deadline
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        const paymentDeadline: string = row.getValue("payment_deadline");
        if (!paymentDeadline) {
          return <div>-</div>;
        } else {
          return <div>{paymentDeadline}</div>;
        }
      },
    },
    {
      accessorKey: "payment_status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="flex gap-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Pay Status
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        const paymentStatus: PaymentStatus = row.getValue("payment_status");
        const trackPayment = row.original.track_payment;
        const status = row.getValue("status");

        if (!trackPayment) {
          return <div>-</div>;
        }
        if (
          !(
            status == ApplicationStatus.Approved ||
            status == ApplicationStatus.Enrolled
          )
        ) {
          return <div>NA</div>;
        }

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

  // Custom filter function that searches across multiple columns
  const fuzzyFilter = React.useCallback(
    (row: any, columnId: string, filterValue: string) => {
      const searchValue = filterValue.toLowerCase();

      // Check title
      const title = String(row.getValue("title") || "").toLowerCase();
      if (title.includes(searchValue)) return true;

      // Check location
      const location = String(row.getValue("location") || "").toLowerCase();
      if (location.includes(searchValue)) return true;

      // Check faculty leads (which is an array of objects)
      const facultyLeads = row.getValue("faculty_leads") as FacultyLead[];
      if (facultyLeads && facultyLeads.length > 0) {
        const facultyMatch = facultyLeads.some((faculty) =>
          faculty.display_name.toLowerCase().includes(searchValue)
        );
        if (facultyMatch) return true;
      }

      return false;
    },
    []
  );

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
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });
  logger.info("Rows in Row Model:", table.getRowModel().rows);

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center py-4 space-x-4">
        <Input
          placeholder="Search programs by title, faculty, location..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-md w-full"
        />

        {/* Global Filters */}
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

      <div className="rounded-lg overflow-hidden border border-gray-200 shadow-md">
        <Table className="min-w-full bg-white">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-100">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="py-2 text-center text-sm font-semibold text-gray-600"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
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
                      `/dashboard/applications/${row.original.application_id}`
                    )
                  } // Navigate on row click
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="py-3 text-sm text-gray-700 text-center align-middle"
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
                  className="h-24 text-center text-gray-500"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-4 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="text-sm"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="text-sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
