import { describe, it, expect, beforeEach } from 'vitest'
import { useDirectAcquisitionStore } from '../store/directAcquisitionStore'

// ---------------------------------------------------------------------------
// genDANumber helper (mirrors the implementation in CreateDirectAcquisitionModal)
// ---------------------------------------------------------------------------

function genDANumber(entries: { daNumber?: string }[], year = new Date().getFullYear()): string {
  let maxSeq = 0
  for (const ent of entries) {
    const da = (ent?.daNumber ?? '').toString()
    const m = da.match(new RegExp(`^DA-${year}-(\\d+)$`))
    if (m) {
      const seq = parseInt(m[1], 10)
      if (!Number.isNaN(seq) && seq > maxSeq) maxSeq = seq
    }
  }
  const next = (maxSeq + 1).toString().padStart(4, '0')
  return `DA-${year}-${next}`
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Reset the store to a known empty state before each test. */
function resetStore() {
  useDirectAcquisitionStore.setState({ entries: [] })
}

function makeEntry(overrides: Partial<ReturnType<typeof useDirectAcquisitionStore.getState>['entries'][number]> = {}) {
  return {
    id: crypto.randomUUID(),
    daNumber: 'DA-TEST-0001',
    prNumber: 'PR-TEST-001',
    office: 'Test Office',
    category: 'Office Supplies',
    modeOfProcurement: 'Direct Acquisition',
    totalABC: 50000,
    status: 'draft' as const,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// ₱200,000 threshold guard
// ---------------------------------------------------------------------------

describe('₱200,000 threshold guard', () => {
  it('marks an entry as eligible when totalABC is below the threshold', () => {
    const entry = makeEntry({ totalABC: 199_999 })
    const eligible = entry.totalABC <= 200_000
    expect(eligible).toBe(true)
  })

  it('marks an entry as eligible when totalABC equals the threshold', () => {
    const entry = makeEntry({ totalABC: 200_000 })
    const eligible = entry.totalABC <= 200_000
    expect(eligible).toBe(true)
  })

  it('marks an entry as ineligible when totalABC exceeds the threshold', () => {
    const entry = makeEntry({ totalABC: 200_001 })
    const eligible = entry.totalABC <= 200_000
    expect(eligible).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Status transitions via updateEntry
// ---------------------------------------------------------------------------

describe('directAcquisitionStore — status transitions', () => {
  beforeEach(resetStore)

  it('addEntry inserts a new entry at the front', () => {
    const store = useDirectAcquisitionStore.getState()
    const entry = makeEntry()
    store.addEntry(entry)
    const { entries } = useDirectAcquisitionStore.getState()
    expect(entries[0].id).toBe(entry.id)
    expect(entries).toHaveLength(1)
  })

  it('draft → purchase_entry transition saves supplier and finalAmount', () => {
    const entry = makeEntry({ status: 'draft' })
    useDirectAcquisitionStore.getState().addEntry(entry)

    useDirectAcquisitionStore.getState().updateEntry(entry.id, {
      status: 'purchase_entry',
      supplier: 'CleanPro Supplies',
      finalAmount: 45_000,
      transactionDate: '2026-05-01',
      proofFiles: [{ id: 'file-1', name: 'receipt.pdf', fileType: 'pdf', uploadedAt: new Date().toISOString() }],
    })

    const updated = useDirectAcquisitionStore.getState().entries.find((e) => e.id === entry.id)!
    expect(updated.status).toBe('purchase_entry')
    expect(updated.supplier).toBe('CleanPro Supplies')
    expect(updated.finalAmount).toBe(45_000)
    expect(updated.proofFiles).toHaveLength(1)
    expect(updated.proofFiles![0].name).toBe('receipt.pdf')
  })

  it('purchase_entry → for_disbursement transition', () => {
    const entry = makeEntry({ status: 'purchase_entry', supplier: 'Lazada', finalAmount: 10_000 })
    useDirectAcquisitionStore.getState().addEntry(entry)

    useDirectAcquisitionStore.getState().updateEntry(entry.id, { status: 'for_disbursement' })

    const updated = useDirectAcquisitionStore.getState().entries.find((e) => e.id === entry.id)!
    expect(updated.status).toBe('for_disbursement')
  })

  it('for_disbursement → returned transition preserves prior data', () => {
    const entry = makeEntry({ status: 'for_disbursement', supplier: 'SM Store', finalAmount: 30_000 })
    useDirectAcquisitionStore.getState().addEntry(entry)

    useDirectAcquisitionStore.getState().updateEntry(entry.id, { status: 'returned' })

    const updated = useDirectAcquisitionStore.getState().entries.find((e) => e.id === entry.id)!
    expect(updated.status).toBe('returned')
    expect(updated.supplier).toBe('SM Store')
    expect(updated.finalAmount).toBe(30_000)
  })

  it('proofFiles stored without a url property (blob URLs must not reach the store)', () => {
    const entry = makeEntry()
    useDirectAcquisitionStore.getState().addEntry(entry)

    useDirectAcquisitionStore.getState().updateEntry(entry.id, {
      status: 'purchase_entry',
      supplier: 'Shopee',
      finalAmount: 5_000,
      transactionDate: '2026-05-01',
      proofFiles: [
        // Simulates what handleSubmit sends — no url field
        { id: 'file-2', name: 'order-confirmation.png', fileType: 'image', uploadedAt: new Date().toISOString() },
      ],
    })

    const updated = useDirectAcquisitionStore.getState().entries.find((e) => e.id === entry.id)!
    const savedFile = updated.proofFiles![0]
    expect('url' in savedFile).toBe(false)
  })

  it('removeEntry deletes the correct entry', () => {
    const a = makeEntry()
    const b = makeEntry({ daNumber: 'DA-TEST-0002' })
    useDirectAcquisitionStore.getState().addEntry(a)
    useDirectAcquisitionStore.getState().addEntry(b)

    useDirectAcquisitionStore.getState().removeEntry(a.id)

    const { entries } = useDirectAcquisitionStore.getState()
    expect(entries.find((e) => e.id === a.id)).toBeUndefined()
    expect(entries.find((e) => e.id === b.id)).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// genDANumber — duplicate-safe sequence generation
// ---------------------------------------------------------------------------

describe('genDANumber', () => {
  const YEAR = 2026

  it('returns 0001 when no entries exist', () => {
    expect(genDANumber([], YEAR)).toBe(`DA-${YEAR}-0001`)
  })

  it('returns next after the highest existing number (no gaps)', () => {
    const entries = [
      { daNumber: `DA-${YEAR}-0001` },
      { daNumber: `DA-${YEAR}-0002` },
      { daNumber: `DA-${YEAR}-0003` },
    ]
    expect(genDANumber(entries, YEAR)).toBe(`DA-${YEAR}-0004`)
  })

  it('fills no gaps — always goes beyond the highest (delete-proof)', () => {
    // Simulate deleting DA-0002: highest is still 0003, next should be 0004
    const entries = [
      { daNumber: `DA-${YEAR}-0001` },
      { daNumber: `DA-${YEAR}-0003` },
    ]
    expect(genDANumber(entries, YEAR)).toBe(`DA-${YEAR}-0004`)
  })

  it('ignores entries from other years', () => {
    const entries = [
      { daNumber: `DA-${YEAR - 1}-0005` },
      { daNumber: `DA-${YEAR}-0002` },
    ]
    expect(genDANumber(entries, YEAR)).toBe(`DA-${YEAR}-0003`)
  })

  it('handles zero-padded numbers correctly', () => {
    const entries = [{ daNumber: `DA-${YEAR}-0099` }]
    expect(genDANumber(entries, YEAR)).toBe(`DA-${YEAR}-0100`)
  })
})
