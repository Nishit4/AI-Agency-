# CHANGES — commercial documents rewritten for an India-incorporated, one-human, AI-delivered company

Prepared 2026-10-13. These are drafts, not legal or tax advice. Nothing was sent, signed, filed,
registered or purchased. The originals in `/home/user/AI-Agency-/modernize-ai-agency` were not
edited.

**Files in this folder (same names as the originals):**

| File | Replaces |
|---|---|
| `pilot_scope_of_work_50k.md` | `sales_and_commercial/pilot_scope_of_work_50k.md` (now also holds the new Paid Assessment, Option A) |
| `retainer_agreement_100k.md` | `sales_and_commercial/retainer_agreement_100k.md` |
| `cto_outbound_pitch.md` | `sales_and_commercial/cto_outbound_pitch.md` |
| `outreach_schedule.yaml` | `config/outreach_schedule.yaml` |

Research items are cited as **[F]** formation, **[T-n]** tax item, **[L-n]** legal item and
**[V]** legal verification, matching the research JSON the drafts were built from. The URL given is
the primary source behind each item.

---

## 1. Why a rewrite was required

The original documents described a human delivery team that does not exist: a "pod lead 0.5 FTE,
senior engineers 2.0 FTE, parity QA 0.5 FTE", hourly rates for those roles, named key personnel,
background checks, a SOC 2 Type II report, USD 5M E&O and USD 5M cyber cover, 24×7 P1 response, and
"human engineers review every Deliverable". The pitch said "engineers verify them" and "took us a
dedicated team". For a company whose only human is the CEO, these are false statements of fact.

- **India:** under the Indian Contract Act s.17, stating as fact what is not true is fraud. Under
  s.18, even an innocent unwarranted assertion is misrepresentation. Either makes the contract
  voidable by the client under s.19. **[L-0], [L-1a]** —
  https://www.cag.gov.in/uploads/media/Indian-Contract-Act-1872-20200816140128.pdf
- **US:** deceptive under FTC Act s.5. The FTC requires competent evidence for accuracy claims
  ("no AI exemption"). **[L-1b]** —
  https://www.ftc.gov/news-events/news/press-releases/2025/08/ftc-approves-final-order-against-workado-llc-which-misrepresented-accuracy-its-artificial
- **UK:** misleading B2B advertising is an offence under the BPRs 2008 reg 6. **[L-1c]** —
  https://www.legislation.gov.uk/uksi/2008/1276/made

---

## 2. Pre-signature and pre-outreach checklist

Complete all of these before sending any SOW or MSA. Items marked † must also be done before the
first outreach email.

1. † **Incorporate the company.** A Private Limited Company is recommended; use an OPC only if
   there is no second director. Fill the legal name, CIN, PAN and registered office into every
   template. **[F]** — https://www.mca.gov.in/content/mca/global/en/help-faq/faqs/company-services/incorporation/spiceplus-linked-filings.html
2. **File INC-20A before the first invoice.** The company must not commence business or borrow
   until the declaration is filed (s.10A, due within 180 days of incorporation). **[F], [V]** —
   https://indiacode.ecourtsindia.com/companies-act/section/10A/
3. **Get a GSTIN, then file the LUT (RFD-11)** for the current financial year before the first
   export invoice. Renew it every 1 April. **[T-3]** —
   https://tutorial.gst.gov.in/userguide/refund/Furnishing_of_Letter_of_Undertaking_for_Export_of_Goods_or_Services.htm
4. **Open a USD-receiving current account** at an AD Category-I bank. Agree the monthly Export
   Declaration Form process with the bank, and get an IEC so you can generate e-BRCs. **[T-8], [T-9], [T-10]** —
   https://www.rbi.org.in/Scripts/BS_FemaNotifications.aspx?Id=13277 ; https://www.dgft.gov.in/CP/?opt=eBRC
5. **Bind insurance through an IRDAI-registered broker.** You need technology PI/E&O with
   network-security and privacy liability. Jurisdiction must expressly include the USA and Canada
   if clients are there. Set the retro date at incorporation. Disclose the AI-delivered model on
   the proposal form. Then fill in the Order Form insurance row. **[L-6]** —
   http://www.bluearmourinsurance.com/pdf/Corporate/Liability%20Insurance/Errors%20and%20Omissions%20Insurance/Technology/ICICI%20Lombard.pdf
6. **Move all client work to commercial AI accounts:**
   - an Anthropic API key or Team/Enterprise seat under the Commercial Terms (no personal Pro/Max login);
   - a billing-enabled Google Cloud project for the Gemini API, with Grounding with Google Search off.

   **[L-5a], [L-5b], [V]** — https://www.anthropic.com/legal/commercial-terms ; https://ai.google.dev/gemini-api/terms
