# Master Services Agreement — Enterprise Modernization Retainer

**LegacyModern AI · USD 100,000 per month · 12-month initial term · Dedicated delivery pod**

> Template status: commercial terms approved by LegacyModern AI management. Have qualified
> counsel in the governing jurisdiction review each executed copy before signature.

---

## Cover Page

| Item | Value |
|---|---|
| Agreement number | LM-MSA-______ |
| Client legal name | ______________________________ |
| Client address | ______________________________ |
| Provider | LegacyModern AI ("Provider") |
| Effective Date | Date of last signature below |
| Service Commencement Date | ______________________________ |
| Monthly Retainer Fee | USD 100,000 |
| Initial Term | 12 months from the Service Commencement Date |
| Assigned Pod | ______________________________ (from Provider's pod roster) |
| Client Executive Sponsor (role) | ______________________________ |
| Client Technical Owner (role) | ______________________________ |
| Pilot credit applicable | ☐ Yes (SOW no. LM-PoV-______) ☐ No |

This Master Services Agreement ("Agreement") is made between the Client and the Provider. It
consists of this Cover Page, the General Terms (Sections 1–24), and Exhibits A–E. In a
conflict, the order of precedence is: an executed Work Order (only for its specific
deliverables), the Exhibits, the General Terms, the Cover Page.

## General Terms

### 1. Definitions
- **"Pod"** — the dedicated team assigned to the Client under Exhibit A: human personnel plus
  the Provider's AI agent system (ingest, specification, transpilation, parity gate, and
  delivery-management agents).
- **"Module"** — a unit of legacy software (program, package, transaction, or job step set)
  identified in a Work Order.
- **"Work Order"** — a written request in the form of Exhibit C identifying one Module, the
  target service, and acceptance criteria, accepted by both parties' designated owners (email
  acceptance suffices).
- **"Verified Behavioral Contract"** — the executable specification of a Module's behavior,
  verified by the Provider and reviewed by the Client, as described in Exhibit C.
- **"Standard Work Order"** — a Work Order for a Module of up to 5,000 lines of code and up to
  8 business rules. **"Complex Work Order"** — up to 15,000 lines of code or involving shared
  global state or unresolved external dependencies. Larger Modules are split.
- **"Deliverables"** — the work product created specifically for the Client under a Work
  Order: modern service source code, tests, contracts, lineage maps, reports, and documentation.
- **"Provider Materials"** — the Provider's tools, templates, harnesses, prompts, agents,
  libraries, and know-how existing before or developed independently of this Agreement.
- **"Acceptance"** — as defined in Section 7.
- **"Business Day"** — Monday to Friday excluding public holidays at the Client's principal
  place of business.

### 2. Services
The Provider will provide continuous legacy de-risking and re-platforming services through the
Pod: Module analysis and behavioral contract extraction, characterization testing,
re-implementation of Modules as cloud-native services (Go or TypeScript unless otherwise
agreed), dual-engine parity verification, delivery reporting, and the governance in Section 6.
Service scope beyond these (e.g. production operations, data migration execution, UI redesign)
requires a separate statement of work.

### 3. Pod allocation and capacity
The Pod composition and capacity are set out in Exhibit A. The Pod has capacity for up to
**three (3) concurrent Work Orders** and plans approximately **twelve (12) Standard Work Orders
per month** (each Complex Work Order counts as 2.5 Standard). Unused capacity does not roll
over. The Client may reprioritize the Work Order queue at any sprint planning (every 14 days).

### 4. Term
The Initial Term is twelve (12) months from the Service Commencement Date. Thereafter the
Agreement renews for successive twelve (12) month terms unless either party gives written
notice of non-renewal at least sixty (60) days before the end of the current term. Fees for a
renewal term may increase by no more than 5% with ninety (90) days' notice.

### 5. Fees and payment
- **Retainer Fee:** USD 100,000 per month, invoiced monthly in advance on the first day of each
  service month, payable net 30 days.
- **Pilot credit:** if marked on the Cover Page, USD 25,000 is credited against each of the
  first two monthly invoices.
- **Service credits:** credits earned under Exhibit B are applied to the next invoice.
- **Taxes:** fees exclude taxes; the Client pays all applicable taxes other than taxes on the
  Provider's net income, with gross-up for required withholding.
- **Late payment:** amounts unpaid 15 days after notice of non-payment bear interest at 1% per
  month (or the maximum lawful rate, if lower), and the Provider may suspend services after 30
  days' written notice of non-payment without liability; SLA clocks pause during suspension.
