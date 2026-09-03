import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createBiddingAwardRecommendationRequest,
  evaluateProjectBidsRequest,
  getProjectBidEvaluationRequest,
  getProjectBiddingSubmissionsRequest,
  logPostQualificationDocsReceivedRequest,
  recordBidOpeningRequest,
  recordPostQualificationResultRequest,
  sendPostQualificationNoticeRequest,
} from '../handlers'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type {
  BiddingEvaluationResponse,
  BiddingSubmissionResponse,
  CreateBiddingAwardRecommendationPayload,
  EvaluateProjectBidsPayload,
  LogPostQualificationDocsReceivedPayload,
  RecordBidOpeningPayload,
  RecordPostQualificationResultPayload,
  SendPostQualificationNoticePayload,
} from '../types/bidEvaluationApi.types'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const bidEvaluationQueryKeys = {
  all: ['bid-evaluation'] as const,
  evaluation: (projectId: string) => ['bid-evaluation', 'project', projectId] as const,
  submissions: (projectId: string) => ['bid-evaluation', 'submissions', projectId] as const,
}

// ─── Query Hooks ─────────────────────────────────────────────────────────────

export function useProjectBidEvaluation(
  projectId: string | null | undefined
): UseQueryResult<BiddingEvaluationResponse> {
  return useQuery({
    queryKey: bidEvaluationQueryKeys.evaluation(projectId ?? ''),
    queryFn: () => getProjectBidEvaluationRequest.fetcher(projectId!),
    enabled: !!projectId,
    staleTime: 30_000,
  })
}

export function useProjectBiddingSubmissions(
  projectId: string | null | undefined
): UseQueryResult<Array<BiddingSubmissionResponse>> {
  return useQuery({
    queryKey: bidEvaluationQueryKeys.submissions(projectId ?? ''),
    queryFn: () => getProjectBiddingSubmissionsRequest.fetcher(projectId!),
    enabled: !!projectId,
    staleTime: 30_000,
  })
}

// ─── Mutation Hooks ──────────────────────────────────────────────────────────

export function useRecordBidOpening(): UseMutationResult<
  { id: string },
  Error,
  { projectId: string; data: RecordBidOpeningPayload }
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: recordBidOpeningRequest.fetcher,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: bidEvaluationQueryKeys.submissions(variables.projectId),
      })
      void queryClient.invalidateQueries({
        queryKey: bidEvaluationQueryKeys.evaluation(variables.projectId),
      })
    },
  })
}

export function useEvaluateProjectBids(): UseMutationResult<
  { id: string },
  Error,
  { projectId: string; data: EvaluateProjectBidsPayload }
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: evaluateProjectBidsRequest.fetcher,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: bidEvaluationQueryKeys.evaluation(variables.projectId),
      })
    },
  })
}

export function useSendPostQualificationNotice(): UseMutationResult<
  { id: string },
  Error,
  { projectId: string; data: SendPostQualificationNoticePayload }
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sendPostQualificationNoticeRequest.fetcher,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: bidEvaluationQueryKeys.evaluation(variables.projectId),
      })
    },
  })
}

export function useLogPostQualificationDocsReceived(): UseMutationResult<
  { id: string },
  Error,
  { projectId: string; data: LogPostQualificationDocsReceivedPayload }
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logPostQualificationDocsReceivedRequest.fetcher,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: bidEvaluationQueryKeys.evaluation(variables.projectId),
      })
    },
  })
}

export function useRecordPostQualificationResult(): UseMutationResult<
  { id: string },
  Error,
  { projectId: string; data: RecordPostQualificationResultPayload }
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: recordPostQualificationResultRequest.fetcher,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: bidEvaluationQueryKeys.evaluation(variables.projectId),
      })
    },
  })
}

export function useCreateBiddingAwardRecommendation(): UseMutationResult<
  { id: string },
  Error,
  { projectId: string; data: CreateBiddingAwardRecommendationPayload }
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBiddingAwardRecommendationRequest.fetcher,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: bidEvaluationQueryKeys.evaluation(variables.projectId),
      })
    },
  })
}
