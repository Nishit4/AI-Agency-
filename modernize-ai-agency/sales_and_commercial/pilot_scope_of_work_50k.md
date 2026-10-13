# Statement of Work — Paid Assessment and 14-Day Proof-of-Value Pilot

**[Provider legal name] Private Limited, trading as LegacyModern AI**
**Legacy Module De-Risking and Re-Platforming, delivered by supervised AI agents**

| Option | Scope | Fee | Duration |
|---|---|---|---|
| **A. Paid Assessment** (optional, lower-risk first step) | One legacy program, up to 5,000 lines: behavioral-contract extraction + parity demonstration | Set in the Order Form | 10 Provider Business Days |
| **B. Proof-of-Value Pilot** | One legacy module, up to 50,000 lines: contract, characterization tests, modern service, full parity proof | USD 50,000 fixed | 14 calendar days (up to 20,000 lines) or 21 calendar days (20,001–50,000 lines) |

> **Drafting notes for the CEO — delete this box before sending.**
> 1. Do not send or sign this document until every item in the "Pre-signature checklist" in
>    `CHANGES.md` is done. Most importantly: the company is incorporated and has filed
>    INC-20A, has a GSTIN and a current-year LUT, has a USD-receiving account at an AD
>    Category-I bank, and has bound professional-indemnity/cyber insurance.
> 2. Have this template reviewed by Indian counsel and by counsel in the governing-law
>    jurisdiction you choose in the Order Form before the first signature.
> 3. Section 3 (Delivery Model and AI Disclosure) must be shown to the Client **before**
>    signature, and the acknowledgement box in the Order Form must be ticked by the Client.
> 4. Every square-bracketed item is a field you set. Never send a bracket.

---

## Order Form

### Parties

| Item | Value |
|---|---|
| SOW number | LM-SOW-______ |
| Option selected | ☐ A. Paid Assessment ☐ B. Proof-of-Value Pilot |
| **Provider** | [Provider legal name] Private Limited, a company incorporated in India under the Companies Act, 2013, trading as "LegacyModern AI" (the "Provider") |
| Provider CIN / PAN / GSTIN | __________ / __________ / __________ |
| Provider registered office | ______________________________, India |
| Provider Importer-Exporter Code (IEC) | __________ |
| Provider LUT (GST RFD-11) reference and financial year | ARN __________ for FY 20__–__ |
| Accountable Reviewer and signatory | [Full name], Managing Director and Chief Executive Officer |
| Provider notice email | ______________________________ |
| Client legal name | ______________________________ (the contracting entity must be the entity that pays) |
| Client country of incorporation and tax residence | ______________________________ |
| Client address (outside India, unless Client is an Indian entity) | ______________________________ |
| Client technical owner (role) | ______________________________ |
| Client executive sponsor (role) | ______________________________ |
| Client notice email | ______________________________ |
| Effective Date | Date of last signature below |

### Option A — Paid Assessment (complete only if Option A is selected)