7. **Write the security pack:**
   - an information-security policy and risk assessment;
   - an incident runbook with the CERT-In form and a 6-hour clock;
   - ICT logs kept for 180 days;
   - clocks synced to NIC/NPL NTP;
   - MFA and full-disk encryption evidence;
   - a data-flow diagram showing masked data only.

   **[L-2c], [L-2d]** — https://cert-in.org.in/Directions70B.jsp ; https://www.cert-in.org.in/PDF/FAQs_on_CyberSecurityDirections_May2022.pdf
8. † **Publish a privacy notice and write a short legitimate-interests assessment** for UK/EU-facing
   outreach. **[L-4c]** — https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/business-to-business-marketing
9. **Get a board resolution** authorising the CEO to sign client contracts. The signature blocks
   reference it.
10. **Set the Order Form fields:**
    - Assessment Fee
    - support hours and overlap window
    - holiday calendar
    - out-of-scope hourly rate
    - model names and versions in Section 3.1 / Section 2.1
11. **Arrange stamp duty.** Pay e-stamp duty in the company's state on each contract executed in
    India (Rs 500 in Maharashtra per research, unverified). **[L-7b]** —
    https://prsindia.org/files/bills_acts/bills_states/maharashtra/2024/Ord12of2024MH.pdf
12. **Get counsel review** of both contract templates, in India and in the governing-law
    jurisdiction you offer. **[L-8]**

---

## 3. Material changes and their basis

### 3.1 Changes common to the Pilot SOW and the Retainer MSA

