---
name: agentic-company-builder
description: Design, build and run an agentic company — a business whose departments are staffed by AI agents while a human CEO approves anything risky — on the SmartOps stack in this repo (Next.js + Supabase + Claude agents + approvals queue + Razorpay/Resend/n8n). Use this whenever the user wants to plan an AI-run org chart, decide which business functions agents should own, add or change an agent or department, write agent prompts or approval rules, make an approved action actually execute, connect a new integration or MCP server, schedule autonomous agent work, or audit how the AI company is performing — even if they only say things like "add a sales team", "automate onboarding", "make the agents do more", "scale the agency" or "what should I automate next".
---

# Agentic Company Builder

An agentic company is a business where AI agents do the day-to-day work of each
department and humans set direction and sign off on consequential actions. In
this repo that company is **SmartOps** (`smartops/`): a solo-founder agency where
Claude-powered agents run Operations, Technology, Finance and Marketing, and the
CEO only works the approvals queue.

This skill helps with three jobs: **designing** the company (which agents, what
they may do alone), **building** it into the SmartOps code, and **operating** it
(is it working, what to automate next).

## The operating loop

Every capability in an agentic company is one pass through this loop. Use it to
check whether a feature is real or just a chat demo.

```
trigger            CEO chat · n8n webhook · schedule
   ↓
agent reasons      Claude + the context it needs (client, inventory, metrics)
   ↓
output             an answer, or a TYPED PROPOSAL {action, payload}
   ↓
policy             low-risk & reversible → run now · otherwise → approvals queue
   ↓
CEO decision       approve / reject in /dashboard/approvals
   ↓
executor           performs the side effect (Razorpay, Resend, n8n, DB update)
   ↓
record             agent_tasks + approval result → metrics → next improvement
```

Agents propose, executors act, humans approve what can't be undone. When adding
anything, name all five parts — trigger, context, typed action, policy,
executor. If one is missing, say so to the user rather than shipping half a loop.

## Pick the mode

| The user wants… | Mode | Read first |
|---|---|---|
| To plan a company or a new function, an org chart, "what agents do I need", pricing for an AI service | **Design** | `references/company-blueprint.md`, then `references/agent-design.md` |
| To add or change an agent, department, approval rule, executor, integration, webhook or scheduled job | **Build** | `references/smartops-codebase.md` and `references/agent-design.md` |
| To know how the company is doing, why agents fail, why approvals pile up, what to automate next | **Operate** | `references/operating-playbook.md` |

Requests often span modes. "Add a sales team" is a short Design pass (which
agents, what they may do alone, what needs approval), then Build. Do the design
part briefly in the reply. If the plan lets agents move money or message clients,
confirm the approval matrix with the user before writing code, because those
rules are expensive to get wrong.

## Ground rules

1. **Run the registry check before and after changes.** The same facts live in
   several files: the department list in five places, agent names in two, and the
   agent count in prose in four. Drift breaks things silently. The check is:
   `python3 .claude/skills/agentic-company-builder/scripts/check_registry.py`
   (run it from the repo root). It exits non-zero on real mismatches.
2. **Approval is required for money, client-facing messages, public publishing,
   production changes and new credentials or scopes.** Internal, reversible,
   draft-only work can be autonomous. A solo CEO can't recall a sent invoice or
   a WhatsApp blast, but a bad internal draft costs nothing. Use the autonomy
   ladder in `references/agent-design.md` to decide the level.
3. **Secrets never go in the database, prompts, chat or commits.** Keep the
   existing pattern: integrations store only the *name* of the env var
   (`credential_env_var`), and the value lives in Vercel. Never ask the user to
   paste a key.
4. **Prefer typed proposals over text matching.** Today `actionRequiresApproval`
   checks whether the reply contains a trigger phrase. New work should have
   agents emit structured proposals through Claude tool use, so approvals carry
   a payload an executor can act on. See "Structured proposals" in the codebase
   reference.
5. **Ship one loop end to end, then verify it.** Run `npm run typecheck` and
   `npm run lint` in `smartops/`, run the registry check, then exercise it once
   through the dashboard chat or curl.
