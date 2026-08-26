import type { BiddingSchedule } from '../../bidding-schedule/types'
import { useBiddingScheduleStore } from '../../bidding-schedule/store/biddingScheduleStore'
import { useConsolidatedPRStore } from '../../consolidated-pr/store/consolidatedPRStore'
import type {
  BacResolution,
  BacResolutionListRoutePath,
  BacResolutionRole,
  BacResolutionScheduleRoutePath,
  ConsolidatedPrLink,
} from '../types'

export type BacExecutionPrimaryLabel =
  'Ready for Scheduling' | 'Scheduled' | 'Completed'

export type BacExecutionState = {
  primaryLabel: BacExecutionPrimaryLabel | null
  secondaryLabel: 'Posted' | null
  helperText: string | null
}

export type ConsolidatedPrOwnership = {
  bacResolutionId: string
  bacResolutionNumber: string
}

export type LinkableConsolidatedPr = ConsolidatedPrLink & {
  owner: ConsolidatedPrOwnership | null
  isOwnedByCurrentResolution: boolean
  isOwnedByAnotherResolution: boolean
}

export type BacScheduleEntryState = {
  schedule: BiddingSchedule | null
  isPublicBidding: boolean
  hasStrictOwnership: boolean
  canGenerateSchedule: boolean
  canOpenSchedule: boolean
  showBlockedScheduleAction: boolean
  isProvisional: boolean
}

function isLinkedPrPublicBidding(linkedPr: ConsolidatedPrLink) {
  const consolidatedPr = useConsolidatedPRStore
    .getState()
    .consolidatedPRs.find(
      (candidate) =>
        candidate.id === linkedPr.id ||
        candidate.prNumber === linkedPr.prNumber,
    )

  if (consolidatedPr) {
    return Object.values(consolidatedPr.itemMOPs ?? {}).some(
      (itemMop) =>
        itemMop.mop === 'public-bidding' ||
        itemMop.mop === 'limited-bidding' ||
        itemMop.mop === 'limited-source-bidding' ||
        itemMop.mop?.toLowerCase().includes('limited'),
    )
  }

  const mop = (linkedPr.modeOfProcurement || '').trim().toLowerCase()
  return mop === 'public bidding' || mop.includes('limited')
}

export function getPrimaryLinkedConsolidatedPr(
  resolution: Pick<BacResolution, 'linkedConsolidatedPrs'>,
) {
  return resolution.linkedConsolidatedPrs[0] ?? null
}

export function hasExactlyOneLinkedConsolidatedPr(
  resolution: Pick<BacResolution, 'linkedConsolidatedPrs'>,
) {
  return resolution.linkedConsolidatedPrs.length === 1
}

export function isBacResolutionPublicBiddingEligible(
  resolution: Pick<BacResolution, 'linkedConsolidatedPrs'>,
) {
  const linkedPr = getPrimaryLinkedConsolidatedPr(resolution)

  if (!linkedPr) {
    return false
  }

  return isLinkedPrPublicBidding(linkedPr)
}

export function isBacResolutionInPublicBiddingScope(
  resolution: Pick<BacResolution, 'linkedConsolidatedPrs' | 'workspaceOrigin'>,
) {
  // Grace period: newly created PB-origin records have no linked CPR yet.
  if (
    resolution.workspaceOrigin === 'public-bidding' &&
    resolution.linkedConsolidatedPrs.length === 0
  ) {
    return true
  }

  if (resolution.linkedConsolidatedPrs.length === 0) {
    return false
  }

  return resolution.linkedConsolidatedPrs.some((linkedPr) =>
    isLinkedPrPublicBidding(linkedPr),
  )
}

export function findOwningBacResolution(
  resolutions: BacResolution[],
  consolidatedPrId: string,
  currentResolutionId?: string,
) {
  return (
    resolutions.find((resolution) => {
      if (resolution.id === currentResolutionId) {
        return false
      }

      return resolution.linkedConsolidatedPrs.some(
        (linkedPr) =>
          linkedPr.id === consolidatedPrId ||
          linkedPr.prNumber === consolidatedPrId,
      )
    }) ?? null
  )
}

