import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { AdminProgramTable } from "../src/components/AdminProgramTable";
import { vi, describe, it, expect } from "vitest";
import { AdminTableData, Program, SemesterType } from "../src/types/models";
import { AppRouterContextProviderMock } from "../src/components/app-router-context-provider-mock";
import userEvent from "@testing-library/user-event";

global.ResizeObserver = class ResizeObserver {
  constructor(callback: any) {}
  observe(target: any) {}
  unobserve(target: any) {}
  disconnect() {}
};
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock IntersectionObserver with correct type definitions
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {}

  observe(target: Element): void {}
  unobserve(target: Element): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

global.IntersectionObserver = MockIntersectionObserver;

const mockDataLarge: AdminTableData[] = Array.from(
  { length: 20 },
  (_, index) => ({
    applied_count: 50,
    enrolled_count: 30,
    withdrawn_count: 5,
    canceled_count: 2,
    active_count: 23,
    complete_count: 10,
    eligible_count: 2,
    approved_count: 3,
    id: 1 + index,
    title: "Study Abroad in Tokyo",
    year: 2025,
    semester: SemesterType.Fall,
    location: "Tokyo, Japan",
    faculty_leads: [{ id: 1, display_name: "Dr. Tanaka" }],
    start_date: "2025-09-01",
    end_date: "2025-12-15",
    open_date: "2025-01-15",
    deadline: "2025-04-30",
    essential_doc_deadline: "2025-04-30",
  })
);

const mockDataSingle: AdminTableData[] = [
  {
    applied_count: 50,
    enrolled_count: 30,
    withdrawn_count: 5,
    canceled_count: 2,
    active_count: 95,
    complete_count: 10,
    eligible_count: 2,
    approved_count: 3,
    id: 1,
    title: "Study Abroad in Tokyo",
    year: 2025,
    semester: SemesterType.Fall,
    location: "Tokyo, Japan",
    faculty_leads: [{ id: 1, display_name: "Dr. Tanaka" }],
    start_date: "2025-09-01",
    end_date: "2025-12-15",
    open_date: "2025-01-15",
    deadline: "2025-04-30",
    essential_doc_deadline: "2025-04-30",
  },
];

// Mock data
const mockDataDeadlines: AdminTableData[] = [
  {
    applied_count: 50,
    enrolled_count: 30,
    withdrawn_count: 5,
    canceled_count: 2,
    active_count: 95,
    complete_count: 10,
    eligible_count: 2,
    approved_count: 3,
    id: 1,
    title: "Study Abroad in Tokyo",
    year: 2025,
    semester: SemesterType.Fall,
    location: "Tokyo, Japan",
    faculty_leads: [{ id: 1, display_name: "Dr. Tanaka" }],
    start_date: "2025-09-01",
    end_date: "2025-12-15",
    open_date: "2025-01-15",
    deadline: "2025-04-30",
    essential_doc_deadline: "2025-04-30",
  },
  {
    applied_count: 40,
    enrolled_count: 25,
    withdrawn_count: 8,
    canceled_count: 3,
    active_count: 20,
    complete_count: 1,
    approved_count: 1,
    eligible_count: 1,
    id: 2,
    title: "Summer Arts Program",
    year: 2024,
    semester: SemesterType.Summer,
    location: "Paris, France",
    faculty_leads: [{ id: 1, display_name: "Prof. Monet" }],
    start_date: "2024-06-01",
    end_date: "2024-08-01",
    open_date: "2024-01-01",
    deadline: "2024-03-15",
    essential_doc_deadline: "2024-03-15",
  },
  {
    applied_count: 30,
    enrolled_count: 20,
    withdrawn_count: 3,
    canceled_count: 1,
    active_count: 16,
    complete_count: 1,
    approved_count: 1,
    eligible_count: 1,
    id: 3,
    title: "Engineering Innovations",
    year: 2025,
    semester: SemesterType.Spring,
    location: "Berlin, Germany",
    faculty_leads: [{ id: 1, display_name: "Dr. Fischer" }],
    start_date: "2025-01-10",
    end_date: "2025-05-15",
    open_date: "2024-09-01",
    deadline: "2024-12-01",
    essential_doc_deadline: "2024-12-01",
  },
];

