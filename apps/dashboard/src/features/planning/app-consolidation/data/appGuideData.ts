export interface NGPAColumnGuide {
  columnNumber: number | string // e.g. 1, 2, ..., 12 or 'Heading'
  particular: string
  legalBasis: string
  notes: string
  examples: {
    goods: string
    infrastructure: string
    consulting: string
  }
}

export interface NGPAAppTypeGuide {
  type: string
  title: string
  description: string
  keyRules: string[]
}

export const NGPA_APP_TYPE_GUIDELINES: NGPAAppTypeGuide[] = [
  {
    type: 'Indicative',
    title: 'Indicative APP',
    description: 'Consolidates Indicative Project Procurement Management Plans (PPMPs) for inclusion in the budget proposal for the succeeding fiscal year.',
    keyRules: [
      'Prepared by the BAC Secretariat based on PPMPs submitted by End-User / Implementing Units.',
      'Updated upon receipt of revised PPMPs reflecting allocations in National Expenditure Program (NEP) / Local Expenditure Program.',
      'Submitted to the BAC for final recommendation to the Head of the Procuring Entity (HoPE).',
    ],
  },
  {
    type: 'Final',
    title: 'Final APP',
    description: 'Consolidates revised PPMPs following the approval of the General Appropriations Act (GAA), Corporate Budget, or Appropriations Ordinance.',
    keyRules: [
      'Serves as the final APP to be implemented for the fiscal year.',
      'Must be consistent with the final approved budget allocations.',
      'Recommended by the BAC and approved by the Head of the Procuring Entity (HoPE).',
    ],
  },
  {
    type: 'Updated',
    title: 'Updated APP',
    description: 'Reflects changes made after the approval of the Final APP (e.g. changes in schedule, mode, scope, budget, or newly added projects).',
    keyRules: [
      'Presents a complete record of ALL procurement projects for the year, including unchanged items.',
      'Newly added or revised rows are highlighted for visibility.',
      'Specific revised fields are displayed in bold font in the updated document.',
      'Each version is clearly labeled with a version number and date (e.g. Version 1-Q1, Version 2-Q2).',
    ],
  },
]

