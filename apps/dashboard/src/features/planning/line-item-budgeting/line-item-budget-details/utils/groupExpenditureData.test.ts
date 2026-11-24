import { describe, it, expect } from 'vitest'
import { groupExpenditureItems } from './groupExpenditureData'
import type { LineItemBudgetDetails } from '../types/types'

describe('groupExpenditureItems', () => {
  it('should group Level 1 by Type of Expenditure and Level 2 by Item of Expenditure, ignoring Activity Name for grouping', () => {
    const parentTypeId = 'type-ps-id'
    const childItemId = 'item-salaries-id'
    const activityId = 'act-cloud-infra-id'

    const mockItems: LineItemBudgetDetails[] = [
      {
        id: 'detail-q1',
        objectId: childItemId,
        object: {
          id: childItemId,
          name: 'Salaries and Wages',
          code: '5010101001',
          parentId: parentTypeId,
          parentObject: {
            id: parentTypeId,
            name: 'Personnel Services',
            code: '50100000',
          },
        },
        expenseClass: { id: parentTypeId, name: 'Personnel Services', code: '50100000', type: 'PS' },
        lineItemBudgetActivityId: activityId,
        lineItemBudgetActivity: {
          id: activityId,
          name: 'Cloud Infrastructure and Software Tooling Procurement',
        },
        description: 'Salaries and Wages - Q1',
        budget: 120000,
        timelineType: 'Quarterly',
        startDate: '2026-01-15T00:00:00Z',
        endDate: '2026-03-31T00:00:00Z',
      } as LineItemBudgetDetails,
      {
        id: 'detail-q3',
        objectId: childItemId,
        object: {
          id: childItemId,
          name: 'Salaries and Wages',
          code: '5010101001',
          parentId: parentTypeId,
          parentObject: {
            id: parentTypeId,
            name: 'Personnel Services',
            code: '50100000',
          },
        },
        expenseClass: { id: parentTypeId, name: 'Personnel Services', code: '50100000', type: 'PS' },
        lineItemBudgetActivityId: activityId,
        lineItemBudgetActivity: {
          id: activityId,
          name: 'Cloud Infrastructure and Software Tooling Procurement',
        },
        description: 'Salaries and Wages - Q3',
        budget: 120000,
        timelineType: 'Quarterly',
        startDate: '2026-07-01T00:00:00Z',
        endDate: '2026-09-30T00:00:00Z',
      } as LineItemBudgetDetails,
      {
        id: 'detail-q4',
        objectId: childItemId,
        object: {
          id: childItemId,
          name: 'Salaries and Wages',
          code: '5010101001',
          parentId: parentTypeId,
          parentObject: {
            id: parentTypeId,
            name: 'Personnel Services',
            code: '50100000',
          },
        },
        expenseClass: { id: parentTypeId, name: 'Personnel Services', code: '50100000', type: 'PS' },
        lineItemBudgetActivityId: activityId,
        lineItemBudgetActivity: {
          id: activityId,
          name: 'Cloud Infrastructure and Software Tooling Procurement',
        },
        description: 'Salaries and Wages - Q4',
        budget: 120000,
        timelineType: 'Quarterly',
        startDate: '2026-10-01T00:00:00Z',
        endDate: '2026-12-31T00:00:00Z',
      } as LineItemBudgetDetails,
    ]

    const result = groupExpenditureItems(mockItems)

    expect(result).toHaveLength(1)

    // Level 1: Type of Expenditure
    const psType = result[0]
    expect(psType.typeId).toBe(parentTypeId)
    expect(psType.typeName).toBe('Personnel Services')
    expect(psType.typeCode).toBe('50100000')
    expect(psType.typeTotal).toBe(360000)
    expect(psType.itemCount).toBe(1)
    expect(psType.allocationCount).toBe(3)

    // Level 2: Item of Expenditure (MUST be "Salaries and Wages", NOT Activity Name)
    expect(psType.items).toHaveLength(1)
    const salariesItem = psType.items[0]
    expect(salariesItem.itemId).toBe(childItemId)
    expect(salariesItem.itemName).toBe('Salaries and Wages')
    expect(salariesItem.itemCode).toBe('5010101001')
    expect(salariesItem.itemTotal).toBe(360000)
    expect(salariesItem.allocationCount).toBe(3)
    expect(salariesItem.q1.budget).toBe(120000)
    expect(salariesItem.q2.budget).toBeNull()
    expect(salariesItem.q3.budget).toBe(120000)
    expect(salariesItem.q4.budget).toBe(120000)
    expect(salariesItem.total).toBe(360000)

    // Level 3: Allocations
    expect(salariesItem.allocations).toHaveLength(3)
    expect(salariesItem.allocations[0].id).toBe('detail-q1')
    expect(salariesItem.allocations[1].id).toBe('detail-q3')
    expect(salariesItem.allocations[2].id).toBe('detail-q4')
  })

  it('should support multiple Items of Expenditure under the same Type of Expenditure', () => {
    const parentTypeId = 'type-ps-id'
    const salariesId = 'item-salaries'
    const benefitsId = 'item-benefits'

    const mockItems: LineItemBudgetDetails[] = [
      {
        id: 'sal-1',
        objectId: salariesId,
        object: {
          id: salariesId,
          name: 'Salaries and Wages',
          code: '5010101001',
          parentObject: { id: parentTypeId, name: 'Personnel Services', code: '50100000' },
        },
        budget: 480000,
        timelineType: 'Quarterly',
        startDate: '2026-01-01',
      } as LineItemBudgetDetails,
      {
        id: 'ben-1',
        objectId: benefitsId,
        object: {
          id: benefitsId,
          name: 'Other Compensation',
          code: '5010102000',
          parentObject: { id: parentTypeId, name: 'Personnel Services', code: '50100000' },
        },
        budget: 120000,
        timelineType: 'Quarterly',
        startDate: '2026-10-01',
      } as LineItemBudgetDetails,
    ]

    const result = groupExpenditureItems(mockItems)

    expect(result).toHaveLength(1)
    const psType = result[0]
    expect(psType.typeName).toBe('Personnel Services')
    expect(psType.typeTotal).toBe(600000)
    expect(psType.itemCount).toBe(2)
    expect(psType.allocationCount).toBe(2)

    expect(psType.items[0].itemName).toBe('Salaries and Wages')
    expect(psType.items[0].q1.budget).toBe(480000)
    expect(psType.items[0].total).toBe(480000)

    expect(psType.items[1].itemName).toBe('Other Compensation')
    expect(psType.items[1].q4.budget).toBe(120000)
    expect(psType.items[1].total).toBe(120000)
  })

  it('should group distinct Parent Categories (PS, MOOE, CO) as separate Level 1 parent groups', () => {
    const psId = 'type-ps'
    const mooeId = 'type-mooe'
    const coId = 'type-co'

    const mockItems: LineItemBudgetDetails[] = [
      {
        id: 'ps-1',
        objectId: 'salaries-id',
        object: { id: 'salaries-id', name: 'Salaries and Wages', code: '5010101001' },
        expenseClass: { id: psId, name: 'Personnel Services', code: '50100000', type: 'PS' },
        budget: 100000,
        timelineType: 'Quarterly',
        startDate: '2026-01-15T00:00:00Z',
      } as LineItemBudgetDetails,
      {
        id: 'mooe-1',
        objectId: 'training-id',
        object: { id: 'training-id', name: 'Training and Scholarship Expenses', code: '5020201000' },
        expenseClass: { id: mooeId, name: 'Maintenance and Other Operating Expenses', code: '50200000', type: 'MOOE' },
        budget: 50000,
        timelineType: 'Quarterly',
        startDate: '2026-04-15T00:00:00Z',
      } as LineItemBudgetDetails,
      {
        id: 'co-1',
        objectId: 'equipment-id',
        object: { id: 'equipment-id', name: 'IT Equipment and Software', code: '5060405000' },
        expenseClass: { id: coId, name: 'Capital Outlays', code: '50600000', type: 'CO' },
        budget: 200000,
        timelineType: 'Quarterly',
        startDate: '2026-07-15T00:00:00Z',
      } as LineItemBudgetDetails,
    ]

    const result = groupExpenditureItems(mockItems)

    expect(result).toHaveLength(3)
    expect(result.map((g) => g.typeName)).toEqual([
      'Personnel Services',
      'Maintenance and Other Operating Expenses',
      'Capital Outlays',
    ])
    expect(result[0].typeTotal).toBe(100000)
    expect(result[1].typeTotal).toBe(50000)
    expect(result[2].typeTotal).toBe(200000)
  })

  it('should aggregate multiple details for the same Item of Expenditure across quarters without creating duplicate rows', () => {
    const mooeId = 'type-mooe'
    const trainingId = 'item-training'

    const mockItems: LineItemBudgetDetails[] = [
      {
        id: 'detail-1',
        objectId: trainingId,
        object: { id: trainingId, name: 'Training and Scholarship Expenses', code: '5020201000' },
        expenseClass: { id: mooeId, name: 'Maintenance and Other Operating Expenses', code: '50200000', type: 'MOOE' },
        budget: 5000,
        timelineType: 'Quarterly',
        startDate: '2026-01-10T00:00:00Z',
      } as LineItemBudgetDetails,
      {
        id: 'detail-2',
        objectId: trainingId,
        object: { id: trainingId, name: 'Training and Scholarship Expenses', code: '5020201000' },
        expenseClass: { id: mooeId, name: 'Maintenance and Other Operating Expenses', code: '50200000', type: 'MOOE' },
        budget: 5000,
        timelineType: 'Quarterly',
        startDate: '2026-02-15T00:00:00Z',
      } as LineItemBudgetDetails,
      {
        id: 'detail-3',
        objectId: trainingId,
        object: { id: trainingId, name: 'Training and Scholarship Expenses', code: '5020201000' },
        expenseClass: { id: mooeId, name: 'Maintenance and Other Operating Expenses', code: '50200000', type: 'MOOE' },
        budget: 10000,
        timelineType: 'Quarterly',
        startDate: '2026-04-10T00:00:00Z',
      } as LineItemBudgetDetails,
      {
        id: 'detail-4',
        objectId: trainingId,
        object: { id: trainingId, name: 'Training and Scholarship Expenses', code: '5020201000' },
        expenseClass: { id: mooeId, name: 'Maintenance and Other Operating Expenses', code: '50200000', type: 'MOOE' },
        budget: 10000,
        timelineType: 'Quarterly',
        startDate: '2026-05-20T00:00:00Z',
      } as LineItemBudgetDetails,
    ]

    const result = groupExpenditureItems(mockItems)

    expect(result).toHaveLength(1)
    const mooeGroup = result[0]
    expect(mooeGroup.items).toHaveLength(1) // Exactly ONE item row!

    const trainingRow = mooeGroup.items[0]
    expect(trainingRow.itemName).toBe('Training and Scholarship Expenses')
    expect(trainingRow.q1.budget).toBe(10000) // 5000 + 5000
    expect(trainingRow.q2.budget).toBe(20000) // 10000 + 10000
    expect(trainingRow.q3.budget).toBeNull()
    expect(trainingRow.q4.budget).toBeNull()
    expect(trainingRow.total).toBe(30000)
    expect(mooeGroup.typeTotal).toBe(30000)
    expect(trainingRow.allocations).toHaveLength(4)
    expect(trainingRow.allocations.map((a) => a.id)).toEqual(['detail-1', 'detail-2', 'detail-3', 'detail-4'])
  })

  it('should keep distinct items (Training, Travelling, Communication) separate within the same parent category', () => {
    const mooeId = 'type-mooe'

    const mockItems: LineItemBudgetDetails[] = [
      {
        id: 'train-1',
        objectId: 'obj-training',
        object: { id: 'obj-training', name: 'Training and Scholarship Expenses' },
        expenseClass: { id: mooeId, name: 'Maintenance and Other Operating Expenses' },
        budget: 50000,
        timelineType: 'Quarterly',
        startDate: '2026-01-01',
      } as LineItemBudgetDetails,
      {
        id: 'travel-1',
        objectId: 'obj-travel',
        object: { id: 'obj-travel', name: 'Travelling Expenses' },
        expenseClass: { id: mooeId, name: 'Maintenance and Other Operating Expenses' },
        budget: 10000,
        timelineType: 'Quarterly',
        startDate: '2026-01-01',
      } as LineItemBudgetDetails,
      {
        id: 'comm-1',
        objectId: 'obj-comm',
        object: { id: 'obj-comm', name: 'Communication Expenses' },
        expenseClass: { id: mooeId, name: 'Maintenance and Other Operating Expenses' },
        budget: 15000,
        timelineType: 'Quarterly',
        startDate: '2026-01-01',
      } as LineItemBudgetDetails,
    ]

    const result = groupExpenditureItems(mockItems)

    expect(result).toHaveLength(1)
    const items = result[0].items
    expect(items).toHaveLength(3)
    expect(items.map((i) => i.itemName)).toEqual([
      'Training and Scholarship Expenses',
      'Travelling Expenses',
      'Communication Expenses',
    ])
    expect(result[0].typeTotal).toBe(75000)
  })

  it('should not merge distinct items that share the same display name if their authoritative objectId differs', () => {
    const mooeId = 'type-mooe'

    const mockItems: LineItemBudgetDetails[] = [
      {
        id: 'detail-a',
        objectId: 'obj-uuid-1',
        object: { id: 'obj-uuid-1', name: 'Supplies and Materials', code: '5020301000' },
        expenseClass: { id: mooeId, name: 'Maintenance and Other Operating Expenses' },
        budget: 10000,
        timelineType: 'Quarterly',
        startDate: '2026-01-01',
      } as LineItemBudgetDetails,
      {
        id: 'detail-b',
        objectId: 'obj-uuid-2',
        object: { id: 'obj-uuid-2', name: 'Supplies and Materials', code: '5020302000' },
        expenseClass: { id: mooeId, name: 'Maintenance and Other Operating Expenses' },
        budget: 20000,
        timelineType: 'Quarterly',
        startDate: '2026-01-01',
      } as LineItemBudgetDetails,
    ]

    const result = groupExpenditureItems(mockItems)

    expect(result).toHaveLength(1)
    expect(result[0].items).toHaveLength(2)
    expect(result[0].items[0].itemId).toBe('obj-uuid-1')
    expect(result[0].items[1].itemId).toBe('obj-uuid-2')
  })

  it('should not force monthly allocations into quarterly columns', () => {
    const psId = 'type-ps'

    const mockItems: LineItemBudgetDetails[] = [
      {
        id: 'month-1',
        objectId: 'salaries-id',
        object: { id: 'salaries-id', name: 'Salaries and Wages' },
        expenseClass: { id: psId, name: 'Personnel Services' },
        budget: 40000,
        timelineType: 'monthly',
        startDate: '2026-01-15',
      } as LineItemBudgetDetails,
    ]

    const result = groupExpenditureItems(mockItems)

    expect(result).toHaveLength(1)
    const row = result[0].items[0]
    expect(row.q1.budget).toBeNull()
    expect(row.q2.budget).toBeNull()
    expect(row.q3.budget).toBeNull()
    expect(row.q4.budget).toBeNull()
    expect(row.total).toBe(40000)
  })

  it('should correctly transform real API response data with null expenseClass and direct parent category allocations', () => {
    // Exact shape from real API data provided by user
    const realApiItems: LineItemBudgetDetails[] = [
      // 1. Personnel Services - Salary for Justine (4 quarterly allocations)
      {
        id: 'ps-q1',
        objectId: '019ffab5-cd89-7f95-aeaa-473b0e7d5399',
        description: 'Salary for Justine',
        timelineType: 'quarterly',
        startDate: '2025-12-31T16:00:00Z',
        endDate: '2026-03-30T16:00:00Z',
        budget: 120000,
        lineItemBudgetActivity: { name: 'Industry-Academe Partnership Symposium' },
        object: {
          id: '019ffab5-cd89-7f95-aeaa-473b0e7d5399',
          name: 'Personnel Services',
          code: '50100000',
        },
        expenseClass: null as any,
      } as LineItemBudgetDetails,
      {
        id: 'ps-q2',
        objectId: '019ffab5-cd89-7f95-aeaa-473b0e7d5399',
        description: 'Salary for Justine',
        timelineType: 'quarterly',
        startDate: '2026-03-31T16:00:00Z',
        endDate: '2026-06-29T16:00:00Z',
        budget: 120000,
        lineItemBudgetActivity: { name: 'Industry-Academe Partnership Symposium' },
        object: {
          id: '019ffab5-cd89-7f95-aeaa-473b0e7d5399',
          name: 'Personnel Services',
          code: '50100000',
        },
        expenseClass: null as any,
      } as LineItemBudgetDetails,
      {
        id: 'ps-q3',
        objectId: '019ffab5-cd89-7f95-aeaa-473b0e7d5399',
        description: 'Salary for Justine',
        timelineType: 'quarterly',
        startDate: '2026-06-30T16:00:00Z',
        endDate: '2026-09-29T16:00:00Z',
        budget: 120000,
        lineItemBudgetActivity: { name: 'Industry-Academe Partnership Symposium' },
        object: {
          id: '019ffab5-cd89-7f95-aeaa-473b0e7d5399',
          name: 'Personnel Services',
          code: '50100000',
        },
        expenseClass: null as any,
      } as LineItemBudgetDetails,
      {
        id: 'ps-q4',
        objectId: '019ffab5-cd89-7f95-aeaa-473b0e7d5399',
        description: 'Salary for Justine',
        timelineType: 'quarterly',
        startDate: '2026-09-30T16:00:00Z',
        endDate: '2026-12-30T16:00:00Z',
        budget: 120000,
        lineItemBudgetActivity: { name: 'Industry-Academe Partnership Symposium' },
        object: {
          id: '019ffab5-cd89-7f95-aeaa-473b0e7d5399',
          name: 'Personnel Services',
          code: '50100000',
        },
        expenseClass: null as any,
      } as LineItemBudgetDetails,

      // 2. MOOE - Supplies and Materials Expenses (4 quarterly allocations)
      {
        id: 'supplies-q1',
        objectId: 'supplies-id',
        description: 'Supplies and Materials Expenses',
        timelineType: 'quarterly',
        startDate: '2025-12-31T16:00:00Z',
        budget: 15000,
        object: {
          id: 'supplies-id',
          name: 'Supplies and Materials Expenses',
          code: '5020301000',
          parentObject: { id: 'mooe-id', name: 'Maintenance and Other Operating Expenses', code: '50200000' },
        },
        expenseClass: null as any,
      } as LineItemBudgetDetails,
      {
        id: 'supplies-q2',
        objectId: 'supplies-id',
        description: 'Supplies and Materials Expenses',
        timelineType: 'quarterly',
        startDate: '2026-03-31T16:00:00Z',
        budget: 20000,
        object: {
          id: 'supplies-id',
          name: 'Supplies and Materials Expenses',
          code: '5020301000',
          parentObject: { id: 'mooe-id', name: 'Maintenance and Other Operating Expenses', code: '50200000' },
        },
        expenseClass: null as any,
      } as LineItemBudgetDetails,
      {
        id: 'supplies-q3',
        objectId: 'supplies-id',
        description: 'Supplies and Materials Expenses',
        timelineType: 'quarterly',
        startDate: '2026-06-30T16:00:00Z',
        budget: 20000,
        object: {
          id: 'supplies-id',
          name: 'Supplies and Materials Expenses',
          code: '5020301000',
          parentObject: { id: 'mooe-id', name: 'Maintenance and Other Operating Expenses', code: '50200000' },
        },
        expenseClass: null as any,
      } as LineItemBudgetDetails,
      {
        id: 'supplies-q4',
        objectId: 'supplies-id',
        description: 'Supplies and Materials Expenses',
        timelineType: 'quarterly',
        startDate: '2026-09-30T16:00:00Z',
        budget: 20000,
        object: {
          id: 'supplies-id',
          name: 'Supplies and Materials Expenses',
          code: '5020301000',
          parentObject: { id: 'mooe-id', name: 'Maintenance and Other Operating Expenses', code: '50200000' },
        },
        expenseClass: null as any,
      } as LineItemBudgetDetails,

      // 3. MOOE - Training and Scholarship Expenses (2 allocations in Q3)
      {
        id: 'training-q3a',
        objectId: 'training-id',
        description: 'Training and Scholarship Expenses',
        timelineType: 'quarterly',
        startDate: '2026-06-30T16:00:00Z',
        budget: 10000,
        object: {
          id: 'training-id',
          name: 'Training and Scholarship Expenses',
          code: '5020201000',
          parentObject: { id: 'mooe-id', name: 'Maintenance and Other Operating Expenses', code: '50200000' },
        },
        expenseClass: null as any,
      } as LineItemBudgetDetails,
      {
        id: 'training-q3b',
        objectId: 'training-id',
        description: 'Training and Scholarship Expenses',
        timelineType: 'quarterly',
        startDate: '2026-07-15T00:00:00Z',
        budget: 10000,
        object: {
          id: 'training-id',
          name: 'Training and Scholarship Expenses',
          code: '5020201000',
          parentObject: { id: 'mooe-id', name: 'Maintenance and Other Operating Expenses', code: '50200000' },
        },
        expenseClass: null as any,
      } as LineItemBudgetDetails,
    ]

    const result = groupExpenditureItems(realApiItems)

    expect(result).toHaveLength(2)

    // Group 1: Personnel Services
    const psGroup = result.find((g) => g.typeName === 'Personnel Services')!
    expect(psGroup).toBeDefined()
    expect(psGroup.typeTotal).toBe(480000)
    expect(psGroup.items).toHaveLength(1)
    expect(psGroup.items[0].itemName).toBe('Salary for Justine')
    expect(psGroup.items[0].q1.budget).toBe(120000)
    expect(psGroup.items[0].q2.budget).toBe(120000)
    expect(psGroup.items[0].q3.budget).toBe(120000)
    expect(psGroup.items[0].q4.budget).toBe(120000)
    expect(psGroup.items[0].total).toBe(480000)

    // Group 2: MOOE
    const mooeGroup = result.find((g) => g.typeName === 'Maintenance and Other Operating Expenses')!
    expect(mooeGroup).toBeDefined()
    expect(mooeGroup.typeTotal).toBe(95000) // 75k + 20k
    expect(mooeGroup.items).toHaveLength(2)

    const suppliesRow = mooeGroup.items.find((i) => i.itemName === 'Supplies and Materials Expenses')!
    expect(suppliesRow).toBeDefined()
    expect(suppliesRow.q1.budget).toBe(15000)
    expect(suppliesRow.q2.budget).toBe(20000)
    expect(suppliesRow.q3.budget).toBe(20000)
    expect(suppliesRow.q4.budget).toBe(20000)
    expect(suppliesRow.total).toBe(75000)

    const trainingRow = mooeGroup.items.find((i) => i.itemName === 'Training and Scholarship Expenses')!
    expect(trainingRow).toBeDefined()
    expect(trainingRow.q1.budget).toBeNull()
    expect(trainingRow.q2.budget).toBeNull()
    expect(trainingRow.q3.budget).toBe(20000) // 10k + 10k summed!
    expect(trainingRow.q4.budget).toBeNull()
    expect(trainingRow.total).toBe(20000)
  })

  it('correctly aggregates multi-period manual LIB expenditures (Sep 2026 - Feb 2027) with PS -> Salaries and Wages hierarchy', () => {
    const parentTypeId = 'ps-parent-id'
    const salariesObjectId = 'salaries-object-id'
    const mockManualItems: LineItemBudgetDetails[] = [
      {
        id: 'detail-q3-2026',
        objectId: salariesObjectId,
        description:
          'Project Technical Assistant (Mechanical Engineer) for 6 months',
        timelineType: 'Quarterly',
        startDate: '2026-09-15T00:00:00Z',
        endDate: '2026-09-30T00:00:00Z',
        budget: 35000,
        unitQuantity: 6,
        unitCost: 35000,
        object: {
          id: salariesObjectId,
          name: 'Salaries and Wages',
          code: '5010101000',
          parentId: parentTypeId,
          parentObject: {
            id: parentTypeId,
            name: 'Personnel Services',
            code: '50100000',
          },
        },
      } as LineItemBudgetDetails,
      {
        id: 'detail-q4-2026',
        objectId: salariesObjectId,
        description:
          'Project Technical Assistant (Mechanical Engineer) for 6 months',
        timelineType: 'Quarterly',
        startDate: '2026-10-01T00:00:00Z',
        endDate: '2026-12-31T00:00:00Z',
        budget: 105000,
        object: {
          id: salariesObjectId,
          name: 'Salaries and Wages',
          code: '5010101000',
          parentId: parentTypeId,
          parentObject: {
            id: parentTypeId,
            name: 'Personnel Services',
            code: '50100000',
          },
        },
      } as LineItemBudgetDetails,
      {
        id: 'detail-q1-2027',
        objectId: salariesObjectId,
        description:
          'Project Technical Assistant (Mechanical Engineer) for 6 months',
        timelineType: 'Quarterly',
        startDate: '2027-01-01T00:00:00Z',
        endDate: '2027-02-10T00:00:00Z',
        budget: 70000,
        object: {
          id: salariesObjectId,
          name: 'Salaries and Wages',
          code: '5010101000',
          parentId: parentTypeId,
          parentObject: {
            id: parentTypeId,
            name: 'Personnel Services',
            code: '50100000',
          },
        },
      } as LineItemBudgetDetails,
    ]

    const result = groupExpenditureItems(mockManualItems)

    expect(result).toHaveLength(1)
    const psGroup = result[0]
    expect(psGroup.typeName).toBe('Personnel Services')
    expect(psGroup.typeCode).toBe('50100000')
    expect(psGroup.typeTotal).toBe(210000)
    expect(psGroup.items).toHaveLength(1)

    const itemRow = psGroup.items[0]
    expect(itemRow.itemName).toBe('Salaries and Wages')
    expect(itemRow.total).toBe(210000)
    expect(itemRow.allocationCount).toBe(3)
    expect(itemRow.quantity).toBe(6)
    expect(itemRow.unitCost).toBe(35000)
    expect(itemRow.groupName).toContain('Project Technical Assistant (Mechanical Engineer) for 6 months')
    expect(itemRow.groupName).toContain('Qty: 6')
    expect(itemRow.groupName).toContain('Unit Cost: ₱35,000.00')

    // Period matrix checks
    expect(itemRow.q3.budget).toBe(35000)
    expect(itemRow.q4.budget).toBe(105000)
    expect(itemRow.q1.budget).toBe(70000)
  })

  it('keeps distinct manual items sharing the same parent UACS category separate under Personnel Services', () => {
    const parentTypeId = 'ps-parent-id'
    const salariesObjectId = 'salaries-object-id'
    const items: LineItemBudgetDetails[] = [
      {
        id: 'item-1-q1',
        objectId: salariesObjectId,
        description: 'Technical Assistant A',
        timelineType: 'Quarterly',
        startDate: '2026-01-01T00:00:00Z',
        budget: 50000,
        object: {
          id: salariesObjectId,
          name: 'Salaries and Wages',
          code: '5010101000',
          parentObject: { id: parentTypeId, name: 'Personnel Services', code: '50100000' },
        },
      } as LineItemBudgetDetails,
      {
        id: 'item-2-q1',
        objectId: salariesObjectId,
        description: 'Technical Assistant B',
        timelineType: 'Quarterly',
        startDate: '2026-01-01T00:00:00Z',
        budget: 60000,
        object: {
          id: salariesObjectId,
          name: 'Salaries and Wages',
          code: '5010101000',
          parentObject: { id: parentTypeId, name: 'Personnel Services', code: '50100000' },
        },
      } as LineItemBudgetDetails,
    ]

    const result = groupExpenditureItems(items)
    expect(result).toHaveLength(1)
    expect(result[0].typeName).toBe('Personnel Services')
    expect(result[0].items).toHaveLength(2)
    expect(result[0].items[0].groupName).toContain('Technical Assistant A')
    expect(result[0].items[1].groupName).toContain('Technical Assistant B')
    expect(result[0].typeTotal).toBe(110000)
  })

  it('correctly handles MOOE and CO hierarchies with child expenditure items and manual descriptions', () => {
    const mooeTypeId = 'mooe-type-id'
    const coTypeId = 'co-type-id'

    const items: LineItemBudgetDetails[] = [
      {
        id: 'mooe-item-1',
        objectId: 'travel-id',
        description: 'Local project site inspection travels',
        timelineType: 'Quarterly',
        startDate: '2026-04-01T00:00:00Z',
        budget: 45000,
        object: {
          id: 'travel-id',
          name: 'Traveling Expenses',
          code: '50201000',
          parentObject: { id: mooeTypeId, name: 'Maintenance and Other Operating Expenses', code: '50200000' },
        },
      } as LineItemBudgetDetails,
      {
        id: 'co-item-1',
        objectId: 'ppe-id',
        description: 'High-performance computing workstation for CAD modeling',
        timelineType: 'Quarterly',
        startDate: '2026-07-01T00:00:00Z',
        budget: 150000,
        unitQuantity: 1,
        unitCost: 150000,
        object: {
          id: 'ppe-id',
          name: 'Property, Plant and Equipment Outlay',
          code: '50604000',
          parentObject: { id: coTypeId, name: 'Capital Outlay', code: '50600000' },
        },
      } as LineItemBudgetDetails,
    ]

    const result = groupExpenditureItems(items)
    expect(result).toHaveLength(2)

    const mooe = result.find((g) => g.typeName === 'Maintenance and Other Operating Expenses')!
    expect(mooe).toBeDefined()
    expect(mooe.typeTotal).toBe(45000)
    expect(mooe.items[0].itemName).toBe('Traveling Expenses')
    expect(mooe.items[0].groupName).toContain('Local project site inspection travels')

    const co = result.find((g) => g.typeName === 'Capital Outlay')!
    expect(co).toBeDefined()
    expect(co.typeTotal).toBe(150000)
    expect(co.items[0].itemName).toBe('Property, Plant and Equipment Outlay')
    expect(co.items[0].quantity).toBe(1)
    expect(co.items[0].unitCost).toBe(150000)
    expect(co.items[0].groupName).toContain('High-performance computing workstation for CAD modeling')
    expect(co.items[0].groupName).toContain('Qty: 1')
    expect(co.items[0].groupName).toContain('Unit Cost: ₱150,000.00')
  })

  it('should accurately resolve year-aware period columns (2026-Q3, 2026-Q4, 2027-Q1) and preserve distinct period allocations for multi-year projects', () => {
    const parentTypeId = 'type-ps-id'
    const salariesItemId = 'salaries-id'
    const desc = 'Project Technical Assistant (Mechanical Engineer) for 6 months to oversee prototype fabrication'

    const crossYearItems: LineItemBudgetDetails[] = [
      {
        id: 'slice-q3-2026',
        objectId: salariesItemId,
        description: desc,
        timelineType: 'Quarterly',
        startDate: '2026-09-01T00:00:00Z',
        endDate: '2026-09-30T00:00:00Z',
        budget: 35000,
        unitQuantity: 6,
        unitCost: 35000,
        object: {
          id: salariesItemId,
          name: 'Salaries and Wages',
          code: '50101000',
          parentObject: { id: parentTypeId, name: 'Personnel Services', code: '50100000' },
        },
      } as LineItemBudgetDetails,
      {
        id: 'slice-q4-2026',
        objectId: salariesItemId,
        description: desc,
        timelineType: 'Quarterly',
        startDate: '2026-10-01T00:00:00Z',
        endDate: '2026-12-31T00:00:00Z',
        budget: 105000,
        object: {
          id: salariesItemId,
          name: 'Salaries and Wages',
          code: '50101000',
          parentObject: { id: parentTypeId, name: 'Personnel Services', code: '50100000' },
        },
      } as LineItemBudgetDetails,
      {
        id: 'slice-q1-2027',
        objectId: salariesItemId,
        description: desc,
        timelineType: 'Quarterly',
        startDate: '2027-01-01T00:00:00Z',
        endDate: '2027-03-31T00:00:00Z',
        budget: 70000,
        object: {
          id: salariesItemId,
          name: 'Salaries and Wages',
          code: '50101000',
          parentObject: { id: parentTypeId, name: 'Personnel Services', code: '50100000' },
        },
      } as LineItemBudgetDetails,
    ]

    const result = groupExpenditureItems(crossYearItems)
    expect(result).toHaveLength(1)

    const psGroup = result[0]
    expect(psGroup.typeName).toBe('Personnel Services')
    expect(psGroup.typeTotal).toBe(210000)

    // Verify columns derived
    expect(psGroup.columns).toHaveLength(3)
    expect(psGroup.columns.map((c) => c.key)).toEqual(['2026-Q3', '2026-Q4', '2027-Q1'])
    expect(psGroup.columns.map((c) => c.fullLabel)).toEqual(['2026 Q3', '2026 Q4', '2027 Q1'])

    // Verify logical line item row
    expect(psGroup.items).toHaveLength(1)
    const row = psGroup.items[0]
    expect(row.itemName).toBe('Salaries and Wages')
    expect(row.total).toBe(210000)
    expect(row.quantity).toBe(6)
    expect(row.unitCost).toBe(35000)

    // Verify periodAmounts map
    expect(row.periodAmounts['2026-Q3'].budget).toBe(35000)
    expect(row.periodAmounts['2026-Q4'].budget).toBe(105000)
    expect(row.periodAmounts['2027-Q1'].budget).toBe(70000)
    expect(row.periodAmounts['2026-Q1']?.budget).toBeUndefined()
  })

  it('should never merge allocations with the same quarter number from different years', () => {
    const parentTypeId = 'type-mooe-id'
    const travelId = 'travel-id'

    const crossYearTravel: LineItemBudgetDetails[] = [
      {
        id: 'travel-q1-2026',
        objectId: travelId,
        description: 'Field inspection',
        timelineType: 'Quarterly',
        startDate: '2026-01-15T00:00:00Z',
        endDate: '2026-03-31T00:00:00Z',
        budget: 25000,
        object: {
          id: travelId,
          name: 'Traveling Expenses',
          code: '50201000',
          parentObject: { id: parentTypeId, name: 'Maintenance and Other Operating Expenses', code: '50200000' },
        },
      } as LineItemBudgetDetails,
      {
        id: 'travel-q1-2027',
        objectId: travelId,
        description: 'Field inspection',
        timelineType: 'Quarterly',
        startDate: '2027-01-15T00:00:00Z',
        endDate: '2027-03-31T00:00:00Z',
        budget: 35000,
        object: {
          id: travelId,
          name: 'Traveling Expenses',
          code: '50201000',
          parentObject: { id: parentTypeId, name: 'Maintenance and Other Operating Expenses', code: '50200000' },
        },
      } as LineItemBudgetDetails,
    ]

    const result = groupExpenditureItems(crossYearTravel)
    const group = result[0]

    // 2026-Q1 to 2027-Q1 spans: 2026-Q1, 2026-Q2, 2026-Q3, 2026-Q4, 2027-Q1 (5 quarters)
    expect(group.columns).toHaveLength(5)
    expect(group.columns.map((c) => c.key)).toEqual([
      '2026-Q1',
      '2026-Q2',
      '2026-Q3',
      '2026-Q4',
      '2027-Q1',
    ])

    const row = group.items[0]
    expect(row.total).toBe(60000)
    expect(row.periodAmounts['2026-Q1'].budget).toBe(25000)
    expect(row.periodAmounts['2027-Q1'].budget).toBe(35000)
    expect(row.periodAmounts['2026-Q2'].budget).toBeNull()
  })
})
