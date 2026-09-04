// Core domain types for SmartOps, mirrored from the Supabase schema in supabase/schema.sql

export type Department = "operations" | "technology" | "finance" | "marketing";

export type ClientStatus = "lead" | "onboarding" | "active" | "paused" | "churned";

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  status: ClientStatus;
  plan_amount: number; // INR per month, 7499 - 150000
  plan_name: string;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Approval {
  id: string;
  department: Department;
  agent_name: string;
  title: string;
  description: string;
  payload: Record<string, unknown>;
  status: ApprovalStatus;
  client_id: string | null;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

export type AgentStatusValue = "idle" | "running" | "error" | "awaiting_approval";

export interface AgentStatus {
  id: string;
  name: string;
  department: Department;
  role: string;
  status: AgentStatusValue;
  last_run_at: string | null;
  last_error: string | null;
}

export type TaskStatus = "queued" | "in_progress" | "done" | "failed";

export interface AgentTask {
  id: string;
  agent_name: string;
  department: Department;
  client_id: string | null;
  title: string;
  status: TaskStatus;
  result: string | null;
  created_at: string;
  updated_at: string;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface Invoice {
  id: string;
  client_id: string;
  amount: number;
  status: InvoiceStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  due_date: string;
  paid_at: string | null;
  created_at: string;
}

export type CampaignStatus = "draft" | "active" | "paused" | "completed";

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: CampaignStatus;
  budget: number;
  spent: number;
  leads_generated: number;
  created_at: string;
}

export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

export interface Lead {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  campaign_id: string | null;
  created_at: string;
}

export interface AgentMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent_name: string;
  created_at: string;
}

export interface AgentChatRequest {
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
  clientId?: string;
}

export interface AgentChatResponse {
  reply: string;
  agent_name: string;
  requires_approval?: boolean;
  approval?: Partial<Approval>;
}
