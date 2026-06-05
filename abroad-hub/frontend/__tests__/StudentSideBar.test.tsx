import { render, screen, fireEvent } from "@testing-library/react";
import { StudentSidebar } from "@/components/navbar";
import { expect, vi, describe, it } from "vitest";

describe("StudentSidebar", () => {
  it("renders the sidebar with collapsed and expanded states", () => {
    render(<StudentSidebar />);

    // Check if the sidebar starts in collapsed state
    expect(screen.queryByText(/Dashboard/i)).toBeNull();
    expect(screen.queryByText(/Browse All Programs/i)).toBeNull();
    expect(screen.queryByText(/My Applications/i)).toBeNull();
    expect(screen.queryByText(/My Programs/i)).toBeNull();

    // Find the collapse button and click it
    const collapseButton = screen.getByRole("button");
    fireEvent.click(collapseButton);

    // After clicking, the sidebar should expand
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse All Programs/i)).toBeInTheDocument();
    expect(screen.getByText(/My Applications/i)).toBeInTheDocument();
    expect(screen.getByText(/My Programs/i)).toBeInTheDocument();
  });

  it("renders the icons and menu items", () => {
    render(<StudentSidebar />);

    const collapseButton = screen.getByRole("button");
    fireEvent.click(collapseButton);

    // Check if the sidebar items are present
    expect(
      screen.getByRole("link", { name: /Dashboard/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Browse All Programs/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /My Applications/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /My Programs/i })
    ).toBeInTheDocument();
  });

  it("collapses and expands when clicking the button", () => {
    render(<StudentSidebar />);

    const collapseButton = screen.getByRole("button");

    // Ensure the button works to toggle the collapsed state
    fireEvent.click(collapseButton);
    expect(screen.queryByText(/Dashboard/i)).toBeInTheDocument();

    fireEvent.click(collapseButton);
    expect(screen.queryByText(/Dashboard/i)).toBeNull();
  });
});
