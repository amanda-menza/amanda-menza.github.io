import { render, screen, waitFor } from "@testing-library/react";
import ProgramDetail from "../src/app/dashboard/programs/[id]/page";
import { vi, expect, it, describe, beforeEach, Mock } from "vitest";
import api from "../src/api";
import { useParams } from "next/navigation";
import { ApplicationStatus, SemesterType } from "../src/types/models";

vi.mock("../../../../api");
vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
}));
const mockCheckAppIsOpen = vi.fn().mockReturnValue(true);
const mockCheckDeadlinePassed = vi.fn().mockReturnValue(false);
vi.mock("../../../../lib/utils", () => ({
  checkAppIsOpen: mockCheckAppIsOpen,
  checkDeadlinePassed: mockCheckDeadlinePassed,
}));

describe("ProgramDetail Component", () => {
  const mockProgram = {
    id: 1,
    title: "Study Abroad Program",
    location: "Paris, France",
    year: "2025",
    semester: SemesterType.Fall,
    faculty_leads: [{ id: 1, display_name: "Dr. Smith" }],
    start_date: "2025-09-01",
    end_date: "2025-12-15",
    open_date: "2025-01-01",
    deadline: "2025-06-01",
    essential_doc_deadline: "2025-06-01",
    description: "An amazing opportunity to study in Paris.",
  };
  const mockProgramDeadlinePassed = {
    id: 1,
    title: "Study Abroad Program",
    location: "Paris, France",
    year: "2025",
    semester: SemesterType.Fall,
    faculty_leads: [{ id: 1, display_name: "Dr. Smith" }],
    start_date: "2025-09-01",
    end_date: "2025-12-15",
    open_date: "2025-01-01",
    deadline: "2025-01-01",
    essential_doc_deadline: "2025-06-01",
    description: "An amazing opportunity to study in Paris.",
  };
  const mockProgramNotOpen = {
    id: 1,
    title: "Study Abroad Program",
    location: "Paris, France",
    year: "2025",
    semester: SemesterType.Fall,
    faculty_leads: [{ id: 1, display_name: "Dr. Smith" }],
    start_date: "2026-09-01",
    end_date: "2026-12-15",
    open_date: "2026-01-01",
    deadline: "2026-06-01",
    essential_doc_deadline: "2025-06-01",
    description: "An amazing opportunity to study in Paris.",
  };

  const mockAppStatus = {
    id: 42,
    has_application: false,
    application_status: ApplicationStatus.Not_Applied,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useParams as Mock).mockReturnValue({ id: "1" });
    const mockGet = vi.spyOn(api, "get").mockImplementation((url) => {
      if (url === "/programs/1/") {
        return Promise.resolve({ data: mockProgram }); // Mock response for program data
      }
      if (url === "/check-application/1/") {
        return Promise.resolve({ data: mockAppStatus }); // Mock response for application status
      }
      return Promise.reject(new Error("Unexpected URL")); // Handle unexpected calls
    });
  });

  it("renders loading state initially", () => {
    render(<ProgramDetail />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("renders program details and application status after fetching data", async () => {
    render(<ProgramDetail />);

    await waitFor(() => {
      expect(screen.getByText(/Study Abroad Program/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Paris, France/i)).toBeInTheDocument();
    expect(screen.getByText(/2025 Fall/i)).toBeInTheDocument();
    expect(screen.getByText(/Dr. Smith/i)).toBeInTheDocument();
    expect(screen.getByText(/2025-09-01/i)).toBeInTheDocument();
    expect(screen.getByText(/2025-12-15/i)).toBeInTheDocument();
    expect(
      screen.getByText(/An amazing opportunity to study in Paris./i)
    ).toBeInTheDocument();

    const statusBadge = screen.getByText(/Apply/i);
    expect(statusBadge).toBeInTheDocument();
  });

  it("renders 'No Program Info Available' when data is missing", async () => {
    const mockGet = vi.spyOn(api, "get").mockImplementation((url) => {
      if (url === "/programs/1/") {
        return Promise.resolve({ data: null }); // Mock response for program data
      }
      if (url === "/check-application/1/") {
        return Promise.resolve({ data: null }); // Mock response for application status
      }
      return Promise.reject(new Error("Unexpected URL")); // Handle unexpected calls
    });

    render(<ProgramDetail />);

    await waitFor(() => {
      expect(
        screen.getByText(/No Program Info Available/i)
      ).toBeInTheDocument();
    });
  });

  it("handles application deadline passed scenario", async () => {
    const mockGet = vi.spyOn(api, "get").mockImplementation((url) => {
      if (url === "/programs/1/") {
        return Promise.resolve({ data: mockProgramDeadlinePassed }); // Mock response for program data
      }
      if (url === "/check-application/1/") {
        return Promise.resolve({ data: mockAppStatus }); // Mock response for application status
      }
      return Promise.reject(new Error("Unexpected URL")); // Handle unexpected calls
    });
    render(<ProgramDetail />);

    await waitFor(() => {
      expect(screen.getByText(/Deadline Passed/i)).toBeInTheDocument();
    });
  });

  it("handles application not open yet scenario", async () => {
    const mockGet = vi.spyOn(api, "get").mockImplementation((url) => {
      if (url === "/programs/1/") {
        return Promise.resolve({ data: mockProgramNotOpen }); // Mock response for program data
      }
      if (url === "/check-application/1/") {
        return Promise.resolve({ data: mockAppStatus }); // Mock response for application status
      }
      return Promise.reject(new Error("Unexpected URL")); // Handle unexpected calls
    });

    render(<ProgramDetail />);

    await waitFor(() => {
      expect(screen.getByText(/Application Not Open Yet/i)).toBeInTheDocument();
    });
  });
});