6. **Keep `supabase/schema.sql` re-runnable.** Use `if not exists` and
   `on conflict do nothing`. A new enum value
   (`alter type ... add value if not exists`) must be run on its own, and
   committed, before any statement uses it.

## Known gaps in the current code

Check these before promising the user anything. Each one breaks part of the
loop above. If the user's request depends on one, say so plainly and offer to fix
it as part of the work. Recipes are in `references/smartops-codebase.md`.

- **API routes are unauthenticated.** `middleware.ts` only protects
  `/dashboard/**`. Anyone who knows the URL can call `PATCH /api/approvals`
  (approving items fires invoices and n8n workflows), `POST /api/approvals`, and
  `POST /api/agents/*` (which spends Anthropic credits). Only the two webhooks
  check a secret. Fix this before giving agents more power. It is the first
  recipe in the codebase reference.
- **Approvals can execute twice.** The PATCH handler updates by `id` without
  checking that the approval is still `pending`, so a double click or a replayed
  request runs the executor again (two invoices, for example).
- **Only 6 of 17 agent personas ever run.** Those six are the department leads
  (Ops Manager, CTO Agent, CFO Agent, CMO Agent), the Integrations Agent, and
  the Assistant. The other 11 entries in `AGENTS` are never called. Adding an
  agent to `AGENTS` does not make it do any work; it needs a route (see "Route
  to specialist agents").
- **Approvals raised from chat have no payload.** The finance and technology
  executors need `invoice_amount` or `workflow` in the payload, so approving a
  chat-raised item does nothing ("No invoice details on this approval").
- **Approval detection rarely fires.** It needs the reply to contain the exact
  trigger phrase, but `BASE_GUARDRAILS` tells agents to say "proposal awaiting
  CEO approval" instead.
- **Ops and marketing approvals have no executor.** They say "the owning agent
  will action this on its next run", but nothing ever runs it next.
- **There is no scheduler.** Agents run only when the CEO chats or n8n calls in.
  Recurring autonomous work needs a cron trigger.

## What to hand back

- **Design:** a blueprint using the template in `references/company-blueprint.md`:
  org chart, approval matrix, integrations, KPIs, unit economics and a rollout
  plan. If it's worth keeping, offer to save it as
  `docs/blueprints/<name>.md` in this repo.
- **Build:** the code change, plus a short hand-off listing:
  1. the files touched
  2. the exact SQL to run in the Supabase SQL editor
  3. any env vars to add in Vercel, by name only
  4. how to test it

  The user deploys through Vercel and runs SQL by hand (see `smartops/SETUP.md`),
  so never assume SQL has been run or env vars exist.
- **Operate:** a short health report with real numbers from the queries in
  `references/operating-playbook.md`, plus the top three actions to take.

## Where things live

| Concern | File |
|---|---|
| Agent personas, guardrails, approval triggers, Claude wrapper | `smartops/lib/claude.ts` |
| Department runners (context → Claude → task log → approval) | `smartops/lib/agents/{operations,technology,finance,marketing}.ts` |
| CEO assistant (live snapshot) and the integrations agent | `smartops/lib/agents/assistant.ts`, `smartops/lib/agents/integrations.ts` |
| Agent HTTP endpoints | `smartops/app/api/agents/<dept>/route.ts` |
| Approvals queue and executors | `smartops/app/api/approvals/route.ts` |
| Inbound automation events | `smartops/app/api/webhooks/n8n/route.ts`, `smartops/app/api/webhooks/razorpay/route.ts` |
| Outbound automation | `smartops/lib/n8n.ts`, `smartops/lib/razorpay.ts`, `smartops/lib/resend.ts` |
| Types (`Department`, `Approval`, `AgentChatRequest`, …) | `smartops/types/index.ts` |
| Database schema and agent seed | `smartops/supabase/schema.sql`, `smartops/supabase/seed.sql` |
| Dashboard pages and nav | `smartops/app/dashboard/**`, `smartops/components/dashboard/DashboardNav.tsx` |
| Chat widget (endpoint per department) | `smartops/components/dashboard/AgentChat.tsx` |
| Setup and deploy steps the CEO follows | `smartops/SETUP.md` |
