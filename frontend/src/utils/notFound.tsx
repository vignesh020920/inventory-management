// src/utils/NotFound.tsx
import React from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center space-y-4">
          {/* 404 Illustration */}
          <div className="mx-auto w-32 h-32 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center mb-6">
            <div className="text-6xl font-bold text-red-500 dark:text-red-400">
              404
            </div>
          </div>

          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Oops! Page Not Found
          </CardTitle>

          <CardDescription className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            The page you're looking for doesn't exist or has been moved. Don't
            worry, it happens to the best of us!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="flex items-center gap-2 h-12"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>

          {/* Error Code Footer */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 border-t pt-4">
            <p>Error Code: 404 • Page Not Found</p>
            <p className="mt-1">
              If you continue to experience issues, please contact admin
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
