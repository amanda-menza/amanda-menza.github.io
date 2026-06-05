import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, it, describe, expect } from "vitest";
import Applications from "../src/app/dashboard/applications/page"; // Adjust import as needed
import api from "../src/api";
import { ApplicationStatus, SemesterType } from "../src/types/models";
import { AppRouterContextProviderMock } from "../src/components/app-router-context-provider-mock";

// Mock the api call
const mockApplication = [
  {
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
      title: "Study Abroad Program 1",
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
  },
  {
    id: "2",
    submission_date: "2025-01-01T12:00:00Z",
    status: ApplicationStatus.Enrolled,
    student: {
      display_name: "Jane Doe",
      profile: {
        dob: "2000-01-01",
        gpa: 3.8,
        major: "Computer Science",
      },
    },
    program: {
      id: "321",
      title: "Study Abroad Program 2",
      description: "An amazing program to study abroad.",
      location: "Paris",
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
  },
];

const mockApplicationSingle = [
  {
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
      title: "Study Abroad Program 1",
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
  },
];

const push = vi.fn();
const renderComponent = () => {
  render(
    <AppRouterContextProviderMock router={{ push }}>
      <Applications />
    </AppRouterContextProviderMock>
  );
};
describe("Applications", () => {
  it("renders a list of applications", async () => {
    const mockGet = vi
      .spyOn(api, "get")
      .mockResolvedValue({ data: mockApplication });
    // Render the component
    renderComponent();

    // Wait for applications to be fetched and rendered
    await waitFor(() => screen.getByText("Study Abroad Program 1"));
    await waitFor(() => screen.getByText("Study Abroad Program 2"));

    // Check if the programs and their statuses are rendered
    expect(screen.getByText("Study Abroad Program 1")).toBeInTheDocument();
    expect(screen.getByText("Study Abroad Program 2")).toBeInTheDocument();
    expect(screen.getByText("Applied")).toBeInTheDocument();
    expect(screen.getByText("Enrolled")).toBeInTheDocument();
  });

  it("renders a message if no applications are found", async () => {
    // Mock an empty response
    const mockGet = vi.spyOn(api, "get").mockResolvedValue({ data: [] });

    render(<Applications />);

    // Check if the message appears when no applications are available
    await waitFor(() => screen.getByText("No Applications Yet"));
    expect(screen.getByText("No Applications Yet")).toBeInTheDocument();
  });

  it("clicking the 'View Application' button navigates to the application details page", async () => {
    const mockGet = vi
      .spyOn(api, "get")
      .mockResolvedValue({ data: mockApplicationSingle });
    // Render the component
    renderComponent();
    // Click the "View Application" button
    await waitFor(() => screen.getByText("View Application"));
    const profileLink = screen.getByText(/View Application/i);
    expect(profileLink.closest("a")).toHaveAttribute(
      "href",
      "/dashboard/applications/1"
    );
  });
});
