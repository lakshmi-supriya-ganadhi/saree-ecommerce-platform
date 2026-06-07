import type { Saree } from "./types";

// Seeded catalogue. This is the single source of truth for products today.
// To go "real" later, replace these functions with DB queries (e.g. Supabase) —
// the rest of the app only depends on getSarees() / getSaree().

const SAREES: Saree[] = [
  {
    id: "kanchi-red",
    name: "Kanchipuram Bridal Silk",
    fabric: "Pure Silk",
    region: "Kanchipuram",
    price: 18999,
    color: "#b91c1c",
    image: "",
    description:
      "Handwoven pure mulberry silk with a contrast zari border and traditional temple motifs.",
    inStock: true,
  },
  {
    id: "banarasi-gold",
    name: "Banarasi Zari Weave",
    fabric: "Katan Silk",
    region: "Banarasi",
    price: 15499,
    color: "#a16207",
    image: "",
    description:
      "Classic Banarasi with intricate gold zari brocade — a timeless wedding heirloom.",
    inStock: true,
  },
  {
    id: "mysore-teal",
    name: "Mysore Crepe Silk",
    fabric: "Crepe Silk",
    region: "Mysore",
    price: 7999,
    color: "#0f766e",
    image: "",
    description:
      "Lightweight, lustrous crepe silk in deep teal — soft drape for everyday elegance.",
    inStock: true,
  },
  {
    id: "chanderi-pink",
    name: "Chanderi Cotton-Silk",
    fabric: "Chanderi",
    region: "Madhya Pradesh",
    price: 4999,
    color: "#db2777",
    image: "",
    description:
      "Sheer Chanderi with delicate buti work and a glossy finish — ideal for daytime functions.",
    inStock: true,
  },
  {
    id: "georgette-navy",
    name: "Georgette Designer Drape",
    fabric: "Georgette",
    region: "Surat",
    price: 3499,
    color: "#1e3a8a",
    image: "",
    description:
      "Flowy georgette with sequin embellishments — modern party-ready styling.",
    inStock: true,
  },
  {
    id: "linen-olive",
    name: "Handloom Linen",
    fabric: "Linen",
    region: "West Bengal",
    price: 2899,
    color: "#4d7c0f",
    image: "",
    description:
      "Breathable handloom linen with a subtle slub texture — effortless office wear.",
    inStock: true,
  },
  {
    id: "patola-maroon",
    name: "Patola Double Ikat",
    fabric: "Silk",
    region: "Patan, Gujarat",
    price: 24999,
    color: "#7f1d1d",
    image: "",
    description:
      "Rare double-ikat Patola, hand-dyed and woven over months — a collector's piece.",
    inStock: false,
  },
  {
    id: "tussar-mustard",
    name: "Tussar Silk Print",
    fabric: "Tussar Silk",
    region: "Bhagalpur",
    price: 6499,
    color: "#ca8a04",
    image: "",
    description:
      "Natural tussar with hand-block prints and a rich golden sheen.",
    inStock: true,
  },
  {
    id: "cotton-indigo",
    name: "Ikat Cotton Handloom",
    fabric: "Cotton",
    region: "Pochampally",
    price: 2199,
    color: "#3730a3",
    image: "",
    description:
      "Geometric Pochampally ikat in indigo — durable, comfortable, everyday cotton.",
    inStock: true,
  },
  {
    id: "organza-lavender",
    name: "Organza Floral Saree",
    fabric: "Organza",
    region: "Bengaluru",
    price: 5499,
    color: "#7c3aed",
    image: "",
    description:
      "Crisp organza with digital floral prints and a satin border — light and dreamy.",
    inStock: true,
  },
];

export function getSarees(): Saree[] {
  return SAREES;
}

export function getSaree(id: string): Saree | undefined {
  return SAREES.find((s) => s.id === id);
}
