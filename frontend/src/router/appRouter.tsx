// src/router/AppRouter.tsx
import { Link, Route, Routes } from "react-router";
import { useMemo, useCallback, Suspense, lazy, type JSX } from "react";
import { Loader2 } from "lucide-react";
import PrivateRoute from "../auth/privateRoute";
import NotFound from "../utils/notFound";
import ErrorBoundary from "../utils/errorBoundary";
import DefaultErrorFallback from "../utils/errorFallback";
import { useAuthStore, type UserRole } from "../stores/authStore";
import pagesData, { type RouteConfig } from "./allRoutes";

// Lazy load auth components for code splitting
const Login = lazy(() => import("../auth/login"));

// Loading components
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-[calc(100vh-98px)]">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

// Unauthorized component
const Unauthorized: React.FC = () => (
  <div className="w-full flex flex-col justify-center items-center gap-5 min-h-[calc(100vh-98px)]">
    <h1 className="text-5xl text-gray-700 dark:text-gray-300 font-bold">
      401 - Unauthorized
    </h1>
    <p className="text-base font-semibold text-gray-600 dark:text-gray-400">
      You are not authorized to access this page
    </p>
    <Link
      to="/dashboard"
      className="px-5 py-1.5 bg-primary hover:opacity-90 duration-500 ease-in-out rounded text-white transition-opacity"
    >
      Go to Dashboard
    </Link>
  </div>
);

// Error logging function
const logError = (error: Error, errorInfo: React.ErrorInfo): void => {
  if (process.env.NODE_ENV === "development") {
    console.error("Router Error:", error, errorInfo);
  }

  if (process.env.NODE_ENV === "production") {
    // Send to error tracking service
    console.error("Production error logged:", error.message);
  }
};

const AppRouter: React.FC = () => {
  const { user, isAuthenticated, getUserRole } = useAuthStore();

  // Get user role with proper typing and memoization
  const userRole: UserRole = useMemo(() => {
    if (!isAuthenticated || !user) return "guest";
    return getUserRole();
  }, [user, isAuthenticated, getUserRole]);

  // Access checker with proper typing
  const isAllowed = useCallback(
    (role: UserRole, accessSet: Set<string>): boolean => {
      return accessSet.has(role) || accessSet.has("open");
    },
    []
  );

  // Route creation with error handling
  const createRoute = useCallback(
    (
      route: RouteConfig,
      currentRole: UserRole,
      parentPath = ""
    ): JSX.Element => {
      const { access, element, path, nestedRoutes } = route;
      const accessSet = new Set(access);
      const fullPath = parentPath ? `${parentPath}/${path}` : path;

      const routeElement = isAllowed(currentRole, accessSet) ? (
        <ErrorBoundary fallback={DefaultErrorFallback} onError={logError}>
          <Suspense fallback={<PageLoader />}>{element}</Suspense>
        </ErrorBoundary>
      ) : (
        <Unauthorized />
      );

      const nestedRouteElements = nestedRoutes
        ? nestedRoutes.map((nestedRoute: RouteConfig) =>
            createRoute(nestedRoute, currentRole, fullPath)
          )
        : null;

      return (
        <Route key={fullPath} path={path} element={routeElement}>
          {nestedRouteElements}
        </Route>
      );
    },
    [isAllowed]
  );

  // Memoized routes processing
  const renderedRoutes = useMemo((): JSX.Element[] => {
    return pagesData.map((route: RouteConfig) => createRoute(route, userRole));
  }, [pagesData, userRole, createRoute]);

  return (
    <ErrorBoundary fallback={DefaultErrorFallback} onError={logError}>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <ErrorBoundary fallback={DefaultErrorFallback} onError={logError}>
                <Suspense fallback={<PageLoader />}>
                  <Login />
                </Suspense>
              </ErrorBoundary>
            }
          />

          <Route
            path="/login"
            element={
              <ErrorBoundary fallback={DefaultErrorFallback} onError={logError}>
                <Suspense fallback={<PageLoader />}>
                  <Login />
                </Suspense>
              </ErrorBoundary>
            }
          />

          {/* Protected routes */}
          <Route element={<PrivateRoute />}>{renderedRoutes}</Route>

          {/* Fallback route */}
          <Route
            path="*"
            element={
              <ErrorBoundary fallback={DefaultErrorFallback} onError={logError}>
                <NotFound />
              </ErrorBoundary>
            }
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRouter;
