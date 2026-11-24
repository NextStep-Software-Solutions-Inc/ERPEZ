import type {
  Activity as FrontendActivity,
  ExpenditureType as FrontendExpenditureType,
  ItemOfExpenditure as FrontendItemOfExpenditure,
  BudgetItem as FrontendBudgetItem,
  ObjectGroup as FrontendObjectGroup,
  DescriptionGroup as FrontendDescriptionGroup,
  ProjectItem as FrontendProjectItem,
} from '../types/realignment.types'
import type {
  LIBActivity,
  OrphanLineItemDetail,
} from '../../line-item-budget/types'
import { LineItemBudgetDetails } from '../../line-item-budget-details/types/types'

/**
 * Adapter to translate flat API LIBActivity[] into nested Frontend Activity[] tree.
 * Distributes the total budget evenly across the 4 quarters (Q1-Q4).
 */
export function adaptApiActivitiesToFrontend(
  apiActivities: LIBActivity[],
): FrontendActivity[] {
  if (!apiActivities) return []

  return apiActivities.map((apiAct) => {
    const activityName =
      apiAct.name ||
      apiAct.wfpObjectiveActivity?.activityName ||
      apiAct.opcrActivity?.name ||
      'Unnamed Activity'

    // Group backend details by expense class type (PS, MOOE, CO)
    const details = apiAct.details || []
    const expTypeMap = new Map<string, LineItemBudgetDetails[]>()

    details.forEach((detail) => {
      const typeRaw = detail.expenseClass
      const type =
        (typeof typeRaw === 'object' ? typeRaw?.type : typeRaw) || 'MOOE'

      if (!expTypeMap.has(type)) {
        expTypeMap.set(type, [])
      }
      expTypeMap.get(type)!.push(detail)
    })

    const expenditureTypes: FrontendExpenditureType[] = []

    expTypeMap.forEach((detailsList, type) => {
      // Group details under this expense class by UACS object ID
      const objectMap = new Map<string, LineItemBudgetDetails[]>()
      detailsList.forEach((detail) => {
        const objectId = detail.objectId || 'unknown-object'
        if (!objectMap.has(objectId)) {
          objectMap.set(objectId, [])
        }
        objectMap.get(objectId)!.push(detail)
      })

      const itemsOfExpenditure: FrontendItemOfExpenditure[] = []

      objectMap.forEach((objDetails, objectId) => {
        const objectName = objDetails[0].object?.name || 'Unnamed Object'

        // Group details under this object by item description / WFP expenditure ID
        const itemGroups = new Map<string, LineItemBudgetDetails[]>()

        objDetails.forEach((detail) => {
          const desc =
            detail.description ||
            detail.wfpObjectiveActivityExpenditure?.itemDescription ||
            objectName ||
            'No Description'
          const groupKey = detail.wfpObjectiveActivityExpenditureId
            ? `wfp-${detail.wfpObjectiveActivityExpenditureId}`
            : desc.trim().toLowerCase()

          if (!itemGroups.has(groupKey)) {
            itemGroups.set(groupKey, [])
          }
          itemGroups.get(groupKey)!.push(detail)
        })

        const items: FrontendBudgetItem[] = []

        itemGroups.forEach((groupDetails) => {
          const first = groupDetails[0]
          const description =
            first.description ||
            first.wfpObjectiveActivityExpenditure?.itemDescription ||
            objectName ||
            'No Description'

          let q1 = 0
          let q2 = 0
          let q3 = 0
          let q4 = 0
          const quarterDetailIds: {
            q1?: string
            q2?: string
            q3?: string
            q4?: string
          } = {}

          groupDetails.forEach((detail) => {
            const budget = detail.budget || 0
            if (detail.startDate) {
              const month = new Date(detail.startDate).getMonth()
              if (month >= 0 && month <= 2) {
                q1 += budget
                quarterDetailIds.q1 = detail.id
              } else if (month >= 3 && month <= 5) {
                q2 += budget
                quarterDetailIds.q2 = detail.id
              } else if (month >= 6 && month <= 8) {
                q3 += budget
                quarterDetailIds.q3 = detail.id
              } else if (month >= 9 && month <= 11) {
                q4 += budget
                quarterDetailIds.q4 = detail.id
              } else {
                q1 += budget
                quarterDetailIds.q1 = detail.id
              }
            } else {
              // Fallback: divide evenly if we can't determine period
              const qVal = budget / 4
              q1 += qVal
              q2 += qVal
              q3 += qVal
              q4 += qVal
            }
          })

          items.push({
            id: first.id,
            description,
            q1,
            q2,
            q3,
            q4,
            total: q1 + q2 + q3 + q4,
            isDeleted: false,
            detailIds: groupDetails.map((d) => d.id),
            quarterDetailIds,
          })
        })

        itemsOfExpenditure.push({
          id: objectId,
          name: objectName,
          items,
        })
      })

      const typeName =
        type === 'PS'
          ? 'Personnel Services (PS)'
          : type === 'CO'
            ? 'Capital Outlay (CO)'
            : 'Maintenance & Other Operating Expenses (MOOE)'

      expenditureTypes.push({
        id: `${apiAct.id}-${type}`,
        name: typeName,
        type: type as 'PS' | 'MOOE' | 'CO',
        itemsOfExpenditure,
      })
    })

    return {
      id: apiAct.id,
      name: activityName,
      wfpObjectiveActivityId: apiAct.wfpObjectiveActivityId,
      opcrActivityId: apiAct.opcrActivityId,
      expenditureTypes,
    }
  })
}

/**
 * Adapter to translate flat OrphanLineItemDetail[] into nested Frontend ObjectGroup[] tree.
 * Groups by object (UACS) first, and then by description.
 */
export function adaptApiOrphansToProjectGroups(
  orphans: OrphanLineItemDetail[],
): FrontendObjectGroup[] {
  if (!orphans) return []

  const objectMap = new Map<string, OrphanLineItemDetail[]>()

  // Group items by UACS object ID
  orphans.forEach((item) => {
    const objectId = item.objectId || 'unknown-object'
    if (!objectMap.has(objectId)) {
      objectMap.set(objectId, [])
    }
    objectMap.get(objectId)!.push(item)
  })

  const objectGroups: FrontendObjectGroup[] = []

  objectMap.forEach((itemsList, objectId) => {
    const firstItem = itemsList[0]
    const objectName = firstItem.object?.name || 'Unnamed Object'
    const objectCode = firstItem.object?.code || ''

    // Group items under this object by description
    const descMap = new Map<string, OrphanLineItemDetail[]>()
    itemsList.forEach((item) => {
      const desc = item.description || 'No Description'
      if (!descMap.has(desc)) {
        descMap.set(desc, [])
      }
      descMap.get(desc)!.push(item)
    })

    const descriptionGroups: FrontendDescriptionGroup[] = []

    descMap.forEach((groupItems, description) => {
      const items: FrontendProjectItem[] = groupItems.map((item) => ({
        id: item.id,
        description: item.description || 'No Description',
        qty: item.unitQuantity || 0,
        unitCost: item.unitCost || 0,
        budget: item.budget || 0,
        timelineType: item.timelineType === 'PERIOD' ? 'PERIOD' : 'ONGOING',
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        isDeleted: false,
      }))

      descriptionGroups.push({
        id: `${objectId}-${encodeURIComponent(description)}`,
        description,
        items,
      })
    })

    objectGroups.push({
      id: objectId,
      name: objectName,
      code: objectCode,
      descriptionGroups,
    })
  })

  return objectGroups
}
