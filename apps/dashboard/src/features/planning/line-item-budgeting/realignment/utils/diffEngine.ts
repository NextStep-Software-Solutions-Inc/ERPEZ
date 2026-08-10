import type {
  Activity,
  ExpenditureType,
  ItemOfExpenditure,
  BudgetItem,
  ObjectGroup,
  DescriptionGroup,
  ProjectItem,
} from '../types/realignment.types'

export type DiffStatus = 'added' | 'deleted' | 'modified' | 'unchanged'

export interface BudgetItemDiff {
  id: string
  description: string
  q1: number
  q2: number
  q3: number
  q4: number
  total: number
  status: DiffStatus
  originalValues?: {
    q1: number
    q2: number
    q3: number
    q4: number
    total: number
  }
}

export interface ItemOfExpenditureDiff {
  id: string
  name: string
  items: BudgetItemDiff[]
  status: DiffStatus
}

export interface ExpenditureTypeDiff {
  id: string
  name: string
  type: 'PS' | 'MOOE' | 'CO'
  itemsOfExpenditure: ItemOfExpenditureDiff[]
  status: DiffStatus
}

export interface ActivityDiff {
  id: string
  name: string
  wfpObjectiveActivityId?: string
  opcrActivityId?: string
  expenditureTypes: ExpenditureTypeDiff[]
  status: DiffStatus
}

export interface ProjectItemDiff {
  id: string
  description: string
  qty: number
  unitCost: number
  budget: number
  timelineType: 'ONGOING' | 'PERIOD'
  startDate: string
  endDate: string
  status: DiffStatus
  originalValues?: {
    qty: number
    unitCost: number
    budget: number
    timelineType: 'ONGOING' | 'PERIOD'
    startDate: string
    endDate: string
  }
}

export interface DescriptionGroupDiff {
  id: string
  description: string
  items: ProjectItemDiff[]
  status: DiffStatus
}

export interface ObjectGroupDiff {
  id: string
  name: string
  code: string
  descriptionGroups: DescriptionGroupDiff[]
  status: DiffStatus
}

/**
 * Computes difference between original activity list and proposed activity list.
 */
export function diffActivities(
  original: Activity[],
  proposed: Activity[],
): ActivityDiff[] {
  const result: ActivityDiff[] = []

  // Helper to match activity
  const findMatchingActivity = (act: Activity, list: Activity[]) => {
    return list.find((item) => {
      if (act.wfpObjectiveActivityId && item.wfpObjectiveActivityId) {
        return act.wfpObjectiveActivityId === item.wfpObjectiveActivityId
      }
      if (act.opcrActivityId && item.opcrActivityId) {
        return act.opcrActivityId === item.opcrActivityId
      }
      return act.name.toLowerCase() === item.name.toLowerCase()
    })
  }

  // 1. Process proposed and matched/unchanged/modified
  proposed.forEach((propAct) => {
    const origAct = findMatchingActivity(propAct, original)

    if (!origAct) {
      // Added activity: mark all nested items as added
      result.push({
        ...propAct,
        status: 'added',
        expenditureTypes: markExpTypesStatus(propAct.expenditureTypes, 'added'),
      })
    } else {
      // Matched: check expenditure types
      const expTypes = diffExpenditureTypes(origAct.expenditureTypes, propAct.expenditureTypes)
      const hasChanges = expTypes.some((t) => t.status !== 'unchanged')

      result.push({
        ...propAct,
        status: hasChanges ? 'modified' : 'unchanged',
        expenditureTypes: expTypes,
      })
    }
  })

  // 2. Process deleted activities (exist in original but not in proposed)
  original.forEach((origAct) => {
    const propAct = findMatchingActivity(origAct, proposed)
    if (!propAct) {
      result.push({
        ...origAct,
        status: 'deleted',
        expenditureTypes: markExpTypesStatus(origAct.expenditureTypes, 'deleted'),
      })
    }
  })

  return result
}

