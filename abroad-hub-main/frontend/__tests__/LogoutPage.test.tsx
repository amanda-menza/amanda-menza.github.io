import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeAll } from "vitest";
import { useRouter } from "next/navigation";
import LogoutPage from "../src/app/logout/page"; // Adjust the import path if needed
import { AppRouterContextProviderMock } from "../src/components/app-router-context-provider-mock";

describe("LogoutPage", () => {
  const push = vi.fn();
  const renderComponent = () => {
    render(
      <AppRouterContextProviderMock router={{ push }}>
        <LogoutPage />
      </AppRouterContextProviderMock>
    );
  };
  beforeAll(() => {
    global.localStorage = {
      clear: vi.fn(),
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      key: vi.fn(),
      length: 0,
    };
  });
  it("clears localStorage on render", async () => {
    const clearSpy = vi.spyOn(localStorage, "clear");

    renderComponent();

    // Assert that localStorage.clear() was called
    await waitFor(() => expect(clearSpy).toHaveBeenCalled());
  });

  it("navigates to the login page after logout", async () => {
    renderComponent();

    // Wait for the effect to run
    await waitFor(() => expect(push).toHaveBeenCalledWith("/"));
  });

  it('displays "Logging out..." message', () => {
    renderComponent();

    // Assert that the "Logging out..." message is displayed
    expect(screen.getByText("Logging out...")).toBeInTheDocument();
  });
});
