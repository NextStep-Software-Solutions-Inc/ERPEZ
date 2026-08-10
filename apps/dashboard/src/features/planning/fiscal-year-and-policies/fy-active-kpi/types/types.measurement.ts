import { DimensionType } from '@/pages/planning/commitments/tabs/types'

export type FYActiveKPIMeasurement = {
  id: string
  fyActiveKPIId: string
  name?: string
  statement?: string
  dimension?: DimensionType[]
  moVs?: string[]
  ratingScaleTemplateId?: string
  isMOVEditable: boolean
  isScaleEditable: boolean
  createdAt: string
  createdBy?: string
}
