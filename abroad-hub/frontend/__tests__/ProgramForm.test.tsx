import { describe, it, vi, expect } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import ProgramForm from "../src/components/ProgramForm";
import {
  ProgramFormProps,
  AppUser,
  SemesterType,
  UserType,
} from "../src/types/models";
import api from "../src/api";
import { useRouter } from "next/navigation";
import { AppRouterContextProviderMock } from "../src/components/app-router-context-provider-mock";

const mockProgramProps: ProgramFormProps = {
  titleDefault: "Test Program",
  locationDefault: "Test Location",
  yearDefault: "2025",
  semesterDefault: SemesterType.Spring,
  facultyLeadsDefault: [{ id: 1, display_name: "John Doe" }],
  descriptionDefault: "This is a test program.",
  applicationOpenDateDefault: "2025-01-01",
  applicationDeadlineDefault: "2025-01-15",
  startDateDefault: "2025-06-01",
  essentialDocDeadlineDefault: "2025-06-01",
  endDateDefault: "2025-08-01",
  route: "/test-route",
  method: "post",
};

const mockProgramPropsEmpty: ProgramFormProps = {
  titleDefault: "",
  locationDefault: "",
  yearDefault: "2025",
  semesterDefault: SemesterType.Spring,
  facultyLeadsDefault: [],
  descriptionDefault: "",
  applicationOpenDateDefault: "",
  applicationDeadlineDefault: "",
  startDateDefault: "",
  endDateDefault: "",
  essentialDocDeadlineDefault: "",
  route: "/test-route",
  method: "post",
};

const mockFaculty: AppUser[] = [
  {
    id: 1,
    user: {
      id: 1,
      username: "john_doe",
      email: "john.doe@example.com",
    },
    user_type: UserType.Admin,
    display_name: "John Doe",
    profile: {
      id: 1,
      user: {} as AppUser,
      major: null,
      gpa: null,
    },
  },
  {
    id: 2,
    user: {
      id: 2,
      username: "jane_smith",
      email: "jane.smith@example.com",
    },
    user_type: UserType.Admin,
    display_name: "Jane Smith",
    profile: {
      id: 2,
      user: {} as AppUser,
      major: null,
      gpa: null,
    },
  },
];
const push = vi.fn();

const renderProgramForm = (appProps: ProgramFormProps) => {
  render(
    <AppRouterContextProviderMock router={{ push }}>
      <ProgramForm programProps={appProps} facultyMembers={mockFaculty} />
    </AppRouterContextProviderMock>
  );
};

