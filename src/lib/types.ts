export type Occasion = "Bridal" | "Casual" | "Party" | "Office";

export type Saree = {
  id: string;
  name: string;
  fabric: string;
  region: string;
  price: number;
  color: string;
  image: string;
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
  quantity: number;
};
