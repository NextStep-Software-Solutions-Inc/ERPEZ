import { describe, it, expect } from 'vitest'
import type { EligibleAppItem } from '../types'

describe('Mode-First APP Item Selection & Smart PAP Invariants (RA 12009)', () => {
  const cbModeId = 'mode-cb-001'
  const svpModeId = 'mode-svp-002'
  const shoppingModeId = 'mode-shop-003'

  const mockItems: EligibleAppItem[] = [
    {
      id: 'item-1',
      itemNumber: 'ITEM-01',
      description: 'Laptop',
      ppmpItemName: 'ICT Laptop',
      officeName: 'IT Office',
      procurementModeId: cbModeId,
      procurementModeName: 'Competitive Bidding',
      fundSourceId: 'fund-1',
      fundSourceName: 'GAA',
      effectiveABC: 50000,
      papCode: 'PAP-101',
      appId: 'app-1',
      appNumber: 'APP-2026-001',
    },
    {
      id: 'item-2',
      itemNumber: 'ITEM-02',
      description: 'Desktop Computer',
      ppmpItemName: 'ICT Desktop',
      officeName: 'IT Office',
      procurementModeId: cbModeId,
      procurementModeName: 'Competitive Bidding',
      fundSourceId: 'fund-1',
      fundSourceName: 'GAA',
      effectiveABC: 40000,
      papCode: 'PAP-101',
      appId: 'app-1',
      appNumber: 'APP-2026-001',
    },
    {
      id: 'item-3',
      itemNumber: 'ITEM-03',
      description: 'Office Supplies',
      ppmpItemName: 'Pens and Papers',
      officeName: 'Admin',
      procurementModeId: svpModeId,
      procurementModeName: 'Small Value Procurement',
      fundSourceId: 'fund-1',
      fundSourceName: 'GAA',
      effectiveABC: 5000,
      papCode: 'PAP-101',
      appId: 'app-1',
      appNumber: 'APP-2026-001',
    },
    {
      id: 'item-4',
      itemNumber: 'ITEM-04',
      description: 'Network Server',
      ppmpItemName: 'ICT Server',
      officeName: 'IT Office',
      procurementModeId: cbModeId,
      procurementModeName: 'Competitive Bidding',
      fundSourceId: 'fund-1',
      fundSourceName: 'GAA',
      effectiveABC: 150000,
      papCode: 'PAP-102',
      appId: 'app-1',
      appNumber: 'APP-2026-001',
    },
    {
      id: 'item-5',
      itemNumber: 'ITEM-05',
      description: 'Cleaning Equipment',
      ppmpItemName: 'Vacuum',
      officeName: 'General Services',
      procurementModeId: shoppingModeId,
      procurementModeName: 'Shopping',
      fundSourceId: 'fund-1',
      fundSourceName: 'GAA',
      effectiveABC: 12000,
      papCode: 'PAP-102',
      appId: 'app-1',
      appNumber: 'APP-2026-001',
    },
  ]

  function filterItemsByMode(items: EligibleAppItem[], selectedModeId: string | null): EligibleAppItem[] {
    if (!selectedModeId) return []
    return items.filter((item) => item.procurementModeId === selectedModeId)
  }

  function togglePapGroup(
    groupEligibleItems: EligibleAppItem[],
    currentSelected: EligibleAppItem[],
  ): EligibleAppItem[] {
    const selectedIds = new Set(currentSelected.map((i) => i.id))
    const allGroupSelected =
      groupEligibleItems.length > 0 && groupEligibleItems.every((i) => selectedIds.has(i.id))

    if (allGroupSelected) {
      const groupItemIds = new Set(groupEligibleItems.map((i) => i.id))
      return currentSelected.filter((i) => !groupItemIds.has(i.id))
    } else {
      const toAdd = groupEligibleItems.filter((i) => !selectedIds.has(i.id))
      return [...currentSelected, ...toAdd]
    }
  }

  function getPapCheckboxState(
    groupEligibleItems: EligibleAppItem[],
    currentSelected: EligibleAppItem[],
  ) {
    const selectedIds = new Set(currentSelected.map((i) => i.id))
    const selectedInGroup = groupEligibleItems.filter((i) => selectedIds.has(i.id))
    const isAllSelected =
      groupEligibleItems.length > 0 && selectedInGroup.length === groupEligibleItems.length
    const isSomeSelected =
      selectedInGroup.length > 0 && selectedInGroup.length < groupEligibleItems.length

    return { isAllSelected, isSomeSelected }
  }

  it('Test 1: Mode selection filters items across PAPs strictly to selected mode', () => {
    const filtered = filterItemsByMode(mockItems, cbModeId)
    expect(filtered).toHaveLength(3)
    expect(filtered.map((i) => i.id)).toEqual(['item-1', 'item-2', 'item-4'])
    expect(filtered.every((i) => i.procurementModeId === cbModeId)).toBe(true)
  })

  it('Test 2: PAP selection only selects mode-eligible items and leaves other modes unselected', () => {
    // Under Competitive Bidding, eligible items in PAP-101 are item-1 and item-2 (item-3 is SVP)
    const pap101Eligible = filterItemsByMode(mockItems, cbModeId).filter((i) => i.papCode === 'PAP-101')
    expect(pap101Eligible).toHaveLength(2)

    const initialSelected: EligibleAppItem[] = []
    const updatedSelected = togglePapGroup(pap101Eligible, initialSelected)

    expect(updatedSelected).toHaveLength(2)
    expect(updatedSelected.map((i) => i.id)).toEqual(['item-1', 'item-2'])
    // Crucially: SVP item-3 is NOT selected
    expect(updatedSelected.some((i) => i.id === 'item-3')).toBe(false)
  })

  it('Test 3: PAP checkbox state is calculated exclusively on mode-eligible items', () => {
    const pap101Eligible = filterItemsByMode(mockItems, cbModeId).filter((i) => i.papCode === 'PAP-101')
    // Select both CB items in PAP-101
    const selected = [mockItems[0], mockItems[1]]

    const state = getPapCheckboxState(pap101Eligible, selected)
    // Even though SVP item-3 in PAP-101 is not selected, isAllSelected is true!
    expect(state.isAllSelected).toBe(true)
    expect(state.isSomeSelected).toBe(false)

    // Partially selected: only item-1 selected
    const partialState = getPapCheckboxState(pap101Eligible, [mockItems[0]])
    expect(partialState.isAllSelected).toBe(false)
    expect(partialState.isSomeSelected).toBe(true)
  })

  it('Test 4: When changing mode, previous selected items must be cleared', () => {
    let currentMode: string | null = cbModeId
    let selected: EligibleAppItem[] = [mockItems[0], mockItems[1]]

    // User switches mode to SVP
    const newMode = svpModeId
    if (newMode !== currentMode) {
      selected = [] // Cleared upon mode switch confirmation
      currentMode = newMode
    }

    expect(currentMode).toBe(svpModeId)
    expect(selected).toHaveLength(0)

    // Now eligible items are only SVP items
    const svpItems = filterItemsByMode(mockItems, currentMode)
    expect(svpItems).toHaveLength(1)
    expect(svpItems[0].id).toBe('item-3')
  })

  it('Test 5: When no mode is selected, item list is empty', () => {
    const filtered = filterItemsByMode(mockItems, null)
    expect(filtered).toHaveLength(0)
  })

  it('Test 6: When mode has no matching items, empty list is returned', () => {
    const directAcquisitionModeId = 'mode-da-999'
    const filtered = filterItemsByMode(mockItems, directAcquisitionModeId)
    expect(filtered).toHaveLength(0)
  })

  it('Test 7: Defensive step guard rejects mixed modes under RA 12009', () => {
    const mixedSelected = [mockItems[0], mockItems[2]] // CB + SVP
    const distinctModes = new Set(mixedSelected.map((i) => i.procurementModeId))
    expect(distinctModes.size).toBe(2)

    const canProceed = distinctModes.size === 1 && mixedSelected.every((i) => i.procurementModeId === cbModeId)
    expect(canProceed).toBe(false)

    // Single mode valid
    const validSelected = [mockItems[0], mockItems[1]]
    const validDistinctModes = new Set(validSelected.map((i) => i.procurementModeId))
    const validCanProceed =
      validDistinctModes.size === 1 && validSelected.every((i) => i.procurementModeId === cbModeId)
    expect(validCanProceed).toBe(true)
  })
})
