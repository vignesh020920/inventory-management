// src/utils/ModalErrorFallback.tsx
import React from "react";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ErrorFallbackProps } from "@/types/errorBoundary";

const ModalErrorFallback: React.FC<
  ErrorFallbackProps & { onClose?: () => void }
> = ({ error, resetErrorBoundary, onClose }) => {
  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold">Error in Modal</h3>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>

      <div className="flex gap-2">
        <Button onClick={resetErrorBoundary} size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
        {onClose && (
          <Button variant="outline" onClick={onClose} size="sm">
            Close
          </Button>
        )}
      </div>
    </div>
  );
};

export default ModalErrorFallback;
