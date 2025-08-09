import * as React from "react";
import { Package, Settings2, SquareTerminal, Users } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuthStore, type UserRole } from "@/stores/authStore"; // Import UserRole from authStore
import { Link } from "react-router";
// import { IMAGE_URL } from "@/lib/utils";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user);

  // Remove the local type definition and use the imported one
  const roleBasedMenus: Record<
    UserRole,
    Array<{
      title: string;
      url: string;
      icon: any;
      isActive?: boolean;
    }>
  > = {
    admin: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: SquareTerminal,
        isActive: true,
      },
      {
        title: "Products",
        url: "/products",
        icon: Package,
      },
      {
        title: "Users",
        url: "/users",
        icon: Users,
      },
      {
        title: "Settings",
        url: "/account",
        icon: Settings2,
      },
    ],
    user: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: SquareTerminal,
        isActive: true,
      },
      {
        title: "Products",
        url: "/products",
        icon: Package,
      },
      {
        title: "Settings",
        url: "/account",
        icon: Settings2,
      },
    ],
  };

  // Helper function with proper typing
  const getNavMenuForRole = (
    role: UserRole | undefined
  ): Array<{
    title: string;
    url: string;
    icon: any;
    isActive?: boolean;
  }> => {
    // Default to user role if undefined or invalid role
    const validRole: UserRole = role && role in roleBasedMenus ? role : "user";
    return roleBasedMenus[validRole];
  };

  const data = {
    user: {
      name: user?.name || "Kaisar",
      email: user?.email || "Kaisar@example.com",
      // avatar: `${IMAGE_URL}${user?.avatar}` || "",
      avatar: user?.avatar || "",
    },
    navMain: getNavMenuForRole(user?.role),
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg p-1 border-2">
                  <Package />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Inventory</span>
                  <span className="truncate text-xs">Management</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