function diffExpenditureTypes(
  original: ExpenditureType[],
  proposed: ExpenditureType[],
): ExpenditureTypeDiff[] {
  const result: ExpenditureTypeDiff[] = []

  const types: Array<'PS' | 'MOOE' | 'CO'> = ['PS', 'MOOE', 'CO']
  types.forEach((type) => {
    const origType = original.find((t) => t.type === type)
    const propType = proposed.find((t) => t.type === type)

    if (origType && propType) {
      const itemsOfExp = diffItemsOfExpenditure(origType.itemsOfExpenditure, propType.itemsOfExpenditure)
      const hasChanges = itemsOfExp.some((i) => i.status !== 'unchanged')

      result.push({
        ...propType,
        status: hasChanges ? 'modified' : 'unchanged',
        itemsOfExpenditure: itemsOfExp,
      })
    } else if (propType) {
      result.push({
        ...propType,
        status: 'added',
        itemsOfExpenditure: markItemsOfExpStatus(propType.itemsOfExpenditure, 'added'),
      })
    } else if (origType) {
      result.push({
        ...origType,
        status: 'deleted',
        itemsOfExpenditure: markItemsOfExpStatus(origType.itemsOfExpenditure, 'deleted'),
      })
    }
  })

  return result
}

function diffItemsOfExpenditure(
  original: ItemOfExpenditure[],
  proposed: ItemOfExpenditure[],
): ItemOfExpenditureDiff[] {
  const result: ItemOfExpenditureDiff[] = []

  proposed.forEach((propObj) => {
    const origObj = original.find((o) => o.id === propObj.id)

    if (!origObj) {
      result.push({
        ...propObj,
        status: 'added',
        items: markBudgetItemsStatus(propObj.items, 'added'),
      })
    } else {
      const items = diffBudgetItems(origObj.items, propObj.items)
      const hasChanges = items.some((i) => i.status !== 'unchanged')

      result.push({
        ...propObj,
        status: hasChanges ? 'modified' : 'unchanged',
        items,
      })
    }
  })

  original.forEach((origObj) => {
    const propObj = proposed.find((o) => o.id === origObj.id)
    if (!propObj) {
      result.push({
        ...origObj,
        status: 'deleted',
        items: markBudgetItemsStatus(origObj.items, 'deleted'),
      })
    }
  })

  return result
}

function diffBudgetItems(
  original: BudgetItem[],
  proposed: BudgetItem[],
): BudgetItemDiff[] {
  const result: BudgetItemDiff[] = []

  proposed.forEach((propItem) => {
    const origItem = original.find(
      (o) => o.description.toLowerCase() === propItem.description.toLowerCase(),
    )

    if (!origItem) {
      result.push({
        ...propItem,
        status: 'added',
      })
    } else {
      const isModified =
        origItem.total !== propItem.total ||
        origItem.q1 !== propItem.q1 ||
        origItem.q2 !== propItem.q2 ||
        origItem.q3 !== propItem.q3 ||
        origItem.q4 !== propItem.q4

      result.push({
        ...propItem,
        status: isModified ? 'modified' : 'unchanged',
        originalValues: isModified
          ? {
              q1: origItem.q1,
              q2: origItem.q2,
              q3: origItem.q3,
              q4: origItem.q4,
              total: origItem.total,
            }
          : undefined,
      })
    }
  })

  original.forEach((origItem) => {
    const propItem = proposed.find(
      (p) => p.description.toLowerCase() === origItem.description.toLowerCase(),
    )
    if (!propItem) {
      result.push({
        ...origItem,
        status: 'deleted',
        originalValues: {
          q1: origItem.q1,
          q2: origItem.q2,
          q3: origItem.q3,
          q4: origItem.q4,
          total: origItem.total,
        },
      })
    }
  })

  return result
}

