import { atom } from 'jotai'

// Import reset atoms
import { resetDialogStatesAtom } from './dialogAtoms'
import { resetTableStatesAtom } from './tableAtoms'

// Re-export all atoms from separate files
export * from './dialogAtoms'
export * from './tableAtoms'

// Global reset atom that clears all KPI states and localStorage
export const resetAllKpiStatesAtom = atom(null, (_get, set) => {
    // Reset all state atoms
    set(resetDialogStatesAtom)
    set(resetTableStatesAtom)

    // Clear all localStorage keys
    localStorage.removeItem('kpi_dialog_states')
    localStorage.removeItem('kpi_table_states')
})

// Cleanup function to be called when leaving the KPI page
export const cleanupKpiStorage = () => {
    localStorage.removeItem('kpi_dialog_states')
    localStorage.removeItem('kpi_table_states')
}
