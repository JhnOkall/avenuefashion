# Avenue Fashion - A Modern Full-Stack E-Commerce Platform

Avenue Fashion is a comprehensive, full-stack e-commerce platform built with a modern technology stack. It provides a seamless, performant shopping experience for customers and a powerful, data-driven dashboard for administrators to manage products, orders, users, and site-wide settings.

This project also serves as a reference implementation for a multi-tenant payment architecture, where a central entity can manage payments for multiple sub-accounts (e.g., different brands or stores) using a single payment gateway account.

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

This project is an end-to-end solution for a modern online fashion store. It leverages the power of **Next.js 15** with the **App Router**, combining server-side rendering for optimal performance and SEO with a rich, interactive client-side experience. The backend logic is handled entirely within Next.js API Route Handlers, connecting to a **MongoDB** database via **Mongoose** for robust data persistence and modeling.

The application is architecturally split into two primary domains using Route Groups:

1.  **The Storefront (`(customer)`)**: The public-facing e-commerce site where customers can discover products, manage their cart and profile, place orders, and track their history.
2.  **The Admin Panel (`(admin)`)**: A secure, role-protected area where administrators can view business analytics, manage the entire product catalog, process customer orders, manage user accounts, and configure site settings like shipping locations and promotional vouchers.

## Key Features

### Customer-Facing

- **Dynamic Product Catalog**: A product grid with server-side filtering, sorting, and "load more" pagination.
- **Global Search**: Debounced, real-time search with product suggestions and a persistent search history stored in cookies.
- **Optimistic UI Shopping Cart**: Client-side state management for a smooth, non-blocking user experience when adding, updating, or removing items.
- **Secure Authentication**: Robust sign-in/sign-up and session management powered by NextAuth.js (Auth.js v5).
- **Live Payment Integration**: Secure, real-time payments powered by **Paystack**, with options for card and M-Pesa, alongside a "Pay on Delivery" choice.
- **Multi-Step Checkout**: A guided checkout process with saved address selection, dynamic shipping fee calculation, and voucher application.
- **Customer Dashboard**: A centralized portal for users to view their profile, track order history with a multi-stage visual timeline, and perform full CRUD operations on their saved addresses.
- **Product Reviews & Ratings**: Users can submit, view, and edit reviews for products, with an option for "verified purchase" status.

### Admin Dashboard

- **Analytics Overview**: A dashboard with key metrics like total revenue, sales volume, new customers, and revenue-over-time charts.
- **Product Management**: Full CRUD (Create, Read, Update, Delete) functionality for products, managed through a paginated and searchable data table.
- **Order Management**: View and update the fulfillment status of all customer orders, which dynamically updates the customer's visual timeline.
- **User Management**: View all users and manage their roles (e.g., promote a user to admin).
- **Voucher Management**: Create and manage percentage-based or fixed-amount discount codes.
- **Location Management**: A tabbed interface to manage the hierarchy of countries, counties, and cities for shipping options and fees.

## Tech Stack

This project utilizes a modern, cohesive set of tools to deliver a high-quality application.

