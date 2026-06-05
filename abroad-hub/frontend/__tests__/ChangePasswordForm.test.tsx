import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChangePasswordForm from "../src/app/dashboard/profile/change-password/page";
import api from "../src/api";
import { useRouter } from "next/navigation";
import { AppRouterContextProviderMock } from "../src/components/app-router-context-provider-mock";

// Mock the API module
vi.mock("../../../../api", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("ChangePasswordForm", () => {
  const push = vi.fn();
  const renderComponent = () => {
    render(
      <AppRouterContextProviderMock router={{ push }}>
        <ChangePasswordForm />
      </AppRouterContextProviderMock>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with all required fields", () => {
    renderComponent();

    expect(screen.getByLabelText("Old Password")).toBeInTheDocument();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /change password/i })
    ).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    renderComponent();

    const submitButton = screen.getByRole("button", {
      name: /change password/i,
    });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/new password must be at least 6 characters/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/confirmation password must be at least 6 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("shows error when passwords do not match", async () => {
    renderComponent();

    await userEvent.type(screen.getByLabelText("Old Password"), "oldpass123");
    await userEvent.type(screen.getByLabelText("New Password"), "newpass123");
    await userEvent.type(
      screen.getByLabelText(/confirm new password/i),
      "different123"
    );

    const submitButton = screen.getByRole("button", {
      name: /change password/i,
    });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/new password and confirmation must match/i)
      ).toBeInTheDocument();
    });
  });

  it("submits the form successfully and redirects", async () => {
    const mockPost = vi
      .spyOn(api, "post")
      .mockResolvedValueOnce({ status: 200 });

    renderComponent();

    await userEvent.type(screen.getByLabelText("Old Password"), "oldpass123");
    await userEvent.type(screen.getByLabelText("New Password"), "newpass123");
    await userEvent.type(
      screen.getByLabelText(/confirm new password/i),
      "newpass123"
    );

    const submitButton = screen.getByRole("button", {
      name: /change password/i,
    });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/change-password/", {
        old_password: "oldpass123",
        new_password: "newpass123",
      });
      expect(push).toHaveBeenCalledWith("/dashboard/profile");
    });
  });

  it("handles API error responses", async () => {
    const errorMessage = "Old password is incorrect";
    const mockPost = vi.spyOn(api, "post").mockRejectedValueOnce({
      response: { data: { errorMessage } },
    });

    renderComponent();
    await userEvent.type(screen.getByLabelText("Old Password"), "oldpass123");
    await userEvent.type(screen.getByLabelText("New Password"), "newpass123");
    await userEvent.type(
      screen.getByLabelText(/confirm new password/i),
      "newpass123"
    );

    const submitButton = screen.getByRole("button", {
      name: /change password/i,
    });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("handles unknown API errors", async () => {
    const mockPost = vi.spyOn(api, "post").mockRejectedValueOnce(new Error());

    renderComponent();
    await userEvent.type(screen.getByLabelText("Old Password"), "oldpass123");
    await userEvent.type(screen.getByLabelText("New Password"), "newpass123");
    await userEvent.type(
      screen.getByLabelText(/confirm new password/i),
      "newpass123"
    );

    const submitButton = screen.getByRole("button", {
      name: /change password/i,
    });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/An unknown error occurred/i)
      ).toBeInTheDocument();
    });
  });
});
