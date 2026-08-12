/**
 * NGPA PPMP Guidelines Reference Data
 * Based on "Guide to Filling Out the PPMP Form" and RA 12009 (Revised Procurement Reform Act)
 */

export interface ColumnGuideline {
  columnNumber: number
  columnName: string
  notes: string
  examples: {
    goods?: string
    infrastructure?: string
    consulting?: string
  }
  basis?: string
}

export interface NGPAGuidelinesReference {
  title: string
  description: string
  authority: string
  columns: ColumnGuideline[]
}

export const NGPA_PPMP_GUIDELINES: NGPAGuidelinesReference = {
  title: 'PPMP Form - Guide to Filling Out',
  description:
    'Official guide for completing the Project Procurement Management Plan (PPMP) form in accordance with RA 12009 (Revised Procurement Reform Act) and NGPA regulations.',
  authority:
    'National Government Procurement Association (NGPA) & Philippine Government Procurement Policy Board',
  columns: [
    {
      columnNumber: 1,
      columnName:
        'General Description and Objective of the Project to be Procured',
      notes:
        'Provide a clear, concise description of the procurement item or project. Include the main purpose and objectives. Use specific terminology that would be understood by procurement specialists and vendors.',
      basis: 'RA 12009, Section 8 - Procurement Planning',
      examples: {
        goods:
          'High-speed office laser printer with duplexing capability for IT Department - Support document processing for 200 staff members.',
        infrastructure:
          'Repair and rehabilitation of 2.5 km section of barangay access road including drainage system - Improve mobility and emergency response capability.',
        consulting:
          'Management audit of Financial Management Division - Identify operational inefficiencies and recommend improvement measures.',
      },
    },
    {
      columnNumber: 2,
      columnName:
        'Type of the Project (whether Goods, Infrastructure and Consulting Services)',
      notes:
        'Clearly identify the nature of the procurement: GOODS (supplies and equipment), INFRASTRUCTURE (construction and works), or CONSULTING SERVICES (technical expertise and advice).',
      basis: 'RA 12009, Section 5 - Definitions',
      examples: {
        goods: 'Goods',
        infrastructure: 'Infrastructure',
        consulting: 'Consulting Services',
      },
    },
    {
      columnNumber: 3,
      columnName: 'Quantity and Size of the Project to be Procured',
      notes:
        'State the specific quantity, volume, or scope. For goods, include the unit of measure. For infrastructure, specify dimensions and area. For consulting, specify person-months or duration. Be as specific as possible to guide vendor preparation.',
      basis: 'RA 12009, Section 10 - Technical Specifications',
      examples: {
        goods: '15 units of printer paper (80 gsm, A4, 500 sheets per ream)',
        infrastructure:
          '2.5 km length, 3.5m width, Portland Cement Concrete pavement with concrete drainage structures',
        consulting:
          '3 person-months of audit services (6 months project duration)',
      },
    },
    {
      columnNumber: 4,
      columnName: 'Recommended Mode of Procurement',
      notes:
        'Identify the appropriate procurement method based on estimated value and compliance requirements. Modes include: Competitive Bidding, Limited Bidding, Negotiated Procurement, Direct Contracting, Shopping (for goods/consulting services).',
      basis: 'RA 12009, Sections 47-52 - Methods of Procurement',
      examples: {
        goods: 'Competitive Bidding (estimated cost: ₱1.5M)',
        infrastructure: 'Competitive Bidding (estimated cost: ₱25M)',
        consulting:
          'Competitive Bidding or Limited Bidding depending on specialized requirement',
      },
    },
    {
      columnNumber: 5,
      columnName: 'Pre-Procurement Conference, if applicable (Yes/No)',
      notes:
        'Indicate whether a pre-procurement conference is necessary. Required when the procurement is complex, high-value, or when technical specifications need clarification. Helps ensure vendor understanding and fair competition.',
      basis: 'RA 12009, Section 21 - Pre-Procurement Conference',
      examples: {
        goods: 'No (for standard supplies)',
        infrastructure: 'Yes (for complex infrastructure works)',
        consulting: 'Yes (to clarify scope and deliverables)',
      },
    },
    {
      columnNumber: 6,
      columnName: 'Start of Procurement Activity',
      notes:
        'Specify the month and year when procurement process will begin (MM/YYYY format). This marks when the agency will start preparing bidding documents and conducting pre-procurement activities.',
      basis: 'RA 12009, Section 8 - Annual Procurement Plan',
      examples: {
        goods: '01/2026 (January 2026)',
        infrastructure: '02/2026 (February 2026)',
        consulting: '01/2026 (January 2026)',
      },
    },
    {
      columnNumber: 7,
      columnName: 'End of Procurement Activity',
      notes:
        'Specify the month and year when procurement process will conclude (MM/YYYY format). Ensure this is after the start date and allows sufficient time for bidding, evaluation, and contract award.',
      basis: 'RA 12009, Section 8 - Annual Procurement Plan',
      examples: {
        goods: '03/2026 (March 2026)',
        infrastructure: '06/2026 (June 2026)',
        consulting: '04/2026 (April 2026)',
      },
    },
    {
      columnNumber: 8,
      columnName: 'Expected Delivery/Implementation Period',
      notes:
        'Specify when the procured item/service will be delivered or completed (MM/YYYY to MM/YYYY). This should align with program implementation schedules and project timelines.',
      basis: 'RA 12009, Section 8 - Annual Procurement Plan',
      examples: {
        goods: '04/2026 (by April 2026)',
        infrastructure: '10/2026 to 12/2026 (final completion)',
        consulting: '05/2026 to 07/2026 (report submission)',
      },
    },
    {
      columnNumber: 9,
      columnName: 'Source of Funds',
      notes:
        'Identify the funding source: General Appropriations Act (GAA), Special Education Fund (SEF), own funds, donor-funded, or other authorized sources. Ensure budget availability before procurement.',
      basis: 'RA 12009, Section 8 - Annual Procurement Plan',
      examples: {
        goods: 'General Appropriations Act (GAA) 2026',
        infrastructure:
          'GAA 2026 / Local Government Unit (LGU) Counterpart Funds',
        consulting: 'GAA 2026',
      },
    },
    {
      columnNumber: 10,
      columnName: 'Estimated Budget / Authorized Budgetary Allocation (PhP)',
      notes:
        'State the estimated cost for the entire procurement including contingency provisions (typically 10-15% for goods/services, 20% for infrastructure). Must align with LIB allocation.',
      basis: 'RA 12009, Section 8 - Annual Procurement Plan',
      examples: {
        goods: '₱1,500,000.00',
        infrastructure: '₱25,000,000.00',
        consulting: '₱1,200,000.00',
      },
    },
    {
      columnNumber: 11,
      columnName: 'Attached Supporting Documents',
      notes:
        'List the required supporting documents: Market Scoping Checklist (all types), Technical Specifications or Scope of Work, Feasibility Study (for infrastructure), Engineering Plans (for infrastructure), Beneficiary Information Sheet.',
      basis: 'RA 12009, Section 10 - Technical Specifications',
      examples: {
        goods: 'Market Scoping Checklist, Technical Specifications',
        infrastructure:
          'Market Scoping Checklist, Engineering Plans, Feasibility Study, Scope of Work',
        consulting:
          'Market Scoping Checklist, Terms of Reference, CV of proposed key personnel',
      },
    },
    {
      columnNumber: 12,
      columnName: 'Remarks',
      notes:
        'Include any special notes, conditions, or clarifications relevant to the procurement (e.g., technical requirements, special conditions, sustainability considerations, environmental impact).',
      basis: 'RA 12009, Section 8 - Annual Procurement Plan',
      examples: {
        goods:
          'Must have local warranty support and technical assistance available.',
        infrastructure:
          'Contractor must comply with environmental impact mitigation measures.',
        consulting:
          'Team lead must have minimum 10 years experience in financial management audit.',
      },
    },
  ],
}

/**
 * Get guideline for a specific column
 */
export function getColumnGuideline(
  columnNumber: number,
): ColumnGuideline | undefined {
  return NGPA_PPMP_GUIDELINES.columns.find(
    (c) => c.columnNumber === columnNumber,
  )
}

/**
 * Get all guidelines
 */
export function getAllColumnGuidelines(): ColumnGuideline[] {
  return NGPA_PPMP_GUIDELINES.columns
}

/**
 * Get example for a specific column and project type
 */
export function getColumnExample(
  columnNumber: number,
  projectType: 'goods' | 'infrastructure' | 'consulting',
): string | undefined {
  const guideline = getColumnGuideline(columnNumber)
  if (!guideline) return undefined
  return guideline.examples[projectType]
}
