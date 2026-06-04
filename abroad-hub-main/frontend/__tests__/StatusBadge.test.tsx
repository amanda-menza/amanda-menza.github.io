import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../src/components/StatusBadge";
import { ApplicationStatus } from "@/types/models";

test.each([
  { status: ApplicationStatus.Withdrawn as const, expectedClass: "bg-red-500" },
  { status: ApplicationStatus.Applied as const, expectedClass: "bg-blue-500" },
  {
    status: ApplicationStatus.Enrolled as const,
    expectedClass: "bg-green-500",
  },
  { status: ApplicationStatus.Canceled as const, expectedClass: "bg-red-500" },
  {
    status: ApplicationStatus.Not_Applied as const,
    expectedClass: "bg-red-500",
  },
])(
  "StatusBadge renders with correct text and color for status: $status",
  ({ status, expectedClass }) => {
    render(<StatusBadge status={status} />);

    // Check for correct text
    const badge = screen.getByText(status);
    expect(badge).toBeInTheDocument();

    // Check for correct class
    expect(badge).toHaveClass(expectedClass);
  }
);
