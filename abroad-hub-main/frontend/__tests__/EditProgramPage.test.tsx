import { render, screen, waitFor } from "@testing-library/react";
import { vi, it, describe, expect, Mock, afterEach, beforeEach } from "vitest";
import EditProgram from "../src/app/administrator/dashboard/programs/[id]/edit/page";
import { getStoredUserData } from "@/lib/utils";
import { useParams } from "next/navigation";
import {
  Program,
  ProgramFormProps,
  SemesterType,
  AppUser,
  UserType,
} from "../src/types/models";
import { AppRouterContextProviderMock } from "../src/components/app-router-context-provider-mock";

const push = vi.fn();
const renderComponent = () => {
  render(
    <AppRouterContextProviderMock router={{ push }}>
      <EditProgram />
    </AppRouterContextProviderMock>
  );
};
const mockAdminUsers: AppUser[] = [
  {
    id: 1,
    user: {
      id: 1,
      username: "john_doe",
      email: "john.doe@example.com",
    },
    user_type: UserType.Admin,
    display_name: "Dr. Jane Smith",
    profile: {
      id: 1,
      user: {} as AppUser,
      major: null,
      gpa: null,
    },
  },
  {
    id: 2,
    user: {
      id: 2,
      username: "jane_smith",
      email: "jane.smith@example.com",
    },
    user_type: UserType.Admin,
    display_name: "Prof. Alan Turing",
    profile: {
      id: 2,
      user: {} as AppUser,
      major: null,
      gpa: null,
    },
  },
];

// Mock Program
const mockProgram: Program = {
  id: 1,
  title: "Study Abroad in Japan",
  year: 2025,
  semester: SemesterType.Fall,
  location: "Tokyo, Japan",
  faculty_leads: [
    { id: 1, display_name: "Dr. Jane Smith" },
    { id: 2, display_name: "Prof. Alan Turing" },
  ],
  description:
    "An exciting opportunity to study in Japan and experience its rich culture.",
  start_date: "2025-09-01",
  end_date: "2025-12-15",
  open_date: "2025-01-01",
  deadline: "2025-06-01",
  essential_doc_deadline: "2025-06-01",
};

const mockProgramForm = vi.fn();
vi.mock(
  "../../../../../components/ProgramForm",
  () =>
    (props: { programProps: ProgramFormProps; facultyMembers: AppUser[] }) => {
      mockProgramForm(props);
      return <div data-testid="mock-app-form">Mocked Program Form</div>;
    }
);
// Mock API calls
vi.mock("../../../../../../api.js", () => ({
  get: vi.fn((url) => {
    if (url === "/api/programs/1/") {
      return Promise.resolve({ data: mockProgram });
    }
    if (url === "api/faculty-user-query/") {
      return Promise.resolve({ data: mockAdminUsers });
    }
    return Promise.reject(new Error("Unknown API route"));
  }),
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

describe("EditProgram Component", () => {
  beforeEach(() => {
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

  it("fetches program data and renders the ProgramForm", async () => {
    renderComponent();

    // Ensure the loading state disappears
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
    // Verify that the ApplicationForm is rendered
    expect(screen.getByText("Program Form")).toBeInTheDocument();
    // Ensure API and user functions were called correctly
  });
});
