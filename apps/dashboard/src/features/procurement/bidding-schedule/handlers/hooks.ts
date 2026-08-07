import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  confirmScheduleRequest,
  createBiddingScheduleRequest,
  fetchBiddingScheduleRequest,
  lockScheduleRequest,
  regenerateBiddingScheduleRequest,
  setMilestoneCompletionRequest,
  updateMilestoneRequest,
} from './index'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type {
  BiddingSchedule,
  ConfirmSchedulePayload,
  CreateSchedulePayload,
  LockSchedulePayload,
  RegenerateSchedulePayload,
  SetMilestoneCompletionPayload,
  UpdateMilestonePayload,
} from '../types'

// ─── Query keys ───────────────────────────────────────────────────────────────

export const biddingScheduleQueryKey = (bacResolutionId: string) =>
  ['bidding-schedule', bacResolutionId] as const

// ─── Query hooks ──────────────────────────────────────────────────────────────

export function useBiddingSchedule(
  bacResolutionId: string,
): UseQueryResult<BiddingSchedule | null> {
  return useQuery({
    queryKey: biddingScheduleQueryKey(bacResolutionId),
    queryFn: () => fetchBiddingScheduleRequest(bacResolutionId),
    enabled: !!bacResolutionId,
  })
}

// ─── Mutation hooks ───────────────────────────────────────────────────────────

export function useCreateBiddingSchedule(): UseMutationResult<
  BiddingSchedule,
  unknown,
  CreateSchedulePayload
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBiddingScheduleRequest,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: biddingScheduleQueryKey(variables.bacResolutionId),
      })
    },
  })
}

export function useRegenerateBiddingSchedule(): UseMutationResult<
  BiddingSchedule,
  unknown,
  RegenerateSchedulePayload
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: regenerateBiddingScheduleRequest,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: biddingScheduleQueryKey(variables.bacResolutionId),
      })
    },
  })
}

export function useUpdateMilestone(): UseMutationResult<
  void,
  unknown,
  UpdateMilestonePayload
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMilestoneRequest,
    onSuccess: () => {
      // TODO: when backed by a real API, include bacResolutionId in the
      // UpdateMilestonePayload so we can narrow the invalidation to
      // biddingScheduleQueryKey(bacResolutionId) instead of the full prefix.
      // Tracked in dashboard/docs/BIDDING_SCHEDULE_BACKLOG.md.
      // scheduleId alone is insufficient to derive bacResolutionId here,
      // so invalidate all bidding-schedule queries for now.
      void queryClient.invalidateQueries({ queryKey: ['bidding-schedule'] })
    },
  })
}

export function useSetMilestoneCompletion(): UseMutationResult<
  void,
  unknown,
  SetMilestoneCompletionPayload & { bacResolutionId: string }
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bacResolutionId: _id, ...payload }) =>
      setMilestoneCompletionRequest(payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: biddingScheduleQueryKey(variables.bacResolutionId),
      })
    },
  })
}

export function useConfirmBiddingSchedule(): UseMutationResult<
  void,
  unknown,
  ConfirmSchedulePayload & { bacResolutionId: string }
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bacResolutionId: _id, ...payload }) =>
      confirmScheduleRequest(payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: biddingScheduleQueryKey(variables.bacResolutionId),
      })
    },
  })
}

export function useLockBiddingSchedule(): UseMutationResult<
  void,
  unknown,
  LockSchedulePayload & { bacResolutionId: string }
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bacResolutionId: _id, ...payload }) =>
      lockScheduleRequest(payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: biddingScheduleQueryKey(variables.bacResolutionId),
      })
    },
  })
}
