import { render, screen, waitFor } from "@testing-library/react";
import { vi, it, describe, expect, Mock, afterEach, beforeEach } from "vitest";
import UpdateApplication from "../src/app/dashboard/applications/[id]/update/page";
import api from "../src/api";
import { getStoredUserData } from "@/lib/utils";
import { useParams } from "next/navigation";
import {
  Application,
  Program,
  User,
  AppUser,
  ApplicationFormProps,
  SemesterType,
  ApplicationStatus,
  UserType,
} from "../src/types/models";
import { AppRouterContextProviderMock } from "../src/components/app-router-context-provider-mock";

const push = vi.fn();
const renderComponent = () => {
  render(
    <AppRouterContextProviderMock router={{ push }}>
      <UpdateApplication />
    </AppRouterContextProviderMock>
  );
};

// Mock User
const mockUser: User = {
  id: 1,
  username: "student123",
  first_name: "John",
  last_name: "Doe",
  email: "johndoe@example.com",
};

// Mock AppUser
const mockAppUser: AppUser = {
  id: 1,
  user: mockUser,
  user_type: UserType.Student,
  display_name: "John Doe",
  profile: {
    id: 1,
    user: {} as AppUser, // Placeholder to avoid circular dependency
    dob: "2000-01-02",
    major: "Computer Science",
    gpa: 3.8,
  },
};

mockAppUser.profile.user = mockAppUser;

// Mock Program
const mockProgram: Program = {
  id: 1,
  title: "Study Abroad in Japan",
  year: 2025,
  semester: SemesterType.Fall,
  location: "Tokyo, Japan",
  faculty_leads: "Dr. Jane Smith, Prof. Alan Turing",
  description:
    "An exciting opportunity to study in Japan and experience its rich culture.",
  start_date: "2025-09-01",
  end_date: "2025-12-15",
  open_date: "2025-01-01",
  deadline: "2025-06-01",
};

const data: Application = {
  id: 1,
  student: mockAppUser,
  program: mockProgram,
  submission_date: "2025-01-15",
  status: ApplicationStatus.Applied,
  q1: "Answer 1",
  q2: "Answer 2",
  q3: "Answer 3",
  q4: "Answer 4",
  q5: "Answer 5",
};

const mockApplicationDefault: ApplicationFormProps = {
  statusDefault: ApplicationStatus.Applied,
  q1Default: "Answer 1",
  q2Default: "Answer 2",
  q3Default: "Answer 3",
  q4Default: "Answer 4",
  q5Default: "Answer 5",
  route: `applications/1/`,
  method: "patch",
  user: mockAppUser,
};

const mockAppForm = vi.fn();
vi.mock(
  "../../../../../components/ApplicationForm",
  () => (props: ApplicationFormProps) => {
    mockAppForm(props);
    return <div data-testid="mock-app-form">Mocked Application Form</div>;
  }
);
vi.mock("@/lib/utils", () => ({
  getStoredUserData: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn().mockReturnValue({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    // Add any other router functions your tests rely on.
  }),
  useParams: vi.fn(),
}));

describe("UpdateApplication Component", () => {
  beforeEach(() => {
    // Mock getStoredUserData
    (getStoredUserData as Mock).mockReturnValue(mockAppUser);

    // Mock useParams
    (useParams as Mock).mockReturnValue({ id: "1" });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the loading state initially", () => {
    renderComponent();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("fetches application data and renders the ApplicationForm", async () => {
    const mockGet = vi.spyOn(api, "get").mockResolvedValue(data);

    renderComponent();

    // Ensure the loading state disappears
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
    // Verify that the ApplicationForm is rendered
    expect(screen.getByText("Application Form")).toBeInTheDocument();
    // Ensure API and user functions were called correctly
    expect(mockGet).toHaveBeenCalledWith("/applications/1/");
    expect(getStoredUserData).toHaveBeenCalled();
  });

  it("handles API errors gracefully", async () => {
    const mockGet = vi
      .spyOn(api, "get")
      .mockRejectedValue(new Error("Failed to fetch data"));

    renderComponent();

    // Ensure the loading state disappears even after an error
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    // Ensure the form is not rendered in case of an error
    expect(screen.queryByText("Application Form")).toBeInTheDocument();
  });
});
