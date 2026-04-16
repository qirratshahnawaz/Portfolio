"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Boundary:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl">
            Something went wrong
          </h2>
          <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
            We encountered an unexpected error while rendering this page. Our
            team has been notified.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => reset()}
            variant="default"
            className="px-8 py-6 text-lg h-auto"
          >
            Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="px-8 py-6 text-lg h-auto"
          >
            Go to homepage
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-muted rounded-lg text-left overflow-auto max-w-full">
            <p className="font-mono text-xs text-red-500 whitespace-pre">
              {error.message}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
