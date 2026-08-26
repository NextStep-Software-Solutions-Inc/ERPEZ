import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  DEFAULT_MOCK_GATES,
  MOCK_HOLIDAYS_2026,
  MOCK_INTERVAL_CONFIGS,
} from '../data/mockBiddingScheduleData'
import { computeMilestones } from '../utils/computeMilestones'
import { cascadeRecalculate } from '../utils/cascadeRecalculate'
import type {
  BiddingSchedule,
  ConfirmSchedulePayload,
  CreateSchedulePayload,
  LockSchedulePayload,
  MilestoneEditEntry,
  MockPrerequisiteGates,
  RegenerateSchedulePayload,
  SetMilestoneCompletionPayload,
  UpdateMilestonePayload,
} from '../types'
import { BacResolution } from '../../bac-resolution'

type BiddingScheduleState = {
  schedules: Array<BiddingSchedule>
  /** Dev-only gate toggles keyed by bacResolutionId. */
  mockGates: Record<string, MockPrerequisiteGates>
}

type BiddingScheduleActions = {
  getScheduleByResolutionId: (
    bacResolutionId: string,
  ) => BiddingSchedule | undefined
  createSchedule: (payload: CreateSchedulePayload) => BiddingSchedule
  regenerateSchedule: (
    bacResolutionId: string,
    payload: RegenerateSchedulePayload,
  ) => BiddingSchedule
  updateMilestone: (payload: UpdateMilestonePayload) => void
  setMilestoneCompletion: (payload: SetMilestoneCompletionPayload) => void
  confirmSchedule: (payload: ConfirmSchedulePayload) => void
  lockSchedule: (payload: LockSchedulePayload) => void
  getMockGates: (bacResolutionId: string) => MockPrerequisiteGates
  toggleMockGate: (
    bacResolutionId: string,
    gate: keyof MockPrerequisiteGates,
  ) => void
  isBiddingScheduleConfirmed: (bacResolutionId: string) => boolean
}

const PERSIST_KEY =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
    ? 'bidding-schedule-store-dev'
    : 'bidding-schedule-store'

function assertEligibleOwnedConsolidatedPr(bacResolutionId: string) {
  const bacResolution = [] as BacResolution[]

  if (!bacResolution) {
    throw new Error(
      `BAC Resolution "${bacResolutionId}" could not be found for bidding schedule generation.`,
    )
  }

  return bacResolution
}

export const useBiddingScheduleStore = create<
  BiddingScheduleState & BiddingScheduleActions
