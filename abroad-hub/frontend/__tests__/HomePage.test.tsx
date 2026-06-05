import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
  RenderResult,
} from "@testing-library/react";
import { vi, expect, describe, it, Mock } from "vitest";
import Home from "../src/app/page"; // Adjust the import path if necessary
import axios from "axios";
import { fetchCurrentUser, isStudent } from "@/lib/utils";
import { AppUser } from "@/types/models";
import { AppRouterContextProviderMock } from "../src/components/app-router-context-provider-mock";

// Mock axios, fetchCurrentUser, and isStudent functions
vi.mock("axios");
// Mock the API module
vi.mock("../src/api", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));
vi.mock("@/lib/utils", () => ({
  fetchCurrentUser: vi.fn(),
  isStudent: vi.fn(),
  cn: (...args: any) => args.filter(Boolean).join(" "),
}));

describe("Home", () => {
  const push = vi.fn();
  const renderComponent = async (): Promise<RenderResult> => {
    let result: RenderResult;

    await act(async () => {
      result = render(
        <AppRouterContextProviderMock router={{ push }}>
          <Home />
        </AppRouterContextProviderMock>
      );
    });

    // Wait for any state updates to complete
    await waitFor(() => new Promise((resolve) => setTimeout(resolve, 0)));

    return result!;
  };

  it("fetches and displays content", async () => {
    const mockContent = "New fetched content!";
    (axios.get as Mock).mockResolvedValueOnce({
      status: 200,
      data: { content: mockContent },
    });

    await renderComponent();

    // Wait for the component to finish fetching the data
    await waitFor(() =>
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument()
    );

    // Ensure the content is rendered
    expect(screen.getByText(mockContent)).toBeInTheDocument();
  });

  it("displays default content if the API request fails", async () => {
    const defaultContent = /Discover amazing study abroad opportunities/i;
    (axios.get as Mock).mockRejectedValueOnce(
      new Error("Error fetching content")
    );

    await renderComponent();

    // Wait for the component to finish fetching the data
    await waitFor(() =>
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument()
    );

    // Ensure the default content is rendered
    expect(screen.getByText(defaultContent)).toBeInTheDocument();
  });

  it("displays 'Get Started' button if the user is not logged in", async () => {
    (fetchCurrentUser as Mock).mockResolvedValueOnce(null); // No user logged in
    (isStudent as Mock).mockResolvedValueOnce(null); // Student status is null

    await renderComponent();

    // Wait for the component to finish loading
    await waitFor(() =>
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument()
    );

    // Check if the "Get Started" button is displayed
    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });

  //   it("displays 'Go to Dashboard' button if the user is a student", async () => {
  //     const mockUser: AppUser = {
  //       id: 1,
  //       user: {
  //         id: 1,
  //         username: "johndoe",
  //         first_name: "John",
  //         last_name: "Doe",
  //         email: "johndoe@example.com",
  //       },
  //       user_type: "Student",
  //       display_name: "John Doe",
  //       profile: {
  //         id: 1,
  //         user: {} as AppUser,
  //         dob: "1995-05-20",
  //         major: "Computer Science",
  //         gpa: 3.7,
  //       },
  //     };
  //     (fetchCurrentUser as Mock).mockResolvedValueOnce(mockUser); // User is logged in
  //     (isStudent as Mock).mockResolvedValueOnce(true); // User is a student

  //     await renderComponent();

  //     // Wait for the component to finish loading
  //     await waitFor(() =>
  //       expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument()
  //     );

  //     // Check if the "Go to Dashboard" button is displayed
  //     expect(screen.getByText("Go to Dashboard")).toBeInTheDocument();
  //   });

  //   it("displays 'Go to Admin Dashboard' button if the user is not a student", async () => {
  //     const mockUser: AppUser = {
  //       id: 1,
  //       user: {
  //         id: 1,
  //         username: "johndoe",
  //         first_name: "John",
  //         last_name: "Doe",
  //         email: "johndoe@example.com",
  //       },
  //       user_type: "Admin",
  //       display_name: "John Doe",
  //       profile: {
  //         id: 1,
  //         user: {} as AppUser,
  //         dob: "1995-05-20",
  //         major: "Computer Science",
  //         gpa: 3.7,
  //       },
  //     };
  //     (fetchCurrentUser as Mock).mockResolvedValueOnce(mockUser); // User is logged in
  //     (isStudent as Mock).mockResolvedValueOnce(false); // User is not a student

  //     await renderComponent();

  //     // Wait for the component to finish loading
  //     await waitFor(() =>
  //       expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument()
  //     );

  //     // Check if the "Go to Admin Dashboard" button is displayed
  //     expect(screen.getByText("Go to Admin Dashboard")).toBeInTheDocument();
  //   });

  //   it("handles button clicks and navigates to the correct page", async () => {
  //     const mockUser: AppUser = {
  //       id: 1,
  //       user: {
  //         id: 1,
  //         username: "johndoe",
  //         first_name: "John",
  //         last_name: "Doe",
  //         email: "johndoe@example.com",
  //       },
  //       user_type: "Student",
  //       display_name: "John Doe",
  //       profile: {
  //         id: 1,
  //         user: {} as AppUser,
  //         dob: "1995-05-20",
  //         major: "Computer Science",
  //         gpa: 3.7,
  //       },
  //     };
  //     (fetchCurrentUser as Mock).mockResolvedValueOnce(mockUser); // User is logged in
  //     (isStudent as Mock).mockResolvedValueOnce(true); // User is a student

  //     await renderComponent();

  //     // Wait for the component to finish loading
  //     await waitFor(() =>
  //       expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument()
  //     );

  //     // Simulate click on the "Go to Dashboard" button
  //     fireEvent.click(screen.getByText("Go to Dashboard"));

  //     // Ensure push was called for navigation
  //     expect(push).toHaveBeenCalledWith("/dashboard");
  //   });
});
