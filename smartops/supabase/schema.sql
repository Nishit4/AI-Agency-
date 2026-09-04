-- =========================================================
-- SmartOps — Supabase schema (PostgreSQL, free tier)
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------- enums ----------
do $$ begin
  create type department as enum ('operations', 'technology', 'finance', 'marketing');
exception when duplicate_object then null; end $$;

do $$ begin
  create type client_status as enum ('lead', 'onboarding', 'active', 'paused', 'churned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type approval_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type agent_status_value as enum ('idle', 'running', 'error', 'awaiting_approval');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_status as enum ('queued', 'in_progress', 'done', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type campaign_status as enum ('draft', 'active', 'paused', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_status as enum ('new', 'contacted', 'qualified', 'converted', 'lost');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_role as enum ('user', 'assistant');
exception when duplicate_object then null; end $$;

-- ---------- clients ----------
create table if not exists clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  company text not null,
  email text not null,
  phone text,
  status client_status not null default 'lead',
  plan_amount numeric(10, 2) not null default 7499 check (plan_amount between 7499 and 150000),
  plan_name text not null default 'Starter',
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- agents (15 AI agents, 4 departments) ----------
create table if not exists agents (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  department department not null,
  role text not null,
  status agent_status_value not null default 'idle',
  last_run_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

-- ---------- approvals (CEO approval queue) ----------
create table if not exists approvals (
  id uuid primary key default uuid_generate_v4(),
  department department not null,
  agent_name text not null,
  title text not null,
  description text not null,
  payload jsonb not null default '{}'::jsonb,
  status approval_status not null default 'pending',
  client_id uuid references clients(id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by text
);

-- ---------- agent tasks (work log) ----------
create table if not exists agent_tasks (
  id uuid primary key default uuid_generate_v4(),
  agent_name text not null,
  department department not null,
  client_id uuid references clients(id) on delete set null,
  title text not null,
  status task_status not null default 'queued',
  result text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- invoices / billing (Razorpay) ----------
create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  amount numeric(10, 2) not null,
  status invoice_status not null default 'draft',
  razorpay_order_id text,
  razorpay_payment_id text,
  due_date date not null,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- marketing campaigns ----------
create table if not exists campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  channel text not null,
  status campaign_status not null default 'draft',
  budget numeric(10, 2) not null default 0,
  spent numeric(10, 2) not null default 0,
  leads_generated integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- leads ----------
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  company text,
  email text not null,
  phone text,
  source text,
  status lead_status not null default 'new',
  campaign_id uuid references campaigns(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- agent chat messages (CEO <-> Assistant agent) ----------
create table if not exists agent_messages (
  id uuid primary key default uuid_generate_v4(),
  role message_role not null,
  content text not null,
  agent_name text not null default 'assistant',
  created_at timestamptz not null default now()
);

-- ---------- indexes ----------
create index if not exists idx_approvals_status on approvals(status);
create index if not exists idx_approvals_department on approvals(department);
create index if not exists idx_agent_tasks_status on agent_tasks(status);
create index if not exists idx_clients_status on clients(status);
create index if not exists idx_invoices_client on invoices(client_id);
create index if not exists idx_invoices_status on invoices(status);
create index if not exists idx_leads_status on leads(status);
create index if not exists idx_agent_messages_created_at on agent_messages(created_at);

-- ---------- updated_at trigger helper ----------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_clients_updated_at on clients;
create trigger trg_clients_updated_at before update on clients
  for each row execute function set_updated_at();

drop trigger if exists trg_agent_tasks_updated_at on agent_tasks;
create trigger trg_agent_tasks_updated_at before update on agent_tasks
  for each row execute function set_updated_at();

-- ---------- seed: 15 AI agents across 4 departments ----------
insert into agents (name, department, role) values
  ('Ops Manager',        'operations', 'Coordinates onboarding, delivery timelines and internal SOPs'),
  ('Client Success',     'operations', 'Handles day-to-day client communication and satisfaction'),
  ('Project Coordinator','operations', 'Tracks deliverables and deadlines across all active clients'),
  ('QA Auditor',         'operations', 'Reviews agent output quality before it reaches clients'),
  ('CTO Agent',          'technology', 'Owns technical architecture decisions and tooling'),
  ('DevOps Agent',       'technology', 'Manages deployments, n8n workflows and integrations'),
  ('Support Engineer',   'technology', 'Triages and resolves client-reported technical issues'),
  ('Automation Builder', 'technology', 'Builds and maintains n8n automations for client workflows'),
  ('CFO Agent',          'finance', 'Owns pricing, invoicing policy and financial reporting'),
  ('Billing Agent',      'finance', 'Generates and chases invoices via Razorpay'),
  ('Bookkeeper',         'finance', 'Reconciles payments and tracks monthly P&L'),
  ('CMO Agent',          'marketing', 'Owns marketing strategy and campaign planning'),
  ('Content Writer',     'marketing', 'Drafts landing pages, emails and social copy'),
  ('Lead Gen Agent',     'marketing', 'Sources and qualifies inbound/outbound leads'),
  ('SEO Analyst',        'marketing', 'Monitors and improves organic search performance')
on conflict (name) do nothing;

-- ---------- row level security ----------
-- The app uses the Supabase service-role key from trusted server-side API
-- routes for all writes, and the anon key (with Supabase Auth magic-link
-- session) for the CEO dashboard reads. Since there is exactly one CEO user,
-- policies simply require an authenticated session.

alter table clients enable row level security;
alter table agents enable row level security;
alter table approvals enable row level security;
alter table agent_tasks enable row level security;
alter table invoices enable row level security;
alter table campaigns enable row level security;
alter table leads enable row level security;
alter table agent_messages enable row level security;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'clients', 'agents', 'approvals', 'agent_tasks',
    'invoices', 'campaigns', 'leads', 'agent_messages'
  ])
  loop
    execute format(
      'drop policy if exists "authenticated_read_%1$s" on %1$s;', t
    );
    execute format(
      'create policy "authenticated_read_%1$s" on %1$s for select using (auth.role() = ''authenticated'');',
      t
    );
    execute format(
      'drop policy if exists "authenticated_write_%1$s" on %1$s;', t
    );
    execute format(
      'create policy "authenticated_write_%1$s" on %1$s for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'');',
      t
    );
  end loop;
end $$;
