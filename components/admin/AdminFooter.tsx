import Link from "next/link";

/**
 * A simple, static footer component designed for the admin dashboard layout.
 * It provides copyright information and essential navigation links.
 *
 * @returns {JSX.Element} The rendered footer component.
 */
// TODO: For a more complex dashboard, consider making the links dynamic by sourcing them from a configuration file to improve maintainability.
export const AdminFooter = () => {
  /**
   * Calculates the current year dynamically to keep the copyright notice up-to-date.
   */
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background px-4 py-4 lg:px-6">
      <div className="container mx-auto flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
        <p>
          © {currentYear}{" "}
          <Link href="/" className="hover:underline">
            Avenue Fashion.
          </Link>{" "}
          All rights reserved. Powered by{" "}
          <Link
            href="https://nyota.africa"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground hover:underline"
          >
            Nyota
          </Link>
          .
        </p>
      </div>
    </footer>
  );
};
