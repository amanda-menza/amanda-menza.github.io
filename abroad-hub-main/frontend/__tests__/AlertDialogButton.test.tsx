import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, expect } from "vitest";
import {
  AlertDialogButton,
  AlertDialogProps,
} from "../src/components/AlertDialogButton";

const mockClickAction = vi.fn();

const defaultProps: AlertDialogProps = {
  buttonTitle: "Delete",
  buttonVariant: "destructive",
  warningDescription: "This action cannot be undone.",
  clickAction: mockClickAction,
};

describe("AlertDialogButton", () => {
  it("renders the button with the correct title", () => {
    render(<AlertDialogButton alertDialogProps={defaultProps} />);

    const button = screen.getByRole("button", { name: /delete/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("m-4");
  });

  it("opens the alert dialog when the button is clicked", async () => {
    render(<AlertDialogButton alertDialogProps={defaultProps} />);

    const button = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(button);

    const dialogTitle = await screen.findByText(/are you absolutely sure\?/i);
    const dialogDescription = screen.getByText(
      /this action cannot be undone\./i
    );

    expect(dialogTitle).toBeInTheDocument();
    expect(dialogDescription).toBeInTheDocument();
  });

  it("calls the clickAction when the action button is clicked", async () => {
    render(<AlertDialogButton alertDialogProps={defaultProps} />);

    const button = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(button);

    const actionButton = await screen.findByRole("button", { name: /yes/i });
    fireEvent.click(actionButton);

    expect(mockClickAction).toHaveBeenCalled();
  });

  it("closes the alert dialog when the cancel button is clicked", async () => {
    render(<AlertDialogButton alertDialogProps={defaultProps} />);

    const button = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(button);

    const cancelButton = await screen.findByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    const dialogTitle = screen.queryByText(/are you absolutely sure\?/i);
    expect(dialogTitle).not.toBeInTheDocument();
  });
});
