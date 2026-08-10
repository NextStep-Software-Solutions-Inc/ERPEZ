/**
 * Catalog Management Mock Data
 * Generates 10,000 realistic Non-CSE catalog items for stress testing.
 * Includes price history and audit log fixtures for detail panel.
 */

import type {
  NonCseCatalogItem,
  PriceHistoryEntry,
  AuditLogEntry,
  PpmpReference,
} from '../types'

// ─── Lookup Tables ─────────────────────────────────────────────────────────────

const CATEGORIES: { name: string; subcategories: string[] }[] = [
  {
    name: 'Maintenance Services',
    subcategories: ['Building', 'Equipment', 'Electrical', 'Plumbing', 'HVAC'],
  },
  {
    name: 'IT Services',
    subcategories: [
      'Technical Support',
      'Network',
      'Software',
      'Hardware',
      'Security',
    ],
  },
  {
    name: 'Catering Services',
    subcategories: ['In-house', 'External', 'Canteen', 'Event-Based'],
  },
  {
    name: 'Security Services',
    subcategories: ['Physical', 'CCTV', 'Access Control', 'Patrol'],
  },
  {
    name: 'Printing Services',
    subcategories: ['Documents', 'Signage', 'Tarpaulin', 'Reports', 'Forms'],
  },
  {
    name: 'Transport Services',
    subcategories: ['Vehicle Rental', 'Fuel', 'Delivery', 'Logistics'],
  },
  {
    name: 'Training Services',
    subcategories: [
      'Facilitation',
      'Materials',
      'Certificate',
      'Online',
      'Venue',
    ],
  },
  {
    name: 'Media Services',
    subcategories: ['Video Production', 'Photography', 'Design', 'Web Content'],
  },
  {
    name: 'Consultancy Services',
    subcategories: ['Legal', 'Financial', 'Engineering', 'HR', 'Management'],
  },
  {
    name: 'Event Services',
    subcategories: [
      'Venue Rental',
      'AV Equipment',
      'Decoration',
      'Registration',
    ],
  },
]

const UOM_OPTIONS = ['piece', 'ream', 'lot', 'set', 'box', 'roll'] as const

const USERS = ['jdoe', 'mcruz', 'amendoza', 'bsantos', 'rreyes', 'lpaglinawan']

const TAGS_MAP: Record<string, string[]> = {
  'Maintenance Services': ['repair', 'upkeep', 'maintenance'],
  'IT Services': ['tech', 'computer', 'digital', 'ICT'],
  'Catering Services': ['food', 'meal', 'snacks', 'beverage'],
  'Security Services': ['guard', 'safety', 'protection'],
  'Printing Services': ['print', 'document', 'reproduction'],
  'Transport Services': ['vehicle', 'car', 'delivery', 'logistics'],
  'Training Services': ['seminar', 'workshop', 'learning', 'development'],
  'Media Services': ['video', 'photo', 'graphics', 'media'],
  'Consultancy Services': ['advisory', 'expertise', 'professional'],
  'Event Services': ['conference', 'meeting', 'event', 'gathering'],
}

const ITEM_NAMES: string[] = [
  'Janitorial Services',
  'Security Guard Services',
  'AC Unit Repair',
  'Photocopier Maintenance',
  'Plumbing Repair',
  'Electrical Repair',
  'Catering per Event',
  'Vehicle Rental per Trip',
  'Venue Rental per Day',
  'Printing Services',
  'IT Technical Support',
  'Pest Control',
  'Office Furniture Repair',
  'Courier Service',
  'Social Media Management',
  'Network Installation',
  'Tarpaulin Printing',
  'Video Production',
  'Training Facilitation',
  'Website Development',
  'CCTV Installation',
  'Legal Consultancy',
  'Landscaping Services',
  'Generator Maintenance',
  'Elevator Maintenance',
  'Fire Suppression System Check',
  'Structural Assessment',
  'Annual Physical Exam',
  'Drug Testing Services',
  'Actuarial Services',
  'Financial Audit Services',
  'Engineering Consultancy',
  'Cloud Storage Subscription',
  'Software License',
  'Domain Registration',
  'Email Hosting',
  'Internet Connectivity',
  'Data Recovery Services',
  'Cybersecurity Assessment',
  'System Integration',
  'Office Cleaning',
  'Waste Disposal',
  'Sanitization Services',
  'Fumigation',
  'Roof Repair',
  'Painting Services',
  'Tiling Works',
  'Glass Replacement',
  'Fire Extinguisher Refill',
  'Water Tank Cleaning',
]

const SUPPLIERS = [
  'ABC General Services',
  'XYZ Maintenance Corp',
  'Premier IT Solutions',
  'FastTrack Logistics',
  'Elite Security Agency',
  'GlobalPrint Services',
  'TechConnect Philippines',
  'ServiceFirst Inc',
  'ProMedia Group',
  'NextLevel Events',
]

const AUDIT_REASONS = [
  'Annual price survey update',
  'Supplier price change notification',
  'Budget directive compliance',
  'Market price adjustment',
  'Correction of data entry error',
  'Procurement office review',
  'DBM circular implementation',
]

// ─── Date Helpers ──────────────────────────────────────────────────────────────

function randomPastDate(maxDaysAgo: number): string {
  const daysAgo = Math.floor(Math.random() * maxDaysAgo)
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().slice(0, 10)
}

