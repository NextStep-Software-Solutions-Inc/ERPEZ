import { describe, expect, it } from 'vitest'
import { mockPpmpDatabase } from '../data/mockPpmpData'
import {
  getValidationErrors,
  hasItemProcurementMetadata,
  isPpmpReadyForSubmission,
} from './ppmpValidation'

describe('ppmpValidation procurement metadata rules', () => {
  it('treats a seeded line item as having complete procurement metadata', () => {
    const item = mockPpmpDatabase[0].activityBlocks[0].ioEBlocks[0].items[0]

    expect(hasItemProcurementMetadata(item)).toBe(true)
  })

  it('reports missing procurement metadata when MM/YYYY or ordering is invalid', () => {
    const activityBlocks = structuredClone(mockPpmpDatabase[0].activityBlocks)
    const item = activityBlocks[0].ioEBlocks[0].items[0]

    item.procurementStart = '11/2026'
    item.procurementEnd = '02/2026'
    item.expectedDelivery = '11/2026'

    const errors = getValidationErrors(activityBlocks, false)

    expect(
      errors.some(
        (error) => error.type === 'missing-procurement-metadata',
      ),
    ).toBe(true)
    expect(isPpmpReadyForSubmission(activityBlocks, false)).toBe(false)
  })

  it('requires expected delivery for procurable line items', () => {
    const activityBlocks = structuredClone(mockPpmpDatabase[0].activityBlocks)
    const item = activityBlocks[0].ioEBlocks[0].items[0]

    item.expectedDelivery = ''

    expect(hasItemProcurementMetadata(item)).toBe(false)
    expect(isPpmpReadyForSubmission(activityBlocks, false)).toBe(false)
  })
})