// Core domain types. Kept framework-agnostic so the data/auth layer can later
// be swapped for a real DB (e.g. Supabase) without touching the UI.

export type Saree = {
  id: string;
  name: string;
  fabric: string; // e.g. "Silk", "Cotton", "Georgette"
  region: string; // e.g. "Kanchipuram", "Banarasi"
  price: number; // in INR (₹)
  color: string;
  image: string; // public path or remote URL
  description: string;
  inStock: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export type CartItem = {
  saree: Saree;
  quantity: number;
};
