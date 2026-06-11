import type { Saree } from "./types";

const IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=600&fit=crop&q=80`;

const SAREES: Saree[] = [
  {
    id: "kanchi-red",
    name: "Kanchipuram Bridal Silk",
    fabric: "Pure Silk",
    region: "Kanchipuram",
    price: 18999,
    description:
      "Handwoven pure mulberry silk with a contrast zari border and traditional temple motifs.",
    inStock: true,
    occasion: "Bridal",
    rating: 4.8,
    variants: [
      { colorName: "Crimson Red", hex: "#b91c1c", image: IMG("6XZWrSBo5o4"), inStock: true },
      { colorName: "Emerald Green", hex: "#059669", image: IMG("y9HsMX3-mUY"), inStock: true },
      { colorName: "Royal Blue", hex: "#1d4ed8", image: IMG("tjRs987fPfg"), inStock: true },
    ],
  },
  {
    id: "banarasi-gold",
    name: "Banarasi Zari Weave",
    fabric: "Katan Silk",
    region: "Banarasi",
    price: 15499,
    description:
      "Classic Banarasi with intricate gold zari brocade — a timeless wedding heirloom.",
    inStock: true,
    occasion: "Bridal",
    rating: 4.6,
    variants: [
      { colorName: "Gold", hex: "#a16207", image: IMG("K-tVxCdqMLs"), inStock: true },
      { colorName: "Maroon", hex: "#7f1d1d", image: IMG("xTrp1WOq2Do"), inStock: true },
      { colorName: "Ivory", hex: "#d6d3d1", image: IMG("Rm9DL9DmGi4"), inStock: true },
    ],
  },
  {
    id: "mysore-teal",
    name: "Mysore Crepe Silk",
    fabric: "Crepe Silk",
    region: "Mysore",
    price: 7999,
    description:
      "Lightweight, lustrous crepe silk — soft drape for everyday elegance.",
    inStock: true,
    occasion: "Casual",
    rating: 4.2,
    variants: [
      { colorName: "Teal", hex: "#0f766e", image: IMG("dQO-3ud96rQ"), inStock: true },
      { colorName: "Purple", hex: "#7c3aed", image: IMG("wcgCFUi_Zws"), inStock: true },
      { colorName: "Rose", hex: "#e11d48", image: IMG("jNePilPJTjY"), inStock: true },
    ],
  },
  {
    id: "chanderi-pink",
    name: "Chanderi Cotton-Silk",
    fabric: "Chanderi",
    region: "Madhya Pradesh",
    price: 4999,
    description:
      "Sheer Chanderi with delicate buti work and a glossy finish — ideal for daytime functions.",
    inStock: true,
    occasion: "Office",
    rating: 4.3,
    variants: [
      { colorName: "Pink", hex: "#db2777", image: IMG("TytqgMlC7Ps"), inStock: true },
      { colorName: "Mint", hex: "#10b981", image: IMG("A7H3qmJTNJc"), inStock: true },
      { colorName: "Peach", hex: "#fb923c", image: IMG("dCuCMZ9XnHg"), inStock: true },
    ],
  },
  {
    id: "georgette-navy",
    name: "Georgette Designer Drape",
    fabric: "Georgette",
    region: "Surat",
    price: 3499,
    description:
      "Flowy georgette with sequin embellishments — modern party-ready styling.",
    inStock: true,
    occasion: "Party",
    rating: 4.4,
    variants: [
      { colorName: "Navy", hex: "#1e3a8a", image: IMG("v9nCfAKxxx4"), inStock: true },
      { colorName: "Coral", hex: "#f97316", image: IMG("rjgFxE3eARQ"), inStock: true },
      { colorName: "Black", hex: "#171717", image: IMG("8g8JB2ZaZKc"), inStock: true },
    ],
  },
  {
    id: "linen-olive",
    name: "Handloom Linen",
    fabric: "Linen",
    region: "West Bengal",
    price: 2899,
    description:
      "Breathable handloom linen with a subtle slub texture — effortless office wear.",
    inStock: true,
    occasion: "Office",
    rating: 4.1,
    variants: [
      { colorName: "Olive", hex: "#4d7c0f", image: IMG("nDo0JshCZw8"), inStock: true },
      { colorName: "Beige", hex: "#d6d3d1", image: IMG("udCX1mvNFos"), inStock: true },
      { colorName: "Grey", hex: "#6b7280", image: IMG("nSBC88WAklo"), inStock: true },
    ],
  },
  {
    id: "patola-maroon",
    name: "Patola Double Ikat",
    fabric: "Silk",
    region: "Patan, Gujarat",
    price: 24999,
    description:
      "Rare double-ikat Patola, hand-dyed and woven over months — a collector's piece.",
    inStock: false,
    occasion: "Bridal",
    rating: 4.9,
    variants: [
      { colorName: "Maroon", hex: "#7f1d1d", image: IMG("Xqa_NWl4xEY"), inStock: false },
      { colorName: "Indigo", hex: "#3730a3", image: IMG("njVir8eVq1M"), inStock: false },
    ],
  },
  {
    id: "tussar-mustard",
    name: "Tussar Silk Print",
    fabric: "Tussar Silk",
    region: "Bhagalpur",
    price: 6499,
    description:
      "Natural tussar with hand-block prints and a rich golden sheen.",
    inStock: true,
    occasion: "Casual",
    rating: 4.0,
    variants: [
      { colorName: "Mustard", hex: "#ca8a04", image: IMG("gLxAUUHZjAw"), inStock: true },
      { colorName: "Rust", hex: "#c2410c", image: IMG("ohEYtC4TEsg"), inStock: true },
      { colorName: "Sage", hex: "#65a30d", image: IMG("tWkK51TlsdE"), inStock: true },
    ],
  },
  {
    id: "cotton-indigo",
    name: "Ikat Cotton Handloom",
    fabric: "Cotton",
    region: "Pochampally",
    price: 2199,
    description:
      "Geometric Pochampally ikat — durable, comfortable, everyday cotton.",
    inStock: true,
    occasion: "Casual",
    rating: 3.9,
    variants: [
      { colorName: "Indigo", hex: "#3730a3", image: IMG("SiQTqnp-qd8"), inStock: true },
      { colorName: "Terracotta", hex: "#c2410c", image: IMG("1n74YwCkcKU"), inStock: true },
      { colorName: "White", hex: "#f5f5f4", image: IMG("AZz_MHYNzFA"), inStock: true },
    ],
  },
  {
    id: "organza-lavender",
    name: "Organza Floral Saree",
    fabric: "Organza",
    region: "Bengaluru",
    price: 5499,
    description:
      "Crisp organza with digital floral prints and a satin border — light and dreamy.",
    inStock: true,
    occasion: "Party",
    rating: 4.5,
    variants: [
      { colorName: "Lavender", hex: "#7c3aed", image: IMG("i6WNgoMpEjY"), inStock: true },
      { colorName: "Blush", hex: "#fda4af", image: IMG("0RMDcqQMAww"), inStock: true },
      { colorName: "Teal", hex: "#0f766e", image: IMG("2DZmm6QKFQE"), inStock: true },
    ],
  },
];

export function getSarees(): Saree[] {
  return SAREES;
}

export function getSaree(id: string): Saree | undefined {
  return SAREES.find((s) => s.id === id);
}

export function getFeaturedSarees(count = 4): Saree[] {
  return SAREES.filter((s) => s.inStock).slice(0, count);
}
