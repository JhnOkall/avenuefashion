"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { IOrder } from "@/types";
import { updateAdminOrder } from "@/lib/data";
import { getStatusVariant, formatPrice } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export const AdminOrderDetailClient = ({ order }: { order: IOrder }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState(order.status);

  const handleStatusUpdate = (newStatus: IOrder["status"]) => {
    startTransition(async () => {
      try {
        await updateAdminOrder(order.orderId, { status: newStatus });
        setCurrentStatus(newStatus);
        toast.success("Status Updated", {
          description: `Order ${order.orderId} is now ${newStatus}.`,
        });
        // We only need to refresh if we want other data to update,
        // but for status, we can update client state instantly.
        // router.refresh();
      } catch (error: any) {
        toast.error("Update Failed", { description: error.message });
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {/* Order Items Card */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>
              {order.items.length} item(s) in this order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">
                      {formatPrice(item.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(item.price * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Order Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6">
              <div className="absolute left-0 top-0 h-full w-0.5 bg-border -translate-x-1/2 ml-3"></div>
              {order.timeline.map((event, index) => (
                <div key={index} className="relative mb-6">
                  <div className="absolute -left-3 h-3 w-3 rounded-full bg-primary mt-1.5"></div>
                  <p className="font-semibold">{event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                  <time className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString()}
                  </time>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-6">
        {/* Order Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>{order.orderId}</CardTitle>
            <CardDescription>
              Order placed on {new Date(order.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={getStatusVariant(currentStatus) as any}>
                {currentStatus}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment</span>
              <span>{order.payment.method}</span>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full space-y-2">
              <Label>Update Status</Label>
              <Select onValueChange={handleStatusUpdate} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Change status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="In transit">In transit</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardFooter>
        </Card>

        {/* Customer & Shipping Card */}
        <Card>
          <CardHeader>
            <CardTitle>Customer & Shipping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="font-medium">{order.shippingDetails.name}</div>
            <div className="text-muted-foreground">
              {order.shippingDetails.email}
            </div>
            <div className="text-muted-foreground">
              {order.shippingDetails.phone}
            </div>
            <Separator />
            <div className="text-muted-foreground">
              {order.shippingDetails.address.split(",").map((line, i) => (
                <div key={i}>{line.trim()}</div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Card */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <dl className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(order.pricing.subtotal)}</dd>
            </dl>
            <dl className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{formatPrice(order.pricing.shipping)}</dd>
            </dl>
            <dl className="flex justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd>{formatPrice(order.pricing.tax)}</dd>
            </dl>
            <dl className="flex justify-between">
              <dt className="text-muted-foreground">Discount</dt>
              <dd>-{formatPrice(order.pricing.discount)}</dd>
            </dl>
            <Separator />
            <dl className="flex justify-between font-bold text-base">
              <dt>Total</dt>
              <dd>{formatPrice(order.pricing.total)}</dd>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
