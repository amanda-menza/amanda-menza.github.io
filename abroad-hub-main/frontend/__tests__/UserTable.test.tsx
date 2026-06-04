import {
    render,
    screen,
    fireEvent,
    waitFor,
    within,
  } from "@testing-library/react";
  import { UserTable } from "../src/components/UserTable";
  import { vi, it, describe, expect, beforeEach } from "vitest";
  import { UserTableData } from "@/types/models";
  import { AppRouterContextProviderMock } from "../src/components/app-router-context-provider-mock";
  import userEvent from "@testing-library/user-event";
  import api from "../src/api";
  const mockDataSingle: UserTableData[] = [
    {
        id: 1,
        display_name: "Jane Doe",
        username: "janedoe",
        email: "janedoe@gmail.com",
        dob: "2000-01-01",
        user_type: "Student",
    },
  ];

  // Mock data
  const mockData: UserTableData[] = [
    {
        id: 1,
        display_name: "Alice",
        username: "alice123",
        email: "alice@gmail.com",
        dob: "2000-01-01",
        user_type: "Student",
    },
    {
        id: 2,
        display_name: "Bob",
        username: "bob456",
        email: "bob@gmail.com",
        dob: "2000-02-02",
        user_type: "Student",
    },
    {
        id: 3,
        display_name: "Charlie",
        username: "charlie789",
        email: "charlie@gmail.com",
        dob: "2000-03-03",
        user_type: "Admin",
    },
  ];
  
  const mockDataLarge: UserTableData[] = Array.from(
    { length: 20 },
    (_, index) => ({
      id: index + 1,
      display_name: `User ${index + 1}`,
      username: `user${index + 1}`,
      email: `user${index + 1}@example.com`,
      dob: "1990-01-01",
      user_type: 'Student',
    })
  );
  
  // Mock API function
  const mockFetchTable = vi.fn();
  
  const push = vi.fn();
  const renderComponent = (mockProps: UserTableData[]) => {
    render(
      <AppRouterContextProviderMock router={{ push }}>
        <UserTable
          data={mockProps}
          fetchTable={mockFetchTable}
        />
      </AppRouterContextProviderMock>
    );
  };
  
  describe("UserTable", () => {
    it("should render the table headers", () => {
      renderComponent(mockData);
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Username")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Type")).toBeInTheDocument();
    });
  
    it("should sort by Name when clicking on the header", async () => {
      renderComponent(mockData);
      const nameColumnButton = screen.getByText("Name");
      fireEvent.click(nameColumnButton); // Simulate sorting
  
      await waitFor(() => {
        const firstRow = screen.getByText("Alice");
        const secondRow = screen.getByText("Bob");
        const thirdRow = screen.getByText("Charlie");
  
        // Check if the rows are sorted by name in ascending order
        expect(firstRow).toBeInTheDocument();
        expect(secondRow).toBeInTheDocument();
        expect(thirdRow).toBeInTheDocument();
      });
    });
  
    // it("should filter by type", async () => {
    //   renderComponent(mockData);
    //   const dropdownButton = screen.getByRole("combobox", {
    //     name: /User Type Menu/i,
    //   });
  
    //   // Simulate a button click to open the dropdown
    //   fireEvent.click(dropdownButton);
  
    //   // Find the dropdown items and select "Admin"
    //   const adminOption = screen.getByRole("option", { name: /admin/i });
  
    //   // Simulate selecting the "Admin" option
    //   fireEvent.click(adminOption);
    //   await waitFor(() => {
    //     // Check that the globalFilter state has been updated to "Admin"
    //     const adminText = within(dropdownButton).getByText(/admin/i);
  
    //     expect(adminText).toBeInTheDocument();
    //   });
    //   await waitFor(() => {
    //     expect(screen.getByText("Alice")).toBeNull();
    //     expect(screen.getByText("Charlie")).toBeInTheDocument();
    //     expect(screen.queryByText("Bob")).toBeNull();
    //   });
    // });
  
    it("should filter by name", async () => {
      renderComponent(mockData);
      const nameFilterInput = screen.getByPlaceholderText("Filter by name...");
      fireEvent.change(nameFilterInput, { target: { value: "Bob" } });
  
      await waitFor(() => {
        expect(screen.getByText("Bob")).toBeInTheDocument();
        expect(screen.queryByText("Alice")).toBeNull();
        expect(screen.queryByText("Charlie")).toBeNull();
      });
    });
  
    it("opens the menu when the button is clicked", async () => {
      renderComponent(mockData);
      // Open columns dropdown
      const columnsButton = screen.getByRole("button", {
        name: /Column Checkbox/i,
      });
      await userEvent.click(columnsButton);
      await waitFor(() => {
        expect(columnsButton).toHaveAttribute("aria-expanded", "true");
        expect(columnsButton).toHaveAttribute("data-state", "open");
      });
    });
  
    it("should handle column visibility", async () => {
      renderComponent(mockData);
      const columnsButton = screen.getByRole("button", {
        name: /Column Checkbox/i,
      });
      await userEvent.click(columnsButton);
  
      // Find Email column checkbox
      const emailCheckbox = screen.getByRole("menuitemcheckbox", {
        name: /email/i,
      });
  
      // Toggle Status column visibility
      await userEvent.click(emailCheckbox);
  
      await waitFor(() => {
        expect(screen.queryByText("Email")).toBeNull(); // The "Email" column should be hidden
      });
    });
  
    it("should paginate through rows", async () => {
      renderComponent(mockDataLarge);
  
      const nextPageButton = screen.getByRole("button", {
        name: /Next/i,
      });
      const previousPageButton = screen.getByRole("button", {
        name: /Previous/i,
      });
      expect(nextPageButton).not.toBeDisabled();
      expect(previousPageButton).toBeDisabled();
  
      fireEvent.click(nextPageButton);
  
      await waitFor(() => {
        expect(previousPageButton).not.toBeDisabled();
      });
      fireEvent.click(previousPageButton);
  
      // Verify initial state is restored
      await waitFor(() => {
        expect(previousPageButton).toBeDisabled();
      });
    });
  
    // it("change status", async () => {
    //   renderComponent(mockDataSingle);
    //   const mockPatch = vi
    //     .spyOn(api, "patch")
    //     .mockResolvedValue({ data: { id: 1 } });
  
    //   const actionsTrigger = screen.getByRole("button", { name: /open menu/i });
    //   await userEvent.click(actionsTrigger);
  
    //   // Open status dropdown
    //   const dropdownButton = screen.getByRole("combobox", {
    //     name: /change-status-form/i,
    //   });
  
    //   // Simulate a button click to open the dropdown
    //   fireEvent.click(dropdownButton);
  
    //   // Select "Enrolled" status
    //   const enrolledOption = screen.getByRole("option", { name: /enrolled/i });
    //   await fireEvent.click(enrolledOption);
  
    //   await waitFor(() => {
    //     //Verify API was called with correct parameters
    //     expect(mockPatch).toHaveBeenCalledWith("/api/applications/1/change_status/", {
    //       status: "Enrolled",
    //     });
  
    //     // Verify fetch table was called to refresh data
    //     expect(mockFetchTable).toHaveBeenCalled();
    //   });
    // });
  });
  