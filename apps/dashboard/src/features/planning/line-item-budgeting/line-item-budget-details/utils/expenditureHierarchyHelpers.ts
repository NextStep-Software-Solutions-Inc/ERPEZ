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
 * Level 0 = Direct children of the Sub-Class (Groups, e.g. Property, Plant and Equipment Outlay)
 * Level 1 = Children of the Groups (Object codes, e.g. Machinery and Equipment)
 * Level 2+ = Sub-Objects / specifications (e.g. Office Equipment, ICT Equipment)
 */
export function getDescendantExpenditureItems(
  allObjects: PlanningObject[],
  rootParentId: string | null | undefined,
): ExpenditureItemOption[] {
  if (!rootParentId || !allObjects || allObjects.length === 0) return []

  // Adjacency map: parentId -> children
  const childrenMap = new Map<string, PlanningObject[]>()
  for (const item of allObjects) {
    const pId = (item.parent as any)?.id || (item as any).parentId
    if (pId) {
      const list = childrenMap.get(pId) || []
      list.push(item)
      childrenMap.set(pId, list)
    }
  }

  const result: ExpenditureItemOption[] = []

  function traverse(currentId: string, depth: number, parentObj?: PlanningObject) {
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
      const hasKids = grandchildren.length > 0 || (child.childObjectCount || 0) > 0
      result.push({
        id: child.id,
        name: child.name || '',
        code: child.code,
        depth,
        hasChildren: hasKids,
        parentName: parentObj?.name,
        parentCode: parentObj?.code,
        isLeaf: !hasKids,
      })
      // Recursively traverse to include deeper descendant levels (children of groups, sub-objects)
      traverse(child.id, depth + 1, child)
    }
  }

  traverse(rootParentId, 0)
  return result
}
