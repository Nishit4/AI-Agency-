# CTO / CIO and Channel-Partner Outbound Playbook

**LegacyModern AI (a trading name of [Provider legal name] Private Limited, India) — outbound
sequences, 15-minute discovery call, briefing script and objection handling**

Used by the CEO and by the Daily Client Outreach Agent (`agents/06_daily_client_outreach.md`),
which **drafts only**; the CEO reviews and sends every message.

Every factual claim here maps to our contracts: the Paid Assessment and the 14-day, $50,000
Proof-of-Value Pilot (`pilot_scope_of_work_50k.md`) and the $100,000/month retainer
(`retainer_agreement_100k.md`). Do not add claims, logos, case studies, statistics, team sizes,
certifications or insurance amounts that are not in those documents or in a client-approved
reference.

---

## 1. Honesty rules, market and disclosure (read before writing anything)

1. **One human.** The company has one person: the CEO. AI agents do the delivery work. Write in the
   first person singular ("I", "my") or name the company. Never write "our engineers", "the team",
   "our pod", "my colleague", "we'll have someone…", or anything else that suggests other people.
   "We" is allowed only for the CEO and the prospect together ("we could start on…").
2. **AI delivery is never hidden.** Before any proposal, SOW or pricing is sent, the prospect must
   have been told in writing that the work is performed by AI agents and reviewed and signed off by
   the CEO. The discovery-call script (Section 6) and the SOW Order Form both do this. In cold
   email, the one-line disclosure in Section 1.2 is optional in touch 1 but **mandatory** in any
   message that discusses scope, price or delivery.
3. **Qualified parity claims only.** Say "100% parity on the agreed acceptance tests and your
   masked production replay data". Never "zero regressions", "identical in production" or
   "guaranteed bug-free".
4. **No certifications we don't hold.** No SOC 2, ISO 27001, "enterprise-grade security",
   "bank-grade", or insurance amounts. If asked, use the answers in Section 8.
5. **No borrowed credibility.** No client logos, case studies, or "work with banks like…" until a
   client has approved it in writing. "I'm early" is the honest answer.
6. **Real sender.** The From name is the CEO's real name. Titles: "Founder & CEO". No aliases,
   no fake "Re:" subjects, no pretend assistants signing emails.
7. **Compliance footer on every commercial email** (Section 1.3), and every rule in
   `config/outreach_schedule.yaml` → `compliance`.

### 1.1 Who we sell to

**Primary — mid-market owners of legacy systems** (annual revenue roughly USD 50M–2B; see
`ideal_customer_profile` in the config): regional and community banks, credit unions, mid-size
insurers and third-party administrators, payment and lending firms, logistics and distribution
companies, and manufacturers that still run core processes on COBOL/CICS/DB2, RPG on IBM i
(AS/400), PL/I, Natural/Adabas, Oracle PL/SQL or legacy Java EE. These buyers can approve a Paid
Assessment or a $50k pilot without a year-long procurement, and a one-person vendor with an
objective acceptance test is easier for them to try.

**Secondary — channel partners** who already own the client relationship and need a
behavior-preservation capability: boutique mainframe and IBM i consultancies, system integrators
without an in-house parity method, cloud-migration partners, and managed-service providers. The
partner keeps the client; the Provider supplies contracts, tests, services and parity evidence.

**Not targeted by cold email:** government entities that require a formal RFP channel (route to the
RFP tracker), very large enterprises whose procurement requires SOC 2 reports or large insurance
limits we do not have (approach only through a partner or an inbound request), and any company in a
market listed under `regions_requiring_opt_in` or `regions_on_hold` in the config.

**Personas:**

| Persona | What they own | What keeps them up | What they need to hear |
|---|---|---|---|
| CIO / CTO / Head of IT (Sequence A) | Technology strategy, budget, regulator or auditor relationship | Retiring COBOL/RPG staff, failed rewrites, license cost | Risk is contractually bounded; progress is provable module by module; a cheap first step exists |
| VP Engineering / Head of Core Systems / Chief Architect / IT Manager (Sequence B) | Delivery, architecture, the people who know the code | Undocumented business rules, regression fear | Behavior is extracted into executable tests with line-level lineage before any code changes |
| Partner: founder / practice lead / alliances lead (Sequence C) | Client accounts, delivery margin | Fixed-price rewrite risk, no parity evidence for clients | White-label or co-delivered contracts, tests and parity evidence; they stay the client's partner |