describe("ProgramForm Component", () => {
  it("renders the program form with default values", () => {
    renderProgramForm(mockProgramProps);

    expect(screen.getByLabelText(/Title/i)).toHaveValue(
      mockProgramProps.titleDefault
    );
    expect(screen.getByLabelText(/Location/i)).toHaveValue(
      mockProgramProps.locationDefault
    );
    expect(screen.getByLabelText(/Year/i)).toHaveValue(
      mockProgramProps.yearDefault.toString()
    );
    expect(screen.getByLabelText(/Semester/i)).toHaveValue(
      mockProgramProps.semesterDefault
    );
    //@TODO: add correct test

    // const selectContainer = screen.getByRole("combobox", {
    //   name: /Faculty Leads/i,
    // });
    // const valueElement = within(selectContainer).getByText("Jane Doe");
    // expect(valueElement).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toHaveValue(
      mockProgramProps.descriptionDefault
    );
    expect(screen.getByLabelText(/Application Open Date/i)).toHaveValue(
      mockProgramProps.applicationOpenDateDefault
    );
    expect(screen.getByLabelText(/Application Deadline/i)).toHaveValue(
      mockProgramProps.applicationDeadlineDefault
    );
    expect(screen.getByLabelText(/Start Date/i)).toHaveValue(
      mockProgramProps.startDateDefault
    );
    expect(screen.getByLabelText(/End Date/i)).toHaveValue(
      mockProgramProps.endDateDefault
    );
    expect(screen.getByLabelText(/Document Deadline/i)).toHaveValue(
      mockProgramProps.essentialDocDeadlineDefault
    );
  });

  it("validates the required fields", async () => {
    renderProgramForm(mockProgramPropsEmpty);

    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(screen.getByText(/Title is required./i)).toBeInTheDocument();
      expect(screen.getByText(/Location is required./i)).toBeInTheDocument();
      expect(
        screen.getByText(/At least one faculty lead is required./i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Description is required./i)).toBeInTheDocument();
      expect(screen.getByText(/Open date is required./i)).toBeInTheDocument();
      expect(screen.getByText(/Deadline is required./i)).toBeInTheDocument();
      expect(screen.getByText(/Start date is required./i)).toBeInTheDocument();
      expect(screen.getByText(/End date is required./i)).toBeInTheDocument();
      expect(
        screen.getByText(/Document deadline date is required./i)
      ).toBeInTheDocument();
    });
  });
  it("validates the title field", async () => {
    renderProgramForm(mockProgramProps);

    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: {
        value:
          "A very long title that exceeds eighty characters to test the validation logic for the title field.",
      },
    });
    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(
        screen.getByText(/Title cannot exceed 80 characters./i)
      ).toBeInTheDocument();
    });
  });
  it("validates the location field", async () => {
    renderProgramForm(mockProgramProps);

    fireEvent.change(screen.getByLabelText(/Location/i), {
      target: {
        value:
          "A very long location name that exceeds the maximum allowed length of one hundred characters to test validation.",
      },
    });
    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(
        screen.getByText(/Location cannot exceed 100 characters./i)
      ).toBeInTheDocument();
    });
  });

  it("checks date validation logic", async () => {
    renderProgramForm(mockProgramProps);

    fireEvent.change(screen.getByLabelText(/Application Deadline/i), {
      target: { value: "2025-01-01" },
    });
    fireEvent.change(screen.getByLabelText(/Open Date/i), {
      target: { value: "2025-01-02" },
    });
    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(
        screen.getByText(/Deadline must be after or equal to the open date./i)
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Application Deadline/i), {
      target: { value: "2025-01-03" },
    });
    fireEvent.change(screen.getByLabelText(/Start Date/i), {
      target: { value: "2025-01-02" },
    });
    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(
        screen.getByText(/Start date must be after or equal to the deadline./i)
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Start Date/i), {
      target: { value: "2025-01-04" },
    });
    fireEvent.change(screen.getByLabelText(/End Date/i), {
      target: { value: "2025-01-02" },
    });
    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(
        screen.getByText(/End date must be after or equal to the start date./i)
      ).toBeInTheDocument();
    });
  });

  it("validates the semester field", async () => {
    renderProgramForm(mockProgramProps);

    // Select "Winter" (an invalid value)
    fireEvent.change(screen.getByLabelText(/Semester/i), {
      target: { value: "Winter" }, // Invalid value not in the enum
    });
    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Invalid enum value. Expected 'Fall' | 'Spring' | 'Summer', received 'Winter'/i
        )
      ).toBeInTheDocument();
    });

    // Select "Fall" (a valid value)
    fireEvent.change(screen.getByLabelText(/Semester/i), {
      target: { value: "Fall" }, // Valid value
    });
    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(screen.queryByText(/Invalid enum value/i)).not.toBeInTheDocument();
    });
  });

  it("submits the form with valid data", async () => {
    renderProgramForm(mockProgramProps);

    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: "New Program" },
    });
    fireEvent.change(screen.getByLabelText(/Location/i), {
      target: { value: "New Location" },
    });

    const mockPost = vi
      .spyOn(api, "post")
      .mockResolvedValue({ data: { id: 1 } });

    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        mockProgramProps.route,
        expect.objectContaining({
          title: "New Program",
          location: "New Location",
        })
      );
    });

    expect(push).toHaveBeenCalledWith("/administrator/dashboard/programs/1/");
  });
});
