import type { Saree } from "./types";

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
    occasion: "Bridal",
    rating: 4.8,
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
    occasion: "Bridal",
    rating: 4.6,
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
    occasion: "Casual",
    rating: 4.2,
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
    occasion: "Office",
    rating: 4.3,
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
    occasion: "Party",
    rating: 4.4,
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
    occasion: "Office",
    rating: 4.1,
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
    occasion: "Bridal",
    rating: 4.9,
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
    occasion: "Casual",
    rating: 4.0,
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
    occasion: "Casual",
    rating: 3.9,
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
    occasion: "Party",
    rating: 4.5,
  },
];

export function getSarees(): Saree[] {
  return SAREES;
}

export function getSaree(id: string): Saree | undefined {
  return SAREES.find((s) => s.id === id);
}
