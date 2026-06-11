import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOrders, getAddresses } from "@/lib/user-store";
import { AccountClient } from "@/components/account-client";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = getOrders(user.id);
  const addresses = getAddresses(user.id);

  return <AccountClient user={user} orders={orders} addresses={addresses} />;
}
