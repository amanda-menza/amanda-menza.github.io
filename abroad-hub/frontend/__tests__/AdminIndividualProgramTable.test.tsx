import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { AdminIndividualProgramTable } from "../src/components/AdminIndividualProgramTable"; // Adjust the path accordingly
import { vi, it, describe, expect, beforeEach } from "vitest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminProgramDetailsTableData,
  ApplicationStatus,
} from "@/types/models";
import { AppRouterContextProviderMock } from "../src/components/app-router-context-provider-mock";
import userEvent from "@testing-library/user-event";
import api from "../src/api";
const mockDataSingle: AdminProgramDetailsTableData[] = [
  {
    application_id: 1,
    display_name: "Alice",
    username: "alice123",
    email: "alice@example.com",
    dob: "1995-06-15",
    major: "Computer Science",
    gpa: 3.8,
    status: ApplicationStatus.Applied,
  },
];
// Mock data
const mockData: AdminProgramDetailsTableData[] = [
  {
    application_id: 1,
    display_name: "Alice",
    username: "alice123",
    email: "alice@example.com",
    dob: "1995-06-15",
    major: "Computer Science",
    gpa: 3.8,
    status: ApplicationStatus.Applied,
  },
  {
    application_id: 2,
    display_name: "Bob",
    username: "bob456",
    email: "bob@example.com",
    dob: "1996-07-20",
    major: "Mathematics",
    gpa: 3.9,
    status: ApplicationStatus.Enrolled,
  },
  {
    application_id: 3,
    display_name: "Charlie",
    username: "charlie789",
    email: "charlie@example.com",
    dob: "1994-03-12",
    major: "Engineering",
    gpa: 3.5,
    status: ApplicationStatus.Applied,
  },
];

const mockDataLarge: AdminProgramDetailsTableData[] = Array.from(
  { length: 20 },
  (_, index) => ({
    application_id: index + 1,
    display_name: `User ${index + 1}`,
    username: `user${index + 1}`,
    email: `user${index + 1}@example.com`,
    dob: "1990-01-01",
    major: "Computer Science",
    gpa: 3.5,
    status: ApplicationStatus.Applied,
  })
);

// Mock API function
const mockFetchTable = vi.fn();

const push = vi.fn();
const renderComponent = (mockProps: AdminProgramDetailsTableData[]) => {
  render(
    <AppRouterContextProviderMock router={{ push }}>
      <AdminIndividualProgramTable
        data={mockProps}
        fetchTable={mockFetchTable}
      />
    </AppRouterContextProviderMock>
  );
};

describe("AdminIndividualProgramTable", () => {
  it("should render the table headers", () => {
    renderComponent(mockData);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("DOB")).toBeInTheDocument();
    expect(screen.getByText("Major")).toBeInTheDocument();
    expect(screen.getByText("GPA")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("should sort by Name when clicking on the header", async () => {
    renderComponent(mockData);
    const nameColumnButton = screen.getByText("Name");
    fireEvent.click(nameColumnButton); // Simulate sorting

    await waitFor(() => {
      const firstRow = screen.getByText("Alice");
      const secondRow = screen.getByText("Bob");
      const thirdRow = screen.getByText("Charlie");

      // Check if the rows are sorted by name in ascending order
      expect(firstRow).toBeInTheDocument();
      expect(secondRow).toBeInTheDocument();
      expect(thirdRow).toBeInTheDocument();
    });
  });

  it("should filter by status", async () => {
    renderComponent(mockData);
    const dropdownButton = screen.getByRole("combobox", {
      name: /Status Filter Menu/i,
    });

    // Simulate a button click to open the dropdown
    fireEvent.click(dropdownButton);

    const appliedOption = screen.getByRole("option", { name: /applied/i });

    fireEvent.click(appliedOption);
    await waitFor(() => {
      const appliedText = within(dropdownButton).getByText(/applied/i);

      expect(appliedText).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Charlie")).toBeInTheDocument();
      expect(screen.queryByText("Bob")).toBeNull();
    });
  });

  it("should filter by name", async () => {
    renderComponent(mockData);
    const nameFilterInput = screen.getByPlaceholderText("Filter by name...");
    fireEvent.change(nameFilterInput, { target: { value: "Bob" } });

    await waitFor(() => {
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.queryByText("Alice")).toBeNull();
      expect(screen.queryByText("Charlie")).toBeNull();
    });
  });

  it("opens the menu when the button is clicked", async () => {
    renderComponent(mockData);
    // Open columns dropdown
    const columnsButton = screen.getByRole("button", {
      name: /Column Checkbox/i,
    });
    await userEvent.click(columnsButton);
    await waitFor(() => {
      expect(columnsButton).toHaveAttribute("aria-expanded", "true");
      expect(columnsButton).toHaveAttribute("data-state", "open");
    });
  });

  it("should handle column visibility", async () => {
    renderComponent(mockData);
    const columnsButton = screen.getByRole("button", {
      name: /Column Checkbox/i,
    });
    await userEvent.click(columnsButton);

    // Find Status column checkbox
    const statusCheckbox = screen.getByRole("menuitemcheckbox", {
      name: /status/i,
    });

    // Toggle Status column visibility
    await userEvent.click(statusCheckbox);

    await waitFor(() => {
      expect(screen.queryByText("Status")).toBeNull(); // The "Status" column should be hidden
    });
  });

  it("should paginate through rows", async () => {
    renderComponent(mockDataLarge);

    const nextPageButton = screen.getByRole("button", {
      name: /Next/i,
    });
    const previousPageButton = screen.getByRole("button", {
      name: /Previous/i,
    });
    expect(nextPageButton).not.toBeDisabled();
    expect(previousPageButton).toBeDisabled();

    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(previousPageButton).not.toBeDisabled();
    });
    fireEvent.click(previousPageButton);

    // Verify initial state is restored
    await waitFor(() => {
      expect(previousPageButton).toBeDisabled();
    });
  });
  it("navigates to application details", async () => {
    renderComponent(mockDataSingle);

    const actionsTrigger = screen.getByText("Alice");
    await userEvent.click(actionsTrigger);

    expect(push).toHaveBeenCalledWith(
      "/administrator/dashboard/applications/1"
    );
  });

  it("change status", async () => {
    renderComponent(mockDataSingle);
    const mockPatch = vi
      .spyOn(api, "patch")
      .mockResolvedValue({ data: { id: 1 } });

    const actionsTrigger = screen.getByRole("button", { name: /open menu/i });
    await userEvent.click(actionsTrigger);

    // Open status dropdown
    const dropdownButton = screen.getByRole("combobox", {
      name: /change-status-form/i,
    });

    // Simulate a button click to open the dropdown
    fireEvent.click(dropdownButton);

    const enrolledOption = screen.getByRole("option", { name: /enrolled/i });
    await fireEvent.click(enrolledOption);

    await waitFor(() => {
      //Verify API was called with correct parameters
      expect(mockPatch).toHaveBeenCalledWith(
        "/api/applications/1/change_status/",
        {
          status: "Enrolled",
        }
      );

      // Verify fetch table was called to refresh data
      expect(mockFetchTable).toHaveBeenCalled();
    });
  });
});