const mockData: AdminTableData[] = [
  {
    applied_count: 50,
    enrolled_count: 30,
    withdrawn_count: 5,
    canceled_count: 2,
    active_count: 23,
    complete_count: 1,
    approved_count: 1,
    eligible_count: 1,
    id: 1,
    title: "Study Abroad in Tokyo",
    year: 2026,
    semester: SemesterType.Fall,
    location: "Tokyo, Japan",
    faculty_leads: [{ id: 1, display_name: "Dr. Tanaka" }],
    start_date: "2026-09-01",
    end_date: "2026-12-15",
    open_date: "2026-01-15",
    deadline: "2026-04-30",
    essential_doc_deadline: "2026-12-01",
  },
  {
    applied_count: 40,
    enrolled_count: 25,
    withdrawn_count: 8,
    canceled_count: 3,
    active_count: 20,
    complete_count: 1,
    approved_count: 1,
    eligible_count: 1,
    id: 2,
    title: "Summer Arts Program",
    year: 2026,
    semester: SemesterType.Summer,
    location: "Paris, France",
    faculty_leads: [{ id: 1, display_name: "Prof. Monet" }],
    start_date: "2026-06-01",
    end_date: "2026-08-01",
    open_date: "2026-01-01",
    deadline: "2026-03-15",
    essential_doc_deadline: "2026-03-15",
  },
  {
    applied_count: 30,
    enrolled_count: 20,
    withdrawn_count: 3,
    canceled_count: 1,
    active_count: 16,
    complete_count: 1,
    approved_count: 1,
    eligible_count: 1,
    id: 3,
    title: "Engineering Innovations",
    year: 2026,
    semester: SemesterType.Spring,
    location: "Berlin, Germany",
    faculty_leads: [{ id: 1, display_name: "Dr. Fischer" }],
    start_date: "2026-01-10",
    end_date: "2026-05-15",
    open_date: "2026-09-01",
    deadline: "2026-12-01",
    essential_doc_deadline: "2026-12-01",
  },
];

const push = vi.fn();
// Helper function to render the component
const renderComponent = (dataMock: AdminTableData[]) => {
  render(
    <AppRouterContextProviderMock router={{ push }}>
      <AdminProgramTable data={dataMock} />
    </AppRouterContextProviderMock>
  );
};

describe("AdminProgramTable Component", () => {
  it("renders table headers", () => {
    renderComponent(mockData);

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Year")).toBeInTheDocument();
    expect(screen.getByText("Semester")).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("Faculty")).toBeInTheDocument();
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
  //@TODO: FIX
  it("filters programs by faculty", async () => {
    renderComponent(mockData);

    //const button = screen.getByText("Select Faculty Lead");
    const button = screen.getByRole("combobox", {
      name: /Filter by faculty/i,
    });
    await userEvent.click(button);
    const facultyOption = screen.getByText("Dr. Fischer");
    await userEvent.click(facultyOption);
  });

  it("should filter by time", async () => {
    renderComponent(mockDataDeadlines);
    expect(screen.getByText("Study Abroad in Tokyo")).toBeInTheDocument();
    expect(screen.queryByText("Summer Arts Program")).toBeNull();
    expect(screen.getByText("Engineering Innovations")).toBeInTheDocument();
    const dropdownButton = screen.getByRole("combobox", {
      name: /Filter by time/i,
    });

    // Simulate a button click to open the dropdown
    fireEvent.click(dropdownButton);

    const allTime = screen.getByRole("option", { name: /All Time/i });

    fireEvent.click(allTime);
    await waitFor(() => {
      const text = within(dropdownButton).getByText(/all time/i);

      expect(text).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Study Abroad in Tokyo")).toBeInTheDocument();
      expect(screen.getByText("Summer Arts Program")).toBeInTheDocument();
      expect(screen.getByText("Engineering Innovations")).toBeInTheDocument();
    });
  });

  it("handles column visibility toggle", async () => {
    renderComponent(mockData);

    const columnToggleButton = screen.getByRole("button", {
      name: /column checkbox/i,
    });
    await userEvent.click(columnToggleButton);

    const locationCheckbox = screen.getByRole("menuitemcheckbox", {
      name: /year/i,
    });
    await userEvent.click(locationCheckbox);

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
  it("navigates to program details", async () => {
    renderComponent(mockDataSingle);

    const actionsTrigger = screen.getByText("Study Abroad in Tokyo");
    await userEvent.click(actionsTrigger);

    expect(push).toHaveBeenCalledWith("/administrator/dashboard/programs/1");
  });

  it("sorts table by title in ascending order", async () => {
    renderComponent(mockData);
  });

  it("sorts table by title in descending order", async () => {
    renderComponent(mockData);
  });
});
