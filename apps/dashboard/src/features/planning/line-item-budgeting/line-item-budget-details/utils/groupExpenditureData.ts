import type { LineItemBudgetDetails } from '../types/types'

export interface MatrixQuarterCell {
  budget: number | null
  allocations: LineItemBudgetDetails[]
}

export interface PeriodColumn {
  key: string
  year: number
  quarterNumber: number
  quarterLabel: string
  dateRangeLabel: string
  fullLabel: string
}

export interface ItemOfExpenditureRow {
  itemId: string
  itemName: string
  itemCode?: string
  groupName: string
  quantity?: number
  unitCost?: number
  periodAmounts: Record<string, MatrixQuarterCell>
  q1: MatrixQuarterCell
  q2: MatrixQuarterCell
  q3: MatrixQuarterCell
  q4: MatrixQuarterCell
  total: number
  itemTotal: number
  allocationCount: number
  allocations: LineItemBudgetDetails[]
}

export interface TypeOfExpenditureGroup {
  typeId: string
  typeName: string
  typeCode?: string
  categoryTheme: {
    bg: string
    border: string
    iconBg: string
    iconColor: string
    iconName: 'user' | 'briefcase' | 'landmark' | 'dollar' | 'layers' | 'folder'
  }
  typeTotal: number
  itemCount: number
  allocationCount: number
  columns: PeriodColumn[]
  items: ItemOfExpenditureRow[]
}

// Export alias for backward-compatibility with existing component props
export type GroupedExpenditureData = TypeOfExpenditureGroup

export function getCategoryTheme(name: string, code?: string) {
  const lower = name.toLowerCase()
  if (
    lower.includes('personnel') ||
    lower.includes('salary') ||
    code?.startsWith('501')
  ) {
    return {
      bg: 'bg-blue-50/40',
      border: 'border-l-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      iconName: 'user' as const,
    }
  }
  if (
    lower.includes('maintenance') ||
    lower.includes('mooe') ||
    lower.includes('operating') ||
    code?.startsWith('502')
  ) {
    return {
      bg: 'bg-emerald-50/40',
      border: 'border-l-emerald-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      iconName: 'briefcase' as const,
    }
  }
  if (
    lower.includes('capital') ||
    lower.includes('outlay') ||
    code?.startsWith('506')
  ) {
    return {
      bg: 'bg-amber-50/40',
      border: 'border-l-amber-500',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      iconName: 'landmark' as const,
    }
  }
  if (lower.includes('financial') || code?.startsWith('503')) {
    return {
      bg: 'bg-purple-50/40',
      border: 'border-l-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      iconName: 'dollar' as const,
    }
  }
  if (lower.includes('direct cost')) {
    return {
      bg: 'bg-cyan-50/40',
      border: 'border-l-cyan-600',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      iconName: 'layers' as const,
    }
  }
  return {
    bg: 'bg-gray-50/40',
    border: 'border-l-gray-500',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    iconName: 'folder' as const,
  }
}

/**
 * Determine the quarter (q1, q2, q3, q4) from item's startDate using UTC month.
 * Returns null if timelineType is explicitly non-quarterly (e.g. Monthly, Annual).
 * Months 0-2 (Jan-Mar) -> Q1
 * Months 3-5 (Apr-Jun) -> Q2
 * Months 6-8 (Jul-Sep) -> Q3
 * Months 9-11 (Oct-Dec) -> Q4
 */
/**
 * Determine the quarter (q1, q2, q3, q4) from item's startDate.
 * Returns null if timelineType is explicitly non-quarterly (e.g. Monthly, Annual).
 * Uses local month to accurately reflect timezone offsets (e.g. 2025-12-31T16:00:00Z in UTC+8 is Jan 1).
 * Months 0-2 (Jan-Mar) -> Q1
 * Months 3-5 (Apr-Jun) -> Q2
 * Months 6-8 (Jul-Sep) -> Q3
 * Months 9-11 (Oct-Dec) -> Q4
 */
