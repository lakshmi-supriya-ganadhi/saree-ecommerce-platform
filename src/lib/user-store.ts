import "server-only";
import type { Order, Address } from "./types";

const MOCK_ORDERS: Record<string, Order[]> = {
  u1: [
    {
      id: "ORD-2026-001",
      date: "2026-05-15",
      items: [
        { name: "Kanchipuram Bridal Silk", variant: "Crimson Red", quantity: 1, price: 18999 },
      ],
      total: 18999,
      status: "Delivered",
    },
    {
      id: "ORD-2026-002",
      date: "2026-06-01",
      items: [
        { name: "Banarasi Zari Weave", variant: "Gold", quantity: 1, price: 15499 },
        { name: "Chanderi Cotton-Silk", variant: "Pink", quantity: 2, price: 9998 },
      ],
      total: 25497,
      status: "Processing",
    },
  ],
};

const addressStore = new Map<string, Address[]>();

export function getOrders(userId: string): Order[] {
  return MOCK_ORDERS[userId] ?? [];
}

export function getAddresses(userId: string): Address[] {
  return addressStore.get(userId) ?? [];
}

export function addAddress(userId: string, address: Address): void {
  const existing = addressStore.get(userId) ?? [];
  addressStore.set(userId, [...existing, address]);
}
