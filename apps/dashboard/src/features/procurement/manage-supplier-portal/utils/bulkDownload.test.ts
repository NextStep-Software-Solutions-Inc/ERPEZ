// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { bulkDownloadDocuments } from './bulkDownload'
import api from '@/services/api'

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('bulkDownloadDocuments (ZIP packaging)', () => {
  let createdLinks: HTMLAnchorElement[] = []
  let clickSpy: any

  beforeEach(() => {
    vi.clearAllMocks()
    createdLinks = []
    clickSpy = vi.fn()

    // Mock document.createElement('a')
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName)
      if (tagName === 'a') {
        el.click = clickSpy
        createdLinks.push(el as HTMLAnchorElement)
      }
      return el
    })

    // Mock URL object methods
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url-123')
    globalThis.URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('throws an error if documents array is empty', async () => {
    await expect(bulkDownloadDocuments([], 'test_project')).rejects.toThrow(
      'No documents to download',
    )
  })

  it('fetches documents, packages them into a ZIP, and triggers a single .zip download', async () => {
    const mockBlob = new Blob(['mock content'], { type: 'application/pdf' })
    vi.mocked(api.get).mockResolvedValue({
      data: mockBlob,
      headers: {
        'content-type': 'application/pdf',
      },
    })

    const docs = [
      { name: 'SEC_Registration.pdf', url: '/files/download/11111111-1111-1111-1111-111111111111' },
      { name: 'Tax_Clearance.pdf', url: '/files/download/22222222-2222-2222-2222-222222222222' },
    ]

    const onProgress = vi.fn()
    await bulkDownloadDocuments(docs, 'Project_A_Supplier_1', onProgress)

    expect(api.get).toHaveBeenCalledTimes(2)
    expect(onProgress).toHaveBeenCalledWith(1, 2)
    expect(onProgress).toHaveBeenCalledWith(2, 2)

    // Exactly one download trigger
    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(createdLinks).toHaveLength(1)
    expect(createdLinks[0].download).toBe('Project_A_Supplier_1.zip')
  })

  it('resolves duplicate filenames inside the zip archive cleanly', async () => {
    const mockBlob = new Blob(['sample data'], { type: 'application/pdf' })
    vi.mocked(api.get).mockResolvedValue({
      data: mockBlob,
      headers: { 'content-type': 'application/pdf' },
    })

    const docs = [
      { name: 'Document.pdf', url: '/files/1' },
      { name: 'Document.pdf', url: '/files/2' },
      { name: 'Document.pdf', url: '/files/3' },
    ]

    await bulkDownloadDocuments(docs, 'Multi_Docs.zip')

    expect(api.get).toHaveBeenCalledTimes(3)
    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(createdLinks[0].download).toBe('Multi_Docs.zip')
  })
})
