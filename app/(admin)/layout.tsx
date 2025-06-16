import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { SessionProvider } from "next-auth/react";

/**
 * The root layout for all routes within the `(admin)` group.
 *
 * This component establishes the primary security boundary and defines the
 * consistent UI shell (sidebar, navbar, footer) for the entire admin dashboard.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The specific admin page component to be rendered.
 * @returns {Promise<JSX.Element>} A promise that resolves to the rendered admin layout.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /**
   * Fetches the user's session on the server. This is the first step in
   * securing the admin panel.
   */
  const session = await auth();

  /**
   * A critical server-side security check. This gatekeeping logic ensures that
   * only authenticated users with the specific role of 'admin' can access any
   * page wrapped by this layout. If the check fails, the user is immediately
   * redirected to the sign-in page with a callback URL.
   */
  if (!session || session.user?.role !== "admin") {
    redirect("/");
  }

  return (
    // The `SessionProvider` is essential for making the server-fetched session data
    // available to client components (e.g., `AdminNavbar`) within the admin area
    // via the `useSession` hook. This is the recommended pattern for the Next.js App Router.
    <SessionProvider session={session}>
      {/*
       * Main grid layout for the admin panel. On medium screens and up, it creates
       * a two-column layout for the sidebar and the main content area.
       */}
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {/* The sidebar is rendered here but is visually hidden on smaller screens via its own internal CSS. */}
        <AdminSidebar />

        {/* Main content area that includes the navbar, the page content, and the footer. */}
        <div className="flex flex-col">
          <AdminNavbar />
          <main className="flex flex-1 flex-col gap-4 bg-muted/40 p-4 lg:gap-6 lg:p-6">
            {/* Renders the specific admin page (e.g., Dashboard, Products, Orders) passed as children. */}
            {children}
          </main>
          <AdminFooter />
        </div>
      </div>
    </SessionProvider>
  );
}
