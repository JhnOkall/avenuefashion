import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { fetchOrderById } from "@/lib/data";
import { AdminOrderDetailClient } from "@/components/admin/AdminOrderDetailClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const OrderDetailSkeleton = () => (
  <div className="grid gap-6 lg:grid-cols-3">
    <div className="lg:col-span-2 space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
    <div className="lg:col-span-1 space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  </div>
);

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  // The 'id' from params is the user-facing orderId without the '#'
  const order = await fetchOrderById(resolvedParams.id);

  if (!order) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Order Details</h1>
      <Suspense fallback={<OrderDetailSkeleton />}>
        <AdminOrderDetailClient order={order} />
      </Suspense>
    </div>
  );
}
