export type ProcurementItem = {
  id: string
  name: string
  specifications: string
  type: string
  isCSE: boolean
  itemLife: number
  productCode: string
  imageURL: string
  isActive: boolean
  objectCodeId: string
  objectCodeName: string
  unspscCodeId: string
  unspscCodeName: string
  uomId: string
  uomName: string
  createdAt: string
  updatedAt: string
}

export type LookupOption = {
  id: string
  code: string
  name: string
  isActive: boolean
}

export type ParentObjectInfo = {
  id: string
  name: string
  code: string
  parent?: ParentObjectInfo | null
}

export type ObjectCodeLookup = {
  id: string
  parent: ParentObjectInfo | null
  name: string
  code: string
  isActive: boolean
  childObjectCount: number
  wfpObjectiveActivityExpenditureCount: number
  transactionCount: number
}

export type UomLookup = {
  id: string
  name: string
  code: string
  description: string
  conversionFactor: number
  isActive: boolean
  parentId: string | null
  parentName: string | null
  createdAt: string
  updatedAt: string
}

export type CreateProcurementItemPayload = {
  name: string
  specifications: string
  type: string
  isCSE: boolean
  itemLife: number
  productCode: string
  imageURL: string
  objectCodeId: string
  unspscCodeId?: string
  uomId: string
}

export type UpdateProcurementItemPayload = {
  name: string
  specifications: string
  type: string
  isCSE: boolean
  itemLife: number
  productCode: string
  imageURL: string
  isActive: boolean
  objectCodeId: string
  unspscCodeId?: string
  uomId: string
}
