import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  useBiddingSchedule,
  useConfirmBiddingSchedule,
  useCreateBiddingSchedule,
  useRegenerateBiddingSchedule,
  useSetMilestoneCompletion,
  useUpdateMilestone,
} from '../handlers/hooks'
import { useBiddingScheduleStore } from '../store/biddingScheduleStore'
import {
  DEFAULT_MOCK_GATES,
  MOCK_INTERVAL_CONFIGS,
} from '../data/mockBiddingScheduleData'
import { getMockBacResolutionById } from '../../bac-resolution/data/mockBacResolutionData'
import {
  hasExactlyOneLinkedConsolidatedPr,
  isBacResolutionPublicBiddingEligible,
} from '../../bac-resolution/utils/bacResolutionWorkflow'
import type {
  BiddingMilestone,
  MockPrerequisiteGates,
  PrerequisiteGateResult,
  SetMilestoneCompletionPayload,
  UpdateMilestonePayload,
} from '../types'
import type { GenerateScheduleFormValues } from '../forms/GenerateScheduleForm'

// ─── Shared mock identity ─────────────────────────────────────────────────────

/** Placeholder current-user string for all mock write operations. */
export const MOCK_CURRENT_USER = 'current-user'

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBiddingScheduleWorkspaceState(bacResolutionId: string) {
  // ── BAC Resolution ─────────────────────────────────────────────────────────
  // Stabilize the lookup so downstream memos don't churn on every render.
  const bacResolution = useMemo(
    () => getMockBacResolutionById(bacResolutionId) ?? null,
    [bacResolutionId],
  )

  // ── Schedule query ─────────────────────────────────────────────────────────
  const { data: scheduleData, isLoading: isScheduleLoading } =
    useBiddingSchedule(bacResolutionId)

  const schedule = scheduleData ?? null

  // ── Mock gates from store ──────────────────────────────────────────────────
  // Read the raw per-resolution overrides and merge defaults locally so the
  // selector stays referentially stable.
  const mockGateOverrides = useBiddingScheduleStore(
    (state) => state.mockGates[bacResolutionId],
  )
  const mockGates = useMemo(
    () => ({
      ...DEFAULT_MOCK_GATES,
      ...mockGateOverrides,
    }),
    [mockGateOverrides],
  )
  const toggleMockGate = useBiddingScheduleStore(
    (state) => state.toggleMockGate,
  )

  const handleToggleMockGate = useCallback(
    (gate: keyof MockPrerequisiteGates) => {
      toggleMockGate(bacResolutionId, gate)
    },
    [bacResolutionId, toggleMockGate],
  )

  // ── Prerequisite gate derivation ───────────────────────────────────────────
  // Reconciliation rule:
  //   - Actual BAC approval and PR linkage are hard floors — they must be true
  //     in the real data regardless of what the dev mock toggles say.
  //   - Mock toggles can only further restrict readiness (they are ANDed with
  //     the actual state), never inflate a failing real gate to passing.
  const gates = useMemo((): PrerequisiteGateResult => {
    const actualBacApproved = bacResolution?.status === 'approved'
    const actualPrLinked = bacResolution
      ? hasExactlyOneLinkedConsolidatedPr(bacResolution)
      : false
    const actualPublicBidding = bacResolution
      ? isBacResolutionPublicBiddingEligible(bacResolution)
      : false
    const actualBacIssued = Boolean(bacResolution?.approvedAt)
    // In PB draft mode (draft BAC with PB CPR linked), the approval/issued
    // gates are replaced by a single "PB CPR Linked" gate.
    const isDraftPbMode =
      bacResolution?.status === 'draft' && actualPublicBidding && actualPrLinked

    const consolidatedPrLinked =
      mockGates.consolidatedPrLinked && actualPrLinked
    const bacResolutionApproved = isDraftPbMode
      ? true
      : mockGates.bacResolutionApproved && actualBacApproved
    const bacResolutionPublicBidding =
      mockGates.bacResolutionPublicBidding && actualPublicBidding
    const bacResolutionIssued = isDraftPbMode
      ? true
      : mockGates.bacResolutionIssued && actualBacIssued
    const pbCprLinked = isDraftPbMode
      ? (mockGates.pbCprLinked ?? true) && actualPrLinked && actualPublicBidding
      : true
    const intervalConfigExists = mockGates.intervalConfigExists
    const holidaysTableExists = mockGates.holidaysTableExists

    const allPassed = isDraftPbMode
      ? consolidatedPrLinked &&
        pbCprLinked &&
        bacResolutionPublicBidding &&
        intervalConfigExists &&
        holidaysTableExists
      : consolidatedPrLinked &&
        bacResolutionApproved &&
        bacResolutionPublicBidding &&
        bacResolutionIssued &&
        intervalConfigExists &&
        holidaysTableExists

    return {
      consolidatedPrLinked,
      bacResolutionApproved,
      bacResolutionPublicBidding,
      bacResolutionIssued,
      pbCprLinked,
      intervalConfigExists,
      holidaysTableExists,
      allPassed,
    }
  }, [bacResolution, mockGates])

  // ── Dialog open state ──────────────────────────────────────────────────────
  const [generateOpen, setGenerateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(
    null,
  )

  // ── Dialog open handlers ───────────────────────────────────────────────────
  const handleOpenGenerate = useCallback(() => setGenerateOpen(true), [])

  const handleOpenEdit = useCallback((milestone: BiddingMilestone) => {
    setSelectedMilestoneId(milestone.id)
    setEditOpen(true)
  }, [])

  const handleOpenConfirm = useCallback(() => setConfirmOpen(true), [])

  // ── Derived milestone selection ────────────────────────────────────────────
  const selectedMilestone = useMemo((): BiddingMilestone | null => {
    if (!schedule || !selectedMilestoneId) return null
    return schedule.milestones.find((m) => m.id === selectedMilestoneId) ?? null
  }, [schedule, selectedMilestoneId])

  const selectedMilestonePrevious = useMemo((): BiddingMilestone | null => {
    if (!schedule || !selectedMilestone) return null
    const idx = schedule.milestones.findIndex(
      (m) => m.id === selectedMilestone.id,
    )
    return idx > 0 ? (schedule.milestones[idx - 1] ?? null) : null
  }, [schedule, selectedMilestone])

  const selectedMilestoneIntervalConfig = useMemo(() => {
    if (!schedule || !selectedMilestone) return null
    const config = MOCK_INTERVAL_CONFIGS[schedule.procurementCategory]
    return (
      config.milestones.find(
        (m) => m.milestoneKey === selectedMilestone.milestoneKey,
      ) ?? null
    )
  }, [schedule, selectedMilestone])

  // ── Mutations ──────────────────────────────────────────────────────────────
  const { mutateAsync: createSchedule, isPending: isCreating } =
    useCreateBiddingSchedule()
  const { mutateAsync: regenerateSchedule, isPending: isRegenerating } =
    useRegenerateBiddingSchedule()
  const { mutateAsync: updateMilestone, isPending: isUpdatingMilestone } =
    useUpdateMilestone()
  const {
    mutateAsync: setMilestoneCompletion,
    isPending: isSettingMilestoneCompletion,
  } = useSetMilestoneCompletion()
  const { mutateAsync: confirmSchedule, isPending: isConfirming } =
    useConfirmBiddingSchedule()

  // ── Mutation handlers ──────────────────────────────────────────────────────

  const handleCreateSchedule = useCallback(
    async (values: GenerateScheduleFormValues) => {
      if (!bacResolution) return
      try {
        await createSchedule({
          bacResolutionId,
          bacResolutionNumber: bacResolution.bacResolutionNumber,
          procurementCategory: values.procurementCategory,
          ibPostingDate: values.ibPostingDate,
          createdBy: MOCK_CURRENT_USER,
        })
        toast.success('Bidding schedule generated.')
        setGenerateOpen(false)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to generate bidding schedule.',
        )
      }
    },
    [bacResolution, bacResolutionId, createSchedule],
  )

  const handleRegenerateSchedule = useCallback(
    async (values: GenerateScheduleFormValues) => {
      if (!bacResolution) return
      try {
        await regenerateSchedule({
          bacResolutionId,
          bacResolutionNumber: bacResolution.bacResolutionNumber,
          procurementCategory: values.procurementCategory,
          ibPostingDate: values.ibPostingDate,
          createdBy: MOCK_CURRENT_USER,
        })
        toast.success('Bidding schedule regenerated.')
        setGenerateOpen(false)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to regenerate bidding schedule.',
        )
      }
    },
    [bacResolution, bacResolutionId, regenerateSchedule],
  )

  const handleUpdateMilestone = useCallback(
    async (payload: UpdateMilestonePayload) => {
      try {
        await updateMilestone(payload)
        toast.success('Milestone updated.')
        setEditOpen(false)
        setSelectedMilestoneId(null)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to update milestone.',
        )
      }
    },
    [updateMilestone],
  )

  const handleConfirmSchedule = useCallback(async () => {
    if (!schedule) return
    try {
      await confirmSchedule({
        scheduleId: schedule.id,
        confirmedBy: MOCK_CURRENT_USER,
        bacResolutionId,
      })
      toast.success('Bidding schedule confirmed.')
      setConfirmOpen(false)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to confirm bidding schedule.',
      )
    }
  }, [bacResolutionId, confirmSchedule, schedule])

  const handleSetMilestoneCompletion = useCallback(
    async (payload: SetMilestoneCompletionPayload) => {
      try {
        await setMilestoneCompletion({
          ...payload,
          bacResolutionId,
        })
        toast.success(
          payload.completed
            ? 'Milestone marked as completed.'
            : 'Milestone returned to pending.',
        )
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to update milestone status.',
        )
      }
    },
    [bacResolutionId, setMilestoneCompletion],
  )

  // ── Aggregated loading/mutation flag ───────────────────────────────────────
  const isMutating =
    isCreating ||
    isRegenerating ||
    isUpdatingMilestone ||
    isSettingMilestoneCompletion ||
    isConfirming

  return {
    // Resolution — null signals the page should redirect (no placeholder invented)
    bacResolution,

    // Schedule
    schedule,
    isScheduleLoading,

    // Gates
    gates,
    mockGates,
    handleToggleMockGate,
    isDraftPbMode:
      bacResolution?.status === 'draft' &&
      isBacResolutionPublicBiddingEligible(bacResolution) &&
      hasExactlyOneLinkedConsolidatedPr(bacResolution),

    // Dialog open state
    generateOpen,
    setGenerateOpen,
    editOpen,
    setEditOpen,
    confirmOpen,
    setConfirmOpen,

    // Milestone selection
    selectedMilestoneId,
    selectedMilestone,
    selectedMilestonePrevious,
    selectedMilestoneIntervalConfig,

    // Dialog open handlers
    handleOpenGenerate,
    handleOpenEdit,
    handleOpenConfirm,

    // Mutation handlers
    handleCreateSchedule,
    handleRegenerateSchedule,
    handleUpdateMilestone,
    handleSetMilestoneCompletion,
    handleConfirmSchedule,

    // Mutation pending flags
    isCreating,
    isRegenerating,
    isUpdatingMilestone,
    isSettingMilestoneCompletion,
    isConfirming,
    isMutating,

    // Convenience
    currentUser: MOCK_CURRENT_USER,
  }
}

export type UseBiddingScheduleWorkspaceState = ReturnType<
  typeof useBiddingScheduleWorkspaceState
>
