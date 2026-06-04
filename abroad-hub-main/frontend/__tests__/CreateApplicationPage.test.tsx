import { render, screen, waitFor } from "@testing-library/react";
import { vi, it, describe, expect, Mock, afterEach, beforeEach } from "vitest";
import CreateApplication from "../src/app/dashboard/applications/create/[id]/page";
import { useParams } from "next/navigation";
import { getStoredUserData } from "@/lib/utils";
import { AppUser, ApplicationFormProps, UserType } from "../src/types/models";
import { AppRouterContextProviderMock } from "../src/components/app-router-context-provider-mock";
import * as form from "../src/components/ApplicationForm";

const push = vi.fn();
const renderComponent = () => {
  render(
    <AppRouterContextProviderMock router={{ push }}>
      <CreateApplication />
    </AppRouterContextProviderMock>
  );
};

// Mock AppUser
const mockAppUser: AppUser = {
  id: 1,
  user: {
    id: 1,
    username: "student123",
    first_name: "John",
    last_name: "Doe",
    email: "johndoe@example.com",
  },
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

vi.mock("@/lib/utils", () => ({
  getStoredUserData: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn().mockReturnValue({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useParams: vi.fn(),
}));

describe("CreateApplication Component", () => {
  let mockAppForm: Mock;
  beforeEach(() => {
    mockAppForm = vi.fn();
    vi.mock(
      "../../../../../components/ApplicationForm",
      () => (props: ApplicationFormProps) => {
        mockAppForm(props);
        return <div data-testid="mock-app-form">Mocked Application Form</div>;
      }
    );
    // Mock getStoredUserData
    (getStoredUserData as Mock).mockReturnValue(mockAppUser);

    // Mock useParams
    (useParams as Mock).mockReturnValue({ id: "1" });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the ApplicationForm with default props", async () => {
    renderComponent();

    expect(screen.getByText("Application Form")).toBeInTheDocument();
  });

  it("handles missing user data gracefully", async () => {
    // Mock getStoredUserData to return undefined
    (getStoredUserData as Mock).mockReturnValue(undefined);

    renderComponent();

    expect(screen.getByText("Application Form")).toBeInTheDocument();
  });
});
