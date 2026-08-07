/**
 * Position Configuration
 * Centralized settings for position-related dropdowns and enums
 */

// Position Type Enums for Zod validation
export const positionTypeValues = ['executive', 'managerial', 'supervisory', 'technical', 'administrative', 'support', 'skilled', 'unskilled'] as const
export type PositionType = typeof positionTypeValues[number]

// Plantilla Type Enums for Zod validation
export const plantillaTypeValues = ['permanent', 'casual', 'contractual', 'job-order', 'cos', 'elected', 'appointed'] as const
export type PlantillaType = typeof plantillaTypeValues[number]

// Vacancy Reason Enums for Zod validation
export const vacancyReasonValues = ['retirement', 'resignation', 'termination', 'promotion', 'transfer', 'new-position', 'other'] as const
export type VacancyReason = typeof vacancyReasonValues[number]

export const positionConfig = {
  // Position Types
  positionTypes: [
    { value: 'executive' as const, label: 'Executive' },
    { value: 'managerial' as const, label: 'Managerial' },
    { value: 'supervisory' as const, label: 'Supervisory' },
    { value: 'technical' as const, label: 'Technical' },
    { value: 'administrative' as const, label: 'Administrative' },
    { value: 'support' as const, label: 'Support' },
    { value: 'skilled' as const, label: 'Skilled' },
    { value: 'unskilled' as const, label: 'Unskilled' },
  ],

  // Plantilla Types
  plantillaTypes: [
    { value: 'permanent' as const, label: 'Permanent' },
    { value: 'casual' as const, label: 'Casual' },
    { value: 'contractual' as const, label: 'Contractual' },
    { value: 'job-order' as const, label: 'Job Order' },
    { value: 'cos' as const, label: 'COS' },
    { value: 'elected' as const, label: 'Elected' },
    { value: 'appointed' as const, label: 'Appointed' },
  ],

  // Salary Grades (1-33)
  salaryGrades: Array.from({ length: 33 }, (_, i) => ({
    value: i + 1,
    label: `SG-${i + 1}`,
  })),

  // Steps (1-8)
  steps: Array.from({ length: 8 }, (_, i) => ({
    value: i + 1,
    label: `Step ${i + 1}`,
  })),

  // Vacancy Reasons
  vacancyReasons: [
    { value: 'retirement' as const, label: 'Retirement' },
    { value: 'resignation' as const, label: 'Resignation' },
    { value: 'termination' as const, label: 'Termination' },
    { value: 'promotion' as const, label: 'Promotion' },
    { value: 'transfer' as const, label: 'Transfer' },
    { value: 'new-position' as const, label: 'New Position' },
    { value: 'other' as const, label: 'Other' },
  ],

  // Position Status
  statuses: [
    { value: 'vacant', label: 'Vacant' },
    { value: 'filled', label: 'Filled' },
    { value: 'frozen', label: 'Frozen' },
  ],

  // Plantilla types that require Item number
  plantillaTypesRequiringItem: ['permanent', 'casual', 'contractual', 'elected', 'appointed'],

  // Plantilla types that don't require Item number
  optionalPlantillaTypes: ['job-order', 'cos'],
}
