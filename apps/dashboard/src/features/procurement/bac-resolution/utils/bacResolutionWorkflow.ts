import type { BiddingSchedule } from '../../bidding-schedule/types'
import { useConsolidatedPRStore } from '../../consolidated-pr/store/consolidatedPRStore'
import type {
  BacProject,
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
  return (resolution.linkedConsolidatedPrs ?? [])[0] ?? null
}

export function hasExactlyOneLinkedConsolidatedPr(
  resolution: Pick<BacResolution, 'linkedConsolidatedPrs'>,
) {
  return (resolution.linkedConsolidatedPrs ?? []).length === 1
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
  const linkedPrs = resolution.linkedConsolidatedPrs ?? []

  // Grace period: newly created PB-origin records have no linked CPR yet.
  if (
    resolution.workspaceOrigin === 'public-bidding' &&
    linkedPrs.length === 0
  ) {
    return true
  }

  if (linkedPrs.length === 0) {
    return false
  }

  return linkedPrs.some((linkedPr) => isLinkedPrPublicBidding(linkedPr))
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

      return (resolution.linkedConsolidatedPrs ?? []).some(
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
          bacResolutionNumber:
            owner.resolutionNumber ??
            owner.bacResolutionNumber ??
            owner.id,
        }
        : null,
      isOwnedByCurrentResolution:
        owner?.id === currentResolutionId ||
        resolutions.some(
          (resolution) =>
            resolution.id === currentResolutionId &&
            (resolution.linkedConsolidatedPrs ?? []).some(
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

export function getBacResolutionScheduleById(_bacResolutionId: string): BiddingSchedule | null {
  return null
}

export function resolveBacScheduleEntryState({
  resolution,
  schedule = null,
}: {
  resolution: BacResolution
  role?: BacResolutionRole
  schedule?: BiddingSchedule | null
}): BacScheduleEntryState {
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

interface FlexibleProcurementModeContainer {
  procurementModeName?: string | null
  ProcurementModeName?: string | null
  modeOfProcurementName?: string | null
  ModeOfProcurementName?: string | null
  modeOfProcurement?: string | null
  ModeOfProcurement?: string | null
  procurementMode?: { name?: string | null } | string | null
  ProcurementMode?: { name?: string | null } | string | null
  id?: string | null
  cprNumber?: string | null
}

export function getBacProjectProcurementMode(project: BacProject | null | undefined): string {
  if (!project) return ''

  // 1. APP Item source mode
  const appItem = project.appItem as unknown as FlexibleProcurementModeContainer | undefined
  const appItemMode =
    appItem?.procurementModeName ||
    appItem?.ProcurementModeName ||
    (typeof appItem?.ProcurementMode === 'object' && appItem.ProcurementMode !== null ? appItem.ProcurementMode.name : null) ||
    (typeof appItem?.procurementMode === 'object' && appItem.procurementMode !== null ? appItem.procurementMode.name : null) ||
    appItem?.modeOfProcurement ||
    ''
  if (appItemMode) return appItemMode

  // 2. Consolidated PR source mode
  const cpr = project.consolidatedPR as unknown as FlexibleProcurementModeContainer | undefined
  const cprMode =
    cpr?.modeOfProcurementName ||
    cpr?.ModeOfProcurementName ||
    cpr?.modeOfProcurement ||
    cpr?.ModeOfProcurement ||
    (typeof cpr?.procurementMode === 'object' && cpr.procurementMode !== null ? cpr.procurementMode.name : null) ||
    (typeof cpr?.ProcurementMode === 'object' && cpr.ProcurementMode !== null ? cpr.ProcurementMode.name : null) ||
    ''
  if (cprMode) return cprMode

  // Check store for consolidated PR if needed
  if (project.consolidatedPRId || cpr?.id || cpr?.cprNumber) {
    const cprId = project.consolidatedPRId || cpr?.id
    const cprNum = cpr?.cprNumber
    const storePr = useConsolidatedPRStore
      .getState()
      .consolidatedPRs.find(
        (candidate) =>
          (cprId && candidate.id === cprId) ||
          (cprNum && candidate.prNumber === cprNum),
      )
    if (storePr) {
      const storePrCandidate = storePr as unknown as FlexibleProcurementModeContainer
      const storeMop =
        storePrCandidate.modeOfProcurementName ||
        storePrCandidate.modeOfProcurement ||
        ''
      if (storeMop) return storeMop
      if (storePr.itemMOPs) {
        const firstMop = Object.values(storePr.itemMOPs)[0]?.mop
        if (firstMop) {
          return firstMop === 'public-bidding'
            ? 'Public Bidding'
            : firstMop === 'limited-bidding' || firstMop === 'limited-source-bidding'
              ? 'Limited Source Bidding'
              : firstMop.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        }
      }
    }
  }

  // 3. Direct project procurement mode
  const projectContainer = project as unknown as FlexibleProcurementModeContainer
  const directMode =
    (typeof projectContainer.procurementMode === 'object' && projectContainer.procurementMode !== null
      ? projectContainer.procurementMode.name
      : typeof projectContainer.procurementMode === 'string'
        ? projectContainer.procurementMode
        : null) ||
    (typeof projectContainer.ProcurementMode === 'object' && projectContainer.ProcurementMode !== null
      ? projectContainer.ProcurementMode.name
      : null) ||
    projectContainer.procurementModeName ||
    ''
  return directMode
}

export function isBacProjectPublicBidding(project: BacProject | null | undefined): boolean {
  if (!project) return false
  const mode = getBacProjectProcurementMode(project).toLowerCase()
  if (
    mode.includes('public') ||
    mode.includes('competitive') ||
    mode.includes('bidding')
  ) {
    return true
  }
  return false
}

export function isBacProjectReadyForScheduling(
  project: BacProject | null | undefined,
): boolean {
  if (!project) return false
  const status = (project.status || '').toLowerCase()
  if (status !== 'approved') return false

  // Must be ConsolidatedPR source type
  const isConsolidatedPR =
    project.sourceType === 'ConsolidatedPR' ||
    String(project.sourceType) === '0'

  if (!isConsolidatedPR) return false

  // Must be Public Bidding procurement mode
  return isBacProjectPublicBidding(project)
}

export function getBacResolutionListRoutePath(_isPublicBiddingView?: boolean) {
  return '/v2/bac-resolutions' as BacResolutionListRoutePath
}

export function getBacResolutionScheduleRoutePath(
  _isPublicBiddingView?: boolean,
) {
  return '/v2/bac-resolutions/$resolutionId/bidding-schedule' as BacResolutionScheduleRoutePath
}

