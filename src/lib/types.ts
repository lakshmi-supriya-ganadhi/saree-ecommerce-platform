export type Occasion = "Bridal" | "Casual" | "Party" | "Office";

export type ColorVariant = {
  colorName: string;
  hex: string;
  image: string;
  inStock: boolean;
};

export type Saree = {
  id: string;
  name: string;
  fabric: string;
  region: string;
  price: number;
  variants: ColorVariant[];
  description: string;
  inStock: boolean;
  occasion: Occasion;
  rating: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export type CartItem = {
  saree: Saree;
  variant: ColorVariant;
  quantity: number;
};

export type WishlistItem = {
  saree: Saree;
  variant: ColorVariant;
};

export type Order = {
  id: string;
  date: string;
  items: { name: string; variant: string; quantity: number; price: number }[];
  total: number;
  status: "Delivered" | "Processing" | "Shipped";
};

export type Address = {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  pincode: string;
  state: string;
};