| # | Change | Why | Research basis |
|---|---|---|---|
| C1 | Provider identified as "[legal name] Private Limited, a company incorporated in India", trading as LegacyModern AI, with CIN/PAN/GSTIN/IEC/LUT fields. The signature block is "for and on behalf of" the company, by the MD & CEO under a board resolution. New clause: the CEO gives no personal guarantee. | Limited liability only protects the founder if the company, not the founder, is the contracting party. Clients need the GST and LUT details for an export invoice. | [F] Pvt Ltd recommendation and caveat that a sole proprietorship gives unlimited liability — https://prsindia.org/files/bills_acts/acts_parliament/2013/companies-act%2C-2013.pdf ; [L-8] "signed by the CEO for a company with limited liability, never personally" |
| C2 | **New "Delivery Model and AI Disclosure" section** (SOW §3, MSA §2). It names the AI providers and paid account types and states that the CEO is the only human. It defines exactly what human review covers and says plainly that not every line of generated code is read by a human. It adds model-change notice and an objection right, and says AI can be wrong. A Client acknowledgement checkbox was added to the Order Form/Cover Page, and a clause (SOW §23, MSA §25) gives the Client a full-refund exit before kickoff if anyone ever implied a human team. | This removes the false statements and turns honest disclosure into a contract term. Saying "a human reviewed every line" would itself be a new misrepresentation. | [L-0], [L-1a] (Contract Act ss.17–19; recommended "AI-Performed Delivery" clause and Cover Page acknowledgement); [L-1c] Misrepresentation Act 1967 s.3 — https://www.legislation.gov.uk/ukpga/1967/7/section/3 |
| C3 | Removed "Human engineers review every Deliverable", "keep human engineers accountable" and "by appropriately qualified personnel". Replaced them with the Accountable Reviewer wording. | These were false. | [L-0] |
| C4 | Removed SOC 2 Type II alignment and report and the "aligned to ISO 27001" claim. Replaced with a written security policy, listed minimum controls, an explicit statement that the company holds no SOC 2 report or ISO 27001 certification, and an offer of a questionnaire plus an evidence pack. | No audit has been done, so the company cannot claim either. Listing controls is honest and supports US financial clients' vendor-oversight duties. | [L-0] ("SOC 2 report: not available; security questionnaire and evidence pack available"); [L-3c] 16 CFR 314.4(f) — https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-314 |
| C5 | Insurance: deleted the USD 5M E&O, USD 5M cyber, USD 2M CGL and workers' comp covenant. Replaced it with "insurance as stated in the Order Form" (insurer, policy, limit, territory/jurisdiction, retro date, expiry). Added an obligation not to sign unless PI/E&O with cyber cover is in force, and a statement that refunds and guarantees are usually uninsured. | The company holds none of the old cover. Workers' comp is irrelevant with no employees. E&O wordings typically exclude liquidated damages and refunds. | [L-6] — https://bluearmourinsurance.com/pdf/Corporate/Liability%20Insurance/Errors%20and%20Omissions%20Insurance/Technology/TATA%20AIG.pdf ; https://www.hdfcergo.com/commercial-insurance/information-technology-insurance-policy |
| C6 | **Fees in USD; export-of-services invoicing.** The client must be the foreign entity, paying in convertible foreign exchange from abroad; if it pays via an Indian affiliate or in INR, Indian GST is added. Each invoice carries the LUT endorsement and "without payment of integrated tax". | Zero-rating needs all five export conditions in IGST s.2(6). The LUT route under s.16(3) is the only zero-rating route since 1 Oct 2023. Rule 46 sets the invoice endorsement. | [T-2] — https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/acts/2017_IGST_Act/active/chapteri/section2_v1.00.html ; [T-3] — https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/acts/2017_IGST_Act/active/chaptervii/section16_v1.00.html ; [T-4] — https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/rules/cgst_rules/active/chapter6/rule46_v1.00.html |
| C7 | **Payment route.** Invoices above INR 25 lakh equivalent are paid only by SWIFT to an AD Category-I bank. A licensed cross-border payment aggregator (PA-CB) is allowed only below that. No invoice splitting. | The RBI caps PA-CB transactions at Rs 25 lakh. The $50k pilot installments and the $100k retainer invoices exceed it. Splitting would be improper. | [T-11], [V] — https://www.rbi.org.in/scripts/BS_ViewMasDirections.aspx?id=12896 (para 11(d)) |
| C8 | **Bank charges and realisation.** The client remits with charges "OUR" so the full amount lands; deductions are added to the next invoice. The MSA adds an acknowledgement of the Indian realisation period. Net-30 terms are kept, well inside 9 months. | Export proceeds must be realised in full within 9 months of the invoice date (from 1 Oct 2026). Short receipts need AD-bank approval. Under GST rule 96A, IGST plus interest falls due if payment is late beyond 1 year or the FEMA period. | [T-8], [V] — https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13277&Mode=0 ; [T-3] rule 96A — https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/rules/cgst_rules/active/chapter10/rule96a_v1.00.html |
| C9 | **Withholding tax.** The contracts state that services are performed in India. The Provider supplies W-8BEN-E, an Indian tax residency certificate and treaty forms. If withholding still applies: gross-up by default, or (Order Form option) net payment with an official withholding certificate within 30 days. | The original said only "gross-up". Stating where services are performed matters because US sourcing of service income follows the place of performance, and Canada's Regulation 105 withholding applies only to services rendered in Canada. The net option gives the CEO a fallback in negotiations. | IRS source rules — https://www.irs.gov/individuals/international-taxpayers/nonresident-aliens-sourcing-of-income ; https://www.irs.gov/individuals/international-taxpayers/source-of-income-personal-service-income ; W-8BEN-E — https://www.irs.gov/instructions/iw8bene ; Canada Reg. 105 — https://laws-lois.justice.gc.ca/eng/regulations/C.R.C.%2C_c._945/section-105.html (researched this session; other countries' rules **unconfirmed**) |
| C10 | **Indian clients.** GST at the applicable rate is added. INR payment is an option. The Udyam number and the MSMED payment period apply if the company registers as micro/small. | Supplies to Indian clients are not exports. MSMED Act ss.15–16 limit buyer payment periods to 45 days. | [T-2]; [T-19] — https://www.rbi.org.in/scripts/FAQView.aspx/FAQView.aspx?Id=84 |
| C11 | **Governing law and disputes.** The Delaware law and Wilmington courts clause was replaced with Order Form options: (1) England & Wales law + SIAC, Singapore seat (default); (2) Singapore law + SIAC; (3) New York law + SIAC; (4) Indian law + MCIA, Mumbai seat. Sole arbitrator, English, streamlined/expedited procedure where the rules allow, an escalation step and an interim-relief carve-out. | A US court judgment cannot be executed directly in India because the US is reportedly not a CPC s.44A reciprocating territory. Arbitral awards are enforceable in India from New York Convention notified territories, which include the USA, UK, Singapore, Canada and Australia. This also makes the company's own fee claims enforceable abroad. | [L-7a] — https://siac.org.sg/siac-rules-2025 ; https://www.mcia.org.in/pdfs/MCIA-Rules-2025.pdf ; https://indiacode.ecourtsindia.com/cpc/section/44A/ ; [V] confirmed the SIAC Streamlined/Expedited thresholds; the s.44A list is **unverified** |
| C12 | **Data protection.** Masked data remains the default. A prohibited-data list was added: sensitive personal data, PHI, payment-card data and credentials. Roles are stated: GDPR/UK GDPR processor, DPDP data processor (s.8(2)), CCPA service provider. The DPA summary now names EU SCCs Module 2/3 (Decision 2021/914, unaltered), the UK IDTA/Addendum, a transfer information sheet on Indian law, DPDP s.17(1)(d) for foreign-client data, the 11 CCR §7051 terms, and GLBA vendor-oversight support. PHI is refused unless BAAs exist down the chain. | These are the transfer mechanisms and processor terms clients will ask for. Refusing unmasked data keeps most of this dormant. | [L-2a], [L-2b] — https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf ; https://indiankanoon.org/doc/39355046/ ; [L-3a] — https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32021D0914 ; https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/appropriate-safeguards/what-are-standard-data-protection-clauses-the-uk-idta-and-the-addendum/ ; [L-3b] — https://www.law.cornell.edu/regulations/california/11-CCR-7051 ; [L-3d] — https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html |
| C13 | **Breach notice.** Changed from "within 48 hours of confirmation" to "within 24 hours of becoming aware, and no later than any report to CERT-In". 180-day log retention is stated. | CERT-In requires a body corporate to report listed incidents within 6 hours of noticing them. Telling the client later than the regulator would be indefensible. Logs must be kept for a rolling 180 days. | [L-2d], [V] — https://www.cert-in.org.in/PDF/FAQs_on_CyberSecurityDirections_May2022.pdf |
| C14 | **AI Systems / sub-processor schedule** (SOW Schedule 1, MSA Exhibit E). It shows provider, required account type, data processed, and training/retention per terms (with dates). Grounding with Google Search is disabled for client work, and the Files API is not used. | Accurate retention disclosure. Google keeps grounding data for 30 days even on paid tier. Anthropic's 30-day deletion has exceptions. Consumer and free tiers can train on or human-review content. | [L-5a] — https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data ; https://code.claude.com/docs/en/data-usage ; [L-5b], [V] — https://ai.google.dev/gemini-api/terms |
| C15 | **Limitation of liability.** The caps are kept: SOW = fees paid/payable; MSA = 12 months' fees. Changes: the old uncapped "Excluded Claims" (indemnities, gross negligence) and the MSA's 3× super-cap for confidentiality/security are replaced by a super-cap equal to the greater of the general cap and the insured per-claim limit. Uncapped now: only fraud, wilful misconduct, payment obligations and non-excludable liability. Added exclusions for regulatory fines and for production use before acceptance or outside the documented configuration. Added a reasonableness recital. | An uncapped or 3× exposure is uninsurable for a solo company. Caps must look reasonable to survive UCTA s.11 (the court weighs resources and insurance). | [L-8]; [L-1c] UCTA s.11(4) — https://www.legislation.gov.uk/ukpga/1977/50/section/11 |
| C16 | **Parity guarantee precision.** "Parity" is now measured only against the Acceptance Test Suite, on the delivered commit, in the documented environment. An explicit sentence says it is not a promise of identical production behavior. The 100% contract and 100% replay criteria and all objective comparison rules are unchanged. | The 100% claim stays, but it must be substantiated and must not be read broadly. | [L-8](b); [L-1b] FTC substantiation |
| C17 | **Continuity / key-person clauses** (new SOW §9, MSA §12). Notice of unavailability; pilot exit with pro-rata refund after 5 Provider Business Days; retainer suspension or penalty-free exit after 10; daily commit of work to the client repo; planned-leave allowance (15 days a year, 20 business days' notice). | One human is a single point of failure. Clients and their regulators will ask about it, and an honest answer must be in the contract. | [L-8](e) |
| C18 | **Provider Business Days and Support Hours** (10:00–19:00 IST plus an up-to-2-hour overlap window set in the Order Form). Explicit "no 24×7" statement. | One person in India cannot meet 24×7 or US-business-day SLAs. | [L-0] ("P1 acknowledgement in business hours (IST) with a stated overlap window"); [L-8](e) |
| C19 | **Force majeure** now covers documented AI-provider outages and model withdrawal, but not failure to keep paid accounts. A model-change notice with a termination right was added. | Delivery depends on third-party models. | [L-8] |
| C20 | Removed **non-solicitation of personnel** (pilot and MSA). | There are no Provider personnel to protect, and the clause implied a team. | [L-0] |
| C21 | The conversion of the company (e.g. OPC → Pvt Ltd, INC-6) or a name change is now **not an assignment**. | Lets the founder start as an OPC and convert later without re-papering clients. | [F] OPC conversion — https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=1694828 |
| C22 | **IP clause** now notes that the copyright status of AI-generated output may vary by jurisdiction. The Provider assigns whatever rights it holds, passes on Anthropic's output ownership, and warrants it has not licensed them elsewhere. | Avoids an implied warranty the company cannot back. | [L-5a] Anthropic Commercial Terms (customer owns outputs). The jurisdiction-specific copyright position was **not researched (unconfirmed)**. |
| C23 | **Stamp duty** is borne by the Provider. "Electronic signatures valid to the extent permitted by law". The entire-agreement clause does not exclude liability for fraudulent pre-contract statements. | Unstamped instruments are inadmissible in evidence in India until the duty is paid (though not void). Non-reliance clauses cannot cure false statements. | [L-7b] — https://api.sci.gov.in/supremecourt/2022/40099/40099_2022_1_1501_49105_Judgement_13-Dec-2023.pdf ; [L-1a] |
| C24 | **Optional background check** of the CEO, at the Client's cost and with consent. Replaces "personnel undergo background checks". | Offers only what is true and possible. | [L-0] |

### 3.2 Pilot SOW (`pilot_scope_of_work_50k.md`) only

| # | Change | Why | Basis |
|---|---|---|---|
| P1 | **New Option A — Paid Assessment.** One program of up to 5,000 lines. Deliverables: analysis, Verified Behavioral Contract, characterization tests, a parity demonstration (modern implementation run against the contract and an optional sample replay set) and a quotation, within 10 Provider Business Days. **The price is an Order Form field the CEO sets.** Paid in advance. Optional 100% credit against a pilot within 30 days. No parity guarantee; the remedy for non-delivery is a refund less delivered work. | A lower-risk first purchase for first clients, as the brief requested. Small invoices can go through a licensed PA-CB if they stay below Rs 25 lakh. | Task brief; [T-11] |
| P2 | **Pilot kept at USD 50,000 fixed, up to 50,000 lines.** The schedule is now tiered: **14 calendar days up to 20,000 lines; 21 calendar days for 20,001–50,000 lines**. One pilot at a time; the Kickoff Date is a reserved slot. | One human reviewing a contract for a 50,000-line module in 14 days is the riskiest commitment in the original. The tier keeps the 14-day offer for most modules. **CEO decision — see Q2.** | [L-8](e) capacity risk |
| P3 | Cure period changed to 10 **Provider** Business Days. Refund mechanics are unchanged (2nd installment not payable + USD 12,500 refund, sole and exclusive remedy). | Business days measured on the Provider's calendar. | [L-8] |
| P4 | Client responsibilities now include keeping the legacy system running for rollback, SME time within support or overlap hours, and the prohibited-data list in masking. | The Provider does not operate production and has no 24×7 support. | [L-8] |
| P5 | Section 10 "Personnel" (pod lead + senior engineer) and Section 11 "Use of AI" ("Human engineers review every Deliverable") replaced by Section 3 and Section 10. | False statements removed. | [L-0] |
| P6 | Section numbering changed. General terms now run 11–24, with Schedules 1–2 added. | Structure. | — |

### 3.3 Retainer MSA (`retainer_agreement_100k.md`) only

| # | Change | Why | Basis |
|---|---|---|---|
| R1 | The "Dedicated delivery pod" and **Exhibit A pod/FTE table and role rate card are deleted**. They are replaced by "Delivery Capacity": the Accountable Reviewer plus the Delivery Pipeline, and one out-of-scope hourly rate for the CEO set on the Cover Page. | False FTE claims removed. | [L-0] |
| R2 | **Capacity cut** from 3 concurrent / 12 standard WOs a month to **2 concurrent / 6 standard WO equivalents a month** (default, changeable by change order). A **capacity-commitment** clause promises not to over-sell. | Review time of one human is the bottleneck. **CEO decision — see Q3.** | [L-8](e) |
| R3 | **Turnaround SLA** moved from 72 h / 120 h to **5 / 10 Provider Business Days**. The clock pauses for client delays and documented AI-provider outages (max 3 days per WO). | Achievable by one reviewer across 2 concurrent WOs. | [L-8](e) |
| R4 | **Support SLAs.** P1 changed from "4 h, 24×7, engineer engaged" to **4 Support Hours acknowledgement**, workaround advice (which may be rollback) within 1 Provider Business Day, and fix within 5. P2: response in 1, fix in 10 Provider Business Days. "No 24×7" is stated. | One person cannot be on call around the clock. | [L-0]; [L-8](e) |
| R5 | **Service credits and the 15% monthly cap are kept.** Credits are stated to be a price adjustment, not a penalty. | Keeps commercial teeth. Indian Contract Act s.74 allows only reasonable compensation (not re-verified). | [L-8](g) |
| R6 | **"Zero-Regression Warranty" renamed "Parity Warranty".** The 90-day warranty against the contract and replay set is kept. The "behaviors not captured in the contract" warranty is downgraded to a re-performance commitment within Capacity, with no credits, refunds or damages. The sole remedy is correction, then a per-Deliverable refund. | "Zero regression" is an unqualified efficacy claim. Warranting uncaptured behavior is unbounded. | [L-1b]; [L-8](b) |
| R7 | **Governance** simplified to meetings with the CEO in support or overlap hours. The steering committee no longer lists a "delivery director". | No such role exists. | [L-0] |
| R8 | **Transition assistance**: 20 hours of the CEO's time free, then the out-of-scope rate (previously 40 hours at the pod rate card). | Realistic for one person. **See Q6.** | [L-8] |
| R9 | **Termination for convenience after month 6** (60 days + one month's fee) is kept. Added: penalty-free exits for a key-person event (>10 Provider Business Days) and for unresolved model-provider objections. | Continuity. | [L-8] |
| R10 | Exhibit D DPA summary expanded (see C12). Exhibit E rewritten (see C14). | — | [L-3a]–[L-3d], [L-5a]–[L-5b] |

### 3.4 Outbound playbook (`cto_outbound_pitch.md`)

| # | Change | Why | Basis |
|---|---|---|---|
| O1 | **New Section 1 "Honesty rules"**: first-person singular, banned team language, AI delivery never hidden, qualified parity claims, no unheld certifications, real sender name. | No email may imply a team. | [L-0], [L-1b], [L-4a] — https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business |
| O2 | **Every email rewritten** to remove "we", "engineers verify them", "took us a dedicated team", "dedicated pod", "SOC 2-aligned controls", "Humans review everything" and the "72-hour SLA". Replaced with "I review and sign off". | False statements removed. | [L-0] |
| O3 | **One-line AI-delivery disclosure** (verbatim, §1.2). It is optional in touch 1 and **mandatory** before any pricing, scope or SOW, and in partner emails. A disclosure was also added to the opening minute of the discovery-call script and to the qualification criteria. | Disclosure must happen before contract (Contract Act s.17 duty to speak once positive statements are made). | [L-0], [L-1a] |
| O4 | **Required footer**: legal entity name, Indian registered postal address, a "commercial message" ad disclosure, the opt-out line and a privacy-notice link. | CAN-SPAM requires an ad identification, a physical postal address and an opt-out. UK GDPR requires transparency at first contact. CASL requires sender identification. | [L-4a]; [L-4b] — https://crtc.gc.ca/eng/com500/guide.htm ; [L-4c] |
| O5 | **ICP moved to mid-market** (revenue roughly USD 50M–2B), adding IBM i/RPG, credit unions, TPAs and logistics. **New Sequence C for channel partners.** Partner fees only by written agreement; nothing of value to end-client employees. Large enterprises needing SOC 2 or large insurance are approached only via partners or inbound. | Buyers a one-person vendor can realistically pass procurement with. Brief requested channel partners. Anti-corruption. | Task brief; [L-3c] (enterprise vendor oversight expectations) |
| O6 | **Pricing reply** now lists Assessment / Pilot / Retainer with the new capacity and the delivery disclosure. The retainer is described as "reserved capacity of my AI delivery pipeline", not a pod. | Consistency with the contracts. | — |
| O7 | **New objections and answers**: "So it's just you?", "What if you get sick?", "SOC 2?", "Insurance?" (quote only bound cover), "You're in India — contracts and payment?", "24×7?". "Send me a case study" now says plainly there is none yet. | Prepared, honest answers to the questions this model will draw. | [L-0], [L-6], [L-7a] |
| O8 | Briefing slides 5, 8 and 9 rewritten: one human, pipeline capacity, no SOC 2, key-person terms; "regulator-ready" softened to "for your auditors". | Removes unsupported claims. | [L-0], [L-1b] |
| O9 | **"Path to $1M MRR" (10 retainers) removed** and replaced by a **capacity ceiling** rule. Assessment conversion metric added. | Ten retainers of 6 WOs a month each is far beyond one reviewer. Planning toward it would push the CEO to over-sell capacity. | [L-8](e) |

### 3.5 Outreach configuration (`outreach_schedule.yaml`)

| # | Change | Why | Basis |
|---|---|---|---|
| Y1 | Time zone changed from `America/New_York` to `Asia/Kolkata`. Send windows remain recipient-local. Mode stays `draft_for_approval`; auto-send also needs counsel review. | CEO is in India; the CEO sends every message. | — |
| Y2 | **Geography.** Removed Germany (already opt-in only). Moved **Ireland, Netherlands and the Nordics to `regions_on_hold`**. Kept US, Canada, UK, Australia, Singapore and India. | Germany needs prior consent even for B2B. NL/Nordic rules were not researched, and Ireland reg 13(2) could not be verified. | [L-4d], [V] — https://dejure.org/gesetze/UWG/7.html ; Ireland **unverified** |
| Y3 | **Singapore per-country caps** (20/day, 300 per 30 days, 3,000/year). | The Spam Control Act "bulk" thresholds are >100 per 24 h, **>1,000 per 30 days** or >10,000 per year. The old caps (about 45/day ≈ 1,350/month) could cross the 30-day limit. | [V] correction — https://sso.agc.gov.sg/Act/SCA2007 |
| Y4 | **Market rules block** per country. **Provenance columns** added to the tracker (`email_source_url`, `captured_at`, `evidence_path`, `conspicuously_published`, `role_relevance_note`), plus `country`, `company_legal_form` and `ai_disclosure_given`. Address guessing banned for CA/AU. | CASL and the Spam Act allow implied consent only for conspicuously published, role-relevant addresses, and the sender carries the burden of proof. PECR exempts only corporate subscribers. | [L-4b]; [L-4e], [V] — https://www.acma.gov.au/avoid-sending-spam ; [L-4c] |
| Y5 | Compliance additions: ad disclosure, legal entity and address, privacy link, opt-out kept working for 60 days, LIA path. The 24-hour opt-out handling is kept (stricter than the US/CA/SG 10-business-day and AU 5-business-day rules). | — | [L-4a], [V] (CASL 10 business days; AU 5 business days confirmed) |
| Y6 | ICP segments: mid-market buyers (USD 50M–2B, 200–10,000 employees) and channel partners. New persona and partner sequence C. Excludes UK sole traders/partnerships and enterprises requiring SOC 2 or insurance we lack. | See O5. | [L-4c] |
| Y7 | **Banned phrases** now include team and credential language ("our team", "our engineers", "dedicated pod", "zero regressions", etc.). A separate `banned_claims` list ("SOC 2", "ISO 27001", "insured for") may appear only in replies that state the company does *not* hold them. | Enforces O1 in the agent. | [L-0] |
| Y8 | Sender: the CEO's real name and "Founder & CEO", plus legal entity name, privacy URL and assessment fee from env vars. Owner is always the CEO. Daily report has a capacity guard. | — | [L-4a] |

---

## 4. Deliberately kept

- USD 50,000 pilot fee, 25k/25k installments, net 30, 1%/month late interest, the 30-day retainer
  credit of the full pilot fee.
- **All acceptance criteria**: 100% contract parity, 100% replay parity (0.5% infrastructure
  exclusion), ≥ 90% branch coverage, documented build/test, p99 ≤ 250 ms. Also the comparison rules,
  the 5-Business-Day acceptance window, deemed acceptance, and production use counting as
  acceptance.
- Parity Guarantee remedy (USD 12,500 refund + 2nd installment waived) as sole and exclusive remedy.
- USD 100,000/month retainer, 12-month term, renewal and 5% cap, termination for convenience after
  month 6, chronic-SLA termination, service-credit table and 15% cap, 90-day warranty period.
- IP model (assignment on payment; Provider Materials licensed), confidentiality terms, IP
  indemnity (now within the super-cap), open-source restrictions.
- Liability cap amounts (fees under the SOW; 12 months' fees under the MSA).
- Every compliance rule in the outreach config: draft-only default, opt-out line, 24 h opt-out
  handling, DE/AT opt-in, no purchased lists without provenance, 730-day retention, banned phrases,
  claims policy.

---

## 5. Follow-ups outside these four files (repo is read-only; not edited)

The following repo files still contain wording that conflicts with the new documents. Change them
before using the agents with clients or prospects:

- `README.md` line 7 ("dedicated delivery pod", "$1,000,000 MRR"), the §7 operating-cadence table
  ("Pod lead", "Delivery director"), and lines 119/126/176 recommending **free-tier** Gemini keys.
  Free-tier content is used to improve Google products and can be read by human reviewers, so it
  must never touch client code. Restrict free-tier keys to the public LNFEE010 sample. [L-5b]
- `agents/06_daily_client_outreach.md`: "engineering-led firm" (line 13) and "pod lead" routing
  (lines 58, 157–159). Point these to the CEO, and load the new honesty rules and banned phrases.
- `agents/02`–`05`, `CLAUDE.md` and `config/pod_config.yaml`: "pod lead" and "delivery director"
  roles. Rename them to "CEO (Accountable Reviewer)". Align `max_concurrent_per_pod: 3`,
  `planned_work_orders_per_month: 12` and `sla_hours: 72/120` with Exhibit A/B (2 concurrent, 6 a
  month, 5/10 Provider Business Days).
- `mcp_bridge`: enforce [L-5b] in code. Refuse client ingest unless a configured, billing-verified
  Google Cloud project ID is present. Set `WORK_ORDER_SLA_HOURS` to match Exhibit B.

---

## 6. Open questions the CEO must decide

1. **Entity type and name.** Pvt Ltd (needs a trusted second director and shareholder) or OPC
   (convert later via INC-6)? Is "LegacyModern AI" cleared against MCA name rules 8/8A and a
   trademark search? The templates use "[legal name] Private Limited, trading as LegacyModern AI".
   [F]
2. **Pilot schedule tiering.** Accept 14 days up to 20,000 lines and 21 days above? Alternatives:
   cap the pilot at 20,000 lines, or keep 14 days for all sizes and accept the risk.
3. **Retainer capacity vs price.** Is USD 100,000/month for 2 concurrent / 6 standard WOs a month a
   price you can defend, and is 6 a month realistic for your review time? Should you also cap how
   many retainers you hold at once? (The playbook now has a capacity-ceiling rule, but the number is
   yours.)
4. **Assessment Fee** amount, and whether to credit it 100% against a pilot. Keeping it under the
   INR 25 lakh equivalent allows payment-aggregator collection.
5. **Support hours and overlap window** for US/Canada clients (e.g. a 2-hour evening-IST window).
   Also your holiday calendar and leave allowance (15 days a year?).
6. **Transition assistance**: 20 free hours enough? And what out-of-scope hourly rate?
7. **Liability structure.** Accept the change making gross negligence capped (super-cap) rather
   than uncapped? Some clients, and some US states, will resist. What insurance limit can you buy
   (this sets the super-cap)? Is the 12-month general cap on the retainer acceptable, or do you want
   the 3–6 months research suggested?
8. **Default governing law** for foreign clients: England & Wales (default in templates),
   Singapore, or New York? Do you accept SIAC costs as the dispute forum for small claims?
9. **Withholding fallback.** Will you offer the "net payment with certificate" option, or insist on
   gross-up? Confirm treaty positions per client country with your CA (only US sourcing and Canada
   Reg. 105 were checked).
10. **Income-tax regime.** s.200 (22%, irrevocable) or the normal regime plus a possible 80-IAC
    holiday? This does not change the contracts but affects pricing margin. [T-12], [T-18]
11. **Software vs services classification** for EDF and purpose codes (P0807 vs P0802). Agree it
    with your AD bank; the invoice remittance-reference field depends on it. [T-9], [T-10]
12. **Healthcare prospects.** Keep them in the ICP on a masked/synthetic-data-only basis, or exclude
    them until BAA availability from Anthropic and Google for the exact services is confirmed?
    [L-3d]
13. **Partner model.** Referral fee, subcontract or white-label? A white-label arrangement must
    still disclose AI delivery to the end client if your work product reaches them. Decide before
    sending Sequence C.
14. **Ireland, Netherlands, Nordics.** Get counsel confirmation to lift `regions_on_hold`, or leave
    them for inbound and partners only?
15. **Zero data retention.** Ask Anthropic whether ZDR is available to your account for regulated
    clients, and whether Google offers anything shorter than "a limited period" logging.

---

## 7. Items relied on but not confirmed

| Item | Status | Where used |
|---|---|---|
| CPC s.44A: US/Canada/Australia not reciprocating territories | Secondary sources only; not checked against the Gazette [V] | C11 rationale |
| Ireland S.I. 336/2011 reg 13(2) B2B exception | Could not retrieve the statute [V] | Y2 (held) |
| Maharashtra Rs 500 agreement stamp duty; other states' rates | Not verified [V] | Checklist item 11 |
| Indian Contract Act s.74 application to service credits | Not re-verified [L-8] | R5 |
| Copyright in AI-generated output by jurisdiction | Not researched | C22 |
| Withholding on services in UK, Australia, Singapore and other countries | Not researched (only US sourcing and Canada Reg. 105 checked this session) | C9 |
| Indian form number for a tax residency certificate under the Income-tax Act, 2025 | Not researched; the templates say "tax residency certificate issued by the Indian income-tax authorities" | C9 |
| GST rate on domestic IT services after Sept 2025 | Not verified [T caveats]; templates say "rate applicable at the time of supply" | C10 |
| Insurance premium for US-facing tech E&O | No published rates [L-6] | Checklist item 5 |
| Whether Anthropic/Google sign HIPAA BAAs for the services used | Not verified [L-3d] | C12, Q12 |
| DPDP core-duty date | About 13–14 May 2027 per [V] correction (not 12–13 May); watch the Gazette | Y4 (IN rule) |
| Austria opt-in basis (TKG 2021 s.174) | Carried from the original config, not re-verified | Y2 |