- **Expenses:** remote delivery includes no expenses. Pre-approved travel is billed at cost.

### 6. Governance
- **Sprint cadence:** 14-day sprints with planning (day 1), client status calls (days 5 and
  10), and milestone sign-off review (day 13).
- **Weekly status note** with GREEN/AMBER/RED status, delivered Modules, blockers, risks.
- **Monthly steering committee** (Client Executive Sponsor, Client Technical Owner, Provider
  pod lead and delivery director): roadmap, capacity, risks, change requests.
- **Quarterly business review:** modernization progress against the Client's legacy estate
  plan, value delivered, next-quarter roadmap.
- **Milestone sign-off dossier** each sprint, per Section 7.

### 7. Work Orders and Acceptance
- Each Work Order follows the lifecycle in Exhibit C. The SLA clock starts when the Verified
  Behavioral Contract is published for that Work Order.
- **Acceptance criteria** for every Work Order, unless the Work Order states stricter ones:
  (a) 100% parity on the Verified Behavioral Contract; (b) 100% parity on the agreed replay
  dataset (excluding records the legacy system failed to process for infrastructure reasons,
  not exceeding 0.5%); (c) branch coverage of domain and application code ≥ 90%; (d) build and
  test commands documented and passing; (e) p99 latency within the Work Order target
  (default 250 ms).
- The Provider delivers each sprint a sign-off dossier listing Deliverables and evidence. The
  Client has **five (5) Business Days** to accept or reject in writing, identifying the failed
  criterion with specific failing records or assertions. Silence is deemed acceptance. Rejected
  Deliverables are corrected and resubmitted without charge.

### 8. Service levels
The service levels and service credits in Exhibit B apply. Service credits are the Client's
sole monetary remedy for service-level failures, without prejudice to termination rights in
Section 19.2 for chronic failure.

### 9. Zero-Regression Warranty
For **ninety (90) days** after Acceptance of each Deliverable (the "Warranty Period"), the
Provider warrants that the Deliverable behaves identically to the legacy Module for every
behavior captured in the Verified Behavioral Contract and the replay dataset used for
Acceptance, when operated in the environment and configuration documented in the Deliverable.

If the Client reports a reproducible deviation during the Warranty Period, the Provider will,
at no charge: respond within the P1/P2 times in Exhibit B; add assertions reproducing the
deviation to the contract; correct the Deliverable; and re-run the full acceptance suite.

The warranty also covers **behaviors not captured in the contract** where the Client shows the
legacy Module exhibited the behavior in production during the replay window, provided the
deviation is reported during the Warranty Period; the Provider will correct it at no charge
within the P2 resolution target.

The warranty does not cover deviations caused by: modifications not made by the Provider;
operation outside documented configuration; changes in upstream/downstream systems; behaviors
the Client approved as intentional deviations in writing; or legacy defects the Client asked
the Provider to correct.

### 10. Change control
Either party may request changes to scope, priorities, acceptance criteria, or Pod composition
through a written change request. The Provider responds within five (5) Business Days with
impact on schedule, capacity, and fees. Changes bind only when signed by both parties' authorized
representatives. Work Order reprioritization within capacity does not require a change request.

### 11. Client responsibilities
The Client will: provide timely access to source code, documentation, non-production
environments, and repositories; make subject-matter experts available (planned at 4 hours per
Work Order); provide masked replay datasets with masking attestations; respond to questions
within one Business Day; designate an Executive Sponsor and Technical Owner with decision
authority; and maintain the environments the Provider needs to run legacy test executions. SLA
clocks pause for documented delays in Client responsibilities.

### 12. Personnel
- The Provider assigns the Pod per Exhibit A, with named key personnel (pod lead and senior
  engineers) and will not reassign key personnel without 30 days' notice except for departure,
  illness, or cause; replacements will have equivalent qualifications and a handover of at
  least five Business Days where practicable.
- The Client may request removal of any Provider personnel for reasonable, lawful cause; the
  Provider will replace them promptly.
- Provider personnel undergo background checks consistent with the Client's financial-services
  or public-sector requirements as notified in writing before commencement.
- **Non-solicitation:** during the term and for twelve (12) months after, neither party will
  solicit for employment the other's personnel who worked under this Agreement, excluding
  general advertisements and individuals who approach on their own initiative.

