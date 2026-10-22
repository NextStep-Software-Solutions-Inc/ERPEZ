import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import {
  getPublicPortalStatsRequest,
  getPublicProjectDetailRequest,
  getPublicProjectsRequest,
  submitPublicApplicationRequest,
  uploadPublicFileRequest,
  validatePublicApplicationRequest,
} from '../requests'
import { mapBackendProjectToFrontend } from '../utils/projectMapper'
import type {
  ModeOfProcurement,
  PublicPortalStats,
  PublicProject,
  SubmitApplicationPayload,
  ValidateApplicationPayload,
} from '../types/portalTypes'

export const publicPortalQueryKeys = {
  all: ['public-portal'] as const,
  stats: () => ['public-portal', 'stats'] as const,
  projects: (params?: { search?: string; mode?: string }) => ['public-portal', 'projects', params] as const,
  project: (id: string) => ['public-portal', 'project', id] as const,
}

const isValidId = (id: string | null | undefined): boolean => Boolean(id && id.trim().length > 0)

export function usePublicPortalStats(): UseQueryResult<PublicPortalStats> {
  return useQuery({
    queryKey: publicPortalQueryKeys.stats(),
    queryFn: () => getPublicPortalStatsRequest.fetcher(),
    staleTime: 60_000,
  })
}

export function usePublicProjects(
  search?: string,
  mopFilter?: ModeOfProcurement | 'all'
): UseQueryResult<PublicProject[]> {
  let modeParam: string | undefined
  if (mopFilter === 'public-bidding') {
    modeParam = 'Public Bidding'
  } else if (mopFilter === 'svp') {
    modeParam = 'Small Value Procurement'
  }

  const params = {
    ...(search?.trim() ? { search: search.trim() } : {}),
    ...(modeParam ? { mode: modeParam } : {}),
  }

  return useQuery({
    queryKey: publicPortalQueryKeys.projects(params),
    queryFn: async () => {
      const backendProjects = await getPublicProjectsRequest.fetcher(params)
      return backendProjects.map(mapBackendProjectToFrontend)
    },
    staleTime: 30_000,
  })
}

export function usePublicProject(projectId: string | null | undefined): UseQueryResult<PublicProject> {
  return useQuery({
    queryKey: publicPortalQueryKeys.project(projectId ?? ''),
    queryFn: async () => {
      const backendProject = await getPublicProjectDetailRequest.fetcher(projectId!)
      return mapBackendProjectToFrontend(backendProject)
    },
    enabled: isValidId(projectId),
    staleTime: 30_000,
  })
}

export function useValidatePublicApplication(): UseMutationResult<
  { valid: boolean },
  Error,
  { projectId: string; payload: ValidateApplicationPayload }
> {
  return useMutation({
    mutationFn: validatePublicApplicationRequest.fetcher,
  })
}

export function useUploadPublicFile(): UseMutationResult<string, Error, File> {
  return useMutation({
    mutationFn: uploadPublicFileRequest.fetcher,
  })
}

export function useSubmitPublicApplication(): UseMutationResult<
  { referenceNumber: string },
  Error,
  { projectId: string; payload: SubmitApplicationPayload }
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: submitPublicApplicationRequest.fetcher,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: publicPortalQueryKeys.project(variables.projectId),
      })
      void queryClient.invalidateQueries({
        queryKey: publicPortalQueryKeys.all,
      })
    },
  })
}
