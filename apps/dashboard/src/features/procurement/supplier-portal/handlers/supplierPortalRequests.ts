/**
 * Supplier Portal Request Handlers
 * APIs for supplier quotation submissions and invited RFQ discovery
 */

import type { QueryBlueprintFromTemplate, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

export interface SupplierRFQDto {
  id: string
  rfqNumber: string
  tracingNumber: string
  description?: string
  purpose?: string
  deliveryPeriod?: string
  date: string
  deadline?: string
  totalAmount: number
  status: string
  invitedAt: string
  hasSubmittedBid: boolean
  bidStatus?: string
  items: SupplierRFQItemDto[]
}

export interface SupplierRFQItemDto {
  id: string
  rfqId: string
  itemName: string
  category?: string
  quantity: number
  unitPriceSnapshot: number
  totalABC: number
  isBrochureRequired: boolean
  greenSpecification?: string
}

export interface SupplierBidDetailDto {
  id: string
  rfqId: string
  supplierId: string
  submissionType: string
  status: string
  validityPeriodDays?: number
  deliveryPeriod?: string
  paymentTerms?: string
  warrantyTerms?: string
  totalAmount: number
  submittedAt?: string
  remarks?: string
  quotationDocumentUrl?: string
  signatureUrl?: string
  signatoryName?: string
  dateSigned?: string
  items: SupplierBidItemDetailDto[]
}

export interface SupplierBidItemDetailDto {
  id: string
  rfqItemId: string
  itemName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  brand?: string
  model?: string
  color?: string
  brochureFileId?: string
  brochureFileUrl?: string
  isResponsive: boolean
  disqualificationReason?: string
  qualityScore?: number
}

export interface SubmitSupplierBidPayload {
  rfqId: string
  supplierId: string
  submissionType?: string
  status?: string
  validityPeriodDays?: number
  deliveryPeriod?: string
  paymentTerms?: string
  warrantyTerms?: string
  remarks?: string
  quotationDocumentUrl?: string
  signatureUrl?: string
  signatoryName?: string
  dateSigned?: string
  items: Array<{
    rfqItemId: string
    unitPrice: number
    brand?: string
    model?: string
    color?: string
    brochureFileId?: string
    brochureFileUrl?: string
    isResponsive?: boolean
    disqualificationReason?: string
    qualityScore?: number
  }>
}

const listEndpoint = '/api/supplier/rfqs'
const detailEndpoint = '/api/supplier/rfqs/:rfqId'
const myBidEndpoint = '/api/supplier/rfqs/:rfqId/my-bid'
const submitBidEndpoint = '/api/supplier/rfqs/:rfqId/bids'

export interface SupplierIdParams {
  supplierId?: string
}

export interface RFQDetailParams {
  rfqId: string
  supplierId?: string
}

export const getSupplierRFQInvitationsRequest: QueryBlueprintFromTemplate<
  typeof listEndpoint,
  SupplierRFQDto[],
  SupplierIdParams
> = {
  endpoint: listEndpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<{ data: SupplierRFQDto[] }>(finalUrl, { signal })
    return response.data.data
  },
}

export const getSupplierRFQDetailsRequest: QueryBlueprintFromTemplate<
  typeof detailEndpoint,
  SupplierRFQDto,
  RFQDetailParams
> = {
  endpoint: detailEndpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<{ data: SupplierRFQDto }>(finalUrl, { signal })
    return response.data.data
  },
}

export const getSupplierBidRequest: QueryBlueprintFromTemplate<
  typeof myBidEndpoint,
  SupplierBidDetailDto,
  RFQDetailParams
> = {
  endpoint: myBidEndpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<{ data: SupplierBidDetailDto }>(finalUrl, { signal, skipToast: true } as any)
    return response.data.data
  },
}

export const submitSupplierBidRequest: MutationBlueprintFromTemplate<
  typeof submitBidEndpoint,
  string,
  { rfqId: string },
  SubmitSupplierBidPayload
> = {
  endpoint: submitBidEndpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<{ data: string }>(finalUrl, payload)
    return response.data.data
  },
}
