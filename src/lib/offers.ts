export type Offer = {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  bgColor: string;
  accentColor: string;
  borderColor: string;
};

export const OFFERS: Offer[] = [
  {
    id: "monsoon-sale",
    badge: "LIMITED TIME",
    title: "Monsoon Sale",
    subtitle: "Up to 20% off on all silk sarees this season.",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    accentColor: "text-rose-700 dark:text-rose-300",
    borderColor: "border-rose-200 dark:border-rose-800",
  },
  {
    id: "free-shipping",
    badge: "ALWAYS ON",
    title: "Free Shipping",
    subtitle: "On all orders above ₹5,000 — delivered to your door.",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    accentColor: "text-amber-700 dark:text-amber-300",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  {
    id: "festive-edit",
    badge: "NEW ARRIVALS",
    title: "Festive Edit",
    subtitle: "Diwali collection is here — handpicked for the season.",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    accentColor: "text-purple-700 dark:text-purple-300",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
];