### 13. Intellectual property
- **Deliverables:** upon payment of the fees for the month in which a Deliverable is accepted,
  the Client owns all right, title, and interest in the Deliverables, and the Provider assigns
  them to the Client. The Provider will execute documents reasonably required to perfect the
  assignment.
- **Provider Materials:** the Provider retains all rights in Provider Materials. To the extent
  Provider Materials are incorporated into Deliverables, the Provider grants the Client a
  perpetual, irrevocable, worldwide, royalty-free, non-exclusive, transferable (with the
  Deliverables) license to use, copy, modify, and create derivative works of them as part of
  the Deliverables.
- **Client Materials:** the Client retains all rights in its source code, data, documentation,
  and systems, and grants the Provider a non-exclusive license to use them solely to perform
  this Agreement.
- **Open source:** the Provider will not incorporate open-source components under copyleft
  licenses (e.g. GPL, AGPL, LGPL where statically linked) into Deliverables without the Client's
  written consent, and will list all third-party components and licenses in each Deliverable.
- **Residual knowledge:** each party may use general skills and know-how retained in unaided
  memory, without using or disclosing the other party's Confidential Information or IP.

### 14. Confidentiality
Each party will hold the other's Confidential Information in confidence using at least the care
it uses for its own similar information and no less than reasonable care, use it only to
perform or receive the services, and disclose it only to employees, contractors, and advisers
with a need to know who are bound by written obligations at least as protective. Source code,
security information, and personal data are Confidential Information regardless of marking.
Exclusions: information public through no fault of the recipient, already known without
restriction, independently developed, or rightfully received from a third party. Compelled
disclosure is permitted with prompt notice (where lawful) and cooperation to seek protective
treatment. Obligations survive five (5) years after termination, and indefinitely for source
code, trade secrets, and personal data. On termination each party returns or destroys the
other's Confidential Information and certifies destruction on request, subject to legal
retention requirements and routine backups (which remain protected).

### 15. Security and data protection
- The Provider maintains an information-security program aligned to SOC 2 Type II and ISO/IEC
  27001 controls, including MFA, least-privilege access, encrypted devices, secure SDLC,
  vulnerability management, and incident response. The Provider provides its latest SOC 2
  report (or bridge letter) and completes the Client's reasonable security questionnaire
  annually.
- Production data is processed only in masked form unless a Data Processing Addendum (Exhibit
  D) is executed and the Client authorizes otherwise in writing.
- The Provider notifies the Client of any security incident affecting Client data without undue
  delay and in any event within **48 hours** of confirmation, and cooperates in investigation
  and remediation.
- Work in Client environments follows the Client's written access policies.

### 16. AI governance
The Provider's AI usage is described in Exhibit E. The Provider will: use AI models only under
commercial terms that prohibit training on Client content; not submit unmasked personal data or
credentials to any AI model; keep human engineers accountable for every Deliverable; keep
records of models and versions used per Work Order; and notify the Client 30 days before adding
a new AI model provider that processes Client source code, giving the Client the right to object
on reasonable grounds.

### 17. Warranties
Each party warrants it has authority to enter this Agreement. The Provider warrants that
services will be performed in a professional and workmanlike manner consistent with industry
standards, by appropriately qualified personnel; that Deliverables will conform to their
acceptance criteria at Acceptance; that it will comply with applicable laws; and that
Deliverables will not, to its knowledge, contain malicious code. EXCEPT AS EXPRESSLY STATED IN
THIS AGREEMENT, EACH PARTY DISCLAIMS ALL OTHER WARRANTIES, EXPRESS OR IMPLIED, INCLUDING
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

### 18. Indemnities
- **By the Provider:** the Provider will defend the Client against third-party claims alleging
  that Deliverables or Provider Materials infringe or misappropriate intellectual property
  rights, and pay damages and costs finally awarded or agreed in settlement. If such a claim is
  made or likely, the Provider may procure the right to continue use, modify the item to be
  non-infringing with equivalent behavior, or, if neither is commercially reasonable, refund
  fees paid for the affected Deliverable. Exclusions: Client Materials, modifications not made
  by the Provider, and combinations not supplied or specified by the Provider.
- **By the Client:** the Client will defend the Provider against third-party claims arising from
  Client Materials or the Client's use of Deliverables in violation of law.
- **Procedure:** prompt written notice, sole control of defense and settlement by the
  indemnifying party (no admission of fault by the indemnified party without consent), and
  reasonable cooperation at the indemnifying party's expense.

