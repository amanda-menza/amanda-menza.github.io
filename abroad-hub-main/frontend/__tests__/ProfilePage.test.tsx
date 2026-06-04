import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "../src/app/dashboard/profile/page";
import { useRouter } from "next/navigation";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import { AppRouterContextProviderMock } from "../src/components/app-router-context-provider-mock";
import { AppUser, UserType } from "../src/types/models";
import { getStoredUserData } from "../src/lib/utils";

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

vi.mock("../src/lib/utils", () => ({
  getStoredUserData: vi.fn(),
  cn: (...args: any) => args.filter(Boolean).join(" "),
}));

describe("ProfilePage", () => {
  const push = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (getStoredUserData as Mock).mockResolvedValue(mockAppUser);
  });

  const renderComponent = async () => {
    return render(
      <AppRouterContextProviderMock router={{ push }}>
        <ProfilePage />
      </AppRouterContextProviderMock>
    );
  };
  it("renders loading state initially", async () => {
    (getStoredUserData as Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading state
    );

    await renderComponent();

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });
  it("renders user data correctly", async () => {
    (getStoredUserData as Mock).mockResolvedValueOnce(mockAppUser);

    await act(async () => {
      renderComponent();
    });

    await waitFor(() =>
      expect(screen.getByText("John Doe")).toBeInTheDocument()
    );

    expect(screen.getByText("student123")).toBeInTheDocument();
    expect(screen.getByText("johndoe@example.com")).toBeInTheDocument();
    expect(screen.getByText("2000-01-02")).toBeInTheDocument();
    expect(screen.getByText("Computer Science")).toBeInTheDocument();
    expect(screen.getByText("3.8")).toBeInTheDocument();
  });

  it("navigates to edit profile on button click", async () => {
    (getStoredUserData as Mock).mockResolvedValueOnce(mockAppUser);

    await act(async () => {
      renderComponent();
    });

    await waitFor(() =>
      expect(screen.getByText("John Doe")).toBeInTheDocument()
    );

    await act(async () => {
      await userEvent.click(screen.getByText(/Edit Profile/i));
    });

    expect(push).toHaveBeenCalledWith("/dashboard/profile/edit");
  });

  it("navigates to change password on button click", async () => {
    (getStoredUserData as Mock).mockResolvedValueOnce(mockAppUser);

    await act(async () => {
      renderComponent();
    });

    await waitFor(() =>
      expect(screen.getByText("John Doe")).toBeInTheDocument()
    );

    await act(async () => {
      await userEvent.click(screen.getByText(/Change Password/i));
    });

    expect(push).toHaveBeenCalledWith("/dashboard/profile/change-password");
  });
});
