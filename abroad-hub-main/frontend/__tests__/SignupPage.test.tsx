import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, vi, expect, beforeEach, afterEach } from "vitest";
import SignUpPage from "../src/app/signup/page";
import { useRouter } from "next/navigation";
import api from "../src/api";
import { AppRouterContextProviderMock } from "../src/components/app-router-context-provider-mock";
import { AxiosError } from "axios";

vi.mock("../../api", () => ({
  post: vi.fn(),
}));

describe("SignUpPage", () => {
  const push = vi.fn();
  const renderComponent = () => {
    render(
      <AppRouterContextProviderMock router={{ push }}>
        <SignUpPage />
      </AppRouterContextProviderMock>
    );
  };
  beforeEach(() => {
    global.window.alert = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the sign-up form", () => {
    renderComponent();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/major/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gpa/i)).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText("Full Name is required")).toBeInTheDocument();
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Username is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
      expect(
        screen.getByText("Please confirm your password")
      ).toBeInTheDocument();
      expect(screen.getByText("Date of Birth is required")).toBeInTheDocument();
      expect(screen.getByText("Major is required")).toBeInTheDocument();
      expect(screen.getByText("GPA is required")).toBeInTheDocument();
    });
  });

  it("handles successful sign-up and redirects to login", async () => {
    const mockPost = vi.spyOn(api, "post").mockResolvedValue({ data: {} });

    renderComponent();

    await userEvent.type(screen.getByLabelText(/full name/i), "John Doe");
    await userEvent.type(
      screen.getByLabelText(/email address/i),
      "john@example.com"
    );
    await userEvent.type(screen.getByLabelText(/username/i), "johndoe");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      "password123"
    );
    await userEvent.type(screen.getByLabelText(/date of birth/i), "2000-01-01");
    await userEvent.type(screen.getByLabelText(/major/i), "Computer Science");
    await userEvent.type(screen.getByLabelText(/gpa/i), "3.9");

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/login"));
  });

  it("displays an error if the API returns a username error", async () => {
    // Simulating an actual Axios error response
    const errorResponse = {
      data: {
        user: {
          username: ["A user with that username already exists."],
        },
      },
      status: 400,
      statusText: "Bad Request",
    };

    const axiosError = new AxiosError(
      "Request failed",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      errorResponse as any
    );
    const mockPost = vi.spyOn(api, "post").mockRejectedValueOnce(axiosError);

    renderComponent();
    await userEvent.type(screen.getByLabelText(/full name/i), "John Doe");
    await userEvent.type(
      screen.getByLabelText(/email address/i),
      "john@example.com"
    );
    await userEvent.type(screen.getByLabelText(/username/i), "johndoe");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      "password123"
    );
    await userEvent.type(screen.getByLabelText(/date of birth/i), "2002-01-01");
    await userEvent.type(screen.getByLabelText(/major/i), "Computer Science");
    await userEvent.type(screen.getByLabelText(/gpa/i), "3.9");

    //await userEvent.type(screen.getByLabelText(/username/i), "existinguser");
    userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() =>
      expect(
        screen.getByText("A user with that username already exists.")
      ).toBeInTheDocument()
    );
  });
  it("displays an error if the DOB is not greater than 10 years ago", async () => {
    const mockPost = vi.spyOn(api, "post").mockRejectedValue({
      response: {
        data: { user: { username: ["Username already exists"] } },
      },
    });

    renderComponent();

    await userEvent.type(screen.getByLabelText(/date of birth/i), "2024-01-01");

    //await userEvent.type(screen.getByLabelText(/username/i), "existinguser");
    userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() =>
      expect(
        screen.getByText("You must be at least 10 years old")
      ).toBeInTheDocument()
    );
  });
});
