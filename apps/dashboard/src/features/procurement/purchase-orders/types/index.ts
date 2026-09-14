export type PurchaseOrderSource = 'svp' | 'public-bidding' | 'direct-acquisition'

export type POProcurementMode = 'SVP' | 'PUBLIC_BIDDING' | 'DIRECT_ACQUISITION'

export type SourceDocumentType = 'AOB' | 'NOA' | 'BAC_RESOLUTION'

export type PurchaseOrderStatus =
  | 'Draft'
  | 'ForApproval'
  | 'Returned'
  | 'Approved'
  | 'draft'
  | 'for-approval'
  | 'returned'
  | 'approved'

export type PurchaseOrderRole = 'procurement-staff' | 'hope'

export type PurchaseOrderMode = 'all' | 'svp' | 'public-bidding' | 'direct-acquisition' | 'manage'

export type PurchaseOrderDocumentType = 'aob' | 'noa' | 'direct-acquisition' | 'AOB' | 'NOA' | 'BAC_RESOLUTION'

export type PurchaseOrderListFilter =
  | 'all'
  | 'draft'
  | 'for-approval'
  | 'returned'
  | 'approved'
  | 'Draft'
  | 'ForApproval'
  | 'Returned'
  | 'Approved'

export type PurchaseOrderLineItem = {
  id: string
  sourceItemId?: string
  description?: string | null
  quantity: number
  unit?: string | null
  unitPrice: number
  amount: number
}

// ── Available Source Documents (for PO creation) ───────────────────────────

export type AvailableAobItem = {
  id: string
  rfqItemId: string
  itemName: string
  quantity: number
  unit: string
  unitPrice: number
  totalAmount: number
}

export type AvailableAob = {
  id: string
  aobNumber: string
  description?: string | null
  winningSupplierId: string
  winningSupplierName: string
  totalAwardedAmount: number
  aobDate: string
  awardedItems: AvailableAobItem[]
}

export type AvailableNoaItem = {
  id: string
  itemName: string
  category: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  amount: number
}

export type AvailableNoa = {
  id: string
  noaNumber: string
  description: string
  supplierId: string
  supplierName: string
  totalAmount: number
  noaDate: string
  lineItems: AvailableNoaItem[]
}

export type AvailableDaItem = {
  id: string
  itemName: string
  itemDescription?: string | null
  quantity: number
  unit: string
  unitPrice: number
  totalAmount: number
  fund?: string | null
  office?: string | null
}

export type AvailableDaResolution = {
  id: string
  daNumber: string
  description: string
  cprNumber: string
  bacResolutionNumber?: string | null
  totalABC: number
  createdAt: string
  consolidatedPRItems: AvailableDaItem[]
}

// ── Purchase Order DTOs ───────────────────────────────────────────────────

export type PurchaseOrder = {
  id: string
  poNumber: string
  procurementMode?: POProcurementMode | string
  sourceDocumentType?: SourceDocumentType | string | null
  sourceDocumentId?: string | null
  sourceDocumentNumber?: string | null
  sourceDocumentDescription?: string | null
  supplierId?: string | null
  supplierName?: string | null
  supplierTin?: string | null
  description?: string | null
  source?: PurchaseOrderSource
  status: PurchaseOrderStatus
  date: string
  placeOfDelivery?: string | null
  dateOfDelivery?: string | null
  deliveryTerm?: string | null
  paymentTerm?: string | null
  totalAmount: number
  supportingDocumentUrl?: string | null
  returnReason?: string | null
  approvedById?: string | null
  approvedBy?: string | null
  approvedAt?: string | null
  items?: PurchaseOrderLineItem[]
  lineItems?: PurchaseOrderLineItem[]
  createdAt?: string
  updatedAt?: string
  signedDocument?: File | null
  signedDocumentFileName?: string | null
  printFileName?: string | null
}

export type RetailStoreInfo = {
  name: string
  tin?: string | null
  address?: string | null
}

export type CreatePurchaseOrderRequest = {
  poNumber?: string
  procurementMode: POProcurementMode
  sourceDocumentType: SourceDocumentType
  sourceDocumentId: string
  supplierId?: string | null
  retailStoreInfo?: RetailStoreInfo | null
  description?: string | null
  date: string
  placeOfDelivery?: string | null
  dateOfDelivery?: string | null
  deliveryTerm?: string | null
  paymentTerm?: string | null
  supportingDocumentUrl?: string | null
}

export type UpdatePurchaseOrderRequest = {
  id?: string
  poNumber?: string
  procurementMode: POProcurementMode
  sourceDocumentType: SourceDocumentType
  sourceDocumentId: string
  supplierId?: string | null
  retailStoreInfo?: RetailStoreInfo | null
  description?: string | null
  date: string
  placeOfDelivery?: string | null
  dateOfDelivery?: string | null
  deliveryTerm?: string | null
  paymentTerm?: string | null
  supportingDocumentUrl?: string | null
}

export type ReturnPurchaseOrderRequest = {
  returnReason: string
}
