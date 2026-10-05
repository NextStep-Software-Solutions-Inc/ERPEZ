// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockStorage = vi.hoisted(() => {
  let store: Record<string, string> = {}
  const storage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  }
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    writable: true,
  })
  return storage
})

import { getMockBiddingDocumentDatabase } from '../data/mockBiddingDocumentsData'
import { useBiddingScheduleStore } from '../../bidding-schedule/store/biddingScheduleStore'
import { useBiddingDocumentsStore } from './biddingDocumentsStore'

function resetStores() {
  mockStorage.clear()
  useBiddingScheduleStore.setState({ schedules: [], mockGates: {} })
  useBiddingDocumentsStore.setState({
    documents: getMockBiddingDocumentDatabase(),
  })
}

describe('biddingDocumentsStore', () => {
  beforeEach(resetStores)

  it('flags a generated document for regeneration after a structured field edit', () => {
    const store = useBiddingDocumentsStore.getState()
    const document = store.getDocumentByResolutionId('bac-resolution-007')

    expect(document).toBeDefined()

    store.updateStructuredField(
      document!.id,
      'deliveryPeriod',
      '150 calendar days from receipt of NTP',
    )

    const updated = useBiddingDocumentsStore
      .getState()
      .getDocumentByResolutionId('bac-resolution-007')

    expect(updated?.needsRegeneration).toBe(true)
    expect(updated?.structuredFields.deliveryPeriod).toBe(
      '150 calendar days from receipt of NTP',
    )
  })

  it('generatePreview builds preview pages and clears the regeneration flag', () => {
    const store = useBiddingDocumentsStore.getState()
    const document = store.getDocumentByResolutionId('bac-resolution-006')

    store.updateStructuredField(document!.id, 'lotGrouping', 'Single package')
    store.generatePreview(document!.id)

    const updated = useBiddingDocumentsStore
      .getState()
      .getDocumentByResolutionId('bac-resolution-006')

    expect(updated?.status).toBe('generated')
    expect(updated?.needsRegeneration).toBe(false)
    expect(updated?.previewPages.length).toBeGreaterThan(0)
    expect(updated?.generatedAt).toBeTruthy()
  })

  it('markPosted keeps posted mock scenarios aligned with the linked schedule state', () => {
    const scheduleStore = useBiddingScheduleStore.getState()
    const documentStore = useBiddingDocumentsStore.getState()

    const schedule = scheduleStore.createSchedule({
      bacResolutionId: 'bac-resolution-006',
      bacResolutionNumber: 'BAC-RES-2026-006',
      ibPostingDate: '2026-06-10',
      procurementCategory: 'goods',
      createdBy: 'BAC Secretariat Demo',
    })

    scheduleStore.confirmSchedule({
      scheduleId: schedule.id,
      confirmedBy: 'BAC Secretariat Demo',
    })

    const document =
      documentStore.getDocumentByResolutionId('bac-resolution-006')
    expect(document).toBeDefined()

    documentStore.replaceUpload(document!.id, 'scheduleOfRequirements', {
      fileName: 'schedule-of-requirements.xlsx',
      sizeBytes: 512_000,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'BAC Secretariat Demo',
    })
    documentStore.replaceUpload(document!.id, 'specialConditions', {
      fileName: 'special-conditions.pdf',
      sizeBytes: 428_000,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'BAC Secretariat Demo',
    })
    documentStore.generatePreview(document!.id)
    documentStore.markPosted(document!.id, 'BAC Secretariat Demo')

    const updatedDocument = useBiddingDocumentsStore
      .getState()
      .getDocumentByResolutionId('bac-resolution-006')
    const updatedSchedule = useBiddingScheduleStore
      .getState()
      .getScheduleByResolutionId('bac-resolution-006')

    expect(updatedDocument?.status).toBe('posted')
    expect(updatedDocument?.postedBy).toBe('BAC Secretariat Demo')
    expect(updatedSchedule?.status).toBe('locked')
    expect(updatedSchedule?.lockedBy).toBe('BAC Secretariat Demo')
  })
})