**Trigger events** (one is required for every first touch to a buyer; partners need a relevant
practice or offering instead):
1. Job posting naming COBOL, CICS, JCL, DB2 z/OS, IMS, PL/I, Natural, RPG/IBM i or PL/SQL.
2. Public statement about mainframe or IBM i exit, data-center exit or core modernization.
3. New CIO/CTO in the last 180 days.
4. Regulator or auditor publication citing technology resilience at the company.
5. Announced cloud partnership without a named modernization partner.
6. Legacy platform or outsourcing contract renewal in the news.

### 1.2 Optional AI-delivery disclosure line (use verbatim)

> P.S. Full disclosure: the delivery work is done by AI agents (Google Gemini and Anthropic Claude); I'm the company's only human, and I review and sign off everything they produce.

### 1.3 Required footer (every commercial email)

> [CEO full name] · Founder & CEO, LegacyModern AI ([Provider legal name] Private Limited)
> [Registered office postal address, India]
> This is a commercial message. If it isn't relevant, reply "no thanks" and I won't contact you again. Privacy notice: [privacy notice link]

---

## 2. Sequence A — CIO / CTO / Head of IT (3 touches over 9 days)

Bracketed items are filled from research for each prospect. Never send a bracket.

### Touch 1 — Day 0
**Subject options:** `[company]'s cobol estate` · `de-risking [system/area]` · `a small test for [company]`

> [First name],
>
> [Specific trigger: e.g. "Saw [company] is hiring a CICS/DB2 developer for the cards platform."] That usually means the people who understand those rules are scarce, and every change is a regression risk.
>
> I run LegacyModern AI. AI agents extract a module's business rules into executable tests traced to the exact source lines, then rebuild it in Go or TypeScript; the new code is accepted only at 100% parity on those tests and on your own masked production history. I review and sign off every step.
>
> The low-risk way to judge it: a paid assessment on one program up to 5,000 lines, or a 14-day fixed-fee pilot on a bigger module with a contractual parity guarantee.
>
> Worth 15 minutes to see if [system/area] is a fit?
>
> [Optional disclosure line from 1.2]
> [Footer from 1.3]

### Touch 2 — Day 4
**Subject:** `re: [original subject]` only if it is a genuine reply in the same thread; otherwise `the regression question`

> [First name],
>
> One question I ask every CIO before a modernization: if the new [system/area] code computed a fee, interest accrual or eligibility result one cent or one day differently from the old system, how would you find out, and how fast?
>
> My answer is a parity gate: every module is replayed against masked production records and has to match 100% before it can merge. You get that evidence, and the commands to re-run it yourself.
>
> If useful, here's my calendar: [calendar link]
>
> [Optional disclosure line from 1.2]
> [Footer from 1.3]

### Touch 3 — Day 9
**Subject:** `closing the loop`

> [First name], I'll stop here. If de-risking [system/area] becomes a priority (a deadline, a key retirement, a renewal), the offer stands: start with one program as a paid assessment, or one module in a 14-day pilot where, if parity isn't reached, you don't pay the second half.
>
> [Footer from 1.3]

---

## 3. Sequence B — VP Engineering / Head of Core Systems / Chief Architect / IT Manager

### Touch 1 — Day 0
**Subject options:** `undocumented rules in [program/area]` · `characterization tests for [system]`

> [First name],
>
> [Specific trigger: e.g. "Your posting for a PL/SQL lead mentions 'reverse-engineering billing packages'."] That's the hard part of every modernization: the rules live in the code, not the docs.
>
> How I work: Gemini reads the whole subsystem (copybooks, packed-decimal fields, package state) and extracts each rule as an executable assertion with line-level lineage; I check every rule against the cited lines with your SME; Claude Code writes the characterization tests first, then the Go/TypeScript service, which merges only at 100% parity on those tests and your masked production history.
>
> Happy to walk you through it on a sample COBOL module in 15 minutes. Open to it?
>
> [Optional disclosure line from 1.2]
> [Footer from 1.3]

### Touch 2 — Day 4
**Subject:** `rounding, truncation, 88-levels`

> [First name],
>
> The regressions in rewrites are rarely architecture. They're COMPUTE ROUNDED vs truncation, a PIC 9(3) that silently drops a digit, an EVALUATE whose order matters, a NULL that PL/SQL treats differently. The contract pins each one as a test before any code is written.
>
> If you pick a module, I'll show you what its extracted contract would look like. [calendar link]
>
> [Footer from 1.3]

### Touch 3 — Day 9
**Subject:** `last note`

