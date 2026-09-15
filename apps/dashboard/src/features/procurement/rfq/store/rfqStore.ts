import { create } from 'zustand'
import api from '@/services/api'
import type { APIResponse, PaginationResponse } from 'erpez-shared-lib'
import type { RFQ, RFQSummary, SupplierOption } from '../types'
import {
  mapBackendRFQToFrontend,
  mapBackendRFQListItemToFrontend,
  mapStatusStringToEnumNumber,
} from '../utils/rfqMappers'

// Re-export domain types so existing consumers that import from this file
// continue to work without changes.
export type { RFQ, RFQItem, RFQSummary, Supplier, SupplierOption } from '../types'

// ---------------------------------------------------------------------------
// Supplier registry helper (not part of the Zustand store)
// ---------------------------------------------------------------------------

export const fetchActiveSuppliers = async (): Promise<SupplierOption[]> => {
  const response = await api.get<PaginationResponse<any>>('/suppliers', {
    params: {
      PageNumber: 1,
      PageSize: 100,
      Filters: 'Status==Approved,IsBlocked==false',
    },
  })
  return (response.data.data || []).map((s: any) => ({
    id: s.id,
    supplierName: s.name,
    supplierCategory: s.supplierCategory?.name,
    contactPerson: s.contactPerson,
  })) as SupplierOption[]
}

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

interface RFQStore {
  rfqs: Array<RFQ>
  isLoading: boolean
  totalCount: number
  summary: RFQSummary | null
  fetchRFQs: (params: {
    pageNumber: number
    pageSize: number
    search?: string
    status?: string
    mode?: string
  }) => Promise<void>
  fetchRFQSummary: () => Promise<void>
  fetchRFQById: (id: string) => Promise<RFQ | null>
  createRFQ: (data: {
    rfqNumber: string
    tracingNumber: string
    description?: string
    date: string
    deadline?: string
    deliveryPeriod?: string
    purpose?: string
    supplierIds: string[]
  }) => Promise<string>
  // Edits an RFQ's header fields + invited supplier list. Backend permits
  // this while Status is Draft or Returned (PUT /rfqs/{id} — see UpdateRFQCommand).
  updateRFQ: (
    id: string,
    data: {
      rfqNumber: string
      tracingNumber: string
      description?: string
      date: string
      deadline?: string
      deliveryPeriod?: string
      purpose?: string
      supplierIds: string[]
    },
  ) => Promise<boolean>
  submitRFQ: (id: string) => Promise<boolean>
  reopenRFQ: (id: string) => Promise<boolean>
  changeRFQStatus: (id: string, status: string, remarks?: string) => Promise<boolean>
  addRFQItems: (
    id: string,
    items: Array<{
      cprItemId: string
      quantity: number
      isBrochureRequired: boolean
      greenSpecification?: string
    }>,
  ) => Promise<boolean>
  removeRFQItem: (rfqId: string, itemId: string) => Promise<boolean>
  removeRFQ: (id: string) => void
  fetchConsolidatedPrItemsForRFQ: () => Promise<any[]>
  fetchNextRFQNumber: (year?: number) => Promise<string>
}

// ---------------------------------------------------------------------------
// Store implementation
// ---------------------------------------------------------------------------

