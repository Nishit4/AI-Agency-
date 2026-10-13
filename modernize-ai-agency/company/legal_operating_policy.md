# Legal Operating Policy

**Company:** `[COMPANY NAME] Private Limited` (CIN `[CIN]`), referred to below as "the Company"
**Version:** 1.0, drafted 13 October 2026. It is to be adopted by board resolution at the first board meeting.
**Applies to:** the CEO, the second director, and every AI agent or automation operated by the Company (Gemini ingest, Claude Code agents 02–05, outreach agent 06).

**Status of this text:** this policy binds the Company's own conduct. It is **not legal advice**. Have a lawyer in India, and in each client's governing-law jurisdiction, review it before the first contract. Statements marked **(confirm with counsel/CA/CS)** were not verified against a primary source.

The words **MUST** and **MUST NOT** mark mandatory rules. A breach is reported to the board at the next meeting (§10).

---

## 1. Truthful representation and AI-delivery disclosure

### 1.1 Why this is the first rule

The Company has one human, the CEO. All delivery work is done by AI systems. Implying a human delivery team that does not exist is legally dangerous in every market the Company sells to:

- **India:** it is fraud under Indian Contract Act **s.17**, or misrepresentation under **s.18**, which makes the contract **voidable** by the client under **s.19** ([Contract Act](https://www.cag.gov.in/uploads/media/Indian-Contract-Act-1872-20200816140128.pdf)).
- **US:** it is deception under **FTC Act s.5**. The FTC says there is "no AI exemption from the laws on the books" ([FTC, Operation AI Comply](https://www.ftc.gov/news-events/news/press-releases/2024/09/ftc-announces-crackdown-deceptive-ai-claims-schemes)).
- **UK:** it is misleading B2B advertising, an **offence** under the Business Protection from Misleading Marketing Regulations 2008, **reg 6** ([BPRs](https://www.legislation.gov.uk/uksi/2008/1276/made)). Under the Misrepresentation Act 1967 s.3, exclusion clauses do not reliably cure it.

Entire-agreement and non-reliance clauses **MUST NOT** be relied on to cure false statements made before the contract.

### 1.2 Mandatory disclosure texts

These texts are used **verbatim**, with only the bracketed fields completed.

**(a) Website: "How we deliver" section (on the home page or one click from it)**

> **How we deliver.** [COMPANY NAME] Private Limited is an AI-delivered engineering company. Our modernization work (legacy code analysis, behavioural specification, translation into Go or TypeScript, and parity testing) is performed by automated AI systems that we operate, currently Google Gemini models for legacy code analysis and Anthropic Claude models for specification, translation and testing. Our founder and CEO, [FULL NAME], is the only human in our delivery process. [He/She] reviews the evidence for every deliverable, approves it, and is accountable for it on the company's behalf. We do not employ a team of human engineers. We do not currently hold a SOC 2 report; our security questionnaire and evidence pack are available on request. We use AI models only under paid, commercial terms that prohibit the provider from training on client content.

**(b) Contract clause: insert in every SOW, Work Order and MSA as a numbered clause**

> **AI-Performed Delivery.** The Services are performed by automated artificial-intelligence systems operated by the Provider, currently Google Gemini [MODEL/VERSION] for legacy code analysis and Anthropic Claude [MODEL FAMILY/VERSION] for specification, transpilation and testing. The Provider's Chief Executive Officer, [FULL NAME], is the sole human who reviews and approves Deliverables and is accountable for them on the Provider's behalf. No other human personnel are assigned to the Services. The Provider will record the models and versions used for each Work Order and will give the Client at least thirty (30) days' notice before adding a new AI model provider that processes Client source code. The Client may object on reasonable grounds.

**(c) Contract cover page: acknowledgement initialled by the client signatory**

> The Client acknowledges that, before signing, the Provider informed it that the Services are performed by AI systems and that the Provider's CEO is the only human reviewer and approver of Deliverables.

**(d) Proposal or pitch deck: on the first content page**

> Delivery model: AI systems do the engineering work; [FULL NAME], CEO, personally reviews and signs off every deliverable. There is no human engineering team.

**(e) Email signature (all business email)**

> [FULL NAME] · Chief Executive Officer · [COMPANY NAME] Private Limited
> AI-delivered legacy modernization: engineering work is performed by AI systems and reviewed and signed off by me.
> Registered office: [ADDRESS] · CIN [CIN] · [PHONE] · [WEBSITE]

The registered-office, CIN and contact details are included because s.12(3)(c) of the Companies Act requires them on business letters and similar communications. Whether that extends to email was not verified (**confirm with your CS**).

**(f) First sales call: the CEO says this in the first 5 minutes**

> "Before we go further: I run this company alone. The engineering work is done by AI systems I operate. I review the evidence and sign off every deliverable personally. You will never be dealing with a hidden team."

### 1.3 Prohibited statements

The following **MUST NOT** appear in any website, email, deck, proposal, contract or call. Claims listed as "until true" may be used only once they are true and the evidence is on file.

| Prohibited | Use instead |
|---|---|
| "our engineers", "our team", "pod lead", "senior engineers", "dedicated team", "FTE" | "our AI delivery system", "the CEO reviews and signs off" |
| Hourly rates for human roles (e.g. "Senior Modernization Engineer USD 300/hour") | Fixed fees per pilot / retainer / Work Order |
| "Human engineers review every Deliverable" | "The CEO reviews the parity evidence for every Deliverable" |
| "SOC 2 Type II", "SOC 2-aligned", "ISO 27001 certified" (until true) | "SOC 2 report: not available; security questionnaire and evidence pack available" |
| "24x7 response", "P1 engineer engaged in 4 hours" | Response windows in IST business hours with a stated overlap window (§8) |
| "USD 5M PI + USD 5M cyber + USD 2M CGL + workers' comp" (unless bound) | The cover actually bound, with its limits (§6) |
| "zero regressions", or "100% parity" without qualification | "100% parity on the agreed acceptance test suite and replay dataset, as defined in the SOW" |
| Named or implied client references, logos, case studies, team size (until true and permitted) | "We are early; here is our public demonstration (LNFEE010, 31 assertions)" |
| Sender names or personas other than the CEO; fake "Re:" or "Fwd:" subjects | The CEO's real name; an accurate subject |

### 1.4 Repo documents that MUST be revised before any outreach or signature

The current templates in the repository (read-only here) contain statements that are untrue for this company. **Do not send or sign them until revised and reviewed by counsel.**

| Document | Statements to remove or rewrite |
|---|---|
| `sales_and_commercial/retainer_agreement_100k.md` | Exhibit A human pod (Pod Lead 0.5 FTE, Senior Modernization Engineer 2.0 FTE, Parity QA Engineer 0.5 FTE) and hourly rates; key-personnel and background-check clauses; SOC 2 Type II report clause; s.16 "keep human engineers accountable"; s.17 "appropriately qualified personnel" (rewrite as accountable CEO review); s.21 insurance covenant (USD 5M/5M/2M plus workers' comp); Exhibit B P1 "engineer engaged" within 4 hours, 24x7; Delaware law and courts; the uncapped "Excluded Claims"; a 72-hour SLA and module volumes a single reviewer cannot meet |
| `sales_and_commercial/pilot_scope_of_work_50k.md` | s.10 pod lead and senior engineer; "Human engineers review every Deliverable"; Delaware law and courts (s.19) |
| `sales_and_commercial/cto_outbound_pitch.md` | "engineers verify them"; "took us a dedicated team"; "SOC 2-aligned controls" |
| `README.md` | "dedicated delivery pod" wording in external use; the free-tier Gemini key suggestion **MUST NOT** be applied to any client material (§3) |
| `config/outreach_schedule.yaml` | Geography list: remove Germany; hold Netherlands, Nordics and Ireland (§7). Use "draft_for_approval" mode permanently for first-touch emails. |

### 1.5 Substantiation file (FTC "competent and reliable evidence" standard)

- Every performance or capability claim **MUST** be backed by evidence that exists **at the time the claim is made** ([FTC Workado order](https://www.ftc.gov/news-events/news/press-releases/2025/08/ftc-approves-final-order-against-workado-llc-which-misrepresented-accuracy-its-artificial)).
- Maintain `/legal/substantiation/` with: the harness results; the LNFEE010 demonstration (31 assertions, confirmed under GnuCOBOL); `make verify` outputs with dates and commit hashes; and, later, per-client parity evidence packs, used only with client permission.
- Each external claim is mapped to its evidence file.

---

## 2. Parity guarantee: how it may be described and contracted

- **Definition (in every contract):** "Parity" means 100% pass of the Verified Behavioral Contract assertions and of the agreed Replay Dataset, on the delivered commit, in the documented environment. The client signs off both the contract and the dataset before the build starts.
- **Nothing else is warranted.** Delete any warranty covering "behaviours not captured" (current retainer s.9), or limit its remedy to re-performance only.
- **Sole and exclusive remedy:** a cure period, then a refund as set in the SOW. Under the current pilot SOW the maximum refund is USD 12,500 plus the unpaid USD 25,000.
- **The refund is uninsured:** technology E&O wordings typically exclude refunds and liquidated damages. Price the risk accordingly.

---

## 3. Data-handling rules

### 3.1 Approved and prohibited AI services

| Service | Status for client material | Basis |
|---|---|---|
| **Anthropic API** (Console organisation under the **Commercial Terms**), Claude Code authenticated with a company API key, or **Team/Enterprise** seats | **Approved** | The Commercial Terms say Anthropic "may not train models on Customer Content from Services"; the customer owns its outputs; the DPA is incorporated. API inputs and outputs are deleted within 30 days, except for the Files API, zero-data-retention agreements, legal holds and Usage Policy flags (kept up to 2 years; safety scores up to 7 years). [Commercial Terms](https://www.anthropic.com/legal/commercial-terms); [retention](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data) |
| **Gemini API through a Google Cloud project with active billing** (paid services) | **Approved** | Paid-tier prompts and responses are not used to improve Google products and are processed under Google's DPA. They are logged "for a limited period" for abuse monitoring (period not published) and may be cached in any country. [Gemini API terms](https://ai.google.dev/gemini-api/terms) |
| Claude **Free / Pro / Max** consumer accounts, including Claude Code logged in with one | **Prohibited** for client material | Trained on if "Help improve Claude" is on, with 5-year retention. [Claude Code data usage](https://code.claude.com/docs/en/data-usage); [consumer terms update](https://www.anthropic.com/news/updates-to-our-consumer-terms) |
| **Gemini unpaid tier** (free API quota, or AI Studio without a billing-linked Cloud project) | **Prohibited** for client material; allowed only for the public LNFEE010 sample | Google uses the content "to provide, improve, and develop Google products"; "Human reviewers may read" it; "Do not submit sensitive, confidential, or personal information". Paid-terms protection for EEA/CH/UK users does not extend to an India-based user. |
| **Gemini Grounding with Google Search** | **Prohibited** for client material | Stores prompts and outputs for 30 days even on the paid tier (Gemini terms). |
| **Anthropic Files API** | **Prohibited** for client code unless retention is controlled by contract | Excepted from 30-day deletion. |
| Any other AI tool, code assistant, browser plug-in, transcription or "free" SaaS | **Prohibited** for client material until added to this table by board resolution and to the client's sub-processor list | — |

### 3.2 Technical controls (MUST)

1. **Ingest guard in code:** the ingest bridge refuses to process any non-public source unless a configured, **billing-verified Google Cloud project ID** and a company Anthropic API key are present. Free-tier model names are blocked for client modules.
2. **Masking:** only **masked or synthetic replay data** is accepted. The client warrants in the SOW that the data is masked. Any unmasked personal data found is quarantined, deleted and reported to the client.
3. **No sensitive data:** the Company **MUST NOT** accept protected health information (PHI), payment card data, passwords or credentials, biometrics, or financial-account data in unmasked form. Credentials found in legacy code are redacted before any AI call.
4. **Storage:** client code is kept only in client-provided repositories or in Company storage encrypted at rest. The device has full-disk encryption. No client material goes on personal cloud drives.
5. **Access:** MFA on every account (GitHub, Google Cloud, Anthropic Console, email, bank, MCA, GST, DGFT). API keys are kept in a secret manager or a `chmod 700` key directory, never in git. Keys are rotated at each engagement end.
6. **Least privilege:** read-only access to client legacy repositories where possible; agents work on branches; only the CEO merges or approves.
7. **Retention and deletion:** client source code, caches (`.spec_cache/`) and replay data are deleted **within 30 days** of final acceptance or termination, unless the contract requires otherwise. Deletion is confirmed in writing.
8. **Model record:** the model and version used is recorded per Work Order (current MSA promise).
9. **Zero data retention:** ask Anthropic for zero data retention for regulated clients (banks, insurers, health payers).
10. **Logs:** ICT logs are kept for a rolling 180 days for CERT-In (§5). They must not contain client source code.

---

## 4. Privacy-law obligations (the Company acts as processor or service provider)

| Regime | When it applies | What the Company MUST do | Source |
|---|---|---|---|
| **India DPDP Act 2023 and Rules 2025** | Phased. Core duties start about **13 May 2027** (18 months from the 13/14 Nov 2025 notification; plan to 13 May and check the Gazette). The reported plan to shorten this to 12 months has no Gazette instrument as of 12 Oct 2026. | **Foreign clients:** s.17(1)(d) exempts processing of non-Indian data principals' data under contracts with foreign persons, **except** accuracy (s.8(1)) and **reasonable security safeguards (s.8(5))**. Keep s.8(5)-grade security anyway. **Indian clients:** the client is the Data Fiduciary and the Company the Processor, engaged only under a valid contract (s.8(2)). Sign a **DPDP processor addendum**: instructions-only processing, security safeguards, prompt breach notice to the fiduciary, erasure on completion, sub-processor disclosure (Anthropic, Google). Ready by 13 May 2027: privacy notice, processor template, breach runbook, deletion and log-retention policies. | [DPDP Act](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf); [s.17](https://indiankanoon.org/doc/39355046/); [timeline](https://indiacode.ecourtsindia.com/rules/enforcement-timeline-for-the-dpdp-act-e1be0965/) |
| **IT Act s.43A and the 2011 SPDI Rules** | Now, until DPDP s.44(2) starts (about 13 May 2027) | Documented information-security policy aligned to ISO/IEC 27001 controls. Contractually refuse sensitive personal data. Liability is uncapped civil compensation for negligent security. | [DPDP s.44](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf) |
| **EU GDPR** | Before receiving any EEA personal data | Sign **SCCs (Decision 2021/914) Module 2** (controller to processor) or **Module 3** (processor to processor). They already include the Art. 28 terms. Do not alter the text. Fill Annex I (parties, data, purposes), Annex II (security measures) and **Annex III (sub-processors: Anthropic PBC; Google paid Gemini API under its DPA)**. Provide an "importer information" sheet on Indian law (CERT-In; IT Act s.69 access powers) for the client's transfer assessment. | [EC SCC Q&A](https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/new-standard-contractual-clauses-questions-and-answers-overview_en) |
| **UK GDPR** | Before receiving UK personal data | ICO **IDTA** or the **UK Addendum** to the EU SCCs, plus a transfer risk assessment ("data protection test" under the Data (Use and Access) Act 2025). Use the current versions; the ICO plans updates during 2026. | [ICO](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/appropriate-safeguards/what-are-standard-data-protection-clauses-the-uk-idta-and-the-addendum/) |
| **California CCPA** | Before processing California consumer personal information | A US State Privacy Addendum mapping **11 CCR §7051(a)(1)–(10)**: no selling or sharing; specific business purposes; no retention or use outside the relationship; no combining with other data; reasonable security; audit rights; notice if the Company can no longer comply; help with consumer requests. Subcontractors (the AI APIs) get equivalent terms. | [11 CCR 7051](https://www.law.cornell.edu/regulations/california/11-CCR-7051) |
| **GLBA Safeguards Rule** | US financial clients | Expect vendor due diligence. Keep a **security pack** ready: security policy, risk assessment, MFA and encryption evidence, incident response plan, AI-provider data terms, and a data-flow diagram showing masked data only. Accept audit and assessment rights. Do not claim SOC 2. | [16 CFR 314.4(f)](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-314) |
| **HIPAA** | US health payers or providers | **Default: refuse PHI** (masked or synthetic data only, with a client warranty). Sign a BAA only if Anthropic and Google will also sign BAAs for the exact services used. Their availability was not verified; check before accepting a health client. | [HHS BAA](https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html) |

---

## 5. CERT-In incident response (applies from incorporation)

The CERT-In Directions of 28 April 2022, issued under IT Act s.70B(6), apply to any "body corporate", which includes the Company. Penalty under s.70B(7): up to 1 year's imprisonment and/or a fine up to Rs 1 lakh ([Directions](https://cert-in.org.in/Directions70B.jsp); [FAQ](https://www.cert-in.org.in/PDF/FAQs_on_CyberSecurityDirections_May2022.pdf)).

**Point of contact:** the CEO. Register the Company's point-of-contact details with CERT-In as the Directions require; the procedure was not researched (**confirm with counsel**).

**Runbook (the 6-hour clock starts when an incident is noticed):**

| Time | Action |
|---|---|
| T+0 | Notice an incident in the Annexure I categories, e.g. unauthorised access to systems or data, a data breach or leak, malicious code, a compromised API key or account. This includes incidents affecting Company data on **third-party systems** (Q31), such as an AI vendor, GitHub or a cloud provider. |
| T+0 to T+1h | Contain: revoke or rotate keys and tokens, disable affected accounts, isolate the device, preserve logs (do not wipe). |
| **By T+6h** | **Report to CERT-In** using the incident reporting form (certinirform.pdf) through the channels listed on cert-in.org.in. Partial information is acceptable and can be completed later (Q30). |
| As soon as possible, and within the contract period | Notify affected clients. The current MSA promises 48 hours; **revise it to "without undue delay"** and make sure it is never later than what the client needs for its own deadlines. From 13 May 2027, notify Indian fiduciary clients promptly so they can meet their DPDP breach duties. |
| T+72h | Written incident report: root cause, data affected, remediation. Board informed. |
| Ongoing | Keep ICT logs for a **rolling 180 days** (GitHub audit log, Google Cloud audit logs, Anthropic Console usage, email security logs, endpoint logs). Logs may be stored outside India if they can be produced in reasonable time (Q36). **Synchronise clocks** to NIC/NPL NTP (samay1.nic.in or time.nplindia.org). |

Notify the insurer as the policy requires (claims-made policies have strict notice clauses).

---

## 6. Insurance to bind before signing the first client contract

| Cover | Requirement | Notes |
|---|---|---|
| **Technology errors and omissions (professional indemnity, technology)** | **MUST be bound before the first signature.** Worldwide territory **with jurisdiction expressly including the USA and Canada**; retro date at incorporation; limit at least the pilot fee (USD 50,000), and realistically **USD 1M or more for bank clients** | Indian insurers that write this include ICICI Lombard (Professional Indemnity-Technology, with separate deductibles for USA/Canada claims), HDFC ERGO (Information & Network Technology E&O) and Tata AIG (PI for IT companies). Cover is claims-made, so keep it continuous with no gaps. **Refunds and liquidated damages are typically excluded**, so the parity refund is uninsured. [ICICI wording](http://www.bluearmourinsurance.com/pdf/Corporate/Liability%20Insurance/Errors%20and%20Omissions%20Insurance/Technology/ICICI%20Lombard.pdf); [HDFC ERGO](https://www.hdfcergo.com/commercial-insurance/information-technology-insurance-policy); [Tata AIG](https://www.tataaig.com/sme-insurance/professional-indemnity-insurance/it-companies) |
| **Network security and privacy liability (cyber)** | **MUST be bound before the first signature**, same territory and jurisdiction | May come bundled with the tech E&O (ICICI includes network-security cover) |
| Commercial general liability, workers' compensation | Only if a client requires it and it is actually bound | **Never** promise cover that is not bound (§1.3) |
| Directors' and officers' liability | Optional; not researched | — |

**Procurement rules:**
- Get quotes only through an **IRDAI-registered broker**.
- **Disclose the AI-delivered, single-human model** on the proposal form. Non-disclosure could void the cover.
- Premiums are **unconfirmed**. Domestic indicative figures range from Rs 15,000 to Rs 1.5 lakh+ a year for Rs 50 lakh–1 crore of cover, and USA/Canada jurisdiction raises this materially. Budget only after real quotes.
- Contract insurance clauses state the cover actually bound. Liability caps **SHOULD NOT** exceed the insured limit, except the fees-paid cap.

---

## 7. Outreach compliance by country

### 7.1 Universal rules (all countries)

1. **The CEO personally reviews and sends every first-touch email.** The outreach agent drafts only ("draft_for_approval" mode, permanently, for first touch).
2. The sender is the CEO's **real name**. The subject line is accurate (no fake "Re:"/"Fwd:"). The email identifies the Company and gives its **registered postal address**.
3. Every email carries a clear opt-out ("reply 'no thanks'" plus an unsubscribe address). **Honour opt-outs within 24 hours** (repo policy, stricter than every law below). Keep a single suppression list across all sequences, and never sell or transfer it.
4. Send only to **work addresses of people whose role is relevant** (CIO, CTO, VP Engineering, Head of Core Systems and similar). Never contact personal addresses, students, recruiters or sole traders.
5. **Record provenance for every address:** source URL, date found, screenshot, and why it is relevant to the role. No purchased lists or harvested databases without documented provenance. No address-harvesting software.
6. The email contains the AI-delivery disclosure (§1.2(e) signature) and a link to the privacy notice.
7. Keep outreach records for 730 days (repo config), then delete.

### 7.2 Country rules

| Country | Status | Specific rules | Source |
|---|---|---|---|
| **United States** | **Permitted** (opt-out regime, no B2B exception) | CAN-SPAM: accurate headers; non-deceptive subject; a clear and conspicuous statement that the message is an advertisement; valid physical postal address; opt-out working for at least 30 days, honoured within 10 business days, with no fee. Penalty up to **USD 53,088 per email**. | [FTC guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business) |
| **Canada** | **Permitted only on implied consent from conspicuous publication** | CASL s.10(9)(b): the address was conspicuously published by the person or organisation (the company's own site, or a source they caused to publish), there is no "no unsolicited messages" statement, and the message is relevant to the role. Third-party lists do **not** qualify. The Company bears the burden of proof, so keep evidence. Include identification, a mailing address plus phone/email/web contact valid for 60 days, and an unsubscribe honoured within **10 business days**. Penalty up to **CAD 10M per violation** for a business (s.20(4)). | [CRTC guide](https://crtc.gc.ca/eng/com500/guide.htm); [CASL s.20](https://laws-lois.justice.gc.ca/eng/acts/E-1.6/section-20.html) |
| **United Kingdom** | **Permitted to corporate subscribers only** | PECR reg 22 does not apply to companies, LLPs, Scottish partnerships or some government bodies. Sole traders and other partnerships need consent. UK GDPR still applies to named addresses: write a short **legitimate-interests assessment**, include a privacy link in the first email, and honour objections permanently. The ICO's guidance is under review after the Data (Use and Access) Act 2025. | [ICO B2B](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/business-to-business-marketing) |
| **Australia** | **Permitted only under the conspicuous-publication exception** | Spam Act Sch 2: role or employee address; conspicuously published; publication presumably agreed; no "no spam" statement; message relevant to the role. Identify the authorising business. Unsubscribe takes effect within **5 business days** (Sch 2 cl 6) and must keep working for **at least 30 days**. No harvested lists. | [Spam Act Sch 2](https://www8.austlii.edu.au/cgi-bin/viewdoc/au/legis/cth/consol_act/sa200366/sch2.html); [ACMA](https://www.acma.gov.au/avoid-sending-spam) |
| **Singapore** | **Permitted below the bulk thresholds** | The Spam Control Act controls bulk sending, defined as **more than 100 similar messages in 24 hours, OR more than 1,000 in 30 days, OR more than 10,000 in a year** (s.6). The agency's overall caps (15 new plus 30 follow-ups a day, about 1,350 a month) **could cross the 30-day limit**. **Internal cap for Singapore-linked recipients: 90 per day and 900 per rolling 30 days.** Publishing an address is not consent (s.5(2)). Unsubscribes take effect within 10 business days. Do not SMS or call Singapore numbers without checking the Do Not Call register. | [SCA 2007](https://sso.agc.gov.sg/Act/SCA2007) |
| **India** | **Permitted with care** | No email-specific anti-spam statute was found (unconfirmed). Use only addresses the person or company published themselves. Identify the sender, offer an opt-out and keep provenance. From 13 May 2027, DPDP applies to data not "made publicly available" by the person, and marketing is not a listed legitimate use. | [DPDP Act](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf) |
| **Ireland** | **Hold until counsel confirms** | S.I. 336/2011 reg 13(2) is understood to allow role-relevant email to work addresses, but the text could not be verified in this research. | [DPC FAQ](https://www.dataprotection.ie/faqs/direct-marketing) |
| **Germany, Austria** | **Prohibited (no cold email)** | UWG §7(2) no. 2 requires prior express consent, B2B included; a published address is not consent. Reach these markets through referrals, events or inbound only. | [UWG §7](https://dejure.org/gesetze/UWG/7.html) |
| **Netherlands, Nordics, rest of EU** | **Hold** (treat as consent-required) | Not researched; local counsel must confirm before any email | — |

---

## 8. Contract standards (MUST be in every client contract)

1. The **AI-Performed Delivery** clause and cover-page acknowledgement (§1.2).
2. The **parity definition and sole remedy** (§2).
3. **Liability:**
   - Aggregate cap at fees paid under that SOW (for the retainer: fees for the prior 3–6 months).
   - A super-cap for data and confidentiality breaches **at the insured limit**, not unlimited.
   - Exclusion of indirect and consequential loss, lost profits and regulatory fines.
   - No uncapped carve-outs except fraud.
   - Exclusion of liability for production use before acceptance or outside the documented configuration. The client owns cutover, rollback and production testing.

   Caps must look reasonable for a solo firm's resources and insurance (UK UCTA s.11(4)). Have counsel in the governing-law jurisdiction review them.
4. **Acceptance:** objective, automated criteria; deemed acceptance after 5 business days; production use counts as acceptance.
5. **Service levels:**
   - Expressed in **IST business hours**, with a stated overlap window for the client's time zone.
   - P1 acknowledgement in business hours only.
   - Monthly throughput stated as a realistic number of modules for a single reviewer, set by the CEO from measured review time (§5 of ceo_operating_manual.md).
   - No 24x7 commitments.
6. **Force majeure and model substitution:** AI-provider outages, model withdrawal or terms changes are covered, with a right to substitute an equivalent model on 30 days' notice.
7. **Key person and continuity:**
   - Escrow or delivery of harnesses, contracts and work in progress at every milestone.
   - Termination for convenience with a pro-rata refund if the CEO is incapacitated.
   - Signed by the CEO **for the Company**, never personally; no personal guarantees.
8. **Governing law and disputes:**
   - Governing law: England and Wales, Singapore, or New York (for US clients).
   - Disputes: **SIAC arbitration seated in Singapore** (Streamlined Procedure applies by default below S$1M; Expedited Procedure up to S$10M on request or agreement), or ICC, or MCIA (Mumbai) for Indian clients. Sole arbitrator, English language.
   - An escalation and mediation step comes first, with a carve-out for interim relief in courts.
   - **Not Delaware courts:** US judgments are not directly executable in India (CPC s.44A; the reciprocating-territory list comes from secondary sources, **confirm with counsel**). Arbitral awards are enforceable both ways under the New York Convention: India has notified the US, UK, Singapore, Canada and Australia.

   Sources: [SIAC 2025 highlights](https://siac.org.sg/wp-content/uploads/2024/06/Highlights-of-the-SIAC-Rules-2025.pdf); [New York Convention list](https://newyorkconvention1958.org/index.php?lvl=cmspage&menu=581&opac_view=-1&pageid=11).
9. **Stamp duty:**
   - Pay e-stamp duty in the Company's state on each MSA and SOW executed in India. Rs 500 under Maharashtra Art. 5(h)(B) per the 2024 Ordinance (**confirm with counsel**; other states unconfirmed).
   - Unstamped documents are inadmissible in evidence until duty and penalty are paid, but they are not void (*In re Interplay*, SC 2023).
   - Have counsel confirm stamping timing for documents signed abroad.

   Sources: [Ordinance](https://prsindia.org/files/bills_acts/bills_states/maharashtra/2024/Ord12of2024MH.pdf); [SC judgment](https://api.sci.gov.in/supremecourt/2022/40099/40099_2022_1_1501_49105_Judgement_13-Dec-2023.pdf).
10. **Taxes:** fees exclude taxes; gross-up for withholding; export invoicing per tax_and_payments.md.
11. **Data:** masked data only; DPA, SCC, UK Addendum, CCPA or DPDP addendum as applicable; sub-processor list naming Anthropic and Google with their retention terms.

---

## 9. Records retention

| Record | Retention | Basis |
|---|---|---|
| ICT logs (CERT-In) | Rolling **180 days** minimum | CERT-In Directions (verified) |
| Books of account and vouchers | **8 financial years** | Companies Act s.128(5) (not verified in this research; **confirm with your CS**) |
| GST records (invoices, RCM self-invoices, refunds, LUT) | **72 months** from the due date of the annual return | CGST s.36 (not verified in this research; **confirm with your CA**) |
| Income-tax records, TDS workpapers, Forms 145/146, DTAA analyses, TRCs, Form 41 | Until assessment limitation expires; **keep at least 8 years** (internal policy) | **Confirm with your CA** |
| FEMA export evidence packs (invoice, EDF, FIRA, e-BRC, realisation approvals) | At least **8 years** (internal policy) | **Confirm the AD bank's and RBI's requirements** |
| Statutory registers, minutes, share records | Permanently (internal policy) | **Confirm with your CS** |
| Signed contracts and acceptance certificates | Term of the contract **plus 8 years** (internal policy; covers limitation periods) | **Confirm with counsel** |
| Substantiation file for marketing claims | While the claim is used **plus 3 years** (internal policy) | FTC substantiation principle |
| Outreach records (provenance, suppression list) | 730 days; the **suppression list is kept indefinitely** | Repo config; CAN-SPAM/CASL opt-out duties |
| Client source code, caches, replay data | **Delete within 30 days** of acceptance or termination unless the contract says otherwise | §3.2 |
| Model and version records per Work Order | Term of the contract plus 8 years | MSA promise |
| Insurance policies and proposal forms | Permanently (claims-made history and retro date) | Internal policy |

---

## 10. Governance of this policy

- The CEO **MUST** run the January policy review in compliance_calendar.md: re-read the AI vendor terms, recheck the DPDP dates, check outreach law changes and confirm insurance limits.
- The board reviews breaches and changes at each half-yearly board meeting. Any change to §3.1 (approved AI services) or §7 (country status) requires a board resolution.
- AI agents **MUST NOT** change this policy, their own permissions, or outreach mode settings.
