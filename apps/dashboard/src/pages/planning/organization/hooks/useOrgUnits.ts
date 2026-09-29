import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { OrgUnit } from '@/services/mock/orgUnits'
import { 
  fetchOfficesFromApi, 
  fetchOfficeByIdFromApi, 
  createOfficeInApi, 
  updateOfficeInApi, 
  deleteOfficeFromApi 
} from '@/services/api/offices'
// Fallback to mock data if API is unavailable (for development/testing)
import { 
  fetchOrgUnits as fetchOrgUnitsMock,
  fetchOrgUnitById as fetchOrgUnitByIdMock,
  createOrgUnit as createOrgUnitMock,
  updateOrgUnit as updateOrgUnitMock,
  deleteOrgUnit as deleteOrgUnitMock,
  validateOrgUnitDeletion 
} from '@/services/mock/orgUnits'

import type { Position } from '@/services/api/positions'
import {
  fetchPositionsFromApi,
  fetchPositionsByOrgUnitFromApi,
  fetchPositionByIdFromApi,
  fetchVacantPositionsFromApi,
  createPositionInApi,
  updatePositionInApi,
  deletePositionFromApi,
} from '@/services/api/positions'
// Fallback to mock positions
import {
  fetchAllPositions as fetchAllPositionsMock,
  fetchPositionsByOrgUnit as fetchPositionsByOrgUnitMock,
  fetchPositionById as fetchPositionByIdMock,
  createPosition as createPositionMock,
  updatePosition as updatePositionMock,
  deletePosition as deletePositionMock,
} from '@/services/mock/positions'

import type { Person } from '@/services/mock/personnel'
import {
  fetchPersonnel,
  fetchPersonnelByPosition,
  updatePerson as updatePersonMock,
  deletePerson as deletePersonMock,
} from '@/services/mock/personnel'
import {
  createPersonnelPosition,
  updatePersonnelPosition,
  deletePersonnelPosition,
} from '@/services/api/personnelPositions'

/**
 * Wrapper functions to use real API with fallback to mock data
 */
async function fetchOrgUnits(): Promise<OrgUnit[]> {
  try {
    return await fetchOfficesFromApi()
  } catch (error) {
    console.warn('API fetch failed, falling back to mock data:', error)
    return fetchOrgUnitsMock()
  }
}

async function fetchOrgUnitById(id: string): Promise<OrgUnit | null> {
  try {
    return await fetchOfficeByIdFromApi(id)
  } catch (error) {
    console.warn('API fetch failed, falling back to mock data:', error)
    return fetchOrgUnitByIdMock(id)
  }
}

import type { OfficeApiResponse } from '@/services/api/offices'

async function createOrgUnit(payload: Partial<OfficeApiResponse> | Omit<OrgUnit, 'id'>): Promise<OrgUnit> {
  try {
    return await createOfficeInApi(payload as Partial<OfficeApiResponse>)
  } catch (error) {
    console.warn('API create failed, falling back to mock:', error)
    return createOrgUnitMock(payload as Omit<OrgUnit, 'id'>)
  }
}

async function updateOrgUnit(id: string, updates: Partial<OrgUnit>): Promise<OrgUnit | null> {
  try {
    return await updateOfficeInApi(id, updates as Partial<Record<string, unknown>>)
  } catch (error) {
    console.warn('API update failed, falling back to mock:', error)
    return updateOrgUnitMock(id, updates)
  }
}

async function deleteOrgUnit(id: string): Promise<boolean> {
  try {
    return await deleteOfficeFromApi(id)
  } catch (error) {
    console.warn('API delete failed, falling back to mock:', error)
    return deleteOrgUnitMock(id)
  }
}

/**
 * Position wrapper functions to use real API with fallback to mock
 */
async function fetchAllPositions(): Promise<Position[]> {
  try {
    return await fetchPositionsFromApi()
  } catch (error) {
    console.warn('API positions fetch failed, falling back to mock data:', error)
    return fetchAllPositionsMock()
  }
}

async function fetchPositionsByOrgUnit(orgUnitId: string): Promise<Position[]> {
  try {
    return await fetchPositionsByOrgUnitFromApi(orgUnitId)
  } catch (error) {
    console.warn('API positions fetch failed, falling back to mock data:', error)
    return fetchPositionsByOrgUnitMock(orgUnitId)
  }
}

