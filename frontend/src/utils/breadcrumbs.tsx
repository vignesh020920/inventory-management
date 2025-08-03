// src/components/Breadcrumbs.tsx
import React, { useMemo } from "react";
import { Link, useLocation } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import pagesData, { type RouteConfig } from "../router/allRoutes";

interface BreadcrumbItem {
  name: string;
  path: string;
  isActive: boolean;
  isAccessible: boolean;
}

// Utility function to find route configuration
const findRouteConfig = (
  routes: RouteConfig[],
  targetPath: string,
  parentPath = ""
): RouteConfig | null => {
  for (const route of routes) {
    const fullPath = parentPath ? `${parentPath}/${route.path}` : route.path;
    const normalizedFullPath = fullPath.replace(/\/+/g, "/"); // Remove duplicate slashes
    const normalizedTargetPath = targetPath.replace(/\/+/g, "/");

    // Check if paths match (including dynamic segments)
    if (pathsMatch(normalizedFullPath, normalizedTargetPath)) {
      return route;
    }

    // Recursively search nested routes
    if (route.nestedRoutes) {
      const nestedMatch = findRouteConfig(
        route.nestedRoutes,
        targetPath,
        normalizedFullPath
      );
      if (nestedMatch) return nestedMatch;
    }
  }

  return null;
};

// Check if two paths match (supporting dynamic segments)
const pathsMatch = (routePath: string, actualPath: string): boolean => {
  const routeSegments = routePath.split("/").filter(Boolean);
  const actualSegments = actualPath.split("/").filter(Boolean);

  if (routeSegments.length !== actualSegments.length) {
    return false;
  }

  return routeSegments.every((routeSegment, index) => {
    const actualSegment = actualSegments[index];
    return (
      routeSegment.startsWith(":") || // Dynamic segment
      routeSegment.toLowerCase() === actualSegment.toLowerCase()
    );
  });
};

// Build breadcrumb path by traversing up the route hierarchy
const buildBreadcrumbPath = (
  routes: RouteConfig[],
  targetPath: string,
  breadcrumbs: BreadcrumbItem[] = []
): BreadcrumbItem[] => {
  const pathSegments = targetPath.split("/").filter(Boolean);

  // Build path incrementally
  for (let i = 0; i < pathSegments.length; i++) {
    const currentPath = "/" + pathSegments.slice(0, i + 1).join("/");
    const routeConfig = findRouteConfig(routes, currentPath);

    if (routeConfig?.meta?.breadcrumb) {
      breadcrumbs.push({
        name: routeConfig.meta.breadcrumb,
        path: currentPath,
        isActive: i === pathSegments.length - 1,
        isAccessible: true, // You can add role-based logic here
      });
    }
  }

  return breadcrumbs;
};

const Breadcrumbs: React.FC = () => {
  const location = useLocation();

  // Memoize breadcrumb computation
  const breadcrumbs = useMemo(() => {
    const path = location.pathname;
    const items: BreadcrumbItem[] = [];

    // Always add Dashboard as first item for nested routes
    if (path !== "/" && path !== "/login") {
      items.push({
        name: "Dashboard",
        path: "/dashboard",
        isActive: path === "/dashboard",
        isAccessible: true,
      });
    }

    // Add other breadcrumbs from route config
    const routeBreadcrumbs = buildBreadcrumbPath(pagesData, path);

    // Filter out duplicate Dashboard entries
    const filteredRouteBreadcrumbs = routeBreadcrumbs.filter(
      (item) => item.name !== "Dashboard" || item.path !== "/dashboard"
    );

    return [...items, ...filteredRouteBreadcrumbs];
  }, [location.pathname]);

  // Don't render breadcrumbs on login page or if no breadcrumbs
  if (
    location.pathname === "/" ||
    location.pathname === "/login" ||
    breadcrumbs.length === 0
  ) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.path}>
            {/* Show separator before each item except the first one */}
            {index > 0 && <BreadcrumbSeparator />}

            <BreadcrumbItem>
              {breadcrumb.isActive ? (
                <BreadcrumbPage className="text-gray-900 dark:text-gray-100 font-medium capitalize">
                  {breadcrumb.name}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    to={`${breadcrumb.path}${location.search}`}
                    state={location.state}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 capitalize transition-colors"
                  >
                    {breadcrumb.name}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
