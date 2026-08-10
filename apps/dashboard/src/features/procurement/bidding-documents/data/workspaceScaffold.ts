import type {
  BiddingDocumentPhaseKey,
  BiddingDocumentProgressState,
  BiddingDocumentRecord,
} from '../types'

export type BiddingDocumentPhaseScaffold = {
  key: BiddingDocumentPhaseKey
  title: string
  description: string
}

export const BIDDING_DOCUMENT_PHASE_SCAFFOLD: Array<BiddingDocumentPhaseScaffold> =
  [
    {
      key: 'prerequisites',
      title: 'Phase Gate',
      description:
        'Verify the upstream procurement workflow is ready before the PBD workspace unlocks.',
    },
    {
      key: 'structured-inputs',
      title: 'Phase 0A',
      description:
        'Capture the structured bidding-document fields that are not supplied by source systems.',
    },
    {
      key: 'section-uploads',
      title: 'Phase 0B',
      description:
        'Collect the externally prepared TWG files that will be inserted into the generated document.',
    },
    {
      key: 'generation-review',
      title: 'Phase 1 to 2',
      description:
        'Generate the document preview, review the assembled pages, and route corrections upstream when needed.',
    },
    {
      key: 'posting-lock',
      title: 'Phase 3',
      description:
        'Download the posting package, mark the PBD as posted, and lock the linked TC-01 schedule.',
    },
  ]

export function getActivePhase(
  record: BiddingDocumentRecord,
  progressOverride?: BiddingDocumentProgressState,
): BiddingDocumentPhaseKey {
  if (record.status === 'posted') {
    return 'posting-lock'
  }

  const prerequisitesPassed = Object.values(record.gates).every(Boolean)
  if (!prerequisitesPassed) {
    return 'prerequisites'
  }

  const progress = progressOverride ?? record.workspace?.progress
  if (!progress) {
    return 'structured-inputs'
  }

  const structuredComplete =
    progress.structuredInputs.complete === progress.structuredInputs.total
  if (!structuredComplete) {
    return 'structured-inputs'
  }

  const uploadsComplete = progress.uploads.complete === progress.uploads.total
  if (!uploadsComplete) {
    return 'section-uploads'
  }

  if (record.previewPages.length === 0 || record.needsRegeneration) {
    return 'generation-review'
  }

  return 'posting-lock'
}
