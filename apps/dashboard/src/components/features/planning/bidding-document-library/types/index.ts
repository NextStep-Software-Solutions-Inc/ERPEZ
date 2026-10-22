export type BiddingDocumentTab = 'SystemAdmin' | 'BACSecretariat'

export interface MasterDoc {
  id: string
  name: string
  description: string
  envelope: 1 | 2
  templateFile: string
  templatePreviewUrl?: string
  templateFileType?: string
  order: number
}

export interface MasterDocumentFormData {
  name: string
  description?: string
  envelope: 1 | 2
  templateFile?: string
  templateFileId?: string
  templatePreviewUrl?: string
  templateFileType?: string
}

export const PROCUREMENT_CATEGORIES = [
  'Goods',
  'Infrastructure',
  'Consulting',
  'SVP',
] as const

export type ProcurementCategoryType = (typeof PROCUREMENT_CATEGORIES)[number]

export interface Profile {
  id: string
  name: string
  description: string
  procurementCategory: ProcurementCategoryType | string
  documentIds: Array<string>
  itemCount: number       
  techCount: number        
  finCount: number        
}

export interface UploadedFileAttachment {
  fileName: string
  previewUrl?: string
  fileType?: string
  fileSize?: number
}

export interface ProjectChecklistItem {
  id: string
  name: string
  envelope: 1 | 2
  templateFile: string
  templatePreviewUrl?: string
  templateFileType?: string
  isCustom: boolean
  enabled: boolean
  uploadedFile?: string
  uploadedFilePreviewUrl?: string
  uploadedFileType?: string
  uploadedFileSize?: number
  uploadProgress?: number
}

export interface Project {
  id: string
  title: string
  category: 'Goods' | 'Infrastructure' | 'Consulting'
  refNumber: string
  profileId: string
  checklist: Array<ProjectChecklistItem>
  status: 'Draft Checklist' | 'Finalized'
  projectStatus?: string
}