> [First name], last note from me. If a program ever needs to move off [platform] without surprises, a paid assessment on one program up to 5,000 lines is the cheapest way to see the contract, tests and parity report on your own code.
>
> [Footer from 1.3]

---

## 4. Sequence C — Channel partners (2 touches over 7 days)

Use only for firms whose public website describes a mainframe, IBM i, legacy-modernization or
cloud-migration practice. No trigger event is needed; cite the specific practice page instead.

### Touch 1 — Day 0
**Subject options:** `parity evidence for [partner]'s modernization clients` · `a behavior-preservation layer for [practice name]`

> [First name],
>
> [Specific: e.g. "Your site describes [partner]'s COBOL-to-Java practice for regional banks."] The hardest part of those projects to sell is usually the proof that nothing changed.
>
> I run LegacyModern AI: AI agents extract a module's business rules into executable tests with line-level lineage and produce a parity report against masked production history; I review and sign off everything. Partners can use it on one module, behind their own delivery, and keep the client relationship.
>
> Would a 15-minute look at a sample contract and parity report be useful?
>
> The delivery work is done by AI agents; I'm the company's only human.
> [Footer from 1.3]

### Touch 2 — Day 7
**Subject:** `sample contract, if useful`

> [First name], happy to send the sample behavioral contract from my COBOL demo module (31 assertions, each traced to source lines) so you can judge whether it would help your clients. Just reply "send it".
>
> [Footer from 1.3]

**Partner commercials** are agreed case by case in a written partner agreement (subcontract,
referral or co-delivery). Never offer a referral fee or anything of value to an employee of an
end client.

---

## 5. Reply templates

**Interested → book:**
> Thanks, [first name]. Would [slot 1, their time zone] or [slot 2] work for 15 minutes? If easier, grab any time here: [calendar link]. I'll send a two-line agenda so it's a good use of your time.

**Pricing question** (always includes the disclosure):
> Straight answer. Three options:
> 1. **Paid assessment:** one program up to 5,000 lines; you get the verified behavioral contract, characterization tests and a parity demonstration in 10 business days, for a fixed fee of $[assessment fee], credited against a pilot if you continue within 30 days.
> 2. **Pilot:** one module up to 50,000 lines, $50,000 fixed, 14 days for modules up to 20,000 lines (21 days above that), half up front and half on acceptance. If 100% parity on the agreed tests and replay data isn't reached after a 10-business-day cure period, the second half isn't due and I refund half of the first.
> 3. **Retainer:** $100,000/month for reserved capacity of my AI delivery pipeline: up to two modules in flight and about six standard modules a month, with service levels in Indian business hours plus an agreed overlap window.
>
> To be clear on how it's delivered: AI agents do the work, and I'm the only human; I review and sign off every deliverable, and acceptance is decided by the automated parity evidence. Worth 15 minutes to see if your module fits?

**Send me something:**
> Of course. In short: a module's business rules are extracted into executable tests traced to source lines, and the new service is accepted only at 100% parity on those tests and your masked production history. The work is done by AI agents and reviewed and signed off by me. Attached is the behavioral contract from my COBOL demo module (31 assertions) so you can see exactly what you'd receive. The cheapest way to judge fit is a paid assessment on one of your programs.

**"Is this just you?"**
> Yes. I'm the only person in the company; AI agents (Gemini and Claude) do the analysis, test writing and coding, and I review every contract rule against the source, every gate report and the risky code paths, and sign off. That's why acceptance is objective: the parity harness and replay report decide it, and you can re-run them yourself.

---

## 6. 15-minute discovery call

**Goal:** disclose the delivery model, qualify, and if qualified agree on the first step (paid
assessment, technical deep-dive, or pilot SOW review) before the call ends.