async function fetchPositionById(id: string): Promise<Position | null> {
  try {
    return await fetchPositionByIdFromApi(id)
  } catch (error) {
    console.warn('API position fetch failed, falling back to mock data:', error)
    return fetchPositionByIdMock(id)
  }
}

async function createPosition(payload: Omit<Position, 'id'>): Promise<Position> {
  try {
    return await createPositionInApi(payload as Partial<Record<string, unknown>>)
  } catch (error) {
    console.warn('API position create failed, falling back to mock:', error)
    return createPositionMock(payload)
  }
}

async function updatePosition(id: string, updates: Partial<Position>): Promise<Position | null> {
  try {
    return await updatePositionInApi(id, updates as Partial<Record<string, unknown>>)
  } catch (error) {
    console.warn('API position update failed, falling back to mock:', error)
    return updatePositionMock(id, updates)
  }
}

async function deletePosition(id: string): Promise<boolean> {
  try {
    return await deletePositionFromApi(id)
  } catch (error) {
    console.warn('API position delete failed, falling back to mock:', error)
    return deletePositionMock(id)
  }
}

export function useOrgUnits() {
  return useQuery<OrgUnit[], Error>({
    queryKey: ['orgUnits'],
    queryFn: fetchOrgUnits,
    staleTime: 1000 * 60, // 1 min
  })
}

export function useOrgUnit(id?: string | null) {
  return useQuery<OrgUnit | null, Error>({
    queryKey: ['orgUnit', id],
    queryFn: () => (id ? fetchOrgUnitById(id) : Promise.resolve(null)),
    enabled: !!id,
  })
}

export function useCreateOrgUnit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<OrgUnit, 'id'>) => createOrgUnit(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orgUnits'] })
      qc.invalidateQueries({ queryKey: ['orgUnit'] })
      qc.invalidateQueries({
        predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/offices'),
      })
      qc.invalidateQueries({ queryKey: ['positions'] })
      qc.invalidateQueries({ queryKey: ['positionsStatistics'] })
    },
  })
}

export function useUpdateOrgUnit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { id: string; updates?: Partial<OrgUnit> } & Partial<OrgUnit>) => {
      const { id, updates, ...rest } = params
      const actualUpdates = updates ?? (rest as Partial<OrgUnit>)
      return updateOrgUnit(id, actualUpdates)
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['orgUnits'] })
      qc.invalidateQueries({ queryKey: ['orgUnit'] })
      if (variables?.id) {
        qc.invalidateQueries({ queryKey: ['orgUnit', variables.id] })
      }
      qc.invalidateQueries({
        predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/offices'),
      })
      qc.invalidateQueries({ queryKey: ['positions'] })
      qc.invalidateQueries({ queryKey: ['positionsStatistics'] })
    },
  })
}

export function useDeleteOrgUnit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteOrgUnit(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['orgUnits'] })
      qc.removeQueries({ queryKey: ['orgUnit'] })
      if (id) {
        qc.removeQueries({ queryKey: ['orgUnit', id] })
      }
      qc.invalidateQueries({
        predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/offices'),
      })
      qc.invalidateQueries({ queryKey: ['positions'] })
      qc.invalidateQueries({ queryKey: ['positionsStatistics'] })
      qc.invalidateQueries({ queryKey: ['personnelPositions'] })
    },
  })
}

// Positions hooks

export function usePositions(orgUnitId?: string) {
  return useQuery<Position[], Error>({
    queryKey: ['positions', orgUnitId],
    queryFn: () => (orgUnitId ? fetchPositionsByOrgUnit(orgUnitId) : fetchAllPositions()),
    enabled: !!orgUnitId, // Only fetch when we have a specific unitId
  })
}

export function useAllPositions() {
  return useQuery<Position[], Error>({
    queryKey: ['positions', 'all'],
    queryFn: fetchAllPositions,
  })
}

// internal wrapper to call API with fallback
async function fetchVacantPositions(): Promise<Position[]> {
  try {
    return await fetchVacantPositionsFromApi()
  } catch (error) {
    console.warn('API vacant positions fetch failed, falling back to mock data:', error)
    return fetchAllPositionsMock().then((all) => all.filter(p => p.status === 'vacant'))
  }
}

