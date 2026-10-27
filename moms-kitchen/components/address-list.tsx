import { MapPin, Trash2 } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { deleteAddress } from "@/lib/actions/address";
import type { AddressDTO } from "@/types";

export function AddressList({ addresses }: { addresses: AddressDTO[] }) {
  if (addresses.length === 0) {
    return <p className="text-sm text-stone-600">No saved addresses yet.</p>;
  }
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {addresses.map((address) => (
        <li key={address.id} className="flex items-start gap-3 rounded-xl border border-orange-100 bg-white p-4">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold">{address.label}</p>
            <p className="text-stone-600">{address.addressLine}</p>
            <p className="text-stone-600">
              {address.city}
              {address.state ? `, ${address.state}` : ""} – {address.pincode}
            </p>
            {address.landmark && <p className="text-xs text-stone-500">Landmark: {address.landmark}</p>}
          </div>
          <ActionButton
            action={deleteAddress.bind(null, address.id)}
            confirmMessage="Delete this address?"
            className="btn-ghost btn-sm text-red-600"
            title="Delete address"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </ActionButton>
        </li>
      ))}
    </ul>
  );
}
