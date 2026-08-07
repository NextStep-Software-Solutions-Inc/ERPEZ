import { describe, expect, it } from 'vitest'
import {
  getMockBacResolutionDatabase,
  getMockConsolidatedPrDatabase,
  resetMockBacResolutionDatabase,
} from '../data/mockBacResolutionData'
import { approveBacResolutionRequest } from './approveBacResolutionRequest'

describe('approveBacResolutionRequest', () => {
  it('rejects approval when the BAC has no linked Consolidated PR', async () => {
    resetMockBacResolutionDatabase()

    const resolution = getMockBacResolutionDatabase().find(
      (item) => item.id === 'bac-resolution-002',
    )

    expect(resolution).toBeTruthy()
    if (!resolution) return

    resolution.linkedConsolidatedPrs = []

    await expect(
      approveBacResolutionRequest.fetcher({
        finalUrl: 'http://localhost/bac-resolutions/bac-resolution-002/approve',
        payload: {
          bacResolutionId: 'bac-resolution-002',
          signedDocument: { name: 'signed-bac.pdf' } as File,
        },
      }),
    ).rejects.toThrow(
      'Link exactly one approved Consolidated PR before approving.',
    )
  })

  it('approves a for-approval BAC with exactly one linked Consolidated PR', async () => {
    resetMockBacResolutionDatabase()

    const resolution = getMockBacResolutionDatabase().find(
      (item) => item.id === 'bac-resolution-002',
    )
    const linkedPr = getMockConsolidatedPrDatabase()[0]

    expect(resolution).toBeTruthy()
    expect(linkedPr).toBeTruthy()

    resolution!.linkedConsolidatedPrs = [{ ...linkedPr }]

    const result = await approveBacResolutionRequest.fetcher({
      finalUrl: 'http://localhost/bac-resolutions/bac-resolution-002/approve',
      payload: {
        bacResolutionId: 'bac-resolution-002',
        signedDocument: { name: 'signed-bac.pdf' } as File,
      },
    })

    expect(result.status).toBe('approved')
    expect(result.approvedBy).toBe('BAC Chairperson Demo')
    expect(result.linkedConsolidatedPrs).toHaveLength(1)
  })
})