export function getQuarterFromItem(
  item: LineItemBudgetDetails,
): 'q1' | 'q2' | 'q3' | 'q4' | null {
  if (
    item.timelineType &&
    item.timelineType.toLowerCase() !== 'quarterly'
  ) {
    return null
  }

  if (!item.startDate) return null
  const date = new Date(item.startDate)
  if (isNaN(date.getTime())) return null
  const month = date.getMonth()
  if (month <= 2) return 'q1'
  if (month <= 5) return 'q2'
  if (month <= 8) return 'q3'
  return 'q4'
}

export function getYearAwareQuarterFromItem(
  item: LineItemBudgetDetails,
): { key: string; year: number; quarterNumber: number } | null {
  if (
    item.timelineType &&
    item.timelineType.toLowerCase() !== 'quarterly'
  ) {
    return null
  }

  if (!item.startDate) return null
  const date = new Date(item.startDate)
  if (isNaN(date.getTime())) return null
  const year = date.getFullYear()
  const month = date.getMonth()
  const quarterNumber = Math.floor(month / 3) + 1
  return {
    key: `${year}-Q${quarterNumber}`,
    year,
    quarterNumber,
  }
}

export function resolveProjectPeriodColumns(
  items: LineItemBudgetDetails[],
): PeriodColumn[] {
  const dateRangeLabels = ['Jan – Mar', 'Apr – Jun', 'Jul – Sep', 'Oct – Dec']
  const dates = items
    .filter((d) => d.startDate)
    .map((d) => ({
      start: new Date(d.startDate!),
      end: d.endDate ? new Date(d.endDate) : new Date(d.startDate!),
    }))
    .filter((d) => !isNaN(d.start.getTime()) && !isNaN(d.end.getTime()))

  if (dates.length === 0) {
    const currentYear = new Date().getFullYear()
    return [1, 2, 3, 4].map((q) => ({
      key: `${currentYear}-Q${q}`,
      year: currentYear,
      quarterNumber: q,
      quarterLabel: `Q${q}`,
      dateRangeLabel: dateRangeLabels[q - 1],
      fullLabel: `${currentYear} Q${q}`,
    }))
  }

  const minTime = Math.min(...dates.map((d) => d.start.getTime()))
  const maxTime = Math.max(...dates.map((d) => d.end.getTime()))

  const minDate = new Date(minTime)
  const maxDate = new Date(maxTime)

  const minYear = minDate.getFullYear()
  const maxYear = maxDate.getFullYear()

  const startQuarter = Math.floor(minDate.getMonth() / 3) + 1
  const endQuarter = Math.floor(maxDate.getMonth() / 3) + 1

  const columns: PeriodColumn[] = []

  for (let y = minYear; y <= maxYear; y++) {
    const qStart = y === minYear ? startQuarter : 1
    const qEnd = y === maxYear ? endQuarter : 4
    for (let q = qStart; q <= qEnd; q++) {
      columns.push({
        key: `${y}-Q${q}`,
        year: y,
        quarterNumber: q,
        quarterLabel: `Q${q}`,
        dateRangeLabel: dateRangeLabels[q - 1],
        fullLabel: `${y} Q${q}`,
      })
    }
  }

  return columns
}

function normalizeCustomDescription(desc?: string, objectName?: string): string {
  if (!desc) return ''
  const trimmed = desc.trim()
  if (!trimmed) return ''
  if (objectName) {
    if (trimmed.toLowerCase() === objectName.trim().toLowerCase()) return ''
    // If description is just the objectName with a period/quarter/date suffix (e.g. "Salaries and Wages - Q1")
    const stripped = trimmed
      .replace(
        new RegExp(
          `^${objectName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[-–(]?\\s*(Q[1-4]|Quarter\\s*[1-4]|[0-9]{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec).*\\)?$`,
          'i',
        ),
        '',
      )
      .trim()
    if (!stripped) return ''
  }
  return trimmed
}

/**
 * Group line items according to the authoritative business expenditure hierarchy:
 *
 * Level 1: Type of Expenditure (e.g. Personnel Services, Maintenance and Other Operating Expenses)
 * Level 2: Item of Expenditure (e.g. Salaries and Wages, Training Expenses, or specific detail item)
 * Level 3: Period allocations (Q1, Q2, Q3, Q4 / 2026-Q3, 2026-Q4, 2027-Q1) — aggregated into single item rows
 *
 * Preserves every underlying LineItemBudgetDetail.id for individual CRUD operations.
 */
