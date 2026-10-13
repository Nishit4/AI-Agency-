# CTO / CIO Outbound Playbook

**LegacyModern AI — outbound sequences, 15-minute discovery call, executive briefing script, and objection handling**

Used by humans and by the Daily Client Outreach Agent (`agents/06_daily_client_outreach.md`).
Every factual claim here maps to our contracts: the 14-day, $50,000 Proof-of-Value pilot
(`pilot_scope_of_work_50k.md`) and the $100,000/month retainer (`retainer_agreement_100k.md`).
Do not add claims, logos, case studies, or statistics that are not in those documents or in a
client-approved reference.

---

## 1. Who we sell to

**Companies:** banks, insurers, payment processors, government agencies, airlines, healthcare
payers, and large retailers with $1B+ revenue that still run core processes on COBOL/CICS/DB2,
PL/I, IMS, Oracle PL/SQL, or legacy Java EE.

**Personas:**

| Persona | What they own | What keeps them up | What they need to hear |
|---|---|---|---|
| CIO / CTO (Sequence A) | Technology strategy, budget, regulator relationship | Key-person risk on retiring mainframe staff, failed "big-bang" rewrites, MIPS and license cost, operational-resilience findings | Risk is contractually bounded; progress is provable module by module; no big bang |
| VP Engineering / Head of Core Systems / Chief Architect (Sequence B) | Delivery, architecture, the people who know the code | Undocumented business rules, regression fear, slow test cycles, being blamed for a migration incident | Behavior is extracted into executable tests with line-level lineage before any code changes |

**Trigger events** (one is required for every first touch):
1. Job posting naming COBOL, CICS, JCL, DB2 z/OS, IMS, PL/I, Natural, RPG, or PL/SQL.
2. Public statement or earnings-call remark about mainframe exit, data-center exit, or core modernization.
3. New CIO/CTO in the last 180 days.
4. Regulator publication or enforcement action citing technology resilience.
5. Announced hyperscaler partnership without a named modernization partner.
6. Mainframe outsourcing or license contract renewal in the news.

---

## 2. Sequence A — CIO / CTO (3 touches over 9 days)

Bracketed items are filled from research for each prospect. Never send a bracket.

### Touch 1 — Day 0
**Subject options:** `[company]'s cobol estate` · `de-risking [system/area]` · `a 14-day test for [company]`

> [First name],
>
> [Specific trigger: e.g. "Saw [company] is hiring three CICS/DB2 engineers for the cards platform."] That usually means the people who understand those rules are scarce — and every change is a regression risk.
>
> We modernize legacy modules one at a time: business rules are extracted into executable tests, traced to the exact source lines, and the new service ships only at 100% behavioral parity against your own production history.
>
> We prove it on one module of your choice in 14 days, fixed fee, with a contractual parity guarantee.
>
> Worth 15 minutes to see if [system/area] is a fit?
>
> [Sender name] · [Title], LegacyModern AI
> [Postal address]
> If this isn't relevant, reply "no thanks" and I won't contact you again.

### Touch 2 — Day 4
**Subject:** `re: [original subject]` only if it is a genuine reply in the same thread; otherwise `the regression question`

> [First name],
>
> One question we ask every CIO before a modernization: if the new [system/area] service computed a fee, interest accrual, or eligibility result one cent or one day differently from the mainframe, how would you find out — and how fast?
>
> Our answer is a parity gate: every module is replayed against masked production records and has to match 100% before it can merge. The pilot ends with that evidence in your hands.
>
> If useful, here's my calendar: [calendar link]
>
> [Sender name]
> [Postal address] · Reply "no thanks" to opt out.

### Touch 3 — Day 9
**Subject:** `closing the loop`

> [First name], I'll stop here. If de-risking [system/area] becomes a priority — a new compliance deadline, a key retirement, a renewal — the offer stands: one module, 14 days, 100% parity or you don't pay the second half.
>
> [Sender name]
> [Postal address] · Reply "no thanks" to opt out.

---

## 3. Sequence B — VP Engineering / Head of Core Systems / Chief Architect

### Touch 1 — Day 0
**Subject options:** `undocumented rules in [program/area]` · `characterization tests for [system]`

> [First name],
>
> [Specific trigger: e.g. "Your posting for a PL/SQL lead mentions 'reverse-engineering billing packages'."] That's the hard part of every modernization: the rules live in the code, not the docs.
>
> Our approach: Gemini reads the whole subsystem (copybooks, packed-decimal fields, package state) and extracts every rule into executable assertions with line-level lineage; engineers verify them; Claude Code writes the characterization tests first, then the Go/TypeScript service, which merges only at 100% parity on your masked production history.
>
> Happy to walk your team through it on a sample COBOL module in 15 minutes. Open to it?
>
> [Sender name] · [Title], LegacyModern AI
> [Postal address]
> If this isn't relevant, reply "no thanks" and I won't contact you again.

### Touch 2 — Day 4
**Subject:** `rounding, truncation, 88-levels`

