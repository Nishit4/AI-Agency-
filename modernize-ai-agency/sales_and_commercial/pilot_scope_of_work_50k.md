# Statement of Work — 14-Day Proof-of-Value Pilot

**LegacyModern AI — Legacy Module De-Risking and Re-Platforming Pilot**
**Fixed fee: USD 50,000 · Duration: 14 calendar days · Scope: one legacy module, up to 50,000 lines of code**

> Template status: commercial terms approved by LegacyModern AI management. Have qualified
> counsel in the governing jurisdiction review each executed copy; local law may require
> changes to the limitation of liability, data protection, and tax clauses.

---

## Order Form

| Item | Value |
|---|---|
| SOW number | LM-PoV-______ |
| Client legal name | ______________________________ |
| Client address | ______________________________ |
| Client technical owner (role) | ______________________________ |
| Client executive sponsor (role) | ______________________________ |
| Provider | LegacyModern AI (the "Provider") |
| Effective Date | Date of last signature below |
| Pilot Module | ______________________________ (identified by program/package name and repository path) |
| Pilot Module size (measured) | __________ lines of code (must be ≤ 50,000) |
| Target language | ☐ Go 1.22+ ☐ TypeScript (Node 20+) |
| Kickoff Date | ______________________________ |

This Statement of Work ("SOW") is entered into between the Client and the Provider. If a
Master Services Agreement between the parties is in force, this SOW is governed by it and the
MSA prevails except where this SOW expressly states otherwise. If no MSA is in force, the terms
in Sections 9–19 of this SOW govern.

## 1. Background and purpose

The Client operates business-critical software written in legacy languages (such as COBOL,
PL/I, PL/SQL, JCL, or legacy Java). The purpose of this Pilot is to demonstrate, on one module
selected by the Client, that the Provider can (a) extract the module's behavior into an
executable behavioral contract, (b) re-implement the module as a cloud-native service, and (c)
prove behavioral equivalence through automated characterization tests and replay of masked
historical production data — within 14 days and without changing the legacy system.

## 2. Definitions

- **"Pilot Module"** — the legacy program(s), copybooks, packages, and job steps identified in
  the Order Form, totaling no more than 50,000 physical lines of source code excluding blank
  lines and comment-only lines, as measured by the Provider's line counter at kickoff.
- **"Behavioral Contract"** — a JSON document conforming to the Provider's behavioral contract
  schema that lists the Pilot Module's business rules and executable assertions (inputs,
  expected outputs, expected errors, and expected state transitions), each traced to legacy
  source lines.
- **"Modern Service"** — the Go or TypeScript service source code, tests, and build files
  produced under this SOW that implement the Pilot Module's behavior.
- **"Acceptance Test Suite"** — (i) every assertion in the Verified Behavioral Contract and
  (ii) the Replay Dataset, compared under the rules in Section 6.
- **"Replay Dataset"** — a set of historical production input/output records for the Pilot
  Module, masked by the Client, of at least 10,000 records or 30 days of activity (whichever is
  smaller), delivered with a masking attestation.
- **"Parity"** — for each record or assertion, the Modern Service produces the same outputs,
  error codes, and state changes as the legacy Pilot Module under the comparison rules in
  Section 6.
- **"Business Day"** — Monday to Friday excluding public holidays at the Client's principal
  place of business.
- **"Provider Materials"** — the Provider's pre-existing or independently developed tools,
  including its MCP specification bridge, characterization harness, service templates, agent
  prompts, and know-how.

## 3. Scope of services

The Provider will:

1. **Ingest and analyze** the Pilot Module source using long-context AI analysis and produce a
   module analysis (structure, data layouts including packed-decimal fields, dependencies,
   data flows, global state, risks).
2. **Extract and verify** the Behavioral Contract: business rules and assertions covering
   nominal, boundary, error, and state-transition behavior, with line-level lineage. Provider
   engineers audit the contract and resolve open questions with the Client's SME.
