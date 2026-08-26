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
import type {
  BiddingMilestone,
  MockPrerequisiteGates,
  SetMilestoneCompletionPayload,
  UpdateMilestonePayload,
} from '../types'
import { BacResolution } from '../../bac-resolution'

// ─── Shared mock identity ─────────────────────────────────────────────────────

/** Placeholder current-user string for all mock write operations. */
export const MOCK_CURRENT_USER = 'current-user'

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBiddingScheduleWorkspaceState(bacResolutionId: string) {
  // ── BAC Resolution ─────────────────────────────────────────────────────────
  // Stabilize the lookup so downstream memos don't churn on every render.
  const bacResolution = [] as BacResolution[]

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

  const handleCreateSchedule = () => {}

  const handleRegenerateSchedule = () => {}

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
    schedule,
    isScheduleLoading,
    mockGates,
    handleToggleMockGate,

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
