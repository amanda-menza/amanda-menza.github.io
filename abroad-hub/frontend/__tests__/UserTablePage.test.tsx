// import {
//     render,
//     screen,
//     fireEvent,
//     waitFor,
//     act,
//     RenderResult,
//   } from "@testing-library/react";
//   import { describe, it, expect, vi, beforeEach, Mock, afterEach } from "vitest";
//   import UserDetail from "../src/app/administrator/dashboard/user-management/page";
//   import api from "../src/api";
//   import { AppRouterContextProviderMock } from "../src/components/app-router-context-provider-mock";
//   import { UserTableData } from "../src/types/models";
  
//   // Mock the API module
//   vi.mock("../src/api");
//   vi.mock("@/lib/utils", () => ({
//     getStoredUserData: vi.fn().mockReturnValue({ user_type: "Admin" }), // or mock null here
//     isStudent: vi.fn(),
//     cn: (...args: any) => args.filter(Boolean).join(" "),
//     checkDeadlinePassed: vi.fn().mockReturnValue(false),
//     checkAppIsOpen: vi.fn().mockReturnValue(true),
//   }));
  
//   const mockUsers: UserTableData[] = [
//     {
//         id: 1,
//         display_name: "Alice",
//         user: {
//             username: "alice123",
//             email: "alice@gmail.com"
//         },
//         user_type: "Student"
        
//     },
//     {
//         id: 1,
//         display_name: "Alice",
//         user: {
//             username: "alice123",
//             email: "alice@gmail.com"
//         },
//         user_type: "Student"
//     },
//   ];
  
//   describe("Users Component", () => {
//     const push = vi.fn();
  
//     beforeEach(() => {
//       vi.clearAllMocks();
//       (api.get as Mock).mockImplementation((url: string) => {
//         if (url === "/api/user-management/") {
//           return Promise.resolve({ data: mockUsers });
//         }
//         return Promise.reject(new Error(`Unhandled URL: ${url}`));
//       });
//     });
  
//     afterEach(() => {
//       vi.clearAllMocks();
//     });
  
//     const renderComponent = async (): Promise<RenderResult> => {
//       let result: RenderResult;
  
//       await act(async () => {
//         result = render(
//           <AppRouterContextProviderMock router={{ push }}>
//             <UserDetail />
//           </AppRouterContextProviderMock>
//         );
//       });
  
//       // Wait for any state updates to complete
//       await act(async () => {
//         await new Promise((resolve) => setTimeout(resolve, 0));
//       });
  
//       return result!;
//     };
  
//     it("renders users list successfully", async () => {
//       // Setup API mock spy
//       const getSpy = vi.spyOn(api, "get");
  
//       // Wait for the programs to be rendered
//       await waitFor(
//         () => {
//           expect(getSpy).toHaveBeenCalledWith("/api/user-management/");
//           const aliceUser = screen.queryByText("Alice");
//           const bobUser = screen.queryByText("Bob");
  
//           if (!aliceUser || !bobUser) {
//             throw new Error("Users not found");
//           }
  
//           expect(aliceUser).toBeInTheDocument();
//           expect(bobUser).toBeInTheDocument();
//         },
//         { timeout: 3000 }
//       ); // Increased timeout
//     });
  
//     it("filters users based on search query", async () => {
//       await renderComponent();
  
//       await waitFor(
//         () => {
//           expect(screen.getByText("Alice")).toBeInTheDocument();
//         },
//         { timeout: 3000 }
//       );
  
//       const searchInput = screen.getByPlaceholderText(
//         "Filter by name..."
//       );
  
//       await act(async () => {
//         fireEvent.change(searchInput, { target: { value: "Bob" } });
//       });
  
//       await waitFor(() => {
//         expect(screen.queryByText("Bob")).not.toBeInTheDocument();
//         expect(screen.getByText("Alice")).toBeInTheDocument();
//       });
//     });
//   });
  