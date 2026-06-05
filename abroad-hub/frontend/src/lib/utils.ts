import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AppUser, UserRoles } from "../types/models";
import api from "../api";
import { JwtPayload } from "jwt-decode";
import { ACCESS_TOKEN } from "@/constants";
import logger from "../components/Logger";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to store user data in localStorage
export const storeUserData = (user: AppUser | null) => {
  // Assuming 'user' is an object, you can store it as a JSON string
  localStorage.setItem("user", JSON.stringify(user));
};

// Function to retrieve user data from localStorage
export const getStoredUserData = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null; // Parse the JSON string back to an object
};

// Function to remove user data from localStorage
export const removeUserData = () => {
  localStorage.removeItem("user");
};

export const isStudent = () => {
  const user = getStoredUserData();
  if (user.roles.includes(UserRoles.Student)) {
    return true;
  }
  return false;
};

export const isPartner = () => {
  const user = getStoredUserData();
  if (user.roles.includes(UserRoles.Partner)) {
    return true;
  }
  return false;
};

export const isAdminType = () => {
  const user = getStoredUserData();
  if (
    user.roles.some((role: UserRoles) =>
      [UserRoles.Reviewer, UserRoles.Administrator, UserRoles.Faculty].includes(
        role
      )
    )
  ) {
    return true;
  }
  return false;
};

export interface CustomJwtPayload extends JwtPayload {
  roles: UserRoles[];
}

export async function fetchCurrentUser() {
  const token = localStorage.getItem(ACCESS_TOKEN);
  if (token)
    try {
      const res = await api.get("/api/current-user/");
      storeUserData(res.data);
      return res.data;
    } catch (error) {
      logger.error("Failed to fetch user profile:", error);
      storeUserData(null);
      return null;
    }
  else return;
}

export function checkDeadlinePassed(deadline: string) {
  const today = new Date();
  const programDeadline = new Date(deadline);
  return today > programDeadline;
}

export function checkAppIsOpen(open_date: string, deadline: string) {
  const today = new Date();
  const openDate = new Date(open_date);
  return today >= openDate && !checkDeadlinePassed(deadline);
}

export async function fetchCurrentUserRoles() {
  const user: AppUser = await fetchCurrentUser();
  return user.roles;
}
