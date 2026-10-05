import { describe, expect, it, vi } from 'vitest'
import { getAOBListRequest } from './getAOBListRequest'
import api from '@/services/api'

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('getAOBListRequest', () => {
  it('maps rfqNumber when directly provided by backend', async () => {
    const mockResponse = {
      data: {
        data: [
          {
            id: 'aob-1',
            aobNumber: '2026-SVP-001',
            rfqNumber: '2026-SVP-RFQ-001',
            aobDate: '2026-09-29',
          },
        ],
        meta: { pageNumber: 1, pageSize: 10, total: 1 },
      },
    }

    vi.mocked(api.get).mockResolvedValueOnce(mockResponse as any)

    const result = await getAOBListRequest.fetcher({
      finalUrl: '/aobs?pageNumber=1&pageSize=10',
    } as any)

    expect(result.data).toHaveLength(1)
    expect(result.data[0].rfqNumber).toBe('2026-SVP-RFQ-001')
  })

  it('maps rfqNumber from rfqNumbers array if rfqNumber is not directly provided', async () => {
    const mockResponse = {
      data: {
        data: [
          {
            id: 'aob-2',
            aobNumber: '2026-SVP-002',
            rfqNumbers: ['2026-SVP-RFQ-001', '2026-SVP-RFQ-002'],
            aobDate: '2026-09-29',
          },
        ],
        meta: { pageNumber: 1, pageSize: 10, total: 1 },
      },
    }

    vi.mocked(api.get).mockResolvedValueOnce(mockResponse as any)

    const result = await getAOBListRequest.fetcher({
      finalUrl: '/aobs?pageNumber=1&pageSize=10',
    } as any)

    expect(result.data).toHaveLength(1)
    expect(result.data[0].rfqNumber).toBe('2026-SVP-RFQ-001, 2026-SVP-RFQ-002')
  })

  it('maps rfqNumber from rfqs array if present', async () => {
    const mockResponse = {
      data: {
        data: [
          {
            id: 'aob-3',
            aobNumber: '2026-SVP-003',
            rfqs: [{ rfqNumber: '2026-SVP-RFQ-003' }],
            aobDate: '2026-09-29',
          },
        ],
        meta: { pageNumber: 1, pageSize: 10, total: 1 },
      },
    }

    vi.mocked(api.get).mockResolvedValueOnce(mockResponse as any)

    const result = await getAOBListRequest.fetcher({
      finalUrl: '/aobs?pageNumber=1&pageSize=10',
    } as any)

    expect(result.data).toHaveLength(1)
    expect(result.data[0].rfqNumber).toBe('2026-SVP-RFQ-003')
  })

  it('sets rfqNumber to empty string when no RFQ is linked', async () => {
    const mockResponse = {
      data: {
        data: [
          {
            id: 'aob-4',
            aobNumber: '2026-SVP-004',
            aobDate: '2026-09-29',
          },
        ],
        meta: { pageNumber: 1, pageSize: 10, total: 1 },
      },
    }

    vi.mocked(api.get).mockResolvedValueOnce(mockResponse as any)

    const result = await getAOBListRequest.fetcher({
      finalUrl: '/aobs?pageNumber=1&pageSize=10',
    } as any)

    expect(result.data).toHaveLength(1)
    expect(result.data[0].rfqNumber).toBe('')
  })
})
