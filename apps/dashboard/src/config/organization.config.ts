/**
 * Organization Structure Configuration
 * Contains settings, citations, and regulatory references for organizational management
 */

export const organizationConfig = {
  // Multi-site configuration
  IS_MULTI_SITE: true, // Set to true for multi-site organizations, false for single-site
  DEFAULT_CLUSTER_ID: 'main-agency', // Default cluster ID for single-site
  
  // SPMS Performance Management Team settings
  // PMT follows CSC MC No. 6, s. 2012 mandate: Fixed 4 seats
  spms: {
    pmt: {
      description: 'Performance Management Team (PMT)',
    },
  },
  
  // Regulatory citations and compliance text
  citations: {
    cscPMT: 'Pursuant to **CSC MC No. 6, s. 2012**, the Performance Management Team (PMT) at organization-level evaluates OPCR/IPCR ratings for objective assessment and organization-wide calibration across all offices under the same organizational code (UACS), ensuring fairness and preventing rating inflation.',
  },

  // Traceability and policy messages
  policy: {
    unitTraceability: 'This organizational unit is subject to mandatory review every 2 years as per agency policy on institutional restructuring. UACS codes and position itemization are synchronized with the DBM GMIS system.',
  },

  // Organization structure defaults
  defaults: {
    pageSize: 10,
    maxPositionsPerUnit: 100,
  },

  // Messaging templates
  messages: {
    noIncumbents: 'No Incumbents Assigned',
    noPersonnelFound: 'No personnel found matching',
    retrievingRecords: 'Retrieving Service Records...',
    compilingData: 'Compiling Plantilla Data...',
    clusteringNotDefined: 'CLUSTERING NOT DEFINED',
    parentOfficeUndefined: 'No parent office defined',
    reportsToParent: 'Reports to parent organizational unit',
    ratingValidationOnly: 'Rating Validation Only',
    finalCalibrationApproval: 'Final Calibration Approval',
    unassignedItem: 'UNASSIGNED ITEM',
  },
}
