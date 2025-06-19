import Footer from "@/components/customer/footer";
import Navbar from "@/components/customer/navbar";

/**
 * The root layout for the main customer-facing part of the application.
 *
 * This component acts as a template for all pages within its route segment,
 * wrapping them with a consistent navigation bar and footer. It defines the
 * shared UI shell for the user experience.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components, typically the page content, to be rendered within the layout.
 * @returns {JSX.Element} The rendered layout with the page content.
 */
// TODO: Consider adding a Hero banner or other promotional components to the homepage, which would be rendered as a child of this layout.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* The main application navigation bar, present on all pages. */}
        <Navbar />
        {/* Renders the active page component passed as children. */}
        <main>{children}</main>
        {/* The main application footer, present on all pages. */}
        <Footer />
      </body>
    </html>
  );
}
