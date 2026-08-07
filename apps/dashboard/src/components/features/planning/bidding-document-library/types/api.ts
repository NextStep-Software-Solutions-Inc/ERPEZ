export interface MasterDocumentTypeDto {
  id: string
  name: string
  description?: string
  envelopeType: 1 | 2
  envelopeLabel: string
  templateFileUrl?: string
  createdAt: string
}

export interface DocumentProfileDto {
  id: string
  name: string
  description?: string
  procurementCategory: string
  itemCount: number
  techCount: number
  finCount: number
  items: DocumentProfileItemDto[]
  createdAt: string
}

export interface DocumentProfileItemDto {
  id: string
  masterDocumentTypeId: string
  documentName: string
  envelopeType: 1 | 2
  orderIndex: number
  templateFileUrl?: string
}

export interface ProjectChecklistResponse {
  projectId: string
  totalActive: number
  isLocked: boolean
  envelope1Items: ChecklistItemDto[]
  envelope2Items: ChecklistItemDto[]
}

export interface ChecklistItemDto {
  id: string
  documentName: string
  isCustom: boolean
  isRequired: boolean
  envelopeType: 1 | 2
  orderIndex: number
  templateFileUrl?: string
  masterDocumentTypeId?: string
}

export type BACProjectListItem = {
  id: string
  title: string
  status: string
  abc: number
  consolidatedPR: {
    id: string
    cprNumber: string
    description: string
    modeOfProcurementId: string
    modeOfProcurementName: string
  } | null
}
