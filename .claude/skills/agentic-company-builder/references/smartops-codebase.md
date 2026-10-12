# SmartOps build recipes

Step-by-step changes for the SmartOps codebase (`smartops/`). Paths below are
relative to `smartops/` unless they start with `.claude/`. Read the files you're
about to touch first. These recipes describe the code as of this skill's
writing, and the code may have moved on since.

## Contents

0. [Lock down the API (do this first)](#0-lock-down-the-api)
1. [Make approvals idempotent](#1-make-approvals-idempotent)
2. [Add an agent to an existing department](#2-add-an-agent-to-an-existing-department)
3. [Route to specialist agents](#3-route-to-specialist-agents)
4. [Structured proposals (typed actions)](#4-structured-proposals-typed-actions)
5. [Add an executor for an approved action](#5-add-an-executor-for-an-approved-action)
6. [Add a new department](#6-add-a-new-department)
7. [Add an integration / MCP server](#7-add-an-integration--mcp-server)
8. [Accept a new inbound n8n event](#8-accept-a-new-inbound-n8n-event)
9. [Scheduled (autonomous) agent runs](#9-scheduled-autonomous-agent-runs)
10. [Verify](#10-verify)

---

## 0. Lock down the API

**Why:** `middleware.ts` matches only `/dashboard/:path*`, so every `/api/*`
route is public. Anyone with the URL can approve pending items (which fires
invoices and n8n workflows), inject fake approvals, or run agents on your
Anthropic credits. Webhooks are the exception, because they check their own
secrets.

**Change `middleware.ts`** to also guard `/api/*`. Return JSON 401 for API
calls instead of a redirect. Let webhooks and cron through, since they
authenticate with shared secrets. Check that the session belongs to the CEO,
because a Supabase magic link can create an account for *any* email when
sign-ups are enabled:

```ts
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // Webhooks and cron jobs authenticate with their own shared secrets.
  if (pathname.startsWith("/api/webhooks/") || pathname.startsWith("/api/cron/")) return res;

  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();
  const ceoEmail = process.env.CEO_EMAIL?.toLowerCase();
  const isCeo = !!session && (!ceoEmail || session.user.email?.toLowerCase() === ceoEmail);

  if (!isCeo) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }
  return res;
}

export const config = { matcher: ["/dashboard/:path*", "/api/:path*"] };
```

**Watch out:** `executeApprovedAction` in `app/api/approvals/route.ts` calls
`fetch(\`${appUrl()}/api/invoices\`)` server-to-server. That request carries no
session cookie, so it gets a 401 after this change. Move the invoice-creation
logic out of `app/api/invoices/route.ts` into a function (for example
`lib/invoices.ts → createAndSendInvoice()`) and call it directly from both
places. Calling the function directly is also faster and easier to test than an
internal HTTP hop.

Also consider turning off open sign-ups in Supabase once the CEO account exists.
The setting is called "Allow new users to sign up" in the Authentication
settings. The `CEO_EMAIL` check above is the backstop if sign-ups stay on.

## 1. Make approvals idempotent

**Why:** the PATCH handler updates by `id` alone. A double click or a replayed
request re-runs the executor, which can produce two invoices or two workflow
runs.

Only resolve rows that are still pending, and treat "nothing updated" as a
conflict:

```ts
const { data, error } = await supabase
  .from("approvals")
  .update({ status, resolved_at: new Date().toISOString(), resolved_by: resolved_by ?? "CEO" })
  .eq("id", id)
  .eq("status", "pending")          // ← only the first decision wins
  .select()
  .maybeSingle();

if (error) return NextResponse.json({ error: error.message }, { status: 500 });
if (!data) return NextResponse.json({ error: "Approval not found or already resolved" }, { status: 409 });
```

Optionally record what happened, so the dashboard can show it and the
operating playbook can measure it:

```sql
alter table approvals add column if not exists executed_at timestamptz;
alter table approvals add column if not exists execution_result jsonb;
```

After the executor returns, write
`{ executed_at: now, execution_result: execution }` back to the row.

## 2. Add an agent to an existing department

1. **Persona.** Add an entry to `AGENTS` in `lib/claude.ts`. Use
   `references/agent-design.md` for the prompt and approval triggers. Keep the
   key and `name` identical, because the name is also the database key.
   ```ts
   "Proposal Writer": {
     name: "Proposal Writer",
     department: "marketing",
     role: "Drafts tailored proposals and pricing pages for qualified leads",
     systemPrompt: `${BASE_GUARDRAILS}\nYou are the Proposal Writer. …`,
     requiresApprovalFor: ["sending a proposal to a lead"],
   },
   ```
2. **Database row.** Add it to the agents seed in `supabase/schema.sql` (so
   fresh installs get it), and give the user this to run now:
   ```sql
   insert into agents (name, department, role)
   values ('Proposal Writer', 'marketing', 'Drafts tailored proposals and pricing pages for qualified leads')
   on conflict (name) do nothing;
   ```
3. **Make it reachable.** Without this step the agent exists but never runs.
   See recipe 3.
4. **Counts in prose.** "16 agents" is hard-coded in `BASE_GUARDRAILS` and
   `ASSISTANT_SYSTEM_PROMPT` (`lib/claude.ts`), `app/dashboard/agents/page.tsx`,
   `app/layout.tsx` and `SETUP.md`. Prefer computing it,
   `` `${Object.keys(AGENTS).length}` ``, in the TS files, so this stops
   drifting.
5. Run the registry check.

## 3. Route to specialist agents

**Why:** each department runner hard-codes `LEAD_AGENT`, so specialists such as
Billing Agent and Content Writer never run.

**Step 1: one shared runner.** The four runners in `lib/agents/` are
near-identical. Extract the body of `runFinanceAgent` into
`lib/agents/run.ts`:

```ts
export async function runDepartmentAgent(
  department: Department,
  agentName: string,
  { message, history, clientId }: AgentChatRequest
): Promise<AgentChatResponse> {
  // …same body as runFinanceAgent, with LEAD_AGENT → agentName and DEPARTMENT → department
}

export function pickAgent(department: Department, requested: string | undefined, lead: string): string {
  return requested && AGENTS[requested]?.department === department ? requested : lead;
}
```

Each department file then shrinks to:

```ts
export const runFinanceAgent = (req: AgentChatRequest) =>
  runDepartmentAgent("finance", pickAgent("finance", req.agent, "CFO Agent"), req);
```

**Step 2: choose how the specialist gets picked.**

- **Explicit (simplest).** Add `agent?: string` to `AgentChatRequest` in
  `types/index.ts`. The routes already pass the whole body through. Add an
  optional agent picker to `components/dashboard/AgentChat.tsx`, filled from
  `agentsByDepartment(dept)`.
- **Lead triages.** First ask Claude which agent should handle the request,
  then run that agent:
  ```ts
  const roster = agentsByDepartment(department).map((a) => `- ${a.name}: ${a.role}`).join("\n");
  const pick = (await callClaude({
    systemPrompt: `Choose the single best agent for the request. Reply with the exact agent name only.\n${roster}`,
    messages: [{ role: "user", content: message }],
    maxTokens: 20,
  })).trim();
  const agentName = pickAgent(department, pick, lead);
  ```
  This doubles the calls. Add a `model` option to `callClaude` and use a
  cheaper model for routing (for example a `CLAUDE_ROUTER_MODEL` env var).

Explicit routing is predictable and free. Triage feels more "agentic" but adds
cost and an extra failure point. Start explicit unless the user wants a single
chat box per department.

## 4. Structured proposals (typed actions)

**Why:** approvals raised from chat today have an empty `payload`, so executors
have nothing to act on. Detecting them also depends on the reply containing an
exact phrase. Claude tool use fixes both: the agent *proposes* an action by
calling a tool with a typed input, and the server decides whether to run it now
or queue it for approval.

**4a. Action catalog: `lib/actions.ts`.** Reuse the payload keys the existing
executors already understand (`invoice_amount`, `due_date`, `workflow`), so
they work without changes.

```ts
import type { Department } from "@/types";

export interface ActionSpec {
  department: Department;
  risk: "auto" | "approval";   // see the autonomy ladder in agent-design.md
  description: string;
  input_schema: { type: "object"; properties: Record<string, unknown>; required?: string[] };
}

export const ACTIONS: Record<string, ActionSpec> = {
  send_invoice: {
    department: "finance",
    risk: "approval",
    description: "Create a Razorpay payment link for a client and email it to them.",
    input_schema: {
      type: "object",
      properties: {
        client_id: { type: "string", description: "Client UUID from the context you were given" },
        invoice_amount: { type: "number", description: "Amount in INR" },
        due_date: { type: "string", description: "YYYY-MM-DD" },
      },
      required: ["client_id", "invoice_amount", "due_date"],
    },
  },
  run_workflow: {
    department: "technology",
    risk: "approval",
    description: "Trigger an n8n workflow by its webhook path.",
    input_schema: {
      type: "object",
      properties: { workflow: { type: "string" }, reason: { type: "string" } },
      required: ["workflow", "reason"],
    },
  },
};
```

**4b. Call Claude with tools: `lib/claude.ts`.** The installed SDK
(`@anthropic-ai/sdk` ^0.32) supports `tools`.

```ts
export async function callAgentWithActions(
  agentName: string,
  userMessage: string,
  history: ClaudeCallOptions["messages"] = []
) {
  const agent = AGENTS[agentName];
  const tools = Object.entries(ACTIONS)
    .filter(([, a]) => a.department === agent.department)
    .map(([name, a]) => ({
      name,
      description: a.risk === "approval"
        ? `${a.description} This only PROPOSES the action — the CEO must approve it before it happens.`
        : a.description,
      input_schema: a.input_schema,
    }));

  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: agent.systemPrompt,
    messages: [...history, { role: "user", content: userMessage }],
    tools,
  });

  const text = response.content
    .flatMap((b) => (b.type === "text" ? [b.text] : []))
    .join("\n");
  const proposals = response.content.flatMap((b) =>
    b.type === "tool_use" ? [{ action: b.name, payload: b.input as Record<string, unknown> }] : []
  );
  return { text, proposals, usage: response.usage };
}
```

**4c. In the shared runner,** replace `actionRequiresApproval(reply)` with a
loop over the proposals:

- `risk === "approval"`: insert into `approvals` with
  `payload: { action, ...payload }`, and set `client_id` from
  `payload.client_id ?? clientId`. The finance executor reads the column, not
  the payload.
- `risk === "auto"`: call the executor directly (recipe 5) and log the result to
  `agent_tasks`.
- If `text` is empty because the model only called a tool, build a one-line
  reply such as "Proposed: send ₹24,999 invoice to Acme, due 2026-11-01. It's in
  your approvals queue."

**4d. Update `BASE_GUARDRAILS`.** Tell agents to use the matching tool when they
want an action taken, and never to claim it is done. Keep `requiresApprovalFor`
for documentation, or remove it once every action goes through the catalog.

**Never trust the model's payload.** Executors re-validate against the
database: does the client exist, is the amount sane for their plan, is the
workflow on an allow-list.

## 5. Add an executor for an approved action

Executors live in `executeApprovedAction` in `app/api/approvals/route.ts`. Move
them to `lib/executors.ts` once recipe 4 lands, so the approvals route and the
autonomous path share them. Dispatch on `payload.action` first, then fall back
to the current per-department `switch` for older approvals.

Rules for every executor:

- Validate the payload, and return `{ ran: false, detail }` when it is
  incomplete. Don't throw, because the CEO's decision is already recorded.
- Be idempotent. Pair it with recipe 1, and use provider idempotency keys where
  they exist.
- Write the outcome back to the source table (for example the invoice status)
  and to `agent_tasks`.
- `detail` is shown to the CEO, so write it in plain words.

Example for marketing, which currently has no executor:

```ts
case "publish_post": {
  // payload: { channel, content, scheduled_for }
  await triggerWorkflow("publish-social-post", { approval_id: approval.id, ...payload });
  return { ran: true, detail: `Queued the post for ${payload.channel}.` };
}
```

Doing the work in n8n keeps credentials for social, WhatsApp and similar
services out of the app. The app approves; n8n holds the token and posts.

## 6. Add a new department

Example: `sales`. The department name is a Postgres enum and a TS union, so it
appears in many places. Touch all of them, then run the registry check.

| # | File | Change |
|---|---|---|
| 1 | Supabase SQL editor | Run `alter type department add value if not exists 'sales';` **on its own**. A new enum value can't be used in the same transaction that adds it. |
| 2 | `supabase/schema.sql` | Add `'sales'` to `create type department as enum (...)` for fresh installs. Add a comment noting the `alter type` step for existing databases. Add the department's agents to the seed. |
| 3 | `types/index.ts` | `export type Department = … \| "sales";` |
| 4 | `lib/claude.ts` | Add the department's agents to `AGENTS`. Update the department list in `ASSISTANT_SYSTEM_PROMPT`. |
| 5 | `lib/agents/sales.ts` | Add a runner, using `runDepartmentAgent` (recipe 3) or copying `finance.ts`. |
| 6 | `app/api/agents/sales/route.ts` | Copy `app/api/agents/finance/route.ts` and swap the runner. |
| 7 | `app/dashboard/agents/page.tsx` | Add `{ key: "sales", label: "Sales" }` to `DEPARTMENTS`. |
| 8 | `app/api/approvals/route.ts` | Add an executor case, or decide explicitly that the default branch is fine. |
| 9 | `app/dashboard/sales/page.tsx` + `components/dashboard/DashboardNav.tsx` | Optional: a page with `<AgentChat endpoint="sales" />` and a nav item. `AgentChat` accepts any `Department`, so it needs no change. |
| 10 | SQL editor | Insert the new agents' rows (see recipe 2, step 2). |

If departments will change often, suggest replacing the enum with a
`departments` table (`key text primary key, label text`) and a foreign key.
That turns adding a department into a data change instead of a migration.

## 7. Add an integration / MCP server

Connections are owned by the Integrations Agent and always need CEO approval.
Keep that property.

1. Add a catalog row in `supabase/schema.sql` (for fresh installs) and give the
   user the same insert to run:
   ```sql
   insert into integrations (name, provider, kind, description, credential_env_var, endpoint, scopes)
   values ('HubSpot', 'HubSpot', 'mcp', 'Sync leads and deal stages for the Sales department.',
           'HUBSPOT_TOKEN', 'https://<mcp endpoint>', array['crm.objects.contacts.read'])
   on conflict (name) do nothing;
   ```
   Store the env var **name** only. Ask for the narrowest scopes, and put any
   write scope in its own row or request, so it gets its own approval.
2. The CEO clicks **Request connection** on the Integrations page, approves it,
   and sets `HUBSPOT_TOKEN` in Vercel. `activateConnection` refuses to mark the
   integration live until the env var is present.
3. In code, read `process.env.HUBSPOT_TOKEN` only inside server code (a lib
   function or an executor). Before using the integration, check that its
   `integrations` row has `status = 'connected'`, so that disconnecting in the
   dashboard really cuts access.

## 8. Accept a new inbound n8n event

Add a `case` to `app/api/webhooks/n8n/route.ts`. Validate the required fields
and return 400 if they are missing. Write to the right table. Add the event's
shape to the n8n section of `SETUP.md` so the user can build the workflow.
Inbound events are how outside work (forms, email, WhatsApp replies) becomes a
trigger in the operating loop.

## 9. Scheduled (autonomous) agent runs

Nothing runs on a schedule today. Two options:

- **n8n Schedule Trigger → SmartOps** (recommended, since n8n is already
  running). Create a workflow with a Schedule Trigger node and an HTTP Request
  node that POSTs to `/api/cron/<job>` with header
  `X-N8N-Secret: <N8N_WEBHOOK_SECRET>`.
- **Vercel Cron.** Add a `crons` entry to `vercel.json` in the Vercel project's
  root directory. Vercel sends `Authorization: Bearer <CRON_SECRET>` when the
  `CRON_SECRET` env var is set. Plan limits on cron frequency apply, so check
  Vercel's docs.

The job route, for example `app/api/cron/daily-ops/route.ts`, does four things:

1. Verifies the secret and returns 401 if it is wrong.
2. Loads the context, for example overdue invoices, leads with no contact in
   48 hours, or stale pending approvals.
3. Calls the right agent through the shared runner with a fixed instruction,
   such as "Draft reminders for these overdue invoices".
4. Lets proposals flow through the normal policy (recipe 4). A schedule doesn't
   lift approval requirements.

Good first jobs: a daily CEO digest (Assistant), overdue-invoice reminder
proposals (Billing Agent), new-lead first-touch drafts (Lead Gen Agent), and a
weekly P&L summary (CFO Agent).

## 10. Verify

From `smartops/`:

```bash
npm run typecheck
npm run lint
python3 ../.claude/skills/agentic-company-builder/scripts/check_registry.py --root ..
```

Then exercise the loop once:

- **Local:** run `npm run dev`, sign in, and use the department chat. Once
  recipe 0 is in place, a curl without the session cookie should get a 401,
  which is worth checking too.
- **Approval path:** raise a proposal, then approve it in
  `/dashboard/approvals`. Confirm the `detail` message and the side effect
  (invoice row, n8n execution). Approve again and expect a 409 once recipe 1
  is in place.

The `ANTHROPIC_API_KEY` must have credits, or every agent call fails (see
`SETUP.md` step 0).
