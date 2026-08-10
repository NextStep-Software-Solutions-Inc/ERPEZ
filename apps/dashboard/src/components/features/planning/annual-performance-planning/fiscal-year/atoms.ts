/**
 * Fiscal Year Atoms - Re-export from Root Authority
 * 
 * This file provides backward compatibility by re-exporting all fiscal-year-related
 * atoms from the root atoms.ts file. All atom definitions are now consolidated in
 * the root atoms.ts (single source of truth).
 * 
 * NEW: Import directly from ../atoms instead of this file
 * DEPRECATED: This file maintained for backward compatibility only
 */

export {
  appFiscalYearDialogStatesAtom,
  appFiscalYearFormDataAtom,
  appFiscalYearTableStatesAtom,
  createDialogAtom,
  closeCreateDialogAtom,
  updateDialogAtom,
  closeUpdateDialogAtom,
  deleteDialogAtom,
  closeDeleteDialogAtom,
  createFormDataAtom,
  hasUnsavedCreateFormAtom,
  updateFormDataAtom,
  hasUnsavedUpdateFormAtom,
  type FiscalYearDialogStates,
  type FiscalYearFormData,
  type FiscalYearTableStates,
  FISCAL_YEAR_STORAGE_KEYS,
} from '../atoms'
