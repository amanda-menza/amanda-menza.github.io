import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  RenderResult,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock, afterEach } from "vitest";
import Programs from "../src/app/dashboard/programs/page";
import api from "../src/api";
import { AppRouterContextProviderMock } from "../src/components/app-router-context-provider-mock";
import {
  StudentProgramBrowseType,
  SemesterType,
  ApplicationStatus,
  FacultyLead,
} from "../src/types/models";
import { checkDeadlinePassed, isStudent } from "@/lib/utils";
import userEvent from "@testing-library/user-event";

// Mock the API module
vi.mock("../src/api");
vi.mock("@/lib/utils", () => ({
  getStoredUserData: vi.fn().mockReturnValue({ user_type: "Student" }), // or mock null here
  isStudent: vi.fn(),
  cn: (...args: any) => args.filter(Boolean).join(" "),
  checkDeadlinePassed: vi.fn().mockReturnValue(false),
  checkAppIsOpen: vi.fn().mockReturnValue(true),
}));
const mockFaculty1: FacultyLead[] = [
  {
    id: 1,
    display_name: "Dr. Smith",
  },
];

const mockFaculty2: FacultyLead[] = [
  {
    id: 2,
    display_name: "Dr. Johnson",
  },
];

const mockPrograms: StudentProgramBrowseType[] = [
  {
    id: 1,
    title: "Study in Paris",
    location: "Paris, France",
    year: 2025,
    semester: SemesterType.Fall,
    start_date: "2025-09-01",
    end_date: "2025-12-15",
    faculty_leads: mockFaculty1,
    open_date: "2025-01-01",
    deadline: "2025-06-01",
    essential_doc_deadline: "2025-08-01",
    description: "Study abroad in Paris",
    has_applied: false,
    application_id: 0,
    application_status: ApplicationStatus.Not_Applied,
  },
  {
    id: 2,
    title: "Tokyo Exchange",
    location: "Tokyo, Japan",
    year: 2026,
    semester: SemesterType.Spring,
    start_date: "2026-03-01",
    end_date: "2026-07-15",
    faculty_leads: mockFaculty2,
    open_date: "2025-09-01",
    deadline: "2025-12-01",
    essential_doc_deadline: "2026-02-01",
    description: "Exchange program in Tokyo",
    has_applied: true,
    application_id: 123,
    application_status: ApplicationStatus.Applied,
  },
];

describe("Programs Component", () => {
  const push = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup the mock implementation with specific endpoint
    (api.get as Mock).mockImplementation((url: string) => {
      if (url === "/api/programs-student-list/") {
        return Promise.resolve({ data: mockPrograms });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });
    (isStudent as Mock).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = async (): Promise<RenderResult> => {
    let result: RenderResult;

    await act(async () => {
      result = render(
        <AppRouterContextProviderMock router={{ push }}>
          <Programs />
        </AppRouterContextProviderMock>
      );
    });

    // Wait for any state updates to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    return result!;
  };

  it("renders program list successfully", async () => {
    // Setup API mock spy
    const getSpy = vi.spyOn(api, "get");

    const result = await renderComponent();

    // Wait for the programs to be rendered
    await waitFor(
      () => {
        expect(getSpy).toHaveBeenCalledWith("/programs-student-list/");
        const parisProgram = screen.queryByText("Study in Paris");
        const tokyoProgram = screen.queryByText("Tokyo Exchange");

        if (!parisProgram || !tokyoProgram) {
          throw new Error("Programs not found");
        }

        expect(parisProgram).toBeInTheDocument();
        expect(tokyoProgram).toBeInTheDocument();
        expect(screen.queryAllByText(/When/i)).not.toHaveLength(0);
        expect(screen.queryAllByText(/Start Date/i)).not.toHaveLength(0);
        expect(screen.queryAllByText(/End Date/i)).not.toHaveLength(0);
        expect(screen.queryAllByText(/Faculty Leads/i)).not.toHaveLength(0);
        expect(
          screen.queryAllByText(/Application Open Date/i)
        ).not.toHaveLength(0);
        expect(screen.queryAllByText(/Application Deadline/i)).not.toHaveLength(
          0
        ); // Faculty lead
        expect(
          screen.queryAllByText(/Essential Document Deadline/i)
        ).not.toHaveLength(0);
        expect(screen.queryAllByText(/Description/i)).not.toHaveLength(0);
        expect(screen.queryAllByText(/View Details/i)).not.toHaveLength(0);
        expect(screen.queryAllByText(/Apply/i)).not.toHaveLength(0);
        expect(screen.queryAllByText(/Applied/i)).not.toHaveLength(0);
      },
      { timeout: 3000 }
    ); // Increased timeout
  });

  it("filters programs based on search query", async () => {
    await renderComponent();

    await waitFor(
      () => {
        expect(screen.getByText("Study in Paris")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const searchInput = screen.getByPlaceholderText(
      "Search programs by title..."
    );

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "Tokyo" } });
    });

    await waitFor(() => {
      expect(screen.queryByText("Study in Paris")).not.toBeInTheDocument();
      expect(screen.getByText("Tokyo Exchange")).toBeInTheDocument();
    });
  });

  it("displays application status for applied programs", async () => {
    await renderComponent();

    await waitFor(
      () => {
        expect(screen.getByText("Applied")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
  it("toggles the 'Show Passed Deadlines' switch and filters programs", async () => {
    // Mock the checkDeadlinePassed to return specific values
    (checkDeadlinePassed as Mock).mockImplementation((deadline: string) => {
      return true;
    });

    // Render the component
    renderComponent();
    await waitFor(() => {
      expect(screen.queryByText("Tokyo Exchange")).not.toBeInTheDocument();
      expect(screen.queryByText("Study in Paris")).not.toBeInTheDocument();
      expect(screen.getByText("No Available Programs")).toBeInTheDocument();
    });
    // Simulate toggling the "Show Passed Deadlines" switch to true
    const toggleButton = screen.getByLabelText("Show Passed Deadlines");
    userEvent.click(toggleButton); // Toggle to show past deadlines

    await waitFor(() => {
      expect(screen.getByText("Tokyo Exchange")).toBeInTheDocument();
      expect(screen.getByText("Study in Paris")).toBeInTheDocument();
    });
    // Simulate toggling the "Show Passed Deadlines" switch to false
  });
});
