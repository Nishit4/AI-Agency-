# CEO Operating Manual

**Company:** `[COMPANY NAME] Private Limited`
**CEO / Managing Director:** `[FULL NAME]`, the only human in the company.
**Version:** 1.0, 13 October 2026. Read together with:
- legal_operating_policy.md (binding rules)
- compliance_calendar.md (statutory dates)
- tax_and_payments.md (money)
- formation_india.md (set-up)

---

## 1. The operating model in one paragraph

AI agents do the work:
- **Gemini** ingests legacy code.
- **Claude Code agents** publish the specification (02), transpile (03), run the parity gate (04) and track delivery (05).
- The **outreach agent** (06) researches prospects and drafts emails.

The CEO is the **accountable human**: the single reviewer, approver, signatory and sender. Agents prepare; the CEO decides. Anything that creates a legal obligation, moves money, speaks to a new person for the first time, accepts work, or files with a government is done **personally by the CEO** (§6). Clients are told this in plain words (legal_operating_policy.md §1.2).

---

## 2. Daily routine (business days, about 60–90 minutes)

**Time zones:** IST is UTC+5:30. The outreach agent runs at 08:20 America/New_York (config/outreach_schedule.yaml), which is **17:50 IST while US daylight time is in effect and 18:50 IST otherwise**. Its end-of-day summary is at 17:15 New York time (02:45 or 03:45 IST the next day), so read it the next morning.

| When (IST) | Task | Output |
|---|---|---|
| Morning, 20 min | Read the overnight outreach end-of-day report and the reply inbox. Answer every human reply personally within 1 business day. **Process opt-outs immediately** (policy: within 24 hours). | Replies sent; suppression list updated |
| Morning, 20 min | Delivery check: read the agent 05 standup note, gate results from agent 04, escalations, SLA clocks and token spend against the USD 6,500/pod/month ceiling | Decisions on escalations; PRs queued for review |
| Midday, 30–60 min | **Review agent output** queued for approval (§5) | Merges or rejections with reasons |
| Evening (after the 17:50/18:50 run), 20–30 min | **Approve first-touch drafts** (§4.2). Edit, reject or schedule-send from the CEO's own mailbox in each recipient's local send window (07:30–10:30, Tue–Thu preferred). | Approved emails scheduled; rejected drafts logged with reasons |
| Any time | Security alert or suspected incident: start the **6-hour CERT-In clock** (legal_operating_policy.md §5) | Incident log |

**Send-window conversions (recipient 07:30 local):**

| Recipient | 07:30 local in IST |
|---|---|
| New York | 17:00 (US daylight time) / 18:00 (standard time) |
| London | 12:00 (UK summer time) / 13:00 (GMT) |
| Singapore | 05:00 |
| Sydney | 02:00 (Australian daylight time) / 03:00 (standard time) |

Use scheduled send for these. Scheduling an email that the CEO has personally approved counts as the CEO sending it.

---

## 3. Weekly cadence

| Day | Block | Agenda |
|---|---|---|
| **Monday, 60 min** | **Pipeline review** | Go through the tracker (outreach_data/prospects.csv): new prospects by country and status; replies by classification; meetings booked; proposals out; pilots in negotiation. Prune disqualified prospects. Check country caps (Singapore 90/day and 900 per rolling 30 days). Confirm that this week's target list excludes Germany and Austria and holds the Netherlands, Nordics, Ireland and the rest of the EU. Set the week's priorities for agent 06. |
| **Monday, 30 min** | **Delivery planning** | For each active client: Work Orders in flight, SLA clocks, risks, review hours needed this week against hours available (§7). Decline or reschedule work that exceeds capacity. |
| **Tuesday–Thursday** | **Selling** | Discovery calls (15 minutes, with the disclosure script in legal_operating_policy.md §1.2(f) in the first 5 minutes); proposal writing; follow-ups |
| **Wednesday, 30 min** | **Client status notes** | Review and send each client's weekly GREEN/AMBER/RED status note, drafted by agent 05. The CEO edits and sends it personally. |
| **Friday, 60 min** | **Finance and compliance** | Invoices due this week (export invoice checklist, tax_and_payments.md §2.3); receipts landed, with FIRA downloaded and e-BRC generated; vendor invoices received (reverse-charge self-invoice within 30 days); export receivables ageing (any invoice over 90 days old: chase); next 14 days of compliance_calendar.md; cash balance and runway |
| **Friday, 30 min** | **Weekly review and log** | KPI snapshot (§8); decisions log; lessons. Update the substantiation file with any new evidence (legal_operating_policy.md §1.5). |

