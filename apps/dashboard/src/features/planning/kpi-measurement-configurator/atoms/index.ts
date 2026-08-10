/**
 * KPI Measurement Configurator Jotai Atoms for State Management
 */

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import {
  PerformanceMeasuringScale,
  PerformanceMeasuringScaleBuilderFormValues,
} from '../types/performance-measuring-scale.types'

/**
 * Dialog state atoms
 */
export const createMeasurementDialogOpenAtom = atom(false)
export const editMeasurementDialogOpenAtom = atom(false)
export const deleteMeasurementDialogOpenAtom = atom(false)

/**
 * Selected scale for editing/deletion
 */
export const selectedMeasurementForEditAtom =
  atom<PerformanceMeasuringScale | null>(null)
export const selectedMeasurementForDeleteAtom =
  atom<PerformanceMeasuringScale | null>(null)

/**
 * Form data persistence
 */
export const measurementBuilderFormDataAtom = atomWithStorage<
  Partial<PerformanceMeasuringScaleBuilderFormValues>
>('kpi-measurement-configurator-builder-draft', { scales: [] })

/**
 * Master KPI selection (multi-select for cross-KPI viewing)
 * Empty array or null = view all indicators
 */
export const selectedMasterKpisAtom = atom<string[]>([])

/**
 * View mode selection
 */
export const measurementViewModeAtom = atom<'card' | 'accordion'>('card')

/**
 * Filter/search state
 */
export const measurementSearchFilterAtom = atom('')
export const measurementDimensionFilterAtom = atom<string>('')
export const measurementTemplateFilterAtom = atom<string>('')

/**
 * Pagination state
 */
export const measurementPageAtom = atom(1)
export const measurementPageSizeAtom = atom(12)
