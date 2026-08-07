import { beforeEach, describe, expect, it } from 'vitest'
import {
  getMockBacResolutionDatabase,
  resetMockBacResolutionDatabase,
} from './mockBacResolutionData'

describe('mockBacResolutionData', () => {
  beforeEach(() => {
    resetMockBacResolutionDatabase()
  })

  it('keeps every approved BAC linked to exactly one Consolidated PR', () => {
    const approved = getMockBacResolutionDatabase().filter(
      (resolution) => resolution.status === 'approved',
    )

    expect(approved).toHaveLength(10)
    expect(
      approved.every(
        (resolution) => resolution.linkedConsolidatedPrs.length === 1,
      ),
    ).toBe(true)
  })

  it('includes both public-bidding and non-public-bidding approved cases', () => {
    const approved = getMockBacResolutionDatabase().filter(
      (resolution) => resolution.status === 'approved',
    )

    const modes = approved.map(
      (resolution) => resolution.linkedConsolidatedPrs[0]?.modeOfProcurement,
    )

    expect(modes).toContain('Public Bidding')
    expect(modes.some((mode) => mode !== 'Public Bidding')).toBe(true)
  })
})
