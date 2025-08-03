// src/utils/FormErrorFallback.tsx
import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ErrorFallbackProps } from "@/types/errorBoundary";

const FormErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <CardTitle className="text-lg">Form Error</CardTitle>
        <CardDescription>There was an error loading this form</CardDescription>
      </CardHeader>

      <CardContent className="text-center space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {error.message}
        </p>

        <Button onClick={resetErrorBoundary} className="w-full">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reload Form
        </Button>
      </CardContent>
    </Card>
  );
};

export default FormErrorFallback;