3. **Write characterization tests** from the Verified Behavioral Contract before writing any
   production code.
4. **Build the Modern Service** in the target language using a clean architecture (domain,
   application, adapters, transport) with structured logging, health and readiness probes,
   graceful shutdown, and exact decimal arithmetic.
5. **Prove Parity** by running the Acceptance Test Suite, including dual-engine replay of the
   Replay Dataset, and report results.
6. **Deliver** the Deliverables in Section 4 and a 60-minute executive readout.

### 3.1 Out of scope
Unless added by a written change order: production deployment and cutover; data migration;
modules outside the Pilot Module (other than read-only analysis of interfaces it calls);
user-interface redesign; performance tuning beyond the acceptance latency target;
remediation of defects in the legacy code; procurement of Client infrastructure or licenses;
security penetration testing of the Client environment.

## 4. Deliverables

| ID | Deliverable | Format | Due |
|---|---|---|---|
| D1 | Module Analysis Report | Markdown/PDF + JSON | Day 4 |
| D2 | Verified Behavioral Contract | JSON (schema-valid) | Day 6 |
| D3 | Characterization Test Suite | Source in Client repository | Day 7 |
| D4 | Modern Service source, build files, `LINEAGE.md` | Source in Client repository, branch `modernize/<module-id>` | Day 12 |
| D5 | Parity Evidence Pack: contract parity report, replay report, coverage report, gate review | JSON + PDF | Day 13 |
| D6 | Executive readout and modernization roadmap for the remaining estate | Slides/PDF | Day 14 |

## 5. Timeline

| Day | Activity | Client participation |
|---|---|---|
| 0 (before kickoff) | Access provisioning, repository access, SME scheduling, Replay Dataset extraction begins | Required |
| 1 | Kickoff (90 min); source ingest | Technical owner, SME |
| 2–4 | Analysis; contract extraction; SME Q&A (≤ 2 sessions of 60 min) | SME |
| 5–6 | Contract audit and verification; D1 and D2 delivered | SME review (≤ 2 h) |
| 7 | Characterization tests committed (D3) | — |
| 8–12 | Modern Service build; local parity loop; D4 delivered | SME on call (≤ 2 h) |
| 12–13 | Dual-engine replay; parity gate; D5 delivered | Replay Dataset available by Day 8 |
| 14 | Executive readout (D6); acceptance window opens | Executive sponsor |

## 6. Acceptance

### 6.1 Acceptance criteria
The Pilot is accepted when all of the following are met on the delivered commit:

1. **100% Parity** on every assertion of the Verified Behavioral Contract.
2. **100% Parity** on the Replay Dataset, excluding only records for which the legacy system
   itself produced no output for infrastructure reasons (not exceeding 0.5% of records).
3. Branch coverage of the Modern Service's domain and application code of at least 90%.
4. The Modern Service builds and its tests pass with the commands documented in D4.
5. p99 latency of the Modern Service on the Replay Dataset at 32 concurrent workers is at or
   below 250 milliseconds on infrastructure of the class agreed at kickoff.

### 6.2 Comparison rules
Numeric values are compared as exact decimals at the legacy field's scale; fixed-width text
fields may be compared with trailing spaces removed where the legacy field is space-padded;
outputs must contain exactly the expected fields; expected errors must match by error code and
legacy return code; every expected state change must occur and no other state may change.

### 6.3 Procedure
The Provider delivers D5 and gives notice of readiness. The Client has **five (5) Business Days**
to run or witness the Acceptance Test Suite and either accept in writing or reject in writing
identifying the specific criterion not met and the records or assertions that fail. If the
Client does neither within that period, the Pilot is deemed accepted. Use of the Modern Service
in production constitutes acceptance.

## 7. Parity Guarantee