| Minute | Segment | What to say / ask |
|---|---|---|
| 0–1 | Open and disclosure | "Thanks for the time. One thing up front so there are no surprises: the delivery work is done by AI agents, and I'm the company's only human. I review and sign off everything, and acceptance is decided by automated parity evidence you can re-run. With that said, I'd like to understand your legacy estate and where the risk sits, and decide together if a first step makes sense. Fair?" |
| 1–5 | Situation | "Which systems are still on [platform]? Roughly how many lines and modules?" · "What has to change in the next 12–24 months — regulation, cost, people, product?" · "Who still understands the code?" |
| 5–8 | Pain and stakes | "What happened last time a change went wrong in that area?" · "If a migrated calculation were off by a cent, what's the blast radius?" · "What have you tried before? What stopped it?" |
| 8–11 | How it works (≤ 3 minutes) | Extract → verify → test first → build → prove. "Gemini reads the whole module; every business rule becomes an executable assertion traced to source lines; I check each rule against those lines with your SME; Claude Code writes characterization tests first, then the Go/TypeScript service; it merges only at 100% parity on those tests and your masked production history. You get the evidence pack." |
| 11–13 | Fit | "Is there one program up to 5,000 lines we could assess first, or one module up to 50,000 lines that matters but won't hurt if a pilot slips?" · "Can your team mask its production inputs and outputs?" · "Who'd be the SME for about 1 hour (assessment) or 8 hours (pilot)?" · "Will your security or procurement team need a SOC 2 report or a specific insurance limit? I don't have SOC 2; I can answer a security questionnaire." |
| 13–15 | Next step | Propose the assessment or a technical deep-dive within 5 business days, SOW sent the same day. Confirm the decision process: "Besides you, who signs?" |

**Qualification (all needed before sending a SOW):**
1. A named program or module that matters (≤ 5,000 lines for an assessment; ≤ 50,000 for a pilot).
2. A business reason with a date.
3. Access to an SME and a maskable dataset.
4. A person who can sign within 30 days, or a clear path to one.
5. No hard requirement we cannot meet (for example, a mandatory SOC 2 report, on-site work, 24×7
   support, or an insurance limit above what is bound).
6. The prospect has been told, in writing, that delivery is AI-performed with the CEO as the only
   human.

**After the call (same day):**
> [First name], thanks for today. Summary: [program/module] on [platform], driven by [reason/date]. As discussed, the work is done by AI agents and reviewed and signed off by me. Proposed first step: [paid assessment at $[fee] / 14-day pilot at $50k fixed with the parity guarantee]. Next: [deep-dive with [architect] on [date]]; I've attached the SOW for your review. Anything I misunderstood?

---

## 7. Executive briefing — script (10 slides, 20 minutes)

1. **Title — "De-risk the legacy core, one proven module at a time."** "I'm not asking you to bet on a rewrite. I'm asking for one program or one module."
2. **Your situation.** Their estate in their numbers (from discovery). "Here's what I heard."
3. **Why modernizations fail.** Hidden rules, big-bang cutovers, regressions found in production, tests that encode the new behavior instead of the old.
4. **The behavioral contract.** The LNFEE010 example: rule (`fee = min(round_half_up(balance × 5%), 25.00) after day 15`) and assertions A-001 (100.10 → 5.01), A-005 (cap), A-014 (validation order), each with source line references.
5. **How it's delivered.** AI agents: ingest (Gemini long-context, paid API) → contract audit, characterization tests, service build (Claude Code, commercial terms) → automated parity gate. One human: I review every contract rule against the source, every gate report and the risky code, and sign off. Acceptance is decided by the evidence, not by trust in me or the AI.
6. **The parity gate.** 100% of contract assertions, 100% of masked production replay, ≥ 90% branch coverage, p99 latency target, static and security scans. "Nothing merges on 99.9%."
7. **First steps.** Paid assessment (one program ≤ 5,000 lines, 10 business days, fixed fee) or pilot (one module ≤ 50,000 lines, 14 days up to 20,000 lines / 21 days above, $50k fixed). Deliverables, parity guarantee, credits.
8. **After the pilot — the retainer.** $100k/month for reserved pipeline capacity: up to 2 modules in flight, about 6 standard modules a month, 5-business-day turnaround per standard module, 90-day parity warranty, service credits, support in Indian business hours plus an agreed overlap window. No 24×7 support; you keep the legacy module for rollback.
9. **Governance, security and continuity.** Your repositories and your IP; work committed to your repo daily; masked data only; AI providers used only under paid/commercial terms with no training on your code; models disclosed per deliverable; written security policy and questionnaire answers (no SOC 2 report); key-person terms in the contract; lineage and evidence packs for your auditors.
10. **Decision.** "Pick the program or module, name the SME, and we start on [date]."

---

## 8. Objection handling

