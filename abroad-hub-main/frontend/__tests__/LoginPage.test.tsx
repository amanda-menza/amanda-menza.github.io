import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../src/app/login/page";
import { vi, describe, expect, beforeEach, it } from "vitest";
import { useRouter } from "next/navigation";
import api from "../src/api";
import { AppRouterContextProviderMock } from "../src/components/app-router-context-provider-mock";
import userEvent from "@testing-library/user-event";

vi.mock("../../api", () => ({ post: vi.fn() }));

describe("LoginPage", () => {
  const push = vi.fn();
  const renderComponent = () => {
    render(
      <AppRouterContextProviderMock router={{ push }}>
        <LoginPage />
      </AppRouterContextProviderMock>
    );
  };

  it("renders login form", () => {
    renderComponent();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("updates input fields correctly", () => {
    renderComponent();
    const usernameInput = screen.getByLabelText(
      /username/i
    ) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(
      /password/i
    ) as HTMLInputElement;

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(usernameInput.value).toBe("testuser");
    expect(passwordInput.value).toBe("password123");
  });

  it("handles successful login", async () => {
    const mockPost = vi.spyOn(api, "post").mockResolvedValue({
      data: { access: "mockAccessToken", refresh: "mockRefreshToken" },
    });

    renderComponent();
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "validUser" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "validPass" },
    });
    userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/api/token/", {
        username: "validUser",
        password: "validPass",
      });
    });
    expect(push).toHaveBeenCalledWith("/");
  });

  it("displays error message on failed login", async () => {
    const mockPost = vi
      .spyOn(api, "post")
      .mockRejectedValue({ response: { status: 401 } });
    renderComponent();

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "wrongUser" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongPass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/username and password combination incorrect/i)
      ).toBeInTheDocument();
    });
  });
});