export function groupExpenditureItems(
  items: LineItemBudgetDetails[],
): TypeOfExpenditureGroup[] {
  const globalColumns = resolveProjectPeriodColumns(items)

  // 1. Group by Level 1: Type of Expenditure
  const typeGroupsMap = new Map<string, LineItemBudgetDetails[]>()
  const typeMetadata = new Map<
    string,
    { name: string; code: string; index: number }
  >()

  items.forEach((item) => {
    let typeId: string
    let typeName: string
    let typeCode: string

    const parentObj = item.object?.parentObject
    const isRootNode =
      parentObj &&
      (parentObj.name?.toLowerCase() === 'expenses' ||
        parentObj.code === 'CLS:Expenses' ||
        parentObj.code === '50000000' ||
        parentObj.code?.startsWith('50000000'))

    // Primary: if item has a valid parent object that is not the Expenses root
    if (parentObj && !isRootNode) {
      typeId = parentObj.id
      typeName = parentObj.name || 'Type of Expenditure'
      typeCode = parentObj.code || ''
    } else if (item.expenseClass?.id) {
      // Secondary: if expenseClass is populated
      typeId = item.expenseClass.id
      typeName = item.expenseClass.name || 'Type of Expenditure'
      typeCode = item.expenseClass.code || ''
    } else {
      // Fallback: the object itself is the Type of Expenditure (e.g. Personnel Services)
      typeId = item.objectId || item.object?.id || 'ungrouped'
      typeName = item.object?.name || 'Type of Expenditure'
      typeCode = item.object?.code || ''
    }

    if (!typeGroupsMap.has(typeId)) {
      typeGroupsMap.set(typeId, [])
      typeMetadata.set(typeId, {
        name: typeName,
        code: typeCode,
        index: typeMetadata.size,
      })
    }

    typeGroupsMap.get(typeId)!.push(item)
  })

  // 2. Group within each Type of Expenditure by Level 2: Item of Expenditure
  const grouped: TypeOfExpenditureGroup[] = Array.from(
    typeGroupsMap.entries(),
  ).map(([typeId, typeItems]) => {
    const meta = typeMetadata.get(typeId)!

    const itemMap = new Map<string, LineItemBudgetDetails[]>()

    typeItems.forEach((item) => {
      const customDesc = normalizeCustomDescription(
        item.description,
        item.object?.name,
      )

      let itemKey: string
      if (item.wfpObjectiveActivityExpenditureId) {
        // Inherited WFP expenditure: group by upstream WFP expenditure ID
        itemKey = `wfp-${item.wfpObjectiveActivityExpenditureId}`
      } else if (customDesc !== '') {
        // Manual line item with custom description: group by objectId + description
        // so multiple period slices aggregate into one logical item, while distinct
        // manual items under the same object stay separate.
        itemKey = `${item.objectId || item.object?.id || 'manual'}-${customDesc}`
      } else {
        // Default: group by objectId
        itemKey = item.objectId || item.object?.id || item.id
      }

      if (!itemMap.has(itemKey)) {
        itemMap.set(itemKey, [])
      }
      itemMap.get(itemKey)!.push(item)
    })

    const itemsList: ItemOfExpenditureRow[] = Array.from(
      itemMap.entries(),
    ).map(([itemId, allocations]) => {
      const firstAlloc = allocations[0]
      const parentObj = firstAlloc.object?.parentObject
      const isRootNode =
        parentObj &&
        (parentObj.name?.toLowerCase() === 'expenses' ||
          parentObj.code === 'CLS:Expenses' ||
          parentObj.code === '50000000' ||
          parentObj.code?.startsWith('50000000'))

      let itemName: string
      let baseSubtitle: string

      if (parentObj && !isRootNode) {
        itemName =
          firstAlloc.object?.name ||
          firstAlloc.description ||
          'Item of Expenditure'
        baseSubtitle =
          firstAlloc.description && firstAlloc.description !== itemName
            ? firstAlloc.description
            : firstAlloc.object?.code
              ? `Code: ${firstAlloc.object.code}`
              : `GRP: ${meta.name}`
      } else {
        // When object itself is the Type of Expenditure, description is the Item Name
        itemName =
          firstAlloc.description && firstAlloc.description.trim() !== ''
            ? firstAlloc.description
            : firstAlloc.object?.name || 'Item of Expenditure'
        baseSubtitle = firstAlloc.object?.code
          ? `Code: ${firstAlloc.object.code}`
          : `GRP: ${meta.name}`
      }

      const itemCode = firstAlloc.object?.code

      const quantity =
        firstAlloc.wfpObjectiveActivityExpenditure?.quantity ??
        allocations.find((a) => a.unitQuantity && a.unitQuantity > 0)
          ?.unitQuantity

      const unitCost =
        firstAlloc.wfpObjectiveActivityExpenditure?.unitCost ??
        allocations.find((a) => a.unitCost && a.unitCost > 0)?.unitCost

      const metadataParts: string[] = [baseSubtitle]
      if (quantity !== undefined && quantity > 0) {
        metadataParts.push(`Qty: ${quantity}`)
      }
      if (unitCost !== undefined && unitCost > 0) {
        metadataParts.push(
          `Unit Cost: ₱${unitCost.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        )
      }
      const groupSubtitle = metadataParts.join(' • ')

      // Year-aware period mapping
      const periodAmounts: Record<string, MatrixQuarterCell> = {}
      globalColumns.forEach((col) => {
        periodAmounts[col.key] = { budget: null, allocations: [] }
      })

      allocations.forEach((a) => {
        const periodInfo = getYearAwareQuarterFromItem(a)
        if (periodInfo) {
          if (!periodAmounts[periodInfo.key]) {
            periodAmounts[periodInfo.key] = { budget: null, allocations: [] }
          }
          periodAmounts[periodInfo.key].budget =
            (periodAmounts[periodInfo.key].budget || 0) + (a.budget || 0)
          periodAmounts[periodInfo.key].allocations.push(a)
        }
      })

      // Legacy quarter mapping for backward compatibility
      const q1Allocations = allocations.filter(
        (a) => getQuarterFromItem(a) === 'q1',
      )
      const q2Allocations = allocations.filter(
        (a) => getQuarterFromItem(a) === 'q2',
      )
      const q3Allocations = allocations.filter(
        (a) => getQuarterFromItem(a) === 'q3',
      )
      const q4Allocations = allocations.filter(
        (a) => getQuarterFromItem(a) === 'q4',
      )

      const q1Budget =
        q1Allocations.length > 0
          ? q1Allocations.reduce((sum, a) => sum + a.budget, 0)
          : null
      const q2Budget =
        q2Allocations.length > 0
          ? q2Allocations.reduce((sum, a) => sum + a.budget, 0)
          : null
      const q3Budget =
        q3Allocations.length > 0
          ? q3Allocations.reduce((sum, a) => sum + a.budget, 0)
          : null
      const q4Budget =
        q4Allocations.length > 0
          ? q4Allocations.reduce((sum, a) => sum + a.budget, 0)
          : null

      const total = allocations.reduce((sum, a) => sum + a.budget, 0)

      return {
        itemId,
        itemName,
        itemCode,
        groupName: groupSubtitle,
        quantity,
        unitCost,
        periodAmounts,
        q1: { budget: q1Budget, allocations: q1Allocations },
        q2: { budget: q2Budget, allocations: q2Allocations },
        q3: { budget: q3Budget, allocations: q3Allocations },
        q4: { budget: q4Budget, allocations: q4Allocations },
        total,
        itemTotal: total,
        allocationCount: allocations.length,
        allocations,
      }
    })

    const typeTotal = itemsList.reduce((sum, i) => sum + i.total, 0)

    return {
      typeId,
      typeName: meta.name,
      typeCode: meta.code,
      categoryTheme: getCategoryTheme(meta.name, meta.code),
      typeTotal,
      itemCount: itemsList.length,
      allocationCount: typeItems.length,
      columns: globalColumns,
      items: itemsList,
    }
  })

  return grouped
}

