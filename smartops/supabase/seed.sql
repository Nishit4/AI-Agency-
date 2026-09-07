-- =========================================================
-- SmartOps — demo seed data
-- Run AFTER schema.sql, in the Supabase SQL editor.
-- Safe to re-run: it clears the demo rows first (agents are left alone).
-- =========================================================

begin;

delete from agent_messages;
delete from agent_tasks;
delete from approvals;
delete from invoices;
delete from leads;
delete from campaigns;
delete from clients;

-- ---------- clients ----------
insert into clients (name, company, email, phone, status, plan_amount, plan_name, onboarded_at) values
  ('Rajesh Kumar',   'Sharma Textiles',      'rajesh@sharmatextiles.in',  '+91 98200 11223', 'active',     45000,  'Growth',     now() - interval '5 months'),
  ('Priya Menon',    'Menon Dental Care',    'priya@menondental.in',      '+91 98450 33445', 'active',     14999,  'Starter',    now() - interval '3 months'),
  ('Arjun Shah',     'Shah Logistics',       'arjun@shahlogistics.co.in', '+91 99300 55667', 'active',     150000, 'Enterprise', now() - interval '8 months'),
  ('Neha Gupta',     'Bloom Boutique',       'neha@bloomboutique.in',     '+91 90040 77889', 'active',     24999,  'Growth',     now() - interval '2 months'),
  ('Vikram Reddy',   'Reddy Constructions',  'vikram@reddycon.in',        '+91 91000 22110', 'onboarding',  75000, 'Scale',      now() - interval '9 days'),
  ('Ananya Iyer',    'Iyer Ayurveda',        'ananya@iyerayurveda.in',    '+91 97400 66554', 'onboarding',  7499,  'Starter',    now() - interval '3 days'),
  ('Sandeep Joshi',  'Joshi Motors',         'sandeep@joshimotors.in',    '+91 93200 44332', 'lead',        32000, 'Growth',     null),
  ('Fatima Sheikh',  'Sheikh Catering Co',   'fatima@sheikhcatering.in',  '+91 96500 88776', 'lead',        18000, 'Starter',    null),
  ('Manish Patel',   'Patel Pharma Distrib', 'manish@patelpharma.in',     '+91 94260 99001', 'paused',      55000, 'Scale',      now() - interval '11 months'),
  ('Divya Nair',     'Nair Interiors',       'divya@nairinteriors.in',    '+91 98860 12345', 'churned',     22000, 'Growth',     now() - interval '14 months');

-- ---------- invoices (6 months of billing history for active clients) ----------
insert into invoices (client_id, amount, status, razorpay_order_id, razorpay_payment_id, due_date, paid_at, created_at)
select
  c.id,
  c.plan_amount,
  'paid',
  'order_demo_' || substr(md5(random()::text), 1, 12),
  'pay_demo_'  || substr(md5(random()::text), 1, 12),
  (date_trunc('month', now()) - (m || ' months')::interval + interval '7 days')::date,
  date_trunc('month', now()) - (m || ' months')::interval + interval '5 days',
  date_trunc('month', now()) - (m || ' months')::interval
from clients c
cross join generate_series(1, 6) as m
where c.status = 'active'
  and c.onboarded_at is not null
  and c.onboarded_at < date_trunc('month', now()) - (m || ' months')::interval;

-- current month: two sent, one overdue
insert into invoices (client_id, amount, status, razorpay_order_id, due_date, created_at)
select c.id, c.plan_amount, 'sent',
       'order_demo_' || substr(md5(random()::text), 1, 12),
       (date_trunc('month', now()) + interval '7 days')::date,
       date_trunc('month', now())
from clients c where c.company in ('Sharma Textiles', 'Bloom Boutique');

insert into invoices (client_id, amount, status, razorpay_order_id, due_date, created_at)
select c.id, c.plan_amount, 'overdue',
       'order_demo_' || substr(md5(random()::text), 1, 12),
       (date_trunc('month', now()) - interval '23 days')::date,
       date_trunc('month', now()) - interval '1 month'
from clients c where c.company = 'Menon Dental Care';

-- ---------- campaigns ----------
insert into campaigns (name, channel, status, budget, spent, leads_generated) values
  ('SMB Automation — Google Search', 'Google Ads',      'active',    60000, 41200, 38),
  ('LinkedIn Founder Outreach',      'LinkedIn',        'active',    35000, 22400, 21),
  ('WhatsApp Retargeting — Mumbai',  'WhatsApp',        'active',    18000,  9600, 27),
  ('Instagram Reels — D2C Brands',   'Instagram',       'paused',    25000, 25000, 14),
  ('SEO Content Cluster Q1',         'Organic Search',  'completed', 40000, 40000, 52),
  ('Local Business Directory Push',  'Justdial/IndiaMART', 'draft',  12000,     0,  0);

-- ---------- leads ----------
insert into leads (name, company, email, phone, source, status, campaign_id)
select l.name, l.company, l.email, l.phone, l.source, l.status::lead_status, c.id
from (values
  ('Karthik Raman',  'Raman Electronics',   'karthik@ramanelec.in',    '+91 98111 23456', 'Google Ads',      'qualified'),
  ('Sneha Deshmukh', 'Deshmukh Farms',      'sneha@deshmukhfarms.in',  '+91 99220 34567', 'Google Ads',      'contacted'),
  ('Imran Khan',     'Khan Auto Parts',     'imran@khanauto.in',       '+91 97330 45678', 'LinkedIn',        'new'),
  ('Meera Pillai',   'Pillai Tutorials',    'meera@pillaitutorials.in','+91 96440 56789', 'WhatsApp',        'qualified'),
  ('Rohit Bansal',   'Bansal Sweets',       'rohit@bansalsweets.in',   '+91 95550 67890', 'Organic Search',  'converted'),
  ('Alisha Fernandes','Fernandes Travels',  'alisha@fernandestravel.in','+91 94660 78901','Instagram',       'lost'),
  ('Gaurav Malhotra','Malhotra Realty',     'gaurav@malhotrarealty.in','+91 93770 89012', 'LinkedIn',        'new'),
  ('Sunita Rao',     'Rao Handicrafts',     'sunita@raohandicrafts.in','+91 92880 90123', 'WhatsApp',        'contacted')
) as l(name, company, email, phone, source, status)
left join campaigns c on c.channel = l.source;

