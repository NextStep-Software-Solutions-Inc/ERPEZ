/**
 * Mock Data for UACS Features
 * Provides realistic test data for development and testing
 */

import { ExpenseClass } from '../code-segments/types/commonTypes'
import type { CodeCombinationRule, RuleCondition } from '../rules/types/codeCombinationRuleTypes'

// ============================================================================
// Mock Code Combination Rules
// ============================================================================

const mockRuleConditions: Record<string, RuleCondition[]> = {
  noCoWithGeneralFund: [
    {
      codeSegment: 'fundingSource',
      conditionType: 'equals',
      value: '01',
      field: 'code',
    },
    {
      codeSegment: 'objectCode',
      conditionType: 'starts_with',
      value: '5020',
      field: 'code',
    },
  ],
  capexRequiresCapitalFund: [
    {
      codeSegment: 'objectCode',
      conditionType: 'in_list',
      value: ['4010', '4020', '4030'],
      field: 'code',
    },
  ],
  maintenanceLocationRequired: [
    {
      codeSegment: 'objectCode',
      conditionType: 'starts_with',
      value: '6010',
      field: 'code',
    },
  ],
}

export const mockCodeCombinationRules: CodeCombinationRule[] = [
  {
    id: 'rule-001',
    name: 'No CO with General Fund',
    description: 'Block Current Operating expenses with General Fund allocation',
    conditions: mockRuleConditions.noCoWithGeneralFund,
    consequence: {
      action: 'block',
      errorMessage:
        'Current Operating (CO) expenses cannot be allocated to General Fund. Please use a project fund.',
      severity: 'error',
    },
    isActive: true,
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-03-15T14:22:00Z',
    createdBy: 'admin',
    updatedBy: 'admin',
  },
  {
    id: 'rule-002',
    name: 'CAPEX Requires Capital Fund',
    description: 'Warn when capital expenditure is not using capital fund',
    conditions: mockRuleConditions.capexRequiresCapitalFund,
    consequence: {
      action: 'warn',
      errorMessage:
        'Capital Expenditure items should typically use a Capital Fund. Continue only if intentional.',
      severity: 'warning',
    },
    isActive: true,
    createdAt: '2025-02-01T08:15:00Z',
    updatedAt: '2025-02-28T16:45:00Z',
    createdBy: 'budget_manager',
    updatedBy: 'budget_manager',
  },
  {
    id: 'rule-003',
    name: 'Maintenance Requires Location',
    description: 'Ensure maintenance expenses have specific location codes',
    conditions: mockRuleConditions.maintenanceLocationRequired,
    consequence: {
      action: 'block',
      errorMessage: 'Maintenance expenses must include a specific location code.',
      severity: 'error',
    },
    isActive: false,
    createdAt: '2025-01-20T09:00:00Z',
    updatedAt: '2025-03-10T11:30:00Z',
    createdBy: 'fg_specialist',
    updatedBy: 'admin',
  },
]


// ============================================================================
// Mock Funding Sources
// ============================================================================

