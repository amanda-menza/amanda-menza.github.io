import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ApplicationDetail from "../src/app/dashboard/applications/[id]/page";
import { vi, expect, describe, it, beforeEach, Mock } from "vitest";
import api from "../src/api";
import { useParams, useRouter } from "next/navigation";
import {
  AlertDialogButton,
  AlertDialogProps,
} from "@/components/AlertDialogButton";
import { SemesterType, ApplicationStatus } from "@/types/models";
import userEvent from "@testing-library/user-event";

vi.mock("../../../../api.js", () => ({
  get: vi.fn(),
  patch: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock("../../../../components/AlertDialogButton", () => ({
  AlertDialogButton: (alertDialogProps: AlertDialogProps) => (
    <button onClick={alertDialogProps.clickAction}>
      {alertDialogProps.buttonTitle}
    </button>
  ),
}));

vi.mock("../../../../components/StatusBadge", () => ({
  StatusBadge: (status: ApplicationStatus) => <span>{status}</span>,
}));

describe("ApplicationDetail", () => {
  const mockRouter = { push: vi.fn() };
  const mockApplicationApplied = {
    id: "1",
    submission_date: "2025-01-01T12:00:00Z",
    status: ApplicationStatus.Applied,
    student: {
      display_name: "John Doe",
      profile: {
        dob: "2000-01-01",
        gpa: 3.8,
        major: "Computer Science",
      },
    },
    program: {
      id: "123",
      title: "Study Abroad Program",
      description: "An amazing program to study abroad.",
      location: "Tokyo, Japan",
      year: "2025",
      semester: SemesterType.Spring,
      deadline: "2025-04-15",
      start_date: "2025-02-01",
      end_date: "2025-06-01",
      open_date: "2025-01-01",
    },
    q1: "Answer 1",
    q2: "Answer 2",
    q3: "Answer 3",
    q4: "Answer 4",
    q5: "Answer 5",
  };
  const mockApplicationWithdrawn = {
    id: "1",
    submission_date: "2025-01-01T12:00:00Z",
    status: ApplicationStatus.Withdrawn,
    student: {
      display_name: "John Doe",
      profile: {
        dob: "2000-01-01",
        gpa: 3.8,
        major: "Computer Science",
      },
    },
    program: {
      id: "123",
      title: "Study Abroad Program",
      description: "An amazing program to study abroad.",
      location: "Tokyo, Japan",
      year: "2025",
      semester: SemesterType.Spring,
      deadline: "2025-09-15",
      start_date: "2025-10-01",
      end_date: "2025-12-01",
    },
    q1: "Answer 1",
    q2: "Answer 2",
    q3: "Answer 3",
    q4: "Answer 4",
    q5: "Answer 5",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useParams as Mock).mockReturnValue({ id: "1" });
    (useRouter as Mock).mockReturnValue(mockRouter);
  });

  it("renders loading state initially", () => {
    render(<ApplicationDetail />);
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it("renders application details after data is fetched", async () => {
    const mockGet = vi
      .spyOn(api, "get")
      .mockResolvedValue({ data: mockApplicationApplied });

    render(<ApplicationDetail />);

    await waitFor(() =>
      expect(screen.getByText("Application Details")).toBeInTheDocument()
    );

    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/3.8/i)).toBeInTheDocument();
    expect(screen.getByText(/computer science/i)).toBeInTheDocument();
    expect(screen.getByText(/answer 1/i)).toBeInTheDocument();
  });

  it("calls changeStatus and refreshes data when withdrawing application", async () => {
    const mockGet = vi
      .spyOn(api, "get")
      .mockResolvedValue({ data: mockApplicationApplied });

    render(<ApplicationDetail />);

    await waitFor(() =>
      expect(screen.getByText("Application Details")).toBeInTheDocument()
    );
    const mockPatch = vi.spyOn(api, "patch").mockResolvedValue({});

    const withdrawButton = screen.getByText(/withdraw application/i);
    fireEvent.click(withdrawButton);
    await waitFor(() => expect(screen.getByText("Yes")).toBeInTheDocument());
    const yesButton = screen.getByText(/Yes/i);
    fireEvent.click(yesButton);

    await waitFor(() =>
      expect(mockPatch).toHaveBeenCalledWith(
        "/api/applications/1/change_status/",
        {
          status: "Withdrawn",
        }
      )
    );

    expect(mockGet).toHaveBeenCalledTimes(2); // Initial fetch + refresh
  });
  it("calls changeStatus and refreshes data when reactivating application", async () => {
    const mockGet = vi
      .spyOn(api, "get")
      .mockResolvedValue({ data: mockApplicationWithdrawn });

    render(<ApplicationDetail />);

    await waitFor(() =>
      expect(screen.getByText("Application Details")).toBeInTheDocument()
    );
    const mockPatch = vi.spyOn(api, "patch").mockResolvedValue({});

    const reapply = screen.getByText(/reactivate application/i);
    fireEvent.click(reapply);
    await waitFor(() => expect(screen.getByText("Yes")).toBeInTheDocument());
    const yesButton = screen.getByText(/Yes/i);
    fireEvent.click(yesButton);

    await waitFor(() =>
      expect(mockPatch).toHaveBeenCalledWith(
        "/api/applications/1/change_status/",
        {
          status: "Applied",
        }
      )
    );

    expect(mockGet).toHaveBeenCalledTimes(2); // Initial fetch + refresh
  });

  it("renders no application info if application is null", async () => {
    const mockGet = vi.spyOn(api, "get").mockResolvedValue({ data: null });

    render(<ApplicationDetail />);

    await waitFor(() =>
      expect(
        screen.getByText(/no application info available/i)
      ).toBeInTheDocument()
    );
  });
});
