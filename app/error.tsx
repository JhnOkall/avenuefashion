"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * A global error boundary component for the application.
 *
 * This client component is automatically rendered by Next.js when an unhandled
 * error occurs in a child server component or its descendants. It provides a
 * user-friendly fallback UI and a mechanism to attempt recovery.
 *
 * @param {object} props - The props provided by Next.js to the error boundary.
 * @param {Error & { digest?: string }} props.error - The error object that was thrown.
 * @param {() => void} props.reset - A function to re-render the component tree segment, attempting to recover from the error.
 * @returns {JSX.Element} The rendered error fallback page.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  /**
   * A side effect to log the error to the browser console for debugging purposes.
   */
  useEffect(() => {
    // TODO: Integrate a professional error reporting service (e.g., Sentry, LogRocket) here
    // to capture and track production errors effectively.
    // Example: Sentry.captureException(error);
    console.error(error);
  }, [error]);

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-screen-xl px-4 py-8 lg:px-6 lg:py-16">
        <div className="mx-auto max-w-screen-sm text-center">
          <h1 className="mb-4 text-7xl font-extrabold tracking-tight text-destructive lg:text-9xl">
            500
          </h1>
          <p className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Something went wrong.
          </p>
          <p className="mb-4 text-lg font-light text-muted-foreground">
            We're sorry for the inconvenience. Please try again or contact
            support if the problem persists.
          </p>
          {/* The reset button allows the user to attempt to re-render the failed component segment. */}
          <Button size="lg" onClick={() => reset()}>
            Try again
          </Button>
        </div>
      </div>
    </section>
  );
}
