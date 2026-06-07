import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { CartView } from "@/components/cart-view";

// Protected: cart is only for logged-in users. The items themselves live in
// client state (localStorage), but the page is gated server-side.
export default async function CartPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <CartView />;
}
