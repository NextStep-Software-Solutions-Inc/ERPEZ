import type { Object as PlanningObject } from '@/features/planning/object/types/types'

export interface ExpenditureItemOption {
  id: string
  name: string
  code?: string
  depth: number
  hasChildren: boolean
  parentName?: string
  parentCode?: string
  isLeaf: boolean
  isSelectable: boolean
}

/**
 * Resolves the root Expenses container object (if any) and the top-level
 * expenditure types / sub-classes (e.g. Personnel Services, MOOE, Capital Outlays, Financial Expenses).
 */
export function resolveExpenditureTypes(allObjects: PlanningObject[]): {
  expensesRootObject?: PlanningObject
  expenditureTypes: PlanningObject[]
} {
  if (!allObjects || allObjects.length === 0) {
    return { expensesRootObject: undefined, expenditureTypes: [] }
  }

  const expensesRootObject = allObjects.find(
    (item) =>
      item.code === 'CLS:Expenses' ||
      item.name?.toLowerCase() === 'expenses' ||
      item.code === '50000000' ||
      item.code === '5000000000',
  )

  let expenditureTypes: PlanningObject[] = []

  if (expensesRootObject) {
    expenditureTypes = allObjects.filter((item) => {
      const pId = (item.parent as any)?.id || (item as any).parentId
      return pId === expensesRootObject.id
    })
  }

  // Fallback if no children were found under expenses root: top-level objects without parent
  if (expenditureTypes.length === 0) {
    expenditureTypes = allObjects.filter((item) => {
      const pId = (item.parent as any)?.id || (item as any).parentId
      return !pId && item.id !== expensesRootObject?.id
    })
  }

  // Sort expenditure types by code or name
  expenditureTypes.sort((a, b) => {
    const codeA = a.code || ''
    const codeB = b.code || ''
    if (codeA && codeB) return codeA.localeCompare(codeB)
    return (a.name || '').localeCompare(b.name || '')
  })

  return { expensesRootObject, expenditureTypes }
}

/**
 * Traverses all objects and extracts all descendants under a given root parent (e.g. Sub-Class),
 * preserving depth, parent context, and hierarchical order.
 *
 * Supports multi-pass parent resolution:
 * 1. Explicit foreign key parentId / parent.id
 * 2. Parent code matching (parent.code)
 * 3. UACS 8-digit code prefix matching for sub-objects (e.g. "50604050 00" -> parent "50604050")
 * 4. Expense class prefix matching for unparented items
 */
