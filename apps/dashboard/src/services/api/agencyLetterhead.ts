import api from '@/services/api'
import { getDashboardBackendUrl } from '@/config/env'

export interface AgencyLetterheadDto {
  id: string | null
  name: string
  address: string
  officeName: string
  hasLogo: boolean
  logoBytes?: string | null
}

export interface UpdateAgencyLetterheadBody {
  name: string
  address?: string
}

export async function fetchAgencyLetterhead(): Promise<AgencyLetterheadDto> {
  const response = await api.get<{ succeeded: boolean; data: AgencyLetterheadDto }>('/agency/letterhead')
  return response.data.data
}

export async function updateAgencyLetterhead(payload: UpdateAgencyLetterheadBody): Promise<AgencyLetterheadDto> {
  const response = await api.put<{ succeeded: boolean; data: AgencyLetterheadDto }>('/agency/letterhead', payload)
  return response.data.data
}

export async function uploadAgencyLogo(file: File): Promise<AgencyLetterheadDto> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post<{ succeeded: boolean; data: AgencyLetterheadDto }>('/agency/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data.data
}

export async function clearAgencyLogo(): Promise<boolean> {
  const response = await api.delete<{ succeeded: boolean; data: boolean }>('/agency/logo')
  return response.data.data
}

export async function fetchAgencyLogoBlob(): Promise<string | null> {
  try {
    const response = await api.get('/agency/logo', { responseType: 'blob' })
    if (response.data && response.data.size > 0) {
      return URL.createObjectURL(response.data)
    }
    return null
  } catch {
    return null
  }
}

export function formatLogoUrl(dto?: AgencyLetterheadDto | null): string | null {
  if (!dto) return null
  if (dto.logoBytes && dto.logoBytes.length > 0) {
    return dto.logoBytes.startsWith('data:')
      ? dto.logoBytes
      : `data:image/png;base64,${dto.logoBytes}`
  }
  return null
}

export function getAgencyLogoUrl(): string {
  const baseUrl = getDashboardBackendUrl()
  return `${baseUrl}/agency/logo?t=${Date.now()}`
}
