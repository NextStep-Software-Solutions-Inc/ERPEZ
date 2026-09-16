/**
 * Get Bid Matrix Request Handler
 * Fetches the complete bid matrix for an AOB including:
 * - All suppliers and their bid submissions
 * - Line items with bid details & calculations
 * - Over-ABC flagging, ranking, and scoring
 * - Sealed bid privacy status & Minimum canvass notices
 */

import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BidMatrix, LineItem, Supplier, SupplierBid } from '../types/aobTypes'
import api from '@/services/api'
import { MOCK_BID_MATRIX } from '../__mocks__/mockData'

const endpoint = '/aobs/:aobId/matrix' as const

interface RawBackendMatrixResponse {
  aobId: string
  aobNumber: string
  description?: string
  awardCriterion: string
  status: string
  aobDate: string
  openingDate: string
  isBidsOpened: boolean
  hasMinimumCanvassWarning: boolean
  remarks?: string
  linkedRFQs: Array<{
    id: string
    rfqNumber: string
    tracingNumber?: string
    totalAmount: number
    status: string
    date: string
    deadline?: string
  }>
  suppliers: Array<{
    supplierId: string
    name: string
    email: string
    submissionType?: string
    submittedAt?: string
    deliveryPeriod?: string
    validityPeriodDays?: number
  }>
  items: Array<{
    rfqItemId: string
    rfqId: string
    name: string
    category?: string
    fundSource?: string
    abcUnitPrice: number
    quantity: number
    totalABC: number
    isBrochureRequired: boolean
    greenSpecification?: string
  }>
  bids: Array<{
    bidItemId?: string
    supplierId: string
    supplierName: string
    rfqItemId: string
    unitPrice: number
    totalPrice: number
    brand?: string
    model?: string
    color?: string
    brochureFileId?: string
    brochureFileUrl?: string
    isResponsive: boolean
    disqualificationReason?: string
    isOverABC: boolean
    rank: number
    score: number
    qualityScore?: number
  }>
}

export const getBidMatrixRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  BidMatrix,
  undefined
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<{ data: RawBackendMatrixResponse }>(finalUrl, { signal })
    const data = response.data.data

    // Transform backend DTO structure into BidMatrix format for UI components
    const suppliers: Supplier[] = (data.suppliers || []).map((s) => ({
      id: s.supplierId,
      supplierId: s.supplierId,
      supplierName: s.name,
      name: s.name,
      email: s.email,
      submissionType: s.submissionType as any,
      isResponsive: true,
      submittedAt: s.submittedAt,
      deliveryPeriod: s.deliveryPeriod,
      validityPeriodDays: s.validityPeriodDays,
    }))

    const supplierMap = new Map(suppliers.map((s) => [s.supplierId, s]))

    const lineItems: LineItem[] = (data.items || []).map((item, index) => {
      const itemBids: SupplierBid[] = (data.bids || [])
        .filter((b) => b.rfqItemId === item.rfqItemId)
        .map((b) => ({
          id: b.bidItemId,
          bidItemId: b.bidItemId,
          lineItemId: item.rfqItemId,
          rfqItemId: item.rfqItemId,
          supplierId: b.supplierId,
          supplierName: b.supplierName || supplierMap.get(b.supplierId)?.supplierName || 'Supplier',
          unitPrice: b.unitPrice,
          unitBid: b.unitPrice,
          itemBid: b.unitPrice,
          totalPrice: b.totalPrice,
          totalBid: b.totalPrice,
          brand: b.brand,
          model: b.model,
          color: b.color,
          brochureFileId: b.brochureFileId,
          brochureFileUrl: b.brochureFileUrl,
          isResponsive: b.isResponsive,
          isOverABC: b.isOverABC,
          disqualificationReason: b.disqualificationReason,
          rank: b.rank,
          score: b.score,
          qualityScore: b.qualityScore,
          isWinner: b.rank === 1 && !b.isOverABC && b.isResponsive,
        }))

      const winningBid = itemBids.find((b) => b.isWinner)

      return {
        id: item.rfqItemId,
        aobId: data.aobId,
        rfqId: item.rfqId,
        rfqItemId: item.rfqItemId,
        itemCode: `${index + 1}`,
        description: item.name,
        itemName: item.name,
        name: item.name,
        quantity: item.quantity,
        unit: 'units',
        approvedBudgetForContract: item.abcUnitPrice,
        abcUnitPrice: item.abcUnitPrice,
        totalABC: item.totalABC,
        category: item.category,
        fundSource: item.fundSource,
        isBrochureRequired: item.isBrochureRequired,
        greenSpecification: item.greenSpecification,
        lineItems: itemBids,
        bids: itemBids,
        selectedWinnerId: winningBid?.supplierId || null,
        selectedWinnerBid: winningBid || null,
        awardCriterion: data.awardCriterion,
      }
    })

    const matrix: BidMatrix = {
      id: data.aobId,
      aobId: data.aobId,
      aobNumber: data.aobNumber,
      description: data.description,
      awardCriterion: data.awardCriterion as any,
      status: data.status as any,
      aobDate: data.aobDate,
      openingDate: data.openingDate,
      isBidsOpened: data.isBidsOpened,
      hasMinimumCanvassWarning: data.hasMinimumCanvassWarning,
      remarks: data.remarks,
      linkedRFQs: data.linkedRFQs || (data as any).linkedRfQs || [],
      suppliers,
      items: lineItems,
      lineItems,
      bids: (data.bids || []).map((b) => ({
        id: b.bidItemId,
        bidItemId: b.bidItemId,
        lineItemId: b.rfqItemId,
        rfqItemId: b.rfqItemId,
        supplierId: b.supplierId,
        supplierName: b.supplierName,
        unitPrice: b.unitPrice,
        unitBid: b.unitPrice,
        totalPrice: b.totalPrice,
        totalBid: b.totalPrice,
        brand: b.brand,
        model: b.model,
        color: b.color,
        brochureFileUrl: b.brochureFileUrl,
        isResponsive: b.isResponsive,
        isOverABC: b.isOverABC,
        disqualificationReason: b.disqualificationReason,
        rank: b.rank,
        score: b.score,
        qualityScore: b.qualityScore,
      })),
      createdAt: data.aobDate,
      updatedAt: data.aobDate,
      isDraft: data.status === 'Draft',
    }

    return matrix
  },
}
