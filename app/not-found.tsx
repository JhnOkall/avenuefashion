import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * A custom 404 Not Found page for the application.
 *
 * This component is automatically rendered by Next.js when a user navigates to a
 * route that does not exist. It provides a user-friendly message and a clear
 * call-to-action to return to the homepage.
 *
 * @returns {JSX.Element} The rendered 404 page.
 */
// TODO: Enhance this page by adding a search bar or suggesting popular links/products to improve user experience.
export default function NotFound() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-screen-xl px-4 py-8 lg:px-6 lg:py-16">
        <div className="mx-auto max-w-screen-sm text-center">
          <h1 className="mb-4 text-7xl font-extrabold tracking-tight text-primary-foreground lg:text-9xl">
            404
          </h1>
          <p className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Something's missing.
          </p>
          <p className="mb-4 text-lg font-light text-muted-foreground">
            Sorry, we can't find that page. You'll find lots to explore on the
            home page.
          </p>
          <Button asChild size="lg" className="my-4">
            <Link href="/">Back to Homepage</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
