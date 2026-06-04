import { describe, it, vi, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ApplicationForm from "../src/components/ApplicationForm";
import { AppRouterContextProviderMock } from "../src/components/app-router-context-provider-mock";
import {
  ApplicationFormProps,
  AppUser,
  ApplicationStatus,
  UserType,
} from "@/types/models";
import api from "../src/api";

const mockUser: AppUser = {
  id: 1,
  user: {
    id: 1,
    username: "johndoe",
    first_name: "John",
    last_name: "Doe",
    email: "johndoe@example.com",
  },
  user_type: UserType.Student,
  display_name: "John Doe",
  profile: {
    id: 1,
    user: {} as AppUser,
    dob: "1995-05-20",
    major: "Computer Science",
    gpa: 3.7,
  },
};

const mockApplicationProps: ApplicationFormProps = {
  user: mockUser,
  q1Default: "",
  q2Default: "",
  q3Default: "",
  q4Default: "",
  q5Default: "",
  statusDefault: ApplicationStatus.Applied,
  method: "post",
  route: "/api/applications",
};

const mockApplicationPropsPatch: ApplicationFormProps = {
  user: mockUser,
  q1Default: "Answer 1",
  q2Default: "Answer 2",
  q3Default: "Answer 3",
  q4Default: "Answer 4",
  q5Default: "Answer 5",
  statusDefault: ApplicationStatus.Applied,
  method: "patch",
  route: "/api/applications",
};
const push = vi.fn();
const renderApplicationForm = (appProps: ApplicationFormProps) => {
  render(
    <AppRouterContextProviderMock router={{ push }}>
      <ApplicationForm applicationProps={appProps} />
    </AppRouterContextProviderMock>
  );
};

describe("ApplicationForm Component", () => {
  it("should render the form with all fields and submit button", () => {
    renderApplicationForm(mockApplicationProps);

    expect(screen.getByText(/Application Form/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date of Birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/GPA/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Major/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Question 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Question 2/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Question 3/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Question 4/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Question 5/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Submit Application/i })
    ).toBeInTheDocument();

    const dobInput = screen.getByLabelText(/date of birth/i); // Matches the "Date of Birth" label
    const gpaInput = screen.getByLabelText(/gpa/i); // Matches the "GPA" label
    const majorInput = screen.getByLabelText(/major/i); // Matches the "Major" label

    // Verify that the fields exist
    expect(dobInput).toBeInTheDocument();
    expect(gpaInput).toBeInTheDocument();
    expect(majorInput).toBeInTheDocument();
    expect(majorInput).toHaveValue("Computer Science");
    expect(dobInput).toHaveValue("1995-05-20");
    expect(gpaInput).toHaveValue(3.7);
  });

  it("should show validation errors for empty required fields", async () => {
    renderApplicationForm(mockApplicationProps);

    const submitButton = screen.getByRole("button", {
      name: /Submit Application/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Question 1 is required./i)).toBeInTheDocument();
      expect(screen.getByText(/Question 2 is required./i)).toBeInTheDocument();
      expect(screen.getByText(/Question 3 is required./i)).toBeInTheDocument();
      expect(screen.getByText(/Question 4 is required./i)).toBeInTheDocument();
      expect(screen.getByText(/Question 5 is required./i)).toBeInTheDocument();
    });
  });

  it("should submit the form with valid data", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const mockPost = vi
      .spyOn(api, "post")
      .mockResolvedValue({ data: { id: 123 } });

    renderApplicationForm(mockApplicationProps);

    fireEvent.change(screen.getByLabelText(/Question 1/i), {
      target: { value: "Answer 1" },
    });
    fireEvent.change(screen.getByLabelText(/Question 2/i), {
      target: { value: "Answer 2" },
    });
    fireEvent.change(screen.getByLabelText(/Question 3/i), {
      target: { value: "Answer 3" },
    });
    fireEvent.change(screen.getByLabelText(/Question 4/i), {
      target: { value: "Answer 4" },
    });
    fireEvent.change(screen.getByLabelText(/Question 5/i), {
      target: { value: "Answer 5" },
    });

    const submitButton = screen.getByRole("button", {
      name: /Submit Application/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/api/applications", {
        q1: "Answer 1",
        q2: "Answer 2",
        q3: "Answer 3",
        q4: "Answer 4",
        q5: "Answer 5",
      });
    });
    expect(push).toHaveBeenCalledWith("/dashboard/applications/123/");

    alertSpy.mockRestore();
    mockPost.mockRestore();
  });

  it("should update the form with valid data", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const mockPost = vi
      .spyOn(api, "patch")
      .mockResolvedValue({ data: { id: 123 } });

    renderApplicationForm(mockApplicationPropsPatch);

    fireEvent.change(screen.getByLabelText(/Question 1/i), {
      target: { value: "Answer 1 updated" },
    });

    const submitButton = screen.getByRole("button", {
      name: /Submit Application/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/api/applications", {
        q1: "Answer 1 updated",
        q2: "Answer 2",
        q3: "Answer 3",
        q4: "Answer 4",
        q5: "Answer 5",
      });
    });

    expect(push).toHaveBeenCalledWith("/dashboard/applications/123/");

    alertSpy.mockRestore();
    mockPost.mockRestore();
  });
});