export const NGPA_COLUMN_GUIDELINES_DATA: NGPAColumnGuide[] = [
  {
    columnNumber: 1,
    particular: 'Project Title',
    legalBasis: 'IRR of RA No. 12009 Sec 7.7.2 (a)',
    notes: 'Provide a specific, action-based title that clearly describes the main deliverables and scope of the procurement project. List each lot of a project on a separate row, if applicable.',
    examples: {
      goods: 'Supply and Delivery of Uniform short sleeved T-shirt with Print and handtowels, Shovel and Wheelbarrow for Billy Bayong Program',
      infrastructure: 'Improvement/Repair of Facilities/Buildings & Structures / Proposed Construction of Billy Bayong Sports Complex',
      consulting: 'Engagement of a consulting firm to provide Technical Assistance for QMS Implementation towards ISO 9001:2015 Certification',
    },
  },
  {
    columnNumber: 2,
    particular: 'End-User or Implementing Unit',
    legalBasis: 'IRR of RA No. 12009 Sec 7.7.2 (b)',
    notes: 'Indicate the name of implementing unit, office, or project management office. In case of multiple end-users, all units shall be indicated.',
    examples: {
      goods: 'Administrative and General Services Division',
      infrastructure: 'Engineering Services Division',
      consulting: 'Office of the Governor',
    },
  },
  {
    columnNumber: 3,
    particular: 'General Description of the Project',
    legalBasis: 'IRR of RA No. 12009 Sec 7.7.2 (c)',
    notes: 'Provide a brief and specific description of the project, including its type of procurement (Goods, General Services, Infrastructure Project [Civil Works], or Consulting Services).',
    examples: {
      goods: 'Supply and Delivery of Uniforms, Shovel, and Wheelbarrow for Community Program (Goods)',
      infrastructure: 'Civil works for Sports Complex Infrastructure to be undertaken by Administration (Infrastructure)',
      consulting: 'Technical Assistance for QMS Implementation towards ISO Certification (Consulting Services)',
    },
  },
  {
    columnNumber: 4,
    particular: 'Mode of Procurement',
    legalBasis: 'IRR of RA No. 12009 Sec 7.7.2 (d)',
    notes: 'Indicate applicable procurement mode under RA No. 12009 recommended by the Bids and Awards Committee (e.g. Competitive Bidding, Negotiated Procurement, Direct Contracting).',
    examples: {
      goods: 'Competitive Bidding',
      infrastructure: 'N/A (To be undertaken by Administration)',
      consulting: 'Negotiated Procurement – Highly Technical Consultant',
    },
  },
  {
    columnNumber: 5,
    particular: 'To be covered by an Early Procurement Activity? (EPA)',
    legalBasis: 'IRR of RA No. 12009 Sec 7.7.2 (i)',
    notes: 'Indicate Yes/No. Early Procurement Activities cover pre-procurement activities up to recommendation for award prior to approval of the GAA/budget.',
    examples: {
      goods: 'No',
      infrastructure: 'N/A',
      consulting: 'No',
    },
  },
  {
    columnNumber: 6,
    particular: 'Criteria for Bid Evaluation (Including Sustainability & Domestic Preference)',
    legalBasis: 'IRR of RA No. 12009 Sec 7.7.2 (e)',
    notes: 'Choose among: 1. Lowest Calculated Responsive Bid (LCRB), 2. Most Economically Advantageous Responsive Bid (MEARB - for quality-cost criteria including environmental/social factors), 3. Most Advantageous Responsive Bid (MARB) / HRRB / SRRB, 4. Lowest Comparative / Competitive Responsive Bid (LCCRB). NOTE: If using MEARB, ensure sustainability indicators are in technical specifications.',
    examples: {
      goods: 'LCRB',
      infrastructure: 'MEARB (Environmental & Social Factors)',
      consulting: 'HRRB',
    },
  },
  {
    columnNumber: 7,
    particular: 'Start of Procurement Activity',
    legalBasis: 'IRR of RA No. 12009 Sec 7.7.2 (f)',
    notes: 'Indicate the projected month and year (MM/YYYY) of the start of procurement activity (Pre-procurement Conference, Publication, Posting, or Issuance of RFQ as applicable). User override permitted.',
    examples: {
      goods: '04/2026',
      infrastructure: '05/2026',
      consulting: '03/2026',
    },
  },
  {
    columnNumber: 8,
    particular: 'End of Procurement Activity',
    legalBasis: 'IRR of RA No. 12009 Sec 7.7.2 (f)',
    notes: 'Indicate the projected month and year (MM/YYYY) of issuance of Notice of Award or Purchase Order based on prescribed procurement timelines. User override permitted.',
    examples: {
      goods: '05/2026',
      infrastructure: '08/2026',
      consulting: '04/2026',
    },
  },
  {
    columnNumber: 9,
    particular: 'Source of Funds',
    legalBasis: 'IRR of RA No. 12009 Sec 7.7.2 (g)',
    notes: 'Indicate proposed source of fund (e.g. GAA Current or Continuing, Corporate Operating Budget, Appropriation Ordinance, Internally Generated Income, Trust Fund). Ensure consistency with agency budget document.',
    examples: {
      goods: 'GAA 2026 - Current Appropriation',
      infrastructure: 'GAA 2024 - Continuing Appropriation',
      consulting: 'Internally - Generated Income',
    },
  },
  {
    columnNumber: 10,
    particular: 'Estimated Budget / Approved Budget for the Contract (PhP)',
    legalBasis: 'IRR of RA No. 12009 Sec 7.7.2 (h)',
    notes: 'Indicate estimated budget for each project/lot based on End-User approved PPMP. Once GAA/Budget is approved, reflect Approved Budget for the Contract (ABC). Derived from PPMP item allocations.',
    examples: {
      goods: '₱12,499,544.00',
      infrastructure: '₱15,900,000.00',
      consulting: '₱750,000.00',
    },
  },
  {
    columnNumber: 11,
    particular: 'Procurement Strategy or Tools',
    legalBasis: 'IRR of RA No. 12009 Sec 7.7.2 (k)',
    notes: 'Indicate applicable strategies: 1) Life Cycle Assessment (LCA/LCCA), 2) Subcontracting, 3) Multi-Year Contracting, 4) Design-and-Build Scheme, 5) Procurement Agent, 6) Framework Agreement, 7) Pooled Procurement, 8) Renewal of Recurring Services, 9) Warehousing/Inventory.',
    examples: {
      goods: 'Use of Framework Agreement',
      infrastructure: 'Design-and-Build Scheme',
      consulting: 'Multi-Year Contracting',
    },
  },
  {
    columnNumber: 12,
    particular: 'Remarks',
    legalBasis: 'IRR of RA No. 12009 Sec 7.7.2 (j)',
    notes: 'Provide additional details: a. Basis of change/s from previously submitted APP (scope, mode, schedule, budget); b. Contract package details for multi-year contracts; c. Information on marginalized sector participation (startups, microenterprises, vulnerable sectors per Sec 75.5).',
    examples: {
      goods: 'One-time requirement for newly created satellite office; targets MSME supplier',
      infrastructure: 'Phase 1 of 2-year infrastructure program; employs local labor by Administration',
      consulting: 'New strategic direction requested by Governor; involves agri cooperatives',
    },
  },
]
