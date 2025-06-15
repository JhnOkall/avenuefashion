import { IOrder, IOrderTimelineEvent } from "@/types";

/**
 * A master template defining all possible stages of an order's lifecycle.
 */
export const ORDER_STAGES: (Omit<IOrderTimelineEvent, 'timestamp'> & { key: string })[] = [
  {
    key: 'pending',
    title: 'Order Placed',
    description: 'Your order has been received and is waiting for processing.',
    status: 'upcoming', 
  },
  {
    key: 'processing',
    title: 'Processing',
    description: 'We are preparing your items for shipment at the warehouse.',
    status: 'upcoming',
  },
  {
    key: 'in-transit',
    title: 'In Transit',
    description: 'Your order has shipped and is on its way.',
    status: 'upcoming',
  },
  {
    key: 'delivered', // Let's use 'delivered' for the final successful state
    title: 'Delivered',
    description: 'Your order has been successfully delivered. Thank you!',
    status: 'upcoming',
  },
];

/**
 * Maps a human-readable order status to its corresponding timeline key.
 * This is crucial for the admin panel to advance the timeline correctly.
 */
export const statusToTimelineKey: { [key in IOrder['status']]?: string } = {
  'Pending': 'pending',
  'Processing': 'processing',
  'In transit': 'in-transit',
  'Delivered': 'delivered',
};