// Project scoped helpers
export function diffProjectGroups(
  original: ObjectGroup[],
  proposed: ObjectGroup[],
): ObjectGroupDiff[] {
  const result: ObjectGroupDiff[] = []

  proposed.forEach((propGroup) => {
    const origGroup = original.find((o) => o.id === propGroup.id)

    if (!origGroup) {
      result.push({
        ...propGroup,
        status: 'added',
        descriptionGroups: markDescGroupsStatus(propGroup.descriptionGroups, 'added'),
      })
    } else {
      const descGroups = diffDescGroups(origGroup.descriptionGroups, propGroup.descriptionGroups)
      const hasChanges = descGroups.some((d) => d.status !== 'unchanged')

      result.push({
        ...propGroup,
        status: hasChanges ? 'modified' : 'unchanged',
        descriptionGroups: descGroups,
      })
    }
  })

  original.forEach((origGroup) => {
    const propGroup = proposed.find((p) => p.id === origGroup.id)
    if (!propGroup) {
      result.push({
        ...origGroup,
        status: 'deleted',
        descriptionGroups: markDescGroupsStatus(origGroup.descriptionGroups, 'deleted'),
      })
    }
  })

  return result
}

function diffDescGroups(
  original: DescriptionGroup[],
  proposed: DescriptionGroup[],
): DescriptionGroupDiff[] {
  const result: DescriptionGroupDiff[] = []

  proposed.forEach((propDesc) => {
    const origDesc = original.find(
      (o) => o.description.toLowerCase() === propDesc.description.toLowerCase(),
    )

    if (!origDesc) {
      result.push({
        ...propDesc,
        status: 'added',
        items: markProjectItemsStatus(propDesc.items, 'added'),
      })
    } else {
      const items = diffProjectItems(origDesc.items, propDesc.items)
      const hasChanges = items.some((i) => i.status !== 'unchanged')

      result.push({
        ...propDesc,
        status: hasChanges ? 'modified' : 'unchanged',
        items,
      })
    }
  })

  original.forEach((origDesc) => {
    const propDesc = proposed.find(
      (p) => p.description.toLowerCase() === origDesc.description.toLowerCase(),
    )
    if (!propDesc) {
      result.push({
        ...origDesc,
        status: 'deleted',
        items: markProjectItemsStatus(origDesc.items, 'deleted'),
      })
    }
  })

  return result
}

function diffProjectItems(
  original: ProjectItem[],
  proposed: ProjectItem[],
): ProjectItemDiff[] {
  const result: ProjectItemDiff[] = []

  proposed.forEach((propItem) => {
    const origItem = original.find(
      (o) => o.description.toLowerCase() === propItem.description.toLowerCase(),
    )

    if (!origItem) {
      result.push({
        ...propItem,
        status: 'added',
      })
    } else {
      const isModified =
        origItem.qty !== propItem.qty ||
        origItem.unitCost !== propItem.unitCost ||
        origItem.budget !== propItem.budget ||
        origItem.timelineType !== propItem.timelineType ||
        origItem.startDate !== propItem.startDate ||
        origItem.endDate !== propItem.endDate

      result.push({
        ...propItem,
        status: isModified ? 'modified' : 'unchanged',
        originalValues: isModified
          ? {
              qty: origItem.qty,
              unitCost: origItem.unitCost,
              budget: origItem.budget,
              timelineType: origItem.timelineType,
              startDate: origItem.startDate,
              endDate: origItem.endDate,
            }
          : undefined,
      })
    }
  })

  original.forEach((origItem) => {
    const propItem = proposed.find(
      (p) => p.description.toLowerCase() === origItem.description.toLowerCase(),
    )
    if (!propItem) {
      result.push({
        ...origItem,
        status: 'deleted',
        originalValues: {
          qty: origItem.qty,
          unitCost: origItem.unitCost,
          budget: origItem.budget,
          timelineType: origItem.timelineType,
          startDate: origItem.startDate,
          endDate: origItem.endDate,
        },
      })
    }
  })

  return result
}

