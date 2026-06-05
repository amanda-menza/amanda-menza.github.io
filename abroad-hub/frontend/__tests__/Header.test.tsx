import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, expect, it, describe } from "vitest";
import { Header, HeaderProps } from "../src/components/header"; // Adjust the import path as needed
import { AppUser, UserType } from "../src/types/models";
import userEvent from "@testing-library/user-event";
import { AppRouterContextProviderMock } from "../src/components/app-router-context-provider-mock";

const push = vi.fn();
const renderComponent = (props: HeaderProps) => {
  render(
    <AppRouterContextProviderMock router={{ push }}>
      <Header user={props.user} is_student={props.is_student} />
    </AppRouterContextProviderMock>
  );
};
// Mock user data
const mockUser: AppUser = {
  id: 1,
  user: {
    id: 1,
    username: "johndoe",
    first_name: "John",
    last_name: "Doe",
    email: "johndoe@example.com",
  },
  user_type: UserType.Student,
  display_name: "John Doe",
  profile: {
    id: 1,
    user: {} as AppUser,
    dob: "1995-05-20",
    major: "Computer Science",
    gpa: 3.7,
  },
};
const mockUserAdmin: AppUser = {
  id: 1,
  user: {
    id: 1,
    username: "johndoe",
    first_name: "John",
    last_name: "Doe",
    email: "johndoe@example.com",
  },
  user_type: UserType.Admin,
  display_name: "John Doe",
  profile: {
    id: 1,
    user: {} as AppUser,
    dob: "1995-05-20",
    major: "Computer Science",
    gpa: 3.7,
  },
};
describe("Header Component", () => {
  it("renders the logo correctly", () => {
    const testProps: HeaderProps = {
      user: null,
      is_student: null,
    };
    renderComponent(testProps);
    const logo = screen.getByAltText("Abroad Hub Logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute(
      "src",
      expect.stringContaining("abroad-hub-logo.png")
    );
  });

  it("renders the log in button for unauthenticated users", () => {
    const testProps: HeaderProps = {
      user: null,
      is_student: null,
    };
    renderComponent(testProps);

    const loginLink = screen.getByText(/Log In/i);
    expect(loginLink).toBeInTheDocument();
  });

  it("renders the dropdown menu for authenticated users", async () => {
    const testProps: HeaderProps = {
      user: mockUser,
      is_student: true,
    };
    renderComponent(testProps);

    // Verify that the avatar button is in the document
    const avatarButton = screen.getByRole("button", {
      name: /User Avatar Menu/i,
    });
    expect(avatarButton).toBeInTheDocument();

    // Simulate clicking the avatar button
    await userEvent.click(avatarButton);

    // Verify that dropdown menu content appears
    await waitFor(() => {
      expect(screen.getByText("johndoe")).toBeInTheDocument();
      expect(screen.getByText(/johndoe@example.com/i)).toBeInTheDocument();
    });

    // Verify menu items
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Log Out/i)).toBeInTheDocument();
    expect(screen.getByText(/Change Password/i)).toBeInTheDocument();
  });

  it("does not display dropdown links if user is null", () => {
    const testProps: HeaderProps = {
      user: null,
      is_student: null,
    };
    renderComponent(testProps);
    const avatarButton = screen.queryByRole("button", {
      name: /User Avatar Menu/i,
    });
    expect(avatarButton).toBeNull();
  });

  it("navigates correctly via dropdown menu link to profile for student", async () => {
    const testProps: HeaderProps = {
      user: mockUser,
      is_student: true,
    };
    renderComponent(testProps);
    // Verify that the avatar button is in the document
    const avatarButton = screen.getByRole("button", {
      name: /User Avatar Menu/i,
    });
    expect(avatarButton).toBeInTheDocument();

    // Simulate clicking the avatar button
    await userEvent.click(avatarButton);

    // Verify that dropdown menu content appears
    await waitFor(() => {
      expect(screen.getByText("johndoe")).toBeInTheDocument();
      expect(screen.getByText(/johndoe@example.com/i)).toBeInTheDocument();
    });

    const profileLink = screen.getByRole("menuitem", { name: /Profile/i });
    await userEvent.click(profileLink);

    expect(push).toHaveBeenCalledWith("/dashboard/profile");
  });

  it("navigates correctly via dropdown menu link to Log Out for student", async () => {
    const testProps: HeaderProps = {
      user: mockUser,
      is_student: true,
    };
    renderComponent(testProps);
    // Verify that the avatar button is in the document
    const avatarButton = screen.getByRole("button", {
      name: /User Avatar Menu/i,
    });
    expect(avatarButton).toBeInTheDocument();

    // Simulate clicking the avatar button
    await userEvent.click(avatarButton);

    // Verify that dropdown menu content appears
    await waitFor(() => {
      expect(screen.getByText("johndoe")).toBeInTheDocument();
      expect(screen.getByText(/johndoe@example.com/i)).toBeInTheDocument();
    });

    const logoutLink = screen.getByRole("menuitem", { name: /Log Out/i });
    await userEvent.click(logoutLink);

    expect(push).toHaveBeenCalledWith("/logout");
  });

  it("navigates correctly via dropdown menu link to reset password for student", async () => {
    const testProps: HeaderProps = {
      user: mockUser,
      is_student: true,
    };
    renderComponent(testProps);
    // Verify that the avatar button is in the document
    const avatarButton = screen.getByRole("button", {
      name: /User Avatar Menu/i,
    });
    expect(avatarButton).toBeInTheDocument();

    // Simulate clicking the avatar button
    await userEvent.click(avatarButton);

    // Verify that dropdown menu content appears
    await waitFor(() => {
      expect(screen.getByText("johndoe")).toBeInTheDocument();
      expect(screen.getByText(/johndoe@example.com/i)).toBeInTheDocument();
    });

    const resetLink = screen.getByRole("menuitem", {
      name: /Change Password/i,
    });
    await userEvent.click(resetLink);

    expect(push).toHaveBeenCalledWith("/dashboard/profile/change-password");
  });
  it("navigates correctly via dropdown menu link to profile for admin", async () => {
    const testProps: HeaderProps = {
      user: mockUserAdmin,
      is_student: false,
    };
    renderComponent(testProps);
    // Verify that the avatar button is in the document
    const avatarButton = screen.getByRole("button", {
      name: /User Avatar Menu/i,
    });
    expect(avatarButton).toBeInTheDocument();

    // Simulate clicking the avatar button
    await userEvent.click(avatarButton);

    // Verify that dropdown menu content appears
    await waitFor(() => {
      expect(screen.getByText("johndoe")).toBeInTheDocument();
      expect(screen.getByText(/johndoe@example.com/i)).toBeInTheDocument();
    });

    const profileLink = screen.getByRole("menuitem", { name: /Profile/i });
    await userEvent.click(profileLink);

    expect(push).toHaveBeenCalledWith("/administrator/dashboard/profile");
  });

  it("navigates correctly via dropdown menu link to Log Out for admin", async () => {
    const testProps: HeaderProps = {
      user: mockUserAdmin,
      is_student: false,
    };
    renderComponent(testProps);
    // Verify that the avatar button is in the document
    const avatarButton = screen.getByRole("button", {
      name: /User Avatar Menu/i,
    });
    expect(avatarButton).toBeInTheDocument();

    // Simulate clicking the avatar button
    await userEvent.click(avatarButton);

    // Verify that dropdown menu content appears
    await waitFor(() => {
      expect(screen.getByText("johndoe")).toBeInTheDocument();
      expect(screen.getByText(/johndoe@example.com/i)).toBeInTheDocument();
    });

    const logoutLink = screen.getByRole("menuitem", { name: /Log Out/i });
    await userEvent.click(logoutLink);

    expect(push).toHaveBeenCalledWith("/logout");
  });

  it("navigates correctly via dropdown menu link to reset password for admin", async () => {
    const testProps: HeaderProps = {
      user: mockUserAdmin,
      is_student: false,
    };
    renderComponent(testProps);
    // Verify that the avatar button is in the document
    const avatarButton = screen.getByRole("button", {
      name: /User Avatar Menu/i,
    });
    expect(avatarButton).toBeInTheDocument();

    // Simulate clicking the avatar button
    await userEvent.click(avatarButton);

    // Verify that dropdown menu content appears
    await waitFor(() => {
      expect(screen.getByText("johndoe")).toBeInTheDocument();
      expect(screen.getByText(/johndoe@example.com/i)).toBeInTheDocument();
    });

    const resetLink = screen.getByRole("menuitem", {
      name: /Change Password/i,
    });
    await userEvent.click(resetLink);

    expect(push).toHaveBeenCalledWith(
      "/administrator/dashboard/profile/change-password"
    );
  });
});
