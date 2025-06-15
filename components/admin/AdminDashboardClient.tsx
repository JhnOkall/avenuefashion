"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { DollarSign, ShoppingBag, Users, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminAnalyticsData } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

/**
 * Formats a numeric price into a localized currency string.
 * @param {number} price - The price to format.
 * @returns {string} The formatted currency string.
 */
// TODO: Relocate this helper to a shared `utils/formatters.ts` file for application-wide reusability.
const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(
    price
  );

// =================================================================
// SUB-COMPONENTS
// =================================================================

/**
 * A reusable card for displaying a single key performance indicator (KPI) on the dashboard.
 *
 * @param {object} props - The component props.
 * @param {string} props.title - The title or label for the statistic.
 * @param {string | number} props.value - The value of the statistic to display.
 * @param {React.ElementType} props.icon - The Lucide icon component to render.
 */
// TODO: Enhance this component to optionally display a percentage change compared to a previous period, which would require additional data from the backend.
const StatCard = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

/**
 * A responsive bar chart component using Recharts to visualize revenue over time.
 *
 * @param {object} props - The component props.
 * @param {Array<{date: string; revenue: number}>} props.data - The dataset for the chart.
 */
const OverviewChart = ({
  data,
}: {
  data: { date: string; revenue: number }[];
}) => (
  <ResponsiveContainer width="100%" height={350}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey="date"
        stroke="#111827"
        fontSize={12}
        tickLine={false}
        axisLine={false}
        // Formats the x-axis labels to a more readable date format.
        tickFormatter={(value) =>
          new Date(value).toLocaleDateString("en-KE", {
            month: "short",
            day: "numeric",
          })
        }
      />
      <YAxis
        stroke="#111827"
        fontSize={12}
        tickLine={false}
        axisLine={false}
        // Formats the y-axis labels to display large numbers in thousands (e.g., "$5k").
        tickFormatter={(value) => `Ksh. ${Number(value) / 1000}k`}
      />
      <Tooltip
        cursor={{ fill: "hsl(var(--muted))" }}
        contentStyle={{
          backgroundColor: "hsl(var(--background))",
          border: "1px solid hsl(var(--border))",
        }}
        formatter={(value: number) => [formatPrice(value), "Revenue"]}
      />
      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

/**
 * A component that displays a list of recent sales, including customer
 * information, order total, and status.
 *
 * @param {object} props - The component props.
 * @param {AdminAnalyticsData["recentOrders"]} props.orders - An array of recent order objects.
 */
const RecentOrders = ({
  orders,
}: {
  orders: AdminAnalyticsData["recentOrders"];
}) => (
  <div className="space-y-8">
    {orders.map((order) => {
      // Safely access user details, as the `user` field might not be fully populated.
      const user =
        "name" in order.user
          ? order.user
          : { name: "Unknown", email: "", image: undefined };
      return (
        <div key={order._id.toString()} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.image ?? undefined} alt="Avatar" />
            <AvatarFallback>
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="ml-auto text-right font-medium">
            <p>{formatPrice(order.pricing.total)}</p>
            {/* TODO: Add a link from this list item to the full order details page in the admin panel. */}
            <Badge variant="outline" className="mt-1">
              {order.status}
            </Badge>
          </div>
        </div>
      );
    })}
  </div>
);

// =================================================================
// MAIN CLIENT COMPONENT
// =================================================================

/**
 * Defines the props required by the AdminDashboardClient component.
 */
interface AdminDashboardClientProps {
  /**
   * The complete analytics data object, pre-fetched on the server.
   */
  data: AdminAnalyticsData;
}

/**
 * The main client component for the admin dashboard. It arranges the layout
 * and passes the pre-fetched analytics data to its specialized child components
 * for rendering statistics, charts, and recent activity lists.
 *
 * @param {AdminDashboardClientProps} props - The props containing the dashboard data.
 */
export const AdminDashboardClient = ({ data }: AdminDashboardClientProps) => {
  const { stats, revenueOverTime, recentOrders } = data;

  return (
    <div className="space-y-6">
      {/* Top-level KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          icon={DollarSign}
        />
        <StatCard
          title="Sales"
          value={`+${stats.totalSales.toLocaleString()}`}
          icon={ShoppingBag}
        />
        <StatCard
          title="New Customers (30d)"
          value={`+${stats.newCustomers.toLocaleString()}`}
          icon={Users}
        />
        <StatCard
          title="Active Products"
          value={stats.activeProducts.toLocaleString()}
          icon={Package}
        />
      </div>

      {/* Main dashboard grid for charts and recent activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Overview (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={revenueOverTime} />
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentOrders orders={recentOrders} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
