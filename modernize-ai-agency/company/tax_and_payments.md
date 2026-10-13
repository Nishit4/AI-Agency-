# Tax and Payments: Invoicing Foreign Clients, Paying AI Vendors, Banking Setup

**Company:** `[COMPANY NAME] Private Limited`, GSTIN `[GSTIN]`, IEC `[IEC]`, AD bank `[BANK, BRANCH, SWIFT]`
**Prepared:** 13 October 2026. This is research, not tax advice. Every regime choice and filing position below must be confirmed by a practising Chartered Accountant before use.

**Law in force on this date:**
- **Income-tax Act, 2025**, in force from 1 April 2026. Old s.195 is now **s.393(2)**, old s.115BAA is now **s.200**, and Forms 15CA/15CB are now **Forms 145/146**.
- **FEMA (Export and Import of Goods and Services) Regulations 2026**, in force from **1 October 2026**.
- **CGST/IGST Acts** as amended.

---

## 1. Money flows at a glance

```
Foreign client (US/UK/CA/AU/SG legal entity)
   │  SWIFT wire in USD (purpose code P0807 / P0802; P0103 for advances)
   ▼
AD Category-I bank current account in the company's name
   │  FIRA issued · IRM pushed to DGFT · EDPMS entry closed against the EDF
   ▼
Company books (Zoho Books / TallyPrime / CA stack)
   │  e-BRC self-certified on DGFT · GSTR-1 Table 6A (LUT, no IGST) · RFD-01 refunds
   ▼
Outgoing: Anthropic / Google API (reverse-charge IGST 18% in cash, then credit/refund;
          TDS position per sec 393(2) and the DTAA; Form 145/146 before any wire)
```

---

## 2. Invoicing foreign clients legally

### 2.1 Conditions for zero-rated "export of services" (IGST s.2(6))

**All five** conditions must hold, or the supply becomes a normal taxable supply at 18% ([IGST s.2](https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/acts/2017_IGST_Act/active/chapteri/section2_v1.00.html)):

1. The supplier (the company) is located in India.
2. The recipient is located **outside India**.
3. The place of supply is **outside India**. For B2B IT services the default is the recipient's location (IGST s.13(2), not re-read in this research).
4. Payment is received **in convertible foreign exchange**, or in INR where the RBI permits it.
5. Supplier and recipient are not merely establishments of the same person.

**Operating rules that follow:**
- Contract with, and invoice, the **foreign legal entity at its foreign address**.
- Never accept payment in INR from a client's Indian subsidiary for an "export" invoice.
- The money must come **from abroad, in foreign currency**, into the company's AD bank account.
- For each invoice, keep the **contract + invoice + FIRA + e-BRC** together (the "export evidence pack", §2.7).

### 2.2 Letter of Undertaking (LUT), a prerequisite for every export invoice

