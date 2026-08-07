/**
 * In-memory mock store for AOBs
 * Simulates backend persistence during development.
 * Initialized from MOCK_AOB_LIST and mutated by create/update operations.
 */

import { MOCK_AOB_LIST, MOCK_BID_MATRIX, MOCK_BID_MATRIX_003 } from '../__mocks__/mockData'
import type { AOB, BidMatrix, CreateAOBPayload } from '../types/aobTypes'
import { AOBStatus } from '../types/aobTypes'

// Mutable runtime copy — starts with the seed data
const store: AOB[] = [...MOCK_AOB_LIST]

export const mockAOBStore = {
  /** Return all AOBs (paginated) */
  getList(pageNumber = 1, pageSize = 10) {
    const start = (pageNumber - 1) * pageSize
    const data = store.slice(start, start + pageSize)
    return {
      data,
      meta: { pageNumber, pageSize, total: store.length },
    }
  },

  /** Find a single AOB by id */
  findById(id: string): AOB | undefined {
    return store.find((a) => a.id === id)
  },

  /** Create a new AOB and push it into the store */
  create(payload: CreateAOBPayload): AOB {
    const now = new Date().toISOString()
    const newAOB: AOB = {
      id: `aob-${Date.now()}`,
      aobNumber: payload.aobNumber,
      description: payload.description ?? '',
      date: payload.date,
      openingDate: payload.openingDate,
      status: AOBStatus.DRAFT,
      awardCriterion: payload.awardCriterion,
      createdBy: 'current-user',
      createdAt: now,
      updatedAt: now,
    }
    store.push(newAOB)
    return newAOB
  },

  /** Submit an AOB (change status from DRAFT to FOR_APPROVAL) */
  submit(id: string): AOB {
    const aob = store.find((a) => a.id === id)
    if (!aob) throw new Error(`AOB not found: ${id}`)
    if (aob.status !== AOBStatus.DRAFT) throw new Error(`Cannot submit AOB with status: ${aob.status}`)
    
    aob.status = AOBStatus.FOR_APPROVAL
    aob.updatedAt = new Date().toISOString()
    return aob
  },

  /** Approve an AOB (change status from FOR_APPROVAL to APPROVED) */
  approve(id: string, approvedBy: string, signedDocumentUrl?: string): AOB {
    const aob = store.find((a) => a.id === id)
    if (!aob) throw new Error(`AOB not found: ${id}`)
    if (aob.status !== AOBStatus.FOR_APPROVAL) throw new Error(`Cannot approve AOB with status: ${aob.status}`)
    
    aob.status = AOBStatus.APPROVED
    aob.approvedBy = approvedBy
    aob.approvedAt = new Date().toISOString()
    if (signedDocumentUrl) aob.signedDocumentUrl = signedDocumentUrl
    aob.updatedAt = new Date().toISOString()
    return aob
  },

  /** Return an AOB for revision (change status from FOR_APPROVAL back to DRAFT) */
  return(id: string, reason: string, remarks?: string): AOB {
    const aob = store.find((a) => a.id === id)
    if (!aob) throw new Error(`AOB not found: ${id}`)
    if (aob.status !== AOBStatus.FOR_APPROVAL) throw new Error(`Cannot return AOB with status: ${aob.status}`)
    
    aob.status = AOBStatus.DRAFT
    aob.updatedAt = new Date().toISOString()
    // Store return reason in remarks or additional field
    console.log(`AOB ${id} returned for revision. Reason: ${reason}. Remarks: ${remarks}`)
    return aob
  },

  /** Return the mock bid matrix for an AOB id that has one seeded */
  getBidMatrix(aobId: string): BidMatrix | null {
    if (aobId === 'aob-001') return MOCK_BID_MATRIX as BidMatrix
    if (aobId === 'aob-003') return MOCK_BID_MATRIX_003 as BidMatrix
    return null
  },

  /** Update bid matrix for an AOB */
  updateBidMatrix(aobId: string, bidMatrix: BidMatrix): BidMatrix {
    // Validate AOB exists
    const aob = store.find((a) => a.id === aobId)
    if (!aob) throw new Error(`AOB not found: ${aobId}`)
    
    // In a real implementation, this would persist the bid matrix
    // For now, we just validate and return it
    console.log(`Bid matrix updated for AOB ${aobId}`)
    return bidMatrix
  },

  /** Link an RFQ to an AOB */
  linkRFQ(id: string, rfqId: string, rfqNumber: string, rfqCategories: string[]): AOB {
    const aob = store.find((a) => a.id === id)
    if (!aob) throw new Error(`AOB not found: ${id}`)
    
    aob.rfqId = rfqId
    aob.rfqNumber = rfqNumber
    aob.rfqCategories = rfqCategories
    aob.updatedAt = new Date().toISOString()
    return aob
  },

  /** Select a winning supplier for a line item */
  selectWinner(aobId: string, lineItemId: string, supplierId: string, bidId: string) {
    const aob = store.find((a) => a.id === aobId)
    if (!aob) throw new Error(`AOB not found: ${aobId}`)
    
    // Return mock winner object
    return {
      id: `winner-${Date.now()}`,
      aobId,
      lineItemId,
      supplierId,
      bidId,
      selectedAt: new Date().toISOString(),
    }
  },
}
