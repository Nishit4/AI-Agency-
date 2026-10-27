import type { Metadata } from "next";
import { AddressList } from "@/components/address-list";
import { AddressForm } from "@/components/forms/address-form";
import { PageHeader } from "@/components/ui/page-header";
import { getAddresses } from "@/lib/data/customer";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Saved addresses" };

export default async function AddressesPage() {
  const user = await requireUser(["CUSTOMER"]);
  const addresses = await getAddresses(user.id);
  return (
    <>
      <PageHeader title="Saved addresses" description="Where should we deliver your homemade food?" />
      <div className="space-y-6">
        <AddressList addresses={addresses} />
        <section className="card p-5">
          <h2 className="mb-4 text-lg font-bold">Add a new address</h2>
          <AddressForm />
        </section>
      </div>
    </>
  );
}