>()(
  persist(
    (set, get) => ({
      schedules: [],
      mockGates: {},

      getScheduleByResolutionId(bacResolutionId) {
        return get().schedules.find(
          (s) => s.bacResolutionId === bacResolutionId,
        )
      },

      createSchedule(payload) {
        assertEligibleOwnedConsolidatedPr(payload.bacResolutionId)

        const existing = get().getScheduleByResolutionId(
          payload.bacResolutionId,
        )
        if (existing) {
          throw new Error(
            `A bidding schedule already exists for resolution "${payload.bacResolutionId}". Use regenerateSchedule instead.`,
          )
        }

        const config = MOCK_INTERVAL_CONFIGS[payload.procurementCategory]
        const milestones = computeMilestones(
          payload.ibPostingDate,
          config,
          MOCK_HOLIDAYS_2026,
        )

        const now = new Date().toISOString()
        const newSchedule: BiddingSchedule = {
          id: `bidding-schedule-${Date.now()}`,
          bacResolutionId: payload.bacResolutionId,
          bacResolutionNumber: payload.bacResolutionNumber,
          procurementCategory: payload.procurementCategory,
          ibPostingDate: payload.ibPostingDate,
          status: 'draft',
          milestones,
          createdBy: payload.createdBy,
          createdAt: now,
          confirmedAt: null,
          confirmedBy: null,
          lockedAt: null,
          lockedBy: null,
        }

        set((state) => ({ schedules: [...state.schedules, newSchedule] }))
        return newSchedule
      },

      regenerateSchedule(bacResolutionId, payload) {
        assertEligibleOwnedConsolidatedPr(bacResolutionId)

        const existing = get().getScheduleByResolutionId(bacResolutionId)
        if (!existing) {
          throw new Error(
            `No schedule found for resolution "${bacResolutionId}".`,
          )
        }
        if (existing.status !== 'draft') {
          throw new Error(
            'Only draft schedules can be regenerated. Confirm or locked schedules are immutable.',
          )
        }

        const config = MOCK_INTERVAL_CONFIGS[payload.procurementCategory]
        const milestones = computeMilestones(
          payload.ibPostingDate,
          config,
          MOCK_HOLIDAYS_2026,
        )
        const refreshed: BiddingSchedule = {
          id: existing.id,
          bacResolutionId: payload.bacResolutionId,
          bacResolutionNumber: payload.bacResolutionNumber,
          procurementCategory: payload.procurementCategory,
          ibPostingDate: payload.ibPostingDate,
          status: 'draft',
          milestones,
          createdBy: payload.createdBy,
          createdAt: existing.createdAt,
          confirmedAt: null,
          confirmedBy: null,
          lockedAt: null,
          lockedBy: null,
        }

        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === existing.id ? refreshed : s,
          ),
        }))
        return refreshed
      },

      updateMilestone(payload) {
        const state = get()
        const schedule = state.schedules.find(
          (s) => s.id === payload.scheduleId,
        )
        if (!schedule) {
          throw new Error(`Schedule "${payload.scheduleId}" not found.`)
        }
        if (schedule.status !== 'draft') {
          throw new Error(
            'Cannot edit milestones after the schedule has been confirmed.',
          )
        }

        const milestoneIndex = schedule.milestones.findIndex(
          (m) => m.id === payload.milestoneId,
        )
        if (milestoneIndex < 0) {
          throw new Error(`Milestone "${payload.milestoneId}" not found.`)
        }

        const original = schedule.milestones[milestoneIndex]
        const editEntry: MilestoneEditEntry = {
          originalDate: original.overrideDate ?? original.computedDate,
          newDate: payload.overrideDate,
          editedBy: payload.editedBy,
          timestamp: new Date().toISOString(),
          reason: payload.reason,
        }

        const updatedMilestone = {
          ...original,
          overrideDate: payload.overrideDate,
          time: payload.time,
          status: 'edited' as const,
          isEdited: true,
          editHistory: [...original.editHistory, editEntry],
        }

        const updatedMilestones = [...schedule.milestones]
        updatedMilestones[milestoneIndex] = updatedMilestone

        // Cascade downstream computedDates
        const config = MOCK_INTERVAL_CONFIGS[schedule.procurementCategory]
        const cascaded = cascadeRecalculate(
          updatedMilestones,
          milestoneIndex,
          config,
          MOCK_HOLIDAYS_2026,
        )

        set((s) => ({
          schedules: s.schedules.map((sch) =>
            sch.id === schedule.id ? { ...sch, milestones: cascaded } : sch,
          ),
        }))
      },

      setMilestoneCompletion(payload) {
        const schedule = get().schedules.find(
          (candidate) => candidate.id === payload.scheduleId,
        )

        if (!schedule) {
          throw new Error(`Schedule "${payload.scheduleId}" not found.`)
        }

        if (schedule.status !== 'confirmed') {
          throw new Error(
            'Milestones can only be marked complete on a confirmed schedule.',
          )
        }

        const timestamp = payload.completed ? new Date().toISOString() : null

        set((state) => ({
          schedules: state.schedules.map((candidate) => {
            if (candidate.id !== schedule.id) {
              return candidate
            }

            return {
              ...candidate,
              milestones: candidate.milestones.map((milestone) =>
                milestone.id === payload.milestoneId
                  ? {
                      ...milestone,
                      completedAt: timestamp,
                      completedBy: payload.completed ? payload.updatedBy : null,
                    }
                  : milestone,
              ),
            }
          }),
        }))
      },

      confirmSchedule(payload) {
        const schedule = get().schedules.find(
          (s) => s.id === payload.scheduleId,
        )
        if (!schedule) {
          throw new Error(`Schedule "${payload.scheduleId}" not found.`)
        }
        if (schedule.status !== 'draft') {
          throw new Error('Only draft schedules can be confirmed.')
        }

        const now = new Date().toISOString()
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === payload.scheduleId
              ? {
                  ...s,
                  status: 'confirmed' as const,
                  confirmedAt: now,
                  confirmedBy: payload.confirmedBy,
                }
              : s,
          ),
        }))
      },

      lockSchedule(payload) {
        const schedule = get().schedules.find(
          (s) => s.id === payload.scheduleId,
        )
        if (!schedule) {
          throw new Error(`Schedule "${payload.scheduleId}" not found.`)
        }
        if (schedule.status !== 'confirmed') {
          throw new Error('Only confirmed schedules can be locked.')
        }

        const now = new Date().toISOString()
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === payload.scheduleId
              ? {
                  ...s,
                  status: 'locked' as const,
                  lockedAt: now,
                  lockedBy: payload.lockedBy,
                }
              : s,
          ),
        }))
      },

      getMockGates(bacResolutionId) {
        return {
          ...DEFAULT_MOCK_GATES,
          ...(get().mockGates[bacResolutionId] ?? {}),
        }
      },

      toggleMockGate(bacResolutionId, gate) {
        const current = get().getMockGates(bacResolutionId)
        set((state) => ({
          mockGates: {
            ...state.mockGates,
            [bacResolutionId]: {
              ...current,
              [gate]: !current[gate],
            },
          },
        }))
      },

      isBiddingScheduleConfirmed(bacResolutionId) {
        const schedule = get().getScheduleByResolutionId(bacResolutionId)
        if (!schedule) return false
        return schedule.status === 'confirmed' || schedule.status === 'locked'
      },
    }),
    {
      name: PERSIST_KEY,
      merge: (persistedState, currentState) => {
        const typedPersistedState = persistedState as
          Partial<BiddingScheduleState> | undefined
        const persistedSchedules = typedPersistedState?.schedules ?? []
        const mergedSchedules =
          persistedSchedules.length > 0
            ? [
                ...persistedSchedules,
                ...currentState.schedules.filter(
                  (schedule) =>
                    !persistedSchedules.some(
                      (persistedSchedule) =>
                        persistedSchedule.bacResolutionId ===
                        schedule.bacResolutionId,
                    ),
                ),
              ]
            : currentState.schedules

        return {
          ...currentState,
          ...typedPersistedState,
          schedules: mergedSchedules,
          mockGates: typedPersistedState?.mockGates ?? currentState.mockGates,
        }
      },
    },
  ),
)