-- ---------- pending approvals (the CEO's queue) ----------
insert into approvals (department, agent_name, title, description, payload, status, client_id, created_at)
select v.department::department, v.agent_name, v.title, v.description, v.payload::jsonb, v.status::approval_status, c.id, now() - (v.age || ' hours')::interval
from (values
  ('finance', 'Billing Agent',
   'Send October invoice to Sharma Textiles (₹45,000)',
   'Invoice for the Growth plan is drafted and ready. Razorpay order created, due 7 Oct. Client has paid on time for 5 consecutive months — recommending standard terms, no reminder sequence needed.',
   '{"invoice_amount": 45000, "due_date": "2026-10-07", "plan": "Growth"}', 'pending', 'Sharma Textiles', 2),

  ('finance', 'CFO Agent',
   'Approve plan price increase for Shah Logistics (₹1,50,000 → ₹1,75,000)',
   'Shah Logistics has exceeded contracted scope for 3 consecutive months (avg 40% over on automation runs). Proposing a 16.7% uplift at renewal on 1 Nov. Risk: they are our largest account. Recommend a call before sending.',
   '{"current": 150000, "proposed": 175000, "effective": "2026-11-01"}', 'pending', 'Shah Logistics', 6),

  ('marketing', 'CMO Agent',
   'Launch WhatsApp retargeting campaign — ₹18,000 budget',
   'Targeting the 34 leads who opened but did not book a call in the last 30 days. Projected 8-12 booked calls at ₹1,500-2,200 CAC, well under our ₹4,000 ceiling. Creative is drafted and QA-passed.',
   '{"budget": 18000, "channel": "WhatsApp", "audience_size": 34}', 'pending', null, 9),

  ('operations', 'Client Success',
   'Send churn-risk check-in email to Patel Pharma Distributors',
   'Account paused 3 weeks ago, no response to two automated touchpoints. Drafted a direct, non-salesy note from you offering a 15-min call. Recommend sending from your personal address rather than the agency one.',
   '{"risk_level": "high", "days_paused": 21}', 'pending', 'Patel Pharma Distrib', 15),

  ('technology', 'DevOps Agent',
   'Deploy n8n workflow update to production — invoice reminder automation',
   'New workflow sends a payment reminder 3 days before due date and escalates to you if unpaid 5 days after. Tested against 12 historical invoices with no false positives. Deploy touches production n8n only, no client-facing changes.',
   '{"workflow": "invoice-reminder-v2", "env": "production"}', 'pending', null, 26),

  ('marketing', 'Content Writer',
   'Publish landing page — "AI Operations for Indian SMBs"',
   'Long-form page targeting "business automation India" (2,400 monthly searches, low competition). Draft is 1,850 words, QA-passed, includes 3 client outcomes as social proof. Needs your sign-off before it goes live.',
   '{"target_keyword": "business automation india", "word_count": 1850}', 'pending', null, 31)
) as v(department, agent_name, title, description, payload, status, company, age)
left join clients c on c.company = v.company;

-- a few already-resolved ones so the "recently resolved" section isn't empty
insert into approvals (department, agent_name, title, description, status, resolved_at, resolved_by, created_at)
values
  ('finance', 'Billing Agent', 'Send September invoice to Bloom Boutique (₹24,999)',
   'Standard monthly invoice, Growth plan. Client on auto-pay via Razorpay.',
   'approved', now() - interval '2 days', 'CEO', now() - interval '2 days'),
  ('marketing', 'Lead Gen Agent', 'Send cold outreach to 200 Pune manufacturing SMBs',
   'Proposed list is largely sub-10-employee firms well below our ₹7,499 entry point — poor fit for current pricing.',
   'rejected', now() - interval '4 days', 'CEO', now() - interval '4 days');

-- ---------- agent task history ----------
insert into agent_tasks (agent_name, department, title, status, result, created_at)
values
  ('QA Auditor',         'operations', 'Review Content Writer landing page draft',        'done',        'Passed. Two claims needed softening (removed "guaranteed"), fixed 3 grammar issues.', now() - interval '5 hours'),
  ('Bookkeeper',         'finance',    'Reconcile September Razorpay settlements',        'done',        'All 7 payments matched to invoices. ₹1,64,997 settled, zero discrepancies.', now() - interval '1 day'),
  ('SEO Analyst',        'marketing',  'Weekly organic ranking audit',                    'done',        'Up 4 positions on "AI agency India". Two pages lost ground to a competitor refresh — content update queued.', now() - interval '2 days'),
  ('Support Engineer',   'technology', 'Triage: Menon Dental booking sync failing',       'done',        'Root cause was an expired Cal.com token on their side. Reconnected, verified 3 test bookings.', now() - interval '3 days'),
  ('Project Coordinator','operations', 'Weekly deliverable status sweep',                 'in_progress', null, now() - interval '30 minutes'),
  ('Automation Builder', 'technology', 'Build lead-scoring workflow for Reddy Constructions', 'queued',   null, now() - interval '10 minutes');

commit;
