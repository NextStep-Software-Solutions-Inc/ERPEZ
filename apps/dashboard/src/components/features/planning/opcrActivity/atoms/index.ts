import { atom } from 'jotai'

// Import reset atoms
import { resetDialogStatesAtom } from './dialogAtoms'
import { resetFormDataAtom } from './formAtoms'

// Re-export all atoms from separate files
export * from './dialogAtoms'
export * from './formAtoms'

// Global reset atom that clears all OPCR Activity states and localStorage
export const resetAllOpcrActivityStatesAtom = atom(null, (_get, set) => {
    // Reset all state atoms
    set(resetDialogStatesAtom)
    set(resetFormDataAtom)

    // Clear all localStorage keys
    localStorage.removeItem('opcr_activity_dialog_states')
    localStorage.removeItem('opcr_activity_form_data')
})

// Cleanup function to be called when leaving the OPCR Activity page
export const cleanupOpcrActivityStorage = () => {
    localStorage.removeItem('opcr_activity_dialog_states')
    localStorage.removeItem('opcr_activity_form_data')
}