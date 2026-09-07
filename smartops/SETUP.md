# SmartOps — Connection Guide

Everything code-side is done. This is the checklist for wiring up the external
services. Each step is a few clicks in a dashboard.

Status legend: ✅ done · ⬜ still to do

---

## ✅ 1. Supabase — database

Already done: project created, `supabase/schema.sql` run.

**Optional — load demo data** so the dashboard isn't empty:
Supabase → **SQL Editor** → paste all of `supabase/seed.sql` → **Run**.
Gives you 10 clients, 6 months of invoices, 6 campaigns, 8 leads, and 6 pending
approvals. Safe to re-run (it clears demo rows first). Delete the rows later
with the same `delete from ...` statements at the top of that file.

---

## ⬜ 2. Supabase — auth redirect (required for login to work)

Supabase → **Authentication** → **URL Configuration**:

| Field | Value |
|---|---|
| Site URL | your production Vercel URL |
| Redirect URLs | `<your-vercel-url>/**` |

Without this, the magic-link email will send but the link will fail to sign
you in.

> Find your production URL in Vercel → your project → **Domains**. Use the one
> *without* a random hash (`ai-agency-xxx.vercel.app`, not
> `ai-agency-r2uz80hvh-nishit16.vercel.app`) — the hashed one changes on every
> deploy.

---

## ⬜ 3. Vercel — environment variables

Vercel → project → **Settings** → **Environment Variables**. These are already
set (from the initial deploy):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `CLAUDE_MODEL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CEO_EMAIL`
- `NEXT_PUBLIC_APP_URL`

**Still to add:**

```
RAZORPAY_KEY_ID=<your rzp_test_... key>
RAZORPAY_KEY_SECRET=<your Razorpay test secret>
RAZORPAY_WEBHOOK_SECRET=<see step 4>
N8N_BASE_URL=<your Railway n8n host, no trailing path>
N8N_API_KEY=<your n8n API key>
N8N_WEBHOOK_SECRET=<any random string — must match step 5>
NEXT_PUBLIC_CALCOM_LINK=<see step 6>
```

> The actual values are already filled into your local `smartops/.env.local`
> (git-ignored) — copy them from there.

**Also update** `NEXT_PUBLIC_APP_URL` to your real production URL (not the
placeholder). Redeploy after changing env vars — they only apply to new builds.

---

## ⬜ 4. Razorpay — webhook

Razorpay dashboard → **Settings** → **Webhooks** → **Add New Webhook**:

| Field | Value |
|---|---|
| Webhook URL | `<your-vercel-url>/api/webhooks/razorpay` |
| Secret | make up a strong random string — save it as `RAZORPAY_WEBHOOK_SECRET` in Vercel |
| Active events | `payment_link.paid`, `payment.captured`, `payment.failed` |

This is what flips an invoice to **paid** in your dashboard when a client pays.

---

## ⬜ 5. n8n — inbound webhook secret

In your n8n instance, any workflow that reports back into SmartOps should POST to:

```
<your-vercel-url>/api/webhooks/n8n
Header:  X-N8N-Secret: <same value as N8N_WEBHOOK_SECRET>
```

Two event shapes are accepted:

```jsonc
// log a completed automation against an agent
{ "event": "task.completed", "agent_name": "Automation Builder",
  "department": "technology", "title": "...", "result": "..." }

// push a captured lead into the marketing pipeline
{ "event": "lead.captured",
  "lead": { "name": "...", "email": "...", "company": "...", "source": "..." } }
```

Outbound works too: approving a **technology** approval that names a
`workflow` in its payload calls `POST <N8N_BASE_URL>/webhook/<workflow>`.

> Note: the URL you gave earlier ended in `/assistant` — that's one workflow's
> webhook path, not the instance base. `N8N_BASE_URL` should be the bare host.

---

## ⬜ 6. Cal.com — booking embed

1. Sign up at cal.com, create an event type (e.g. "Intro call, 30 min")
2. Copy the part of your booking link after `cal.com/` — e.g. `nishit/intro-call`
3. Set it as `NEXT_PUBLIC_CALCOM_LINK` in Vercel

It renders at the bottom of the **Marketing** page.

---

## How it fits together

```
CEO ──approves──▶ /api/approvals ──┬─▶ finance    → Razorpay payment link + Resend email
                                   ├─▶ technology → triggers an n8n workflow
                                   └─▶ ops/mktg   → queued for the owning agent

15 agents (Claude) ──raise──▶ approvals queue
Razorpay ──webhook──▶ invoice marked paid
n8n      ──webhook──▶ tasks logged / leads captured
```

## Local development

```bash
cd smartops
npm install
npm run dev
```

`.env.local` already holds every key. It is git-ignored — never commit it.

## Security note

The keys shared during setup were pasted into a chat transcript. Before taking
real client payments, rotate them: Supabase service-role key, Anthropic API
key, Resend API key, and the Razorpay secret. Each is a one-click regenerate in
its own dashboard — then update the values in Vercel.
