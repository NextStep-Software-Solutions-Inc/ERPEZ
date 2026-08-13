import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { PrintBacResolutionResult } from '../types'
import api from '@/services/api'

const endpoint = '/bac/projects/:id/print'

export const printBacResolutionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  PrintBacResolutionResult
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.get<Blob>(finalUrl, { responseType: 'blob' })
    
    const parts = finalUrl.split('/')
    // Expecting: /bac/projects/{id}/print -> "projects" index is parts.indexOf('projects')
    const projectsIndex = parts.indexOf('projects')
    const id = projectsIndex !== -1 && parts[projectsIndex + 1] ? parts[projectsIndex + 1] : 'document'
    const fileName = `BAC-Resolution-${id}.pdf`

    return {
      fileName,
      blob: response.data,
    }
  },
}
