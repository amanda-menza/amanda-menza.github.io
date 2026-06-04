"use client";

import Link from "next/link";
import {
  Home,
  GraduationCap,
  Users,
  FileText,
  PaintRoller,
  FileHeart,
  FileSearch2,
  LayoutDashboard,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { AppUser, UserRoles } from "@/types/models";

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const NavLink = ({ href, icon, children }: NavLinkProps) => (
  <Link
    href={href}
    className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
    style={{ color: 'var(--secondary-color)' }}
  >
    {icon}
    <span className="ml-2">{children}</span>
  </Link>
);

interface AdminNavBarProps {
  user: AppUser | null;
}

export function AdminNav({ user }: AdminNavBarProps) {
  const isAnAdmin = user?.roles.includes(UserRoles.Administrator);
  const isUserAdmin = user?.username === "admin";

  return (
    <nav className="flex items-center space-x-4">
      <NavLink
        href="/administrator/dashboard/"
        icon={<Home className="h-4 w-4" />}
      >
        Home
      </NavLink>
      {/* <NavLink
        href="/administrator/dashboard"
        icon={<LayoutDashboard className="h-4 w-4" />}
      >
        Dashboard
      </NavLink> */}
      <NavLink
        href="/administrator/dashboard/programs"
        icon={<FileSearch2 className="h-4 w-4" />}
      >
        Programs Overview
      </NavLink>
      <NavLink
        href="/administrator/dashboard/student-program-view"
        icon={<GraduationCap className="h-4 w-4" />}
      >
        Student Program View
      </NavLink>
      {isAnAdmin ? (
        <NavLink
          href="/administrator/dashboard/user-management"
          icon={<Users className="h-4 w-4" />}
        >
          User Management
        </NavLink>
      ) : null}
      {isUserAdmin ? (
        <NavLink
          href="/administrator/dashboard/graphics"
          icon={<PaintRoller className="h-4 w-4" />}
        >
          Graphics and Styling
        </NavLink>
      ) : null}
    </nav>
  );
}

export function StudentNav() {
  return (
    <nav className="flex items-center space-x-4">
      <NavLink href="/dashboard" icon={<Home className="h-4 w-4" />}>
        Home
      </NavLink>
      {/* <NavLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>
        Dashboard
      </NavLink> */}
      <NavLink
        href="/dashboard/programs"
        icon={<GraduationCap className="h-4 w-4" />}
      >
        Browse All Programs
      </NavLink>
      {/* <NavLink
        href="/dashboard/applications"
        icon={<FileText className="h-4 w-4" />}
      >
        My Applications
      </NavLink> */}
      <NavLink
        href="/dashboard/myprograms"
        icon={<FileHeart className="h-4 w-4" />}
      >
        My Programs
      </NavLink>
    </nav>
  );
}

export function PartnerNav() {
  return (
    <nav className="flex items-center space-x-4">
      <NavLink href="/partner" icon={<Home className="h-4 w-4" />}>
        Home
      </NavLink>
      <NavLink
        href="/partner/programs"
        icon={<GraduationCap className="h-4 w-4" />}
      >
        My Program List
      </NavLink>
    </nav>
  );
}