| Item | Value |
|---|---|
| Assessed Program | ______________________________ (program name and repository path) |
| Assessed Program size (measured) | __________ lines (must be ≤ 5,000) |
| Target language for the parity demonstration | ☐ Go 1.22+ ☐ TypeScript (Node 20+) |
| Sample Replay Dataset size | at least __________ masked records (default 1,000) ☐ None — demonstration on contract assertions only |
| **Assessment Fee** | **USD __________** (set by the Provider's CEO) |
| Assessment credit against a Pilot | ☐ Yes — 100% of the Assessment Fee credited against the Pilot fee if a Pilot SOW is signed within 30 days after delivery of A4 ☐ No |
| Kickoff Date | ______________________________ |

### Option B — Proof-of-Value Pilot (complete only if Option B is selected)

| Item | Value |
|---|---|
| Pilot Module | ______________________________ (program/package names and repository path) |
| Pilot Module size (measured) | __________ lines (must be ≤ 50,000) |
| Pilot schedule | ☐ Standard — 14 calendar days (module ≤ 20,000 lines) ☐ Extended — 21 calendar days (module 20,001–50,000 lines) |
| Target language | ☐ Go 1.22+ ☐ TypeScript (Node 20+) |
| Kickoff Date | ______________________________ (subject to Section 5.3, one Pilot at a time) |
| Assessment credit applied | ☐ Yes (SOW no. LM-SOW-______, USD __________) ☐ No |

### Commercial, tax and legal selections

| Item | Value |
|---|---|
| Currency | US dollars (USD) |
| Client location for tax purposes | ☐ Outside India (export of services; Section 13.2) ☐ India (Section 13.3) |
| Payment route | ☐ SWIFT wire to the Provider's account at an Authorised Dealer Category-I bank in India (required for any invoice above INR 25,00,000 equivalent) ☐ RBI-authorised cross-border payment aggregator named on the invoice (only for invoices up to INR 25,00,000 equivalent) |
| Withholding-tax treatment (Section 13.4) | ☐ Gross-up (default) ☐ Net payment with official withholding certificate |
| Provider support hours | 10:00–19:00 India Standard Time (IST) on Provider Business Days, plus an overlap window of __________ (up to 2 hours) on Provider Business Days: __________ (Client local time) |
| Provider holiday calendar | Attached / link: __________ |
| Governing law and disputes (Section 22) | ☐ 1. Law of England and Wales; SIAC arbitration seated in Singapore (default for clients outside India) ☐ 2. Law of Singapore; SIAC arbitration seated in Singapore ☐ 3. Law of the State of New York; SIAC arbitration seated in Singapore ☐ 4. Law of India; MCIA arbitration seated in Mumbai (Indian clients) |
| **Provider insurance** (Section 18) | Insurer: __________ · Policy: technology professional indemnity / errors and omissions including network-security and privacy liability · Limit: __________ per claim and in aggregate · Territory and jurisdiction: worldwide including USA and Canada ☐ Yes ☐ No · Retroactive date: __________ · Expiry: __________ |
| Optional: background check of the Accountable Reviewer | ☐ Requested — Client conducts at its cost, with the Accountable Reviewer's consent and subject to applicable law ☐ Not requested |

### Client acknowledgement of the delivery model

☐ **The Client confirms that before signing it received and read Section 3 (Delivery Model and
AI Disclosure). It understands that the Services are performed by AI systems operated by the
Provider, that the Provider's CEO is the only human who works on the Services, and that
acceptance is decided by the objective evidence in Section 7.**

---

This Statement of Work ("SOW") is entered into between the Client and the Provider. If a Master
Services Agreement between the parties is in force, this SOW is governed by it and the MSA
prevails except where this SOW expressly states otherwise. If no MSA is in force, Sections 1–24
of this SOW govern.

## 1. Background and purpose

The Client operates business-critical software written in legacy languages (such as COBOL,
PL/I, PL/SQL, JCL, RPG or legacy Java). The Provider extracts a legacy program's behavior into an
executable behavioral contract, re-implements it as a cloud-native service, and proves
behavioral equivalence through automated characterization tests and replay of masked
historical production data, without changing the legacy system.

- **Option A (Paid Assessment)** lets the Client test that method on one small program at low
  cost and low risk before committing to a Pilot.
- **Option B (Pilot)** demonstrates the full method on one module selected by the Client, with
  the Parity Guarantee in Section 8.

## 2. Definitions

- **"Accountable Reviewer"** — the Provider's Managing Director and CEO named in the Order Form.
- **"AI Systems"** — the third-party AI models and services listed in Schedule 1 and operated by
  the Provider to perform the Services.
- **"Assessed Program"** — the single legacy program (with its copybooks/includes) identified in
  the Order Form for Option A, of no more than 5,000 lines.
- **"Pilot Module"** — the legacy program(s), copybooks, packages and job steps identified in the
  Order Form for Option B, of no more than 50,000 lines.
- **"lines"** — physical lines of source code excluding blank lines and comment-only lines, as
  measured by the Provider's line counter at kickoff. The Client may witness the count.
- **"Behavioral Contract"** — a JSON document conforming to the Provider's behavioral contract
  schema that lists business rules and executable assertions (inputs, expected outputs, expected
  errors and expected state transitions), each traced to legacy source lines.
- **"Verified Behavioral Contract"** — a Behavioral Contract that the Accountable Reviewer has
  reviewed under Section 3.3 and the Client's SME has reviewed, with all review flags resolved.
- **"Modern Service"** — the Go or TypeScript source code, tests and build files produced under
  this SOW that implement the legacy behavior.
- **"Replay Dataset"** — historical production input/output records for the Pilot Module, masked
  by the Client, of at least 10,000 records or 30 days of activity (whichever is smaller),
  delivered with a written masking attestation. For Option A, the "Sample Replay Dataset" is the
  smaller masked set stated in the Order Form.
- **"Acceptance Test Suite"** — (i) every assertion in the Verified Behavioral Contract and
  (ii) the Replay Dataset, compared under the rules in Section 7.2.
- **"Parity"** — for each assertion or record, the Modern Service produces the same outputs,
  error codes and state changes as the legacy code under the comparison rules in Section 7.2.
  Parity is measured only against the Acceptance Test Suite, on the delivered commit, in the
  environment documented in the Deliverables.
- **"Business Day"** — Monday to Friday excluding public holidays at the Client's principal
  place of business. Used for the Client's obligations.
- **"Provider Business Day"** — Monday to Friday excluding the holidays in the Provider's holiday
  calendar referenced in the Order Form. Used for the Provider's response and turnaround times.
- **"Support Hours"** — the Provider support hours stated in the Order Form.
- **"Provider Materials"** — the Provider's pre-existing or independently developed tools,
  including its MCP specification bridge, characterization harness, parity gate, service
  templates, agent prompts and know-how.

## 3. Delivery Model and AI Disclosure

**3.1 Who performs the Services.** The Services are performed by AI Systems operated by the
Provider, using the Provider Materials:

- **Legacy source ingest and behavioral extraction:** Google Gemini models (currently
  [model name and version]) through Google's paid Gemini API, billed to a Google Cloud project
  with active billing.
- **Specification audit, characterization-test writing, transpilation into Go or TypeScript,
  parity testing and delivery reporting:** Anthropic Claude models (currently [model names and
  versions]) through Claude Code, using an Anthropic API key or an Anthropic Team/Enterprise
  account under Anthropic's Commercial Terms.

**3.2 The only human.** The Accountable Reviewer is the only human who works on the Services.
The Accountable Reviewer supervises the AI Systems, attends all meetings with the Client,
resolves open questions with the Client's SME, approves each Deliverable before it is
submitted, signs for the Provider, and is accountable for the Deliverables on the Provider's
behalf. The Provider has no other personnel assigned to this SOW and will not engage any human
subcontractor without the Client's prior written consent.

**3.3 What human review covers.** Before a Deliverable is submitted, the Accountable Reviewer:

1. reviews every business rule in the Behavioral Contract against its cited legacy source
   lines;
2. reviews every review flag raised by the AI Systems, and its resolution with the Client's
   SME;
3. reviews the gate reports for the Deliverable (contract parity, replay, branch coverage,
   static analysis, dependency and secret scans); and
4. reviews generated code on a risk basis: all code implementing monetary calculations,
   rounding, validation order and state transitions, and a sample of the remaining code.

The Provider does **not** represent that a human has read every line of generated code.
Acceptance does not depend on human review. It depends on the objective evidence in Section 7.

**3.4 Objective evidence.** Parity is shown by the Provider's characterization harness and by
dual-engine replay: the legacy code (or its recorded outputs) and the Modern Service are run on
the same inputs and their results compared under Section 7.2. Every report states the commit,
the commands used and the results per assertion and per record, so the Client can re-run it.

**3.5 Model accounts and data terms.** The Provider processes Client Materials only through
paid or commercial accounts whose terms (a) prohibit the AI provider from training models on
the submitted content (Anthropic Commercial Terms) or (b) state that prompts and responses are
not used to improve the provider's products (Google paid Gemini API services). The Provider
never processes Client Materials through a consumer plan (such as a personal Claude Free, Pro
or Max login) or through Google's unpaid Gemini API services. Retention by each AI provider is
described in Schedule 1. The Provider does not submit unmasked personal data, secrets or
credentials to any AI System.

**3.6 Model changes.** The Provider may change the model version used within the providers
listed in Schedule 1 and will record the model and version used for each Deliverable. The
Provider will give the Client at least 30 days' written notice before adding a new AI provider
that would process Client Materials. If the Client objects on reasonable grounds and the
Provider cannot continue without that provider, either party may terminate the affected work
and the Client receives a pro-rata refund of fees paid for undelivered work.

**3.7 Limits of AI.** AI Systems can make mistakes, including plausible but incorrect output.
That is why every Deliverable must pass the Acceptance Test Suite. The Provider does not
warrant behavior that the Acceptance Test Suite does not test.

## 4. Option A — Paid Assessment

### 4.1 Services
The Provider will:

1. ingest and analyze the Assessed Program and its copybooks/includes;
2. extract the Behavioral Contract and verify it under Section 3.3 with up to one 60-minute SME
   session;
3. write characterization tests from the Verified Behavioral Contract;
4. build a parity demonstration: a working Go or TypeScript implementation of the Assessed
   Program run against the Verified Behavioral Contract and, if provided, the Sample Replay
   Dataset; and
5. deliver a written assessment with a fixed-price quotation for a Pilot or Work Orders.

### 4.2 Deliverables

| ID | Deliverable | Format | Due (Provider Business Days after kickoff and receipt of source) |
|---|---|---|---|
| A1 | Program Analysis Report | Markdown/PDF + JSON | Day 4 |
| A2 | Verified Behavioral Contract | JSON (schema-valid) | Day 6 |
| A3 | Characterization tests and parity-demonstration source | Source in Client repository, branch `assess/<program-id>` | Day 9 |
| A4 | Parity Demonstration Report and modernization assessment (estate fit, risks, quotation) | PDF + JSON | Day 10 |

### 4.3 Outcome and remedy
The Parity Demonstration Report states the parity result honestly, including every failing
assertion or record and its likely cause. The Paid Assessment does not carry the Parity
Guarantee in Section 8. If A1–A4 are not delivered within 5 Provider Business Days after their
due dates (adjusted for Client delays), the Client may terminate Option A and the Provider will
refund the Assessment Fee less a pro-rata amount for Deliverables already delivered.

### 4.4 Fee
The Assessment Fee in the Order Form is invoiced on the Effective Date and payable before
kickoff. If the Order Form provides for an Assessment credit, it is applied against the first
Pilot invoice.

## 5. Option B — Proof-of-Value Pilot

### 5.1 Services
The Provider will:

1. **Ingest and analyze** the Pilot Module and produce a module analysis (structure, data
   layouts including packed-decimal fields, dependencies, data flows, global state, risks).
2. **Extract and verify** the Behavioral Contract: business rules and assertions covering
   nominal, boundary, error and state-transition behavior, with line-level lineage, verified
   under Section 3.3 with the Client's SME.
3. **Write characterization tests** from the Verified Behavioral Contract before writing any
   production code.
4. **Build the Modern Service** in the target language using a clean architecture (domain,
   application, adapters, transport) with structured logging, health and readiness probes,
   graceful shutdown and exact decimal arithmetic.
5. **Prove Parity** by running the Acceptance Test Suite, including dual-engine replay of the
   Replay Dataset, and report results.
6. **Deliver** the Deliverables in Section 5.2 and a 60-minute executive readout presented by
   the Accountable Reviewer.

### 5.2 Deliverables

| ID | Deliverable | Format | Due (Standard / Extended schedule, calendar day) |
|---|---|---|---|
| D1 | Module Analysis Report | Markdown/PDF + JSON | Day 4 / Day 6 |
| D2 | Verified Behavioral Contract | JSON (schema-valid) | Day 6 / Day 9 |
| D3 | Characterization Test Suite | Source in Client repository | Day 7 / Day 10 |
| D4 | Modern Service source, build files, `LINEAGE.md` | Source in Client repository, branch `modernize/<module-id>` | Day 12 / Day 18 |
| D5 | Parity Evidence Pack: contract parity report, replay report, coverage report, gate review, model and version log | JSON + PDF | Day 13 / Day 20 |
| D6 | Executive readout and modernization roadmap for the remaining estate | Slides/PDF | Day 14 / Day 21 |

Where a due day falls on a day that is not a Provider Business Day, the Deliverable is due on the
next Provider Business Day.

### 5.3 Timeline and capacity
The Provider runs one Pilot at a time so that the Accountable Reviewer can meet this schedule.
The Kickoff Date in the Order Form is a reserved slot. If Day 0 items are not ready by the Kickoff
Date, the Provider may move the Pilot to its next available slot.

| Standard day | Extended day | Activity | Client participation |
|---|---|---|---|
| 0 | 0 | Access provisioning, repository access, SME scheduling, Replay Dataset extraction begins | Required |
| 1 | 1 | Kickoff (90 min, within Support Hours or the overlap window); source ingest | Technical owner, SME |
| 2–4 | 2–6 | Analysis; contract extraction; SME Q&A (≤ 2 sessions of 60 min) | SME |
| 5–6 | 7–9 | Contract review and verification; D1 and D2 delivered | SME review (≤ 2 h) |
| 7 | 10 | Characterization tests committed (D3) | — |
| 8–12 | 11–18 | Modern Service build; local parity loop; D4 delivered | SME on call (≤ 2 h) |
| 12–13 | 18–20 | Dual-engine replay; parity gate; D5 delivered | Replay Dataset available by Day 8 (Standard) / Day 12 (Extended) |
| 14 | 21 | Executive readout (D6); acceptance window opens | Executive sponsor |

### 5.4 Out of scope
Unless added by a written change order: production deployment and cutover; data migration;
modules outside the Pilot Module (other than read-only analysis of interfaces it calls);
user-interface redesign; performance tuning beyond the acceptance latency target; remediation of
defects in the legacy code; procurement of Client infrastructure or licenses; security
penetration testing of the Client environment; on-site work; and support outside Support Hours.

## 6. Client responsibilities

The Client will, at its cost and by the dates in Sections 4 and 5:

1. provide read access to the source and its copybooks/includes, and a Git repository (or
   branch) where the Provider can commit Deliverables;
2. make a subject-matter expert available for up to 8 hours in total over a Pilot (1 hour for a
   Paid Assessment), during Support Hours or the overlap window;
3. provide the Replay Dataset (or Sample Replay Dataset), masked so that it contains no direct
   identifiers and no sensitive personal data, health information, payment-card data, secrets
   or credentials, with a written masking attestation;
4. where the Replay Dataset lacks legacy outputs, provide access to a non-production
   environment where the legacy code can be executed;
5. designate a technical owner empowered to answer questions within one Business Day; and
6. keep the legacy system in operation and available for rollback; the Provider does not
   operate any Client production system.

Delays in Client responsibilities extend the timeline day-for-day and do not breach this SOW.

## 7. Acceptance (Option B)

### 7.1 Acceptance criteria
The Pilot is accepted when all of the following are met on the delivered commit:

1. **100% Parity** on every assertion of the Verified Behavioral Contract.
2. **100% Parity** on the Replay Dataset, excluding only records for which the legacy system
   itself produced no output for infrastructure reasons (not exceeding 0.5% of records).
3. Branch coverage of the Modern Service's domain and application code of at least 90%.
4. The Modern Service builds and its tests pass with the commands documented in D4.
5. p99 latency of the Modern Service on the Replay Dataset at 32 concurrent workers is at or
   below 250 milliseconds on infrastructure of the class agreed at kickoff.

### 7.2 Comparison rules
Numeric values are compared as exact decimals at the legacy field's scale; fixed-width text
fields may be compared with trailing spaces removed where the legacy field is space-padded;
outputs must contain exactly the expected fields; expected errors must match by error code and
legacy return code; every expected state change must occur and no other state may change.

### 7.3 Procedure
The Provider delivers D5 and gives notice of readiness. The Client has **five (5) Business Days**
to run or witness the Acceptance Test Suite and either accept in writing or reject in writing,
identifying the specific criterion not met and the failing records or assertions. If the Client
does neither within that period, the Pilot is deemed accepted. Use of the Modern Service in
production constitutes acceptance.

## 8. Parity Guarantee (Option B)

If the Modern Service does not meet the criteria in Sections 7.1(1) and 7.1(2) at the end of the
Pilot, the Provider will continue work at no additional charge for up to **ten (10) Provider
Business Days** to cure. If Parity is still not achieved after the cure period, then, as the
Client's **sole and exclusive remedy** for failure to meet the acceptance criteria:

- the second installment (Section 13.1) is **not payable**;
- the Provider will **refund 50% of the first installment** (USD 12,500) within 30 days; and
- the Client retains a perpetual license to use the Deliverables delivered to date for internal
  purposes.

The Parity Guarantee is a promise about the Acceptance Test Suite only. It is not a promise that
the Modern Service will behave identically to the legacy system in production for inputs the
Acceptance Test Suite does not contain.

The Parity Guarantee does not apply to the extent failure results from: the Client not providing
the access, SME time or Replay Dataset by the dates in Section 5 (in which case dates move
day-for-day); legacy behavior that is non-deterministic (for example, it depends on wall-clock
time or unordered reads) where the Client does not supply the deciding inputs; or changes to the
Pilot Module made by the Client after kickoff.

## 9. Continuity

**9.1 Key-person event.** Because the Accountable Reviewer is the only human performing the
Services, the Provider will notify the Client within one Provider Business Day if the
Accountable Reviewer is, or expects to be, unable to work for more than two consecutive Provider
Business Days. If the resulting delay exceeds five (5) Provider Business Days, the Client may
terminate this SOW on written notice and the Provider will refund the fees paid for Deliverables
not yet delivered (pro rata over the schedule), and the Client keeps every Deliverable and work
in progress already committed to its repository.

**9.2 Work in the Client's repository.** The Provider commits Deliverables and work in progress
to the Client's repository at least at each Deliverable due date, so the Client always holds the
latest state of the work.

## 10. Use of AI and Client data

The rules in Section 3 apply. In addition: Client source code is processed only to perform this
SOW; production data is never sent to AI providers; only masked data is processed, and only in
the environment agreed at kickoff.

## 11. Intellectual property

- **Deliverables.** Upon payment of fees due, the Client owns the Modern Service source code,
  tests, Behavioral Contract, reports and other Deliverables created specifically for the Client
  under this SOW, and the Provider assigns to the Client all rights the Provider has in them. The
  Client acknowledges that the copyright status of material generated by AI Systems may differ
  between jurisdictions; the Provider assigns whatever rights it holds and warrants that it has
  not granted those rights to anyone else.
- **AI provider terms.** Under Anthropic's Commercial Terms the customer owns the outputs it
  receives; the Provider passes that ownership to the Client under this Section.
- **Provider Materials.** The Provider retains all rights in Provider Materials. To the extent
  Provider Materials are embedded in Deliverables, the Provider grants the Client a perpetual,
  irrevocable, worldwide, royalty-free, non-exclusive license to use, copy and modify them as part
  of the Deliverables for the Client's internal business purposes.
- **Client Materials.** The Client retains all rights in its source code, data and documents, and
  grants the Provider a limited license to use them solely to perform this SOW.
- **General know-how.** Nothing prevents the Provider from using general skills and techniques
  learned, provided it does not disclose Client Confidential Information.

## 12. Confidentiality

Each party will protect the other's non-public information disclosed under this SOW with at least
reasonable care, use it only for this SOW, and disclose it only to its officers, professional
advisers and the AI Systems and sub-processors listed in Schedule 1, each bound by obligations at
least as protective. Obligations survive three (3) years after termination, and indefinitely for
source code and trade secrets. Standard exclusions apply for information that is public through no
fault of the recipient, already known, independently developed, or rightfully received from a third
party. Compelled disclosure is permitted with prompt notice where lawful.

## 13. Fees, invoicing and taxes

### 13.1 Fees

**Option A:** the Assessment Fee stated in the Order Form, invoiced on the Effective Date.

**Option B:**

| Installment | Amount | Invoiced |
|---|---|---|
| 1 | USD 25,000 (less any Assessment credit) | On the Effective Date |
| 2 | USD 25,000 | On acceptance (including deemed acceptance) |
| **Total** | **USD 50,000** | Fixed fee |

- All fees are stated and invoiced in US dollars.
- Payment terms: net 30 days from invoice date. Late amounts bear interest at 1% per month or the
  maximum lawful rate, if lower.
- The Client will remit so that the full invoiced amount is credited to the Provider's account
  (for SWIFT wires, charges "OUR" or equivalent). Bank charges deducted from the remittance are
  added to the next invoice.
- Expenses: none for remote delivery. Pre-approved travel is billed at cost.

### 13.2 Clients outside India — export of services
Where the Order Form states that the Client is located outside India:

- the Provider invoices the Services as an export of services, zero-rated for Indian GST and
  supplied under the Provider's Letter of Undertaking without payment of integrated tax. Each
  invoice carries the required endorsement, the Client's name and foreign address, and the
  country of destination;
- the Client will pay in freely convertible foreign currency, from outside India, to the account
  named on the invoice. The Client will not arrange for an Indian affiliate to pay, or pay in
  Indian rupees, without the Provider's prior written agreement. If the Client's payment
  arrangements cause the supply not to qualify as an export of services, the Client will also pay
  the Indian GST then applicable;
- invoices above INR 25,00,000 equivalent are paid only by SWIFT wire. No invoice will be split
  to fit a payment aggregator's per-transaction limit; and
- the Client will include the remittance reference details the Provider states on the invoice.

### 13.3 Clients in India
Where the Order Form states that the Client is located in India, Indian GST at the rate applicable
at the time of supply is added to each invoice. The fee may be paid in Indian rupees at the
exchange rate stated on the invoice if the Order Form so provides. If the Provider is registered
as a micro or small enterprise, its Udyam registration number appears on the invoice and the
payment period may not exceed the period allowed by the Micro, Small and Medium Enterprises
Development Act, 2006.

### 13.4 Withholding taxes
The Services are performed in India. Before the first payment the Provider will give the Client,
on request, the tax documents reasonably needed to reduce or eliminate withholding, such as IRS
Form W-8BEN-E (for US payers), a tax residency certificate issued by the Indian income-tax
authorities, and any treaty-relief form the Client's tax authority requires. If the Client is
nevertheless required by law to withhold tax from a payment:

- **Gross-up (default):** the Client pays such additional amount that the Provider receives the
  full invoiced amount; or
- **Net payment (only if selected in the Order Form):** the Client pays the invoice net of the tax
  withheld and gives the Provider the official receipt or certificate of withholding within
  30 days of payment, so that the Provider can claim any credit available to it.

Each party bears its own taxes on its net income.

## 14. Data protection and security

- **Masked data by default.** The Provider will not access Client production systems or unmasked
  personal data. The Client will not send personal data except as masked under Section 6(3).
- **Roles.** If personal data is nevertheless processed, the Provider acts as the Client's
  processor (GDPR and UK GDPR), data processor (India's Digital Personal Data Protection Act,
  2023) and service provider (California Consumer Privacy Act), and the parties will first execute
  the Provider's Data Processing Addendum (Schedule 2), which then forms part of this SOW.
- **Security measures.** The Provider maintains a written information-security policy and at
  least: full-disk encryption and endpoint protection on Provider devices; multi-factor
  authentication on every account that can reach Client Materials; least-privilege access tokens
  scoped to the Client repository; secrets kept outside source code; ICT system logs kept for a
  rolling 180 days; and system clocks synchronised to an authoritative time source. The Provider
  does not hold a SOC 2 report or an ISO/IEC 27001 certification; it will answer the Client's
  reasonable security questionnaire and provide its security evidence pack.
- **Incidents.** The Provider will notify the Client of any security incident affecting Client
  Materials without undue delay and in any event within **24 hours** of becoming aware of it,
  and no later than any report the Provider makes about that incident to the Indian Computer
  Emergency Response Team (CERT-In) (which Indian law requires within 6 hours of noticing certain
  incidents), unless the law prohibits notice. The Provider will cooperate in investigation and
  remediation.
- **Deletion.** The Provider deletes Client source code and replay data from its systems within
  30 days after the end of this SOW (or keeps them under a signed retainer) and certifies deletion
  on request. Retention by AI providers is described in Schedule 1. ICT logs kept for regulatory
  purposes contain no Client source code or replay data.

## 15. Warranties

The Provider warrants that (a) it is a company duly incorporated in India and entitled to enter
into this SOW; (b) the Services will be performed with reasonable skill and care, using the
delivery model in Section 3; (c) Deliverables will not, to the Provider's knowledge, infringe
third-party intellectual property rights; (d) Deliverables will not contain open-source software
under licenses that require disclosure of the Client's proprietary code (copyleft licenses)
without the Client's written consent; and (e) the statements in Section 3 are true at the
Effective Date. EXCEPT AS STATED IN THIS SOW, THE PROVIDER DISCLAIMS ALL OTHER WARRANTIES, EXPRESS
OR IMPLIED, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE, TO THE EXTENT PERMITTED
BY LAW.

## 16. Limitation of liability

(A) NEITHER PARTY IS LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES,
LOST PROFITS OR REVENUE, LOSS OF GOODWILL, OR REGULATORY FINES IMPOSED ON THE OTHER PARTY.

(B) EACH PARTY'S TOTAL LIABILITY UNDER THIS SOW IS LIMITED TO THE FEES PAID AND PAYABLE UNDER THIS
SOW.

(C) FOR BREACH OF SECTION 12 (CONFIDENTIALITY) OR SECTION 14 (DATA PROTECTION AND SECURITY), AND
FOR THE PROVIDER'S INDEMNITY IN SECTION 17, EACH PARTY'S TOTAL LIABILITY IS LIMITED INSTEAD TO THE
GREATER OF THE AMOUNT IN (B) AND THE PER-CLAIM LIMIT OF THE PROVIDER'S INSURANCE STATED IN THE
ORDER FORM.

(D) THE PROVIDER IS NOT LIABLE FOR LOSS ARISING FROM USE OF ANY DELIVERABLE IN PRODUCTION BEFORE
ACCEPTANCE, OR OUTSIDE THE ENVIRONMENT AND CONFIGURATION DOCUMENTED IN THE DELIVERABLE.

(E) NOTHING IN THIS SOW LIMITS LIABILITY FOR FRAUD OR FRAUDULENT MISREPRESENTATION, WILFUL
MISCONDUCT, THE CLIENT'S OBLIGATION TO PAY FEES DUE, OR ANY LIABILITY THAT CANNOT BE LIMITED UNDER
THE GOVERNING LAW.

The parties agree these limits are reasonable having regard to the fees, the Provider's size and
resources, and the insurance available to it.

## 17. Indemnity

The Provider will defend the Client against third-party claims that a Deliverable infringes a
patent, copyright or trade secret, and pay resulting damages and costs finally awarded or agreed in
settlement, subject to Section 16(C), provided the Client gives prompt notice, reasonable
cooperation and sole control of the defense. This does not apply to claims arising from Client
Materials, modifications not made by the Provider, or combinations with items not supplied by the
Provider.

## 18. Insurance

The Provider will hold the insurance stated in the Order Form from the Effective Date until at
least the end of this SOW, and will give the Client a certificate or policy schedule on request.
The Provider will not sign this SOW unless technology professional-indemnity (errors and
omissions) cover including network-security and privacy liability is in force. The Client
acknowledges that such policies usually do not cover refunds of fees or contractual guarantees,
including the Parity Guarantee refund.

## 19. Term and termination

This SOW runs from the Effective Date until acceptance (Option B) or delivery of A4 (Option A),
or completion of the cure period under Section 8. Either party may terminate for material breach
not cured within ten (10) days of written notice. The Client may terminate for convenience on
written notice; the Provider then invoices fees for work performed pro rata over the schedule
(for Option B, a minimum of the first installment; for Option A, the full Assessment Fee once A2
has been delivered). Sections 8 (as to accrued remedies), 9.1, 11–18, 21 and 22 survive.

## 20. Compliance

Each party complies with anti-corruption, export-control and sanctions laws that apply to it. The
Provider complies with Indian laws that apply to its performance of the Services, including
foreign-exchange, GST and information-technology laws.

## 21. General

Independent contractors; no agency or partnership. Neither party may assign this SOW without the
other's consent, except to a successor in a merger or sale of substantially all assets; a change of
the Provider's name or its conversion from one class of company to another under the Companies
Act, 2013 is not an assignment. Notices in writing to the email addresses in the Order Form, with a
copy by courier for notices of breach or termination. Force majeure excuses delay caused by events
beyond reasonable control, including a documented outage or withdrawal of an AI System, but not the
Provider's failure to maintain paid accounts with its AI providers. The Accountable Reviewer signs
only as an officer of the Provider and gives no personal guarantee. The Provider pays any Indian
stamp duty payable on its execution of this SOW. This SOW is the entire agreement on its subject
and may be amended only in a signed writing, but nothing in it excludes liability for fraudulent
pre-contract statements. Counterparts and electronic signatures are valid to the extent permitted
by law.

## 22. Governing law and disputes

**22.1 Escalation.** The parties will first refer any dispute to the Client executive sponsor and
the Accountable Reviewer for good-faith negotiation for fifteen (15) Business Days. They may also
agree to mediation.

**22.2 Governing law and arbitration.** This SOW is governed by the law selected in the Order Form,
without regard to conflict-of-law rules. Any dispute not resolved under Section 22.1 will be
finally resolved by arbitration:

- for Options 1, 2 and 3, administered by the Singapore International Arbitration Centre under the
  SIAC Rules in force when the arbitration starts, seated in Singapore;
- for Option 4, administered by the Mumbai Centre for International Arbitration under its rules in
  force when the arbitration starts, seated in Mumbai;

in each case before a sole arbitrator, in English. Where the SIAC Rules provide for a streamlined
or expedited procedure, the parties agree it applies to the extent the rules allow.

**22.3 Interim relief.** Either party may seek urgent interim relief from any court of competent
jurisdiction, including to protect Confidential Information or intellectual property.

## 23. Acceptance of this delivery model in pre-contract statements

The Client confirms that no statement made to it before signature suggested that the Services
would be performed by a team of human engineers. If any such statement was made, Section 3
prevails and the Client may terminate this SOW before kickoff for a full refund.

## 24. Order of precedence

Order Form, then Sections 1–23, then Schedules.

---

## Schedule 1 — AI Systems and sub-processors

| Function | Provider and service | Account type required | Data processed | Training / retention (per provider terms reviewed on the dates shown) |
|---|---|---|---|---|
| Legacy ingest and behavioral extraction | Google — Gemini API (paid services) | Google Cloud project with active billing; Grounding with Google Search **disabled** for Client work | Client legacy source code | Paid-services prompts and responses are not used to improve Google's products and are processed under Google's data processing terms; logged for a limited period for abuse detection and required legal disclosures; may be cached in any country (Gemini API Additional Terms, effective 23 Mar 2026) |
| Specification audit, test writing, transpilation, parity review, reporting | Anthropic — Claude API through Claude Code | Anthropic API key or Team/Enterprise account under the Commercial Terms | Client source code, contracts, masked replay samples | No training on customer content; API inputs and outputs deleted within 30 days, except where the Files API is used (not used for Client Materials), under a legal hold, or where content is flagged under the usage policy (kept up to 2 years) (Anthropic Commercial Terms; Anthropic Privacy Center, 1 Jul 2026) |
| Sub-processor changes | — | — | — | 30 days' notice and objection right (Section 3.6) |

The Provider records the exact model and version used for each Deliverable in the Parity Evidence
Pack or Parity Demonstration Report.

## Schedule 2 — Data Processing Addendum (summary of required terms)

Executed only if personal data will be processed despite masking. It includes:

- processing only on the Client's documented instructions and only for this SOW;
- confidentiality of the Accountable Reviewer; security measures per Section 14;
- the sub-processors in Schedule 1, with 30 days' notice of changes and a right to object;
- assistance with data-subject requests, impact assessments and transfer risk assessments,
  including an information sheet on Indian law relevant to the transfer;
- incident notice as in Section 14;
- deletion or return at the end of the Services; audit rights by questionnaire and evidence, and
  by inspection on reasonable notice not more than once a year (or as a regulator requires);
- **EU/EEA personal data:** the EU Standard Contractual Clauses (Commission Decision (EU)
  2021/914), Module 2 (Client is controller) or Module 3 (Client is processor), unaltered except
  for module selection and the annexes;
- **UK personal data:** the UK International Data Transfer Agreement or the UK Addendum to the EU
  Standard Contractual Clauses issued by the Information Commissioner;
- **India:** data-processor terms under section 8(2) of the Digital Personal Data Protection Act,
  2023 where the Client is a data fiduciary. Where the personal data is of individuals outside
  India processed under a contract with a person outside India, the Act's obligations on the
  Provider are limited as section 17(1)(d) provides, but the Provider still maintains reasonable
  security safeguards;
- **California:** the service-provider terms required by 11 CCR §7051 (no selling or sharing;
  stated business purposes; no use outside the direct relationship; no combining with other
  data; reasonable security; notice if the Provider can no longer comply; Client's right to take
  reasonable steps to stop unauthorised use); and
- **Prohibited data:** health information protected by HIPAA, payment-card data and secrets or
  credentials are not accepted under this SOW.

---

## Signatures

**Client:** ______________________________

Name: ______________________________ Title: ______________________________

Signature: ______________________________ Date: ______________________________

**For and on behalf of [Provider legal name] Private Limited**
(authorised by resolution of its Board of Directors dated __________)

Name: [Full name] Title: Managing Director and Chief Executive Officer

Signature: ______________________________ Date: ______________________________
