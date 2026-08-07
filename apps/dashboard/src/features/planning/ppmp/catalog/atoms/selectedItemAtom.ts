/**
 * Selected Item & Detail Panel Atoms
 * Controls which item is open in the slide-over detail panel.
 */

import { atom } from 'jotai'
import type { NonCSEItem } from '../types/catalog.types'

/** ID of the item currently open in the detail panel (null = closed) */
export const selectedItemIdAtom = atom<string | null>(null)

/** Derived: whether the detail panel is open */
export const isDetailPanelOpenAtom = atom(
  (get) => get(selectedItemIdAtom) !== null,
)

/** Full item data currently loaded in the detail panel */
export const selectedItemDataAtom = atom<NonCSEItem | null>(null)

/** Active tab in the detail panel */
export const detailPanelActiveTabAtom = atom<
  'overview' | 'price-history' | 'audit-log' | 'references'
>('overview')

/** Loading state for the detail panel */
export const detailPanelLoadingAtom = atom(false)
