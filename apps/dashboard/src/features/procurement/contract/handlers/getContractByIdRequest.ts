/**
 * GET /contracts/:id
 * Retrieve a single Contract by ID with full detail.
 */

import type { APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'
import type { ContractDetail, ContractLineItem } from '../types'

const endpoint = '/contracts/:id' as const

export const getContractByIdRequest = {
  endpoint,
  key: ({ url }: { url: string }) => [url] as const,
  fetcher: async ({ finalUrl, signal }: { finalUrl: string; signal?: AbortSignal }): Promise<APIResponse<ContractDetail>> => {
    const response = await api.get<APIResponse<Record<string, unknown>>>(finalUrl, { signal })
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to fetch Contract.')
    }
    const raw = response.data.data
    const rawItems = (Array.isArray(raw?.items) ? raw.items : Array.isArray(raw?.lineItems) ? raw.lineItems : []) as Array<Record<string, unknown>>
    const items: ContractLineItem[] = rawItems.map((item) => ({
      id: String(item.id ?? ''),
      itemName: String(item.itemName ?? item.name ?? ''),
      quantity: Number(item.quantity ?? 1),
      unitOfMeasure: String(item.unitOfMeasure ?? item.unit ?? 'lot'),
      unitPrice: Number(item.unitPrice ?? item.unitCost ?? 0),
      totalAmount: Number(item.totalAmount ?? item.amount ?? 0),
      specifications: typeof item.specifications === 'string' ? item.specifications : typeof item.description === 'string' ? item.description : null,
      deliverySchedule: typeof item.deliverySchedule === 'string' ? item.deliverySchedule : null,
      category: typeof item.category === 'string' ? item.category : null,
      fund: typeof item.fund === 'string' ? item.fund : null,
    }))

    const normalized: ContractDetail = {
      ...(raw as unknown as ContractDetail),
      items,
    }

    return {
      ...response.data,
      data: normalized,
    }
  },
}
