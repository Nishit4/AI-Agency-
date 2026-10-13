# Annual Compliance Calendar

**Company:** `[COMPANY NAME] Private Limited` (small company, 31 March year-end, GST-registered exporter of services under LUT)
**Prepared:** 13 October 2026. This is research, not legal or tax advice; have your CA/CS confirm it before you rely on it.

**Owner:** the CEO is accountable for every line. The CA/CS prepares and files. AI agents may draft reminders and reconciliations, but they never file, pay or sign (see ceo_operating_manual.md §6).

**Reading the dates:**
- Dates marked **(confirm with your CA/CS)** were not verified against a primary source in this research.
- The Income-tax Act, 2025 replaced the 1961 Act from **1 April 2026**. Several due dates and forms under the new Act were not re-verified and are flagged.
- If a due date falls on a holiday, do not assume an extension; file early.

---

## 1. How to use this calendar

1. Put every dated item in §3 and §4 into the CEO's calendar, with reminders 7 days and 2 days before.
2. Run the **monthly close** (§2) in the first 10 days of every month.
3. Event-driven items (§5) are triggered by a business event, such as an invoice, a vendor payment, an incident, a new director or a change of address.
4. Penalties are summarised in §6. The small-company relief under s.446B halves most Companies Act penalties, capped at Rs 2 lakh for the company and Rs 1 lakh for an officer ([s.446B](https://indiacode.ecourtsindia.com/companies-act/section/446B/)).

---

## 2. Every month

| Due | Item | Law | Notes and source |
|---|---|---|---|
| Within 30 days of receiving the service | **Self-invoice for reverse-charge (RCM) imports**, e.g. foreign-entity Anthropic or Google API invoices, plus a payment voucher | CGST rule 47A | Applies from 1 Nov 2024. Keep an RCM register. [taxguru](https://taxguru.in/goods-and-service-tax/foreign-software-subscriptions-attract-gst-reverse-charge-itc.html) |
| **7th** of the following month | **TDS deposit** for TDS deducted in the previous month, including any TDS on foreign vendor payments (sec 393) | Income-tax Act 2025 | The 7th is the 1961-Act practice; new-Act dates not re-verified (**confirm with your CA**). Under the old rules March TDS was due 30 April (**confirm with your CA**). |
| **11th** (monthly filer) | **GSTR-1**: report every export invoice in Table 6A under "without payment of tax (LUT)" | CGST | Late fee Rs 50/day (Rs 20 nil), capped by turnover band. [taxgarden](https://taxgarden.in/blog/gst-return-due-dates-calendar-gstr-1-3b-9-fy-2025-26-india) |
| **20th** (monthly filer) | **GSTR-3B**: pay reverse-charge IGST **in cash** (Table 3.1(d)); claim the matching ITC (Table 4(A)(2)). File even when nil. | CGST | Late fee Rs 50/day (Rs 20 nil), capped at Rs 2,000 / 5,000 / 10,000 by turnover band, plus 18% a year interest. Returns cannot be filed more than 3 years after the due date. |
| **13th / 22nd or 24th / 25th** (only if on QRMP) | Quarterly GSTR-1 by the 13th after the quarter; quarterly GSTR-3B by the 22nd or 24th (depending on state); PMT-06 challan by the 25th for months 1 and 2 | CGST | QRMP is open only up to Rs 5 crore turnover. **Recommendation: file monthly.** Refund cycles are faster, and turnover will likely pass Rs 5 crore in year 1. |
| Within **30 days from the end of the month** in which the invoice was raised | **Export Declaration Form (EDF)**, the successor to SOFTEX: one consolidated EDF for all of the month's export invoices, filed with the AD bank (or STPI) | FEMA (Export and Import of Goods and Services) Regulations 2026, reg 3(2) | In force from 1 Oct 2026. Treat the deliverables as "software" (the stricter rule) unless the AD bank confirms otherwise. [RBI](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13277&Mode=0) |
| After each USD receipt | **e-BRC** self-certified on DGFT from the bank's IRM, linked to the GST invoice number and date. Download and file the **FIRA**. | DGFT; FEMA | The e-BRC format added mandatory GSTIN and invoice fields from 13 Jan 2026. [DGFT](https://www.dgft.gov.in/CP/?opt=eBRC) |
| Monthly review | **Export receivables ageing.** Every invoice must be realised **within 9 months of the invoice date** (12 months if invoiced or settled in INR). Raise alerts at 90 days, 180 days and 30 days before the deadline. | FEMA Regs 2026 reg 5(1) | Under GST rule 96A, if payment is not received within 1 year or the FEMA period, whichever is later, IGST plus interest becomes payable within 15 days. [Rule 96A](https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/rules/cgst_rules/active/chapter10/rule96a_v1.00.html) |
| Monthly or quarterly | **GST refund claim (RFD-01)** for unused ITC on zero-rated exports, with e-BRCs, the invoice statement and GSTR-2B | IGST s.16(3); CGST s.54, rule 89 | Time limit believed to be 2 years from the relevant date (**confirm with your CA**). File promptly; reverse-charge IGST on API spend is cash locked up until refunded. |
| Rolling | **CERT-In logs**: ICT logs kept for a rolling **180 days**; clocks synced to NIC/NPL NTP | CERT-In Directions 28 Apr 2022 | [CERT-In FAQ](https://www.cert-in.org.in/PDF/FAQs_on_CyberSecurityDirections_May2022.pdf) |
| Monthly close (by the 10th) | Books closed; bank reconciliation; FX gain/loss; RCM register; suppression-list and outreach-compliance audit; AI-vendor tier check (paid, no-training only) | Internal policy | See ceo_operating_manual.md §4 |

---

## 3. Month-by-month calendar (financial year April to March)

The dates below are for **FY 2027-28**, the first full financial year. Repeat them each year. Items for the **first, short financial year** (incorporation to 31 March 2027) are listed in §4.

### April
| Date | Item | Source |
|---|---|---|
| **1 April, before the first export invoice of the FY** | **File a fresh GST LUT (RFD-11)**. The previous LUT expires on 31 March. Without a valid LUT, exports must be invoiced with IGST and refunded later, which locks up cash. | [GST tutorial](https://tutorial.gst.gov.in/userguide/refund/Furnishing_of_Letter_of_Undertaking_for_Export_of_Goods_or_Services.htm) |
| 1 April | Open the new FY in the books. Restart the invoice serial series (unique per FY, max 16 characters, rule 46). | [Rule 46](https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/rules/cgst_rules/active/chapter6/rule46_v1.00.html) |
| 1 April | **Check e-invoicing applicability.** It is mandatory once aggregate turnover exceeded Rs 5 crore in any year from 2017-18 (Notification 10/2023-CT). Confirm the exact start date with your CA. | [GST Council](https://www.gstcouncil.gov.in/node/4365) |
| 11th / 20th | GSTR-1 and GSTR-3B for March | §2 |
| **30 April** | **MSME-1** (half-year October–March), only if dues to micro or small suppliers were outstanding more than 45 days | [taxguru](https://taxguru.in/income-tax/all-about-dpt-3-msme-1-e-form-active-faq.html) |
| 30 April | TDS for March deposited (1961-Act rule; **confirm with your CA**) | — |
| End of month | EDF for March invoices | §2 |

### May
| Date | Item | Source |
|---|---|---|
| 11th / 20th | GSTR-1 and GSTR-3B for April | §2 |
| 31 May | Quarterly TDS return (27Q for non-resident payments) for January–March, if any TDS was deducted. This was the 1961-Act date; new-Act form and date not re-verified (**confirm with your CA**). | — |
| **13 May 2027 (one-time)** | **DPDP Act core duties start**, together with the repeal of IT Act s.43A. Calculated as 18 months from the 13/14 Nov 2025 notification; plan to 13 May 2027 and check the Gazette. From now on: privacy notice live, processor addenda signed with Indian clients, breach runbook covering DPB and client notice, deletion on completion. | [Gazette](https://gazettetracker.com/g/CG-DL-E-14112025-267650); [PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190014) |
| Before the auditor starts | Hand the FY's books, registers and FEMA/GST reconciliations to the statutory auditor | — |

### June
| Date | Item | Source |
|---|---|---|
| **15 June** | **Advance tax, 1st instalment: 15%** of estimated tax for the year (if estimated tax after TDS exceeds Rs 10,000). Interest of about 1% a month on shortfalls (rate not re-verified under the new Act). | [beaconfiling (secondary)](https://beaconfiling.com/blog/advance-tax-payment-schedule-india) |
| **30 June** | **DPT-3** (position at 31 March), if the company has deposits or money not treated as deposits, e.g. **a director's loan to the company** | [MCA DPT-3](https://www.mca.gov.in/content/mca/global/en/mca/e-filing/foreigncompany-deposits-and-Nidhi-services/DPT-3.html) |
| **30 June (in the KYC year)** | **DIR-3 KYC Web** for each director, once every 3 financial years. Directors already KYC-compliant are next due **30 June 2028**. The first due date for DINs allotted after 31 Mar 2026 is unconfirmed (**confirm with your CS**). Also file within 30 days of any change to mobile, email or address. | [PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2210552) |
| By 30 June | **Board meeting #1** of the calendar half January–June (if not already held). It must be at least 90 days from the previous one. Typical agenda: approve audited accounts, AGM notice, the auditor's report. | [s.173](https://indiankanoon.org/doc/9397918/) |
| 11th / 20th | GSTR-1 and GSTR-3B for May | §2 |

### July
| Date | Item | Source |
|---|---|---|
| 11th / 20th | GSTR-1 and GSTR-3B for June | §2 |
| 31 July | Quarterly TDS return (27Q) for April–June, if applicable (1961-Act date; **confirm with your CA**) | — |
| July | Audit fieldwork; tax audit (Form 26) preparation if turnover crosses the threshold | [Form 26 FAQ](https://www.incometaxindia.gov.in/documents/d/guest/form-26-faqs) |

### August
| Date | Item | Source |
|---|---|---|
| 11th / 20th | GSTR-1 and GSTR-3B for July | §2 |
| August | Send the AGM notice. The notice period was not researched (**confirm with your CS**). | — |

### September
| Date | Item | Source |
|---|---|---|
| **15 September** | **Advance tax, 2nd instalment: cumulative 45%** | [beaconfiling](https://beaconfiling.com/blog/advance-tax-payment-schedule-india) |
| **30 September** | **Tax audit report (Form 26, s.63 of the 2025 Act)**, if business turnover exceeds Rs 1 crore, or Rs 10 crore where cash receipts and payments are each 5% or less (profession: Rs 50 lakh). The business-versus-profession classification must be decided by your CA. Penalty reported as capped at Rs 1.5 lakh; exact new-Act percentage not verified. | [Form 26 FAQ](https://www.incometaxindia.gov.in/documents/d/guest/form-26-faqs) |
| **30 September** | **AGM** (within 6 months of FY end, with no more than 15 months between AGMs). Business: adopt the audited accounts; appoint or ratify the auditor (at the first AGM, appoint for a 5-year term). Penalty under s.99 (amount not verified). | [s.96](https://indiacode.ecourtsindia.com/companies-act/section/96/) |
| Within 15 days of the AGM that appoints the auditor | **ADT-1** | [ADT-1](https://indiankanoon.org/doc/30449914/) |
| 11th / 20th | GSTR-1 and GSTR-3B for August | §2 |

### October
| Date | Item | Source |
|---|---|---|
| **Within 30 days of the AGM** (about 30 October) | **AOC-4**, filing the financial statements with the ROC. Penalty under s.137(3): Rs 10,000 + Rs 100/day up to Rs 2 lakh (company), and Rs 10,000 + Rs 100/day up to Rs 50,000 (officer), halved under s.446B, plus additional filing fees. | [s.137](https://lawx.in/acts/section/24/311/2984) |
| **31 October** | **Company income-tax return** (s.263(1), 2025 Act; 30 November where a transfer-pricing report is required). For Tax Year 2026-27 this is 31 Oct 2027. The form designation under the Income-tax Rules 2026 was not confirmed (formerly ITR-6). **The sec 200 (22%) option, if chosen, is exercised by this date and is irrevocable.** | [incometax.gov.in](http://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/income-tax-returns) |
| **31 October** | **MSME-1** (half-year April–September), if applicable | [taxguru](https://taxguru.in/income-tax/all-about-dpt-3-msme-1-e-form-active-faq.html) |
| 31 October | Quarterly TDS return (27Q) for July–September, if applicable (**confirm with your CA**) | — |
| 11th / 20th | GSTR-1 and GSTR-3B for September | §2 |

### November
| Date | Item | Source |
|---|---|---|
| **Within 60 days of the AGM** (about 29 November) | **MGT-7A**, the small-company annual return. Penalty under s.92(5): Rs 10,000 + Rs 100/day, max Rs 2 lakh (company) / Rs 50,000 (officer), halved under s.446B. | [s.92](https://lawx.in/acts/section/24/309/2938) |
| 11th / 20th | GSTR-1 and GSTR-3B for October | §2 |
| 13/14 Nov 2026 (one-time, informational) | DPDP consent-manager provisions start. No direct obligation on this company. | [Enforcement timeline](https://indiacode.ecourtsindia.com/rules/enforcement-timeline-for-the-dpdp-act-e1be0965/) |

### December
| Date | Item | Source |
|---|---|---|
| **15 December** | **Advance tax, 3rd instalment: cumulative 75%** | [beaconfiling](https://beaconfiling.com/blog/advance-tax-payment-schedule-india) |
| By 31 December | **Board meeting #2** of the calendar half July–December, at least 90 days after meeting #1 | [s.173](https://indiankanoon.org/doc/9397918/) |
| **31 December** | **GSTR-9** annual return (mandatory above Rs 2 crore turnover; the exemption is notified each year, so confirm it). **GSTR-9C** reconciliation above Rs 5 crore. | [GSTR-9 FAQ](https://tutorial.gst.gov.in/userguide/returns/FAQs_gstr9.htm) |
| 11th / 20th | GSTR-1 and GSTR-3B for November | §2 |

### January
| Date | Item | Source |
|---|---|---|
| 11th / 20th | GSTR-1 and GSTR-3B for December | §2 |
| 31 January | Quarterly TDS return (27Q) for October–December, if applicable (**confirm with your CA**) | — |
| January | Annual policy review: AI vendor terms (re-read the Anthropic Commercial Terms and Gemini API terms for changes), outreach rules by country, insurance limits against contract caps | legal_operating_policy.md |

### February
| Date | Item | Source |
|---|---|---|
| 11th / 20th | GSTR-1 and GSTR-3B for January | §2 |
| February | Budget and Finance Act changes: ask the CA for an impact note (tax rates, TDS, GST) | — |

### March
| Date | Item | Source |
|---|---|---|
| **15 March** | **Advance tax, 4th instalment: 100%** | [beaconfiling](https://beaconfiling.com/blog/advance-tax-payment-schedule-india) |
| By 31 March | Prepare the next year's LUT so it can be filed on 1 April | §3 April |
| 31 March | Year-end cut-off: list unrealised export invoices and their FEMA deadlines; collect confirmations and FIRAs; accrue vendor invoices | — |
| 11th / 20th | GSTR-1 and GSTR-3B for February | §2 |

---

## 4. First (short) financial year: incorporation to 31 March 2027

These dates assume incorporation in October–December 2026. Day 0 is the date on the Certificate of Incorporation.

| When | Item | Source |
|---|---|---|
| Day 0 + 30 | First board meeting; first auditor appointed by the board (s.139(6)); INC-22 if needed | [s.139](https://indiacode.ecourtsindia.com/companies-act/section/139/) |
| Before the first export invoice | **LUT for FY 2026-27** (valid until 31 March 2027) | GST tutorial |
| Day 0 + 60 | Share certificates issued (s.56(4)(a)) | Companies Act |
| Before the first invoice (legal limit Day 0 + 180) | **INC-20A**. No business or borrowing until it is filed. | [s.10A](https://indiacode.ecourtsindia.com/companies-act/section/10A/) |
| Each half of the calendar year | One board meeting in each half, at least 90 days apart | s.173(5) |
| 15 Dec 2026 / 15 Mar 2027 | Advance tax instalments, if estimated tax exceeds Rs 10,000 | — |
| **1 April 2027** | New LUT for FY 2027-28 | — |
| **13 May 2027** | DPDP core duties start | §3 May |
| **31 Oct 2027** | First income-tax return (Tax Year 2026-27); sec 200 option decision | — |
| **By 31 Dec 2027** | **First AGM.** The law allows up to 9 months after the first FY end. **Recommendation: hold it by 30 Sep 2027**, since the audit must be finished for the tax return anyway. Then AOC-4 within 30 days and MGT-7A within 60 days. Appoint the auditor for a 5-year term and file ADT-1 within 15 days. | [s.96](https://indiacode.ecourtsindia.com/companies-act/section/96/) |
| 31 Dec 2027 | GSTR-9 for FY 2026-27 (if above the notified threshold) | — |
| 30 June 2028 | DIR-3 KYC for already-compliant directors. **Confirm with your CS** when a newly allotted DIN is first due. | [PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2210552) |

---

## 5. Event-driven items

| Trigger | Action and deadline | Source |
|---|---|---|
| **Every export invoice** | Rule 46 invoice with the LUT endorsement (see tax_and_payments.md §2). Report it in GSTR-1. Include it in that month's EDF. Track realisation within 9 months. | Rule 46; FEMA Regs 2026 |
| **Every USD receipt** | FIRA from the bank; e-BRC on DGFT. Check the purpose code (P0807 / P0802 / P0103 for advances). If the amount is short (e.g. foreign bank charges deducted), ask the AD bank for reduced-realisation approval (reg 6). | DGFT; RBI |
| **Every payment to a foreign vendor** (wire) | Before remitting: **Form 145** (old 15CA) and, where taxable and over Rs 5 lakh, a CA certificate in **Form 146** (old 15CB). Penalty for not filing or wrong filing: up to Rs 1 lakh (s.462). Deduct and deposit TDS if the CA concludes it is due (sec 393(2)). Card payments are a grey area; ask the CA. | [Form 145 FAQ](https://www.incometaxindia.gov.in/documents/d/guest/form-145-faqs) |
| **Every foreign-entity AI vendor invoice** | Self-invoice within 30 days (rule 47A); pay IGST in cash in GSTR-3B. | §2 |
| **Cyber incident** (unauthorised access, data breach or leak, malicious code, including incidents on third-party systems holding company data) | **Report to CERT-In within 6 hours of noticing** (partial information is acceptable). Notify the client per contract. From 13 May 2027, notify Indian data fiduciary clients promptly so they can meet their DPDP duties. Penalty under s.70B(7): up to 1 year's imprisonment and/or a fine up to Rs 1 lakh. | [CERT-In Directions](https://cert-in.org.in/Directions70B.jsp) |
| **Director's mobile, email or address changes** | DIR-3 KYC update within 30 days | PIB |
| **Registered office changes** | INC-22 (and other forms depending on the type of shift; **confirm with your CS**) | MCA |
| **Auditor appointed** | ADT-1 within 15 days | — |
| **Shares allotted or capital increased** | PAS-3 / SH-7, as applicable (**confirm with your CS**) | — |
| **Director lends money to the company** | Record it; report it in DPT-3 by 30 June | MCA DPT-3 |
| **Dues to an MSME supplier exceed 45 days** | MSME-1 half-yearly; pay within 45 days to avoid interest at 3 times the RBI Bank Rate | [RBI FAQ](https://www.rbi.org.in/scripts/FAQView.aspx/FAQView.aspx?Id=84) |
| **Turnover passes Rs 5 crore** | E-invoicing from the applicable date; GSTR-9C; leave QRMP | §3 April |
| **Turnover passes Rs 10 crore** | Udyam category moves from micro to small (update Udyam); tax-audit threshold under the 95%-digital route | Udyam; Form 26 FAQ |
| **Export receivable unrealised 1 year past its due date** | Further exports only against full advance or an irrevocable letter of credit (reg 13). Prevent this. | RBI |
| **Insurance policy anniversary** | Renew the technology E&O and cyber policies **before expiry**, with **no gap** (they are claims-made; keep the original retro date). Update the declared revenue, clients and the AI-delivery description. Recalendar on the bind date. | legal_operating_policy.md §6 |
| **New AI model provider** | 30-day notice to clients (current MSA s.16); update the sub-processor list (SCC Annex III / Exhibit E) | legal_operating_policy.md §3 |
| **New Indian client** | DPDP processor addendum; MSMED 45-day clause and Udyam number on invoices; domestic GST at 18% (rate after the September 2025 changes not re-verified; **confirm with your CA**) | tax_and_payments.md §6 |

---

## 6. Penalty summary

| Default | Penalty | Source |
|---|---|---|
| INC-20A not filed in time | Rs 50,000 (company) + Rs 1,000/day per officer up to Rs 1 lakh, halved under s.446B; possible strike-off | [s.10A](https://indiacode.ecourtsindia.com/companies-act/section/10A/) |
| AOC-4 late | Company Rs 10,000 + Rs 100/day (max Rs 2 lakh); officer Rs 10,000 + Rs 100/day (max Rs 50,000); halved under s.446B; plus additional fees | [s.137](https://indiacode.ecourtsindia.com/companies-act/section/137/) |
| MGT-7A late | Rs 10,000 + Rs 100/day; max Rs 2 lakh (company) / Rs 50,000 (officer); halved under s.446B; plus additional fees | [s.92](https://indiacode.ecourtsindia.com/companies-act/section/92/) |
| Board meeting notice failure | Rs 25,000 on the officer (s.173(4)) | [s.173](https://indiankanoon.org/doc/9397918/) |
| AGM not held | s.99 penalty (amount not verified; **confirm with your CS**) | [s.96](https://indiacode.ecourtsindia.com/companies-act/section/96/) |
| DIR-3 KYC missed | DIN deactivated until filed with a late fee (historically Rs 5,000; current amount not verified) | PIB |
| GSTR-1 / GSTR-3B late | Rs 50/day (Rs 20 nil), capped by turnover band; 18% interest on late tax; filing barred after 3 years | [taxgarden](https://taxgarden.in/blog/gst-return-due-dates-calendar-gstr-1-3b-9-fy-2025-26-india) |
| GSTR-9 late | Rs 50/day up to Rs 5 crore turnover, capped at 0.04% of state turnover (practitioner source) | [GSTR-9 FAQ](https://tutorial.gst.gov.in/userguide/returns/FAQs_gstr9.htm) |
| No valid LUT | Exports invoiced with IGST, then refunded (cash locked up) | GST tutorial |
| Export payment not received in time (rule 96A) | IGST + interest within 15 days, or the LUT facility is withdrawn | [Rule 96A](https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/rules/cgst_rules/active/chapter10/rule96a_v1.00.html) |
| FEMA realisation missed | FEMA contravention; after 1 year overdue, only advance or LC exports are allowed | [RBI](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13277&Mode=0) |
| Form 145 / 146 not filed | Up to Rs 1 lakh (s.462) | [Form 145 FAQ](https://www.incometaxindia.gov.in/documents/d/guest/form-145-faqs) |
| TDS not deducted when due | Treated as assessee in default; interest; expense disallowed | [rkchari (secondary)](https://rkchari.com/blog/wht-cloud-saas-non-resident-vendors) |
| Advance tax shortfall | Interest, about 1% a month (not re-verified under the 2025 Act) | beaconfiling |
| Tax audit not filed | Reported cap of Rs 1.5 lakh (new-Act percentage not verified) | Form 26 FAQ |
| CERT-In non-compliance | Up to 1 year's imprisonment and/or a fine up to Rs 1 lakh | [CERT-In FAQ](https://www.cert-in.org.in/PDF/FAQs_on_CyberSecurityDirections_May2022.pdf) |
| DPDP security failure (from 13 May 2027) | Up to Rs 250 crore (not re-verified; **confirm with counsel**) | [DPDP Act](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf) |

---

## 7. Items not covered or unconfirmed

Confirm these with your CA/CS:
- TDS deposit and return dates, and form numbers, under the Income-tax Act 2025.
- Late fee and interest amounts under the 2025 Act.
- The ITR form designation for Tax Year 2026-27.
- The GST refund time limit.
- The s.99 AGM penalty and the AGM notice period.
- The DIR-3 KYC first due date for new DINs.
- State professional tax and Shops and Establishment renewals for your state.
- EPFO/ESIC thresholds.
- Whether the Corporate Laws (Amendment) Bill 2026 has passed, which would change the small-company thresholds, auditor exemptions and virtual AGMs.
