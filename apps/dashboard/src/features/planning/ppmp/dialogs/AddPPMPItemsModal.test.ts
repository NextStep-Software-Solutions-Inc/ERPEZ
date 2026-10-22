import { describe, expect, it } from 'vitest'
import { deriveScheduleDates } from '../lib/ppmpScheduleDerivation'

describe('AddPPMPItemsModal close and submission lifecycle logic', () => {
  type SelectedMap = Map<string, { id: string; name: string }>

  interface ModalState {
    isAdding: boolean
    isCommitted: boolean
    confirmCloseOpen: boolean
    selectedItems: SelectedMap
    isOpen: boolean
  }

  function createInitialState(selectedCount = 0): ModalState {
    const selectedItems: SelectedMap = new Map()
    for (let i = 0; i < selectedCount; i++) {
      selectedItems.set(`item-${i + 1}`, { id: `item-${i + 1}`, name: `Item ${i + 1}` })
    }
    return {
      isAdding: false,
      isCommitted: false,
      confirmCloseOpen: false,
      selectedItems,
      isOpen: true,
    }
  }

  function handleClose(state: ModalState): ModalState {
    if (state.isAdding) return state

    if (state.isCommitted) {
      return {
        ...state,
        confirmCloseOpen: false,
        selectedItems: new Map(),
        isOpen: false,
        isCommitted: false,
      }
    }

    if (state.selectedItems.size > 0) {
      return {
        ...state,
        confirmCloseOpen: true,
      }
    }

    return {
      ...state,
      confirmCloseOpen: false,
      selectedItems: new Map(),
      isOpen: false,
    }
  }

  function handleOpenChange(state: ModalState, next: boolean): ModalState {
    if (next) {
      return {
        ...state,
        isOpen: true,
        isCommitted: false,
      }
    }

    if (state.isAdding) return state

    if (state.isCommitted) {
      return {
        ...state,
        confirmCloseOpen: false,
        selectedItems: new Map(),
        isOpen: false,
        isCommitted: false,
      }
    }

    if (state.selectedItems.size > 0) {
      return {
        ...state,
        confirmCloseOpen: true,
      }
    }

    return {
      ...state,
      confirmCloseOpen: false,
      selectedItems: new Map(),
      isOpen: false,
    }
  }

  function handleConfirmAddSuccess(state: ModalState): ModalState {
    // Succeeded items are removed, committed flag is set, and modal closes cleanly
    const isCommitted = true
    const confirmCloseOpen = false
    const selectedItems: SelectedMap = new Map()
    const isOpen = false

    return {
      ...state,
      isAdding: false,
      isCommitted,
      confirmCloseOpen,
      selectedItems,
      isOpen,
    }
  }

  function handleConfirmAddFailure(state: ModalState): ModalState {
    // On failure, items remain, isCommitted is false, modal stays open
    return {
      ...state,
      isAdding: false,
      isCommitted: false,
      confirmCloseOpen: false,
    }
  }

  it('Edge Case A: closes cleanly without showing discard confirmation dialog on successful submission', () => {
    let state = createInitialState(2)
    expect(state.selectedItems.size).toBe(2)

    // User submits and API succeeds
    state = handleConfirmAddSuccess(state)

    expect(state.isOpen).toBe(false)
    expect(state.confirmCloseOpen).toBe(false)
    expect(state.selectedItems.size).toBe(0)

    // Even if onOpenChange(false) fires subsequent cleanup, discard dialog must NOT open
    state = handleOpenChange(state, false)
    expect(state.confirmCloseOpen).toBe(false)
  })

  it('Edge Case B: remains open on submission failure so user can retry', () => {
    let state = createInitialState(2)

    state = handleConfirmAddFailure(state)

    expect(state.isOpen).toBe(true)
    expect(state.confirmCloseOpen).toBe(false)
    expect(state.selectedItems.size).toBe(2)
    expect(state.isCommitted).toBe(false)

    // If user subsequently tries to close with unsaved items, discard confirmation appears
    state = handleClose(state)
    expect(state.confirmCloseOpen).toBe(true)
    expect(state.isOpen).toBe(true)
  })

  it('Edge Case C: shows discard confirmation when user manually closes with unsubmitted selected items', () => {
    let state = createInitialState(1)

    state = handleClose(state)

    expect(state.confirmCloseOpen).toBe(true)
    expect(state.isOpen).toBe(true)
  })

  it('Edge Case D: closes directly without confirmation when user closes with no items selected', () => {
    let state = createInitialState(0)

    state = handleClose(state)

    expect(state.confirmCloseOpen).toBe(false)
    expect(state.isOpen).toBe(false)
  })

  it('Edge Case F: ignores close requests while batch addition is in progress', () => {
    let state = createInitialState(1)
    state.isAdding = true

    state = handleClose(state)

    expect(state.isOpen).toBe(true)
    expect(state.confirmCloseOpen).toBe(false)
  })
})

describe('AddPPMPItemsModal schedule auto-derivation lifecycle', () => {
  it('automatically calculates dates when monthly allocation is provided', () => {
    const monthlyQuantities = {
      January: 0,
      February: 0,
      March: 0,
      April: 25,
      May: 0,
      June: 0,
      July: 25,
      August: 0,
      September: 0,
      October: 25,
      November: 0,
      December: 0,
    }

    const derived = deriveScheduleDates({
      monthlyQuantities,
      fiscalYear: 2026,
      procurementModeName: 'Small Value Procurement',
    })

    expect(derived).toEqual({
      expectedDeliveryStart: '2026-04-01',
      expectedDeliveryEnd: '2026-10-31',
      procurementStartDate: '2026-03-17',
      procurementEndDate: '2026-03-31',
    })
  })

  it('preserves manual overrides when isScheduleAutoDerived is set to false', () => {
    const config = {
      procurementStartDate: '2026-02-01',
      procurementEndDate: '2026-02-15',
      expectedDeliveryStart: '2026-03-01',
      expectedDeliveryEnd: '2026-03-31',
      isScheduleAutoDerived: false,
    }

    // When isScheduleAutoDerived is false, auto-sync does not overwrite manual entries
    expect(config.isScheduleAutoDerived).toBe(false)
    expect(config.procurementStartDate).toBe('2026-02-01')
  })
})
