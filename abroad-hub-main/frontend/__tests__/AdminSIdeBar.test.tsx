import { render, screen, fireEvent } from "@testing-library/react";
import { AdminSidebar } from "../src/components/navbar";
import { expect, vi, describe, it } from "vitest";

describe("AdminSidebar", () => {
  it("renders the sidebar with collapsed and expanded states", () => {
    render(<AdminSidebar />);

    // Check if the sidebar starts in collapsed state
    expect(screen.queryByText(/Dashboard/i)).toBeNull();
    expect(screen.queryByText(/Programs Overview/i)).toBeNull();
    expect(screen.queryByText(/Student Program View/i)).toBeNull();
    expect(screen.queryByText(/User Management/i)).toBeNull();

    // Find the collapse button and click it
    const collapseButton = screen.getByRole("button");
    fireEvent.click(collapseButton);

    // After clicking, the sidebar should expand
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Programs Overview/i)).toBeInTheDocument();
    expect(screen.getByText(/Student Program View/i)).toBeInTheDocument();
    expect(screen.queryByText(/User Management/i)).toBeInTheDocument();
  });

  it("renders the icons and menu items", () => {
    render(<AdminSidebar />);

    const collapseButton = screen.getByRole("button");
    fireEvent.click(collapseButton);

    // Check if the sidebar items are present
    expect(
      screen.getByRole("link", { name: /Dashboard/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Programs Overview/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Student Program View/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /User Management/i })
    ).toBeInTheDocument();
  });

  it("collapses and expands when clicking the button", () => {
    render(<AdminSidebar />);

    const collapseButton = screen.getByRole("button");

    // Ensure the button works to toggle the collapsed state
    fireEvent.click(collapseButton);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();

    fireEvent.click(collapseButton);
    expect(screen.queryByText(/Dashboard/i)).toBeNull();
  });
});
