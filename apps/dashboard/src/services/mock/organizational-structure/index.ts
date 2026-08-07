/**
 * Organizational Structure Mock Data
 * 
 * Centralized location for all organizational structure-related mock data.
 * This folder contains all data structures needed for managing organizational hierarchies,
 * including office types, categories, clusters, and workflows.
 * 
 * STRUCTURE:
 * - officeTypes.ts: Types/classifications of organizational units
 * - officeCategories.ts: Functional categories for offices
 * - administrativeLevels.ts: Hierarchical levels in the organization
 * - procurementWorkflows.ts: Procurement process types
 * - satelliteClusters.ts: Geographic/operational clusters for multi-site organizations
 * - orgUnits.ts: Actual organizational units (moved from ../orgUnits.ts)
 */

// Export all office-related mocks
export {
  OFFICE_TYPES_DB,
  fetchOfficeTypes,
  fetchOfficeTypeById,
  createOfficeType,
  updateOfficeType,
  deleteOfficeType,
} from './officeTypes'

export {
  OFFICE_CATEGORIES_DB,
  fetchOfficeCategories,
  fetchOfficeCategoryById,
  createOfficeCategory,
  updateOfficeCategory,
  deleteOfficeCategory,
} from './officeCategories'

// Export administrative level mocks
export {
  ADMINISTRATIVE_LEVELS_DB,
  fetchAdministrativeLevels,
  fetchAdministrativeLevelById,
  createAdministrativeLevel,
  updateAdministrativeLevel,
  deleteAdministrativeLevel,
} from './administrativeLevels'

// Export procurement workflow mocks
export {
  PROCUREMENT_WORKFLOWS_DB,
  fetchProcurementWorkflows,
  fetchProcurementWorkflowById,
  createProcurementWorkflow,
  updateProcurementWorkflow,
  deleteProcurementWorkflow,
} from './procurementWorkflows'

// Export satellite cluster mocks
export {
  SATELLITE_CLUSTERS_DB,
  fetchSatelliteClusters,
  fetchSatelliteClusterById,
  createSatelliteCluster,
  updateSatelliteCluster,
  deleteSatelliteCluster,
  fetchClustersByRegion,
  fetchActiveClusters,
} from './satelliteClusters'
