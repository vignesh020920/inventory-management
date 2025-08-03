import { ChevronRight, type LucideIcon } from "lucide-react";
import { useLocation } from "react-router";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const location = useLocation();

  // Helper function to check if a path is active
  const isPathActive = (url: string) => {
    // Exact match for root paths
    if (url === "/dashboard" && location.pathname === "/dashboard") {
      return true;
    }

    // For other paths, check if current path starts with the menu item path
    if (url !== "/dashboard" && location.pathname.startsWith(url)) {
      return true;
    }

    return false;
  };

  // Helper function to check if any sub-item is active
  const hasActiveSubItem = (
    subItems: { title: string; url: string }[] | undefined
  ) => {
    if (!subItems) return false;
    return subItems.some((subItem) => isPathActive(subItem.url));
  };

  // Helper function to determine if collapsible should be open
  const shouldBeOpen = (item: (typeof items)[0]) => {
    return (
      item.isActive || isPathActive(item.url) || hasActiveSubItem(item.items)
    );
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menus</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isMainItemActive = isPathActive(item.url);
          const hasActiveChild = hasActiveSubItem(item.items);
          const isOpen = shouldBeOpen(item);

          return (
            <Collapsible key={item.title} asChild defaultOpen={isOpen}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "transition-colors",
                    (isMainItemActive || hasActiveChild) &&
                      "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}
                >
                  <Link to={item.url}>
                    <item.icon
                      className={cn(
                        "transition-colors",
                        (isMainItemActive || hasActiveChild) &&
                          "text-sidebar-accent-foreground"
                      )}
                    />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>

                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction
                        className={cn(
                          "data-[state=open]:rotate-90 transition-transform",
                          (isMainItemActive || hasActiveChild) &&
                            "text-sidebar-accent-foreground"
                        )}
                      >
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const isSubItemActive = isPathActive(subItem.url);

                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                className={cn(
                                  "transition-colors",
                                  isSubItemActive &&
                                    "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                )}
                              >
                                <Link to={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
