/**
 * Cascading UACS Category Mapping
 * Hierarchical structure for Procurement Category → Item Category
 * Used in Request Item Modal for cascading dropdown filtering
 */

export const UACS_CASCADE_MAP = {
  Goods: [
    'IT Equipment',
    'Office Supplies',
    'Materials',
    'Furniture',
    'Other Goods',
  ],
  Infra: [
    'Building/Structure',
    'Roadworks',
    'Maintenance',
    'Utilities Infrastructure',
    'Other Infrastructure',
  ],
  Consulting: [
    'Professional Services',
    'Training',
    'Research',
    'Technical Support',
    'Other Services',
  ],
} as const

/**
 * Get available item categories for a given procurement category
 */
export function getUacsItemCategories(
  procurementCategory: keyof typeof UACS_CASCADE_MAP,
): readonly string[] {
  return UACS_CASCADE_MAP[procurementCategory] ?? []
}

/**
 * All available procurement categories
 */
export const PROCUREMENT_CATEGORIES = Object.keys(UACS_CASCADE_MAP) as Array<
  keyof typeof UACS_CASCADE_MAP
>

/**
 * Status colors for badges
 */
export const STATUS_COLORS = {
  Draft: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  Submitted: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
  Pending: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800', // Legacy alias
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
  Returned: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
  Inactive: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
} as const

/**
 * UNSPSC (United Nations Standard Products and Services Code)
 * Global standard for product and service classification
 * Used for international procurement reporting and standardization
 */
export interface UNSPSCCode {
  code: string
  label: string
  category: string
}

export const UNSPSC_CODES: UNSPSCCode[] = [
  // IT Equipment & Computers
  {
    code: '43210000',
    label: 'Computers and computer peripheral equipment and components',
    category: 'IT',
  },
  { code: '43211500', label: 'Laptop computers', category: 'IT' },
  { code: '43211501', label: 'Desktop computers', category: 'IT' },
  {
    code: '43212000',
    label: 'Computer monitors and display devices',
    category: 'IT',
  },
  { code: '43213000', label: 'Printers', category: 'IT' },
  { code: '43213100', label: 'Laser printers', category: 'IT' },
  { code: '43213200', label: 'Ink jet printers', category: 'IT' },
  { code: '43220000', label: 'Computer software', category: 'IT' },

  // Office Supplies & Furniture
  { code: '44101500', label: 'Office and desk furniture', category: 'Office' },
  { code: '44101501', label: 'Office chairs', category: 'Office' },
  { code: '44101502', label: 'Office desks and tables', category: 'Office' },
  {
    code: '44101700',
    label: 'Cabinets and Storage equipment',
    category: 'Office',
  },
  {
    code: '48000000',
    label: 'Paper materials and products',
    category: 'Office',
  },
  { code: '48010000', label: 'Paper and paperboard', category: 'Office' },
  {
    code: '48010100',
    label: 'Copy paper and printing paper',
    category: 'Office',
  },

  // Building & Construction Materials
  {
    code: '30111200',
    label: 'Concrete blocks and bricks',
    category: 'Construction',
  },
  {
    code: '30111300',
    label: 'Steel and ferrous metal products',
    category: 'Construction',
  },
  {
    code: '30111301',
    label: 'Steel reinforcement bars',
    category: 'Construction',
  },
  { code: '30111400', label: 'Cement and concrete', category: 'Construction' },
  { code: '30111401', label: 'Portland cement', category: 'Construction' },
  { code: '30111500', label: 'Ready-mix concrete', category: 'Construction' },

  // Roadworks & Infrastructure
  {
    code: '30121500',
    label: 'Asphalt and bituminous materials',
    category: 'Infrastructure',
  },
  { code: '30121501', label: 'Asphalt concrete', category: 'Infrastructure' },
  {
    code: '30121502',
    label: 'Bituminous emulsion',
    category: 'Infrastructure',
  },

  // Professional Services
  {
    code: '71212000',
    label: 'Engineering and architectural services',
    category: 'Services',
  },
  {
    code: '71212100',
    label: 'Civil engineering consulting',
    category: 'Services',
  },
  {
    code: '81110000',
    label: 'Training and educational services',
    category: 'Services',
  },
]

/**
 * Search UNSPSC codes by keyword
 */
export function searchUNSPSCCodes(query: string): UNSPSCCode[] {
  if (!query) return UNSPSC_CODES

  const lowerQuery = query.toLowerCase()
  return UNSPSC_CODES.filter(
    (item) =>
      item.code.includes(lowerQuery) ||
      item.label.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery),
  )
}