- **Framework**: [Next.js 15](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [NextAuth.js (Auth.js v5)](https://next-auth.js.org/)
- **Payment Gateway**: [Paystack](https://paystack.com/) (using InlineJS)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Data Tables**: [TanStack Table v8](https://tanstack.com/table/v8)
- **Data Visualization**: [Recharts](https://recharts.org/)

## Architectural Decisions

- **Server Components First**: The application defaults to using React Server Components (RSC) for data fetching and rendering static content. This reduces the client-side JavaScript bundle size, improving initial page load times and SEO.
- **Client Components for Interactivity**: Components requiring user interaction are explicitly marked with the `"use client"` directive. This clear separation of concerns is a core tenet of the App Router model.
- **Multi-Tenant Payment Architecture**: The Paystack integration is designed to be scalable. A central API (representing a parent company like "Nyota") manages a single webhook endpoint. This endpoint verifies all incoming payment events and securely forwards them to the appropriate sub-project (like "Avenue Fashion") based on `metadata` sent during transaction initiation. This allows one Paystack account to serve multiple distinct storefronts securely.
- **Decoupled Business Logic**: Critical actions like clearing a user's cart are decoupled from the initial order creation. The cart is only cleared upon confirmed successful payment, handled by the secure backend webhook, which prevents data inconsistency if a user cancels a payment.
- **URL-driven State Management**: For filterable and paginated views, the primary state is managed through URL search parameters (`?page=2&status=pending`). This makes the UI state shareable, bookmarkable, and refresh-friendly.
- **Centralized API Logic**: All backend logic, including database interactions and business rules, is encapsulated within Next.js API Route Handlers located in the `app/api/` directory.

## Project Structure

The project follows the standard Next.js App Router structure, organized by feature and route group.

```
/
├── app/
│   ├── (admin)/                # Route group for the admin panel
│   ├── (customer)/             # Route group for customer-facing pages
│   ├── api/
│   │   ├── webhooks/
│   │   │   └── internal/
│   │   │       └── paystack/   # Secure internal webhook for this project
│   │   └── ...                 # Other API route handlers
│   └── globals.css
├── components/
│   ├── admin/
│   ├── customer/
│   └── ui/
├── lib/
│   ├── data.ts                 # Centralized data fetching and mutation functions
│   ├── db.ts                   # MongoDB connection logic
│   └── order-stages.ts         # Master configuration for order timeline
├── models/
│   └── *.ts                    # Mongoose schema definitions
├── types/
│   └── index.ts                # TypeScript interfaces
└── .env.example                # Example environment variables file
```

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later)
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/)
- A [MongoDB](https://www.mongodb.com/) instance (local or a free cloud-hosted instance via [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register))
- A [Paystack](https://paystack.com/) account.

### Installation

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/JhnOkall/new-avenuefashion.git
    cd new-avenuefashion
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

### Environment Variables

Create a `.env.local` file in the root of your project by copying the `.env.example` file. Then, fill in the required values.

```env
# .env.local

# MongoDB Connection String
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster-url>/avenue-fashion?retryWrites=true&w=majority"

# NextAuth.js Configuration
AUTH_SECRET="your-super-secret-nextauth-secret" # Generate with: openssl rand -base64 32
AUTH_GOOGLE_ID="your-google-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Paystack Configuration
# Your PUBLIC key from the parent Paystack account dashboard.
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_xxxxxxxxxxxxxxxxxxxxxxxx"

# Internal Webhook Security
# A strong, randomly generated secret for verifying requests from your central Nyota API.
# Generate with: openssl rand -base64 32
AVENUE_FASHION_INTERNAL_SECRET="your-random-secret-for-internal-webhooks"

# Public URL of the application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

_Note: The Paystack Secret Key (`sk_test_...`or`sk*live*...`) is NOT stored in this project. It is stored securely in the central Nyota API project that manages the primary webhook.\_

### Running the Application

1.  **Start the development server:**

    ```sh
    npm run dev
    ```

2.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Future Improvements

- `[ ]` **Robust Form Validation**: Integrate `react-hook-form` and `zod` for schema-based validation.
- `[ ]` **File Uploads**: Implement a proper file upload system (e.g., to Cloudinary or AWS S3) for product images.
- `[ ]` **Retry Logic for Payments**: Implement a "Retry Payment" feature for orders with a pending payment status.
- `[ ]` **Comprehensive Testing**: Add a testing suite with Jest/Vitest and React Testing Library for unit tests, and Cypress/Playwright for E2E tests.
- `[ ]` **Error Reporting**: Integrate a service like Sentry for real-time error tracking in production.
- `[ ]` **Internationalization (i18n)**: Add support for multiple languages and currencies.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE.md).
