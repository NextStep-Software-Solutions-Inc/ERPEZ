import type { LineItemBudgetDetails } from '../types/types'

export interface MatrixQuarterCell {
  budget: number | null
  allocations: LineItemBudgetDetails[]
}

export interface ItemOfExpenditureRow {
  itemId: string
  itemName: string
  itemCode?: string
  groupName: string
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

/**
 * Group line items according to the authoritative business expenditure hierarchy:
 *
 * Level 1: Type of Expenditure (e.g. Personnel Services, Maintenance and Other Operating Expenses)
 * Level 2: Item of Expenditure (e.g. Salaries and Wages, Training Expenses, or specific detail item)
 * Level 3: Period allocations (Q1, Q2, Q3, Q4) — aggregated into single item rows
 *
 * Preserves every underlying LineItemBudgetDetail.id for individual CRUD operations.
 */
export function groupExpenditureItems(
  items: LineItemBudgetDetails[],
): TypeOfExpenditureGroup[] {
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
      const parentObj = item.object?.parentObject
      const isRootNode =
        parentObj &&
        (parentObj.name?.toLowerCase() === 'expenses' ||
          parentObj.code === 'CLS:Expenses' ||
          parentObj.code === '50000000' ||
          parentObj.code?.startsWith('50000000'))

      let itemKey: string
      if (parentObj && !isRootNode) {
        // Child UACS item was selected (e.g. Training Expenses under MOOE)
        itemKey = item.objectId || item.object?.id || item.id
      } else if (item.object?.id && item.description && item.description.trim() !== '' && item.description !== item.object?.name) {
        // Parent category was selected directly, description holds the logical item (e.g. "Salary for Justine")
        itemKey = `${item.objectId || item.object.id}-${item.description.trim()}`
      } else {
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
      let groupSubtitle: string

      if (parentObj && !isRootNode) {
        itemName = firstAlloc.object?.name || firstAlloc.description || 'Item of Expenditure'
        groupSubtitle =
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
        groupSubtitle = firstAlloc.object?.code ? `Code: ${firstAlloc.object.code}` : `GRP: ${meta.name}`
      }

      const itemCode = firstAlloc.object?.code

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
      items: itemsList,
    }
  })

  return grouped
}

