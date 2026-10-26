import { describe, expect, it, vi } from 'vitest'
import { approveBacResolutionRequest } from './approveBacResolutionRequest'
import api from '@/services/api'

vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
  },
}))

describe('approveBacResolutionRequest', () => {
  it('calls the approve endpoint with payload', async () => {
    const mockResponse = {
      data: {
        id: 'bac-resolution-002',
        status: 'approved',
      },
    }

    vi.mocked(api.post).mockResolvedValueOnce(mockResponse as any)

    const result = await approveBacResolutionRequest.fetcher({
      finalUrl: '/bac-resolutions/bac-resolution-002/approve',
      payload: {
        bacResolutionId: 'bac-resolution-002',
        signedDocument: { name: 'signed-bac.pdf' } as File,
      },
    })

    expect(api.post).toHaveBeenCalledWith(
      '/bac-resolutions/bac-resolution-002/approve',
      expect.objectContaining({
        bacResolutionId: 'bac-resolution-002',
      }),
    )
    expect(result.status).toBe('approved')
  })
})
