import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StatusChangeForm } from "../src/components/StatusChangeForm";
import api from "../src/api"; // Mock API
import { describe, it, expect, vi } from "vitest"; // Correct imports for vitest
import { test } from "vitest";

const fetchApplication = vi.fn().mockResolvedValue({});

describe("StatusChangeForm", () => {
  it("should render the change status button initially", () => {
    render(
      <StatusChangeForm fetchApplication={fetchApplication} applicationId="1" />
    );

    // Check if the Change Status button is rendered
    expect(screen.getByText(/Change Status/i)).toBeInTheDocument();
  });

  it("should open the form when the button is clicked", () => {
    render(
      <StatusChangeForm fetchApplication={fetchApplication} applicationId="1" />
    );

    // Click on the 'Change Status' button
    fireEvent.click(screen.getByText(/Change Status/i));

    // Check if the form is rendered
    expect(screen.getByText(/Change Application Status/i)).toBeInTheDocument();
  });
  <StatusChangeForm fetchApplication={fetchApplication} applicationId="1" />;

  it("should close the form when cancel button is clicked", () => {
    render(
      <StatusChangeForm fetchApplication={fetchApplication} applicationId="1" />
    );

    // // Open the form
    fireEvent.click(screen.getByText(/Change Status/i));

    // Submit the form
    fireEvent.submit(screen.getByRole("form"));

    // Click cancel button specifically
    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    // Check if the form is not in the document anymore
    expect(screen.queryByRole("form")).toBeNull();
  });

  it("should show validation error when status is not selected", async () => {
    render(
      <StatusChangeForm fetchApplication={fetchApplication} applicationId="1" />
    );

    // Open the form
    fireEvent.click(screen.getByText(/Change Status/i));

    // Submit the form without selecting a status
    fireEvent.submit(screen.getByRole("form"));

    // Check for validation error
    await waitFor(() =>
      expect(screen.getByText("Please select a status.")).toBeInTheDocument()
    );
  });

  it("should submit the form and call API on valid status selection", async () => {
    // Mock the API patch function
    const mockPatch = vi
      .spyOn(api, "patch")
      .mockResolvedValue({ data: { id: 1 } });

    render(
      <StatusChangeForm fetchApplication={fetchApplication} applicationId="1" />
    );

    // Open the form
    fireEvent.click(screen.getByText(/Change Status/i));
    const button = screen.getByText(/Select a status/i);

    fireEvent.click(button);

    const canceledOption = screen.getByRole("option", { name: /Canceled/i });
    fireEvent.click(canceledOption);

    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() =>
      expect(mockPatch).toHaveBeenCalledWith("/applications/1/change_status/", {
        status: "Canceled",
      })
    );

    expect(fetchApplication).toHaveBeenCalled();

    await waitFor(() =>
      expect(
        screen.queryByText("Change Application Status")
      ).not.toBeInTheDocument()
    );
  });
});
