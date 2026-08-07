/**
 * Annual Performance Planning Module
 * 
 * Centralized exports for all submodules:
 * - Fiscal Year Management: /fiscal-year
 * - KPI Activation: /kpi-activation
 * - Target Distribution: /target-distribution
 * - Shared Utilities: /shared
 */

// Fiscal Year exports
export * from './fiscal-year'

// KPI Activation exports
export * from './kpi-activation'

// Target Distribution exports
export * from './target-distribution'

// Shared utilities (types, constants, utils)
export * from './shared'

// Legacy exports (gradual migration)
export * from './atoms'
export { default as AppDialogManager } from './AppDialogManager'
export { getFiscalYearsRequest } from './handlers/getFiscalYearsRequest'
export { getAvailableKPIsRequest } from './handlers/getAvailableKPIsRequest'
export { getActivatedKPIsRequest } from './handlers/getActivatedKPIsRequest'
export { getKPITargetsRequest } from './handlers/getKPITargetsRequest'
export { batchUpdateTargetsRequest } from './handlers/batchUpdateTargetsRequest'

// Main page component
export { default as AppFormPage } from './AppFormPage'

export { activateKPIsRequest } from './handlers/activateKPIsRequest'
export { getKPITargetsRequest } from './handlers/getKPITargetsRequest'
export { deactivateKPIRequest } from './handlers/deactivateKPIRequest'
export { batchUpdateTargetsRequest } from './handlers/batchUpdateTargetsRequest'
export { createSnapshotRequest } from './handlers/createSnapshotRequest'