export const mockFundingSources = [
  // 2025 Funding Sources
  {
    id: 'fs-2025-01',
    code: '01',
    name: 'General Fund',
    description: 'Regular budgetary allocation',
    fundCluster: 'GF',
    isActive: true,
    fiscalYear: 2025,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'fs-2025-02',
    code: '02',
    name: 'Special Fund',
    description: 'Funds earmarked for specific purposes',
    fundCluster: 'SF',
    isActive: true,
    fiscalYear: 2025,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  // 2026 Funding Sources (1000 synced from 2025 + 500 new = 1500 total)
  // For mock, showing representatives: the synced ones + new ones all marked as 2026
  {
    id: 'fs-01',
    code: '01',
    name: 'General Fund',
    description: 'Regular budgetary allocation',
    fundCluster: 'GF',
    isActive: true,
    fiscalYear: 2026,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'fs-02',
    code: '02',
    name: 'Special Fund',
    description: 'Funds earmarked for specific purposes',
    fundCluster: 'SF',
    isActive: true,
    fiscalYear: 2026,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'fs-03',
    code: '03',
    name: 'Trust Fund',
    description: 'Funds held in trust for specific uses',
    fundCluster: 'TF',
    isActive: true,
    fiscalYear: 2026,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
]

// ============================================================================
// Mock Organization Codes
// ============================================================================

export const mockOrganizationCodes = [
  // 2025 Organization Codes (carry-forward base)
  {
    id: 'org-2025-02-01',
    code: '02-01',
    name: 'Office of the Governor',
    description: 'Central executive office',
    isActive: true,
    fiscalYear: 2025,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'org-2025-02-03',
    code: '02-03',
    name: 'Provincial Planning and Development Office',
    description: 'Development planning office',
    isActive: true,
    fiscalYear: 2025,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  // 2026 Organization Codes (carry-forward from 2025)
  {
    id: 'org-02-01',
    code: '02-01',
    name: 'Office of the Governor',
    description: 'Central executive office',
    isActive: true,
    fiscalYear: 2026,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'org-02-03',
    code: '02-03',
    name: 'Provincial Planning and Development Office',
    description: 'Development planning office',
    isActive: true,
    fiscalYear: 2026,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'org-03-01',
    code: '03-01',
    name: 'Provincial Veterinary Office',
    description: 'Veterinary and livestock services',
    isActive: true,
    fiscalYear: 2026,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'org-03-02',
    code: '03-02',
    name: 'Provincial Health Office',
    description: 'Health and medical services',
    isActive: true,
    fiscalYear: 2026,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
]

// ============================================================================
// Mock Location Codes
// ============================================================================

export const mockLocationCodes = [
  // 2025 Location Codes (carry-forward base)
  {
    id: 'loc-2025-01',
    code: '01',
    name: 'Provincial Office',
    description: 'Main provincial government office',
    isActive: true,
    fiscalYear: 2025,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'loc-2025-02',
    code: '02',
    name: 'Municipal Office',
    description: 'Municipal branch office',
    isActive: true,
    fiscalYear: 2025,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  // 2026 Location Codes (carry-forward from 2025)
  {
    id: 'loc-01',
    code: '01',
    name: 'Provincial Office',
    description: 'Main provincial government office',
    isActive: true,
    fiscalYear: 2026,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'loc-02',
    code: '02',
    name: 'Municipal Office',
    description: 'Municipal branch office',
    isActive: true,
    fiscalYear: 2026,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'loc-03',
    code: '03',
    name: 'Field Office - North',
    description: 'Field office in northern region',
    isActive: true,
    fiscalYear: 2026,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'loc-04',
    code: '04',
    name: 'Field Office - South',
    description: 'Field office in southern region',
    isActive: true,
    fiscalYear: 2026,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
]

// ============================================================================
// Mock MFO/PAP Codes
// ============================================================================

export const mockMfoPapCodes = [
  // 2025 MFO/PAP Codes (carry-forward base)
  {
    id: 'mfo-2025-001',
    code: '001',
    name: 'Governance',
    description: 'Major Final Outcome for governance',
    isActive: true,
    fiscalYear: 2025,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'mfo-2025-002',
    code: '002',
    name: 'Health Services',
    description: 'Major Final Outcome for health',
    isActive: true,
    fiscalYear: 2025,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  // 2026 MFO/PAP Codes (carry-forward from 2025)
  {
    id: 'mfo-001',
    code: '001',
    name: 'Governance',
    description: 'Major Final Outcome for governance',
    isActive: true,
    fiscalYear: 2026,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'mfo-002',
    code: '002',
    name: 'Health Services',
    description: 'Major Final Outcome for health',
    isActive: true,
    fiscalYear: 2026,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'mfo-003',
    code: '003',
    name: 'Infrastructure Development',
    description: 'Major Final Outcome for infrastructure',
    isActive: true,
    fiscalYear: 2026,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
]

// ============================================================================
// Helper Functions
// ============================================================================

export function getMockRuleByID(id: string): CodeCombinationRule | undefined {
  return mockCodeCombinationRules.find((rule) => rule.id === id)
}


export function getMockActiveRules(): CodeCombinationRule[] {
  return mockCodeCombinationRules.filter((rule) => rule.isActive)
}

export function getMockInactiveRules(): CodeCombinationRule[] {
  return mockCodeCombinationRules.filter((rule) => !rule.isActive)
}