| Objection | Response |
|---|---|
| "We tried modernization before and it failed." | "Most failures share a cause: behavior was lost and found in production. Here behavior is captured as tests first and nothing ships below 100% parity on your own history. Start with an assessment on one program." |
| "AI can't be trusted with core logic." | "Agreed, which is why AI output is never trusted on its own. The AI proposes the rules; I check them against cited source lines with your SME; the code must pass every assertion and a replay of real masked transactions. You can re-run that evidence yourself." |
| "So it's just you?" | "Yes — one human, AI agents doing the work. The contract says so, names the models, and puts acceptance on objective evidence. It also has key-person terms: work is committed to your repository daily, and if I'm unavailable for more than ten business days you can suspend or exit with a pro-rata refund." |
| "What if you get sick / disappear?" | "Everything — contracts, tests, harness configuration, code — is in your repository at the end of every working day, so you're never holding nothing. The retainer lets you suspend fees or terminate without penalty after ten business days of unavailability." |
| "Do you have SOC 2 / ISO 27001?" | "No. I won't claim them. I have a written security policy, MFA and encryption everywhere, masked-data-only processing, and AI providers used only under paid terms that bar training on your code. I'll complete your security questionnaire and you can audit the evidence." |
| "What insurance do you carry?" | State only what is bound: "[insurer], technology professional indemnity including cyber, [limit], covering [jurisdictions]." Never quote a limit that is not on the certificate. |
| "You're in India — how do contracts and payment work?" | "You contract with an Indian private limited company. Invoices are in US dollars, paid by wire; there's no Indian GST on exports of services. Disputes go to arbitration in Singapore under English, Singapore or New York law, whichever suits you, and India and your country are both parties to the New York Convention on enforcing arbitral awards." |
| "Our code is too complex / too old / undocumented." | "That's the case this is built for. Anything uncertain is flagged for your SME, not guessed. An assessment on your hardest small program is the quickest proof." |
| "We already have a partner / SI." | "Then I can work behind them on the highest-risk modules and hand over contracts, tests and evidence they can build on." |
| "$100k a month is a lot." | "It buys reserved capacity for about six proven modules a month with service levels and credits. You decide after the pilot, and the assessment is far cheaper than either." |
| "We can do this in-house." | "You can, and you keep the harness and contracts either way. The question is time; an assessment on one of your programs shows whether buying the speed is worth it." |
| "Security won't allow our code into AI tools." | "Source code goes only to the paid Gemini API and Anthropic's commercial API, named in the contract with their retention terms; production data never leaves your environment, only masked replay data. I'll do your security review before kickoff." |
| "What about our people who know COBOL?" | "They become more valuable: their knowledge is captured as verified rules and tests with their review on record, and they stop being the single point of failure." |
| "We're not ready to move off the mainframe." | "You don't have to. Modernized services can run alongside it; start where risk or cost is highest." |
| "Send me a case study." | "I don't have a client case study yet, and I won't invent one. I can show the full LNFEE010 walkthrough live in 15 minutes, and an assessment produces one on your own code." |
| "Who else have you done this for?" | Name only client-approved references. Otherwise: "I'm early, which is why the pilot carries a parity guarantee and the assessment is a small fixed fee: you judge on your own code, not on slides." |
| "What happens if you miss the turnaround target?" | "Service credits apply: 2% of the month's fee per late standard module, computed in the sprint dossier, and three missed months in any six let you terminate without penalty." |
| "Do you offer 24×7 support?" | "No. Support runs in Indian business hours plus an agreed overlap window with you; P1 acknowledgement is within 4 support hours. You keep the legacy module available for rollback, which is the real safety net." |
| "Who owns the code?" | "You do. Deliverables are assigned to you on payment; my tooling embedded in them is licensed to you perpetually and royalty-free." |
| "Can you target Java/.NET?" | "My templates are Go and TypeScript; other targets are possible by agreement. The behavioral contract and parity gate are language-agnostic." |

---

## 9. Metrics and targets

| Metric | Target |
|---|---|
| Reply rate (any reply / delivered first touches) | ≥ 8% |
| Positive reply rate | ≥ 3% |
| Discovery calls per week | ≥ 4 |
| Calls → assessment or pilot proposals | ≥ 35% |
| Proposals → signed assessments or pilots | ≥ 40% |
| Assessments → pilots within 30 days | ≥ 50% |
| Pilots → retainers within 30 days of acceptance | ≥ 60% |

**Capacity ceiling.** Growth is limited by the CEO's review time, not by leads. Before signing any
new pilot or retainer, check that the total committed Capacity across all signed retainers (Exhibit
A of each), plus one pilot at a time, fits the hours the CEO can review. Do not sign beyond that; raise
prices or hire (and update every contract and this playbook first) instead. Review weekly; when a
funnel stage underperforms for three consecutive weeks, change one variable at a time (trigger type,
subject line, persona, offer framing) and measure for two weeks.
