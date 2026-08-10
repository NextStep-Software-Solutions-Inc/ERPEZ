/**
 * Economic Indicators Types
 * Defines interfaces and types for economic indicator CRUD operations
 *
 * API Endpoint: /economic-indicators
 */

export interface EconomicIndicator {
  id: string
  fiscalYearId: string
  fiscalYearYear: number
  vatRate: number
  inflationRate: number
  incomeTaxRate: number
  createdAt: string
  createdBy: string | null
  updatedAt: string | null
  updatedBy: string | null
}

export interface CreateEconomicIndicatorPayload {
  fiscalYearId: string
  vatRate: number
  inflationRate: number
  incomeTaxRate: number
}

export interface UpdateEconomicIndicatorPayload {
  vatRate: number
  inflationRate: number
  incomeTaxRate: number
}

export interface EconomicIndicatorFormValues {
  fiscalYearId: string
  vatRate: number
  inflationRate: number
  incomeTaxRate: number
}

export type EconomicIndicatorField =
  | 'vatRate'
  | 'inflationRate'
  | 'incomeTaxRate'

export const ECONOMIC_INDICATOR_FIELDS: EconomicIndicatorField[] = [
  'vatRate',
  'inflationRate',
  'incomeTaxRate',
]

export const FIELD_LABELS: Record<EconomicIndicatorField, string> = {
  vatRate: 'VAT Rate',
  inflationRate: 'Inflation Rate',
  incomeTaxRate: 'Income Tax Rate',
}
