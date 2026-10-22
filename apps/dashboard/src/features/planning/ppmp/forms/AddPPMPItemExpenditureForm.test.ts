import { describe, expect, it } from 'vitest'
import {
  ppmpExpenditureItemSchema,
  formatExpenditureDisplayName,
} from './AddPPMPItemExpenditureForm'
import type { LIBActivityObjectResponse } from '@/features/planning/line-item-budgeting/line-item-budget-details/handlers/getLIBActivityObjectsRequest'

describe('AddPPMPItemExpenditureForm schema and hierarchy resolution', () => {
  const mockActivityHierarchy: LIBActivityObjectResponse[] = [
    {
      parentObjectId: 'parent-ps-1',
      parentObjectCode: '50100000',
      parentObjectName: 'Personnel Services',
      items: [
        {
          id: 'child-salaries-1',
          code: '50101010',
          name: 'Salaries and Wages',
          totalBudget: 150000,
        },
      ],
    },
    {
      parentObjectId: 'parent-mooe-2',
      parentObjectCode: '50200000',
      parentObjectName: 'Maintenance and Other Operating Expenses',
      items: [
        {
          id: 'child-travel-2',
          code: '50201010',
          name: 'Travelling Expenses',
          totalBudget: 30000,
        },
        {
          id: 'child-training-3',
          code: '50202010',
          name: 'Training Expenses',
          totalBudget: 25000,
        },
      ],
    },
  ]

  it('validates successful form values when both parent type and child item are present', () => {
    const result = ppmpExpenditureItemSchema.safeParse({
      isProcurable: true,
      typeOfExpenditureId: 'parent-ps-1',
      objectId: 'child-salaries-1',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isProcurable).toBe(true)
      expect(result.data.typeOfExpenditureId).toBe('parent-ps-1')
      expect(result.data.objectId).toBe('child-salaries-1')
    }
  })

  it('fails validation when typeOfExpenditureId is empty or missing', () => {
    const result = ppmpExpenditureItemSchema.safeParse({
      isProcurable: false,
      typeOfExpenditureId: '',
      objectId: 'child-salaries-1',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('typeOfExpenditureId'))).toBe(true)
    }
  })

  it('fails validation when objectId is empty or missing', () => {
    const result = ppmpExpenditureItemSchema.safeParse({
      isProcurable: true,
      typeOfExpenditureId: 'parent-mooe-2',
      objectId: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('objectId'))).toBe(true)
    }
  })

  it('correctly scopes child items to the selected parent category', () => {
    const psParent = mockActivityHierarchy.find((g) => g.parentObjectId === 'parent-ps-1')
    expect(psParent).toBeDefined()
    expect(psParent?.items.map((i) => i.name)).toEqual(['Salaries and Wages'])
    expect(psParent?.items.some((i) => i.name === 'Travelling Expenses')).toBe(false)

    const mooeParent = mockActivityHierarchy.find((g) => g.parentObjectId === 'parent-mooe-2')
    expect(mooeParent).toBeDefined()
    expect(mooeParent?.items.map((i) => i.name)).toEqual([
      'Travelling Expenses',
      'Training Expenses',
    ])
    expect(mooeParent?.items.some((i) => i.name === 'Salaries and Wages')).toBe(false)
  })

  it('resolves the correct parent category given an existing child objectId (edit mode pre-population)', () => {
    const childObjectIdToEdit = 'child-travel-2'
    const matchingGroup = mockActivityHierarchy.find((g) =>
      g.items.some((item) => item.id === childObjectIdToEdit),
    )

    expect(matchingGroup).toBeDefined()
    expect(matchingGroup?.parentObjectId).toBe('parent-mooe-2')
    expect(matchingGroup?.parentObjectName).toBe('Maintenance and Other Operating Expenses')
  })

  describe('formatExpenditureDisplayName', () => {
    it('removes redundant "SC:" prefix when code duplicates name', () => {
      const result = formatExpenditureDisplayName(
        'Maintenance and Other Operating Expenses',
        'SC:Maintenance and Other Operating Expenses',
      )
      expect(result).toBe('Maintenance and Other Operating Expenses')
    })

    it('removes redundant "GRP:" prefix when code duplicates name', () => {
      const result = formatExpenditureDisplayName(
        'Communication Expenses',
        'GRP:Communication Expenses',
      )
      expect(result).toBe('Communication Expenses')
    })

    it('formats numeric UACS codes cleanly with code - name', () => {
      const result = formatExpenditureDisplayName(
        'Cloud Compute Subscriptions',
        '50205030',
      )
      expect(result).toBe('50205030 - Cloud Compute Subscriptions')
    })

    it('returns name directly when code is empty or identical', () => {
      expect(formatExpenditureDisplayName('Personnel Services', '')).toBe('Personnel Services')
      expect(formatExpenditureDisplayName('Personnel Services', 'Personnel Services')).toBe('Personnel Services')
    })

    it('returns clean category name without code for parent expense types', () => {
      expect(
        formatExpenditureDisplayName(
          'Maintenance and Other Operating Expenses',
          '5020000000',
          true,
        ),
      ).toBe('Maintenance and Other Operating Expenses')

      expect(
        formatExpenditureDisplayName(
          'Maintenance and Other Operating Expenses',
          '5020000000',
        ),
      ).toBe('Maintenance and Other Operating Expenses')
    })
  })
})
