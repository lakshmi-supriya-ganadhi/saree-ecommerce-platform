import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSarees } from "@/lib/data";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sarees = getSarees();

  return <DashboardClient sarees={sarees} userName={user.name} />;
}
