# Master Services Agreement — Enterprise Modernization Retainer

**[Provider legal name] Private Limited, trading as LegacyModern AI**
**USD 100,000 per month · 12-month initial term · Reserved capacity of a supervised AI delivery pipeline**

> **Drafting notes for the CEO — delete this box before sending.**
> 1. Do not send or sign until the "Pre-signature checklist" in `CHANGES.md` is complete,
>    including bound insurance and counsel review in the chosen governing-law jurisdiction.
> 2. Before signing a retainer, check that the Capacity you commit in Exhibit A, added to every
>    other engagement you have signed, fits the hours you can personally review (Section 3.3).
> 3. Section 2 (Delivery Model and AI Disclosure) must be shown to the Client before signature
>    and the Cover Page acknowledgement ticked.
> 4. Every square-bracketed item is a field you set. Never send a bracket.

---

## Cover Page

| Item | Value |
|---|---|
| Agreement number | LM-MSA-______ |
| **Provider** | [Provider legal name] Private Limited, a company incorporated in India under the Companies Act, 2013, trading as "LegacyModern AI" ("Provider") |
| Provider CIN / PAN / GSTIN / IEC | __________ / __________ / __________ / __________ |
| Provider LUT (GST RFD-11) reference and financial year | ARN __________ for FY 20__–__ (renewed each 1 April) |
| Provider registered office | ______________________________, India |
| Accountable Reviewer and signatory | [Full name], Managing Director and Chief Executive Officer |
| Client legal name | ______________________________ (must be the paying entity) |
| Client country of incorporation and tax residence | ______________________________ |
| Client address | ______________________________ |
| Effective Date | Date of last signature below |
| Service Commencement Date | ______________________________ |
| Monthly Retainer Fee | USD 100,000 |
| Initial Term | 12 months from the Service Commencement Date |
| Capacity | As set out in Exhibit A (default: up to 2 concurrent Work Orders; 6 Standard Work Order equivalents per month) |
| Client Executive Sponsor (role) | ______________________________ |
| Client Technical Owner (role) | ______________________________ |
| Pilot credit applicable | ☐ Yes (SOW no. LM-SOW-______) ☐ No |
| Client location for tax purposes | ☐ Outside India (export of services, Section 5.3) ☐ India (Section 5.4) |
| Payment route | SWIFT wire to the Provider's account at an Authorised Dealer Category-I bank in India |
| Withholding-tax treatment (Section 5.5) | ☐ Gross-up (default) ☐ Net payment with official withholding certificate |
| Support Hours | 10:00–19:00 India Standard Time (IST) on Provider Business Days, plus an overlap window of __________ (up to 2 hours) on Provider Business Days: __________ (Client local time) |
| Provider holiday calendar and Leave Days (Section 12.2) | Attached / link: __________ |
| Governing law and disputes (Section 23) | ☐ 1. Law of England and Wales; SIAC arbitration seated in Singapore (default for clients outside India) ☐ 2. Law of Singapore; SIAC, Singapore ☐ 3. Law of the State of New York; SIAC, Singapore ☐ 4. Law of India; MCIA arbitration seated in Mumbai (Indian clients) |
| **Provider insurance** (Section 21) | Insurer: __________ · Policy: technology professional indemnity / errors and omissions including network-security and privacy liability · Limit: __________ per claim and in aggregate · Territory and jurisdiction: worldwide including USA and Canada ☐ Yes ☐ No · Retroactive date: __________ · Expiry: __________ |
| Out-of-scope rate | USD __________ per Accountable Reviewer hour, or fixed price per change order |

☐ **The Client confirms that before signing it received and read Section 2 (Delivery Model and AI
Disclosure) and Exhibit E. It understands that the services are performed by AI systems operated
by the Provider, that the Provider's CEO is the only human who works on the services, and that
acceptance is decided by the objective evidence in Section 7.**

This Master Services Agreement ("Agreement") is made between the Client and the Provider. It
consists of this Cover Page, the General Terms (Sections 1–25) and Exhibits A–E. In a conflict,
the order of precedence is: an executed Work Order (only for its specific deliverables), the
Cover Page, the General Terms, the Exhibits; except that Section 2 and Exhibit E prevail over any
other statement about who performs the services.

## General Terms

### 1. Definitions
- **"Accountable Reviewer"** — the Provider's Managing Director and CEO named on the Cover Page.
- **"AI Systems"** — the third-party AI models and services listed in Exhibit E and operated by the
  Provider.
- **"Delivery Pipeline"** — the AI Systems together with the Provider Materials (ingest,
  specification, transpilation, parity-gate and delivery-reporting agents), operated by the
  Provider and supervised by the Accountable Reviewer.
