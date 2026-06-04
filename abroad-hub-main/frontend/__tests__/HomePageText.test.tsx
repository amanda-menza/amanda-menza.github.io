import { render, screen } from "@testing-library/react";
import { vi, expect, describe, it } from "vitest";
import { HomePageText } from "../src/components/HomePageText"; // Adjust the import as needed
import { AppUser, UserType } from "@/types/models";

describe("HomePageText", () => {
  const mockUserStudent: AppUser = {
    id: 1,
    user: {
      id: 1,
      username: "johndoe",
      email: "johndoe@example.com",
    },
    user_type: UserType.Student, // or 'Admin' based on the test
    display_name: "John Doe",
    profile: {
      id: 1,
      user: {} as AppUser, // Reference back to AppUser
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
      email: "johndoe@example.com",
    },
    user_type: UserType.Admin, // or 'Admin' based on the test
    display_name: "John Doe",
    profile: {
      id: 1,
      user: {} as AppUser, // Reference back to AppUser
      dob: "1995-05-20",
      major: "Computer Science",
      gpa: 3.7,
    },
  };
  it("should render the administrator view when is_student is false", () => {
    // Render component with is_student = false
    render(<HomePageText is_student={false} user={mockUserAdmin} />);

    // Assert that the admin view is rendered
    expect(screen.getByText(/Welcome, Administrator!/i)).toBeInTheDocument();
    expect(screen.getByText(/Access the Admin Dashboard/i)).toBeInTheDocument();
  });

  it("should render the student view without the signup/login buttons when user is logged in", () => {
    // Mock user object
    // Render component with user logged in
    render(<HomePageText is_student={true} user={mockUserStudent} />);

    // Assert that the student view is rendered, but without signup/login buttons
    expect(screen.getByText(/Welcome to Abroad Hub!/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Sign Up/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Log In/i })).toBeNull();
  });

  it("should render the student view with the signup and login buttons when user is not logged in", () => {
    // Render component with no user logged in
    render(<HomePageText is_student={null} user={null} />);

    // Assert that signup/login buttons are present
    expect(
      screen.getByRole("button", { name: /Sign Up/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Log In/i })).toBeInTheDocument();
  });
});
