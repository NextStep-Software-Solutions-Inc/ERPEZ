import { useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import { getBiddingScheduleRequest } from './getBiddingScheduleRequest'
import { generateScheduleRequest } from './generateScheduleRequest'
import { regenerateScheduleRequest } from './regenerateScheduleRequest'
import { updateMilestoneRequest } from './updateMilestoneRequest'
import { setMilestoneCompletionRequest } from './setMilestoneCompletionRequest'
import { confirmScheduleRequest } from './confirmScheduleRequest'
import { lockScheduleRequest } from './lockScheduleRequest'

export const biddingScheduleQueryKeys = [
  ['/bac/resolutions'],
  ['bidding-schedule'],
  ['/bac/calendar-events'],
  ['bac/calendar-events'],
] as const

type MutationResult<TData, TVariables> = UseMutationResult<
  TData,
  unknown,
  TVariables,
  unknown
>

function makeBiddingScheduleMutationWithRefresh<TData, TVariables>(
  baseHook: () => MutationResult<TData, TVariables>,
) {
  return function useMutationWithRefresh(): MutationResult<TData, TVariables> {
    const queryClient = useQueryClient()
    const mutation = baseHook()

    const invalidateSchedulesAndCalendar = () => {
      void Promise.all(
        biddingScheduleQueryKeys.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      )
    }

    return {
      ...mutation,
      mutate: ((variables, options) => {
        mutation.mutate(variables, {
          ...options,
          onSuccess: (data, mutationVariables, onMutateResult, context) => {
            options?.onSuccess?.(data, mutationVariables, onMutateResult, context)
            invalidateSchedulesAndCalendar()
          },
        })
      }) as MutationResult<TData, TVariables>['mutate'],
      mutateAsync: (async (variables, options) => {
        const result = await mutation.mutateAsync(variables, options)
        invalidateSchedulesAndCalendar()
        return result
      }) as MutationResult<TData, TVariables>['mutateAsync'],
    }
  }
}

export const useBiddingSchedule = createQueryHookFromTemplate(
  getBiddingScheduleRequest,
)

const useGenerateScheduleBase = createMutationHookFromTemplate(
  generateScheduleRequest,
)
export const useGenerateSchedule = makeBiddingScheduleMutationWithRefresh(
  useGenerateScheduleBase,
)
export const useCreateBiddingSchedule = useGenerateSchedule

const useRegenerateScheduleBase = createMutationHookFromTemplate(
  regenerateScheduleRequest,
)
export const useRegenerateSchedule = makeBiddingScheduleMutationWithRefresh(
  useRegenerateScheduleBase,
)
export const useRegenerateBiddingSchedule = useRegenerateSchedule

const useUpdateMilestoneBase = createMutationHookFromTemplate(
  updateMilestoneRequest,
)
export const useUpdateMilestone = makeBiddingScheduleMutationWithRefresh(
  useUpdateMilestoneBase,
)

const useSetMilestoneCompletionBase = createMutationHookFromTemplate(
  setMilestoneCompletionRequest,
)
export const useSetMilestoneCompletion = makeBiddingScheduleMutationWithRefresh(
  useSetMilestoneCompletionBase,
)

const useConfirmScheduleBase = createMutationHookFromTemplate(
  confirmScheduleRequest,
)
export const useConfirmSchedule = makeBiddingScheduleMutationWithRefresh(
  useConfirmScheduleBase,
)
export const useConfirmBiddingSchedule = useConfirmSchedule

const useLockScheduleBase = createMutationHookFromTemplate(
  lockScheduleRequest,
)
export const useLockSchedule = makeBiddingScheduleMutationWithRefresh(
  useLockScheduleBase,
)
export const useLockBiddingSchedule = useLockSchedule