---

## 4. Pipeline and outreach: how the CEO approves

### 4.1 Where clients legitimately come from

| Channel | How | Rules |
|---|---|---|
| Compliant cold email | Agent 06 researches and drafts; the CEO approves and sends | legal_operating_policy.md §7 (country table) |
| Personal LinkedIn activity | The CEO writes posts and messages manually | Do not automate LinkedIn or scrape it in breach of the platform's terms. The platform's terms were not researched; read them before any tooling. |
| Public demonstration | The LNFEE010 COBOL example and its 31 verified assertions, shown live on calls | Present it accurately as a demonstration, not a client project |
| Referrals and partners | Cloud-provider partner programmes, system integrators, former colleagues | Disclose the AI-delivery model to partners as well; any referral fee needs a written agreement |
| Public tenders | Government entities that require formal procurement (the repo routes these to an RFP tracker) | Read the eligibility rules; never claim staff or certifications the company does not have |
| Inbound | Website "How we deliver" page, articles, talks | The disclosure must be visible on the site |

### 4.2 First-touch draft approval checklist (every draft, every time)

Reject the draft if **any** item fails.

1. **Country status** is "Permitted" in the legal_operating_policy.md §7.2 table, and the country-specific rule is met (e.g. Canada and Australia: conspicuous-publication evidence; UK: a corporate subscriber, not a sole trader).
2. **Provenance recorded:** source URL, date, screenshot, and why the address is relevant to the role. No purchased or harvested list without provenance.
3. **Role fit:** CIO, CTO, VP Engineering, Head of Core Systems or similar. Never personal addresses, students or recruiters.
4. **Suppression check passed** (not opted out, not bounced, not a current client).
5. **Trigger fact verified:** the claimed trigger (job posting, announcement) is real; open the link.
6. **No prohibited claims** (legal_operating_policy.md §1.3): no "engineers" or "team", no SOC 2, no 24x7, no unqualified "100% parity" or "zero regressions", no client names.
7. **Disclosure present:** the AI-delivery signature line and the privacy-notice link.
8. **Mandatory elements present:** the CEO's real name; an accurate subject; the registered postal address; an opt-out line; an ad identification line where required (US).
9. **Caps respected:** at most 2 per company per week; the Singapore caps.
10. **Tone:** specific, brief, no pressure or false urgency.

**Follow-ups** (touches 2 and 3) may be drafted by the agent but are also approved by the CEO. Switching to automatic follow-ups is a board-level decision. If it is ever made, first-touch emails stay CEO-sent permanently.

### 4.3 From reply to signature

1. **Discovery call:** the CEO runs it and gives the disclosure script first. Qualify on four questions: is there a legacy module of up to about 50k lines; can they provide a masked replay dataset; is there an SME available; who are the budget owner and signatory.
2. **Proposal:** use only the **revised** SOW and MSA templates (legal_operating_policy.md §1.4, §8). An agent may draft; the CEO edits and sends.
3. **Pre-signature gate:** all of these must be true before the CEO signs.
   - INC-20A filed.
   - LUT valid for the FY.
   - Insurance bound, with USA/Canada jurisdiction where relevant.
   - Counsel has reviewed the templates.
   - The data addendum is attached (SCC, UK Addendum, CCPA or DPDP).
   - The capacity check has passed (§7).
   - Stamp duty is paid if the contract is executed in India.
   - The client entity is a foreign legal entity paying in foreign currency (for export treatment).