function toISOString(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

function randomPastISO(maxDaysAgo: number): string {
  return toISOString(Math.floor(Math.random() * maxDaysAgo))
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ─── Data Generators ───────────────────────────────────────────────────────────

export function generateMockNonCseCatalogItems(
  count: number = 10_000,
): NonCseCatalogItem[] {
  const items: NonCseCatalogItem[] = []

  for (let i = 0; i < count; i++) {
    const categoryObj = pick(CATEGORIES)
    const baseName = pick(ITEM_NAMES)
    const uom = pick([...UOM_OPTIONS])
    const basePrice = Math.round((Math.random() * 98_000 + 500) * 100) / 100
    const surveyDaysAgo = Math.floor(Math.random() * 730) // 0–2 years
    const isInactive = Math.random() < 0.08
    const isLocked = Math.random() < 0.05
    const refCount = isLocked
      ? Math.floor(Math.random() * 3) + 1
      : Math.floor(Math.random() * 5)

    const createdDaysAgo = surveyDaysAgo + Math.floor(Math.random() * 365)
    const createdBy = pick(USERS)
    const updatedBy = pick(USERS)

    items.push({
      id: `nc-${String(i + 1).padStart(5, '0')}`,
      itemCode: `NC-${categoryObj.name.replace(/\s+/g, '').toUpperCase().slice(0, 4)}-${String(i + 1).padStart(4, '0')}`,
      name: `${baseName} ${i + 1 <= ITEM_NAMES.length ? '' : `(Type ${Math.ceil(i / ITEM_NAMES.length)})`}`.trim(),
      description:
        Math.random() > 0.3
          ? `Standard procurement item for ${categoryObj.name.toLowerCase()}. Includes all necessary materials.`
          : null,
      category: categoryObj.name,
      subcategory: pick(categoryObj.subcategories),
      unitOfMeasure: uom,
      currentPrice: basePrice,
      previousPrice:
        Math.random() > 0.4
          ? Math.round(basePrice * (0.85 + Math.random() * 0.2) * 100) / 100
          : null,
      lastSurveyDate: randomPastDate(surveyDaysAgo > 0 ? surveyDaysAgo : 1),
      tags: TAGS_MAP[categoryObj.name] ?? [],
      status: isInactive ? 'inactive' : 'active',
      isLocked,
      reasonLocked: isLocked
        ? `Referenced in PPMP-${2026 - Math.floor(Math.random() * 2)}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`
        : null,
      referenceCount: refCount,
      supplier: Math.random() > 0.2 ? pick(SUPPLIERS) : null,
      createdAt: toISOString(createdDaysAgo),
      updatedAt: toISOString(Math.floor(surveyDaysAgo / 2)),
      createdBy,
      updatedBy,
    })
  }

  return items
}

// Singleton lazy-initialized dataset (generated once per session)
let _mockItems: NonCseCatalogItem[] | null = null

export function getMockNonCseItems(): NonCseCatalogItem[] {
  if (!_mockItems) {
    _mockItems = generateMockNonCseCatalogItems(10_000)
  }
  return _mockItems
}

// ─── Price History Generator ───────────────────────────────────────────────────

export function generatePriceHistory(
  itemId: string,
  currentPrice: number,
): PriceHistoryEntry[] {
  const entries: PriceHistoryEntry[] = []
  let price = currentPrice

  for (let i = 12; i >= 0; i--) {
    const daysAgo = i * 30 + Math.floor(Math.random() * 10)
    // Walk price backwards
    price =
      Math.round((price / (1 + (Math.random() * 0.08 - 0.04))) * 100) / 100

    entries.push({
      id: `ph-${itemId}-${i}`,
      catalogItemId: itemId,
      price: i === 0 ? currentPrice : price,
      effectiveDate: randomPastDate(daysAgo),
      changedBy: pick(USERS),
      reason:
        i === 12
          ? 'initial'
          : pick(['survey', 'adjustment', 'correction'] as const),
    })
  }

  return entries.reverse()
}

// ─── Audit Log Generator ───────────────────────────────────────────────────────

export function generateAuditLog(itemId: string): AuditLogEntry[] {
  const entries: AuditLogEntry[] = []
  const actionCount = Math.floor(Math.random() * 8) + 3

  for (let i = 0; i < actionCount; i++) {
    const daysAgo = (actionCount - i) * 45 + Math.floor(Math.random() * 20)
    const action =
      i === 0
        ? 'create'
        : pick([
            'update',
            'update',
            'update',
            'deactivate',
            'reactivate',
            'bulk_adjust',
          ] as const)

    entries.push({
      id: `al-${itemId}-${i}`,
      catalogItemId: itemId,
      action,
      fieldChanged:
        action === 'update'
          ? pick(['currentPrice', 'description', 'supplier', 'unitOfMeasure'])
          : null,
      oldValue:
        action === 'update' ? String(Math.round(Math.random() * 10_000)) : null,
      newValue:
        action === 'update' ? String(Math.round(Math.random() * 10_000)) : null,
      changedBy: pick(USERS),
      changedAt: randomPastISO(daysAgo),
      notes: action === 'update' ? pick(AUDIT_REASONS) : null,
    })
  }

  return entries
}

// ─── PPMP References Generator ────────────────────────────────────────────────

export function generatePpmpReferences(
  itemId: string,
  count: number,
): PpmpReference[] {
  if (count === 0) return []

  return Array.from({ length: count }, (_, i) => {
    const year = 2025 + Math.floor(Math.random() * 2)
    const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
    return {
      ppmpId: `ppmp-${itemId}-${i}`,
      ppmpCode: `PPMP-${year}-${seq}`,
      ppmpTitle: `Annual Procurement Plan FY ${year}`,
      status: pick([
        'draft',
        'pending_review',
        'approved',
        'submitted',
      ] as const),
      fiscalYear: year,
    }
  })
}
