# Company HQ: start here (CEO)

This folder is the operating system for the company: how it is formed, how it stays legal,
how it gets paid, and how the CEO runs it. Everything here was researched against official
sources on 13 October 2026 and fact-checked by a separate reviewer; anything unconfirmed is
marked "confirm with your CA/CS". It is research and drafting, not legal or tax advice:
a practising Company Secretary (CS), Chartered Accountant (CA) and contracts counsel must
review before you file or sign.

## The company in one paragraph

An India-incorporated private company that modernizes legacy software (COBOL, RPG/IBM i,
Oracle Forms, PL/SQL) into Go/TypeScript services. **All delivery is performed by AI agents**
(Gemini for legacy analysis; Claude Code agents for specification, transpilation and parity
testing). **The CEO is the only human:** the accountable reviewer who approves every
deliverable and signs every contract. Every deliverable is accepted on objective evidence:
100% behavioral parity on the verified contract and on replayed production data. Clients are
told all of this in writing (`legal_operating_policy.md`, and section 3 of the contracts).

## Status

| Area | Status |
|---|---|
| Delivery pipeline | **Working.** Tested end to end on 13 Oct 2026: live Gemini ingest, spec publisher, parity gate 28/28 against the running service, 202,730-record COBOL-vs-Go replay at 100%. |
| Legal entity | **Not formed.** Recommended: Private Limited (small company); OPC if no second director. See `formation_india.md`. |
| Name | **Not chosen.** Shortlist with live domain checks in `names.md` (top 3: ParityProof, Paritycraft, Equivalis). |
| Contracts | **Rewritten honestly** for AI delivery + one human. Draft; counsel review required. See `../sales_and_commercial/CHANGES.md`. |
| Clients | **19 verified prospects** in `prospects.md` (mid-market + channel partners). No one contacted yet. |
| Outreach | Configured: CEO approves and sends every first email; follow-ups auto-send only on threads you started. Starts after the pre-outreach checklist below. |
| Insurance | **Not bound.** Tech E&O + cyber needed before the first signature. |

## Decisions only you can make

1. **Entity:** Private Limited (needs a trusted second director and shareholder) or OPC (just you, plus an Indian-citizen nominee; convert later).
2. **Name:** pick from `names.md`; then MCA name check and IP India trademark search.
3. **Registered office state** (sets stamp duty) and **authorised capital** (keep at or below Rs 15 lakh for a zero MCA filing fee).
4. **Professionals:** a CS/CA firm for incorporation and compliance; an independent CA as statutory auditor; counsel for the contracts.
5. **Bank:** an AD Category-I bank comfortable with SWIFT USD receipts, FIRA/e-BRC and export declarations.
6. **Prices:** the Paid Assessment fee; confirm the $50,000 pilot and $100,000/month retainer against the new capacity (2 concurrent, about 6 work orders a month).
7. **Insurance limit and budget** (sets the contracts' liability super-cap).
8. Every open question listed at the end of `../sales_and_commercial/CHANGES.md`.

## Launch sequence (planning targets)

| Week | What happens | Who |
|---|---|---|
| 1 | Decide entity, name, state, capital. Engage CS/CA. Both directors get Class 3 DSCs. | CEO + CS |
| 2 | MCA name + trademark check. Register the domain and set up company email (Google Workspace) with SPF/DKIM/DMARC. File SPICe+ Part A + B with AGILE-PRO-S (PAN, TAN, GSTIN, bank). | CS; CEO signs |
| 3–4 | Certificate of Incorporation. Bank KYC; deposit subscription money. First board meeting; appoint auditor within 30 days. | CEO + CS |
| 4–6 | INC-20A (within 180 days, before trading). GST LUT (RFD-11). IEC. Move AI vendor accounts to the company on **paid** tiers (enable billing on the Gemini key). Insurance quotes. | CS/CA; CEO |
| 5–8 | Counsel reviews contracts. Insurance bound. Privacy notice published. Outreach starts. | Counsel; CEO |
| First client | Only after INC-20A, LUT, insurance and reviewed contracts are all in place. | CEO signs |

Indicative year-one cost: about Rs 45,000 – 1,30,000 for incorporation and compliance,
excluding bookkeeping, contract review, trademark and insurance (see `formation_india.md` §3).

## Pre-outreach checklist (the agent will not send anything until these are true)

- [ ] Company incorporated; legal name and registered office address known (needed in every email footer).
- [ ] Company domain and mailbox live with SPF, DKIM and DMARC (do not cold-email from a personal Gmail).
- [ ] Privacy notice published on the company website; legitimate-interests assessment written.
- [ ] Sender env vars set: `OUTREACH_SENDER_NAME`, `OUTREACH_SENDER_TITLE`, `OUTREACH_POSTAL_ADDRESS`, `OUTREACH_CALENDAR_LINK`, `OUTREACH_REPORT_RECIPIENTS`.
- [ ] Google Calendar connector reconnected (it currently fails authentication) so the agent can offer meeting slots.
- [ ] Role-based business emails found for the first five A-priority prospects, each with its public source recorded.

## Rules that are never delegated to an agent

Signing contracts or quotes · sending a first-touch email · accepting a deliverable ·
any legal, tax or company filing · any payment · changing prices · talking to a regulator,
journalist or competitor. (Full list: `ceo_operating_manual.md`.)

## Documents

| File | What it covers |
|---|---|
| `formation_india.md` | Entity choice, step-by-step incorporation, costs, 30/90/180-day checklist |
| `compliance_calendar.md` | Month-by-month company-law, GST, income-tax, FEMA, DPDP and insurance deadlines |
| `tax_and_payments.md` | Export invoices, LUT, receiving USD legally, paying AI vendors (withholding), banking |
| `legal_operating_policy.md` | AI-delivery disclosure, data handling, DPDP/GDPR, CERT-In, outreach law by country, insurance |
| `ceo_operating_manual.md` | Weekly/monthly cadence, KPIs, decisions reserved to the CEO |
| `names.md` | Name shortlist with live domain checks and conflict research |
| `prospects.md` | 19 verified prospects with triggers, roles, offer angles and barriers |
| `../sales_and_commercial/` | Revised pilot SOW, retainer MSA, outbound playbook, and CHANGES.md |
