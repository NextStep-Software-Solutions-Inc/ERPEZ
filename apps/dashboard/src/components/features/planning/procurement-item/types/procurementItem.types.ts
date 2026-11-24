export type ProcurementItem = {
  id: string
  name?: string
  specifications?: string
  type?: string
  isCSE: boolean
  itemLife?: number
  productCode?: string
  imageURL?: string
  imageUrl?: string
  availableStock?: number
  stockOnHand?: number
  isActive: boolean
  objectCodeId: string
  objectCodeName?: string
  unspscCodeId?: string
  unspscCodeName?: string
  uomId: string
  uomName?: string
  unitPrice?: number
  hasPrice: boolean
  createdAt: string
  updatedAt?: string
}

export type ProcurementItemDetails = ProcurementItem & {}