export function useVacantPositions() {
  return useQuery<Position[], Error>({
    queryKey: ['positions', 'vacant'],
    queryFn: fetchVacantPositions,
  })
}

export function usePosition(id?: string, enabled = true) {
  return useQuery<Position | null, Error>({
    queryKey: ['position', id],
    queryFn: () => (id ? fetchPositionById(id) : Promise.resolve(null)),
    enabled: !!id && enabled,
  })
}

export function useCreatePosition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<Position, 'id'>) => createPosition(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['positions'] })
      qc.invalidateQueries({ queryKey: ['position'] })
      qc.invalidateQueries({ queryKey: ['positionsStatistics'] })
      qc.invalidateQueries({ queryKey: ['orgUnits'] })
      qc.invalidateQueries({ queryKey: ['personnelPositions'] })
      qc.invalidateQueries({
        predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/positions'),
      })
    },
  })
}

export function useUpdatePosition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Position> }) => updatePosition(id, updates),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['positions'] })
      qc.invalidateQueries({ queryKey: ['position'] })
      if (variables?.id) {
        qc.invalidateQueries({ queryKey: ['position', variables.id] })
      }
      qc.invalidateQueries({ queryKey: ['positionsStatistics'] })
      qc.invalidateQueries({ queryKey: ['orgUnits'] })
      qc.invalidateQueries({ queryKey: ['personnelPositions'] })
      qc.invalidateQueries({
        predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/positions'),
      })
    },
  })
}

export function useDeletePosition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePosition(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['positions'] })
      qc.removeQueries({ queryKey: ['position'] })
      if (id) {
        qc.removeQueries({ queryKey: ['position', id] })
      }
      qc.invalidateQueries({ queryKey: ['positionsStatistics'] })
      qc.invalidateQueries({ queryKey: ['orgUnits'] })
      qc.invalidateQueries({ queryKey: ['personnelPositions'] })
      qc.invalidateQueries({
        predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/positions'),
      })
    },
  })
}

// ---------- personnel positions (API) ----------

async function fetchPersonnelPositionsFromApi(): Promise<
  Array<{
    id: string
    userId: string
    firstName: string
    lastName: string
    email?: string
    designation?: string
    employeeNumber?: string
    employmentStatus?: string
    startDate?: string
    assignmentType?: string
    positionId?: string
    status: 'active' | 'inactive'
    orgUnitId?: string
    position?: string
    updatedAt?: string
  }>
> {
  try {
    const { fetchPersonnelPositionsFromApi } = await import('@/services/api/personnelPositions')
    const data = await fetchPersonnelPositionsFromApi()
    // translate to minimal shape used by table
    return data.map((entry) => ({
      id: entry.user.id,
      userId: entry.user.id,
      firstName: entry.user.firstName || '',
      lastName: entry.user.lastName || '',
      email: entry.user.email,
      designation: entry.positionTitle || entry.position?.title,
      employeeNumber: entry.user.employeeNumber,
      employmentStatus: entry.user.employmentStatus as 'Permanent' | 'Casual' | 'Contractual' | 'Coterminous',
      startDate: entry.startDate,
      assignmentType: entry.assignmentType,
      positionId: entry.positionId || entry.position?.id,
      status: entry.isActive ? 'active' : 'inactive',
      orgUnitId: entry.position?.officeId || entry.user.officeId,
      position: entry.positionTitle,
      updatedAt: entry.position?.createdAt || entry.user?.dateHired,
    }))
  } catch (error) {
    console.warn('personnelPositions API failed, falling back to empty', error)
    return []
  }
}

export function usePersonnelPositions() {
  return useQuery({
    queryKey: ['personnelPositions'],
    queryFn: fetchPersonnelPositionsFromApi,
    staleTime: 1000 * 60, // 1min
  })
}

export function usePersonnelPosition(userId?: string) {
  return useQuery({
    queryKey: ['personnelPosition', userId],
    queryFn: async () => {
      if (!userId) return null
      const all = await fetchPersonnelPositionsFromApi()
      return all.find((p) => p.userId === userId) || null
    },
    enabled: !!userId,
  })
}

// Personnel hooks

