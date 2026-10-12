# Operating the agentic company

Use this for questions like: is it working, where is it stuck, what does it
cost, and what should be automated next. Answer with real numbers. Run the
queries below in the Supabase SQL editor, or ask the user to run them and paste
the results. Don't estimate figures that a query can give you.

## The CEO's daily loop (about 10 minutes)

1. **Approvals queue** (`/dashboard/approvals`): clear everything that is
   pending, oldest first. If something has waited more than 48 hours, either
   the item is unclear (a prompt problem) or it shouldn't need approval (an
   autonomy problem).
2. **Agents in error** (`/dashboard/agents`): read `last_error`. The most common
   cause is the Anthropic account running out of credits (`credit balance is
   too low`; see `smartops/SETUP.md` step 0).
3. **Money:** check overdue invoices and anything paid since yesterday.
4. **Pipeline:** check new leads and whether each one got a first touch.

Once a scheduled job exists (codebase recipe 9), have the Assistant send this
as a morning digest so the CEO doesn't have to assemble it.

## Health queries

**Approvals, last 30 days, by department:**
```sql
select department,
       count(*) filter (where status = 'pending')  as pending,
       count(*) filter (where status = 'approved') as approved,
       count(*) filter (where status = 'rejected') as rejected,
       round(100.0 * count(*) filter (where status = 'approved')
             / nullif(count(*) filter (where status <> 'pending'), 0), 1) as approve_rate_pct,
       round((percentile_cont(0.5) within group (
               order by extract(epoch from (resolved_at - created_at)) / 3600))::numeric, 1) as median_hours_to_decide
from approvals
where created_at > now() - interval '30 days'
group by department
order by department;
```

**Approvals waiting more than 48 hours:**
```sql
select id, department, agent_name, title,
       round(extract(epoch from now() - created_at) / 3600) as hours_waiting
from approvals
where status = 'pending' and created_at < now() - interval '48 hours'
order by created_at;
```

**Agent activity and health, last 7 days** (an agent with 0 tasks is either
idle or unwired):
```sql
select a.name, a.department, a.status, a.last_run_at, a.last_error,
       count(t.id) filter (where t.created_at > now() - interval '7 days')                         as tasks_7d,
       count(t.id) filter (where t.status = 'failed' and t.created_at > now() - interval '7 days') as failed_7d
from agents a
left join agent_tasks t on t.agent_name = a.name
group by a.id
order by tasks_7d desc, a.department, a.name;
```

**Revenue and collections:**
```sql
select
  (select coalesce(sum(plan_amount), 0) from clients where status = 'active') as mrr,
  (select count(*) from clients where status = 'active')                      as active_clients,
  coalesce(sum(amount) filter (where status = 'paid' and paid_at >= date_trunc('month', now())), 0) as collected_this_month,
  coalesce(sum(amount) filter (where status in ('sent', 'overdue') and due_date < current_date), 0) as overdue_amount,
  count(*)             filter (where status in ('sent', 'overdue') and due_date < current_date)      as overdue_invoices,
  round(avg(extract(epoch from paid_at - created_at) / 86400)
        filter (where status = 'paid' and paid_at > now() - interval '90 days')::numeric, 1)       as avg_days_to_paid
from invoices;
```

**Lead funnel, last 30 days:**
```sql
select coalesce(source, 'unknown') as source, status, count(*)
from leads
where created_at > now() - interval '30 days'
group by 1, 2
order by 1, 3 desc;
```

**Client health:**
```sql
select status, count(*), coalesce(sum(plan_amount), 0) as plan_value
from clients group by status order by 2 desc;
```

## Reading the numbers

| Signal | Likely cause | Fix |
|---|---|---|
| Agent has 0 tasks in 7 days | Never routed (11 personas today) or no trigger | Codebase recipe 3 (routing) or recipe 9 (schedule) |
| Low approval rate (< 70%) for an agent | Prompt is vague, context is missing, or scope is wrong | Read the rejected `description`s, tighten the prompt, inject the missing context |
| Approvals approved but nothing happened | No executor, or an empty payload | Codebase recipes 4 and 5 |
| Approvals pile up (high median hours) | Too many trivial approvals, or unclear write-ups | Promote proven actions to L3; require a one-line summary plus "why now" in every proposal |
| `last_error` mentions credit balance | Anthropic account is out of credits | Add credits in the Anthropic Console |
| Overdue ₹ rising | Reminders not running | Billing Agent worked example in `agent-design.md` |
| Approval rate ≥ 95% over 20+ decisions | The action is ready for more autonomy | Promote one level (autonomy ladder) |

## Cost tracking

Nothing records token usage today, so cost is invisible. To add it:

```sql
alter table agent_tasks add column if not exists model         text;
alter table agent_tasks add column if not exists input_tokens  integer;
alter table agent_tasks add column if not exists output_tokens integer;
```

In `lib/claude.ts`, add a variant that returns usage, and keep `callClaude`
returning a string so existing callers don't break:

```ts
export async function callClaudeDetailed(opts: ClaudeCallOptions) {
  const response = await getClient().messages.create({
    model: MODEL, max_tokens: opts.maxTokens ?? 1024, system: opts.systemPrompt, messages: opts.messages,
  });
  const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n");
  return { text, model: MODEL, usage: response.usage }; // usage.input_tokens / usage.output_tokens
}
```

Write `model`, `input_tokens` and `output_tokens` into the `agent_tasks` insert
in the runner. Then:

```sql
select agent_name, model,
       count(*) as runs,
       sum(input_tokens) as input_tokens,
       sum(output_tokens) as output_tokens
from agent_tasks
where created_at >= date_trunc('month', now()) and input_tokens is not null
group by 1, 2
order by output_tokens desc;
```

Multiply by the current per-token prices from https://docs.claude.com, divide by
active clients, and feed the result into the unit economics in
`company-blueprint.md`.

Ways to cut cost, in rough order of effort:
1. Lower `max_tokens` on agents that write short answers.
2. Use a smaller model for routing and classification.
3. Keep system prompts static and put per-request data in the user message, so
   prompts can be cached.
4. Move deterministic steps into code or n8n.

## Weekly review (30 minutes)

1. Run the queries above and compare them with last week.
2. **Autonomy:** for each action, decide whether to promote it, demote it, or
   leave it at its level. Use the criteria in the autonomy ladder.
3. **Next automation:** from the blueprint's value chain, pick the activity
   with the highest *hours saved × confidence* that already has inputs and an
   executor. Build exactly one loop.
4. **Prompt fixes:** for each rejected approval, decide whether it was a prompt
   problem, a context problem or a policy problem. Fix the cause, not the one
   case.

## Incident response

An agent sent something wrong, billed the wrong amount, or posted off-brand.

1. **Contain.** Disconnect the integration involved; disconnecting never needs
   approval. Reject anything related that is still pending. Pause the n8n
   workflow.
2. **Repair.** Fix the client-facing damage by hand: correct the invoice,
   send an apology, cancel the payment link.
3. **Demote** the action to L2, or to L1 if it was already L2 and the CEO
   approved something misleading.
4. **Prevent.** Add the check to the **executor**, not only to the prompt.
   Examples: an amount cap, a recipient allow-list, a template-only rule.
   Record the case so it can be re-tested after prompt changes.
5. **Log** a short note (what happened, why, what changed) as an
   `agent_tasks` row with `status = 'done'` on the affected agent, so it shows
   up in history.
