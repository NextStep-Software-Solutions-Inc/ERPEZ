import { describe, it, expect } from 'vitest'
import {
  resolveExpenditureTypes,
  getDescendantExpenditureItems,
} from './expenditureHierarchyHelpers'
import type { Object as PlanningObject } from '@/features/planning/object/types/types'

describe('expenditureHierarchyHelpers', () => {
  const mockObjects: PlanningObject[] = [
    // Expenses Root
    {
      id: 'root-expenses',
      code: 'CLS:Expenses',
      name: 'Expenses',
      isActive: true,
      childObjectCount: 3,
      wfpObjectiveActivityExpenditureCount: 0,
      transactionCount: 0,
    },
    // Sub-Classes (Level 1 under Expenses)
    {
      id: 'sc-ps',
      code: 'SC:Personnel Services',
      name: 'Personnel Services',
      parent: { id: 'root-expenses', name: 'Expenses', code: 'CLS:Expenses' },
      isActive: true,
      childObjectCount: 1,
      wfpObjectiveActivityExpenditureCount: 0,
      transactionCount: 0,
    },
    {
      id: 'sc-co',
      code: 'SC:Capital Outlays',
      name: 'Capital Outlays',
      parent: { id: 'root-expenses', name: 'Expenses', code: 'CLS:Expenses' },
      isActive: true,
      childObjectCount: 2,
      wfpObjectiveActivityExpenditureCount: 0,
      transactionCount: 0,
    },
    // Groups under Capital Outlays (Level 2)
    {
      id: 'grp-inv',
      code: 'GRP:Investment Outlay',
      name: 'Investment Outlay',
      parent: { id: 'sc-co', name: 'Capital Outlays', code: 'SC:Capital Outlays' },
      isActive: true,
      childObjectCount: 0,
      wfpObjectiveActivityExpenditureCount: 0,
      transactionCount: 0,
    },
    {
      id: 'grp-ppe',
      code: 'GRP:Property, Plant and Equipment Outlay',
      name: 'Property, Plant and Equipment Outlay',
      parent: { id: 'sc-co', name: 'Capital Outlays', code: 'SC:Capital Outlays' },
      isActive: true,
      childObjectCount: 2,
      wfpObjectiveActivityExpenditureCount: 0,
      transactionCount: 0,
    },
    // Objects under Property, Plant and Equipment Outlay (Level 3 - Children of Group)
    {
      id: 'obj-machinery',
      code: '50604050',
      name: 'Machinery and Equipment',
      parent: { id: 'grp-ppe', name: 'Property, Plant and Equipment Outlay', code: 'GRP:Property, Plant and Equipment Outlay' },
      isActive: true,
      childObjectCount: 2,
      wfpObjectiveActivityExpenditureCount: 0,
      transactionCount: 0,
    },
    {
      id: 'obj-transport',
      code: '50604060',
      name: 'Transportation Equipment',
      parent: { id: 'grp-ppe', name: 'Property, Plant and Equipment Outlay', code: 'GRP:Property, Plant and Equipment Outlay' },
      isActive: true,
      childObjectCount: 1,
      wfpObjectiveActivityExpenditureCount: 0,
      transactionCount: 0,
    },
    // Sub-Objects under Machinery and Equipment (Level 4 - Specification items)
    {
      id: 'sub-office-eq',
      code: '5060405002',
      name: 'Office Equipment',
      parent: { id: 'obj-machinery', name: 'Machinery and Equipment', code: '50604050' },
      isActive: true,
      childObjectCount: 0,
      wfpObjectiveActivityExpenditureCount: 0,
      transactionCount: 0,
    },
    {
      id: 'sub-ict-eq',
      code: '5060405003',
      name: 'Information and Communication Technology Equipment',
      parent: { id: 'obj-machinery', name: 'Machinery and Equipment', code: '50604050' },
      isActive: true,
      childObjectCount: 0,
      wfpObjectiveActivityExpenditureCount: 0,
      transactionCount: 0,
    },
    // Sub-Object under Transportation Equipment
    {
      id: 'sub-motor-veh',
      code: '5060406001',
      name: 'Motor Vehicles',
      parent: { id: 'obj-transport', name: 'Transportation Equipment', code: '50604060' },
      isActive: true,
      childObjectCount: 0,
      wfpObjectiveActivityExpenditureCount: 0,
      transactionCount: 0,
    },
  ]

  describe('resolveExpenditureTypes', () => {
    it('correctly resolves root expenses and top-level sub-classes', () => {
      const { expensesRootObject, expenditureTypes } = resolveExpenditureTypes(mockObjects)
      expect(expensesRootObject?.id).toBe('root-expenses')
      expect(expenditureTypes.map((t) => t.id)).toContain('sc-co')
      expect(expenditureTypes.map((t) => t.id)).toContain('sc-ps')
      expect(expenditureTypes.length).toBe(2)
    })

    it('handles empty input gracefully', () => {
      const { expensesRootObject, expenditureTypes } = resolveExpenditureTypes([])
      expect(expensesRootObject).toBeUndefined()
      expect(expenditureTypes).toEqual([])
    })
  })

  describe('getDescendantExpenditureItems', () => {
    it('extracts all descendants under Capital Outlays including children and grandchildren', () => {
      const descendants = getDescendantExpenditureItems(mockObjects, 'sc-co')

      // Total items under sc-co:
      // 2 groups (Investment, PPE)
      // + 2 objects under PPE (Machinery, Transport)
      // + 2 sub-objects under Machinery (Office Eq, ICT Eq)
      // + 1 sub-object under Transport (Motor Vehicles)
      // Total = 7 items
      expect(descendants.length).toBe(7)

      // Verify Depth 0: Direct children (Groups)
      const ppeGroup = descendants.find((d) => d.id === 'grp-ppe')
      expect(ppeGroup).toBeDefined()
      expect(ppeGroup?.depth).toBe(0)
      expect(ppeGroup?.hasChildren).toBe(true)
      expect(ppeGroup?.isLeaf).toBe(false)

      const invGroup = descendants.find((d) => d.id === 'grp-inv')
      expect(invGroup).toBeDefined()
      expect(invGroup?.depth).toBe(0)
      expect(invGroup?.hasChildren).toBe(false)
      expect(invGroup?.isLeaf).toBe(true)

      // Verify Depth 1: Children of PPE Group
      const machinery = descendants.find((d) => d.id === 'obj-machinery')
      expect(machinery).toBeDefined()
      expect(machinery?.depth).toBe(1)
      expect(machinery?.parentName).toBe('Property, Plant and Equipment Outlay')
      expect(machinery?.hasChildren).toBe(true)
      expect(machinery?.isLeaf).toBe(false)

      // Verify Depth 2: Specific Sub-Objects (for specification)
      const officeEq = descendants.find((d) => d.id === 'sub-office-eq')
      expect(officeEq).toBeDefined()
      expect(officeEq?.depth).toBe(2)
      expect(officeEq?.parentName).toBe('Machinery and Equipment')
      expect(officeEq?.hasChildren).toBe(false)
      expect(officeEq?.isLeaf).toBe(true)

      const motorVeh = descendants.find((d) => d.id === 'sub-motor-veh')
      expect(motorVeh).toBeDefined()
      expect(motorVeh?.depth).toBe(2)
      expect(motorVeh?.parentName).toBe('Transportation Equipment')
      expect(motorVeh?.hasChildren).toBe(false)
      expect(motorVeh?.isLeaf).toBe(true)
    })

    it('returns empty array when rootParentId is invalid or has no children', () => {
      const descendants = getDescendantExpenditureItems(mockObjects, 'non-existent-id')
      expect(descendants).toEqual([])

      const emptyDescendants = getDescendantExpenditureItems(mockObjects, null)
      expect(emptyDescendants).toEqual([])
    })
  })
})
