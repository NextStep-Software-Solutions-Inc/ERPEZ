/**
 * RFQ Mapper & Normalizer Utilities
 *
 * Pure functions that transform backend DTOs to frontend models and
 * normalize status strings/enums. Extracted from rfqStore.ts so they
 * can be tested and reused independently of the store.
 */

import type { RFQ, RFQItem, Supplier } from '../types'

// ---------------------------------------------------------------------------
// Status enum helpers
// ---------------------------------------------------------------------------

/**
 * Converts a backend status value (integer enum or string alias) to the
 * canonical frontend status string.
 */
export function mapStatusEnumToString(
  status: number | string,
): 'draft' | 'submitted' | 'returned' | 'approved' {
  if (typeof status === 'number') {
    const map: Record<number, 'draft' | 'submitted' | 'returned' | 'approved'> = {
      0: 'draft',
      1: 'submitted',
      2: 'returned',
      3: 'approved',
    }
    return map[status] ?? 'draft'
  }
  const s = String(status).toLowerCase()
  const validStatuses: Record<string, 'draft' | 'submitted' | 'returned' | 'approved'> = {
    draft: 'draft',
    submitted: 'submitted',
    issued: 'submitted', // backend alias
    returned: 'returned',
    approved: 'approved',
    closed: 'approved', // backend alias
  }
  return validStatuses[s] ?? 'draft'
}

/**
 * Converts a frontend status string to the backend integer enum value
 * used in filter and mutation payloads.
 */
export function mapStatusStringToEnumNumber(status: string): number {
  const map: Record<string, number> = {
    draft: 0,
    submitted: 1,
    returned: 2,
    approved: 3,
    active: 4,
    archived: 5,
    completed: 6,
    failed: 7,
    pending: 8,
    forapproval: 9,
  }
  return map[status.toLowerCase()] ?? 0
}

// ---------------------------------------------------------------------------
// DTO → frontend model mappers
// ---------------------------------------------------------------------------

/**
 * Maps a full RFQ detail DTO (GET /rfqs/{id}) to the frontend RFQ model.
 * Includes items and invited suppliers.
 */
export function mapBackendRFQToFrontend(dto: any): RFQ {
  return {
    id: dto.id,
    date: dto.date || '',
    rfqNumber: dto.rfqNumber || '',
    description: dto.description || '',
    purpose: dto.purpose || '',
    remarks: dto.remarks || '',
    tracingNumber: dto.tracingNumber || '',
    deadline: dto.deadline || '',
    deliveryPeriod: dto.deliveryPeriod || '',
    modeOfProcurement: dto.modeOfProcurementName || '',
    status: mapStatusEnumToString(dto.status),
    createdAt: dto.date ? new Date(dto.date).toISOString() : new Date().toISOString(),
    items: (dto.items || []).map(
      (it: any): RFQItem => ({
        id: it.id,
        prId: it.cprItemId,
        itemId: it.cprItemId,
        itemName: it.itemNameSnapshot || '',
        quantity: it.quantity,
        unitOfMeasure: it.unitOfMeasureSnapshot || 'pc',
        unitPrice: Number(it.unitPriceSnapshot || 0),
        totalAmount: Number(it.totalPrice || 0),
        isRequiredBrochure: it.isBrochureRequired,
        greenSpecification: it.greenSpecification || '',
        category: it.categorySnapshot || '',
        fund: it.fundSnapshot || '',
        monthlyAllocations: (it.monthlyAllocations || []).map((m: any) => ({
          month: m.month,
          quantity: m.quantity
        })),
      }),
    ),
    // Backend returns actual invited suppliers for this RFQ here — this is
    // authoritative supplier data tied to the RFQ, not the full active-supplier
    // registry, so it must come from dto.suppliers, never from fetchActiveSuppliers().
    suppliers: (dto.suppliers || []).map(
      (s: any): Supplier => ({
        id: s.supplierId,
        name: s.supplierName || '',
        contact: s.invitedAt ? `Invited: ${new Date(s.invitedAt).toLocaleDateString()}` : '',
      }),
    ),
  }
}

/**
 * Maps a list-row DTO (GET /rfqs) to the frontend RFQ model.
 * Items and suppliers are intentionally empty — the list endpoint
 * (GetRFQsQuery / RFQListItemDto) does not project them.
 * Call mapBackendRFQToFrontend via fetchRFQById when full detail is needed.
 */
export function mapBackendRFQListItemToFrontend(dto: any): RFQ {
  return {
    id: dto.id,
    date: dto.deadline || '',
    rfqNumber: dto.rfqNumber || '',
    description: dto.description || '',
    tracingNumber: dto.tracingNumber || '',
    deadline: dto.deadline || '',
    deliveryPeriod: dto.deliveryPeriod || '',
    modeOfProcurement: dto.modeOfProcurementName || '',
    status: mapStatusEnumToString(dto.status),
    createdAt: dto.deadline ? new Date(dto.deadline).toISOString() : new Date().toISOString(),
    items: [],
    suppliers: [],
  }
}
