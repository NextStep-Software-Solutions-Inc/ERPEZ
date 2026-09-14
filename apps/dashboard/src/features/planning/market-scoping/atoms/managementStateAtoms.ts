/**
 * Market Scoping Management State Atoms
 * Jotai state for activities and parameters management pages
 * Location: src/features/planning/market-scoping/atoms/
 */

import { atom } from 'jotai'
import type {
  ActivityTypeDefinition,
  ParameterDefinition,
} from '../types/managementTypes'

/**
 * Activity Types Management Atoms
 */

// Data store for activity types - initially empty, populated from API
export const activityTypesAtom = atom<ActivityTypeDefinition[]>([])

// Selected activity type for editing/deletion
export const selectedActivityTypeForEditAtom =
  atom<ActivityTypeDefinition | null>(null)

// Selected activity type for deletion (stores full object)
export const selectedActivityTypeForDeleteAtom =
  atom<ActivityTypeDefinition | null>(null)

// Activity type filter state
export const activityTypeListFilterAtom = atom({
  searchTerm: '',
  statusFilter: 'all' as 'all' | 'active' | 'inactive',
})

/**
 * Parameter Management Atoms
 */

// Data store for parameters - initially empty, populated from API
export const parametersAtom = atom<ParameterDefinition[]>([])

// Selected parameter for editing/deletion
export const selectedParameterForEditAtom = atom<ParameterDefinition | null>(
  null,
)

// Selected parameter for deletion (stores full object)
export const selectedParameterForDeleteAtom = atom<ParameterDefinition | null>(
  null,
)

// Parameter filter state
export const parameterListFilterAtom = atom({
  searchTerm: '',
  statusFilter: 'all' as 'all' | 'active' | 'inactive',
})

// Dialog state for create/edit
export const activityTypeDialogOpenAtom = atom(false)
export const parameterDialogOpenAtom = atom(false)