export const useRFQStore = create<RFQStore>((set) => ({
  rfqs: [],
  isLoading: false,
  totalCount: 0,
  summary: null,

  removeRFQ: (id) => set((s) => ({ rfqs: s.rfqs.filter((r) => r.id !== id) })),

  fetchRFQs: async ({ pageNumber, pageSize, search, status, mode }) => {
    set({ isLoading: true })
    try {
      let filters = ''
      if (status && status !== 'all') {
        const enumVal = mapStatusStringToEnumNumber(status)
        filters += `Status==${enumVal}`
      }
      if (mode && mode !== 'all') {
        if (filters) filters += ','
        filters += `ModeOfProcurementName@=*${mode}`
      }
      if (search) {
        if (filters) filters += ','
        filters += `RFQNumber@=*${search},Description@=*${search},TracingNumber@=*${search}`
      }

      const response = await api.get<PaginationResponse<any>>('/rfqs', {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          Filters: filters || undefined,
        },
      })
      const data = response.data
      const rawItems = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? (data as any[])
        : []
      const mapped = rawItems.map(mapBackendRFQListItemToFrontend)
      const count =
        typeof (data as any)?.totalCount === 'number'
          ? (data as any).totalCount
          : typeof (data as any)?.totalRows === 'number'
          ? (data as any).totalRows
          : typeof (data as any)?.data?.totalCount === 'number'
          ? (data as any).data.totalCount
          : typeof (data as any)?.data?.totalRows === 'number'
          ? (data as any).data.totalRows
          : mapped.length
      set({ rfqs: mapped, totalCount: count })
    } catch (e) {
      console.error('Failed to fetch RFQs:', e)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchRFQSummary: async () => {
    try {
      const response = await api.get<APIResponse<any>>('/rfqs/summary')
      const data = response.data.data
      if (data) {
        set({
          summary: {
            total: data.total || 0,
            draft: data.draft || 0,
            submitted: data.submitted || 0,
            approved: data.approved || 0,
            returned: data.returned || 0,
          },
        })
      }
    } catch (e) {
      console.error('Failed to fetch RFQ summary:', e)
    }
  },

  fetchRFQById: async (id) => {
    try {
      const response = await api.get<APIResponse<any>>(`/rfqs/${id}`)
      const rfqDetail = response.data.data
      if (rfqDetail) {
        const mapped = mapBackendRFQToFrontend(rfqDetail)
        set((s) => ({
          rfqs: s.rfqs.map((x) => (x.id === id ? mapped : x)),
        }))
        return mapped
      }
      return null
    } catch (e) {
      console.error(`Failed to fetch RFQ with ID ${id}:`, e)
      return null
    }
  },

  createRFQ: async (data) => {
    const response = await api.post<APIResponse<string>>('/rfqs', {
      rfqNumber: data.rfqNumber,
      tracingNumber: data.tracingNumber,
      description: data.description,
      date: data.date,
      deadline: data.deadline,
      deliveryPeriod: data.deliveryPeriod,
      purpose: data.purpose,
      supplierIds: data.supplierIds,
    })
    return response.data.data
  },

  updateRFQ: async (id, data) => {
    // RFQId is [JsonIgnore] on the UpdateRFQCommand — it is resolved from the
    // route parameter, not the body — so it is intentionally omitted here.
    const response = await api.put<APIResponse<boolean>>(`/rfqs/${id}`, {
      rfqNumber: data.rfqNumber,
      tracingNumber: data.tracingNumber,
      description: data.description,
      date: data.date,
      deadline: data.deadline,
      deliveryPeriod: data.deliveryPeriod,
      purpose: data.purpose,
      supplierIds: data.supplierIds,
    })
    return !!response.data.data
  },

  submitRFQ: async (id) => {
    const response = await api.post<APIResponse<boolean>>(`/rfqs/${id}/submit`)
    return !!response.data.data
  },

  reopenRFQ: async (id) => {
    const response = await api.patch<APIResponse<boolean>>(`/rfqs/${id}/reopen`)
    return !!response.data.data
  },

  changeRFQStatus: async (id, status, remarks) => {
    const enumVal = mapStatusStringToEnumNumber(status)
    const response = await api.patch<APIResponse<boolean>>(`/rfqs/${id}/status`, {
      rfqId: id,
      status: enumVal,
      remarks,
    })
    return !!response.data.data
  },

  addRFQItems: async (id, items) => {
    const response = await api.post<APIResponse<boolean>>(`/rfqs/${id}/items`, {
      rfqId: id,
      items: items.map((it) => ({
        cprItemId: it.cprItemId,
        quantity: it.quantity,
        isBrochureRequired: it.isBrochureRequired,
        greenSpecification: it.greenSpecification,
      })),
    })
    return !!response.data.data
  },

  removeRFQItem: async (rfqId, itemId) => {
    const response = await api.delete<APIResponse<boolean>>(`/rfqs/${rfqId}/items/${itemId}`)
    return !!response.data.data
  },

  fetchConsolidatedPrItemsForRFQ: async () => {
    try {
      const response = await api.get<APIResponse<any[]>>('/consolidated-prs/for-rfq')
      return response.data.data || []
    } catch (e) {
      console.error('Failed to fetch eligible consolidated PR items for RFQ:', e)
      return []
    }
  },

  fetchNextRFQNumber: async (year?: number) => {
    try {
      const response = await api.get<APIResponse<string>>('/rfqs/next-number', {
        params: year ? { year } : undefined,
      })
      return response.data.data || ''
    } catch (e) {
      console.error('Failed to fetch next RFQ number:', e)
      return ''
    }
  },
}))
