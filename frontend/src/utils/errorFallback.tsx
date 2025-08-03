// src/utils/ErrorFallback.tsx
import React from "react";
import {
  AlertCircle,
  RefreshCw,
  Home,
  ChevronDown,
  ChevronUp,
  Bug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { ErrorFallbackProps } from "@/types/errorBoundary";

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  errorInfo,
}) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const errorDetails = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo?.componentStack,
    timestamp: new Date().toISOString(),
  };

  const copyErrorDetails = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(errorDetails, null, 2)
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy error details:", err);
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  const goHome = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Something went wrong
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            We're sorry, but an unexpected error occurred. Please try refreshing
            the page or contact support if the problem persists.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Summary */}
          <Alert variant="destructive">
            <Bug className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">Error: {error.name}</div>
              <div className="text-sm mt-1 opacity-90">{error.message}</div>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={resetErrorBoundary} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={reloadPage} className="flex-1">
              Reload Page
            </Button>
            <Button variant="outline" onClick={goHome} className="flex-1">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>

          {/* Error Details Toggle */}
          <div className="border-t pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full justify-between"
            >
              <span className="font-medium">Technical Details</span>
              {showDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {showDetails && (
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <Badge variant="outline">Error Details</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyErrorDetails}
                  >
                    {copied ? "Copied!" : "Copy Details"}
                  </Button>
                </div>

                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm font-mono overflow-auto max-h-60">
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        Message:
                      </span>
                      <div className="ml-2">{error.message}</div>
                    </div>

                    {error.stack && (
                      <div>
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          Stack Trace:
                        </span>
                        <pre className="ml-2 whitespace-pre-wrap text-xs">
                          {error.stack}
                        </pre>
                      </div>
                    )}

                    {errorInfo?.componentStack && (
                      <div>
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          Component Stack:
                        </span>
                        <pre className="ml-2 whitespace-pre-wrap text-xs">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DefaultErrorFallback;
