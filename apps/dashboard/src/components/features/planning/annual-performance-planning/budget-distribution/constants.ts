/**
 * Budget Distribution - Constants & Configuration
 */

export const AGGREGATION_TYPE_LABELS: Record<string, string> = {
  SUM: 'Sum',
  AVERAGE: 'Average',
  NON_CUMULATIVE: 'Non-Cumulative',
}

export const STATUS_CONFIG: Record<'draft' | 'proposed' | 'negotiating' | 'agreed', { label: string; color: string; bgColor: string; icon: string }> = {
  draft: {
    label: 'Draft',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: '◯',
  },
  proposed: {
    label: 'Proposed',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: '→',
  },
  negotiating: {
    label: 'Negotiating',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: '≈',
  },
  agreed: {
    label: 'Agreed',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: '✓',
  },
}

export const ERROR_MESSAGES = {
  SUM_MISMATCH: (total: number, annual: number) =>
    `Total (${total}) doesn't match Annual (${annual}). Gap: ${annual - total}`,
  AVERAGE_MISMATCH: (calculated: number, annual: number) =>
    `Average (${calculated.toFixed(1)}) doesn't match Annual (${annual})`,
  NON_CUMULATIVE_MISMATCH: (max: number, annual: number) =>
    `Max value (${max}) doesn't match Annual (${annual})`,
  INVALID_INPUT: 'Please enter a valid number',
  EMPTY_REQUIRED_FIELD: 'This field is required',
}

export const VALIDATION_RULES = {
  MIN_VALUE: 0,
  MAX_VALUE: 999999,
  TOLERANCE: 2.0, // For floating point comparisons
}
