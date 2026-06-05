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
import { ArrowUpDown, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
  AdminTableData,
  SemesterType,
  FacultyLead,
  UserRoles,
} from "../types/models";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import logger from "../components/Logger";
import FacultySelect from "@/components/FacultySelect";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { getStoredUserData } from "@/lib/utils";

export function AdminProgramTable({ data }: { data: AdminTableData[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = useState(
    "Current and Future Programs"
  );
  const [disableFacultySelect, setDisableFacultySelect] = useState(false);
  const user = getStoredUserData();
  const router = useRouter();

  const columnNameMap = {
    applied_count: "Applied",
    enrolled_count: "Enrolled",
    approved_count: "Approved",
    withdrawn_count: "Withdrawn",
    canceled_count: "Canceled",
    active_count: "Active",
    completed_count: "Completed",
    eligible_count: "Eligible",
    id: "ID",
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
    payment_deadline: "Pay Deadline",
  };
  // Set column visibility to false by default
  const defaultColumnVisibility = {
    applied_count: false,
    enrolled_count: false,
    approved_count: false,
    withdrawn_count: false,
    canceled_count: false,
    active_count: true,
    completed_count: false,
    eligible_count: false,
    title: true,
    year: true,
    semester: true,
    location: true,
    faculty_leads: true,
    start_date: true,
    end_date: true,
    open_date: true,
    deadline: true,
    essential_doc_deadline: true,
    payment_deadline: true,
  };
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(defaultColumnVisibility);
  type AdminTableDataValues =
    | number // for fields like applied_count, enrolled_count, etc.
    | string
    | FacultyLead // for fields like title, location, etc.
    | SemesterType; // for the semester field

  const seasonOrder: Record<string, number> = { Spring: 1, Summer: 2, Fall: 3 };

  const customSeasonSort = (rowA: any, rowB: any, columnId: string) => {
    const seasonA =
      seasonOrder[rowA.getValue(columnId) as keyof typeof seasonOrder] || 99;
    const seasonB =
      seasonOrder[rowB.getValue(columnId) as keyof typeof seasonOrder] || 99;
    return seasonA - seasonB;
  };

  const columns: ColumnDef<AdminTableData, AdminTableDataValues>[] = [
    {
      accessorKey: "title", // This is fine for simple property access
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-0"
          onClick={() => {
            column.toggleSorting(column.getIsSorted() === "asc");
          }}
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
      accessorKey: "location",
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
          Start Date
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
          End Date
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
          Open Date
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
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Pay Deadline
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const trackPayment = row.original.track_payment;

        if (!trackPayment) {
          return <div>-</div>;
        } else {
          return <div>{row.getValue("payment_deadline")}</div>;
        }
      },
    },
    {
      accessorKey: "active_count",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="flex gap-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Active
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div> {row.getValue("active_count")}</div>,
    },
    {
      accessorKey: "applied_count",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="flex gap-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Applied
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("applied_count")}</div>,
    },
    {
      accessorKey: "eligible_count",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="flex gap-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Eligible
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("eligible_count")}</div>,
    },
    {
      accessorKey: "approved_count",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="flex gap-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Approved
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("approved_count")}</div>,
    },
    {
      accessorKey: "enrolled_count",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="flex gap-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Enrolled
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("enrolled_count")}</div>,
    },
    {
      accessorKey: "withdrawn_count",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="flex gap-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Withdrawn
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("withdrawn_count")}</div>,
    },
    {
      accessorKey: "canceled_count",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="flex gap-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Cancelled
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("canceled_count")}</div>,
    },
    {
      accessorKey: "completed_count",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="flex gap-0"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Completed
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("completed_count")}</div>,
    },
  ];

  const customFilterFn: FilterFn<AdminTableData> = (
    row,
    columnId,
    filterValue: string
  ) => {
    if (!filterValue) return true;

    const today = new Date();
    const data: AdminTableData = row.original;
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

  const applicationCountColumns = [
    "applied_count",
    "eligible_count",
    "approved_count",
    "enrolled_count",
    "withdrawn_count",
    "canceled_count",
    "completed_count",
  ];

  // Your component code...

  const [showApplicationCounts, setShowApplicationCounts] = useState(false);

  // Use column.toggleVisibility directly for each column
  const handleShowApplicationCounts = (state: boolean) => {
    setShowApplicationCounts(state);

    applicationCountColumns.forEach((colId) => {
      const column = table.getColumn(colId);
      if (column) {
        const currentVisibility = column.getIsVisible();
        if (currentVisibility !== state) {
          column.toggleVisibility();
        }
      }
    });
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
        {/* Faculty Toggle - Filter by Current User's Faculty */}
        {user.roles.includes(UserRoles.Faculty) ? (
          <div className="flex items-center space-x-2">
            <Switch
              id="faculty-filter"
              onCheckedChange={(checked) => {
                if (checked) {
                  setDisableFacultySelect(true);
                  handleFacultySelect(user.id);
                } else {
                  // When toggled off, clear the faculty filter
                  handleFacultySelect("");
                  setDisableFacultySelect(false);
                }
              }}
            />
            <Label htmlFor="faculty-filter">My Programs</Label>
          </div>
        ) : null}

        {/* Show Application Counts */}
        <div className="flex items-center space-x-2">
          <Switch
            id="application-counts"
            onCheckedChange={handleShowApplicationCounts}
          />
          <Label htmlFor="application-counts">Application Counts</Label>
        </div>
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
                const isAppCountColumn = applicationCountColumns.includes(
                  column.id
                );

                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={
                      isAppCountColumn
                        ? showApplicationCounts
                        : column.getIsVisible()
                    }
                    onCheckedChange={(value) => {
                      if (isAppCountColumn) {
                        column.toggleVisibility(!!value);

                        const allAppCountCols = applicationCountColumns.map(
                          (id) => table.getColumn(id)?.getIsVisible() ?? false
                        );

                        if (allAppCountCols.every((v) => v === true)) {
                          setShowApplicationCounts(true);
                        } else if (allAppCountCols.every((v) => v === false)) {
                          setShowApplicationCounts(false);
                        }
                      } else {
                        column.toggleVisibility(!!value);
                      }
                    }}
                  >
                    {columnNameMap[column.id as keyof typeof columnNameMap]}{" "}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-lg overflow-hidden border border-gray-200 shadow-md">
        <Table className="w-full table-auto">
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
                  className="text-center text-gray-900 hover:dark:text-gray-100 bg-gray-50 cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/administrator/dashboard/programs/${row.original.id}`
                    )
                  }
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
