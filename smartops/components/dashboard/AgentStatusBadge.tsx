import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { AgentStatusValue } from "@/types";

const STATUS_TONE: Record<AgentStatusValue, BadgeTone> = {
  idle: "slate",
  running: "blue",
  awaiting_approval: "amber",
  error: "red",
};

const STATUS_LABEL: Record<AgentStatusValue, string> = {
  idle: "Idle",
  running: "Running",
  awaiting_approval: "Awaiting approval",
  error: "Error",
};

export function AgentStatusBadge({ status }: { status: AgentStatusValue }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}
