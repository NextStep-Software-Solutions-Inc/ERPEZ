/**
 * PPMP Field Descriptions
 * Comprehensive helper text and tooltips for all PPMP item fields
 */

export const PPMP_FIELD_DESCRIPTIONS = {
  name: {
    label: 'Item Name',
    description:
      'The name or title of the procurement item. Be specific and include key details (e.g., "Office Paper A4 80gsm 500 sheets" instead of just "Paper")',
    examples:
      'e.g., Laser Printer Toner, Office Paper A4 80gsm, Desktop Computer',
  },
  description: {
    label: 'Description / Specifications',
    description:
      'Detailed specifications and technical details of the item. Include quality standards, materials, dimensions, and any special requirements vendors should know about.',
    examples:
      'e.g., High-speed laser printer toner, compatible with HP LaserJet Pro models, page yield 2500 pages',
  },
  unit: {
    label: 'Unit of Measure',
    description:
      'The standard unit used to measure and order this item. Common units include pieces (pcs), boxes, reams, kilograms, meters, or services hours.',
    examples: 'e.g., pcs, box, ream, kg, meter, hour, service',
  },
  unitPrice: {
    label: 'Unit Price',
    description:
      'The cost per unit of measure. This is the basic price for one unit before quantity multiplication. Use this for budget planning and comparison.',
    examples: 'e.g., 3434, 250.50, 1500.75',
  },
  procurementModeId: {
    label: 'Mode of Procurement',
    description:
      'The procurement method to be used based on estimated value and complexity. Methods include Competitive Bidding (high value), Limited Bidding (restricted items), Negotiated Procurement (specialized services), Direct Contracting (emergency), or Shopping (low value, routine items).',
    examples:
      'e.g., Competitive Bidding, Limited Bidding, Direct Contracting, Shopping',
  },
  projectType: {
    label: 'Project Type',
    description:
      'Classify the procurement item into one of four categories: Goods (supplies, equipment), Infrastructure (construction, works), Consulting Services (expert advice, audits), or General Support Services (routine services, maintenance).',
    examples:
      'Goods, Infrastructure, Consulting Services, General Support Services',
  },
  papCode: {
    label: 'PAP Code (Program/Project)',
    description:
      "The Program/Activity/Project code from your organization's budget or strategic plan. This links the procurement to specific departmental programs or initiatives.",
    examples:
      'e.g., 5-02-03-010, PRJ-2025-001, or leave blank if not applicable',
  },
  preProcurementConference: {
    label: 'Pre-Procurement Conference',
    description:
      'Indicates whether a meeting with potential vendors is needed before issuing the procurement. Required for complex items, infrastructure works, or when technical clarification is needed to ensure fair competition.',
    examples:
      'Check if: Complex specifications, high value, specialized services, or unique requirements',
  },
  procurementStartDate: {
    label: 'Procurement Start Date',
    description:
      'The planned date when the procurement process will begin (e.g., when bidding documents will be released or the bidding period starts). This helps track the procurement timeline.',
    examples: 'e.g., 2025-03-01 (format: YYYY-MM-DD)',
  },
  procurementEndDate: {
    label: 'Procurement End Date',
    description:
      'The expected date when the procurement process will be complete, including award and contract signing. This is the deadline for finishing all procurement activities.',
    examples: 'e.g., 2025-05-31 (format: YYYY-MM-DD)',
  },
  expectedDeliveryStart: {
    label: 'Expected Delivery Start',
    description:
      'The earliest date you expect to receive the procured item or the start of service delivery. This is when the supplier should begin delivery or implementation.',
    examples: 'e.g., 2025-06-01 (format: YYYY-MM-DD)',
  },
  expectedDeliveryEnd: {
    label: 'Expected Delivery End',
    description:
      'The latest date by which all procured items must be delivered or all services must be completed. This is the deadline for vendor fulfillment.',
    examples: 'e.g., 2025-07-31 (format: YYYY-MM-DD)',
  },
  remarks: {
    label: 'Remarks / Notes',
    description:
      'Additional information, conditions, or special notes about this procurement item. Include links to supporting documents, vendor preferences, budget justification, or special handling requirements.',
    examples:
      'e.g., Refer to RFC-2025-001, Budget approved by Finance Dept, Must comply with ISO 9001, Documents attached',
  },
  mopOverride: {
    label: 'Mode of Procurement Override',
    description:
      'Indicates whether the procurement mode differs from the standard mode based on item value. When overridden, a justification must be provided explaining why the alternative procurement method is appropriate.',
    examples: 'Checked if deviating from standard procurement mode',
  },
  mopJustification: {
    label: 'MOP Override Justification',
    description:
      'The reason for using a different procurement mode than the standard. Provide clear business justification explaining why the alternative method is necessary and appropriate.',
    examples:
      'e.g., Emergency procurement required due to system failure, Only one qualified vendor available, Specialized expertise needed from specific contractor',
  },
  cseItemId: {
    label: 'CSE Catalog Item ID',
    description:
      'The unique identifier if this item is from the Common Supplier Exchange (CSE) catalog. CSE items have pre-approved vendors and pricing, simplifying the procurement process.',
    examples: 'e.g., 106aaf02-9263-4b72-adc4-b435f0f2db5b (if applicable)',
  },
  nonCSEItemId: {
    label: 'Non-CSE Item ID',
    description:
      'The unique identifier for items not in the CSE catalog. These are custom items requiring full procurement process (bidding, evaluation, award).',
    examples: 'e.g., Custom item ID or reference number',
  },
  cseItemName: {
    label: 'CSE Item Name',
    description:
      'The standardized name of the item as listed in the CSE (Common Supplier Exchange) catalog. Using catalog items speeds up procurement with pre-vetted suppliers.',
    examples: 'e.g., Paper, Multicopy, A4, 80gsm',
  },
  nonCSEItemName: {
    label: 'Non-CSE Item Name',
    description:
      'The name of custom items that are not available in the CSE catalog. These items will require competitive bidding or specialized procurement methods.',
    examples: 'e.g., Custom Software License, Specialized Consulting Services',
  },
  procurementModeName: {
    label: 'Procurement Mode Name',
    description:
      'The human-readable name of the procurement method selected. Shows which procurement mode will be used for this item.',
    examples:
      'e.g., Shopping, Limited Bidding, Competitive Bidding, Direct Contracting',
  },
  totalAllocationAmount: {
    label: 'Total Allocation Amount',
    description:
      'The sum of all monthly allocations for this item. This shows the total budget allocated across all months for procurement and delivery of this item.',
    examples: 'e.g., ₱1,608,719,112 (auto-calculated from monthly allocations)',
  },
  monthlyAllocations: {
    label: 'Monthly Allocations',
    description:
      'The quantity and amount budgeted for each month. Defines when items will be procured and delivered throughout the fiscal year.',
    examples:
      'e.g., March: 234,234 units (₱804,359,556), October: 234,234 units (₱804,359,556)',
  },
  createdAt: {
    label: 'Created Date',
    description:
      'The date and time when this procurement item was created in the system. Tracks the item creation history.',
    examples: 'e.g., August 12, 2026',
  },
  createdBy: {
    label: 'Created By',
    description:
      'The user or system account that created this procurement item. Shows who entered the item into the PPMP.',
    examples: 'e.g., system, admin@institution.edu',
  },
  ppmpExpenditureItemId: {
    label: 'PPMP Expenditure Group ID',
    description:
      'The unique identifier of the expenditure group this item belongs to. Links the item to its parent procurement category or group.',
    examples: 'e.g., 1a064edf-7ab8-442b-bbae-dbc486792143',
  },
  id: {
    label: 'Item ID',
    description:
      'The unique identifier for this procurement item in the system. Used for tracking, linking to allocations, and system references.',
    examples: 'e.g., 1e8c5d4f-349f-46f7-a7f8-8ced4fb2bd70',
  },
} as const

export type PPMPFieldKey = keyof typeof PPMP_FIELD_DESCRIPTIONS

export function getFieldDescription(fieldKey: PPMPFieldKey) {
  return PPMP_FIELD_DESCRIPTIONS[fieldKey] || null
}

export function getAllFieldDescriptions() {
  return PPMP_FIELD_DESCRIPTIONS
}