- File **Form GST RFD-11** on the GST portal **before the first export invoice of each financial year** (CGST rule 96A). The LUT is valid until 31 March, so file a new one every 1 April.
- It is signed by a director (DSC or EVC) with two witnesses. There is no fee.
- Since 1 October 2023, exporting **without IGST under an LUT** and claiming a refund of unused input credit is the standard route. Paying IGST and claiming a refund is limited to notified classes ([IGST s.16](https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/acts/2017_IGST_Act/active/chaptervii/section16_v1.00.html)).
- Any registered person may use an LUT unless prosecuted for tax evasion of Rs 2.5 crore or more ([CBIC master circular](https://cbic-gst.gov.in/pdf/Final_Master_circular_LUT_Bond_04102017.pdf)).
- **Risk:** if payment is not received within **1 year of the invoice date, or the FEMA period plus any extension, whichever is later**, the company must pay the IGST plus interest within 15 days. Otherwise the LUT facility is withdrawn ([rule 96A](https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/rules/cgst_rules/active/chapter10/rule96a_v1.00.html)).

### 2.3 Mandatory export invoice contents (CGST rule 46)

Source: [rule 46](https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/rules/cgst_rules/active/chapter6/rule46_v1.00.html).

| Field | What to put |
|---|---|
| Supplier legal name, address, **GSTIN** | `[COMPANY NAME] Private Limited`, registered office, GSTIN |
| Invoice number | Consecutive, unique per FY, max 16 characters, e.g. `EXP/2627/0001` |
| Invoice date | Date of issue |
| Recipient name and address | Foreign legal entity name and full address (no Indian GSTIN) |
| Delivery address | Client address (services delivered electronically) |
| **Country of destination** | e.g. United States of America |
| **Place of supply** | "Outside India: [country]" |
| **SAC code** | Not in the verified research. Candidate codes in heading 9983 (for example 998313, IT consulting and support; 998314, IT design and development) must be **confirmed with your CA** |
| Description | e.g. "Legacy modernisation pilot, Pilot Module [ID], installment 1 of 2 under SOW dated [date]" |
| Taxable value | Amount in **USD**, plus the INR equivalent. The exchange rate convention was not researched (**confirm with your CA**) |
| Rate and amount of tax | IGST 0% / nil (zero-rated under LUT) |
| **Exact endorsement** | `SUPPLY MEANT FOR EXPORT/SUPPLY TO SEZ UNIT OR SEZ DEVELOPER FOR AUTHORISED OPERATIONS UNDER BOND OR LETTER OF UNDERTAKING WITHOUT PAYMENT OF INTEGRATED TAX` |
| LUT reference | ARN and date of the current RFD-11 (good practice) |
| Signature | Signature or DSC of the authorised signatory (the CEO). Not required on an e-invoice. |
| Payment instructions | Beneficiary: company legal name; bank name and address; account number; **SWIFT/BIC**; any intermediary bank details the AD bank gives you; **purpose code**; invoice number as the payment reference |
| Payment terms | e.g. net 30 days, well inside the 9-month FEMA period |
| IEC and Udyam number | Optional on export invoices; useful for bank and DGFT matching |

**E-invoicing:** once aggregate turnover exceeds Rs 5 crore in any year from 2017-18, e-invoices (IRN/QR) are mandatory, **export invoices included** ([Notification 10/2023-CT](https://www.gstcouncil.gov.in/node/4365)). One pilot plus a year of retainer at USD 100,000/month crosses this in year 1. Set up e-invoicing in the accounting tool in advance and confirm the start date with your CA.

### 2.4 Commercial terms to align with FEMA

- **Realisation:** each invoice must be realised **within 9 months of the invoice date** (12 months if invoiced or settled in INR) under FEMA Regs 2026 reg 5(1) ([RBI](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13277&Mode=0)). The AD bank can extend this on a reasoned request.
- **Billing structure:**
  - Pilot: 50% on the Effective Date, 50% on acceptance, net 30 (this matches the current SOW §8).
  - Retainer: billed **monthly in advance**, net 30.
- **Advance receipts:** quote purpose code **P0103**. Route advances and final realisations through the **same AD bank** (reg 10).
- **Short receipts:** foreign bank charges or client withholding can leave a shortfall. Ask the AD bank to approve a **reduced realisation** (reg 6). For invoices up to Rs 10 lakh this can be done on the company's own declaration; these invoices will be larger, so the bank must approve.
- **Set-off:** receivables may be set off against payables to the **same** overseas party only with AD bank permission (reg 7).
- **Withholding by the client:** the SOW and MSA say the client grosses up any withholding. US clients will likely ask for a W-8BEN-E and a treaty-benefit claim. This was **not researched; confirm the form and the India-US DTAA position with your CA** before the first US invoice.

### 2.5 Purpose codes, FIRA and e-BRC

| Purpose code | Use | Source |
|---|---|---|
| **P0807** | Off-site software exports (likely fits delivered Go/TypeScript code and harnesses) | [Nordea RBI list](https://www.nordea.com/en/doc/india-inr-purpose-of-payment-codes.pdf); [ebrc.in](https://ebrc.in/purpose-codes/group/telecom-computer-information-services) |
| **P0802** | Software consultancy / implementation (other than SOFTEX) | as above |
| **P0803** | Database / data processing | as above |
| **P0103** | Advance receipts against export | as above |

- Only P0802, P0803, P0807 and P0103 are accepted for e-BRC under "Services > IT".
- **Agree the code with the AD bank before the first invoice** and print it on the invoice. The choice between software (P0807) and consultancy (P0802) depends on the contract and the bank's view.
- **FIRA:** banks now issue a Foreign Inward Remittance Advice instead of a physical FIRC. Download it for every receipt.
- **e-BRC:** log in to DGFT with the company **IEC**. Self-certify the e-BRC from the bank's Inward Remittance Message (IRM) and enter the GSTIN, GST invoice number and date (mandatory fields from 13 Jan 2026). There is no charge ([DGFT e-BRC](https://www.dgft.gov.in/CP/?opt=eBRC); [manual](https://content.dgft.gov.in/Website/eBRC%20manual%2028.12.2023.pdf)). Some GST officers resist a FIRA alone for refunds, so an **e-BRC is the safer refund document**.

### 2.6 Export Declaration Form (EDF), the successor to SOFTEX

- File one consolidated EDF covering all of the month's export invoices **within 30 days from the end of the invoice month**, with the AD bank (or STPI) (reg 3(2)).
- Exporters of non-software services may instead file by the date payment is received. Assume the stricter software rule unless the AD bank confirms otherwise.
- The AD bank enters the EDF in EDPMS within 5 working days. It closes the EDPMS entry once the realisation is matched (invoices over Rs 10 lakh need actual matching).
- STPI registration is optional and was not researched further.

### 2.7 Export evidence pack, one folder per invoice

`/finance/exports/FY2627/EXP-2627-0001/`:
1. Signed SOW / Work Order and acceptance record
2. Export invoice (PDF, plus the e-invoice IRN once applicable)
3. LUT acknowledgement for the FY
4. EDF reference / EDPMS number
5. FIRA (bank)
6. e-BRC (DGFT)
7. GSTR-1 period in which the invoice was reported
8. Realisation date and any reduced-realisation approval

---

## 3. Receiving USD: compliant channels

| Channel | Use for | Rules |
|---|---|---|
| **SWIFT wire into a current account at an AD Category-I bank** | **All pilot and retainer invoices** | The standard FEMA route, with no per-transaction cap. The bank issues the FIRA, sends the IRM to DGFT and closes EDPMS. |
| RBI-authorised cross-border payment aggregator (PA-CB), e.g. Skydo or Razorpay | Small invoices only (e.g. paid assessments) | **Capped at Rs 25 lakh per transaction** under the RBI Master Direction of 15 Sep 2025, para 11(d) ([RBI](https://www.rbi.org.in/scripts/BS_ViewMasDirections.aspx?id=12896)). A USD 25,000 installment, a USD 50,000 pilot or a USD 100,000 retainer invoice exceeds Rs 25 lakh at any realistic rate. **Splitting an invoice to get under the cap is prohibited by this policy.** Licence status comes from secondary reporting as of January 2026 ([Skydo list](https://www.skydo.com/blog/rbi-pa-cb-list)); check RBI's current list before onboarding. PayPal, Payoneer India and Wise had in-principle approval or were not listed at that time. |
| Founder's personal account, personal PayPal, crypto, unlicensed wallets | **Never** | This would break the export-of-services conditions, FEMA realisation and EDPMS closure, and the company/personal separation. |

**EEFC account:** a foreign-currency account at the AD bank could hold USD to pay foreign vendors without double conversion. EEFC rules were **not researched; confirm with the bank and your CA**.

---

## 4. Paying AI vendors (Anthropic, Google) legally

### 4.1 Account and billing rules (binding; see also legal_operating_policy.md §3)

- **Account owner:** every account used for client work is opened **in the company's name** and billed to the company:
  - **Anthropic:** API Console organisation, or Team/Enterprise seats, under the Commercial Terms.
  - **Google:** a **Google Cloud project with an active billing account** for the Gemini API. Only a billing-enabled Cloud project counts as the paid tier ([Gemini API terms](https://ai.google.dev/gemini-api/terms)).
- **GSTIN and invoice entity:** enter the company **GSTIN** in vendor billing settings where offered. For every vendor invoice, record the **issuing legal entity, its country, and whether it shows an Indian GSTIN**. How Anthropic and Google invoice Indian companies was **not verified**; check your actual invoices.
- **Payment method:** pay with a **company** card or by a wire from the company account. If the CEO ever pays personally, the invoice must still be in the company's name with its GSTIN, and the CEO is reimbursed against it. This is internal policy and was not researched as a legal point.

### 4.2 GST: reverse charge on imported services

| Situation | Treatment | Source |
|---|---|---|
| Invoice from a **foreign entity** (e.g. Anthropic PBC, USA) to a GST-registered Indian company | **Import of services.** The company pays **18% IGST under reverse charge**, **in cash** (not from the credit ledger). Self-invoice within 30 days (rule 47A) plus a payment voucher. Report in GSTR-3B Table **3.1(d)**; claim the credit in **4(A)(2)**. For an exporter the credit becomes an **RFD-01 refund**. | [GST Council flyer](https://www.gstcouncil.gov.in/sites/default/files/e-version-gst-flyers/51_GST_Flyer_Chapter42.pdf); [taxguru](https://taxguru.in/goods-and-service-tax/foreign-software-subscriptions-attract-gst-reverse-charge-itc.html); [zero8.dev](https://zero8.dev/blog/rcm-on-import-of-services-cloud-saas-india) |
| Invoice from an **Indian entity with a GSTIN** (e.g. Google Cloud billed through an Indian subsidiary) | Ordinary domestic purchase. GST is charged on the invoice; claim ITC; no reverse charge. | as above |
| Company unregistered (does not apply here) | The foreign supplier may charge Indian GST as OIDAR; no credit available | GST Council flyer |

**Cash-flow budget:** reverse-charge IGST is 18% of foreign API spend, locked up until refunded. The repo's pod budget ceiling is USD 6,500 per pod per month (config/pod_config.yaml), so expect roughly USD 1,170 a month per pod in IGST cash outlay until refund. File refunds monthly.

### 4.3 Income tax: TDS on payments to non-resident vendors (sec 393(2), old s.195)

- **The rule:** anyone paying a non-resident a sum **chargeable to tax in India** must deduct TDS when the sum is credited or paid, whichever is earlier. There is **no threshold**.
- **Current position:**
  - *GE India Technology* (SC 2010): the duty arises only if the sum is chargeable in India.
  - *Engineering Analysis* (SC 2021): payments for software licences under end-user licence agreements are **not royalty** under DTAAs such as India-USA.
  - SaaS and API subscriptions are often treated the same way. Tax authorities have sometimes argued "equipment royalty" or fees for technical services; a 2026 ITAT ruling (Amplitude) went in the taxpayer's favour per secondary reporting ([ITAT order](https://assets.studycafe.in/uploads/2026/06/ITAT-Rules-SaaS-Subscription-Receipts-Not-Taxable-as-Royalty.pdf); [rkchari](https://rkchari.com/blog/wht-cloud-saas-non-resident-vendors)).
- **Required actions (CA-led):**
  1. For each foreign vendor, the CA writes and files a **short DTAA analysis**: India-US Article 12 (no royalty or fees for included services) and no permanent establishment in India.
  2. Obtain the vendor's **Tax Residency Certificate** and **Form 41** (old 10F) where obtainable.
  3. If the position is unclear, apply for a **nil or lower deduction certificate under sec 395**.
  4. If the CA concludes TDS is due, deduct, deposit (old practice: by the 7th of the next month) and file the quarterly return. New-Act forms and dates are unconfirmed.
- **Risk of getting it wrong:** failing to deduct where TDS was due makes the company an assessee in default, with interest and **disallowance of the expense**.

### 4.4 Remittance reporting: Form 145 / Form 146 (old 15CA / 15CB)

Before **each** remittance to a non-resident, under rule 220 of the Income-tax Rules 2026 and s.397(3)(d) ([Form 145 FAQ](https://www.incometaxindia.gov.in/documents/d/guest/form-145-faqs)):

| Part | When |
|---|---|
| A | Taxable, up to Rs 5 lakh in aggregate in the tax year |
| B | Taxable, over Rs 5 lakh, with an Assessing Officer certificate (sec 395) |
| C | Taxable, over Rs 5 lakh, with a **CA certificate in Form 146** (UDIN mandatory) |
| D | Not taxable (e.g. the CA's DTAA analysis concludes the payment is not chargeable) |

- Payments whose purpose code is on the specified exempt list need no form. Ask the CA and bank whether the vendor's code (e.g. S0802/S0803) is on the list.
- Penalty for not filing or wrong filing: **up to Rs 1 lakh (s.462)**.
- **Card payments for API usage are a grey area**; get the CA's written position.

### 4.5 Equalisation levy

**Not applicable** to API or advertising payments made on or after 1 April 2025. The 2% e-commerce levy covered supplies only up to 31 July 2024 ([incometaxindia.gov.in](https://www.incometaxindia.gov.in/equalisation-levy3)).

### 4.6 Vendor payment checklist (run before every new vendor and every wire)

1. Invoice is in the company's name, with the GSTIN where the vendor supports it.
2. Issuing entity and country recorded.
3. GST treatment decided: reverse charge (foreign) or domestic ITC (Indian GSTIN).
4. TDS position documented by the CA, with the TRC and Form 41 on file.
5. Form 145 (plus Form 146 if needed) filed **before** a wire.
6. Paid from the company card or account.
7. Self-invoice raised within 30 days for reverse-charge invoices.
8. Entered in the reverse-charge register and the GSTR-3B workpaper.

---

## 5. Recommended banking and payment setup

| Component | Recommendation | Status |
|---|---|---|
| Operating account | Current account at an **AD Category-I bank**, opened through AGILE-PRO-S at incorporation. Choose a bank with a responsive trade/forex desk that issues FIRAs promptly and supports the EDF/EDPMS workflow. | Set up before the first invoice |
| USD receipts | SWIFT details on every invoice; purpose code agreed with the bank | Before the first invoice |
| EEFC sub-account | Optional; confirm the rules with the bank and your CA | Optional |
| IEC | From DGFT, linked to PAN; needed for e-BRC | Before the first receipt |
| PA-CB | Optional, for invoices under Rs 25 lakh only, from an RBI-licensed provider (check RBI's current list) | Optional |
| Company card | For AI API subscriptions and SaaS, in the company's name | Before moving AI accounts |
| Accounting | GST-native ledger with multi-currency, e-invoicing and TDS support (e.g. Zoho Books or TallyPrime; opinion, not a legal requirement) | Day 1 |
| Signatory rules | The CEO is the sole operating signatory. The board resolution sets limits; the second director co-signs above the limit (suggested). | First board meeting |
| Separation | No personal receipts or payments through the company account and vice versa; founder salary or reimbursement only by documented resolution or voucher | Always |

---

## 6. Indian clients (if any)

- This is **not an export**. Charge domestic GST: IGST for an inter-state client, CGST+SGST for an intra-state client. The 18% rate for IT services was **not re-verified after the September 2025 rate changes; confirm with your CA**.
- The client will usually deduct TDS on the fee. The section and rate under the 2025 Act were not researched; **confirm with your CA** and reconcile with Form 26AS or its successor.
- Put the **Udyam number** and the MSMED Act clause (payment within an agreed period not exceeding **45 days**, otherwise compound interest at 3 times the RBI Bank Rate) on invoices and contracts ([RBI FAQ](https://www.rbi.org.in/scripts/FAQView.aspx/FAQView.aspx?Id=84)).
- Sign a **DPDP processor addendum** (legal_operating_policy.md §4).

---

## 7. Corporate income tax: decisions for the CA

| Decision | Options | Notes |
|---|---|---|
| Tax regime | **Sec 200** (22% base; 10% surcharge and 4% cess give about **25.168%** effective for Tax Year 2026-27; no MAT; most deductions forgone; **irrevocable**, exercised by the return due date) **or** the normal regime (25%/30% plus surcharge; MAT at 15% of book profit; keeps deductions such as 80-IAC) | [s.200](https://indiacode.ecourtsindia.com/income-tax-act-2025/section/200/); [taxguru](https://taxguru.in/income-tax/new-tax-regime-provisions-domestic-companies-income-tax-act-2025.html) |
| s.80-IAC (reportedly s.140 in the 2025 Act) | 100% of eligible profits deducted for 3 consecutive years out of the first 10. Requires DPIIT recognition **and** an Inter-Ministerial Board certificate (applied for through Form-1). Incompatible with sec 200. MAT interaction under the 2025 Act unconfirmed. The IMB is reported to reject generic services businesses. | [incometaxindia](https://www.incometaxindia.gov.in/income-from-business/profession-taxation-of-start-ups); [Startup India](https://www.startupindia.gov.in/content/sih/en/form80iac.html) |
| Advance tax | 15% / 45% / 75% / 100% by 15 Jun / 15 Sep / 15 Dec / 15 Mar, if estimated tax after TDS exceeds Rs 10,000. Re-estimate each quarter: retainer receipts raise the liability quickly. | [beaconfiling](https://beaconfiling.com/blog/advance-tax-payment-schedule-india) |
| Presumptive taxation | Not available to companies (long-standing law; not re-verified for the new section numbers) | — |
| Export income exemption | None for a domestic-tariff-area company | — |

---

## 8. Open questions for the CA (answer before the first invoice)

1. SAC code for the pilot and the retainer.
2. Software (P0807) or consultancy (P0802) classification for the EDF and purpose code.
3. Exchange-rate convention for the INR value on export invoices.
4. Business or profession classification, which sets the tax audit threshold.
5. TDS position, and Form 145 Part C or D, for Anthropic and Google invoices; whether card payments need Form 145.
6. Monthly or QRMP GST filing (recommendation: monthly).
7. Sec 200 versus normal regime plus 80-IAC.
8. W-8BEN-E and treaty claims for US clients; foreign tax credit treatment if any client withholds.
9. GST refund time limit and refund cadence.
10. EEFC account: yes or no.
