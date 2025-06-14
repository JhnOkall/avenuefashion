# Avenue Fashion - A Modern Full-Stack E-Commerce Platform

![License](https://img.shields.io/github/license/JhnOkall/new-avenuefashion?style=for-the-badge)
![Deployment](https://img.shields.io/website?down_message=offline&label=deployment&style=for-the-badge&up_message=online&url=https%3A%2F%2Fnew-avenuefashion.vercel.app)

Avenue Fashion is a comprehensive, full-stack e-commerce platform built with a modern technology stack. It provides a seamless, performant shopping experience for customers and a powerful, data-driven dashboard for administrators to manage products, orders, users, and site-wide settings.

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
  - [Customer-Facing](#customer-facing)
  - [Admin Dashboard](#admin-dashboard)
- [Tech Stack](#tech-stack)
- [Architectural Decisions](#architectural-decisions)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

This project is an end-to-end solution for a modern online fashion store. It leverages the power of **Next.js 14** with the **App Router**, combining server-side rendering for optimal performance and SEO with a rich, interactive client-side experience. The backend logic is handled entirely within Next.js API Route Handlers, connecting to a **MongoDB** database via **Mongoose** for robust data persistence and modeling.

The application is architecturally split into two primary domains using Route Groups:

1.  **The Storefront (`(customer)`)**: The public-facing e-commerce site where customers can discover products, manage their cart and profile, place orders, and track their history.
2.  **The Admin Panel (`(admin)`)**: A secure, role-protected area where administrators can view business analytics, manage the entire product catalog, process customer orders, manage user accounts, and configure site settings like shipping locations and promotional vouchers.

## Key Features

### Customer-Facing

- **Dynamic Product Catalog**: A product grid with server-side filtering, sorting, and "load more" pagination.
- **Global Search**: Debounced, real-time search with product suggestions and a persistent search history stored in cookies.
- **Optimistic UI Shopping Cart**: Client-side state management via React Context for a smooth, non-blocking user experience when adding, updating, or removing items.
- **Secure Authentication**: Robust sign-in/sign-up and session management powered by NextAuth.js (Auth.js v5).
- **Multi-Step Checkout**: A guided checkout process with saved address selection and dynamic shipping fee calculation.
- **Customer Dashboard**: A centralized portal for users to view their profile, track order history, and manage addresses and reviews.
- **Product Reviews & Ratings**: Users can submit, view, and edit reviews for products, with an option for "verified purchase" status.

### Admin Dashboard

- **Analytics Overview**: A dashboard with key metrics like total revenue, sales volume, new customers, and revenue-over-time charts.
- **Product Management**: Full CRUD (Create, Read, Update, Delete) functionality for products, managed through a paginated and searchable data table.
- **Order Management**: View and update the status of all customer orders, with filtering capabilities.
- **User Management**: View all users and manage their roles (e.g., promote a user to admin).
- **Voucher Management**: Create and manage percentage-based or fixed-amount discount codes.
- **Location Management**: A tabbed interface to manage the hierarchy of countries, counties, and cities for shipping options and fees.

## Tech Stack

This project utilizes a modern, cohesive set of tools to deliver a high-quality application.

- **Framework**: [Next.js 14](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [NextAuth.js (Auth.js v5)](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Data Fetching (Client)**: [SWR](https://swr.vercel.app/)
- **Data Tables**: [TanStack Table v8](https://tanstack.com/table/v8)
- **Data Visualization**: [Recharts](https://recharts.org/)

## Architectural Decisions

- **Server Components First**: The application defaults to using React Server Components (RSC) for data fetching and rendering static content. This reduces the client-side JavaScript bundle size, improving initial page load times and SEO.
- **Client Components for Interactivity**: Components requiring user interaction (e.g., forms, buttons with `onClick` handlers, components using hooks) are explicitly marked with the `"use client"` directive. This clear separation of concerns is a core tenet of the App Router model.
- **Streaming with Suspense**: Data-heavy server components are wrapped in `<Suspense>` boundaries with declarative skeleton loaders. This allows the server to stream the static UI shell to the user immediately, improving perceived performance while waiting for slower data fetches to complete.
- **URL-driven State Management**: For filterable and paginated views (like the admin tables and product grid), the primary state is managed through URL search parameters (`?page=2&status=pending`). This makes the UI state shareable, bookmarkable, and refresh-friendly.
- **Optimistic UI Updates**: In interactive areas like the shopping cart, UI changes are applied instantly on the client _before_ the server confirms the action. This provides a fluid, responsive user experience, with the local state being automatically reverted and resynced if the server request fails.
- **Centralized API Logic**: All backend logic, including database interactions and business rules, is encapsulated within Next.js API Route Handlers located in the `app/api/` directory.

## Project Structure

The project follows the standard Next.js App Router structure, organized by feature and route group.

```
/
├── app/
│   ├── (admin)/                # Route group for the admin panel
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── products/
│   │   └── layout.tsx          # Layout for the admin panel
│   ├── (customer)/             # Route group for customer-facing pages
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── me/                 # User-specific protected routes
│   │   ├── [slug]/             # Dynamic route for a single product
│   │   ├── layout.tsx          # Root layout for customer-facing pages
│   │   └── page.tsx            # Homepage
│   ├── api/                    # API route handlers for all backend logic
│   └── globals.css             # Global styles and Tailwind CSS directives
├── components/
│   ├── admin/                  # Components specific to the admin dashboard
│   ├── customer/               # Components specific to the customer storefront
│   └── ui/                     # Reusable UI components (from shadcn/ui)
├── contexts/
│   └── CartContext.tsx         # React Context for global cart state
├── hooks/
│   └── use-debounce.ts         # Custom hook for debouncing input
├── lib/
│   ├── data.ts                 # Centralized data fetching and mutation functions
│   └── db.ts                   # MongoDB connection logic
├── models/
│   └── *.ts                    # Mongoose schema definitions for database models
├── types/
│   └── index.ts                # TypeScript interfaces for data structures
└── .env.example                # Example environment variables file
```

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later)
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/)
- A [MongoDB](https://www.mongodb.com/) instance (local or a free cloud-hosted instance via [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register))

### Installation

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/JhnOkall/new-avenuefashion.git
    cd new-avenuefashion
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

### Environment Variables

Create a `.env.local` file in the root of your project by copying the `.env.example` file. Then, fill in the required values.

```env
# .env.local

# MongoDB Connection String
# Replace with your own MongoDB connection URI
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster-url>/avenue-fashion?retryWrites=true&w=majority"

# NextAuth.js Configuration
# Generate a secret with: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Add your OAuth provider credentials (e.g., Google)
# See NextAuth.js documentation for setup details
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Public URL for the application, used for absolute URLs.
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Running the Application

1.  **Start the development server:**

    ```sh
    npm run dev
    ```

2.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Future Improvements

Based on the `TODO` comments in the codebase and a forward-looking perspective, here are some potential areas for future development:

- `[ ]` **Enhanced Form Validation**: Integrate `react-hook-form` and `zod` for robust, schema-based validation on all forms.
- `[ ]` **Advanced Admin Pagination**: Implement more user-friendly pagination controls with page numbers and ellipsis for all admin data tables.
- `[ ]` **Robust File Uploads**: Replace simple URL inputs with a proper file upload system (e.g., to Cloudinary or AWS S3) for product and review images.
- `[ ]` **Complex Discount System**: Expand the voucher system to support usage limits, minimum spend, and applicability to specific products or categories.
- `[ ]` **Payment Gateway Integration**: Integrate a real payment gateway like Stripe or M-Pesa (via Daraja API) to process payments.
- `[ ]` **Comprehensive Testing**: Add a testing suite with Jest and React Testing Library for unit/integration tests, and Cypress or Playwright for end-to-end tests.
- `[ ]` **Error Reporting & Logging**: Integrate a service like Sentry or LogRocket for real-time error tracking and session replay in production.
- `[ ]` **Internationalization (i18n)**: Add support for multiple languages and currencies.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE.md).
