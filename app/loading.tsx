import { Loader2, ShoppingBag } from "lucide-react";

/**
 * A global loading indicator component.
 *
 * In the Next.js App Router, a `loading.tsx` file provides instant loading UI
 * that is shown immediately upon navigation. This enhances user experience by
 * indicating that a page transition is in progress while the server-rendered
 * content is being fetched.
 *
 * @returns {JSX.Element} A full-screen, centered loading spinner with branding.
 */
// TODO: For more complex layouts, consider creating more specific `loading.tsx` files
// within nested route segments to provide more contextual loading skeletons.
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* The brand icon with a subtle pulse animation for visual interest. */}
        <ShoppingBag className="h-12 w-12 animate-pulse text-primary" />

        {/* The spinner and accompanying text. */}
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-lg text-muted-foreground">Just a moment...</p>
        </div>
      </div>
    </div>
  );
}