export function getDescendantExpenditureItems(
  allObjects: PlanningObject[],
  rootParentId: string | null | undefined,
): ExpenditureItemOption[] {
  if (!rootParentId || !allObjects || allObjects.length === 0) return []

  // 1. Index objects by ID and clean normalized code
  const objectById = new Map<string, PlanningObject>()
  const objectByCleanCode = new Map<string, PlanningObject>()

  for (const item of allObjects) {
    if (item.id) objectById.set(item.id, item)
    const clean = (item.code || '').replace(/[\s-]+/g, '')
    if (clean) objectByCleanCode.set(clean, item)
  }

  const rootParent = objectById.get(rootParentId)

  // 2. Build adjacency map (parentId -> children)
  const childrenMap = new Map<string, PlanningObject[]>()
  const assignedChildIds = new Set<string>()

  // Pass 1: Explicit parentId or parent.id
  for (const item of allObjects) {
    const pId = (item.parent as any)?.id || (item as any).parentId
    if (pId && objectById.has(pId)) {
      const list = childrenMap.get(pId) || []
      list.push(item)
      childrenMap.set(pId, list)
      assignedChildIds.add(item.id)
    }
  }

  // Pass 2: Explicit parent.code matching
  for (const item of allObjects) {
    if (assignedChildIds.has(item.id)) continue
    const parentCode = (item.parent as any)?.code || (item as any).parentCode
    if (parentCode) {
      const cleanParentCode = parentCode.replace(/[\s-]+/g, '')
      const parentCandidate = objectByCleanCode.get(cleanParentCode)
      if (parentCandidate && parentCandidate.id !== item.id) {
        const list = childrenMap.get(parentCandidate.id) || []
        list.push(item)
        childrenMap.set(parentCandidate.id, list)
        assignedChildIds.add(item.id)
      }
    }
  }

  // Pass 3: UACS code prefix matching for sub-objects (e.g. "50604050 00" or "5060405001" -> parent "50604050")
  for (const item of allObjects) {
    if (assignedChildIds.has(item.id)) continue
    const cleanCode = (item.code || '').replace(/[\s-]+/g, '')
    if (cleanCode.length > 8 && /^\d+$/.test(cleanCode)) {
      const parentPrefix = cleanCode.slice(0, 8)
      const parentCandidate = objectByCleanCode.get(parentPrefix)
      if (parentCandidate && parentCandidate.id !== item.id) {
        const list = childrenMap.get(parentCandidate.id) || []
        list.push(item)
        childrenMap.set(parentCandidate.id, list)
        assignedChildIds.add(item.id)
      }
    }
  }

  // Pass 4: If an item belongs to the selected expense class prefix and has no parent, link to root
  if (rootParent) {
    const rootName = (rootParent.name || '').toLowerCase()
    const rootCode = (rootParent.code || '').toLowerCase()
    const isCO =
      rootName.includes('capital') ||
      rootCode.includes('co') ||
      rootCode.startsWith('506') ||
      rootCode.startsWith('106')
    const isPS =
      rootName.includes('personal') ||
      rootCode.includes('ps') ||
      rootCode.startsWith('501')
    const isMOOE =
      rootName.includes('operating') ||
      rootCode.includes('mooe') ||
      rootCode.startsWith('502')
    const isFE =
      rootName.includes('financial') ||
      rootCode.includes('fe') ||
      rootCode.startsWith('503')

    for (const item of allObjects) {
      if (assignedChildIds.has(item.id) || item.id === rootParentId) continue
      const cleanCode = (item.code || '').replace(/[\s-]+/g, '')
      const matchesClass =
        (isCO &&
          (cleanCode.startsWith('506') || cleanCode.startsWith('106'))) ||
        (isPS && cleanCode.startsWith('501')) ||
        (isMOOE && cleanCode.startsWith('502')) ||
        (isFE && cleanCode.startsWith('503'))

      if (matchesClass) {
        // Try finding a 4-to-6 digit group candidate first
        let linked = false
        if (cleanCode.length >= 6) {
          const groupPrefix = cleanCode.slice(0, 5)
          for (const [code, cand] of objectByCleanCode.entries()) {
            if (
              cand.id !== item.id &&
              code.startsWith(groupPrefix) &&
              code.length < cleanCode.length
            ) {
              const list = childrenMap.get(cand.id) || []
              list.push(item)
              childrenMap.set(cand.id, list)
              assignedChildIds.add(item.id)
              linked = true
              break
            }
          }
        }
        if (!linked) {
          const list = childrenMap.get(rootParentId) || []
          list.push(item)
          childrenMap.set(rootParentId, list)
          assignedChildIds.add(item.id)
        }
      }
    }
  }

  const result: ExpenditureItemOption[] = []

  function traverse(
    currentId: string,
    depth: number,
    parentObj?: PlanningObject,
  ) {
    const children = childrenMap.get(currentId) || []
    // Sort children by code, then name
    children.sort((a, b) => {
      const codeA = a.code || ''
      const codeB = b.code || ''
      if (codeA && codeB) return codeA.localeCompare(codeB)
      return (a.name || '').localeCompare(b.name || '')
    })

    for (const child of children) {
      const grandchildren = childrenMap.get(child.id) || []
      const hasKids =
        grandchildren.length > 0 || (child.childObjectCount || 0) > 0
      result.push({
        id: child.id,
        name: child.name || '',
        code: child.code,
        depth,
        hasChildren: hasKids,
        parentName: parentObj?.name,
        parentCode: parentObj?.code,
        isLeaf: !hasKids,
        isSelectable: depth > 0 || !hasKids,
      })
      // Recursively traverse to include deeper descendant levels (children of groups, sub-objects)
      traverse(child.id, depth + 1, child)
    }
  }

  traverse(rootParentId, 0)
  return result
}
