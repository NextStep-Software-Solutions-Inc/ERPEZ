import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { Indicator, KpiWithIndicators } from '../types'

/**
 * Dialog state atoms
 */
export const addIndicatorDialogOpenAtom = atom(false)
export const editIndicatorDialogOpenAtom = atom(false)
export const deleteIndicatorDialogOpenAtom = atom(false)

/**
 * Selection atoms
 */
export const selectedKpiAtom = atom<string | null>(null)
export const selectedIndicatorForEditAtom = atom<Indicator | null>(null)
export const selectedIndicatorForDeleteAtom = atom<Indicator | null>(null)

/**
 * View mode toggle atom (card vs table)
 */
export const kpiMeasurementViewModeAtom = atomWithStorage<'card' | 'table'>(
  'kpi-measurement-view',
  'card',
)

/**
 * Form data for multi-step dialog
 */
export const addIndicatorFormDataAtom = atomWithStorage<{
  selectedKpiId: string | null
  step: 1 | 2
}>('add-indicator-form-data', {
  selectedKpiId: null,
  step: 1,
})

/**
 * KPI list with indicators
 */
export const kpiWithIndicatorsAtom = atom<KpiWithIndicators[]>([])