### 19. Termination
- **19.1 For cause:** either party may terminate on written notice if the other materially
  breaches and fails to cure within thirty (30) days of notice (ten (10) days for non-payment),
  or becomes insolvent.
- **19.2 Chronic SLA failure:** the Client may terminate on thirty (30) days' notice if the
  Provider misses the Work Order Turnaround SLA in any three (3) months within a rolling six (6)
  month period, without early-termination fee.
- **19.3 For convenience:** after the sixth (6th) service month, the Client may terminate for
  convenience on sixty (60) days' written notice, paying fees through the notice period plus an
  early-termination fee equal to one (1) Monthly Retainer Fee.
- **19.4 Effect:** on termination the Client pays fees accrued through the effective date (less
  credits); the Provider delivers all Deliverables and work in progress for which fees have been
  paid; licenses to paid-for Deliverables survive.
- **19.5 Transition assistance:** for up to sixty (60) days after termination (other than for
  the Client's non-payment), the Provider provides reasonable knowledge transfer and handover
  of repositories, contracts, harnesses, and documentation, at the Exhibit A rate card for
  effort beyond 40 hours.

### 20. Limitation of liability
EXCEPT FOR EXCLUDED CLAIMS: (A) NEITHER PARTY IS LIABLE FOR ANY INDIRECT, INCIDENTAL,
SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, REVENUE, OR
GOODWILL, HOWEVER CAUSED; AND (B) EACH PARTY'S TOTAL CUMULATIVE LIABILITY ARISING OUT OF THIS
AGREEMENT IS LIMITED TO THE FEES PAID AND PAYABLE BY THE CLIENT IN THE TWELVE (12) MONTHS
PRECEDING THE EVENT GIVING RISE TO LIABILITY. "EXCLUDED CLAIMS" MEANS: A PARTY'S INDEMNITY
OBLIGATIONS; BREACH OF SECTION 14 (CONFIDENTIALITY) OR SECTION 15 (SECURITY AND DATA
PROTECTION), WHICH ARE SUBJECT INSTEAD TO A CAP OF THREE (3) TIMES THE CAP IN (B); THE CLIENT'S
PAYMENT OBLIGATIONS; AND A PARTY'S GROSS NEGLIGENCE, FRAUD, OR WILLFUL MISCONDUCT.

### 21. Insurance
During the term the Provider maintains, with insurers rated A- or better: technology errors and
omissions (professional liability) of USD 5,000,000 per claim; cyber liability of USD 5,000,000
per claim; commercial general liability of USD 2,000,000 per occurrence; and workers'
compensation as required by law. Certificates are provided on request.

### 22. Compliance
Each party complies with applicable anti-corruption, export-control, sanctions, and employment
laws. The Provider will support the Client's regulatory obligations (including outsourcing and
operational-resilience requirements of financial regulators) by providing audit information,
access to relevant records on reasonable notice not more than once per year (or more often
where required by a regulator), and cooperation with regulator inquiries.

### 23. Dispute resolution
The parties will first escalate any dispute to the Client Executive Sponsor and the Provider's
CEO for good-faith negotiation for thirty (30) days. Either party may then pursue remedies in
court. Either party may seek injunctive relief at any time to protect Confidential Information
or IP.

### 24. General
Independent contractors. Assignment only with consent, except to a successor in a merger or sale
of substantially all relevant assets with notice. Subcontractors only with the Client's prior
written consent (not unreasonably withheld); the Provider remains responsible for them. Force
majeure excuses delays from events beyond reasonable control (excluding payment obligations);
either party may terminate if force majeure continues for more than sixty (60) days. Notices in
writing to the Cover Page addresses. Governing law: the State of Delaware, USA, excluding
conflict-of-law rules; exclusive jurisdiction of the state and federal courts in Wilmington,
Delaware. Entire agreement; amendments only in signed writing; no waiver by delay; severability;
counterparts and electronic signatures valid; Sections 5 (accrued fees), 9 (for accepted
Deliverables during the Warranty Period), 13, 14, 18, 19.4–19.5, 20, 23, and 24 survive.

---

## Exhibit A — Pod Allocation and Rate Card

