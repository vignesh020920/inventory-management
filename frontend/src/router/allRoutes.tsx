// src/router/AllRoutes.tsx
import { lazy, type ReactElement } from "react";
import ErrorBoundary from "../utils/errorBoundary";
import RouteErrorFallback from "../utils/routeErrorFallback";

// Lazy load all page components for code splitting
const DashboardLayout = lazy(() => import("../layouts/dashboardLayout"));
const OverviewPage = lazy(() => import("../pages/dashboard/page"));

// const CategoriesPage = lazy(() => import("../pages/categories/page"));
const ProductsPage = lazy(() => import("../pages/products/page"));
const UsersPage = lazy(() => import("../pages/users/page"));
const AccountsPage = lazy(() => import("../pages/AccountSettings/page"));

// Type definitions
export type AccessRole = "admin" | "user";

export interface RouteConfig {
  path: string;
  element: ReactElement;
  access: AccessRole[];
  nestedRoutes?: RouteConfig[];
  meta?: {
    title?: string;
    description?: string;
    requiresAuth?: boolean;
    breadcrumb?: string; // Add breadcrumb support
  };
}

// Helper function to wrap components with error boundary
const withErrorBoundary = (
  Component: ReactElement,
  fallback = RouteErrorFallback
) => <ErrorBoundary fallback={fallback}>{Component}</ErrorBoundary>;

const pagesData: RouteConfig[] = [
  {
    path: "/",
    element: withErrorBoundary(<DashboardLayout />),
    access: ["admin", "user"],
    meta: {
      title: "Dashboard",
      description: "Main dashboard layout",
      requiresAuth: true,
    },
    nestedRoutes: [
      {
        path: "dashboard",
        element: withErrorBoundary(<OverviewPage />),
        access: ["admin", "user"],
        meta: {
          title: "Dashboard overview",
          description: "Dashboard overview",
        },
      },
      // {
      //   path: "categories",
      //   element: withErrorBoundary(<CategoriesPage />),
      //   access: ["admin"],
      //   meta: {
      //     title: "Categories",
      //     description: "Product categories management",
      //     breadcrumb: "Categories",
      //   },
      // },
      {
        path: "products",
        element: withErrorBoundary(<ProductsPage />),
        access: ["admin", "user"],
        meta: {
          title: "Products",
          description: "Product management",
          breadcrumb: "Products",
        },
      },
      {
        path: "users",
        element: withErrorBoundary(<UsersPage />),
        access: ["admin"],
        meta: {
          title: "Users",
          description: "User management",
          breadcrumb: "Users",
        },
      },
      {
        path: "account",
        element: withErrorBoundary(<AccountsPage />),
        access: ["admin", "user"],
        meta: {
          title: "Account",
          description: "Account settings",
          breadcrumb: "Account",
        },
      },
    ],
  },
];

export default pagesData;
