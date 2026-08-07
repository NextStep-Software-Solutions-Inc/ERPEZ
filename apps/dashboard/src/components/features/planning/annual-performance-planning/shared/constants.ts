/**
 * Constants for Annual Performance Planning Module
 */

export const APP_MODULE_CONSTANTS = {
  // Fiscal Year constraints
  FISCAL_YEAR: {
    MIN_YEAR: 2024,
    MAX_YEAR: 2099,
    STATUSES: ['Draft', 'Locked'] as const,
  },

  // KPI constraints
  KPI: {
    FUNCTION_TYPES: ['CoreFunction', 'StrategicPriority', 'MandatorySupport'] as const,
    ACTIVATION_TYPES: ['Mandated', 'AvailableForShopping'] as const,
  },

  // API endpoints (if needed)
  ENDPOINTS: {
    FISCAL_YEARS: '/fiscal-years',
    KPIS: '/kpis',
    ACTIVATED_KPIS: '/activated-kpis',
    TARGETS: '/targets',
  },

  // UI thresholds
  UI: {
    TABLE_PAGE_SIZE: 5,
    SEARCH_DEBOUNCE_MS: 300,
    NOTIFICATION_TIMEOUT_MS: 3000,
  },

  // Status colors
  STATUS_COLORS: {
    Draft: 'bg-blue-100 text-blue-800 border-blue-200',
    Locked: 'bg-gray-100 text-gray-800 border-gray-200',
    Active: 'bg-green-100 text-green-800 border-green-200',
    Setup: 'bg-blue-100 text-blue-800 border-blue-200',
    Closed: 'bg-gray-100 text-gray-800 border-gray-200',
  },
} as const

// Local storage keys
export const STORAGE_KEYS = {
  FISCAL_YEAR_FORM: 'app_fiscal_year_form_data',
  FISCAL_YEAR_DIALOG_STATES: 'app_fiscal_year_dialog_states',
  FISCAL_YEAR_TABLE_STATES: 'app_fiscal_year_table_states',
  KPI_ACTIVATION_FORM: 'app_kpi_activation_form_data',
  KPI_ACTIVATION_TABLE_STATES: 'app_kpi_activation_table_states',
  TARGET_DISTRIBUTION_FORM: 'app_target_distribution_form_data',
  TARGET_DISTRIBUTION_TABLE_STATES: 'app_target_distribution_table_states',
} as const
