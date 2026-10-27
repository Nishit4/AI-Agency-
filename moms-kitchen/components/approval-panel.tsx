import { ActionButton } from "@/components/ui/action-button";
import { setKitchenStatus } from "@/lib/actions/admin";
import type { KitchenStatus } from "@/types";

/** Approve / reject / suspend buttons for a kitchen. */
export function ApprovalPanel({ kitchenId, status }: { kitchenId: string; status: KitchenStatus }) {
  return (
    <div className="flex flex-wrap gap-2">
      {status !== "APPROVED" && (
        <ActionButton action={setKitchenStatus.bind(null, kitchenId, "APPROVED")} className="btn-success btn-sm">
          Approve
        </ActionButton>
      )}
      {status === "PENDING" && (
        <ActionButton
          action={setKitchenStatus.bind(null, kitchenId, "REJECTED")}
          confirmMessage="Reject this kitchen?"
          className="btn-danger btn-sm"
        >
          Reject
        </ActionButton>
      )}
      {status === "APPROVED" && (
        <ActionButton
          action={setKitchenStatus.bind(null, kitchenId, "SUSPENDED")}
          confirmMessage="Suspend this kitchen? It will be hidden from customers."
          className="btn-secondary btn-sm text-red-700"
        >
          Suspend
        </ActionButton>
      )}
    </div>
  );
}
