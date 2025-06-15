"use client";

import {
  Home,
  Truck,
  Check,
  Package,
  Warehouse, // New Icon
  LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IOrderTimelineEvent } from "@/types";
import { ORDER_STAGES } from "@/lib/order-stages"; // Import the master stages

/**
 * Defines the props required by the OrderTimeline component.
 */
interface OrderTimelineProps {
  /**
   * An array of timeline events, which should be chronologically sorted.
   */
  timeline: IOrderTimelineEvent[];
}

// Map the keys from our master template to icons. This is more robust.
const iconMap: Record<string, LucideIcon> = {
  placed: Check,
  processing: Warehouse,
  shipped: Package,
  "in-transit": Truck,
  delivered: Home,
};

/**
 * A client component that renders a complete vertical timeline to visualize the history
 * and future steps of an order's fulfillment process.
 */
export const OrderTimeline = ({ timeline }: OrderTimelineProps) => {
  // Create a map of actual events from the database for quick lookup.
  // We use the event title as the key, assuming it's unique per stage.
  const actualEventsMap = new Map<string, IOrderTimelineEvent>();
  timeline.forEach((event) => {
    actualEventsMap.set(event.title, event);
  });

  // Generate the full timeline by merging the master template with actual event data.
  const fullTimeline = ORDER_STAGES.map((stage) => {
    const actualEvent = actualEventsMap.get(stage.title);
    if (actualEvent) {
      // If an event for this stage exists in the DB, use its data
      return {
        ...stage,
        status: actualEvent.status,
        timestamp: actualEvent.timestamp,
      };
    }
    // Otherwise, it's an upcoming stage with no timestamp
    return { ...stage, status: "upcoming", timestamp: null };
  });

  return (
    <Card className="grow">
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative ml-3 border-l border-border">
          {fullTimeline.map((stage, index) => {
            const Icon = iconMap[stage.key] || Package; // Use the key for robust icon mapping
            const isCompleted = stage.status === "completed";
            const isCurrent = stage.status === "current";

            return (
              <li key={index} className="mb-10 ml-6">
                <span
                  className={`absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full ring-8 ring-background 
                    ${isCompleted ? "bg-primary text-primary-foreground" : ""}
                    ${
                      isCurrent
                        ? "bg-blue-200 text-blue-600 dark:bg-blue-900 dark:text-blue-300 animate-pulse"
                        : ""
                    }
                    ${
                      !isCompleted && !isCurrent
                        ? "bg-muted text-muted-foreground"
                        : ""
                    }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <h4
                  className={`mb-0.5 font-semibold ${
                    isCurrent
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-foreground"
                  }`}
                >
                  {stage.title}
                </h4>
                {/* Only show timestamp if the event has occurred */}
                {stage.timestamp && (
                  <p className="text-sm text-muted-foreground">
                    {new Date(stage.timestamp).toLocaleString("en-KE", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                )}
                <p className="mt-1 text-sm text-muted-foreground">
                  {stage.description}
                </p>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
};
