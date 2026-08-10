import { atom } from 'jotai'
import type { OfficeTypeSetting, PositionTypeSetting, SalaryGradeSetting, PlantillaTypeSetting, PMTMaximumSeatsSetting } from '../types'

type SettingData = OfficeTypeSetting | PositionTypeSetting | SalaryGradeSetting | PlantillaTypeSetting | PMTMaximumSeatsSetting

/**
 * Dialog state atoms for managing create/edit/delete dialogs
 */

// Edit dialog state
export const openEditDialogAtom = atom<SettingData | null>(null)

// Delete dialog state
export const openDeleteDialogAtom = atom<SettingData | null>(null)

// Table selection state (TanStack Table rowSelection-style map)
export const tableSelectedRowsAtom = atom<Record<string, boolean>>({})
