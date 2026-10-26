export interface CardDetailInfo {
  id: string
  title: string
  category: string
  shortDescription: string
  purpose: string
  formulaOrSources: string
  regulatoryBasis?: string
  thresholdsAndActions: {
    good: string
    warning: string
    critical: string
  }
}

export const PROCUREMENT_CARD_REGISTRY: Record<string, CardDetailInfo> = {
  // ===================== 13 KPI CARDS =====================
  'kpi-total-pr': {
    id: 'kpi-total-pr',
    title: 'Total Purchase Requests (PR)',
    category: 'Demand Management',
    shortDescription: 'Total number and aggregate estimated amount of Purchase Requests received during the selected fiscal year.',
    purpose: 'Measures overall agency procurement demand and volume originating from end-user units and project implementation offices.',
    formulaOrSources: 'Sum of all PR line items submitted and approved by Department Heads in the current Fiscal Year.',
    regulatoryBasis: 'RA 9184 Sec. 7 (Procurement Planning & Budgeting Linkage) and DBM Budget Execution Guidelines.',
    thresholdsAndActions: {
      good: 'Steady incoming stream aligned with quarterly Project Procurement Management Plans (PPMP).',
      warning: 'Surge in ad-hoc or unprogrammed PRs nearing end of quarter exceeding 15% of annual PPMP.',
      critical: 'Excessive off-cycle PR submissions indicating poor demand forecasting or budget fragmentation.',
    },
  },

  'kpi-consolidated-pr': {
    id: 'kpi-consolidated-pr',
    title: 'Consolidated PRs Rate',
    category: 'Consolidation & Efficiency',
    shortDescription: 'Percentage of individual purchase requests aggregated into pooled bulk procurement packages.',
    purpose: 'Drives economies of scale, lowers unit costs, and eliminates repetitive micro-procurements across departments.',
    formulaOrSources: '(Consolidated PRs Count / Total PRs Eligible for Bulk Procurement) × 100.',
    regulatoryBasis: 'RA 9184 Sec. 7.3 prohibiting the splitting of government contracts and GPPB Resolution on Common-Use Supplies.',
    thresholdsAndActions: {
      good: '≥ 70% consolidation rate for common-use office supplies, IT equipment, and consumables.',
      warning: '40% - 69% consolidation rate; opportunities missed for bulk negotiated pricing.',
      critical: '< 40% consolidation rate; severe risk of artificial contract splitting and administrative inefficiency.',
    },
  },

  'kpi-active-rfq': {
    id: 'kpi-active-rfq',
    title: 'Active RFQs (Requests for Quotations)',
    category: 'Market Engagement',
    shortDescription: 'Number of active quotation requests currently open with suppliers or posted on PhilGEPS/bulletin boards.',
    purpose: 'Monitors ongoing market solicitation and ensures active vendor participation before canvass deadline.',
    formulaOrSources: 'Count of RFQ packages issued where the submission deadline has not yet lapsed and canvass is open.',
    regulatoryBasis: 'RA 9184 Rule XVI (Alternative Methods of Procurement - Shopping & Small Value Procurement).',
    thresholdsAndActions: {
      good: 'Sufficient supplier canvassing with minimum 3 responsive price quotations received per RFQ.',
      warning: 'RFQs within 2 days of deadline with fewer than 3 supplier submissions.',
      critical: 'Expired RFQ deadlines with 0 valid quotations, necessitating mandatory re-canvass or mode conversion.',
    },
  },

  'kpi-pending-bac': {
    id: 'kpi-pending-bac',
    title: 'Pending BAC Resolutions',
    category: 'Governance & Bidding',
    shortDescription: 'Completed bid evaluations and canvasses awaiting official Bids and Awards Committee resolution.',
    purpose: 'Tracks the speed of the BAC Secretariat and Committee members in declaring the Lowest Calculated Responsive Bid (LCRB).',
    formulaOrSources: 'Count of Abstract of Bids (AOB) or Bid Evaluation Reports completed but lacking BAC Resolution sign-off.',
    regulatoryBasis: 'RA 9184 Sec. 12 (Functions of the BAC) and statutory turnaround time under Citizen’s Charter.',
    thresholdsAndActions: {
      good: 'Resolutions executed within 3 calendar days following final evaluation matrix completion.',
      warning: 'Resolutions pending between 4 to 7 calendar days awaiting quorum or signatory review.',
      critical: 'Resolutions delayed > 7 calendar days; potential violation of statutory timeline rules.',
    },
  },

  'kpi-noa-issued': {
    id: 'kpi-noa-issued',
    title: 'Notices of Award (NOA) Issued',
    category: 'Contract Award',
    shortDescription: 'Total number and monetary value of statutory Notices of Award successfully served to winning contractors.',
    purpose: 'Marks the official conclusion of competitive bidding or alternative selection prior to contract perfection.',
    formulaOrSources: 'Sum of approved NOA documents signed by the Head of Procuring Entity (HoPE) during the fiscal year.',
    regulatoryBasis: 'RA 9184 Sec. 37 (Notice and Execution of Award) requiring HoPE approval within statutory period.',
    thresholdsAndActions: {
      good: 'NOA served to winning supplier within 3 calendar days of HoPE approval with proof of receipt.',
      warning: 'NOA pending supplier formal acceptance between 4 to 7 days.',
      critical: 'NOA unaccepted after 10 days; potential forfeiture of bid security and award to second lowest bidder.',
    },
  },

  'kpi-total-po': {
    id: 'kpi-total-po',
    title: 'Total Purchase Order (PO) Value',
    category: 'Financial Execution',
    shortDescription: 'Aggregated contract amount of all finalized and approved Purchase Orders and formal Supply Agreements.',
    purpose: 'Reflects realized budget obligation and committed government procurement expenditures for the period.',
    formulaOrSources: 'Sum of committed amounts across all approved and executed PO records.',
    regulatoryBasis: 'Government Accounting Manual (GAM) for National Government Agencies, COA Circular on Contract Obligations.',
    thresholdsAndActions: {
      good: 'PO commitment pacing aligns smoothly with approved cash disbursement ceiling (NCA/NTCA).',
      warning: 'Backlog of approved awards awaiting PO generation or accounting obligation stamp.',
      critical: 'Unobligated PO commitments exceeding quarterly allotment limits.',
    },
  },

  'kpi-active-contracts': {
    id: 'kpi-active-contracts',
    title: 'Active Executed Contracts',
    category: 'Contract Administration',
    shortDescription: 'Number of active multi-deliverable contracts and service level agreements currently under implementation.',
    purpose: 'Ensures comprehensive oversight of ongoing vendor obligations, progress billings, and deliverable milestones.',
    formulaOrSources: 'Count of contracts with status "Ongoing" where end date is in the future.',
    regulatoryBasis: 'RA 9184 Sec. 42 (Contract Implementation and Termination) and Annex D (Contract Implementation Guidelines).',
    thresholdsAndActions: {
      good: 'All milestones on schedule with performance security valid and inspected progress reports.',
      warning: 'Contracts within 30 days of end date with pending deliverables or incomplete milestone billings.',
      critical: 'Contracts past completion date without approved time extension or liquidated damages assessment.',
    },
  },

  'kpi-direct-contracting': {
    id: 'kpi-direct-contracting',
    title: 'Direct Contracting Utilization',
    category: 'Alternative Procurement',
    shortDescription: 'Volume and financial sum of procurements conducted via Single Source / Direct Contracting.',
    purpose: 'Monitors non-competitive procurement exceptions to prevent abuse and verify statutory justification.',
    formulaOrSources: 'Count and peso amount of awards tagged with procurement mode "Direct Contracting".',
    regulatoryBasis: 'RA 9184 Sec. 50 (Direct Contracting strictly limited to proprietary, critical plant, or patented items).',
    thresholdsAndActions: {
      good: '< 5% of total procurement value with complete proprietary certificates and BAC justification.',
      warning: '5% - 10% of total agency procurement value; requires BAC audit and justification review.',
      critical: '> 10% of procurement value; severe audit exposure for unjustified circumvention of public bidding.',
    },
  },

  'kpi-budget-utilization': {
    id: 'kpi-budget-utilization',
    title: 'Procurement Budget Utilization Rate',
    category: 'Fiscal Performance',
    shortDescription: 'Percentage of total approved Annual Procurement Plan (APP) budget obligated through contracted POs.',
    purpose: 'Measures financial execution rate and institutional absorptive capacity against annual planned appropriations.',
    formulaOrSources: '(Total Contracted PO Value / Approved Annual Procurement Plan Budget) × 100.',
    regulatoryBasis: 'DBM Circular on Agency Absorptive Capacity and Year-End Obligation Performance.',
    thresholdsAndActions: {
      good: 'Utilization rate tracking within ±5% of quarterly milestone targets (target ≥ 90% by Q4).',
      warning: 'Utilization lagging by 10% - 20% behind quarterly targets indicating procurement delays.',
      critical: 'Utilization < 60% entering Q4; imminent risk of budget lapsing and reversion to Bureau of the Treasury.',
    },
  },

  'kpi-avg-tat': {
    id: 'kpi-avg-tat',
    title: 'Average Procurement Turnaround Time (TAT)',
    category: 'Process Velocity',
    shortDescription: 'Average calendar days required from PR submission to final Purchase Order issuance.',
    purpose: 'Evaluates institutional agility, detects administrative friction, and ensures compliance with statutory limits.',
    formulaOrSources: 'Mean duration in calendar days (PO Approval Date - PR Submission Date) across completed items.',
    regulatoryBasis: 'RA 9184 Annex C (Recommended Earliest and Maximum Allowable Periods) and Ease of Doing Business Act.',
    thresholdsAndActions: {
      good: '≤ 28 days for Alternative Modes; ≤ 65 days for Public Bidding.',
      warning: '29 - 40 days for Alternative Modes; 66 - 85 days for Public Bidding.',
      critical: '> 45 days for Alternative Modes; > 90 days for Bidding; exceeds statutory maximum timeline.',
    },
  },

  'kpi-savings-rate': {
    id: 'kpi-savings-rate',
    title: 'Procurement Savings / ABC Variance',
    category: 'Cost Optimization',
    shortDescription: 'Net fiscal savings generated by awarding contracts below the Approved Budget for the Contract (ABC).',
    purpose: 'Quantifies fiscal efficiency achieved through competitive price tension and thorough market research.',
    formulaOrSources: '((Sum of ABC for Awarded Items - Sum of Awarded Bid Amounts) / Sum of ABC) × 100.',
    regulatoryBasis: 'GPPB APCPI Pillar IV (Integrity and Transparency of the Procurement System).',
    thresholdsAndActions: {
      good: '5% - 15% savings rate indicating competitive bidding without unrealistically low predatory bids.',
      warning: '< 2% savings rate (bids near ABC ceiling) or > 25% savings rate (risk of compromised quality/specifications).',
      critical: 'Negative variance (overruns exceeding ABC) which is illegal under RA 9184 Sec. 31.',
    },
  },

  'kpi-overdue-deliveries': {
    id: 'kpi-overdue-deliveries',
    title: 'Overdue Deliveries & Aging POs',
    category: 'Supply Chain Risk',
    shortDescription: 'Count of issued Purchase Orders where the statutory delivery period has lapsed without verified receipt.',
    purpose: 'Surfaces supplier performance non-compliance and initiates mandatory liquidated damages enforcement.',
    formulaOrSources: 'Count of POs with Status = "Issued" and Promised Delivery Date < Current Date.',
    regulatoryBasis: 'RA 9184 Annex D Sec. 3 (Liquidated Damages: 1/10th of 1% per day of delay).',
    thresholdsAndActions: {
      good: '0 overdue deliveries or < 2% of active POs with supplier advance notice.',
      warning: '3 - 5 overdue deliveries requiring formal demand letters and notice of default.',
      critical: '> 5 overdue deliveries or delay exceeding 10% of contract duration triggering mandatory contract termination.',
    },
  },

  'kpi-high-risk-contracts': {
    id: 'kpi-high-risk-contracts',
    title: 'High-Risk & Expiring Contracts',
    category: 'Risk Management',
    shortDescription: 'Contracts with less than 30 days remaining, negative milestone variance, or pending warranty claims.',
    purpose: 'Prevents service interruptions in essential utilities, security, and IT facilities by alerting BAC ahead of time.',
    formulaOrSources: 'Count of active contracts flagged for risk due to expiry, budget overrun, or supplier default score.',
    regulatoryBasis: 'COA Guidelines on Continuance of Vital Government Services and GPPB Contract Extension Rules.',
    thresholdsAndActions: {
      good: 'All expiring agreements have follow-on procurement already initiated at least 60 days in advance.',
      warning: 'Agreements expiring within 30 days without scheduled opening of replacement bids.',
      critical: 'Agreements expiring within 14 days without emergency extension or award; risk of government service disruption.',
    },
  },

  // ===================== OVERVIEW PANELS =====================
  'panel-app-budget-burn': {
    id: 'panel-app-budget-burn',
    title: 'Annual Procurement Plan (APP) Budget Burn & Utilization',
    category: 'Budgetary Governance',
    shortDescription: 'Interactive gauge and breakdown of agency approved procurement budget, commitments, and unprogrammed requests.',
    purpose: 'Provides executive leadership with real-time insight into capital allocation, committed expenditure, and unprogrammed PR risks.',
    formulaOrSources: 'Approved APP Budget vs. Total Committed POs vs. Unencumbered Free Balance from Integrated Financial Management System.',
    regulatoryBasis: 'RA 9184 Sec. 7.2 ("No procurement shall be undertaken unless it is in accordance with the approved APP of the Procuring Entity").',
    thresholdsAndActions: {
      good: 'Commitment burn tracking comfortably within quarterly allotment ceilings without unprogrammed spending.',
      warning: 'Burn rate exceeds 85% before Q4 or unprogrammed PRs exceed ₱500,000 requiring supplemental APP amendment.',
      critical: 'Burn rate exceeds 95% with pending obligations or unprogrammed PRs attempting execution without supplemental APP.',
    },
  },

  'panel-procurement-funnel': {
    id: 'panel-procurement-funnel',
    title: 'Procurement Pipeline Lifecycle Funnel',
    category: 'End-to-End Pipeline',
    shortDescription: 'Stage-by-stage visualization of procurement volume flowing from PR initiation to contract fulfillment.',
    purpose: 'Maps conversion velocity across statutory milestones (PR → Consolidation → RFQ/Canvass → BAC Resolution → NOA → PO Fulfillment).',
    formulaOrSources: 'Real-time counts and peso aggregates at each lifecycle state across Competitive Bidding and Alternative methods.',
    regulatoryBasis: 'RA 9184 Standard Bidding Procedures and GPPB Generic Procurement Manuals.',
    thresholdsAndActions: {
      good: 'Balanced pipeline with progressive step-down ratios and no disproportionate clumping at early stages.',
      warning: 'Abnormal accumulation of PRs at the BAC Evaluation stage for more than 14 business days.',
      critical: 'Drop-off rate > 30% between Canvass and Award due to failed biddings or unresponsive quotations.',
    },
  },

  'panel-health-scorecard': {
    id: 'panel-health-scorecard',
    title: 'Procurement Health & Compliance Scorecard',
    category: 'Regulatory Compliance',
    shortDescription: 'Evaluation matrix benchmarking the agency against the GPPB Agency Procurement Compliance and Performance Indicators (APCPI).',
    purpose: 'Measures structural institutional integrity across 4 statutory pillars: Legal Framework, Agency Capacity, Operations, and Competitiveness.',
    formulaOrSources: 'Weighted scorecard assessing 12 statutory metric tiles against GPPB APCPI benchmarking criteria (Level 1 to 3).',
    regulatoryBasis: 'GPPB Resolution No. 39-2014 adopting the APCPI for all National Government Agencies and SUCs.',
    thresholdsAndActions: {
      good: 'Composite score ≥ 2.50 (Green / High Compliance) across all 4 pillars.',
      warning: 'Score between 1.80 and 2.49 (Amber / Moderate Compliance); requires targeted corrective action plan.',
      critical: 'Score < 1.80 (Red / Low Compliance); non-compliant agency subject to mandatory GPPB capacity development intervention.',
    },
  },

  'panel-pr-tat-tracker': {
    id: 'panel-pr-tat-tracker',
    title: 'PR Consolidation & Division Turnaround Time Tracker',
    category: 'Operational Agility',
    shortDescription: 'Comparative division performance dashboard tracking PR pooling efficiency and processing velocity.',
    purpose: 'Identifies high-performing vs sluggish divisions, incentivizing prompt review and preventing inter-office bottlenecks.',
    formulaOrSources: 'Division-level average elapsed days per processing stage cross-referenced with division consolidation ratios.',
    regulatoryBasis: 'Anti-Red Tape Act (ARTA) Citizen’s Charter standards and DBM Performance-Based Bonus (PBB) indicators.',
    thresholdsAndActions: {
      good: 'All divisions operating under 7 business days average processing lead time.',
      warning: 'Divisions averaging 8 to 14 days processing turnaround.',
      critical: 'Divisions exceeding 14 days processing turnaround or displaying severe PR consolidation backlog.',
    },
  },

  'panel-bottleneck-detection': {
    id: 'panel-bottleneck-detection',
    title: 'Bottleneck Detection & Aging Pipeline Checkpoints',
    category: 'Surveillance & Audit',
    shortDescription: 'Automated early-warning surveillance engine flagging stalled transactions exceeding legal thresholds.',
    purpose: 'Allows proactive intervention before transactions breach statutory deadlines or trigger supplier bid withdrawal.',
    formulaOrSources: 'Active transactions with idle days at current status exceeding predefined threshold days (e.g. > 10 days idle).',
    regulatoryBasis: 'RA 9184 Annex C (Maximum Allowable Periods for each procurement step) and COA Audit Instructions.',
    thresholdsAndActions: {
      good: 'Zero transactions flagged with critical delays (> 15 idle days).',
      warning: '1 to 5 transactions flagged with moderate aging (7 - 14 idle days).',
      critical: '> 5 transactions in critical stall status requiring immediate escalation to Head of Procuring Entity (HoPE).',
    },
  },

  'panel-task-queue': {
    id: 'panel-task-queue',
    title: 'Smart Task Queue & Urgent Approvals',
    category: 'Workflow Automation',
    shortDescription: 'Actionable queue prioritizing high-impact statutory approvals, bid matrices, and contract notices.',
    purpose: 'Directs procurement officers and BAC secretariat to the highest priority pending actions with single-click navigation.',
    formulaOrSources: 'Aggregated queue of pending tasks ranked by statutory deadline proximity and procurement monetary value.',
    regulatoryBasis: 'Procurement Workflow Management System and statutory timelines for BAC and HoPE actions.',
    thresholdsAndActions: {
      good: 'All high-priority tasks actioned within 24 hours of entering queue.',
      warning: 'Tasks remaining in queue for 2 to 3 days nearing milestone deadlines.',
      critical: 'Overdue tasks with expired statutory deadlines posing legal risk to procurement validity.',
    },
  },

  'panel-bac-bidding-analytics': {
    id: 'panel-bac-bidding-analytics',
    title: 'BAC, Bidding & Contracts Operations Analytics',
    category: 'Bidding Operations',
    shortDescription: 'Three-column operational surveillance center tracking RFQ Canvasses, Abstract of Bids (AOB), and PO Fulfillment.',
    purpose: 'Provides granular oversight of ongoing bidding activities, technical/financial bid evaluations, and delivery pipelines.',
    formulaOrSources: 'Live feeds of active RFQs with supplier response counts, pending AOB matrix evaluations, and PO fulfillment curves.',
    regulatoryBasis: 'RA 9184 Rule IX (Receipt and Opening of Bids) and Rule X (Bid Evaluation).',
    thresholdsAndActions: {
      good: 'Healthy supplier response rate (≥ 3 bids/quotes), prompt AOB evaluation (< 3 days), and high PO on-time delivery (≥ 90%).',
      warning: 'Single bid submissions or PO delivery delays between 1 and 7 days.',
      critical: 'Failed biddings requiring re-advertisement or repeated vendor delivery defaults.',
    },
  },

  'panel-contract-risk': {
    id: 'panel-contract-risk',
    title: 'Contract Risk & Expiration Timeline Horizon',
    category: 'Risk Forecasting',
    shortDescription: 'Forward-looking timeline radar tracking contract completion, renewal deadlines, and performance liabilities.',
    purpose: 'Eliminates lapses in vital institutional contracts (security, janitorial, cloud hosting) through 30/60/90-day warning horizons.',
    formulaOrSources: 'Timeline horizon indexing all active contracts by days until expiry, warranty retention period, and delivery risk score.',
    regulatoryBasis: 'GPPB Guidelines on Extension of Contracts for General Support Services.',
    thresholdsAndActions: {
      good: 'All contracts within 90 days of expiry have initiated rebidding or extension proceedings.',
      warning: 'Contracts expiring within 30 to 60 days without approved BAC resolution for rebidding.',
      critical: 'Contracts expiring in < 30 days without action; high risk of institutional shutdown or illegal emergency procurement.',
    },
  },

  'panel-alert-banner': {
    id: 'panel-alert-banner',
    title: 'Real-Time Procurement Surveillance Alerts',
    category: 'Audit Surveillance',
    shortDescription: 'System-generated alerts flagging statutory violations, stalled stages, and unprogrammed spending.',
    purpose: 'Acts as an automated compliance guardian highlighting items requiring urgent executive intervention.',
    formulaOrSources: 'Real-time rule engine evaluating all transactions against RA 9184 and DBM compliance constraints.',
    regulatoryBasis: 'COA Circular 2009-001 (Rules and Regulations on the Prevention of Irregular, Unnecessary, Excessive, Extravagant and Unconscionable Expenditures).',
    thresholdsAndActions: {
      good: 'Zero active critical compliance or bottleneck alerts.',
      warning: 'Informational or warning alerts regarding approaching deadlines.',
      critical: 'Active critical alerts (e.g. unprogrammed PRs, expired contracts, failed biddings) requiring immediate remediation.',
    },
  },
}
