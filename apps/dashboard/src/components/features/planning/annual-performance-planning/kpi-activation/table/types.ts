/**
 * KPI Activation Table Types
 * Step 2: Configure activated KPIs
 */

export interface ActivatedKPIRow {
  id: string
  code: string
  name: string
  description?: string
  functionType: 'CoreFunction' | 'StrategicPriority' | 'MandatorySupport'
  aggregationMethod: string
  isActive: boolean
  activatedDate: string
}