4. **Signature:** the CEO signs **for the Company**. No personal guarantees.

---

## 5. Reviewing agent output and signing acceptance

### 5.1 Merge review: every module PR the parity gate (agent 04) approves

The gatekeeper's automated APPROVE is **advisory**. A module is accepted for delivery only when the CEO merges it.

| Check | Pass condition |
|---|---|
| Gate report | All gates G1–G12 pass on the exact commit SHA being merged |
| Contract parity | 100% of Verified Behavioral Contract assertions pass |
| Replay parity | 100% of the agreed Replay Dataset, with exclusions only as the SOW allows and each one listed |
| Coverage | Branch coverage at least 90% |
| Lineage | A sample of 5 assertions opened and traced to the cited legacy source lines; each matches |
| Deviations | Every behavioural deviation has written client approval (role and date) |
| Code read | The CEO reads the diff of the domain logic and the harness changes. No disabled tests, no skipped assertions, no tolerance widened without a contract basis. |
| Security | `go vet`, `staticcheck`, `govulncheck`, `gosec` and `gitleaks` clean, or exceptions documented |
| Data rules | Only approved paid AI services were used (legal_operating_policy.md §3.1); no client data in logs; model and version recorded in the Work Order |
| Replay attestation | Masking attestation signed by the client's data owner is on file |

If any check fails, reject with a written reason. Two consecutive rejections for the same failure trigger escalation to the client under the escalation rules.

### 5.2 Milestone or pilot acceptance

1. Agent 05 drafts the **sign-off dossier**. The CEO verifies every figure against the gate reports and replay outputs; there must be no figure the CEO has not seen evidence for.
2. The CEO signs the dossier and the Provider's delivery statement **as CEO for the Company**:
   > "I have reviewed the parity evidence listed in this dossier for commit [SHA]. On the agreed acceptance suite and Replay Dataset, the Deliverables met the acceptance criteria in [SOW/Work Order ref]. [FULL NAME], CEO, for [COMPANY NAME] Private Limited, [date]."
3. The CEO sends the dossier to the client signatory for acceptance. The CEO **never accepts on the client's behalf**, and never marks a client acceptance as given without the client's written acceptance or deemed acceptance under the contract terms.
4. Only after acceptance or deemed acceptance does the CEO issue the export invoice (tax_and_payments.md §2.3), when it is due under the contract.

---

## 6. Decisions that must never be delegated to agents

These actions are performed **only by the CEO personally**, or by the board where the law requires a board decision. An agent may prepare a draft, a checklist or a reminder. An agent **MUST NOT** execute, send, submit, sign, pay or approve any of the following.

| # | Decision or action | Why |
|---|---|---|
| 1 | **Signing** any contract, SOW, Work Order, NDA, DPA, SCC, BAA, change order, partner or referral agreement, or amendment | Creates legal obligations; the signatory's authority comes from the board |
| 2 | **Sending a first-touch email** or the first message to any new person on any channel | Anti-spam law and misrepresentation risk; the company's credibility |
| 3 | **Accepting deliverables:** merging module PRs, signing the delivery statement and dossier, declaring parity achieved | Personal accountability is the product promise; fraud and misrepresentation risk |
| 4 | **Legal and regulatory filings:** MCA (INC-20A, AOC-4, MGT-7A, ADT-1, DIR-3 KYC, DPT-3, MSME-1), GST (returns, LUT, refunds), income tax (returns, advance tax, TDS, Forms 145/146), DGFT (IEC, e-BRC), EDF with the bank, CERT-In reports | Statutory liability of directors and officers; requires the DSC, EVC or the CEO's credentials |
| 5 | **Payments and banking:** any payment, refund, payroll, tax challan, vendor wire, card authorisation for a new vendor, change of bank details, or acceptance of a short realisation | Fraud risk; FEMA and TDS consequences |
| 6 | **Issuing invoices or credit notes** and agreeing any discount, service credit or refund | Revenue recognition, GST and FEMA records |
| 7 | **Committing capacity, SLAs or delivery dates** to a client | Single-reviewer capacity limit (§7) |
| 8 | **Pricing and proposals:** final price, payment terms, liability caps, governing law | Commercial and legal risk |
| 9 | **Data decisions:** accepting any client dataset, approving an exception to masking, adding an AI provider or tool, granting access to client systems | Privacy law and client confidentiality |
| 10 | **Incident decisions:** declaring an incident, CERT-In reporting, client breach notices, insurer notification | 6-hour statutory clock; contractual duties |
| 11 | **Responding to legal notices,** regulators, tax officers, auditors, or litigation and arbitration | Legal exposure |
| 12 | **Public statements:** website copy, case studies, press, or any new marketing claim (which needs a substantiation file entry) | FTC, UK BPR and Contract Act exposure |
| 13 | **Changes to agent permissions,** outreach mode (`draft_for_approval` → anything else), policies, or credentials | Control integrity |
| 14 | **Insurance:** proposal forms, disclosures, binding, claims | Non-disclosure can void the cover |
| 15 | **Hiring, contractor engagement, equity, board matters, borrowing** | Board and statutory matters |