- **"Module"** — a unit of legacy software (program, package, transaction or job-step set)
  identified in a Work Order.
- **"Work Order"** — a written request in the form of Exhibit C identifying one Module, the target
  service and acceptance criteria, accepted by the Client Technical Owner and the Accountable
  Reviewer (email acceptance suffices).
- **"Verified Behavioral Contract"** — the executable specification of a Module's behavior, reviewed
  by the Accountable Reviewer under Section 2.3 and by the Client, as described in Exhibit C.
- **"Standard Work Order"** — a Work Order for a Module of up to 5,000 lines of code and up to 8
  business rules. **"Complex Work Order"** — up to 15,000 lines of code or involving shared global
  state or unresolved external dependencies. Larger Modules are split.
- **"Deliverables"** — the work product created specifically for the Client under a Work Order:
  modern service source code, tests, contracts, lineage maps, reports and documentation.
- **"Provider Materials"** — the Provider's tools, templates, harnesses, prompts, agents, libraries
  and know-how existing before or developed independently of this Agreement.
- **"Acceptance"** — as defined in Section 7.
- **"Business Day"** — Monday to Friday excluding public holidays at the Client's principal place of
  business. Used for the Client's obligations.
- **"Provider Business Day"** — Monday to Friday excluding the holidays in the Provider's holiday
  calendar and the Leave Days under Section 12.2. Used for the Provider's service levels.
- **"Support Hours"** — as stated on the Cover Page.

### 2. Delivery Model and AI Disclosure

**2.1 Who performs the services.** The services are performed by the Delivery Pipeline:

- **Legacy source ingest and behavioral extraction:** Google Gemini models (currently [model name
  and version]) through Google's paid Gemini API, billed to a Google Cloud project with active
  billing.
- **Specification audit, characterization-test writing, transpilation into Go or TypeScript,
  parity testing and delivery reporting:** Anthropic Claude models (currently [model names and
  versions]) through Claude Code, using an Anthropic API key or Team/Enterprise account under
  Anthropic's Commercial Terms.

**2.2 The only human.** The Accountable Reviewer is the only human who works on the services. The
Accountable Reviewer supervises the Delivery Pipeline, runs all governance meetings, resolves open
questions with the Client's SMEs, approves every Deliverable before submission, signs for the
Provider and is accountable for the Deliverables on the Provider's behalf. The Provider has no
other personnel assigned to this Agreement and will not engage any human subcontractor without the
Client's prior written consent.

**2.3 What human review covers.** For each Work Order the Accountable Reviewer: (a) reviews every
business rule in the Behavioral Contract against its cited legacy source lines; (b) reviews every
review flag and its resolution with the Client's SME; (c) reviews the gate reports (contract
parity, replay, branch coverage, static analysis, race detection, dependency and secret scans);
and (d) reviews generated code on a risk basis — all code implementing monetary calculations,
rounding, validation order and state transitions, and a sample of the remaining code. The Provider
does **not** represent that a human has read every line of generated code. Acceptance does not
depend on human review; it depends on the objective evidence in Section 7.

**2.4 Objective evidence.** Parity is shown by the Provider's characterization harness and by
dual-engine replay of the agreed replay dataset. Every report states the commit, the commands used
and the per-assertion and per-record results, so the Client can re-run it.

**2.5 Model accounts and data terms.** The Provider processes Client Materials only through paid
or commercial accounts whose terms prohibit training on the submitted content (Anthropic) or state
that prompts and responses are not used to improve the provider's products (Google paid Gemini API
services). The Provider never processes Client Materials through consumer plans or through
Google's unpaid Gemini API services. The Provider does not submit unmasked personal data, secrets
or credentials to any AI System.

**2.6 Model changes.** The Provider may change model versions within the providers in Exhibit E
and records the model and version used for each Work Order. The Provider gives at least 30 days'
written notice before adding a new AI provider that would process Client Materials; the Client may
object on reasonable grounds, and if the Provider cannot continue without that provider, either
party may terminate on 30 days' notice without the early-termination fee in Section 19.3.

**2.7 Limits of AI.** AI Systems can produce incorrect output. That is why every Deliverable must
pass its acceptance criteria. The Provider does not warrant behavior that the acceptance criteria
do not test, except as stated in Section 9.

### 3. Services and capacity

**3.1 Services.** The Provider provides continuous legacy de-risking and re-platforming services
through the Delivery Pipeline: Module analysis and behavioral contract extraction,
characterization testing, re-implementation of Modules as cloud-native services (Go or TypeScript
unless otherwise agreed), dual-engine parity verification, delivery reporting, and the governance
in Section 6. Production operations, production cutover, data migration execution, UI redesign and
on-site work require a separate statement of work.

