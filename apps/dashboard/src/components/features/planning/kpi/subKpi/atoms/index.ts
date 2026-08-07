import { atom } from 'jotai'

// Import reset atoms
import { resetDialogStatesAtom } from './dialogAtoms'
import { resetFormDataAtom } from './formAtoms'
import { resetTableStatesAtom } from './tableAtoms'

// Re-export all atoms from separate files
export * from './dialogAtoms'
export * from './formAtoms'
export * from './tableAtoms'

// Global reset atom that clears all SubKPI states and localStorage
export const resetAllSubKpiStatesAtom = atom(null, (_get, set) => {
    // Reset all state atoms
    set(resetDialogStatesAtom)
    set(resetFormDataAtom)
    set(resetTableStatesAtom)

    // Clear all localStorage keys
    localStorage.removeItem('subkpi_dialog_states')
    localStorage.removeItem('subkpi_form_data')
    localStorage.removeItem('subkpi_table_states')
})

// Cleanup function to be called when leaving the SubKPI page
export const cleanupSubKpiStorage = () => {
    localStorage.removeItem('subkpi_dialog_states')
    localStorage.removeItem('subkpi_form_data')
    localStorage.removeItem('subkpi_table_states')
}