If the Modern Service does not meet the criteria in Section 6.1(1) and 6.1(2) at the end of the
Pilot, the Provider will continue work at no additional charge for up to **ten (10) Business
Days** to cure. If Parity is still not achieved after the cure period, then, as the Client's sole
and exclusive remedy for failure to meet the acceptance criteria:

- the second installment (Section 8) is **not payable**, and
- the Provider will **refund 50% of the first installment** (USD 12,500) within 30 days, and
- the Client retains a perpetual license to use the Deliverables delivered to date for internal
  purposes.

The Parity Guarantee does not apply to the extent failure results from: the Client not
providing the access, SME time, or Replay Dataset by the dates in Section 5 (in which case dates
move day-for-day); legacy behavior that is non-deterministic (e.g. depends on wall-clock time or
unordered reads) where the Client does not supply the deciding inputs; or changes to the Pilot
Module made by the Client after kickoff.

## 8. Fees and payment

| Installment | Amount | Invoiced |
|---|---|---|
| 1 | USD 25,000 | On the Effective Date |
| 2 | USD 25,000 | On acceptance (including deemed acceptance) |
| **Total** | **USD 50,000** | Fixed fee |

- Payment terms: net 30 days from invoice date. Late amounts bear interest at 1% per month or
  the maximum lawful rate, if lower.
- Fees exclude taxes; the Client pays applicable sales, use, VAT, GST, and withholding taxes
  other than taxes on the Provider's net income. Where withholding is required, the Client
  grosses up so the Provider receives the full fee.
- Expenses: none for remote delivery. Pre-approved travel is billed at cost.

### 8.1 Retainer credit
If, within **thirty (30) days** after acceptance, the Client signs the Provider's 12-month
Enterprise Retainer (USD 100,000 per month), the Provider credits the full USD 50,000 Pilot fee
against the retainer: USD 25,000 against each of the first two monthly invoices. The credit is
not redeemable for cash and does not apply if the Parity Guarantee refund was paid.

## 9. Client responsibilities

The Client will, at its cost and by the dates in Section 5:

1. Provide read access to the Pilot Module source and its copybooks/includes, and a Git
   repository (or branch) where the Provider can commit Deliverables.
2. Make a subject-matter expert available for up to 8 hours in total over the Pilot.
3. Provide the Replay Dataset, masked so that it contains no direct identifiers, with a written
   masking attestation, by Day 8.
4. Provide, where the Replay Dataset lacks legacy outputs, access to a non-production
   environment where the legacy Pilot Module can be executed.
5. Designate a technical owner empowered to answer questions within one Business Day.

Delays in Client responsibilities extend the timeline day-for-day and do not breach this SOW.

## 10. Personnel

The Provider assigns a pod lead and at least one senior modernization engineer, supported by
the Provider's AI agent tooling. The Provider may replace personnel with equally qualified
personnel on notice. Provider personnel will comply with the Client's reasonable written
security and conduct policies provided before kickoff.

## 11. Use of AI

The Provider uses large language models (including Anthropic Claude and Google Gemini) under
commercial terms that prohibit the model provider from training on submitted content. Upon
request the Provider will list the models and data-retention settings used. Client source code
is processed only to perform this SOW. Production data is never sent to model providers; only
the masked Replay Dataset is processed, and only inside the environment agreed at kickoff.
Human engineers review every Deliverable.

## 12. Intellectual property

- **Deliverables.** Upon payment of fees due, the Client owns the Modern Service source code,
  tests, Behavioral Contract, reports, and other Deliverables created specifically for the
  Client under this SOW, and the Provider assigns to the Client all rights in them.
- **Provider Materials.** The Provider retains all rights in Provider Materials. To the extent
  Provider Materials are embedded in Deliverables, the Provider grants the Client a perpetual,
  irrevocable, worldwide, royalty-free, non-exclusive license to use, copy, and modify them as
  part of the Deliverables for the Client's internal business purposes.
- **Client Materials.** The Client retains all rights in its source code, data, and documents,
  and grants the Provider a limited license to use them solely to perform this SOW.