> [First name],
>
> The regressions we see in rewrites are rarely architecture. They're COMPUTE ROUNDED vs truncation, a PIC 9(3) that silently drops a digit, an EVALUATE whose order matters, a NULL that PL/SQL treats differently. Our contracts pin each one as a test before any code is written.
>
> If you pick the gnarliest module you have, we'll show you what the extracted contract looks like. [calendar link]
>
> [Sender name]
> [Postal address] · Reply "no thanks" to opt out.

### Touch 3 — Day 9
**Subject:** `last note`

> [First name], last note from me. If a module ever needs to move off [platform] without surprises, we'll prove it on that module in 14 days with a parity guarantee. Glad to help whenever the timing is right.
>
> [Sender name]
> [Postal address] · Reply "no thanks" to opt out.

---

## 4. Reply templates

**Interested → book:**
> Thanks, [first name]. Would [slot 1, their time zone] or [slot 2] work for 15 minutes? If easier, grab any time here: [calendar link]. I'll send a two-line agenda so it's a good use of your time.

**Pricing question:**
> Straight answer: the pilot is a fixed $50,000 for one module up to 50,000 lines, 14 days, paid half up front and half on acceptance — and if we don't reach 100% parity after a 10-business-day cure period, the second half isn't due and we refund half of the first. If you continue, the full pilot fee is credited against a $100,000/month retainer with a dedicated pod. Worth 15 minutes to see if your module fits?

**Send me something:**
> Of course. In short: one module up to 50,000 lines, 14 days, $50,000 fixed; every business rule is extracted into executable tests traced to source lines, and the new service is accepted only at 100% parity on your masked production history. Attached is the behavioral contract from our COBOL demo module (31 assertions) so you can see exactly what you'd receive. If it resonates, the fastest way to judge fit is 15 minutes on your actual module.

---

## 5. 15-minute executive discovery call

**Goal:** qualify, and if qualified, agree on the pilot module and the next step (technical
deep-dive or SOW review) before the call ends.

| Minute | Segment | What to say / ask |
|---|---|---|
| 0–1 | Open | "Thanks for the time. I'd like to understand your legacy estate and where the risk sits, share in two minutes how we work, and decide together if a 14-day pilot makes sense. Fair?" |
| 1–5 | Situation | "Which systems are still on [platform]? Roughly how many lines and modules?" · "What has to change in the next 12–24 months — regulation, cost, people, product?" · "Who still understands the code?" |
| 5–8 | Pain and stakes | "What happened last time a change went wrong in that area?" · "If a migrated calculation were off by a cent, what's the blast radius — customers, regulators, finance?" · "What have you tried before? What stopped it?" |
| 8–11 | Our approach (≤ 3 minutes) | Extract → verify → test first → build → prove. "Gemini reads the whole module; every business rule becomes an executable assertion traced to source lines; engineers verify it with your SME; Claude Code writes characterization tests first, then the Go/TypeScript service; it merges only at 100% parity on your masked production history. You get the evidence pack." |
| 11–13 | Pilot fit | "If we picked one module up to 50k lines that matters but won't take down the bank if the pilot slips — which would it be?" · "Can your team mask 30 days of its production inputs/outputs?" · "Who'd be our SME for ~8 hours over two weeks?" |
| 13–15 | Next step | Propose: technical deep-dive with their architect within 5 business days, SOW sent the same day. Confirm decision process: "Besides you, who signs a $50k pilot? Any procurement or security review we should start now?" |

**Qualification (all four needed to propose a pilot):**
1. A named module that matters, ≤ 50k LOC.
2. A business reason with a date (compliance deadline, renewal, retirement, roadmap).
3. Access to an SME and a maskable replay dataset.
4. A person who can sign $50k within 30 days, or a clear path to one.

**After the call (same day):**
> [First name], thanks for today. Summary: [module] on [platform], driven by [reason/date]. Pilot: 14 days, $50k fixed, 100% parity guarantee, credited against the retainer if you continue. Next: deep-dive with [architect] on [date]; I've attached the SOW for your review. Anything I misunderstood?

---

## 6. Executive briefing deck — script (10 slides, 20 minutes)

