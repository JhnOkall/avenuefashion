import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { IOrder } from "@/types" 

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(price);
}

export const getStatusVariant = (status: IOrder['status']) => {
  switch (status) {
    case 'Confirmed': return 'success';
    case 'Cancelled': return 'destructive';
    case 'In transit': return 'default';
    default: return 'secondary';
  }
};