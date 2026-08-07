import { atom } from 'jotai'

// Import reset atoms
import { resetDialogStatesAtom } from './dialogAtoms'
import { resetFormDataAtom } from './formAtoms'
import { resetTableStatesAtom } from './tableAtoms'

// Re-export all atoms from separate files
export * from './dialogAtoms'
export * from './formAtoms'
export * from './tableAtoms'
export * from './fiscalYearsAtom'
export * from './kpiTableAtoms'

// Global reset atom that clears all OPCR states and localStorage
export const resetAllOpcrStatesAtom = atom(null, (_get, set) => {
    // Reset all state atoms
    set(resetDialogStatesAtom)
    set(resetFormDataAtom)
    set(resetTableStatesAtom)

    // Clear all localStorage keys
    localStorage.removeItem('opcr_dialog_states')
    localStorage.removeItem('opcr_form_data')
    localStorage.removeItem('opcr_table_states')
})

// Cleanup function to be called when leaving the OPCR page
export const cleanupOpcrStorage = () => {
    localStorage.removeItem('opcr_dialog_states')
    localStorage.removeItem('opcr_form_data')
    localStorage.removeItem('opcr_table_states')
}
