"use client";

import {
  Home,
  Truck,
  Check,
  Package,
  CreditCard,
  LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IOrderTimelineEvent } from "@/types";

/**
 * Defines the props required by the OrderTimeline component.
 */
interface OrderTimelineProps {
  /**
   * An array of timeline events, which should be chronologically sorted.
   */
  timeline: IOrderTimelineEvent[];
}

/**
 * A helper function that maps an event title to a corresponding Lucide icon.
 * This provides a visual representation for different types of order events.
 *
 * @param {string} title - The title of the timeline event.
 * @returns {LucideIcon} A Lucide icon component.
 */
// TODO: This string-matching approach is functional but can be brittle. A more robust
// solution would be to add an `eventType` or `icon` field directly to the
// `IOrderTimelineEvent` schema in the backend, removing the need for this client-side logic.
const getIconForEvent = (title: string): LucideIcon => {
  const lowerCaseTitle = title.toLowerCase();
  if (lowerCaseTitle.includes("delivered")) return Home;
  if (
    lowerCaseTitle.includes("delivering") ||
    lowerCaseTitle.includes("transit")
  )
    return Truck;
  if (lowerCaseTitle.includes("payment")) return CreditCard;
  if (lowerCaseTitle.includes("placed")) return Check;
  return Package; // Default icon for other events like "Processing at warehouse".
};

/**
 * A client component that renders a vertical timeline to visualize the history
 * and current status of an order's fulfillment process.
 *
 * @param {OrderTimelineProps} props - The props containing the order's timeline data.
 */
export const OrderTimeline = ({ timeline }: OrderTimelineProps) => {
  return (
    <Card className="grow">
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
        {/* The ordered list provides a semantic structure for the timeline steps. */}
        <ol className="relative ml-3 border-l border-border">
          {timeline.map((event, index) => {
            // Determine the appropriate icon and status for styling.
            const Icon = getIconForEvent(event.title);
            const isCompleted = event.status === "completed";
            const isCurrent = event.status === "current";

            return (
              <li key={index} className="mb-10 ml-6">
                {/* The timeline marker (the circle with an icon). */}
                <span
                  className={`absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full ring-8 ring-background 
                    ${isCompleted ? "bg-primary/20 text-primary" : ""}
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

                {/* The title of the timeline event. */}
                <h4
                  className={`mb-0.5 font-semibold ${
                    isCurrent
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-foreground"
                  }`}
                >
                  {event.title}
                </h4>

                {/* The timestamp, formatted for the user's locale. */}
                <p className="text-sm text-muted-foreground">
                  {new Date(event.timestamp).toLocaleString("en-KE", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>

                {/* A more detailed description of the event. */}
                <p className="mt-1 text-sm text-muted-foreground">
                  {event.description}
                </p>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
};
