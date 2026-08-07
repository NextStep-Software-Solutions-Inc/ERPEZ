import { useMemo } from 'react'
import { useBiddingScheduleWorkspaceState } from './useBiddingScheduleWorkspaceState'

export function useBiddingScheduleService(bacResolutionId: string) {
  const ws = useBiddingScheduleWorkspaceState(bacResolutionId)

  const isLoading = useMemo(
    () => ws.isScheduleLoading || ws.isMutating,
    [ws.isScheduleLoading, ws.isMutating],
  )

  return {
    ws,
    isLoading,
    schedule: ws.schedule,
    gates: ws.gates,
    bacResolution: ws.bacResolution,
    isDraftPbMode: ws.isDraftPbMode,
  }
}

export type UseBiddingScheduleService = ReturnType<
  typeof useBiddingScheduleService
>

export default useBiddingScheduleService