- **General know-how.** Nothing prevents the Provider from using general skills and
  techniques learned, provided it does not disclose Client Confidential Information.

## 13. Confidentiality

Each party will protect the other's non-public information disclosed under this SOW with at
least reasonable care, use it only for this SOW, and disclose it only to personnel and
subcontractors bound by equivalent obligations. Obligations survive three (3) years after
termination, and indefinitely for source code and trade secrets. Standard exclusions apply for
information that is public through no fault of the recipient, already known, independently
developed, or rightfully received from a third party. Compelled disclosure is permitted with
prompt notice where lawful.

## 14. Data protection and security

- The Provider will not access production systems or unmasked personal data.
- Work is performed on Provider-managed devices with full-disk encryption, MFA, and endpoint
  protection, or in a Client-provided environment.
- The Provider deletes Client source code and the Replay Dataset from its systems within 30 days
  after the end of the Pilot (or retains them under the retainer if signed), and certifies
  deletion on request.
- If personal data is processed despite masking, the parties will execute the Provider's Data
  Processing Addendum, which then forms part of this SOW.

## 15. Warranties

The Provider warrants that (a) services will be performed in a professional manner consistent
with industry standards, (b) Deliverables will not, to the Provider's knowledge, infringe third-
party intellectual property rights, and (c) Deliverables will not contain open-source software
under licenses that require disclosure of the Client's proprietary code (copyleft licenses)
without the Client's written consent. EXCEPT AS STATED IN THIS SOW, THE PROVIDER DISCLAIMS ALL
OTHER WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE.

## 16. Limitation of liability

EXCEPT FOR BREACH OF CONFIDENTIALITY, A PARTY'S INDEMNITY OBLIGATIONS, OR A PARTY'S GROSS
NEGLIGENCE OR WILLFUL MISCONDUCT: (A) NEITHER PARTY IS LIABLE FOR INDIRECT, INCIDENTAL,
SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOST PROFITS OR REVENUE; AND (B) EACH PARTY'S
TOTAL LIABILITY UNDER THIS SOW IS LIMITED TO THE FEES PAID AND PAYABLE UNDER THIS SOW.

## 17. Indemnity

The Provider will defend the Client against third-party claims that a Deliverable infringes a
patent, copyright, or trade secret, and pay resulting damages and costs finally awarded or
agreed in settlement, provided the Client gives prompt notice, reasonable cooperation, and sole
control of the defense. This does not apply to claims arising from Client Materials,
modifications not made by the Provider, or combinations with items not supplied by the Provider.

## 18. Term and termination

This SOW runs from the Effective Date until acceptance, or completion of the cure period under
Section 7. Either party may terminate for material breach not cured within ten (10) days of
written notice. The Client may terminate for convenience on written notice; the Provider then
invoices fees for work performed pro rata over the 14-day schedule (minimum the first
installment). Sections 7 (as to accrued remedies), 8, 12–17, and 19 survive.

## 19. General

Independent contractors; no agency or partnership. Neither party may assign this SOW without
the other's consent, except to a successor in a merger or sale of substantially all assets.
Notices in writing to the addresses in the Order Form (email with confirmation suffices for
operational notices). Force majeure excuses delay caused by events beyond reasonable control.
Non-solicitation: for twelve (12) months after the Pilot, neither party will solicit for
employment the other's personnel who worked on the Pilot, excluding general advertisements.
This SOW is governed by the laws of the State of Delaware, USA, without regard to conflict-of-
law rules, and the parties submit to the state and federal courts located in Wilmington,
Delaware. This SOW is the entire agreement on its subject and may be amended only in a signed
writing. Counterparts and electronic signatures are valid.

---

## Signatures

**Client:** ______________________________

Name: ______________________________ Title: ______________________________

Signature: ______________________________ Date: ______________________________

**LegacyModern AI:**

Name: ______________________________ Title: ______________________________

Signature: ______________________________ Date: ______________________________