// recursive marking helpers
function markExpTypesStatus(list: ExpenditureType[], status: DiffStatus): ExpenditureTypeDiff[] {
  return list.map((item) => ({
    ...item,
    status,
    itemsOfExpenditure: markItemsOfExpStatus(item.itemsOfExpenditure, status),
  }))
}

function markItemsOfExpStatus(list: ItemOfExpenditure[], status: DiffStatus): ItemOfExpenditureDiff[] {
  return list.map((item) => ({
    ...item,
    status,
    items: markBudgetItemsStatus(item.items, status),
  }))
}

function markBudgetItemsStatus(list: BudgetItem[], status: DiffStatus): BudgetItemDiff[] {
  return list.map((item) => ({
    ...item,
    status,
    originalValues:
      status === 'deleted'
        ? {
            q1: item.q1,
            q2: item.q2,
            q3: item.q3,
            q4: item.q4,
            total: item.total,
          }
        : undefined,
  }))
}

function markDescGroupsStatus(list: DescriptionGroup[], status: DiffStatus): DescriptionGroupDiff[] {
  return list.map((item) => ({
    ...item,
    status,
    items: markProjectItemsStatus(item.items, status),
  }))
}

function markProjectItemsStatus(list: ProjectItem[], status: DiffStatus): ProjectItemDiff[] {
  return list.map((item) => ({
    ...item,
    status,
    originalValues:
      status === 'deleted'
        ? {
            qty: item.qty,
            unitCost: item.unitCost,
            budget: item.budget,
            timelineType: item.timelineType,
            startDate: item.startDate,
            endDate: item.endDate,
          }
        : undefined,
  }))
}

export function getOriginalBudgetItemTotal(
  approvedActivities: Activity[],
  proposedItemId: string,
  proposedActivities?: Activity[],
): number | undefined {
  // If proposedActivities is not provided, we won't be able to map by ID.
  // In the cards, budgetItemId is passed.
  // But wait! If we have the description instead, we can match directly.
  // Since the card passes bItem.id (which is proposedItemId), we can first search
  // inside proposedActivities to get its description, then match in approvedActivities.
  // If proposedActivities is omitted, we assume proposedItemId is the description itself as fallback.
  let description = proposedItemId
  
  if (proposedActivities) {
    let found = false
    for (const act of proposedActivities) {
      for (const exp of act.expenditureTypes) {
        for (const ioe of exp.itemsOfExpenditure) {
          const item = ioe.items.find((i) => i.id === proposedItemId)
          if (item) {
            description = item.description
            found = true
            break
          }
        }
        if (found) break
      }
      if (found) break
    }
  }

  for (const act of approvedActivities) {
    for (const exp of act.expenditureTypes) {
      for (const ioe of exp.itemsOfExpenditure) {
        const item = ioe.items.find(
          (i) => i.id === proposedItemId || i.description.toLowerCase() === description.toLowerCase()
        )
        if (item) return item.total
      }
    }
  }

  return undefined
}

export function getOriginalProjectItemBudget(
  approvedProjectGroups: ObjectGroup[],
  proposedItemId: string,
  proposedProjectGroups?: ObjectGroup[],
): number | undefined {
  let description = proposedItemId

  if (proposedProjectGroups) {
    let found = false
    for (const group of proposedProjectGroups) {
      for (const dg of group.descriptionGroups) {
        const item = dg.items.find((i) => i.id === proposedItemId)
        if (item) {
          description = item.description
          found = true
          break
        }
      }
      if (found) break
    }
  }

  for (const group of approvedProjectGroups) {
    for (const dg of group.descriptionGroups) {
      const item = dg.items.find(
        (i) => i.id === proposedItemId || i.description.toLowerCase() === description.toLowerCase()
      )
      if (item) return item.budget
    }
  }

  return undefined
}