1. **Title — "De-risk the legacy core, one proven module at a time."** Talk track: "We don't ask you to bet the bank on a rewrite. We ask for one module and 14 days."
2. **Your situation.** Their estate in their numbers (from discovery): platforms, LOC, key-person risk, deadline. "Here's what we heard."
3. **Why modernizations fail.** Hidden rules, big-bang cutovers, regressions found in production, test suites that encode the new behavior instead of the old. "The failure is almost never the target architecture. It's losing behavior."
4. **The behavioral contract.** Show the LNFEE010 example: a rule (`fee = min(round_half_up(balance × 5%), 25.00) after day 15`) and assertions A-001 (100.10 → 5.01), A-005 (cap), A-014 (validation order), each with source line references. "This is the specification your code already implements — now executable."
5. **How we work.** Ingest (Gemini long-context) → verify (engineer + your SME) → characterization tests first → service build (Claude Code, Clean Architecture Go/TypeScript) → dual-engine parity gate. Humans review everything.
6. **The parity gate.** 100% of contract assertions, 100% of masked production replay, ≥ 90% branch coverage, p99 latency target, security scans. "Nothing merges on 99.9%."
7. **The pilot.** One module ≤ 50k LOC, 14 days, $50k fixed. Deliverables D1–D6. Parity guarantee and retainer credit. Client effort: ~8 SME hours + a masked dataset.
8. **After the pilot — the retainer.** $100k/month, dedicated pod (pod lead, two senior engineers, parity QA, AI agent system), ~12 standard modules/month capacity, 72-hour turnaround SLA per standard module, 90-day zero-regression warranty, service credits.
9. **Governance and security.** Your repositories, your IP, masked data only, no model training on your code, AI usage disclosed per model, SOC 2-aligned controls, regulator-ready audit trail (lineage + evidence packs).
10. **Decision.** "Pick the module, name the SME, and we start on [date]. Day 14 you'll have a running service and the evidence to judge us."

---

## 7. Objection handling

| Objection | Response |
|---|---|
| "We tried modernization before and it failed." | "Most failures share a cause: behavior was lost and found in production. We invert that — behavior is captured as tests first and nothing ships below 100% parity on your own history. The pilot risks one module and 14 days, with a contractual guarantee." |
| "AI can't be trusted with core banking logic." | "Agreed — which is why AI output is never trusted on its own. Gemini proposes the rules; an engineer and your SME verify them against cited source lines; the code must pass every assertion and a replay of real masked transactions. AI makes it fast; the parity gate makes it safe." |
| "Our code is too complex / too old / too undocumented." | "That's the case we're built for. The extraction reads the whole subsystem — copybooks, packed-decimal fields, package state — and anything uncertain is flagged for your SME, not guessed. Pick your hardest module ≤ 50k lines for the pilot." |
| "We already have a GSI / partner." | "Many clients use us alongside one: we take the highest-risk modules where behavioral proof matters most, and hand over contracts, tests, and evidence your partner can build on." |
| "$100k a month is a lot." | "Compare it to one regression in a fee or interest calculation reaching customers and the regulator, or to the multi-year program a big-bang rewrite needs. The retainer is capacity for roughly a dozen proven modules a month with SLAs and service credits. And you decide after seeing the pilot." |
| "We can do this in-house." | "You can, and we'll leave you the harness and contracts either way. The question is time: building the extraction, contract verification, and parity gate took us a dedicated team. The pilot shows whether buying that speed is worth it." |
| "Security won't allow our code into AI tools." | "Source code goes only to commercial AI APIs with no-training terms, listed per model in our MSA; production data never leaves your environment — only masked replay data. We'll do your security review before kickoff and can work inside your environment." |
| "What about our people who know COBOL?" | "They become more valuable: their knowledge is captured as verified rules and tests with their name on the review, and they stop being the single point of failure." |
| "We're not ready to move off the mainframe." | "You don't have to. Modernized services can run alongside the mainframe; we start with modules where risk or cost is highest. Each one is independently proven." |
| "Send me a case study." | "Happy to show the full LNFEE010 walkthrough — contract, tests, service, parity report — live in 15 minutes. And the pilot produces a case study on your own code." (Share client references only with their written approval.) |
| "Timing isn't right — maybe next year." | "Understood. What would make it right — a budget cycle, a renewal date, a deadline? I'll note it and check in then." Set nurture date. |
| "Who else have you done this for?" | Name only client-approved references. Otherwise: "We're early and selective, which is why the pilot carries a parity guarantee — you judge us on your own module, not on slides." |
| "What happens if you miss the 72-hour SLA?" | "Service credits apply automatically — 2% of the month's fee per late standard module, computed in our sprint dossier — and three missed months in any six let you terminate without penalty." |
| "Who owns the code?" | "You do. Deliverables are assigned to you on payment; our tooling embedded in them is licensed to you perpetually and royalty-free." |
| "Can you work with Go/TypeScript only? We use Java/.NET." | "Our templates are Go and TypeScript; other targets are possible by agreement in the SOW. The behavioral contract and parity gate are language-agnostic." |

---

## 8. Metrics and targets

| Metric | Target |
|---|---|
| Reply rate (any reply / delivered first touches) | ≥ 8% |
| Positive reply rate | ≥ 3% |
| Discovery calls per week | ≥ 4 |
| Calls → qualified pilot proposals | ≥ 35% |
| Pilot proposals → signed pilots | ≥ 40% |
| Pilots → retainers within 30 days of acceptance | ≥ 60% |

Path to $1M MRR: ~10 retainers ⇒ ~17 pilots ⇒ ~42 proposals ⇒ ~120 discovery calls ⇒ about
7 months at 4 calls/week, assuming the conversion targets above. Review weekly; when a stage
underperforms for three consecutive weeks, change one variable at a time (trigger type,
subject line, persona, offer framing) and measure for two weeks.
