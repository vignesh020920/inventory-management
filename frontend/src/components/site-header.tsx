import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import Breadcrumbs from "@/utils/breadcrumbs";

export function SiteHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 rounded-t-xl">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 h-4 bg-gray-200 dark:bg-gray-700"
        />
        <Breadcrumbs />
      </div>
      <div className="ml-auto px-4">
        <ThemeToggle />
      </div>
    </header>
  );
}