export function usePersonnel(positionId?: string) {
  return useQuery<Person[], Error>({
    queryKey: ['personnel', positionId],
    queryFn: () => (positionId ? fetchPersonnelByPosition(positionId) : fetchPersonnel()),
  })
}

export function usePersonnelByOrgUnit(orgUnitId?: string) {
  return useQuery<Person[], Error>({
    queryKey: ['personnel', 'orgUnit', orgUnitId],
    queryFn: async () => {
      if (!orgUnitId) return fetchPersonnel()
      
      // Get all positions for this org unit
      const positions = await fetchPositionsByOrgUnit(orgUnitId)
      
      // Get all personnel
      const allPersonnel = await fetchPersonnel()
      
      // Filter personnel to only include those assigned to positions in this org unit
      const positionIds = positions.map(p => p.id)
      return allPersonnel.filter(p => positionIds.includes(p.positionId || ''))
    },
    enabled: true,
  })
}

export function useAllPersonnel() {
  return useQuery<Person[], Error>({
    queryKey: ['personnel', 'all'],
    queryFn: fetchPersonnel,
  })
}

async function updatePerson(id: string, updates: Partial<Person>): Promise<Person | null> {
  try {
    await updatePersonnelPosition(id, {
      positionId: updates.positionId ?? undefined,
      isActive: updates.status ? updates.status === 'active' : undefined,
      startDate: updates.startDate ?? undefined,
      endDate: updates.endDate,
    })
  } catch (error) {
    console.warn('API update personnel failed, falling back to mock:', error)
  }
  return updatePersonMock(id, updates)
}

async function deletePerson(id: string): Promise<boolean> {
  try {
    return await deletePersonnelPosition(id)
  } catch (error) {
    console.warn('API delete personnel failed, falling back to mock:', error)
    return deletePersonMock(id)
  }
}

export function useCreatePerson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      userId: string
      positionId: string | null
      assignmentType: string
      isActive: boolean
      startDate?: string
      endDate?: string | null
    }) => createPersonnelPosition(payload as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['personnel'] })
      qc.invalidateQueries({ queryKey: ['personnelPositions'] })
      qc.invalidateQueries({ queryKey: ['personnelPosition'] })
      qc.invalidateQueries({ queryKey: ['positions'] })
      qc.invalidateQueries({ queryKey: ['positionsStatistics'] })
      qc.invalidateQueries({
        predicate: (q) =>
          typeof q.queryKey[0] === 'string' &&
          (q.queryKey[0].startsWith('/personnel') || q.queryKey[0].startsWith('/personnel-positions')),
      })
    },
  })
}

export function useUpdatePerson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Person> }) => updatePerson(id, updates),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['personnel'] })
      qc.invalidateQueries({ queryKey: ['personnelPositions'] })
      qc.invalidateQueries({ queryKey: ['personnelPosition'] })
      if (variables?.id) {
        qc.invalidateQueries({ queryKey: ['personnelPosition', variables.id] })
      }
      qc.invalidateQueries({ queryKey: ['positions'] })
      qc.invalidateQueries({ queryKey: ['positionsStatistics'] })
      qc.invalidateQueries({
        predicate: (q) =>
          typeof q.queryKey[0] === 'string' &&
          (q.queryKey[0].startsWith('/personnel') || q.queryKey[0].startsWith('/personnel-positions')),
      })
    },
  })
}

export function useDeletePerson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePerson(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['personnel'] })
      qc.invalidateQueries({ queryKey: ['personnelPositions'] })
      qc.removeQueries({ queryKey: ['personnelPosition'] })
      if (id) {
        qc.removeQueries({ queryKey: ['personnelPosition', id] })
      }
      qc.invalidateQueries({ queryKey: ['positions'] })
      qc.invalidateQueries({ queryKey: ['positionsStatistics'] })
      qc.invalidateQueries({
        predicate: (q) =>
          typeof q.queryKey[0] === 'string' &&
          (q.queryKey[0].startsWith('/personnel') || q.queryKey[0].startsWith('/personnel-positions')),
      })
    },
  })
}

/**
 * Hook to validate if an organizational unit can be deleted
 * Checks for active child units and personnel before deletion
 */
export function useValidateOrgUnitDeletion() {
  return useMutation({
    mutationFn: async (id: string) => {
      return validateOrgUnitDeletion(id)
    },
  })
}