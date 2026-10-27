import { redirect } from "next/navigation";
import { getProviderKitchen } from "@/lib/data/provider";
import { requireUser } from "@/lib/session";

/** For provider pages that need a kitchen: sends the cook to create one first. */
export async function requireProviderKitchen() {
  const user = await requireUser(["PROVIDER"]);
  const kitchen = await getProviderKitchen(user.id);
  if (!kitchen) redirect("/provider/kitchen");
  return { user, kitchen };
}
