"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { AppUser, UserRoles } from "../types/models";
import { useRouter } from "next/navigation";
import { AdminNav, PartnerNav, StudentNav } from "./navbar";
import { isPartner, isStudent } from "@/lib/utils";
import { useEffect, useState } from "react";
import api from "@/api";

export interface HeaderProps {
  user: AppUser | null;
  is_student: boolean | null;
  is_admin_role: boolean | null;
  is_partner: boolean | null;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  is_student,
  is_admin_role,
  is_partner,
}) => {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await api.get("/api/logo-image/");
        setLogoUrl(response.data.logo_url);
      } catch (error) {
        console.error("Failed to fetch logo", error);
      }
    };
  
    fetchLogo();
  }, []);

  return (
    <header className="bg-[var(--theme-color)] shadow-sm w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Top section with logo and avatar */}
        <div className="mx-auto relative flex items-center py-4">
          {/* Left Spacer */}
          <div className="w-[100px]" />
          {/* Centered Logo */}
          <div className="flex-1 flex justify-center">
          <Image
            src={logoUrl || "/abroad-hub-logo.png"} // fallback if logo not available
            alt="Abroadhub Logo"
            width={100}
            height={75}
            className="object-contain"
            priority
          />
          </div>
          {/* Right Section with fixed width */}
          <div className="w-[100px] flex justify-end">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                    aria-label="User Avatar Menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.display_name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.username}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {is_student ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/profile`)}
                      >
                        Profile
                      </DropdownMenuItem>
                      {!user.is_sso && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/dashboard/profile/change-password`)
                            }
                          >
                            Change Password
                          </DropdownMenuItem>
                        </>
                      )}
                    </>
                  ) : is_admin_role ? (
                    <>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/administrator/dashboard/profile`)
                        }
                      >
                        Profile
                      </DropdownMenuItem>
                      {!user.is_sso && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/administrator/dashboard/profile/change-password`
                              )
                            }
                          >
                            Change Password
                          </DropdownMenuItem>
                        </>
                      )}
                    </>
                  ) : is_partner ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => router.push(`/partner/profile`)}
                      >
                        Profile
                      </DropdownMenuItem>
                      {!user.is_sso && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/partner/profile/change-password`)
                            }
                          >
                            Change Password
                          </DropdownMenuItem>
                        </>
                      )}
                    </>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      if (user.is_sso) {
                        window.location.href =
                          "https://oauth.oit.duke.edu/oidc/logout.jsp";
                        localStorage.clear();
                      } else {
                        router.push(`/logout`);
                      }
                    }}
                  >
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
              onClick={() => router.push(`/sso/login`)}
              className="bg-gray-200 text-black py-2 px-4 rounded-md"
              >Log In</Button>
            )}
          </div>
        </div>

        {/* Navigation section below */}
        {user && (
          <div className="border-t w-full" style={{ borderColor: 'var(--secondary-color)' }}>
            <div className="py-2 max-w-7xl">
              {is_student ? (
                <StudentNav />
              ) : is_admin_role ? (
                <AdminNav user={user} />
              ) : is_partner ? (
                <PartnerNav />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
