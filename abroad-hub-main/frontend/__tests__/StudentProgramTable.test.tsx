import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StudentProgramTable } from "../src/components/StudentProgramTable";
import { vi, describe, it, expect } from "vitest";
import {
  StudentTableData,
  SemesterType,
  ApplicationStatus,
} from "../src/types/models";
import { AppRouterContextProviderMock } from "../src/components/app-router-context-provider-mock";
import userEvent from "@testing-library/user-event";
import { StatusBadge } from "@/components/StatusBadge";

const mockDataLarge: StudentTableData[] = Array.from(
  { length: 20 },
  (_, index) => ({
    program_id: 1 + index,
    application_id: 100 + index,
    title: "Study Abroad in Tokyo",
    year: 2025,
    location: "tokyo",

    semester: SemesterType.Fall,
    faculty_leads: "Dr. Tanaka",
    start_date: "2025-09-01",
    end_date: "2025-12-15",
    open_date: "2025-01-15",
    deadline: "2025-04-30",
    status: ApplicationStatus.Applied,
  })
);

const mockDataSingle: StudentTableData[] = [
  {
    program_id: 1,
    application_id: 100,
    title: "Study Abroad in Tokyo",
    year: 2025,
    location: "tokyo",
    semester: SemesterType.Fall,
    faculty_leads: "Dr. Tanaka",
    start_date: "2025-09-01",
    end_date: "2025-12-15",
    open_date: "2025-01-15",
    deadline: "2025-04-30",
    status: ApplicationStatus.Applied,
  },
];

const mockData: StudentTableData[] = [
  {
    program_id: 1,
    application_id: 100,
    title: "Study Abroad in Tokyo",
    year: 2026,
    location: "tokyo",
    semester: SemesterType.Fall,
    faculty_leads: "Dr. Tanaka",
    start_date: "2026-09-01",
    end_date: "2026-12-15",
    open_date: "2026-01-15",
    deadline: "2026-04-30",
    status: ApplicationStatus.Applied,
  },
  {
    program_id: 2,
    application_id: 101,
    title: "Summer Arts Program",
    year: 2026,
    location: "france",

    semester: SemesterType.Summer,
    faculty_leads: "Prof. Monet",
    start_date: "2026-06-01",
    end_date: "2026-08-01",
    open_date: "2026-01-01",
    deadline: "2026-03-15",
    status: ApplicationStatus.Applied,
  },
  {
    program_id: 3,
    application_id: 102,
    title: "Engineering Innovations",
    year: 2026,
    location: "germany",

    semester: SemesterType.Fall,
    faculty_leads: "Dr. Fischer",
    start_date: "2026-01-10",
    end_date: "2026-05-15",
    open_date: "2026-09-01",
    deadline: "2026-12-01",
    status: ApplicationStatus.Withdrawn,
  },
];

const push = vi.fn();

// Helper function to render the component
const renderComponent = (dataMock: StudentTableData[]) => {
  render(
    <AppRouterContextProviderMock router={{ push }}>
      <StudentProgramTable data={dataMock} />
    </AppRouterContextProviderMock>
  );
};

describe("StudentProgramTable Component", () => {
  it("renders table headers", () => {
    renderComponent(mockData);

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Year")).toBeInTheDocument();
    expect(screen.getByText("Semester")).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();

    expect(screen.getByText("Faculty")).toBeInTheDocument();
    expect(screen.getByText("Start Date")).toBeInTheDocument();
    expect(screen.getByText("End Date")).toBeInTheDocument();
  });

  it("filters programs by title", async () => {
    renderComponent(mockData);

    const filterInput = screen.getByPlaceholderText("Filter title...");
    fireEvent.change(filterInput, { target: { value: "Tokyo" } });

    await waitFor(() => {
      expect(screen.getByText("Study Abroad in Tokyo")).toBeInTheDocument();
      expect(screen.queryByText("Summer Arts Program")).toBeNull();
      expect(screen.queryByText("Engineering Innovations")).toBeNull();
    });
  });

  it("filters programs by faculty", async () => {
    renderComponent(mockData);

    const filterInput = screen.getByPlaceholderText("Filter faculty...");
    fireEvent.change(filterInput, { target: { value: "Fischer" } });

    await waitFor(() => {
      expect(screen.queryByText("Study Abroad in Tokyo")).toBeNull();
      expect(screen.getByText("Engineering Innovations")).toBeInTheDocument();
      expect(screen.queryByText("Summer Arts Program")).toBeNull();
    });
  });

  it("handles column visibility toggle", async () => {
    renderComponent(mockData);

    const columnToggleButton = screen.getByRole("button", { name: /Columns/i });
    await userEvent.click(columnToggleButton);

    const yearCheckbox = screen.getByRole("menuitemcheckbox", {
      name: /year/i,
    });
    await userEvent.click(yearCheckbox);

    await waitFor(() => {
      expect(screen.queryByText("Year")).toBeNull();
    });
  });

  it("handles pagination correctly", async () => {
    renderComponent(mockDataLarge);

    const nextPageButton = screen.getByRole("button", { name: /next/i });
    const prevPageButton = screen.getByRole("button", { name: /previous/i });

    expect(nextPageButton).not.toBeDisabled();
    expect(prevPageButton).toBeDisabled();

    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(prevPageButton).not.toBeDisabled();
    });

    fireEvent.click(prevPageButton);

    await waitFor(() => {
      expect(prevPageButton).toBeDisabled();
    });
  });

  it("navigates to application details", async () => {
    renderComponent(mockDataSingle);

    const actionsTrigger = screen.getByRole("button", { name: /Open menu/i });
    await userEvent.click(actionsTrigger);

    const viewApplicationButton = screen.getByText("View Application");
    await userEvent.click(viewApplicationButton);
    expect(push).toHaveBeenCalledWith("/dashboard/applications/100");
  });

  it("navigates to program details", async () => {
    renderComponent(mockDataSingle);

    const actionsTrigger = screen.getByText("Study Abroad in Tokyo");
    await userEvent.click(actionsTrigger);
    expect(push).toHaveBeenCalledWith("/dashboard/applications/100");
  });

  it("sorts table by title", async () => {
    renderComponent(mockData);

    const titleHeader = screen.getByText("Title");
    await userEvent.click(titleHeader);

    // Add assertions for sorting if needed
  });
});
