"use client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import useRedirectToSignIn from "@/modules/auth/ui/components/useRedirectToSignIn";
import {
  ChevronDown,
  FlameIcon,
  HomeIcon,
  PlaySquareIcon,
  UsersIcon,
  CreditCardIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { title: "Home", url: "/main", icon: HomeIcon },
  { title: "Work in Progress", url: "/", icon: FlameIcon },
];

function MainFeaturesSection() {
  const { status, data } = useSession();
  const redirectToSignIn = useRedirectToSignIn();
  const pathname = usePathname();
  const role = data?.user?.role;

  // check if current path matches any of the admin dashboard routes
  const isDashboardActive =
    pathname === "/dashboard" ||
    pathname.startsWith("/credits") ||
    pathname.startsWith("/users");

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        {/* Collapsible section for admin dashboard */}
        {role === "admin" && (
          <Collapsible
            defaultOpen={isDashboardActive}
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="ps-0">
                    <CollapsibleTrigger className="hover:bg-accent flex w-full items-center gap-3 rounded-md py-2 text-sm transition-colors">
                      <PlaySquareIcon size={16} />
                      <span>Dashboard</span>
                      <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </CollapsibleTrigger>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>

              <CollapsibleContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard"}
                      tooltip="Dashboard Overview"
                    >
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3"
                        onClick={(e) => {
                          if (status !== "authenticated") {
                            e.preventDefault();
                            redirectToSignIn();
                          }
                        }}
                      >
                        <PlaySquareIcon size={10} />
                        <span className="text-sm">Overview</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith("/credits")}
                      tooltip="Credits"
                    >
                      <Link
                        href="/dashboard/credits"
                        className="flex items-center gap-3"
                        onClick={(e) => {
                          if (status !== "authenticated") {
                            e.preventDefault();
                            redirectToSignIn();
                          }
                        }}
                      >
                        <CreditCardIcon size={10} />
                        <span className="text-sm">Credits</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith("/users")}
                      tooltip="Users"
                    >
                      <Link
                        href="/dashboard/users"
                        className="flex items-center gap-3"
                        onClick={(e) => {
                          if (status !== "authenticated") {
                            e.preventDefault();
                            redirectToSignIn();
                          }
                        }}
                      >
                        <UsersIcon size={10} />
                        <span className="text-sm">Users</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {/* Non-admin visible items */}
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item?.title} className="py-2">
              <SidebarMenuButton
                tooltip={item?.title}
                asChild
                isActive={item?.url === pathname}
              >
                <Link
                  prefetch
                  href={item?.url ?? "/"}
                  className="flex items-center gap-4"
                >
                  {item?.icon && <item.icon />}
                  <span className="text-sm">{item?.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default MainFeaturesSection;
