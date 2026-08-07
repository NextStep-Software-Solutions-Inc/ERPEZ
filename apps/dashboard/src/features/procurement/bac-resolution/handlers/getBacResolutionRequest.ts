import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BacResolution } from '../types'
import {
  cloneResolution,
  getBacResolutionIdFromFinalUrl,
  getMockBacResolutionDatabase,
} from '../data/mockBacResolutionData'

const endpoint = '/bac-resolutions/:id'

export const getBacResolutionRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  BacResolution
> = {
  endpoint,
  key: ({ url }) => ['bac-resolution', url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    void signal
    await new Promise((resolve) => setTimeout(resolve, 150))
    const bacResolutionId = getBacResolutionIdFromFinalUrl(finalUrl)
    const resolution = getMockBacResolutionDatabase().find(
      (item) => item.id === bacResolutionId,
    )

    if (!resolution) {
      throw new Error(`BAC Resolution "${bacResolutionId}" not found.`)
    }

    return cloneResolution(resolution)
  },
}
