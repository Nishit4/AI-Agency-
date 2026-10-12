# Designing an agentic company (or a new function)

Use this when the user is planning rather than coding. Examples: "I want to start
an AI agency for X", "what agents should run my sales?", "add a recruiting
arm", "how do I price this?" The output is a **blueprint** the user can act on,
which Build mode then turns into code.

Ask only for what you can't infer. Most of SmartOps' context is already known:
Indian SMB clients, plans from ₹7,499 to ₹1,50,000 a month, a solo CEO, and a
stack of Vercel, Supabase, Claude, Razorpay, Resend, n8n and Cal.com. For a
brand-new business, you need four facts: the customer, the offer, the price,
and how the work is delivered.

## Method

### 1. Business in one paragraph
Who pays, for what outcome, how much, how often, and how it is delivered. If
the user can't say it in one paragraph, help them narrow it first. Every later
step depends on this.

### 2. Map the value chain
List the stages work flows through:

**acquire → qualify → sell → onboard → deliver → bill → retain/expand → support**

For each stage, write down the work done today (or expected to be done), its
weekly volume, its inputs, its outputs, and who does it now.

### 3. Score each activity for agent fit

| Question | Agent-friendly answer |
|---|---|
| Is it repeatable? | Happens weekly or more, with similar shape each time |
| Are the inputs digital? | Lives in email, forms, DB, docs or APIs, not in someone's head |
| Is the output checkable? | A human or rule can tell good from bad quickly |
| What does a mistake cost? | Low, or caught by an approval before it lands |
| Is there an executor? | An API or n8n workflow can perform the final step |

Then sort each activity:
- **Automate now** (L3–L4): repeatable, digital, checkable, cheap mistakes.
- **Agent proposes, CEO approves** (L2): valuable but risky or client-facing.
  Most external actions start here.
- **Keep human for now**: relationship-critical (closing big deals, firing a
  client), undefined, or with no digital inputs. Revisit monthly.

### 4. Group into departments and agents
Follow the rules in `agent-design.md`: one agent per accountable outcome, a
lead per department, seven or fewer specialists, and maker–checker for
client-facing work. Reuse existing SmartOps agents before inventing new ones.
Many "new" needs are an existing persona that simply isn't wired up yet.

### 5. Approval matrix
For each action, set the risk class, the level, any limits, and the executor
(template in `agent-design.md`). This is the part to confirm with the user
explicitly.

### 6. Integrations
Name the tools each agent needs. Check the `integrations` catalog in
`supabase/schema.sql` first. For anything new, note the narrowest scopes and the
env var name.

### 7. KPIs
Give each department one north-star metric and two or three supporting ones,
each computable from Supabase tables:

| Department | North star | Supporting |
|---|---|---|
| Marketing | Qualified leads per week | Cost per lead, lead→call rate, time to first touch |
| Sales (if added) | New MRR per month | Win rate, cycle length, proposal→close |
| Operations | Clients onboarded on time | Time to first deliverable, churn-risk flags actioned, CSAT |
| Technology | Automation uptime | Failed workflow runs, incident time-to-resolve |
| Finance | Days sales outstanding | Overdue ₹, collection rate, gross margin |
| Company | Revenue per human hour | Approval-queue time, % of actions that needed no edit |

"Revenue per human hour" is the agentic-company metric. It goes up when agents
take on more work and the CEO spends less time on each approval.

### 8. Unit economics
Estimate the cost per client per month and compare it with the lowest plan:

```
LLM cost / client / month ≈ Σ over agents ( runs per month × (input tokens × input price + output tokens × output price) )
Tool cost / client / month = (fixed SaaS + infra) ÷ active clients   + per-use fees (WhatsApp, email, etc.)
Payment fees               = plan price × gateway rate   (check Razorpay's current rate)
Gross margin               = plan price − LLM − tools − payment fees
```

Take token counts from real runs once cost tracking exists (see
`operating-playbook.md`). Until then, state the assumptions plainly. Look up
current model prices at https://docs.claude.com instead of quoting them from
memory. If margin on the ₹7,499 plan is thin, the levers are a cheaper model
for routing, fewer runs, caching static prompts, or moving deterministic steps
into code or n8n.

### 9. Rollout plan
Phase it so that each phase completes one loop end to end:

1. **Foundations.** Security and integrity fixes: codebase recipes 0 and 1.
2. **First loop.** The single highest-value action, at L2, with an executor and
   a metric.
3. **Coverage.** Wire the specialists (recipe 3), add structured proposals
   (recipe 4), and add a daily cron (recipe 9).
4. **Autonomy.** Promote proven actions to L3 using the ladder's criteria.
5. **Expansion.** Add a new department only once the existing ones are being
   measured.

## Blueprint template

```markdown
# <Company / function> — agentic blueprint
_Date · Owner: CEO_

## Business
<one paragraph: customer, offer, price, delivery>

## Value chain
| Stage | Work | Volume/wk | Inputs → outputs | Today | Agent fit |
|---|---|---|---|---|---|

## Org chart
| Department | Agent | Owns (outcome) | Lead? | Status (new / exists-unwired / live) |
|---|---|---|---|---|

## Approval matrix
| Action | Agent | Risk class | Level | Limit | Executor |
|---|---|---|---|---|---|

## Integrations
| Tool | Used by | Scopes (narrowest) | Env var | In catalog? |
|---|---|---|---|---|

## KPIs
| Department | North star | Supporting | Source table/query |
|---|---|---|---|

## Unit economics (assumptions stated)
| Line | ₹ / client / month | Assumption |
|---|---|---|

## Rollout
1. Foundations — …
2. First loop — …
3. …

## Open questions for the CEO
- …
```

## Example (abbreviated): adding Sales to SmartOps

- **Business:** turn qualified leads from Marketing into paying monthly plans.
- **Agents:** a Sales Lead (routes the work and owns new MRR); a Proposal Writer
  (drafts proposals priced against the plan tiers, checked by QA Auditor); a
  Follow-up Agent (sequences touches after the Cal.com call).
- **Approval matrix:**

  | Action | Level |
  |---|---|
  | Send proposal | L2 |
  | Follow-up email from an approved template | L2, later L3 with a limit of 3 touches |
  | Discount offer | L2 always |
  | Update a lead's status | L4 |

- **Integrations:** Cal.com (exists), Resend (exists), Gmail (in the catalog,
  not yet connected).
- **KPIs:** new MRR per month, lead→proposal %, proposal→won %, and days from
  call to close.
- **Build:** a new `sales` department (codebase recipe 6), the
  `send_proposal` and `send_followup` actions (recipe 4), executors that go
  through n8n and Resend (recipe 5), and a daily "stale leads" cron (recipe 9).
