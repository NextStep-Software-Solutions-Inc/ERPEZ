/**
 * Mock async handlers for the bidding schedule feature.
 *
 * Each function wraps the corresponding Zustand store action in a
 * `setTimeout + Promise` with simulated network latency (100–300 ms).
 * Drop-in replaceable with real API calls when the backend is available.
 */

import { useBiddingScheduleStore } from '../store/biddingScheduleStore'
import type {
  BiddingSchedule,
  ConfirmSchedulePayload,
  CreateSchedulePayload,
  LockSchedulePayload,
  RegenerateSchedulePayload,
  SetMilestoneCompletionPayload,
  UpdateMilestonePayload,
} from '../types'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchBiddingScheduleRequest(
  bacResolutionId: string,
): Promise<BiddingSchedule | null> {
  await delay(150)
  const schedule = useBiddingScheduleStore
    .getState()
    .getScheduleByResolutionId(bacResolutionId)
  return schedule ?? null
}

export async function createBiddingScheduleRequest(
  payload: CreateSchedulePayload,
): Promise<BiddingSchedule> {
  await delay(250)
  return useBiddingScheduleStore.getState().createSchedule(payload)
}

export async function regenerateBiddingScheduleRequest(
  payload: RegenerateSchedulePayload,
): Promise<BiddingSchedule> {
  await delay(250)
  return useBiddingScheduleStore
    .getState()
    .regenerateSchedule(payload.bacResolutionId, payload)
}

export async function updateMilestoneRequest(
  payload: UpdateMilestonePayload,
): Promise<void> {
  await delay(200)
  useBiddingScheduleStore.getState().updateMilestone(payload)
}

export async function setMilestoneCompletionRequest(
  payload: SetMilestoneCompletionPayload,
): Promise<void> {
  await delay(200)
  useBiddingScheduleStore.getState().setMilestoneCompletion(payload)
}

export async function confirmScheduleRequest(
  payload: ConfirmSchedulePayload,
): Promise<void> {
  await delay(200)
  useBiddingScheduleStore.getState().confirmSchedule(payload)
}

export async function lockScheduleRequest(
  payload: LockSchedulePayload,
): Promise<void> {
  await delay(200)
  useBiddingScheduleStore.getState().lockSchedule(payload)
}