**3.2 Capacity.** The reserved Capacity is set out in Exhibit A. Unused capacity does not roll
over. The Client may reprioritize the Work Order queue at any sprint planning (every 14 days).

**3.3 Capacity commitment.** Because one human reviews all work, the Provider will not accept
other engagements that would prevent it from providing the Capacity in Exhibit A, and will tell
the Client promptly if it believes it cannot.

### 4. Term
The Initial Term is twelve (12) months from the Service Commencement Date. Thereafter the Agreement
renews for successive twelve (12) month terms unless either party gives written notice of
non-renewal at least sixty (60) days before the end of the current term. Fees for a renewal term may
increase by no more than 5% with ninety (90) days' notice.

### 5. Fees, invoicing and taxes

**5.1 Fees.**
- **Retainer Fee:** USD 100,000 per month, invoiced in US dollars monthly in advance on the first day
  of each service month, payable net 30 days.
- **Pilot credit:** if marked on the Cover Page, USD 25,000 is credited against each of the first two
  monthly invoices.
- **Service credits:** credits earned under Exhibit B are applied to the next invoice.
- **Expenses:** remote delivery includes no expenses. Pre-approved travel is billed at cost.
- **AI usage:** the Provider's AI-provider charges are included in the Retainer Fee.

**5.2 Late payment.** Amounts unpaid 15 days after notice of non-payment bear interest at 1% per
month (or the maximum lawful rate, if lower), and the Provider may suspend services after 30 days'
written notice of non-payment without liability; service-level clocks pause during suspension. The
Client will remit so that the full invoiced amount is credited (charges "OUR" or equivalent); bank
charges deducted are added to the next invoice. The Client acknowledges that the Provider must
realise export proceeds within the period set by Indian foreign-exchange regulations, and will not
unreasonably delay payment of undisputed amounts.

**5.3 Clients outside India — export of services.** The Provider invoices the services as an export
of services, zero-rated for Indian GST and supplied under its Letter of Undertaking without payment
of integrated tax, with the required invoice endorsement, the Client's foreign address and the
country of destination. The Client pays in freely convertible foreign currency, from outside India,
by SWIFT wire to the account named on the invoice, and will not arrange for an Indian affiliate to
pay or pay in Indian rupees without the Provider's prior written agreement. If the Client's payment
arrangements cause the supply not to qualify as an export of services, the Client also pays the
Indian GST then applicable. No invoice will be split to fit a payment aggregator's
per-transaction limit.

**5.4 Clients in India.** Indian GST at the rate applicable at the time of supply is added to each
invoice; payment may be made in Indian rupees at the exchange rate stated on the invoice if the
Cover Page so provides. If the Provider is registered as a micro or small enterprise, its Udyam
number appears on the invoice and the payment period may not exceed the period allowed by the
Micro, Small and Medium Enterprises Development Act, 2006.

**5.5 Withholding taxes.** The services are performed in India. On request before the first payment
(and when they expire), the Provider gives the Client the tax documents reasonably needed to reduce
or eliminate withholding, such as IRS Form W-8BEN-E for US payers, a tax residency certificate
issued by the Indian income-tax authorities, and any treaty-relief form the Client's tax authority
requires. If the Client must nevertheless withhold tax by law: under **gross-up** (default) the
Client pays such additional amount that the Provider receives the full invoiced amount; under **net
payment** (only if selected on the Cover Page) the Client pays net and gives the Provider the
official receipt or certificate of withholding within 30 days. Each party bears its own taxes on
its net income.

### 6. Governance
All meetings are held within Support Hours or the overlap window, by video call, with the
Accountable Reviewer.
- **Sprint cadence:** 14-day sprints with planning (day 1), status calls of up to 30 minutes (days 5
  and 10), and milestone sign-off review (day 13).
- **Weekly status note** (drafted by the Delivery Pipeline and approved by the Accountable Reviewer)
  with GREEN/AMBER/RED status, delivered Modules, blockers and risks.
- **Monthly steering meeting** (Client Executive Sponsor, Client Technical Owner, Accountable
  Reviewer): roadmap, capacity, risks, change requests.
- **Quarterly business review:** progress against the Client's legacy estate plan, next-quarter
  roadmap.
- **Milestone sign-off dossier** each sprint, per Section 7, including the model and version log.

### 7. Work Orders and Acceptance
- Each Work Order follows the lifecycle in Exhibit C. The turnaround clock starts when the Verified
  Behavioral Contract is published for that Work Order.
- **Acceptance criteria** for every Work Order, unless the Work Order states stricter ones: (a) 100%
  parity on the Verified Behavioral Contract; (b) 100% parity on the agreed replay dataset
  (excluding records the legacy system failed to process for infrastructure reasons, not exceeding
  0.5%); (c) branch coverage of domain and application code ≥ 90%; (d) build and test commands
  documented and passing; (e) p99 latency within the Work Order target (default 250 ms). Parity is
  measured only against these tests, on the delivered commit, in the documented environment, under
  the comparison rules in Exhibit C.