**Agents may:** research prospects, draft emails and documents, run builds and tests, open PRs, produce gate reports, compute KPIs, prepare reconciliations and filing workpapers, set reminders, and draft status notes. Everything they produce is reviewed before it leaves the company.

---

## 7. Capacity rule (one reviewer)

The CEO's review time is the company's bottleneck.

- **Measure** the CEO's review hours per module, including merge review, dossier work and client calls, from the first pilot onward.
- **Monthly commitment cap:** `modules committed per month ≤ (CEO review hours available per month × 0.7) ÷ measured average review hours per module`. The 0.7 factor leaves time for selling, finance and compliance. It is a starting assumption; adjust it with data.
- Do not sign a retainer, SLA or module volume that exceeds the cap. Contracts state throughput in these terms (legal_operating_policy.md §8 item 5).
- Keep the number of concurrent clients within what the CEO can answer within 1 business day.

---

## 8. Monthly, quarterly and annual cadence

### 8.1 Monthly (first 10 days of the month)

1. **Books closed:** bank reconciliation, FX gains and losses, accruals. (CA, with CEO approval.)
2. **GST:** review and approve GSTR-1 (by the 11th) and GSTR-3B (by the 20th), including reverse-charge IGST paid in cash. Approve the RFD-01 refund claim.
3. **FEMA:** EDF for last month's invoices (within 30 days of month end); every receipt has a FIRA and an e-BRC; receivables ageing reviewed against the **9-month** limit.
4. **TDS:** deposit if any is due (old-practice date the 7th; confirm with your CA). Form 145/146 filed before every foreign wire.
5. **AI spend:** spend per pod against the USD 6,500 ceiling; reverse-charge IGST outlay; confirm every API key belongs to a company paid account (no free tier, no consumer plans).
6. **Policy audit (30 min):** sample 10 sent emails against the §4.2 checklist; confirm opt-outs were honoured within 24 hours; confirm client data was deleted within 30 days for closed engagements; check log retention covers 180 days.
7. **KPI review** (§9) and a one-page monthly note to the board file.

### 8.2 Quarterly

