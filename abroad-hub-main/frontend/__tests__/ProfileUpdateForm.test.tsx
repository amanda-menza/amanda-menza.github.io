import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ProfileUpdateForm from "../src/components/ProfileUpdateForm";
import api from "../src/api";
import * as utils from "@/lib/utils";
import { useRouter } from "next/navigation";
import { AppUser, UserType } from "../src/types/models";
import { AppRouterContextProviderMock } from "../src/components/app-router-context-provider-mock";

// Mocking necessary imports and functions
vi.mock("@/lib/utils", () => ({
  storeUserData: vi.fn(), // Mock the function
}));
const mockUser: AppUser = {
  id: 1,
  user: {
    id: 1,
    username: "johndoe",
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

const push = vi.fn();
const renderProfileForm = (user: AppUser) => {
  render(
    <AppRouterContextProviderMock router={{ push }}>
      <ProfileUpdateForm user={user} />
    </AppRouterContextProviderMock>
  );
};
describe("ProfileUpdateForm", () => {
  it("renders the form correctly", () => {
    renderProfileForm(mockUser);

    // Check that the form fields are rendered
    expect(screen.getByLabelText(/Date of Birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Major/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/GPA/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /update profile/i })
    ).toBeInTheDocument();
  });

  it("displays error messages when invalid data is submitted", async () => {
    renderProfileForm(mockUser);

    // Try submitting the form with invalid data
    fireEvent.input(screen.getByLabelText(/GPA/i), { target: { value: "5" } });
    fireEvent.submit(screen.getByRole("form"));

    // Wait for the validation error message
    await waitFor(() => {
      expect(
        screen.getByText(/GPA must be between 0.0 and 4.0/i)
      ).toBeInTheDocument();
    });
  });

  it("displays error message when major exceeds the character limit", async () => {
    renderProfileForm(mockUser);

    const longMajor = "A".repeat(101); // 101 characters
    fireEvent.input(screen.getByLabelText(/Major/i), {
      target: { value: longMajor },
    });
    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(
        screen.getByText(/Major cannot exceed 100 characters./i)
      ).toBeInTheDocument();
    });
  });

  it("displays error message when date of birth is invalid", async () => {
    renderProfileForm(mockUser);

    fireEvent.input(screen.getByLabelText(/Date of Birth/i), {
      target: { value: "invalid-date" },
    });
    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(
        screen.getByText(/You must be at least 10 years old./i)
      ).toBeInTheDocument();
    });
  });

  it("displays error message when the user is younger than 10 years old", async () => {
    renderProfileForm(mockUser);

    const tooYoungDOB = "2016-01-01"; // Less than 10 years old
    fireEvent.input(screen.getByLabelText(/Date of Birth/i), {
      target: { value: tooYoungDOB },
    });
    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(
        screen.getByText(/You must be at least 10 years old./i)
      ).toBeInTheDocument();
    });
  });

  it("calls the API and navigates on successful form submission", async () => {
    // Mock the API and utility functions
    const mockApiResponse = {
      data: { profile: { major: "CS", gpa: "3.5", dob: "2000-01-01" } },
    };
    const mockPatch = vi.spyOn(api, "patch").mockResolvedValue(mockApiResponse);
    const storeUserDataSpy = vi
      .spyOn(utils, "storeUserData")
      .mockImplementation(() => {});

    renderProfileForm(mockUser);

    // Fill out the form
    fireEvent.input(screen.getByLabelText(/Major/i), {
      target: { value: "Computer Science" },
    });
    fireEvent.input(screen.getByLabelText(/GPA/i), {
      target: { value: "3.8" },
    });
    fireEvent.input(screen.getByLabelText(/Date of Birth/i), {
      target: { value: "2001-01-01" },
    });

    // Submit the form
    fireEvent.submit(screen.getByRole("form"));

    // Wait for the API call and navigation to occur
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith("/user/profile/", {
        dob: "2001-01-01",
        major: "Computer Science",
        gpa: 3.8,
      });
      expect(push).toHaveBeenCalledWith("/dashboard/profile");
    });
  });
});
