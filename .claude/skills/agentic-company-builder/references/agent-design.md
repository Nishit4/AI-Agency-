# Designing agents

How to define an agent that does useful work without needing babysitting, and
how much freedom to give it.

## Anatomy (SmartOps `AgentDefinition`)

| Field | What good looks like |
|---|---|
| `name` | Unique and stable. It is also the primary key in the `agents` table and appears in `approvals.agent_name` and `agent_tasks.agent_name`, so renaming it orphans history. |
| `department` | The single department that is accountable for the agent's outcomes. |
| `role` | One line, shown on the Agents dashboard. Describe the outcome it owns, not a task list. |
| `systemPrompt` | `BASE_GUARDRAILS` plus the persona plus the sections below. |
| `requiresApprovalFor` | The actions that must wait for the CEO. Once structured proposals exist (codebase recipe 4), the `risk` field in `lib/actions.ts` becomes the source of truth. |

## One agent per accountable outcome

- Split work by **outcome owned** ("invoices get paid", "leads get a first touch
  within an hour"), not by verb ("writes emails"). An agent that owns an outcome
  can be measured. A verb-agent can't.
- Give each department a **lead** that routes, summarises and owns the
  department's KPIs. Specialists do the work.
- Keep it to **seven specialists or fewer per department**. Beyond that, routing
  gets unreliable and prompts start to overlap.
- Use **maker–checker** for anything client-facing. One agent drafts and
  another reviews against a checklist before it reaches the approvals queue. The
  QA Auditor already exists for this; wire it in before adding more makers.
- Don't create an agent where a deterministic function will do. Calculating an
  invoice total, checking a due date or formatting a report is code. An agent is
  for judgement, language and ambiguity.

## System prompt template

Write prompts as briefs to a capable new hire. Explain the reason behind each
rule, because a rule with its reasoning generalises better than a bare
command.

```
${BASE_GUARDRAILS}
You are the <Name>. You own <outcome> for SmartOps.

What you're measured on:
- <KPI 1, e.g. "invoices paid within 7 days of due date">
- <KPI 2>

Inputs you'll be given:
- <e.g. client name, plan, status; list of overdue invoices>
If something you need isn't in the input, say what's missing instead of guessing.

How to work:
- <2–5 working rules specific to this job, each with the reason>

What you may do on your own: <draft, analyse, recommend, internal notes>
What needs CEO approval: <use the matching tool / say it is a proposal>
Escalate immediately (tell the CEO plainly) when: <legal threat, payment dispute, angry client, anything off-policy>

Output format:
<e.g. "One-line summary, then the draft, then 'Needs approval: yes/no — why'">
```

Context injection is done in the runner, not the prompt. The finance runner, for
example, prepends `Client context: …`. Keep the prompt static so it can be
cached, and put the per-request facts in the message.

## Autonomy ladder

Decide the level per **action**, not per agent. The same agent can draft
autonomously (L4) while needing approval to send (L2).

| Level | Name | What happens | Use for |
|---|---|---|---|
| L0 | Shadow | Agent output is logged and nobody acts on it. | New agents, for their first week. Compare against what the CEO actually did. |
| L1 | Draft | The CEO reads the output and acts by hand. | Things there is no executor for yet. |
| L2 | Approve | The agent proposes a typed action and the CEO approves it with one click; the executor runs it. | Money, client-facing messages, publishing, production changes, new credentials or scopes. **This is the default for anything external.** |
| L3 | Auto with limits | Runs immediately inside hard limits (amount cap, allow-listed recipients or templates, daily quota) and appears in a daily digest. | Repeated, low-value, template-based actions with a clean L2 track record, such as standard payment reminders. |
| L4 | Auto | Runs immediately with no digest. | Internal and reversible work only: drafts, tags, notes, internal task updates, reports. |

**Promotion** (move up one level at a time): at least 20 decisions at the
current level, at least 95% approved without edits, and no incidents in the last
two weeks. The CEO agrees explicitly.

**Demotion** (immediate): any incident, meaning a wrong recipient, a wrong
amount, an off-brand message or a policy breach. Add a guardrail or a test case
for what went wrong before promoting again.

Limits for L3 belong in **executor code** (`if (amount > CAP) return { ran:
false … }`), not in the prompt. A prompt is a request; code is a guarantee.

## Approval matrix

Build one per department in Design mode and confirm it with the user:

| Action | Agent | Risk class | Level | Limit / condition | Executor |
|---|---|---|---|---|---|
| Send invoice | Billing Agent | Money | L2 | — | Razorpay payment link + Resend |
| Payment reminder (standard template) | Billing Agent | Client-facing | L2 → L3 later | ≤ 3 per invoice, template only | n8n `invoice-reminder` |
| Draft blog post | Content Writer | Internal | L4 | — | none (draft saved) |
| Publish blog post | Content Writer | Public | L2 | — | n8n `publish-post` |
| Connect integration | Integrations Agent | Credentials | L2, always | narrowest scopes | `activateConnection` |

Risk classes, roughly from most to least dangerous:

1. **Credentials and access** (connecting tools, granting scopes): always L2.
2. **Money movement** (invoices, refunds, discounts, spend): L2, with L3 only
   for capped reminders.
3. **Production and infrastructure** (deploys, live workflows): L2.
4. **Public publishing** (site, social, SEO changes): L2.
5. **Client-facing communication** (email, WhatsApp): L2, with L3 for
   templated messages after a track record.
6. **Data deletion** or anything irreversible: L2.
7. **Internal and reversible** (drafts, notes, tags, reports): L4.

Disconnecting, pausing or restricting something is always allowed without
approval. Reducing access should never be blocked.

## Model choice

`CLAUDE_MODEL` sets one model for every agent. As volume grows, let agents
choose:

- A smaller, faster model for routing, classification, extraction and tagging.
- The main model for drafting client-facing text, strategy and multi-step
  reasoning.

Add an optional `model` to `AgentDefinition` and pass it through `callClaude`.
Check current model names and prices at https://docs.claude.com before
recommending specific ones. Don't quote prices from memory.

## Anti-patterns

- **Claiming to have done something.** An agent says "I've sent the invoice"
  when it only drafted it. `BASE_GUARDRAILS` forbids this; keep that rule in
  every persona.
- **Policy in the prompt only.** "Never refund more than ₹5,000" belongs in the
  executor as well.
- **One giant agent.** A single agent that does everything can't be measured,
  can't be given partial autonomy, and its prompt grows until it contradicts
  itself.
- **Secrets in context.** Never pass tokens or keys to the model, even "just to
  use once".
- **Invented data.** The agent needs real numbers. Inject them from Supabase,
  and tell it to say what is missing instead of guessing.
- **An approval with no executor.** If approving doesn't do anything, the CEO
  learns to ignore the queue. Every L2 action needs an executor, or must be
  labelled L1 honestly.

## Worked example: Billing Agent, promoted from persona to real worker

Today the Billing Agent is a persona that never runs. To make it a working
member of the company:

1. **Route:** set `agent: "Billing Agent"` explicitly (codebase recipe 3).
2. **Actions:**
   - `send_invoice` at L2, with the existing executor.
   - `send_payment_reminder` at L2, through the n8n workflow
     `invoice-reminder`.
3. **Trigger:** a daily cron (codebase recipe 9) loads invoices where
   `status = 'sent'` and `due_date < today` and asks the Billing Agent to
   propose reminders.
4. **Metrics:** reminders proposed and approved, days-to-paid after a reminder,
   and overdue amount in ₹ over time (see the operating playbook).
5. **Promotion path:** after two clean weeks, move templated reminders to L3
   with a cap of three per invoice, enforced in the executor.