export function buildLinkableConsolidatedPrs({
  availablePrs,
  resolutions,
  currentResolutionId,
}: {
  availablePrs: ConsolidatedPrLink[]
  resolutions: BacResolution[]
  currentResolutionId: string
}): LinkableConsolidatedPr[] {
  return availablePrs.map((pr) => {
    const owner = findOwningBacResolution(
      resolutions,
      pr.id,
      currentResolutionId,
    )

    return {
      ...pr,
      owner: owner
        ? {
            bacResolutionId: owner.id,
            bacResolutionNumber: owner.bacResolutionNumber,
          }
        : null,
      isOwnedByCurrentResolution:
        owner?.id === currentResolutionId ||
        resolutions.some(
          (resolution) =>
            resolution.id === currentResolutionId &&
            resolution.linkedConsolidatedPrs.some(
              (linkedPr) =>
                linkedPr.id === pr.id || linkedPr.prNumber === pr.prNumber,
            ),
        ),
      isOwnedByAnotherResolution: owner !== null,
    }
  })
}

export function resolveBacExecutionState({
  resolution,
  schedule,
  biddingDocumentStatus,
}: {
  resolution: Pick<BacResolution, 'status'>
  schedule?: Pick<BiddingSchedule, 'status'> | null
  biddingDocumentStatus?: 'draft' | 'generated' | 'posted' | null
}): BacExecutionState {
  if (resolution.status !== 'approved') {
    return {
      primaryLabel: null,
      secondaryLabel: null,
      helperText: null,
    }
  }

  if (!schedule || schedule.status === 'draft') {
    return {
      primaryLabel: 'Ready for Scheduling',
      secondaryLabel: biddingDocumentStatus === 'posted' ? 'Posted' : null,
      helperText:
        schedule?.status === 'draft'
          ? 'Scheduling has started, but the BAC calendar is still awaiting confirmation.'
          : 'This BAC Resolution is approved and ready to move into TC-01 scheduling.',
    }
  }

  if (schedule.status === 'confirmed') {
    return {
      primaryLabel: 'Scheduled',
      secondaryLabel: biddingDocumentStatus === 'posted' ? 'Posted' : null,
      helperText:
        'The bidding schedule is confirmed and the record is ready for downstream document work.',
    }
  }

  return {
    primaryLabel: 'Completed',
    secondaryLabel: biddingDocumentStatus === 'posted' ? 'Posted' : null,
    helperText:
      biddingDocumentStatus === 'posted'
        ? 'The schedule is locked and the related bidding document has been posted.'
        : 'The bidding schedule is locked and execution milestones are complete.',
  }
}

export function getBacResolutionScheduleById(bacResolutionId: string) {
  const scheduleStoreSchedules = useBiddingScheduleStore.getState().schedules

  return (
    scheduleStoreSchedules.find(
      (candidate) => candidate.bacResolutionId === bacResolutionId,
    ) ??
    ([] as BiddingSchedule[]).find(
      (candidate) => candidate.bacResolutionId === bacResolutionId,
    ) ??
    null
  )
}

export function resolveBacScheduleEntryState({
  resolution,
}: {
  resolution: BacResolution
  role: BacResolutionRole
}): BacScheduleEntryState {
  const schedule = getBacResolutionScheduleById(resolution.id)
  const isPublicBidding = isBacResolutionInPublicBiddingScope(resolution)
  const hasStrictOwnership = hasExactlyOneLinkedConsolidatedPr(resolution)
  const isApproved = resolution.status === 'approved'
  const isDraftWithPbOwnership =
    resolution.status === 'draft' && isPublicBidding && hasStrictOwnership

  return {
    schedule,
    isPublicBidding,
    hasStrictOwnership,
    canGenerateSchedule:
      (isApproved || isDraftWithPbOwnership) &&
      isPublicBidding &&
      hasStrictOwnership &&
      schedule === null,
    canOpenSchedule:
      (isApproved || isDraftWithPbOwnership) &&
      isPublicBidding &&
      hasStrictOwnership &&
      schedule !== null,
    showBlockedScheduleAction:
      (isApproved || isDraftWithPbOwnership) &&
      isPublicBidding &&
      !hasStrictOwnership,
    isProvisional: isDraftWithPbOwnership && schedule !== null,
  }
}

export function getBacResolutionListRoutePath(isPublicBiddingView: boolean) {
  return (
    isPublicBiddingView
      ? '/v2/bac-resolutions-public-bidding'
      : '/v2/bac-resolutions'
  ) as BacResolutionListRoutePath
}

export function getBacResolutionScheduleRoutePath(
  isPublicBiddingView: boolean,
) {
  return (
    isPublicBiddingView
      ? '/v2/bac-resolutions-public-bidding/$resolutionId/bidding-schedule'
      : '/v2/bac-resolutions/$resolutionId/bidding-schedule'
  ) as BacResolutionScheduleRoutePath
}