| Role | Allocation | Responsibilities |
|---|---|---|
| Pod Lead | 0.5 FTE | Client relationship, sprint planning, escalations, sign-off dossiers |
| Senior Modernization Engineer | 2.0 FTE | Supervise AI agents, review all code, liaise with Client SMEs |
| Parity QA Engineer | 0.5 FTE | Replay datasets, dual-engine harness, acceptance evidence |
| Delivery Director | As needed | Steering committee, escalations, QBRs |
| AI agent system | Continuous | Legacy ingest (Gemini long-context), specification audit, transpilation (Claude Code), parity gate, delivery management |

Capacity: up to 3 concurrent Work Orders; planned 12 Standard Work Order equivalents per month.

Rate card for out-of-scope or transition work: Pod Lead USD 375/hour; Senior Modernization
Engineer USD 300/hour; Parity QA Engineer USD 250/hour. Billed monthly in arrears, only when
pre-approved in writing.

## Exhibit B — Service Levels and Service Credits

| Service level | Target | Measurement |
|---|---|---|
| Work Order Turnaround — Standard | **72 hours** from Verified Behavioral Contract publication to parity-gate approval of the pull request | Per Work Order, SLA clock paused only for documented Client-responsibility delays |
| Work Order Turnaround — Complex | 120 hours | As above |
| Parity at Acceptance | 100% (contract and replay) | Per Deliverable |
| Defect response — P1 (production impact from a Deliverable) | 4 hours, 24×7 | From Client report to engineer engaged |
| Defect resolution — P1 | Workaround 24 hours; fix 2 Business Days | |
| Defect response — P2 (behavioral deviation, no production outage) | 1 Business Day | |
| Defect resolution — P2 | 5 Business Days | |
| Weekly status note | Every week by end of the 5th Business Day | |
| Sign-off dossier | Every sprint by day 12 | |

**Service credits** (percentage of the Monthly Retainer Fee for the month in which the failure
occurred):

| Failure | Credit |
|---|---|
| Each Standard/Complex Work Order delivered late against its turnaround target | 2% per Work Order |
| Each P1 resolution target missed | 3% per incident |
| Each P2 resolution target missed | 1% per incident |
| Weekly status note or dossier missed | 0.5% per occurrence |

Total service credits in any month are capped at **15%** of that month's Monthly Retainer Fee.
The Client must claim credits within 60 days of the month-end; the Provider's dossier computes
them automatically.

## Exhibit C — Work Order Template and Lifecycle

**Work Order fields:** Work Order ID (WO-YYYY-NNNNNN); Module ID (also the branch name
`modernize/<module-id>`); legacy source location and commit; Module size (lines, business rules);
classification (Standard/Complex); target language and service name; target repository;
replay dataset location and window; acceptance criteria (defaults per Section 7); p99 latency
target; Client SME (role); priority.

**Lifecycle:** draft → spec_published (Verified Behavioral Contract published; SLA clock
starts) → characterization_in_progress → transpilation_in_progress → parity_review → approved
(SLA clock stops) or rejected (clock continues) → delivered (included in an accepted dossier).

## Exhibit D — Data Processing Addendum (summary of required terms)

When personal data is processed, the parties execute the Provider's DPA, which includes:
processing only on documented instructions; confidentiality of personnel; security measures per
Section 15; sub-processor list and 30-day objection right; assistance with data-subject requests
and impact assessments; breach notification within 48 hours; deletion or return at end of
services; audit rights; and, for international transfers, the EU Standard Contractual Clauses
and UK Addendum as applicable.

## Exhibit E — AI Usage Disclosure

| Function | Model family | Provider | Data processed | Retention / training |
|---|---|---|---|---|
| Legacy source ingest and behavioral extraction | Gemini (long-context) | Google | Client legacy source code | No training on Client content under commercial API terms; retention per provider's commercial terms, minimized where available |
| Specification audit, transpilation, parity review, delivery management | Claude (Opus, Sonnet, Haiku families) | Anthropic | Client source code, contracts, masked replay samples | No training on Client content under commercial terms; zero-data-retention arrangements used where available |
| Outreach and administrative tasks | Claude | Anthropic | No Client data | — |

Human engineers review every Deliverable. Unmasked personal data and credentials are never
submitted to any model. The Provider records the model and version used for each Work Order and
reports them in the sign-off dossier on request.

---

## Signatures

**Client:** ______________________________

Name: ______________________________ Title: ______________________________

Signature: ______________________________ Date: ______________________________

**LegacyModern AI:**

Name: ______________________________ Title: ______________________________

Signature: ______________________________ Date: ______________________________
