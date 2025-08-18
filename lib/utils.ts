import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatPrice = (amount: number, currency: string) => {
  return amount.toLocaleString("vi-VN", { style: "currency", currency });
};
