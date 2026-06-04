import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FacultySelect from "../src/components/FacultySelect";
import { Program, FacultyLead, SemesterType } from "../src/types/models";
// Mock ResizeObserver
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

// Mock logger
vi.mock("./Logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("FacultySelect Component", () => {
  // Mock data
  const mockFacultyLeads: FacultyLead[] = [
    { id: 1, display_name: "John Doe" },
    { id: 2, display_name: "Jane Smith" },
    { id: 3, display_name: "Bob Wilson" },
  ];

  const mockPrograms: Program[] = [
    {
      id: 1,
      faculty_leads: [mockFacultyLeads[0], mockFacultyLeads[1]],
      title: "Study Abroad in Japan",
      year: 2025,
      semester: SemesterType.Fall,
      location: "Tokyo, Japan",
      description:
        "An exciting opportunity to study in Japan and experience its rich culture.",
      start_date: "2025-09-01",
      end_date: "2025-12-15",
      open_date: "2025-01-01",
      deadline: "2025-06-01",
      essential_doc_deadline: "2025-06-01",
    },
    {
      id: 2,
      faculty_leads: [mockFacultyLeads[1], mockFacultyLeads[2]],
      title: "Summer Arts Program",
      year: 2024,
      semester: SemesterType.Summer,
      description:
        "An exciting opportunity to study in Japan and experience its rich culture.",
      location: "Paris, France",
      start_date: "2024-06-01",
      end_date: "2024-08-01",
      open_date: "2024-01-01",
      deadline: "2024-03-15",
      essential_doc_deadline: "2024-03-15",
    },
  ];

  const mockOnFacultySelect = vi.fn();

  beforeEach(() => {
    mockOnFacultySelect.mockClear();
  });

  it("renders with default state", () => {
    render(
      <FacultySelect
        programs={mockPrograms}
        onFacultySelect={mockOnFacultySelect}
      />
    );

    expect(screen.getByRole("combobox")).toHaveTextContent(
      "Select Faculty Lead"
    );
  });

  it("opens popover when clicked", async () => {
    render(
      <FacultySelect
        programs={mockPrograms}
        onFacultySelect={mockOnFacultySelect}
      />
    );

    const button = screen.getByRole("combobox");
    await userEvent.click(button);

    expect(
      screen.getByPlaceholderText("Search faculty...")
    ).toBeInTheDocument();
    expect(screen.getByText("All Faculty")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Wilson")).toBeInTheDocument();
  });

  it("filters faculty based on search input", async () => {
    render(
      <FacultySelect
        programs={mockPrograms}
        onFacultySelect={mockOnFacultySelect}
      />
    );

    const button = screen.getByRole("combobox");
    await userEvent.click(button);

    const searchInput = screen.getByPlaceholderText("Search faculty...");
    await userEvent.type(searchInput, "John");

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    expect(screen.queryByText("Bob Wilson")).not.toBeInTheDocument();
  });

  it("selects a faculty member when clicked", async () => {
    render(
      <FacultySelect
        programs={mockPrograms}
        onFacultySelect={mockOnFacultySelect}
      />
    );

    const button = screen.getByRole("combobox");
    await userEvent.click(button);

    const facultyOption = screen.getByText("John Doe");
    await userEvent.click(facultyOption);

    expect(mockOnFacultySelect).toHaveBeenCalledWith("1");
    expect(screen.getByRole("combobox")).toHaveTextContent("John Doe");
  });

  it("selects 'All Faculty' option", async () => {
    render(
      <FacultySelect
        programs={mockPrograms}
        onFacultySelect={mockOnFacultySelect}
      />
    );

    const button = screen.getByRole("combobox");
    await userEvent.click(button);

    const allFacultyOption = screen.getByText("All Faculty");
    await userEvent.click(allFacultyOption);

    expect(mockOnFacultySelect).toHaveBeenCalledWith("");
    expect(screen.getByRole("combobox")).toHaveTextContent(
      "Select Faculty Lead"
    );
  });

  it("shows 'No faculty found' when search has no results", async () => {
    render(
      <FacultySelect
        programs={mockPrograms}
        onFacultySelect={mockOnFacultySelect}
      />
    );

    const button = screen.getByRole("combobox");
    await userEvent.click(button);

    const searchInput = screen.getByPlaceholderText("Search faculty...");
    await userEvent.type(searchInput, "xyz");

    expect(screen.getByText("No faculty found.")).toBeInTheDocument();
  });

  it("removes duplicates from faculty list", async () => {
    // Create programs with duplicate faculty
    const programsWithDuplicates: Program[] = [
      {
        id: 1,
        faculty_leads: [mockFacultyLeads[0], mockFacultyLeads[1]],
        title: "Study Abroad in Japan",
        year: 2025,
        semester: SemesterType.Fall,
        location: "Tokyo, Japan",
        description:
          "An exciting opportunity to study in Japan and experience its rich culture.",
        start_date: "2025-09-01",
        end_date: "2025-12-15",
        open_date: "2025-01-01",
        deadline: "2025-06-01",
        essential_doc_deadline: "2025-06-01",
      },
      {
        id: 2,
        faculty_leads: [mockFacultyLeads[0], mockFacultyLeads[1]],
        title: "Summer Arts Program",
        year: 2024,
        semester: SemesterType.Summer,
        description:
          "An exciting opportunity to study in Japan and experience its rich culture.",
        location: "Paris, France",
        start_date: "2024-06-01",
        end_date: "2024-08-01",
        open_date: "2024-01-01",
        deadline: "2024-03-15",
        essential_doc_deadline: "2024-03-15",
      },
    ];

    render(
      <FacultySelect
        programs={programsWithDuplicates}
        onFacultySelect={mockOnFacultySelect}
      />
    );

    const button = screen.getByRole("combobox");
    await userEvent.click(button);

    // Should only show one instance of John Doe
    const johnDoeElements = screen.getAllByText("John Doe");
    expect(johnDoeElements).toHaveLength(1);
  });
});
