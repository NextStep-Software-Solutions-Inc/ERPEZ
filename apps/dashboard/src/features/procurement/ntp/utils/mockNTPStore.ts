/**
 * In-memory NTP Store
 * Simulates backend persistence during development
 * Initialized from mock data and mutated by create/update operations
 */

import { MOCK_NTPS, MOCK_APPROVED_POs, MOCK_APPROVED_CONTRACTS } from './mockData'
import type { 
  NTP, 
  CreateNTPPayload, 
  SubmitNTPPayload,
  ApproveNTPPayload,
  ReturnNTPPayload,
  ApprovedPOForNTP,
  ApprovedContractForNTP,
} from '../types/ntpTypes'
import { NTPStatus, NTPSourceType } from '../types/ntpTypes'

// Mutable runtime copy — starts with the seed data
const store: NTP[] = [...MOCK_NTPS]
const approvedPOs: ApprovedPOForNTP[] = [...MOCK_APPROVED_POs]
const approvedContracts: ApprovedContractForNTP[] = [...MOCK_APPROVED_CONTRACTS]

export const mockNTPStore = {
  /**
   * Return all NTPs (paginated)
   */
  getList(pageNumber = 1, pageSize = 10) {
    const start = (pageNumber - 1) * pageSize
    const data = store.slice(start, start + pageSize)
    return {
      data,
      meta: { pageNumber, pageSize, total: store.length },
    }
  },

  /**
   * Find a single NTP by id
   */
  findById(id: string): NTP | undefined {
    return store.find((n) => n.id === id)
  },

  /**
   * Create a new NTP and push it into the store
   */
  create(payload: CreateNTPPayload): NTP {
    const now = new Date().toISOString()
    
    // Get source document details
    let supplierName = 'Unknown Supplier'
    let totalAmount = 0
    let itemsCount = 0
    let lineItems: NTP['lineItems'] = []

    if (payload.sourceType === NTPSourceType.PO) {
      const po = approvedPOs.find((p) => p.id === payload.sourceDocumentId)
      if (po) {
        supplierName = po.supplier.supplierName
        totalAmount = po.amount
        itemsCount = po.itemCount
        // In real scenario, fetch line items from source document
      }
    } else if (payload.sourceType === NTPSourceType.CONTRACT) {
      const contract = approvedContracts.find((c) => c.id === payload.sourceDocumentId)
      if (contract) {
        supplierName = contract.supplier.supplierName
        totalAmount = contract.amount
        itemsCount = contract.itemCount
        // In real scenario, fetch line items from source document
      }
    }

    const newNTP: NTP = {
      id: `ntp-${Date.now()}`,
      ntpNumber: payload.ntpNumber,
      description: payload.description ?? '',
      date: payload.date,
      status: NTPStatus.DRAFT,
      sourceType: payload.sourceType,
      sourceDocumentId: payload.sourceDocumentId,
      supplierName,
      totalAmount,
      itemsCount,
      lineItems,
      createdBy: 'current-user',
      createdAt: now,
      updatedAt: now,
    }

    store.push(newNTP)
    return newNTP
  },

  /**
   * Submit NTP for approval
   */
  submit(payload: SubmitNTPPayload): NTP | undefined {
    const ntp = store.find((n) => n.id === payload.ntpId)
    if (!ntp) return undefined

    ntp.status = NTPStatus.FOR_APPROVAL
    ntp.submittedBy = payload.submittedBy ?? 'current-user'
    ntp.submittedAt = payload.submittedAt ?? new Date().toISOString()
    ntp.updatedAt = new Date().toISOString()

    return ntp
  },

  /**
   * Approve NTP with signed document
   */
  approve(payload: ApproveNTPPayload): NTP | undefined {
    const ntp = store.find((n) => n.id === payload.ntpId)
    if (!ntp) return undefined

    ntp.status = NTPStatus.APPROVED
    ntp.approvedBy = payload.approvedBy
    ntp.approvedAt = payload.approvedAt ?? new Date().toISOString()
    ntp.signedDocumentUrl = `https://example.com/documents/${payload.ntpId}-signed.pdf`
    ntp.signedDocumentName = payload.signedDocument?.name ?? 'signed-ntp.pdf'
    ntp.updatedAt = new Date().toISOString()

    return ntp
  },

  /**
   * Return NTP to Draft with remarks
   */
  return(payload: ReturnNTPPayload): NTP | undefined {
    const ntp = store.find((n) => n.id === payload.ntpId)
    if (!ntp) return undefined

    ntp.status = NTPStatus.RETURNED
    ntp.returnedBy = payload.returnedBy ?? 'current-user'
    ntp.returnedAt = payload.returnedAt ?? new Date().toISOString()
    ntp.returnReason = payload.reason
    ntp.returnRemarks = payload.remarks
    ntp.updatedAt = new Date().toISOString()

    return ntp
  },

  /**
   * Get list of approved POs for linking
   */
  getApprovedPOs(): ApprovedPOForNTP[] {
    return approvedPOs
  },

  /**
   * Get list of approved Contracts for linking
   */
  getApprovedContracts(): ApprovedContractForNTP[] {
    return approvedContracts
  },

  /**
   * Get a specific approved PO
   */
  getPOById(id: string): ApprovedPOForNTP | undefined {
    return approvedPOs.find((p) => p.id === id)
  },

  /**
   * Get a specific approved Contract
   */
  getContractById(id: string): ApprovedContractForNTP | undefined {
    return approvedContracts.find((c) => c.id === id)
  },

  /**
   * Update NTP status directly (for testing)
   */
  updateStatus(id: string, status: NTPStatus): NTP | undefined {
    const ntp = store.find((n) => n.id === id)
    if (ntp) {
      ntp.status = status
      ntp.updatedAt = new Date().toISOString()
    }
    return ntp
  },

  /**
   * Delete an NTP (only if Draft)
   */
  delete(id: string): boolean {
    const index = store.findIndex((n) => n.id === id)
    if (index === -1) return false

    const ntp = store[index]
    if (ntp.status !== NTPStatus.DRAFT) return false

    store.splice(index, 1)
    return true
  },
}
