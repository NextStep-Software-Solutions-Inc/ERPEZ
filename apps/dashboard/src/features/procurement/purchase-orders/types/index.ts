export type PurchaseOrderSource = 'svp' | 'public-bidding' | 'direct-acquisition'

export type PurchaseOrderStatus =
  | 'draft'
  | 'for-approval'
  | 'returned'
  | 'approved'

export type PurchaseOrderRole = 'procurement-staff' | 'hope'

export type PurchaseOrderMode = 'svp' | 'public-bidding' | 'direct-acquisition' | 'manage'

export type PurchaseOrderDocumentType = 'aob' | 'noa' | 'direct-acquisition'

export type PurchaseOrderListFilter = PurchaseOrderStatus | 'all'

export type PurchaseOrderLineItem = {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  amount: number
}

export type ApprovedAob = {
  id: string
  aobNumber: string
  description: string
  category: string
  month: string
  winningSupplier: string
  totalAmount: number
  awardedItems: PurchaseOrderLineItem[]
  status: 'approved'
}

export type ApprovedNoa = {
  id: string
  noaNumber: string
  description: string
  category: string
  month: string
  supplierName: string
  supplierTin?: string
  totalAmount: number
  awardedItems: PurchaseOrderLineItem[]
  status: 'approved'
}

export type ApprovedDirectAcquisition = {
  id: string
  daNumber: string
  description: string
  category: string
  month: string
  supplierName: string
  supplierTin?: string
  totalAmount: number
  awardedItems: PurchaseOrderLineItem[]
  status: 'approved'
}

export type PurchaseOrder = {
  id: string
  poNumber: string
  description: string
  source: PurchaseOrderSource
  status: PurchaseOrderStatus
  date: string
  placeOfDelivery: string
  dateOfDelivery: string
  deliveryTerm: string
  paymentTerm: string
  sourceDocumentType: PurchaseOrderDocumentType | null
  sourceDocumentId: string | null
  sourceDocumentNumber: string | null
  sourceDocumentDescription: string | null
  supplierName: string | null
  supplierTin: string | null
  bidSupportingDocument: File | null
  totalAmount: number
  lineItems: PurchaseOrderLineItem[]
  createdAt: string
  updatedAt: string
  returnReason?: string | null
  approvedBy?: string | null
  approvedAt?: string | null
  signedDocument?: File | null
  signedDocumentFileName?: string | null
  printFileName?: string | null
}

export type CreatePurchaseOrderPayload = {
  source: PurchaseOrderSource
  poNumber: string
  description: string
  date: string
  placeOfDelivery: string
  dateOfDelivery: string
  deliveryTerm: string
  paymentTerm: string
  bidSupportingDocument: File | null
  supplierName?: string | null
  supplierTin?: string | null
  // Optional linkage to the originating Consolidated PR / DA reference
  sourceDocumentType?: PurchaseOrderDocumentType | null
  sourceDocumentId?: string | null
  sourceDocumentNumber?: string | null
  sourceDocumentDescription?: string | null
  // Optional pre-populated line items when creating a draft (e.g., from selected PR)
  lineItems?: PurchaseOrderLineItem[]
  totalAmount?: number
}

export type LinkAobPayload = {
  purchaseOrderId: string
  aobId: string
}

export type LinkNoaPayload = {
  purchaseOrderId: string
  noaId: string
}

export type LinkDirectAcquisitionPayload = {
  purchaseOrderId: string
  daId: string
}

export type SubmitPurchaseOrderPayload = {
  purchaseOrderId: string
}

export type ReturnPurchaseOrderPayload = {
  purchaseOrderId: string
  reason: string
}

export type ApprovePurchaseOrderPayload = {
  purchaseOrderId: string
  signedDocument: File
}

export type PrintPurchaseOrderResult = {
  fileName: string
  blob: Blob
}
