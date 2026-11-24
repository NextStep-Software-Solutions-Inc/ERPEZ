/**
 * Unified Accounts Code Structure (UACS) Object Code Utilities
 *
 * Philippine Government Accounting Standards (DBM / COA):
 * - 501* -> PS (Personal Services)
 * - 502* -> MOOE (Maintenance & Other Operating Expenses)
 * - 503* -> FE (Financial Expenses)
 * - 106* / 506* -> CO (Capital Outlays)
 *
 * Hierarchy:
 * - Parent Objects (General Accounts, e.g. 50203010 Office Supplies Expense)
 * - Sub-Objects / Subsidiary Accounts (Child Accounts, e.g. 5020301001 Paper & Stationeries)
 */

export type ExpenseClassCode = 'PS' | 'MOOE' | 'CO' | 'FE' | 'OTHER'

export interface UACSExpenseClassInfo {
  code: ExpenseClassCode
  name: string
  shortLabel: string
  description: string
  prefix: string
  bg: string
  text: string
  border: string
  dot: string
}

export const UACS_EXPENSE_CLASSES: Record<ExpenseClassCode, UACSExpenseClassInfo> = {
  PS: {
    code: 'PS',
    name: 'Personal Services',
    shortLabel: 'PS',
    description: 'Salaries, wages, allowances, and personnel benefits',
    prefix: '501',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  MOOE: {
    code: 'MOOE',
    name: 'Maintenance & Other Operating Expenses',
    shortLabel: 'MOOE',
    description: 'Supplies, utilities, travel, communication, repairs, and professional services',
    prefix: '502',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  CO: {
    code: 'CO',
    name: 'Capital Outlays',
    shortLabel: 'CO',
    description: 'Infrastructure, equipment, buildings, and capital assets',
    prefix: '106',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  FE: {
    code: 'FE',
    name: 'Financial Expenses',
    shortLabel: 'FE',
    description: 'Bank charges, interest expense, and commitment fees',
    prefix: '503',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  OTHER: {
    code: 'OTHER',
    name: 'Other UACS Accounts',
    shortLabel: 'Other',
    description: 'Other expenditures or general ledger accounts',
    prefix: '',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
}

export interface ObjectCodeOptionItem {
  id: string
  code?: string
  name: string
  isActive?: boolean
  parent?: {
    id: string
    code?: string
    name: string
    parent?: any
  } | null
  parentId?: string | null
  parentCode?: string | null
  parentName?: string | null
  expenseClass?: string
  expenseClassName?: string
  expenseClassId?: string | null
  childObjectCount?: number
  isSubsidiary?: boolean
  [key: string]: any
}

export interface ParsedUACSObjectCode {
  raw: ObjectCodeOptionItem
  id: string
  code: string
  name: string
  expenseClass: ExpenseClassCode
  expenseClassInfo: UACSExpenseClassInfo
  isChild: boolean
  isParent: boolean
  parentId: string | null
  parentCode: string | null
  parentName: string | null
  childCount: number
  searchString: string
}

/**
 * Resolves expense class from code prefix or explicitly provided value
 */
export function resolveExpenseClass(
  code?: string,
  rawClass?: string
): ExpenseClassCode {
  if (rawClass) {
    const upper = rawClass.trim().toUpperCase()
    if (upper === 'PS' || upper.includes('PERSONAL')) return 'PS'
    if (upper === 'MOOE' || upper.includes('MAINTENANCE')) return 'MOOE'
    if (upper === 'CO' || upper.includes('CAPITAL')) return 'CO'
    if (upper === 'FE' || upper.includes('FINANCIAL')) return 'FE'
  }

  const cleanCode = (code || '').trim()
  if (cleanCode.startsWith('501')) return 'PS'
  if (cleanCode.startsWith('502')) return 'MOOE'
  if (cleanCode.startsWith('503')) return 'FE'
  if (cleanCode.startsWith('106') || cleanCode.startsWith('506')) return 'CO'

  return 'OTHER'
}

/**
 * Parse an object code option with its UACS metadata and parent-child hierarchy
 */
export function parseUACSObjectCode(
  item: ObjectCodeOptionItem,
  itemMapById?: Map<string, ObjectCodeOptionItem>
): ParsedUACSObjectCode {
  const cleanCode = (item.code || '').trim()
  const cleanName = (item.name || '').trim()

  // 1. Resolve Parent Details
  let parentId: string | null = null
  let parentCode: string | null = null
  let parentName: string | null = null

  if (item.parent) {
    parentId = item.parent.id || null
    parentCode = item.parent.code || null
    parentName = item.parent.name || null
  } else if (item.parentId) {
    parentId = item.parentId
    parentCode = item.parentCode || null
    parentName = item.parentName || null

    // If parent info is incomplete, attempt resolving from the all-items lookup map
    if (itemMapById && (!parentCode || !parentName)) {
      const foundParent = itemMapById.get(item.parentId)
      if (foundParent) {
        parentCode = foundParent.code || parentCode
        parentName = foundParent.name || parentName
      }
    }
  }

  const isChild = Boolean(parentId || item.isSubsidiary)
  const childCount = item.childObjectCount || 0
  const isParent = !isChild && childCount > 0

  // 2. Resolve Expense Class (inheriting from parent code if child code is non-standard)
  let resolvedClass = resolveExpenseClass(
    cleanCode,
    item.expenseClass || item.expenseClassName
  )
  if (resolvedClass === 'OTHER' && parentCode) {
    resolvedClass = resolveExpenseClass(parentCode)
  }

  const expenseClassInfo =
    UACS_EXPENSE_CLASSES[resolvedClass] || UACS_EXPENSE_CLASSES.OTHER

  // 3. Aliases and search tokens
  const aliases: string[] = []
  if (resolvedClass === 'PS') {
    aliases.push('personnel', 'salaries', 'benefits', 'wages')
  } else if (resolvedClass === 'MOOE') {
    aliases.push('maintenance', 'operating', 'supplies', 'services')
  } else if (resolvedClass === 'CO') {
    aliases.push('capital', 'outlay', 'equipment', 'asset', 'infrastructure')
  } else if (resolvedClass === 'FE') {
    aliases.push('financial', 'interest', 'bank')
  }

  if (isChild) {
    aliases.push('child', 'sub-object', 'sub-account', 'subsidiary')
  } else {
    aliases.push('parent', 'general account')
  }

  const digitsOnly = cleanCode.replace(/\D/g, '')
  const parentDigitsOnly = (parentCode || '').replace(/\D/g, '')

  const searchString = [
    cleanCode,
    digitsOnly,
    cleanName,
    parentCode,
    parentDigitsOnly,
    parentName,
    expenseClassInfo.code,
    expenseClassInfo.shortLabel,
    expenseClassInfo.name,
    ...aliases,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return {
    raw: item,
    id: item.id,
    code: cleanCode,
    name: cleanName,
    expenseClass: resolvedClass,
    expenseClassInfo,
    isChild,
    isParent,
    parentId,
    parentCode,
    parentName,
    childCount,
    searchString,
  }
}

/**
 * Calculates a multi-token relevance score for ranking object codes in the combobox
 */
export function calculateObjectCodeRelevanceScore(
  item: ParsedUACSObjectCode,
  query: string,
  tokens: string[]
): number {
  if (!query) return 0

  const lowerQuery = query.toLowerCase()
  const lowerCode = item.code.toLowerCase()
  const lowerDigits = item.code.replace(/\D/g, '')
  const lowerName = item.name.toLowerCase()
  const lowerClass = item.expenseClass.toLowerCase()
  const lowerClassName = item.expenseClassInfo.name.toLowerCase()
  const lowerParentName = (item.parentName || '').toLowerCase()
  const lowerParentCode = (item.parentCode || '').toLowerCase()

  let score = 0

  // 1. Code matches (highest priority)
  if (lowerCode === lowerQuery || lowerDigits === lowerQuery) {
    score += 1000
  } else if (lowerCode.startsWith(lowerQuery) || lowerDigits.startsWith(lowerQuery)) {
    score += 650
  } else if (lowerCode.includes(lowerQuery) || lowerDigits.includes(lowerQuery)) {
    score += 450
  }

  // 2. Name matches
  if (lowerName === lowerQuery) {
    score += 900
  } else if (lowerName.startsWith(lowerQuery)) {
    score += 700
  } else if (lowerName.includes(lowerQuery)) {
    score += 500
  }

  // 3. Class match (e.g. searching "MOOE" or "Personnel Services")
  if (lowerClass === lowerQuery) {
    score += 450
  } else if (lowerClassName.startsWith(lowerQuery)) {
    score += 350
  } else if (lowerClassName.includes(lowerQuery)) {
    score += 250
  }

  // 4. Parent context matches (child under searched parent)
  if (lowerParentCode && (lowerParentCode === lowerQuery || lowerParentCode.startsWith(lowerQuery))) {
    score += 320
  }
  if (lowerParentName && lowerParentName.includes(lowerQuery)) {
    score += 260
  }

  // 5. Multi-token matches
  for (const token of tokens) {
    if (lowerName.includes(token)) score += 80
    if (lowerCode.includes(token) || lowerDigits.includes(token)) score += 70
    if (lowerParentName.includes(token)) score += 50
    if (lowerClass.includes(token) || lowerClassName.includes(token)) score += 40
  }

  return score
}

/**
 * Group parsed object codes by Expense Class and Parent-Child hierarchy
 */
export interface HierarchicalGroupItem {
  parent: ParsedUACSObjectCode
  children: ParsedUACSObjectCode[]
}

export interface ExpenseClassGroup {
  expenseClass: ExpenseClassCode
  info: UACSExpenseClassInfo
  groups: HierarchicalGroupItem[]
  standalone: ParsedUACSObjectCode[]
  totalCount: number
}

export function groupParsedObjectCodes(
  items: ParsedUACSObjectCode[]
): ExpenseClassGroup[] {
  // Class buckets
  const classOrder: ExpenseClassCode[] = ['PS', 'MOOE', 'CO', 'FE', 'OTHER']
  const classMap = new Map<ExpenseClassCode, ParsedUACSObjectCode[]>()

  for (const code of classOrder) {
    classMap.set(code, [])
  }

  for (const item of items) {
    const list = classMap.get(item.expenseClass) || classMap.get('OTHER')!
    list.push(item)
  }

  const result: ExpenseClassGroup[] = []

  for (const ec of classOrder) {
    const list = classMap.get(ec) || []
    if (list.length === 0) continue

    const info = UACS_EXPENSE_CLASSES[ec] || UACS_EXPENSE_CLASSES.OTHER

    // Identify parents and build parent-child trees within this class
    const parentMap = new Map<string, HierarchicalGroupItem>()
    const standalone: ParsedUACSObjectCode[] = []
    const childSet = new Set<string>()

    // First pass: locate all potential parents in this class
    for (const item of list) {
      if (!item.isChild) {
        parentMap.set(item.id, { parent: item, children: [] })
      }
    }

    // Second pass: attach children to parents
    for (const item of list) {
      if (item.isChild && item.parentId && parentMap.has(item.parentId)) {
        parentMap.get(item.parentId)!.children.push(item)
        childSet.add(item.id)
      }
    }

    // Third pass: collect standalone items (items with no children and not a child of known parent)
    const groups: HierarchicalGroupItem[] = []
    for (const item of list) {
      if (childSet.has(item.id)) continue

      if (parentMap.has(item.id)) {
        const grp = parentMap.get(item.id)!
        if (grp.children.length > 0) {
          groups.push(grp)
        } else {
          standalone.push(item)
        }
      } else {
        // Child whose parent is in another class or not in the list
        standalone.push(item)
      }
    }

    result.push({
      expenseClass: ec,
      info,
      groups,
      standalone,
      totalCount: list.length,
    })
  }

  return result
}