- **Advance tax** (15 Jun, 15 Sep, 15 Dec, 15 Mar): re-estimate the year's profit with the CA.
- **TDS quarterly return** if TDS was deducted (dates under the new Act: confirm with your CA).
- **Vendor terms check:** re-read the Anthropic Commercial Terms and privacy retention page and the Gemini API terms for changes. Update client sub-processor notices (30 days' notice for a new provider).
- **Capacity re-plan** (§7) and pricing review.
- **Insurance adequacy:** limits against the largest contract cap and the new clients' jurisdictions.

### 8.3 Half-yearly

- **Board meeting** in each half of the calendar year, at least 90 days apart (s.173(5)). Standing agenda: financials, compliance status against the calendar, contracts signed, incidents, policy breaches, insurance, AI vendor changes, capacity.
- **MSME-1** (30 April and 31 October), if applicable.

### 8.4 Annual

- **1 April:** new LUT before the first export invoice.
- **June:** DPT-3 if applicable; DIR-3 KYC in the KYC year (next for compliant directors: 30 June 2028).
- **By 30 September:** audit complete; tax audit (Form 26) if applicable; AGM.
- **October:** AOC-4 (30 days after the AGM); ITR by 31 October; sec 200 option decision before the first return.
- **November:** MGT-7A (60 days after the AGM).
- **31 December:** GSTR-9 / 9C.
- **January:** full policy review (legal_operating_policy.md §10).
- **Insurance renewal** before the anniversary, with no gap.

---

## 9. KPIs

The targets below are **starting targets set by this manual, not industry benchmarks**. The CEO resets them after 90 days of data.

| Area | KPI | Definition | Starting target |
|---|---|---|---|
| Pipeline | First-touch emails sent | CEO-approved first touches per week | Within the configured caps (at most 15 a day) |
| Pipeline | Positive reply rate | Positive replies ÷ first touches (rolling 4 weeks) | Track; review the approach if under 2% after 300 sends |
| Pipeline | Discovery calls held | Per week | 2 or more |
| Pipeline | Pilots proposed / signed | Count, and conversion rate | Track |
| Pipeline | Pilot-to-retainer conversion | Retainers signed within 30 days of pilot acceptance ÷ accepted pilots | Track |
| Delivery | First-pass parity rate | Modules approved at the first gate run ÷ modules gated | Track; investigate any decline |
| Delivery | Review hours per module | CEO hours ÷ modules accepted | Measure; feeds §7 |
| Delivery | SLA attainment | Work Orders within the contracted turnaround ÷ total | 100% of what was committed |
| Delivery | Model spend per pod | USD a month against the ceiling | At most USD 6,500 |
| Finance | Days sales outstanding | Average days from invoice to receipt | 45 or fewer (contracts are net 30) |
| Finance | Oldest unrealised export invoice | Days since invoice date | Under 120; **never near 270** (9-month FEMA limit) |
| Finance | GST refund outstanding | INR awaiting refund | Falling month on month |
| Finance | Cash runway | Months of fixed costs covered by cash | 6 or more |
| Compliance | Filings on time | On-time filings ÷ filings due | 100% |
| Compliance | Opt-outs honoured within 24 hours | Share of opt-outs | 100% |
| Compliance | Incidents reported to CERT-In within 6 hours | Share of reportable incidents | 100% |
| Compliance | Unapproved AI tool use on client material | Count | 0 |
| Compliance | Claims without substantiation | Count found in the monthly audit | 0 |

---

## 10. Continuity and key-person plan

- **Credentials:** a password manager with emergency access granted to the second director, holding sealed recovery instructions for bank, MCA, GST, DGFT, cloud, AI vendor and GitHub accounts. DSC tokens are stored securely; the second director holds their own DSC.
- **If the CEO is incapacitated:**
  1. The second director notifies clients within 2 business days.
  2. Agents are paused (no outreach, no merges).
  3. Escrowed harnesses, contracts and work in progress are delivered to clients as the contracts require.
  4. Pro-rata refunds are made as the contracts require.
  5. The insurer and the CA/CS are informed.
- **Absence of more than 3 business days:** pause outreach, set out-of-office replies with expected response dates, and tell active clients in advance.

---

## 11. Weekly review template (Friday)

```
Week ending: [date]
Pipeline: first touches [n] · replies [n] (positive [n]) · calls [n] · proposals [n] · signed [n]
Delivery: modules gated [n] · approved first pass [n] · merged by CEO [n] · rejected [n] (reasons)
Capacity: review hours used [h] / available [h] · next week committed [h]
Finance: invoiced USD [x] · received USD [x] · FIRA/e-BRC done [y/n] · oldest receivable [d] days
Compliance (next 14 days): [items from compliance_calendar.md]
Incidents / opt-out issues / policy exceptions: [none | details]
Decisions taken (non-delegable list §6): [list]
Next week's top 3: [1] [2] [3]
```
