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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ApplicationStatus,
  SemesterType,
  FacultyLead,
  PartnerTableData,
  PaymentStatus,
} from "../types/models";
import { useRouter } from "next/navigation";
import logger from "../components/Logger";
import { useState } from "react";
import FacultySelect from "./FacultySelect";

export function PartnerProgramListTable({
  data,
}: {
  data: PartnerTableData[];
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = useState(
    "Current and Future Programs"
  );
  const [disableFacultySelect, setDisableFacultySelect] = useState(false);
  const router = useRouter();

  type PartnerTableDataValues =
    | number // for fields like program_id, application_id, year
    | string // for fields like title, location, faculty_leads, start_date, end_date, open_date, deadline
    | ApplicationStatus
    | PaymentStatus
    | FacultyLead
    | SemesterType;

  const columnNameMap = {
    id: "Program ID",
    title: "Title",
    year: "Year",
    semester: "Semester",
    location: "Location",
    faculty_leads: "Faculty Leads",
    start_date: "Start Date",
    end_date: "End Date",
    open_date: "Open Date",
    deadline: "Deadline",
    essential_doc_deadline: "Doc Deadline",
    payment_deadline: "Pay Deadline",
    approved_enrolled_count: "Approved & Enrolled",
    fully_paid_count: "Fully Paid",
  };

  const seasonOrder: Record<string, number> = { Spring: 1, Summer: 2, Fall: 3 };

  const customSeasonSort = (rowA: any, rowB: any, columnId: string) => {
    const seasonA =
      seasonOrder[rowA.getValue(columnId) as keyof typeof seasonOrder] || 99;
    const seasonB =
      seasonOrder[rowB.getValue(columnId) as keyof typeof seasonOrder] || 99;
    return seasonA - seasonB;
  };

  const columns: ColumnDef<PartnerTableData, PartnerTableDataValues>[] = [
    {
      accessorKey: "title", // This is fine for simple property access
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
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
      cell: ({ row }) => <div> {row.getValue("payment_deadline")}</div>,
    },
    {
      accessorKey: "approved_enrolled_count",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="flex gap-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Approved & Enrolled
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div> {row.getValue("approved_enrolled_count")}</div>,
    },
    {
      accessorKey: "fully_paid_count",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="flex gap-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Fully Paid
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div> {row.getValue("fully_paid_count")}</div>,
    },
  ];
  const customFilterFn: FilterFn<PartnerTableData> = (
    row,
    columnId,
    filterValue: string
  ) => {
    if (!filterValue) return true;

    const today = new Date();
    const data: PartnerTableData = row.original;
    const end_date = new Date(data.end_date);
    const open_date = new Date(data.open_date);
    const deadline = new Date(data.deadline);
    const start_date = new Date(data.start_date);

    // Default values
    let timeFilter = "currentFuture";
    let facultyFilter = "";

    // Parse the combined filter value
    if (filterValue.includes("|")) {
      const [timeValue, facultyValue] = filterValue.split("|");
      timeFilter = timeValue || "currentFuture";
      facultyFilter = facultyValue?.replace("faculty:", "").toLowerCase() || "";
    } else {
      // Single filter case
      if (filterValue.startsWith("faculty:")) {
        facultyFilter = filterValue.replace("faculty:", "").toLowerCase();
      } else {
        timeFilter = filterValue;
      }
    }

    // Time-based filtering
    let timeMatch = true;
    switch (timeFilter) {
      case "Current and Future Programs":
        timeMatch = end_date >= today;
        break;
      case "Application Open":
        timeMatch = open_date <= today && deadline >= today;
        break;
      case "In Review":
        timeMatch = deadline <= today && start_date >= today;
        break;
      case "Running Now":
        timeMatch = start_date <= today && end_date >= today;
        break;
      case "All Time":
        timeMatch = true;
        break;
      default:
        timeMatch = true;
    }

    // Faculty filtering
    let facultyMatch = true;
    if (facultyFilter) {
      facultyMatch = data.faculty_leads.some(
        (faculty) => faculty.id.toString() === facultyFilter
      );
    }

    return timeMatch && facultyMatch;
  };

  // Handler for faculty selection
  const handleFacultySelect = (faculty: string | null) => {
    const currentTimeFilter = globalFilter.split("|")[0] || "currentFuture";

    if (faculty) {
      setGlobalFilter(`${currentTimeFilter}|faculty:${faculty}`);
      logger.debug(`filter value: ${currentTimeFilter}|faculty:${faculty}`);
    } else {
      setGlobalFilter(currentTimeFilter);
      logger.debug("filter value " + currentTimeFilter);
    }
  };
  // Handler for time filter changes
  const handleTimeFilterChange = (timeValue: string) => {
    const currentFacultyFilter = globalFilter.includes("|")
      ? `|${globalFilter.split("|")[1]}`
      : "";
    logger.debug(`filter value: ${timeValue}${currentFacultyFilter}`);
    setGlobalFilter(`${timeValue}${currentFacultyFilter}`);
  };

  const getTimeFilterFromGlobal = (globalFilter: string) => {
    // Extract time portion from the global filter
    const timeValue =
      globalFilter?.split("|")[0] || "Current and Future Programs";
    return timeValue;
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

  return (
    <div className="w-full h-screen overflow-x-hidden">
      <div className="flex items-center py-4 space-x-4">
        <Input
          placeholder="Filter title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-xs"
        />

        {/* Global Filters */}
        <Select
          value={getTimeFilterFromGlobal(globalFilter)}
          onValueChange={handleTimeFilterChange}
        >
          <SelectTrigger aria-label="Filter by time">
            <SelectValue placeholder="Filter by time" />
          </SelectTrigger>
          <SelectContent className="justify-between">
            <SelectItem value="Current and Future Programs">
              Current and Future Programs
            </SelectItem>
            <SelectItem value="Application Open">Application Open</SelectItem>
            <SelectItem value="In Review">In Review</SelectItem>
            <SelectItem value="Running Now">Running Now</SelectItem>
            <SelectItem value="All Time">All Time</SelectItem>
          </SelectContent>
        </Select>
        {/* Faculty Select */}
        <FacultySelect
          programs={data}
          onFacultySelect={handleFacultySelect}
          disable={disableFacultySelect}
        />

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
                    router.push(`/partner/programs/${row.original.id}`)
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
