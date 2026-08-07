import { describe, expect, it } from 'vitest'
import type { BacResolution } from '../types'
import {
  buildLinkableConsolidatedPrs,
  resolveBacExecutionState,
} from './bacResolutionWorkflow'

function createResolution(overrides: Partial<BacResolution>): BacResolution {
  return {
    id: 'bac-resolution-test',
    bacResolutionNumber: 'BAC-RES-2026-TEST',
    resolutionDate: '2026-05-01',
    description: 'Test BAC Resolution',
    status: 'approved',
    createdBy: 'Tester',
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
    totalAmount: 1000,
    linkedConsolidatedPrs: [],
    activityLog: [],
    returnReason: null,
    approvedBy: 'Tester',
    approvedAt: '2026-05-01T00:00:00.000Z',
    signedDocumentFileName: null,
    printFileName: null,
    ...overrides,
  }
}

describe('resolveBacExecutionState', () => {
  it('keeps approved records with no schedule in Ready for Scheduling', () => {
    expect(
      resolveBacExecutionState({
        resolution: createResolution({}),
        schedule: null,
        biddingDocumentStatus: null,
      }),
    ).toEqual({
      primaryLabel: 'Ready for Scheduling',
      secondaryLabel: null,
      helperText:
        'This BAC Resolution is approved and ready to move into TC-01 scheduling.',
    })
  })

  it('keeps approved records with a draft schedule in Ready for Scheduling', () => {
    expect(
      resolveBacExecutionState({
        resolution: createResolution({}),
        schedule: { status: 'draft' },
        biddingDocumentStatus: null,
      }),
    ).toMatchObject({
      primaryLabel: 'Ready for Scheduling',
      secondaryLabel: null,
    })
  })

  it('shows Scheduled with Posted for confirmed schedules that already posted', () => {
    expect(
      resolveBacExecutionState({
        resolution: createResolution({}),
        schedule: { status: 'confirmed' },
        biddingDocumentStatus: 'posted',
      }),
    ).toMatchObject({
      primaryLabel: 'Scheduled',
      secondaryLabel: 'Posted',
    })
  })

  it('suppresses derived execution labels for non-approved records', () => {
    expect(
      resolveBacExecutionState({
        resolution: createResolution({ status: 'returned' }),
        schedule: { status: 'locked' },
        biddingDocumentStatus: 'posted',
      }),
    ).toEqual({
      primaryLabel: null,
      secondaryLabel: null,
      helperText: null,
    })
  })
})

describe('buildLinkableConsolidatedPrs', () => {
  it('marks Consolidated PRs owned by another BAC Resolution as blocked', () => {
    const resolutions = [
      createResolution({
        id: 'bac-resolution-001',
        bacResolutionNumber: 'BAC-RES-2026-001',
        linkedConsolidatedPrs: [
          {
            id: 'pr-1',
            prNumber: 'PR-1',
            description: 'Owned elsewhere',
            endUser: 'Office A',
            projectName: 'Project A',
            amount: 100,
            modeOfProcurement: 'Public Bidding',
            status: 'approved',
          },
        ],
      }),
      createResolution({
        id: 'bac-resolution-002',
        bacResolutionNumber: 'BAC-RES-2026-002',
      }),
    ]

    const options = buildLinkableConsolidatedPrs({
      availablePrs: [
        {
          id: 'pr-1',
          prNumber: 'PR-1',
          description: 'Owned elsewhere',
          endUser: 'Office A',
          projectName: 'Project A',
          amount: 100,
          modeOfProcurement: 'Public Bidding',
          status: 'approved',
        },
      ],
      resolutions,
      currentResolutionId: 'bac-resolution-002',
    })

    expect(options[0]).toMatchObject({
      isOwnedByAnotherResolution: true,
      owner: {
        bacResolutionId: 'bac-resolution-001',
        bacResolutionNumber: 'BAC-RES-2026-001',
      },
    })
  })
})
