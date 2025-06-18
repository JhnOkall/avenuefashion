"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// =================================================================
// TYPES & INTERFACES
// =================================================================

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

// =================================================================
// CLASS-BASED ERROR BOUNDARY
// =================================================================

/**
 * A React class component that catches JavaScript errors anywhere in its
 * child component tree, logs those errors, and displays a fallback UI.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    // You can log the error to an error reporting service here
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  /** Resets the error state, attempting to re-render the children. */
  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Card className="w-full max-w-lg text-center">
            <CardHeader>
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
              <CardTitle className="mt-4 text-2xl">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription>
                We're sorry for the inconvenience. An unexpected error occurred.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-left">
                  <h3 className="mb-2 font-semibold text-destructive">
                    Error Details (Development Mode)
                  </h3>
                  <pre className="max-h-32 overflow-auto whitespace-pre-wrap text-xs text-destructive">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <Button onClick={this.handleReset} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Link>
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4 pt-4">
              <Separator />
              <p className="text-sm text-muted-foreground">
                If the problem persists, please contact{" "}
                <a
                  href="mailto:support@avenuefashion.co.ke"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  our support team
                </a>
                .
              </p>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// =================================================================
// FUNCTIONAL ERROR FALLBACK (for react-error-boundary)
// =================================================================

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * A functional component designed as a fallback for the `react-error-boundary`
 * library, providing a user-friendly message and a recovery action.
 */
export function ErrorFallback({
  error,
  resetErrorBoundary,
}: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <CardTitle className="mt-4 text-2xl">Something went wrong</CardTitle>
          <CardDescription>
            We encountered an unexpected error. Please try refreshing the page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={resetErrorBoundary}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
