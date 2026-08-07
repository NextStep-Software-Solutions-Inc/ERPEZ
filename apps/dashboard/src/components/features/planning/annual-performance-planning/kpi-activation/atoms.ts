/**
 * KPI Activation Atoms - Re-export from Root Authority
 * 
 * This file provides backward compatibility by re-exporting all KPI-activation-related
 * atoms from the root atoms.ts file. All atom definitions are now consolidated in
 * the root atoms.ts (single source of truth).
 * 
 * NEW: Import directly from ../atoms instead of this file
 * DEPRECATED: This file maintained for backward compatibility only
 */

export {
  kpiActivationFormDataAtom,
  hasUnsavedKPIActivationAtom,
  type KPIActivationFormData,
  KPI_ACTIVATION_STORAGE_KEYS,
} from '../atoms'
