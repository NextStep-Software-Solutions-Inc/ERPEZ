/**
 * Request workflow helpers
 * Shared request construction and update logic for PPMP item requests.
 */

import type {
  CatalogCurrentUser,
  CreateItemRequestInput,
  ItemRequest,
} from '../types/catalog.types'

function generateRequestId() {
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function buildRequestBase(
  input: CreateItemRequestInput,
  status: 'Draft' | 'Submitted',
): Omit<ItemRequest, 'id' | 'requestingOffice' | 'requestingUser' | 'createdBy'> {
  return {
    name: input.name,
    procurementCategory: input.procurementCategory,
    itemCategory: input.itemCategory,
    uacsCode: input.uacsCode ?? null,
    unitOfMeasure: input.unitOfMeasure,
    estimatedUnitCost: input.estimatedUnitCost,
    specifications: input.specifications,
    imageUrl: input.imageUrl ?? null,
    status,
    requestDate: new Date(),
    submittedAt: status === 'Submitted' ? new Date() : null,
    reviewedAt: null,
    reviewedBy: null,
    remarks: null,
    unspscCode: null,
    isCSE: null,
  }
}

export function buildItemRequest(
  input: CreateItemRequestInput,
  currentUser: CatalogCurrentUser,
  status: 'Draft' | 'Submitted',
): ItemRequest {
  return {
    id: generateRequestId(),
    ...buildRequestBase(input, status),
    requestingOffice: currentUser.office,
    requestingUser: currentUser.name,
    createdBy: currentUser.email,
  }
}

export function updateItemRequest(
  existingRequest: ItemRequest,
  input: CreateItemRequestInput,
  status: 'Draft' | 'Submitted',
): ItemRequest {
  const base = buildRequestBase(input, status)

  return {
    ...existingRequest,
    ...base,
    id: existingRequest.id,
    requestDate: existingRequest.requestDate,
    requestingOffice: existingRequest.requestingOffice,
    requestingUser: existingRequest.requestingUser,
    createdBy: existingRequest.createdBy,
    submittedAt: status === 'Submitted' ? new Date() : null,
    reviewedAt: null,
    reviewedBy: null,
    remarks: null,
  }
}