- The Provider delivers each sprint a sign-off dossier listing Deliverables and evidence. The Client
  has **five (5) Business Days** to accept or reject in writing, identifying the failed criterion with
  specific failing records or assertions. Silence is deemed acceptance, and production use is
  acceptance. Rejected Deliverables are corrected and resubmitted without charge.

### 8. Service levels
The service levels and service credits in Exhibit B apply. Service credits are a price adjustment
reflecting the reduced value of the services, not a penalty, and are the Client's sole monetary
remedy for service-level failures, without prejudice to termination rights in Section 19.2. The
Provider does not provide 24×7 support.

### 9. Parity Warranty
**9.1 Warranty.** For **ninety (90) days** after Acceptance of each Deliverable (the "Warranty
Period"), the Provider warrants that the Deliverable produces Parity for every behavior captured in
the Verified Behavioral Contract and the replay dataset used for Acceptance, when operated in the
environment and configuration documented in the Deliverable.

**9.2 Remedy.** If the Client reports a reproducible deviation during the Warranty Period, the
Provider will, at no charge and outside the Capacity: respond within the P1/P2 times in Exhibit B;
add assertions reproducing the deviation to the contract; correct the Deliverable; and re-run the
full acceptance suite. Correction (and, if correction is not achieved within the P2 resolution
target, a refund of the fees attributable to the affected Deliverable, calculated as the Monthly
Retainer Fee divided by the monthly Capacity in Exhibit A) is the Client's sole and exclusive remedy
under this Section.

**9.3 Behaviors not captured in the contract.** If the Client shows that the legacy Module exhibited
in production, during the replay window, a behavior that the Verified Behavioral Contract did not
capture, the Provider will add it to the contract and correct the Deliverable as a priority Work
Order within the Capacity. This is a re-performance commitment only: it is not a warranty, and no
service credits, refunds or damages apply to it.

**9.4 Exclusions.** This Section does not cover deviations caused by: modifications not made by the
Provider; operation outside documented configuration; changes in upstream/downstream systems;
behaviors the Client approved as intentional deviations in writing; or legacy defects the Client
asked the Provider to correct.

### 10. Change control
Either party may request changes to scope, priorities, acceptance criteria or Capacity through a
written change request. The Provider responds within five (5) Provider Business Days with impact on
schedule, Capacity and fees. Changes bind only when signed by both parties' authorized
representatives. Work Order reprioritization within Capacity does not require a change request.

### 11. Client responsibilities
The Client will: provide timely access to source code, documentation, non-production environments
and repositories; make subject-matter experts available (planned at 4 hours per Work Order) during
Support Hours or the overlap window; provide masked replay datasets with masking attestations,
containing no direct identifiers, sensitive personal data, health information, payment-card data,
secrets or credentials; respond to questions within one Business Day; designate an Executive Sponsor
and Technical Owner with decision authority; maintain the environments the Provider needs to run
legacy test executions; and own production cutover, rollback and production testing, keeping the
legacy Module available for rollback until the end of the Warranty Period. Service-level clocks
pause for documented delays in Client responsibilities.

### 12. Provider continuity and availability
**12.1 Key-person event.** The Provider notifies the Client within one Provider Business Day if the
Accountable Reviewer is, or expects to be, unable to work for more than two consecutive Provider
Business Days. If the Accountable Reviewer is unable to work for more than ten (10) consecutive
Provider Business Days, the Client may (a) suspend the Retainer Fee pro rata for the period of
unavailability, or (b) terminate this Agreement on written notice without the early-termination fee,
with a pro-rata refund of prepaid fees for the unperformed period.

**12.2 Planned leave.** The Provider may take up to fifteen (15) Leave Days per contract year that
are not Provider Business Days, notified at least twenty (20) Business Days in advance and not more
than five (5) consecutive Leave Days without the Client's agreement.

**12.3 Work in the Client's repository.** The Provider commits work in progress, contracts and
harness configuration to the Client's repository at least at the end of each Provider Business Day
on which it changed, so the Client always holds the latest state of the work.

**12.4 Optional background check.** At the Client's request and cost, and with the Accountable
Reviewer's consent and subject to applicable law, the Client may conduct a background check of the
Accountable Reviewer before the Service Commencement Date.

### 13. Intellectual property
- **Deliverables:** upon payment of the fees for the month in which a Deliverable is accepted, the
  Client owns all right, title and interest the Provider has in the Deliverables, and the Provider
  assigns them to the Client and will execute documents reasonably required to perfect the
  assignment. The Client acknowledges that the copyright status of AI-generated material may differ
  between jurisdictions; the Provider warrants that it has not granted rights in the Deliverables to
  anyone else.
- **Provider Materials:** the Provider retains all rights in Provider Materials. To the extent they
  are incorporated into Deliverables, the Provider grants the Client a perpetual, irrevocable,
  worldwide, royalty-free, non-exclusive, transferable (with the Deliverables) license to use, copy,
  modify and create derivative works of them as part of the Deliverables.
- **Client Materials:** the Client retains all rights in its source code, data, documentation and
  systems, and grants the Provider a non-exclusive license to use them solely to perform this
  Agreement.
- **Open source:** the Provider will not incorporate open-source components under copyleft licenses
  (e.g. GPL, AGPL, LGPL where statically linked) into Deliverables without the Client's written
  consent, and will list all third-party components and licenses in each Deliverable.
- **Residual knowledge:** each party may use general skills and know-how, without using or disclosing
  the other party's Confidential Information or IP.

### 14. Confidentiality
Each party will hold the other's Confidential Information in confidence using at least the care it
uses for its own similar information and no less than reasonable care, use it only to perform or
receive the services, and disclose it only to its officers, professional advisers, and (for the
Provider) the AI Systems and sub-processors in Exhibit E, each bound by obligations at least as
protective. Source code, security information and personal data are Confidential Information
regardless of marking. Exclusions: information public through no fault of the recipient, already
known without restriction, independently developed, or rightfully received from a third party.
Compelled disclosure is permitted with prompt notice (where lawful) and cooperation to seek
protective treatment. Obligations survive five (5) years after termination, and indefinitely for
source code, trade secrets and personal data. On termination each party returns or destroys the
other's Confidential Information and certifies destruction on request, subject to legal retention
requirements and routine backups (which remain protected).

### 15. Security and data protection
- **Security program.** The Provider maintains a written information-security policy and risk
  assessment, and at least: full-disk encryption and endpoint protection on Provider devices;
  multi-factor authentication on every account that can reach Client Materials; least-privilege,
  repository-scoped access tokens; secrets kept outside source code; secure software-development
  checks in the parity gate (static analysis, dependency vulnerability and secret scanning); ICT
  system logs kept for a rolling 180 days; system clocks synchronised to an authoritative time
  source; and a written incident-response runbook. The Provider does **not** hold a SOC 2 report or an
  ISO/IEC 27001 certification. It completes the Client's reasonable security questionnaire once a
  year and provides its security evidence pack (policy, data-flow diagram showing masked-data-only
  processing, AI-provider data terms, MFA and encryption evidence).
- **Masked data.** Production data is processed only in masked form unless a Data Processing
  Addendum (Exhibit D) is executed and the Client authorizes otherwise in writing.
- **Incidents.** The Provider notifies the Client of any security incident affecting Client data
  without undue delay and in any event within **24 hours** of becoming aware of it, and no later than
  any report it makes about that incident to the Indian Computer Emergency Response Team (CERT-In)
  (which Indian law requires within 6 hours of noticing certain incidents), unless the law prohibits
  notice; and cooperates in investigation and remediation.
- **Client environments.** Work in Client environments follows the Client's written access policies.

### 16. AI governance
The Provider will: follow Section 2 and Exhibit E; keep the Accountable Reviewer accountable for
every Deliverable; keep records of models and versions used per Work Order; and include them in the
sign-off dossier.

### 17. Warranties
Each party warrants it has authority to enter this Agreement; the Provider warrants it is a company
duly incorporated in India. The Provider warrants that the services will be performed with
reasonable skill and care using the delivery model in Section 2; that Deliverables will conform to
their acceptance criteria at Acceptance; that it will comply with laws applicable to it; that
Deliverables will not, to its knowledge, contain malicious code; and that the statements in
Section 2 and Exhibit E are true at the Effective Date and will be kept up to date. EXCEPT AS
EXPRESSLY STATED IN THIS AGREEMENT, EACH PARTY DISCLAIMS ALL OTHER WARRANTIES, EXPRESS OR IMPLIED,
INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT, TO THE EXTENT
PERMITTED BY LAW.

### 18. Indemnities
- **By the Provider:** the Provider will defend the Client against third-party claims alleging that
  Deliverables or Provider Materials infringe or misappropriate intellectual property rights, and
  pay damages and costs finally awarded or agreed in settlement, subject to Section 20(C). If such a
  claim is made or likely, the Provider may procure the right to continue use, modify the item to be
  non-infringing with equivalent behavior, or, if neither is commercially reasonable, refund fees paid
  for the affected Deliverable. Exclusions: Client Materials, modifications not made by the Provider,
  and combinations not supplied or specified by the Provider.
- **By the Client:** the Client will defend the Provider against third-party claims arising from
  Client Materials or the Client's use of Deliverables in violation of law.
- **Procedure:** prompt written notice, sole control of defense and settlement by the indemnifying
  party (no admission of fault by the indemnified party without consent), and reasonable cooperation
  at the indemnifying party's expense.

### 19. Termination
- **19.1 For cause:** either party may terminate on written notice if the other materially breaches
  and fails to cure within thirty (30) days of notice (ten (10) days for non-payment), or becomes
  insolvent.
- **19.2 Chronic SLA failure:** the Client may terminate on thirty (30) days' notice if the Provider
  misses the Work Order Turnaround service level in any three (3) months within a rolling six (6)
  month period, without early-termination fee.
- **19.3 For convenience:** after the sixth (6th) service month, the Client may terminate for
  convenience on sixty (60) days' written notice, paying fees through the notice period plus an
  early-termination fee equal to one (1) Monthly Retainer Fee.
- **19.4 Key-person and model events:** as provided in Sections 12.1 and 2.6.
- **19.5 Effect:** on termination the Client pays fees accrued through the effective date (less
  credits and any refund due); the Provider delivers all Deliverables and work in progress for which
  fees have been paid; licenses to paid-for Deliverables survive.
- **19.6 Transition assistance:** for up to sixty (60) days after termination (other than for the
  Client's non-payment), the Provider provides reasonable knowledge transfer and handover of
  repositories, contracts, harnesses and documentation, up to 20 hours of the Accountable Reviewer's
  time without charge and at the out-of-scope rate beyond that.

### 20. Limitation of liability
(A) NEITHER PARTY IS LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY OR
PUNITIVE DAMAGES, FOR LOST PROFITS, REVENUE OR GOODWILL, OR FOR REGULATORY FINES IMPOSED ON THE OTHER
PARTY, HOWEVER CAUSED.

(B) EACH PARTY'S TOTAL CUMULATIVE LIABILITY ARISING OUT OF THIS AGREEMENT IS LIMITED TO THE FEES PAID
AND PAYABLE BY THE CLIENT IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY.

(C) FOR A PARTY'S INDEMNITY OBLIGATIONS AND FOR BREACH OF SECTION 14 (CONFIDENTIALITY) OR SECTION 15
(SECURITY AND DATA PROTECTION), EACH PARTY'S TOTAL CUMULATIVE LIABILITY IS LIMITED INSTEAD TO THE
GREATER OF THE AMOUNT IN (B) AND THE PER-CLAIM LIMIT OF THE PROVIDER'S INSURANCE STATED ON THE COVER
PAGE.

(D) THE PROVIDER IS NOT LIABLE FOR LOSS ARISING FROM USE OF A DELIVERABLE IN PRODUCTION BEFORE ITS
ACCEPTANCE, OR OUTSIDE THE ENVIRONMENT AND CONFIGURATION DOCUMENTED IN IT.

(E) NOTHING IN THIS AGREEMENT LIMITS LIABILITY FOR FRAUD OR FRAUDULENT MISREPRESENTATION, WILFUL
MISCONDUCT, THE CLIENT'S PAYMENT OBLIGATIONS, OR ANY LIABILITY THAT CANNOT BE LIMITED UNDER THE
GOVERNING LAW.

The parties agree these limits are reasonable having regard to the fees, the Provider's size and
resources, and the insurance available to it.

### 21. Insurance
The Provider holds the insurance stated on the Cover Page from the Effective Date and throughout the
term, on a claims-made basis with continuous cover and a retroactive date no later than the
Provider's incorporation, and provides a certificate or policy schedule on request and on each
renewal. The Provider will not sign this Agreement unless technology professional-indemnity (errors
and omissions) cover including network-security and privacy liability is in force, with
jurisdiction covering the Client's country. The Client acknowledges that such policies usually do
not cover refunds of fees, service credits or contractual guarantees.

### 22. Compliance
Each party complies with anti-corruption, export-control and sanctions laws that apply to it. The
Provider complies with Indian laws that apply to its performance of the services, including
foreign-exchange, GST and information-technology laws. The Provider will support the Client's
regulatory obligations (including outsourcing and operational-resilience requirements of financial
regulators) by providing audit information, its security evidence pack, access to relevant records
on reasonable notice not more than once per year (or more often where a regulator requires), and
cooperation with regulator inquiries.

### 23. Dispute resolution
**23.1 Escalation.** The parties will first refer any dispute to the Client Executive Sponsor and the
Accountable Reviewer for good-faith negotiation for thirty (30) days. They may also agree to
mediation.

**23.2 Governing law and arbitration.** This Agreement is governed by the law selected on the Cover
Page, without regard to conflict-of-law rules. Any dispute not resolved under Section 23.1 will be
finally resolved by arbitration: for Options 1–3, administered by the Singapore International
Arbitration Centre under the SIAC Rules in force when the arbitration starts, seated in Singapore;
for Option 4, administered by the Mumbai Centre for International Arbitration under its rules then in
force, seated in Mumbai; in each case before a sole arbitrator, in English. Where the SIAC Rules
provide for a streamlined or expedited procedure, the parties agree it applies to the extent the
rules allow.

**23.3 Interim relief.** Either party may seek urgent interim relief from any court of competent
jurisdiction at any time, including to protect Confidential Information or IP.

### 24. General
Independent contractors. Assignment only with consent, except to a successor in a merger or sale of
substantially all relevant assets with notice; a change of the Provider's name or its conversion from
one class of company to another under the Companies Act, 2013 is not an assignment. Human
subcontractors only with the Client's prior written consent (not unreasonably withheld); the Provider
remains responsible for them and for its AI providers. Force majeure excuses delays from events beyond
reasonable control (excluding payment obligations), including a documented outage or withdrawal of an
AI System, but not the Provider's failure to maintain paid accounts with its AI providers; either party
may terminate if force majeure continues for more than thirty (30) days. Notices in writing to the
Cover Page addresses, with a copy by courier for notices of breach or termination. The Accountable
Reviewer signs only as an officer of the Provider and gives no personal guarantee. The Provider pays any
Indian stamp duty payable on its execution of this Agreement. Entire agreement (but nothing excludes
liability for fraudulent pre-contract statements); amendments only in signed writing; no waiver by
delay; severability; counterparts and electronic signatures valid to the extent permitted by law.
Sections 5 (accrued fees), 9 (for accepted Deliverables during the Warranty Period), 12.1, 13, 14, 18,
19.5–19.6, 20, 23 and 24 survive.

### 25. Pre-contract statements about the delivery model
The Client confirms that no statement made to it before signature suggested that the services would
be performed by a team of human engineers. If any such statement was made, Section 2 prevails and the
Client may terminate this Agreement before the Service Commencement Date for a full refund of any
amounts paid under it.

---

## Exhibit A — Delivery Capacity and Rate Card

| Element | Description |
|---|---|
| Accountable Reviewer | [Full name], Managing Director and CEO — the only human on the engagement: Client relationship, sprint planning, contract review with SMEs, review and approval of every Deliverable, sign-off dossiers, steering meetings and QBRs |
| Delivery Pipeline | Legacy ingest (Gemini long-context, paid API); specification audit, characterization tests, transpilation and parity review (Claude through Claude Code, commercial terms); automated parity gate; delivery reporting |
| Concurrent Work Orders | Up to **2** |
| Planned throughput | **6 Standard Work Order equivalents per month** (each Complex Work Order counts as 2.5) |
| Out-of-scope or extra-capacity work | At the out-of-scope rate on the Cover Page, only when pre-approved in writing; billed monthly in arrears |

The Capacity reflects the Accountable Reviewer's review time, which is the limiting factor; it can be
increased only by written change order.

## Exhibit B — Service Levels and Service Credits

All times are measured in Provider Business Days and Support Hours, and pause for documented
Client-responsibility delays and for any documented outage of an AI System listed in Exhibit E
(up to 3 Provider Business Days per Work Order).

| Service level | Target | Measurement |
|---|---|---|
| Work Order Turnaround — Standard | **5 Provider Business Days** from Verified Behavioral Contract publication to parity-gate approval of the pull request | Per Work Order |
| Work Order Turnaround — Complex | **10 Provider Business Days** | As above |
| Parity at Acceptance | 100% (contract and replay) | Per Deliverable |
| Defect response — P1 (production impact from an accepted Deliverable) | **4 Support Hours** | From Client report (by the agreed channel) to acknowledgement and start of triage by the Accountable Reviewer |
| Defect resolution — P1 | Workaround (which may be rollback to the legacy Module) advised within 1 Provider Business Day; fix within 5 Provider Business Days | |
| Defect response — P2 (behavioral deviation, no production outage) | 1 Provider Business Day | |
| Defect resolution — P2 | 10 Provider Business Days | |
| Weekly status note | Every week by the end of the Provider's last Business Day of that week | |
| Sign-off dossier | Every sprint by day 12 | |

There is no out-of-hours or 24×7 response. Reports received outside Support Hours are treated as
received at the start of the next Support Hours.

**Service credits** (percentage of the Monthly Retainer Fee for the month in which the failure
occurred):

| Failure | Credit |
|---|---|
| Each Standard/Complex Work Order delivered late against its turnaround target | 2% per Work Order |
| Each P1 resolution target missed | 3% per incident |
| Each P2 resolution target missed | 1% per incident |
| Weekly status note or dossier missed | 0.5% per occurrence |

Total service credits in any month are capped at **15%** of that month's Monthly Retainer Fee. The
Client must claim credits within 60 days of the month-end; the sign-off dossier computes them.

## Exhibit C — Work Order Template, Lifecycle and Comparison Rules

**Work Order fields:** Work Order ID (WO-YYYY-NNNNNN); Module ID (also the branch name
`modernize/<module-id>`); legacy source location and commit; Module size (lines, business rules);
classification (Standard/Complex); target language and service name; target repository; replay dataset
location and window; acceptance criteria (defaults per Section 7); p99 latency target; Client SME (role);
priority.

**Lifecycle:** draft → spec_published (Verified Behavioral Contract published; turnaround clock starts)
→ characterization_in_progress → transpilation_in_progress → parity_review → approved (clock stops) or
rejected (clock continues) → delivered (included in an accepted dossier).

**Comparison rules:** numeric values are compared as exact decimals at the legacy field's scale;
fixed-width text fields may be compared with trailing spaces removed where the legacy field is
space-padded; outputs must contain exactly the expected fields; expected errors must match by error code
and legacy return code; every expected state change must occur and no other state may change.

## Exhibit D — Data Processing Addendum (summary of required terms)

Executed only if personal data will be processed despite masking. It includes:
- the Provider's role as processor (GDPR/UK GDPR), data processor (India's Digital Personal Data
  Protection Act, 2023, section 8(2)) and service provider (California, 11 CCR §7051);
- processing only on documented instructions; confidentiality of the Accountable Reviewer; security
  measures per Section 15;
- the sub-processor list in Exhibit E with 30 days' notice of changes and an objection right;
- assistance with data-subject requests, impact assessments and the Client's transfer risk assessment,
  including an information sheet on Indian law relevant to the transfer (such as CERT-In reporting and
  government access powers under the Information Technology Act, 2000);
- incident notice as in Section 15; deletion or return at the end of the services; audit rights;
- **EU/EEA transfers:** EU Standard Contractual Clauses (Commission Decision (EU) 2021/914), Module 2 or
  Module 3, unaltered except for module selection and annexes (Annex I parties and processing; Annex II
  security measures; Annex III sub-processors);
- **UK transfers:** the UK International Data Transfer Agreement or the UK Addendum to the EU Standard
  Contractual Clauses;
- **India:** where personal data of individuals outside India is processed under a contract with a
  person outside India, the Act's obligations on the Provider are limited as section 17(1)(d) provides,
  but the Provider still maintains reasonable security safeguards; for Indian clients, full
  data-processor terms apply;
- **US financial clients:** contractual safeguards and periodic assessment rights supporting the
  Client's vendor-oversight duties (for example, 16 CFR 314.4(f));
- **Prohibited data:** HIPAA protected health information is not accepted unless the parties sign a
  business associate agreement and each AI provider used has signed a business associate agreement
  covering the exact services used; payment-card data and secrets or credentials are never accepted.

## Exhibit E — AI Systems and Sub-processors

| Function | Provider and service | Account type required | Data processed | Training / retention (per provider terms reviewed on the dates shown) |
|---|---|---|---|---|
| Legacy source ingest and behavioral extraction | Google — Gemini API (paid services) | Google Cloud project with active billing; Grounding with Google Search disabled for Client work | Client legacy source code | Paid-services prompts and responses not used to improve Google's products; processed under Google's data processing terms; logged for a limited period for abuse detection and required legal disclosures; may be cached in any country (Gemini API Additional Terms, effective 23 Mar 2026) |
| Specification audit, transpilation, parity review, delivery reporting | Anthropic — Claude API through Claude Code | API key or Team/Enterprise account under the Commercial Terms | Client source code, contracts, masked replay samples | No training on customer content; API inputs and outputs deleted within 30 days, except Files API use (not used for Client Materials), legal holds, and content flagged under the usage policy (up to 2 years); zero-data-retention requested where Anthropic offers it to the Provider (Anthropic Commercial Terms; Anthropic Privacy Center, 1 Jul 2026) |
| Outreach and administration | Anthropic — Claude | Commercial account | No Client Materials | — |

Unmasked personal data, secrets and credentials are never submitted to any AI System. The Provider
records the model and version used for each Work Order and reports them in the sign-off dossier.

---

## Signatures

**Client:** ______________________________

Name: ______________________________ Title: ______________________________

Signature: ______________________________ Date: ______________________________

**For and on behalf of [Provider legal name] Private Limited**
(authorised by resolution of its Board of Directors dated __________)

Name: [Full name] Title: Managing Director and Chief Executive Officer

Signature: ______________________________ Date: ______________________________
